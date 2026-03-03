import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Hash, Plus, Settings, Copy, Check, X } from 'lucide-react';
import { db } from '../lib/db';
import { useStore } from '../store/useStore';
import { peerService } from '../lib/peer';

export default function Sidebar({ onClose }: { onClose: () => void }) {
  const { activeChannelId, setActiveChannelId, isHost, peerId, theme, setTheme, username } = useStore();
  const channels = useLiveQuery(() => db.channels.toArray(), []);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const id = newChannelName.toLowerCase().replace(/\s+/g, '-');
    peerService.createChannel({
      id,
      name: newChannelName.trim(),
      isPrivate,
      password: isPrivate ? password : '',
      createdAt: Date.now()
    });

    setIsCreating(false);
    setNewChannelName('');
    setIsPrivate(false);
    setPassword('');
  };

  const handleCopyId = () => {
    if (peerId) {
      navigator.clipboard.writeText(peerId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const themes = ['dark', 'light', 'midnight', 'forest', 'sunset', 'ocean', 'nebula'];

  return (
    <div className="flex flex-col h-full bg-bg-secondary border-r border-border">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border shadow-sm">
        <h2 className="font-bold text-text-primary truncate">ConnectUs</h2>
        <button onClick={onClose} className="md:hidden text-text-secondary hover:text-text-primary">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center justify-between px-2 mb-2 group">
          <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">Channels</span>
          <button 
            onClick={() => setIsCreating(true)}
            className="text-text-secondary hover:text-text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateChannel} className="p-2 bg-bg-tertiary rounded-lg mb-2">
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              placeholder="Channel name"
              className="w-full bg-bg-primary text-text-primary text-sm rounded px-2 py-1 mb-2 focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <div className="flex items-center gap-2 mb-2">
              <input 
                type="checkbox" 
                id="private" 
                checked={isPrivate} 
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="private" className="text-xs text-text-secondary">Private</label>
            </div>
            {isPrivate && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-bg-primary text-text-primary text-sm rounded px-2 py-1 mb-2 focus:outline-none focus:ring-1 focus:ring-accent"
              />
            )}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsCreating(false)} className="text-xs text-text-secondary hover:text-text-primary">Cancel</button>
              <button type="submit" className="text-xs bg-accent text-white px-2 py-1 rounded hover:bg-accent-hover">Create</button>
            </div>
          </form>
        )}

        {channels?.map(channel => (
          <button
            key={channel.id}
            onClick={() => {
              setActiveChannelId(channel.id);
              onClose();
            }}
            className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors ${
              activeChannelId === channel.id 
                ? 'bg-bg-tertiary text-text-primary font-medium' 
                : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary'
            }`}
          >
            <Hash className="w-4 h-4 opacity-70" />
            <span className="truncate">{channel.name}</span>
            {channel.isPrivate && <span className="ml-auto text-[10px] bg-bg-primary px-1.5 rounded text-text-secondary">🔒</span>}
          </button>
        ))}
      </div>

      {/* Footer / User Info */}
      <div className="p-3 bg-bg-tertiary border-t border-border relative">
        {isHost && (
          <div className="mb-3 p-2 bg-bg-secondary rounded-lg border border-border">
            <div className="text-xs text-text-secondary mb-1 font-medium">Room ID (Share this)</div>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs bg-bg-primary px-2 py-1 rounded truncate text-text-primary">
                {peerId}
              </code>
              <button 
                onClick={handleCopyId}
                className="p-1.5 bg-accent hover:bg-accent-hover text-white rounded transition-colors"
                title="Copy ID"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-primary leading-tight">{username}</span>
              <span className="text-[10px] text-text-secondary leading-tight">{isHost ? 'Host' : 'Guest'}</span>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-full transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Popover */}
        {showSettings && (
          <div className="absolute bottom-16 left-4 w-56 bg-bg-secondary border border-border rounded-xl shadow-xl p-3 z-50">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-wider mb-2">Theme</h3>
            <div className="grid grid-cols-2 gap-2">
              {themes.map(t => (
                <button
                  key={t}
                  onClick={() => setTheme(t as any)}
                  className={`text-xs capitalize py-1.5 px-2 rounded border transition-colors ${
                    theme === t 
                      ? 'bg-accent border-accent text-white' 
                      : 'bg-bg-tertiary border-border text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
