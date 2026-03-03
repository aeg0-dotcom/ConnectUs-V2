import Peer from 'peerjs';
import { db } from './db';
import { useStore } from '../store/useStore';

class PeerService {
  constructor() {
    this.peer = null;
    this.connections = new Map();
    this.hostConnection = null;
  }

  async initPeer(isHost, hostIdToJoin) {
    return new Promise((resolve, reject) => {
      this.peer = new Peer({
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', async (id) => {
        useStore.getState().setPeerId(id);
        
        if (isHost) {
          useStore.getState().setHostId(id);
          useStore.getState().setStatus('connected');
          this.setupHostListeners();
          await this.initDefaultState();
          resolve(id);
        } else if (hostIdToJoin) {
          try {
            await this.connectToHost(hostIdToJoin);
            resolve(id);
          } catch (err) {
            reject(err);
          }
        } else {
          reject(new Error('Must provide hostIdToJoin if not host'));
        }
      });

      this.peer.on('error', (err) => {
        console.error('PeerJS Error:', err);
        useStore.getState().setError(err.message);
        useStore.getState().setStatus('error');
        reject(err);
      });
      
      this.peer.on('disconnected', () => {
        useStore.getState().setStatus('disconnected');
        this.peer?.reconnect();
      });
    });
  }

  async initDefaultState() {
    const state = useStore.getState();
    await db.channels.add({
      id: 'general',
      name: 'general',
      isPrivate: false,
      createdAt: Date.now()
    });
    
    await db.users.add({
      id: state.peerId,
      name: state.username,
      color: state.userColor,
      isHost: true,
      joinedAt: Date.now()
    });
  }

  setupHostListeners() {
    if (!this.peer) return;

    this.peer.on('connection', (conn) => {
      conn.on('open', async () => {
        this.connections.set(conn.peer, conn);
        
        // Send current state to new user
        const users = await db.users.toArray();
        const channels = await db.channels.toArray();
        const messages = await db.messages.toArray();
        
        this.sendToPeer(conn, {
          type: 'SYNC_STATE',
          data: { users, channels, messages }
        });
      });

      conn.on('data', async (data) => {
        const payload = data;
        await this.handlePayload(payload, conn.peer);
        
        // Broadcast to others if host
        if (useStore.getState().isHost) {
          this.broadcast(payload, conn.peer);
        }
      });

      conn.on('close', async () => {
        this.connections.delete(conn.peer);
        await db.users.delete(conn.peer);
        this.broadcast({
          type: 'USER_LEFT',
          data: { id: conn.peer }
        });
      });
    });
  }

  connectToHost(hostId) {
    return new Promise((resolve, reject) => {
      if (!this.peer) return reject('Peer not initialized');

      useStore.getState().setStatus('connecting');
      const conn = this.peer.connect(hostId, { reliable: true });
      
      conn.on('open', () => {
        this.hostConnection = conn;
        useStore.getState().setHostId(hostId);
        useStore.getState().setStatus('connected');
        
        // Announce self
        const state = useStore.getState();
        this.sendToHost({
          type: 'USER_JOINED',
          data: {
            id: state.peerId,
            name: state.username,
            color: state.userColor,
            isHost: false,
            joinedAt: Date.now()
          }
        });
        
        resolve();
      });

      conn.on('data', async (data) => {
        await this.handlePayload(data);
      });

      conn.on('close', () => {
        useStore.getState().setStatus('error');
        useStore.getState().setError('Host disconnected');
        this.disconnect();
      });

      conn.on('error', (err) => {
        reject(err);
      });
    });
  }

  async handlePayload(payload, senderId) {
    switch (payload.type) {
      case 'SYNC_STATE':
        await db.users.bulkPut(payload.data.users);
        await db.channels.bulkPut(payload.data.channels);
        await db.messages.bulkPut(payload.data.messages);
        break;
      case 'USER_JOINED':
        await db.users.put(payload.data);
        break;
      case 'USER_LEFT':
        await db.users.delete(payload.data.id);
        break;
      case 'CHAT_MESSAGE':
        await db.messages.add(payload.data);
        break;
      case 'CHANNEL_CREATED':
        await db.channels.add(payload.data);
        break;
    }
  }

  sendMessage(channelId, content) {
    const state = useStore.getState();
    const message = {
      channelId,
      senderId: state.peerId,
      senderName: state.username,
      senderColor: state.userColor,
      content,
      timestamp: Date.now()
    };

    const payload = { type: 'CHAT_MESSAGE', data: message };

    if (state.isHost) {
      this.handlePayload(payload);
      this.broadcast(payload);
    } else {
      this.sendToHost(payload);
    }
  }

  createChannel(channel) {
    const payload = { type: 'CHANNEL_CREATED', data: channel };
    if (useStore.getState().isHost) {
      this.handlePayload(payload);
      this.broadcast(payload);
    } else {
      this.sendToHost(payload);
    }
  }

  broadcast(payload, excludePeerId) {
    this.connections.forEach((conn, peerId) => {
      if (peerId !== excludePeerId && conn.open) {
        conn.send(payload);
      }
    });
  }

  sendToHost(payload) {
    if (this.hostConnection && this.hostConnection.open) {
      this.hostConnection.send(payload);
    }
  }

  sendToPeer(conn, payload) {
    if (conn.open) {
      conn.send(payload);
    }
  }

  disconnect() {
    this.connections.forEach(conn => conn.close());
    this.connections.clear();
    if (this.hostConnection) {
      this.hostConnection.close();
      this.hostConnection = null;
    }
    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }
    useStore.getState().resetSession();
  }
}

export const peerService = new PeerService();
