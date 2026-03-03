import Dexie from 'dexie';

export class ChatDatabase extends Dexie {
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
