import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';
import { AnimatePresence } from 'motion/react';

// Import Pages
import Home from './pages/Home';
import LocalDraft from './pages/LocalDraft';
import BotDraft from './pages/BotDraft';
import MultiplayerLobby from './pages/MultiplayerLobby';
import MultiplayerDraft from './pages/MultiplayerDraft';
import { FeedbackSystem } from './components/FeedbackSystem';

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/play" element={<LocalDraft />} />
          <Route path="/play/local" element={<LocalDraft />} />
          <Route path="/play/bot" element={<BotDraft />} />
          <Route path="/play/multiplayer" element={<MultiplayerLobby />} />
          <Route path="/play/multiplayer/draft/:roomId" element={<MultiplayerDraft />} />
        </Routes>
        <FeedbackSwitcher />
        <Analytics />
      </Router>
    </HelmetProvider>
  );
}

function FeedbackSwitcher() {
  const location = useLocation();
  const path = location.pathname;
  
  // HIDE if inside any draft or game mode
  const isPlaying = path.startsWith('/play/local') || 
                    path.startsWith('/play/bot') || 
                    path.startsWith('/play/multiplayer/draft');
                    
  const isVisible = !isPlaying;
  
  return (
    <AnimatePresence>
      {isVisible && <FeedbackSystem key="feedback-system" />}
    </AnimatePresence>
  );
}
