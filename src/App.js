/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import Lobby from './components/Lobby';
import ChatLayout from './components/ChatLayout';
import { useStore } from './store/useStore';
import { useEffect } from 'react';

export default function App() {
  const { theme } = useStore();

  useEffect(() => {
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Lobby />} />
        <Route path="/chat" element={<ChatLayout />} />
      </Routes>
    </HashRouter>
  );
}
