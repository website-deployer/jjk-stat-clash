import React from 'react';
import { HelpCircle, Info, MessageSquare, Home, Trophy, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface GameNavbarProps {
  onHowToPlay: () => void;
  onSystemArchives: () => void;
  onFeedback: () => void;
  onAchievements?: () => void;
  onStats?: () => void;
}

export const GameNavbar: React.FC<GameNavbarProps> = ({ onHowToPlay, onSystemArchives, onFeedback, onAchievements, onStats }) => {
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-800 z-[100]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate('/play')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <Home size={18} />
          <span className="text-xs font-mono uppercase tracking-widest">Menu</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onHowToPlay}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          >
            <HelpCircle size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">How to Play</span>
          </button>
          <button
            onClick={onSystemArchives}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          >
            <Info size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Archives</span>
          </button>
          <button
            onClick={onFeedback}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
          >
            <MessageSquare size={16} />
            <span className="text-xs font-mono uppercase tracking-widest">Feedback</span>
          </button>
          {onStats && (
            <button
              onClick={onStats}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-blue-500 hover:text-blue-400 hover:border-blue-700 transition-all"
            >
              <BarChart3 size={16} />
              <span className="text-xs font-mono uppercase tracking-widest">Stats</span>
            </button>
          )}
          {onAchievements && (
            <button
              onClick={onAchievements}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-yellow-500 hover:text-yellow-400 hover:border-yellow-700 transition-all"
            >
              <Trophy size={16} />
              <span className="text-xs font-mono uppercase tracking-widest">Achievements</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};
