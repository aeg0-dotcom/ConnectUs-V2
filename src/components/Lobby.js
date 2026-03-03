import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Server, LogIn } from 'lucide-react';
import { useStore } from '../store/useStore';
import { peerService } from '../lib/peer';
import { clearDatabase } from '../lib/db';

export default function Lobby() {
  const navigate = useNavigate();
  const { username, setUsername, setStatus, setIsHost, error, setError } = useStore();
  const [joinId, setJoinId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleHost = async () => {
    if (!username.trim()) return setError('Please enter a username');
    
    setIsLoading(true);
    setError(null);
    setStatus('connecting');
    
    try {
      await clearDatabase();
      setIsHost(true);
      await peerService.initPeer(true);
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Failed to host room');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!username.trim()) return setError('Please enter a username');
    if (!joinId.trim()) return setError('Please enter a Peer ID to join');
    
    setIsLoading(true);
    setError(null);
    setStatus('connecting');
    
    try {
      await clearDatabase();
      setIsHost(false);
      await peerService.initPeer(false, joinId.trim());
      navigate('/chat');
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md bg-bg-secondary rounded-2xl shadow-xl p-8 border border-border">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-accent/20">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">ConnectUs</h1>
          <p className="text-text-secondary mt-2 text-center">Serverless P2P Chat Platform</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              placeholder="Enter your name..."
              maxLength={32}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={handleHost}
              disabled={isLoading}
              className="flex flex-col items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-white rounded-xl p-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Server className="w-6 h-6" />
              <span className="font-semibold">Host Room</span>
            </button>
            
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                className="w-full bg-bg-tertiary text-text-primary rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                placeholder="Paste Peer ID..."
              />
              <button
                onClick={handleJoin}
                disabled={isLoading || !joinId.trim()}
                className="flex items-center justify-center gap-2 bg-bg-tertiary hover:bg-border text-text-primary rounded-xl p-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4" />
                <span className="font-semibold text-sm">Join Room</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
