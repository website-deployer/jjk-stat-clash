import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Analytics } from '@vercel/analytics/react';

// Import Pages
import Home from './pages/Home';
import LocalDraft from './pages/LocalDraft';
import BotDraft from './pages/BotDraft';
import MultiplayerLobby from './pages/MultiplayerLobby';
import MultiplayerDraft from './pages/MultiplayerDraft';
import Leaderboard from './pages/Leaderboard';
import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<ErrorBoundary><Home /></ErrorBoundary>} />
          <Route path="/play" element={<ErrorBoundary><LocalDraft /></ErrorBoundary>} />
          <Route path="/play/local" element={<ErrorBoundary><LocalDraft /></ErrorBoundary>} />
          <Route path="/play/bot" element={<ErrorBoundary><BotDraft /></ErrorBoundary>} />
          <Route path="/play/multiplayer" element={<ErrorBoundary><MultiplayerLobby /></ErrorBoundary>} />
          <Route path="/play/multiplayer/draft/:roomId" element={<ErrorBoundary><MultiplayerDraft /></ErrorBoundary>} />
          <Route path="/leaderboard" element={<ErrorBoundary><Leaderboard /></ErrorBoundary>} />
        </Routes>
        <Analytics />
      </Router>
      </ErrorBoundary>
    </HelmetProvider>
  );
}


