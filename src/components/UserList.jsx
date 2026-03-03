import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Users as UsersIcon, Crown, X } from 'lucide-react';
import { db } from '../lib/db';

export default function UserList({ onClose }) {
  const users = useLiveQuery(() => db.users.toArray(), []);

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-l border-border">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shadow-sm">
        <div className="flex items-center gap-2 text-text-primary font-bold">
          <UsersIcon className="w-5 h-5" />
          <span>Active Users</span>
        </div>
        <button onClick={onClose} className="md:hidden text-text-secondary hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 px-2">
          Online — {users?.length || 0}
        </div>

        {users?.map(user => (
          <div
            key={user.id}
            className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-bg-tertiary transition-colors group"
          >
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: user.color }}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-bg-secondary rounded-full" />
            </div>
            
            <div className="flex-1 min-w-0 flex items-center justify-between">
              <span className="font-medium text-text-primary truncate" style={{ color: user.color }}>
                {user.name}
              </span>
              {user.isHost && (
                <span title="Host">
                  <Crown className="w-4 h-4 text-yellow-500 opacity-80" />
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
