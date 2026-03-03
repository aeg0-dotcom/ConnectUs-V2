import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'waiting' | 'connected' | 'error';

export type Theme = 'dark' | 'light' | 'midnight' | 'forest' | 'sunset' | 'ocean' | 'nebula';

interface AppState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  
  username: string;
  setUsername: (name: string) => void;
  
  peerId: string | null;
  setPeerId: (id: string | null) => void;
  
  hostId: string | null;
  setHostId: (id: string | null) => void;
  
  isHost: boolean;
  setIsHost: (isHost: boolean) => void;
  
  status: ConnectionStatus;
  setStatus: (status: ConnectionStatus) => void;
  
  activeChannelId: string;
  setActiveChannelId: (id: string) => void;
  
  userColor: string;
  setUserColor: (color: string) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  resetSession: () => void;
}

const getRandomColor = () => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#10b981', 
    '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', 
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      
      username: '',
      setUsername: (username) => set({ username }),
      
      peerId: null,
      setPeerId: (peerId) => set({ peerId }),
      
      hostId: null,
      setHostId: (hostId) => set({ hostId }),
      
      isHost: false,
      setIsHost: (isHost) => set({ isHost }),
      
      status: 'disconnected',
      setStatus: (status) => set({ status }),
      
      activeChannelId: 'general',
      setActiveChannelId: (activeChannelId) => set({ activeChannelId }),
      
      userColor: getRandomColor(),
      setUserColor: (userColor) => set({ userColor }),
      
      error: null,
      setError: (error) => set({ error }),
      
      resetSession: () => set({
        peerId: null,
        hostId: null,
        isHost: false,
        status: 'disconnected',
        activeChannelId: 'general',
        error: null
      })
    }),
    {
      name: 'connectus-storage',
      partialize: (state) => ({ theme: state.theme, username: state.username, userColor: state.userColor })
    }
  )
);
