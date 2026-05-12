import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Zap, Shield, Workflow, Eye, Calendar } from 'lucide-react';

const changelogData = [
  {
    version: "v1.2.4",
    date: "May 2, 2026",
    title: "Protocol Stabilization",
    description: "Final refinement of the intelligence engine and stabilization of the global cursed network.",
    items: [
      "Optimized Hard AI with scarcity scoring and strategic hate-drafting logic",
      "Implemented selection permanence with visual 'Locked' status indicators",
      "Centralized System Protocol database for real-time synergy verification",
      "Refined lobby synchronization and server-side state persistence for multiplayer"
    ]
  },
  {
    version: "v1.2.0",
    date: "April 25, 2026",
    title: "Convergence & Intelligence",
    description: "Introduction of global connectivity and advanced simulation protocols.",
    items: [
      "Deployed Multiplayer Alpha infrastructure utilizing PartyKit synchronization",
      "Overhauled Bot AI with tiered difficulty levels and adaptive decision making",
      "Added Cursed Convergence full-screen transition animations for match phases",
      "Implemented randomized turn timing to simulate human interaction in bot matches"
    ]
  },
  {
    version: "v1.1.0",
    date: "April 18, 2026",
    title: "Cursed Expansion",
    description: "Expansion of character depth and the introduction of advanced combat constraints.",
    items: [
      "Implemented Rarity & Grade system with power scaling for Mythic and Legendary tiers",
      "Introduced Binding Vows as a high-risk strategy layer to boost specific stats",
      "Added Domain Expansion efficiency bonuses based on character IQ and Cursed Energy",
      "Integrated dynamic background video overlays and atmospheric cursed energy particles"
    ]
  },
  {
    version: "v1.0.0",
    date: "April 11, 2026",
    title: "Initialization Protocol",
    description: "The core foundation of the JJK Stat Clash engine and character database.",
    items: [
      "Architected the primary 12-stat drafting engine and combat calculation logic",
      "Initialized character database with 50+ unique sorcerers and cursed spirits",
      "Implemented local drafting mode with automated synergy detection",
      "Established the visual design system and responsive grid framework"
    ]
  }
];

interface ChangelogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
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
            className="relative w-full max-w-2xl bg-[#0a0a0a] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-[#050505] shrink-0">
              <div className="flex items-center gap-4">
                <Terminal className="text-red-600" size={24} />
                <div>
                  <h2 className="text-xl font-black font-display text-white uppercase tracking-tighter">System Changelog</h2>
                  <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-[0.3em]">Operational History // Build Archive</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-zinc-900 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {changelogData.map((update, idx) => (
                <div 
                  key={idx}
                  className="bg-zinc-900/30 border border-zinc-800 p-6 rounded-md flex flex-col gap-5 hover:border-zinc-700 transition-colors relative group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar size={12} className="text-red-600" />
                        <span className="text-[10px] font-mono font-bold text-red-600 uppercase tracking-[0.2em]">{update.date}</span>
                        <span className="text-[10px] font-mono font-black text-zinc-600 uppercase tracking-widest ml-2 px-2 py-0.5 border border-zinc-800 rounded bg-black">{update.version}</span>
                      </div>
                      <h3 className="text-lg font-black font-display text-white uppercase tracking-tight group-hover:text-red-500 transition-colors">
                        {update.title}
                      </h3>
                      <p className="text-[11px] text-zinc-500 font-mono italic uppercase tracking-wider leading-relaxed">
                        {update.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 border-t border-zinc-800/50 pt-4">
                    {update.items.map((item, i) => (
                      <div key={i} className="flex gap-3 text-[10px] font-mono text-zinc-400 uppercase tracking-widest leading-relaxed">
                        <span className="text-red-900 font-black">/</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#050505] border-t border-zinc-800 text-center shrink-0">
              <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-[0.4em]">Historical Data Synchronized</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
