import React, { useState, useRef, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Send, Hash, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../lib/db';
import { useStore } from '../store/useStore';
import { peerService } from '../lib/peer';

export default function ChatArea() {
  const { activeChannelId, username } = useStore();
  const [message, setMessage] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channel = useLiveQuery(
    () => db.channels.get(activeChannelId),
    [activeChannelId]
  );

  const messages = useLiveQuery(
    () => db.messages
      .where('channelId')
      .equals(activeChannelId)
      .sortBy('timestamp'),
    [activeChannelId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    setIsAuthenticated(false);
    setPassword('');
  }, [activeChannelId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !channel) return;

    peerService.sendMessage(activeChannelId, message.trim());
    setMessage('');
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (channel?.password === password) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  if (!channel) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-secondary">
        Select a channel to start chatting
      </div>
    );
  }

  if (channel.isPrivate && !isAuthenticated) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-bg-primary">
        <div className="w-full max-w-sm bg-bg-secondary p-6 rounded-2xl border border-border text-center">
          <div className="w-12 h-12 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-text-secondary" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">Private Channel</h3>
          <p className="text-sm text-text-secondary mb-6">This channel requires a password to view messages.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full bg-bg-tertiary text-text-primary rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button
              type="submit"
              disabled={!password.trim()}
              className="w-full bg-accent hover:bg-accent-hover text-white font-medium rounded-xl py-3 transition-colors disabled:opacity-50"
            >
              Unlock Channel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-bg-primary">
      {/* Header */}
      <div className="h-14 flex items-center px-4 border-b border-border bg-bg-primary shadow-sm z-10">
        <Hash className="w-5 h-5 text-text-secondary mr-2" />
        <h2 className="font-bold text-text-primary">{channel.name}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages?.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-secondary space-y-4">
            <div className="w-16 h-16 bg-bg-secondary rounded-full flex items-center justify-center">
              <Hash className="w-8 h-8 opacity-50" />
            </div>
            <p>Welcome to #{channel.name}!</p>
            <p className="text-sm opacity-70">This is the start of the channel.</p>
          </div>
        ) : (
          messages?.map((msg, index) => {
            const prevMsg = index > 0 ? messages[index - 1] : null;
            const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId || msg.timestamp - prevMsg.timestamp > 300000;
            
            return (
              <div key={msg.id || `${msg.timestamp}-${index}`} className={`flex gap-4 ${showHeader ? 'mt-6' : 'mt-1'}`}>
                {showHeader ? (
                  <div 
                    className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: msg.senderColor }}
                  >
                    {msg.senderName.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className="w-10 flex-shrink-0" />
                )}
                
                <div className="flex-1 min-w-0">
                  {showHeader && (
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-text-primary" style={{ color: msg.senderColor }}>{msg.senderName}</span>
                      <span className="text-xs text-text-secondary">
                        {format(msg.timestamp, 'HH:mm')}
                      </span>
                    </div>
                  )}
                  <p className="text-text-primary break-words leading-relaxed">{msg.content}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-bg-primary">
        <form onSubmit={handleSend} className="relative flex items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message #${channel.name}`}
            className="w-full bg-bg-secondary text-text-primary rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="absolute right-2 p-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
