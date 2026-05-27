import { motion, AnimatePresence } from 'motion/react';
import { BarChart3, Trophy, X, TrendingUp, Swords } from 'lucide-react';
import { getPlayerStats, getMatchHistory } from '../utils/playerStats';

export function StatsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const stats = getPlayerStats();
  const history = getMatchHistory();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#050505]">
              <div className="flex items-center gap-3">
                <BarChart3 className="text-blue-500" size={24} />
                <h2 className="text-xl font-black font-display text-white uppercase tracking-tighter">Player Stats</h2>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <Trophy className="mx-auto text-yellow-500 mb-2" size={24} />
                  <p className="text-2xl font-black font-display text-white">{stats.totalWins}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Wins</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <Swords className="mx-auto text-red-500 mb-2" size={24} />
                  <p className="text-2xl font-black font-display text-white">{stats.totalMatches}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Matches</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <TrendingUp className="mx-auto text-green-500 mb-2" size={24} />
                  <p className="text-2xl font-black font-display text-white">{stats.winRate.toFixed(0)}%</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Win Rate</p>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-center">
                  <BarChart3 className="mx-auto text-blue-500 mb-2" size={24} />
                  <p className="text-2xl font-black font-display text-white">{stats.bestScore}</p>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mt-1">Best Score</p>
                </div>
              </div>

              {/* Recent Matches */}
              <div>
                <h3 className="text-sm font-black font-display text-white uppercase tracking-wider mb-3">Recent Matches</h3>
                {history.length === 0 ? (
                  <p className="text-zinc-500 font-mono text-xs text-center py-8">No matches played yet</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.slice(0, 20).map((m, i) => (
                      <div key={i} className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${m.won ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="text-xs font-mono text-white font-bold">{m.playerName}</p>
                            <p className="text-[9px] font-mono text-zinc-500">{new Date(m.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono text-zinc-400">{m.score} - {m.opponentScore}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
