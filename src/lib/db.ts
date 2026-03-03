import Dexie, { Table } from 'dexie';

export interface Message {
  id?: number;
  channelId: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  content: string;
  timestamp: number;
}

export interface Channel {
  id: string;
  name: string;
  isPrivate: boolean;
  password?: string;
  createdAt: number;
}

export interface User {
  id: string;
  name: string;
  color: string;
  isHost: boolean;
  joinedAt: number;
}

export class ChatDatabase extends Dexie {
  messages!: Table<Message, number>;
  channels!: Table<Channel, string>;
  users!: Table<User, string>;

  constructor() {
    super('ConnectUsDB');
    this.version(1).stores({
      messages: '++id, channelId, timestamp',
      channels: 'id, name',
      users: 'id, name'
    });
  }
}

export const db = new ChatDatabase();

// Auto-wipe on mount
export const clearDatabase = async () => {
  await db.messages.clear();
  await db.channels.clear();
  await db.users.clear();
};
