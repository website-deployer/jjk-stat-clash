import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Lock, Unlock } from 'lucide-react';
import { achievements, getUnlockedAchievements } from '../utils/achievements';

export function AchievementsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [unlocked] = useState(getUnlockedAchievements);

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
                <Trophy className="text-yellow-500" size={24} />
                <h2 className="text-xl font-black font-display text-white uppercase tracking-tighter">Achievements</h2>
              </div>
              <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mb-4">
                {unlocked.length} / {achievements.length} Unlocked
              </p>
              {achievements.map(a => {
                const isUnlocked = unlocked.includes(a.id);
                return (
                  <div
                    key={a.id}
                    className={`p-4 rounded-xl border transition-colors ${
                      isUnlocked
                        ? 'bg-yellow-950/20 border-yellow-800/30'
                        : 'bg-zinc-900/30 border-zinc-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{a.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-bold text-sm uppercase tracking-wider ${isUnlocked ? 'text-yellow-400' : 'text-zinc-500'}`}>
                            {a.name}
                          </h3>
                          {isUnlocked ? (
                            <Unlock size={12} className="text-yellow-500" />
                          ) : (
                            <Lock size={12} className="text-zinc-600" />
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-zinc-500 mt-0.5">{a.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
