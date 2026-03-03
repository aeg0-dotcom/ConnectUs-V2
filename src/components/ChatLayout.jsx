import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Users as UsersIcon } from 'lucide-react';
import { useStore } from '../store/useStore';
import { peerService } from '../lib/peer';
import Sidebar from './Sidebar';
import ChatArea from './ChatArea';
import UserList from './UserList';

export default function ChatLayout() {
  const navigate = useNavigate();
  const { status, isHost, theme } = useStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserListOpen, setIsUserListOpen] = useState(false);

  useEffect(() => {
    if (status === 'disconnected' || status === 'error') {
      navigate('/');
    }
  }, [status, navigate]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isHost) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      peerService.disconnect();
    };
  }, [isHost]);

  if (status !== 'connected') {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center bg-bg-primary theme-${theme}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
        <p className="text-text-secondary font-medium">
          {status === 'connecting' ? 'Connecting to signaling server...' : 'Waiting for P2P connection...'}
        </p>
      </div>
    );
  }

  return (
    <div className={`flex h-screen bg-bg-primary overflow-hidden theme-${theme}`}>
      {/* Mobile Header */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-14 bg-bg-secondary border-b border-border flex items-center justify-between px-4 z-20">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-text-secondary hover:text-text-primary">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-text-primary">ConnectUs</span>
        <button onClick={() => setIsUserListOpen(!isUserListOpen)} className="text-text-secondary hover:text-text-primary">
          <UsersIcon className="w-6 h-6" />
        </button>
      </div>

      {/* Left Sidebar (Channels) */}
      <div className={`
        fixed md:relative z-10 w-64 h-full bg-bg-secondary flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 pt-14 md:pt-0 bg-bg-primary relative z-0">
        <ChatArea />
      </div>

      {/* Right Sidebar (Users) */}
      <div className={`
        fixed md:relative right-0 z-10 w-60 h-full bg-bg-secondary flex-shrink-0 transition-transform duration-300 ease-in-out
        ${isUserListOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <UserList onClose={() => setIsUserListOpen(false)} />
      </div>

      {/* Mobile Overlays */}
      {(isSidebarOpen || isUserListOpen) && (
        <div 
          className="fixed inset-0 bg-black/50 z-0 md:hidden"
          onClick={() => {
            setIsSidebarOpen(false);
            setIsUserListOpen(false);
          }}
        />
      )}
    </div>
  );
}
