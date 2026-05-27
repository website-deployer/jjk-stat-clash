import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Swords, Ban, Target, Zap, CheckCircle, ArrowRight } from 'lucide-react';

interface HowToPlayTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayTutorial: React.FC<HowToPlayTutorialProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-3xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500">
                  <Swords size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black font-display uppercase tracking-widest text-white leading-none">How to Play</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Quick Start Guide</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              <div className="space-y-8">
                {/* Step 1 */}
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">1</div>
                    <h3 className="text-lg font-black text-white uppercase font-display">Ban Phase</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Each player selects 2 entities to remove from the pool. This is your chance to weaken your opponent by banning powerful characters or key synergy components.
                  </p>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase">
                    <Ban size={14} />
                    <span>Select 2 entities to ban</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">2</div>
                    <h3 className="text-lg font-black text-white uppercase font-display">Draft Phase</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Fill 11 slots with characters, techniques, and abilities. Each slot contributes to your stats. Look for synergies - certain combinations grant bonus stats!
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-red-400 text-xs font-bold uppercase block mb-1">Physical Stats</span>
                      <span className="text-zinc-500 text-[10px]">Strength, Speed, Durability, Body</span>
                    </div>
                    <div className="bg-zinc-800/50 p-3 rounded-lg">
                      <span className="text-purple-400 text-xs font-bold uppercase block mb-1">Cursed Stats</span>
                      <span className="text-zinc-500 text-[10px]">CE, IQ, CT, DE</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white font-black text-sm">3</div>
                    <h3 className="text-lg font-black text-white uppercase font-display">Clash Phase</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                    Compare your stats head-to-head with your opponent. The player with higher stats wins each category. Win more categories to win the match!
                  </p>
                  <div className="flex items-center gap-2 text-zinc-500 text-xs font-mono uppercase">
                    <Target size={14} />
                    <span>Higher stats = Victory</span>
                  </div>
                </div>

                {/* Tips Section */}
                <div className="bg-red-950/10 border border-red-900/20 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="text-yellow-500" size={20} />
                    <h3 className="text-lg font-black text-white uppercase font-display">Pro Tips</h3>
                  </div>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-zinc-400 text-sm">
                      <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                      <span>Build around synergies - they grant massive stat bonuses</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-400 text-sm">
                      <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                      <span>Watch for prerequisites - some abilities require others (e.g., Limitless needs Six Eyes)</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-400 text-sm">
                      <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                      <span>Ban key synergy components to counter popular builds</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-400 text-sm">
                      <CheckCircle className="text-green-500 shrink-0 mt-0.5" size={16} />
                      <span>Balance your stats - don't neglect defense</span>
                    </li>
                  </ul>
                </div>

                {/* Need More Info */}
                <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6 text-center">
                  <p className="text-zinc-500 text-sm mb-3">Want detailed information about characters, synergies, and mechanics?</p>
                  <button
                    onClick={() => {
                      onClose();
                      // This will be handled by the parent component
                    }}
                    className="flex items-center gap-2 text-red-500 hover:text-red-400 text-sm font-bold uppercase tracking-wider mx-auto"
                  >
                    <span>Check System Archives</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950 text-center shrink-0">
              <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Good Luck, Sorcerer</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
