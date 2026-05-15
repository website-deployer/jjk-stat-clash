import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Swords } from 'lucide-react';
import { pairings, characters, statLabels } from '../data/characters';
import { createPortal } from 'react-dom';

interface SystemProtocolProps {
  onClash?: () => void;
  showClashButton?: boolean;
}

export const SystemProtocol: React.FC<SystemProtocolProps> = ({ onClash, showClashButton }) => {
  const [hoveredSynergy, setHoveredSynergy] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPos({ x: e.clientX + 20, y: e.clientY + 20 });
  };

  const publicSynergies = pairings.filter(p => !p.isSecret);

  return (
    <div className="w-full max-w-5xl mt-16 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl p-6 md:p-10 shadow-2xl relative overflow-hidden z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10">
        {showClashButton && onClash && (
          <div className="flex justify-center mb-12">
            {!showConfirm ? (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-black font-display py-5 px-16 rounded-full text-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 flex items-center gap-4"
              >
                <Swords size={32} />
                Clash!
              </motion.button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 bg-red-950/40 p-6 rounded-2xl border border-red-500/30 backdrop-blur-sm"
              >
                <p className="text-xl font-black font-display text-white uppercase tracking-widest text-center">Are all sorcerers ready?</p>
                <div className="flex gap-4">
                  <button onClick={onClash} className="px-8 py-3 bg-red-600 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-red-500 transition-colors shadow-[0_0_20px_rgba(220,38,38,0.3)]">Yes, Clash!</button>
                  <button onClick={() => setShowConfirm(false)} className="px-8 py-3 bg-zinc-800 text-zinc-300 font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 hover:text-white transition-colors">Wait</button>
                </div>
              </motion.div>
            )}
          </div>
        )}

        <div className="flex items-center gap-4 mb-8 border-b border-zinc-800 pb-4">
          <div className="w-12 h-12 bg-red-950/50 border border-red-900 rounded-lg flex items-center justify-center">
            <span className="font-mono text-red-500 font-bold text-xl">01</span>
          </div>
          <div>
            <h2 className="text-3xl font-black font-display text-white uppercase tracking-wider">
              System Protocol
            </h2>
            <p className="font-mono text-xs text-zinc-500 uppercase tracking-widest">Rules & Synergies Database</p>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-red-500 uppercase tracking-widest border-l-2 border-red-500 pl-3">Combat Directives</h3>
            <ul className="space-y-4 text-sm text-zinc-400 font-sans">
              <li className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <p>Win total rounds by having higher points in specific stats. Total aggregate points decide the final Victor.</p>
              </li>
              <li className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <p><strong className="text-zinc-200">Domain Refinement:</strong> Refined Domain Expansion receives a bonus equal to 10% of IQ and 5% of Cursed Energy.</p>
              </li>
              <li className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <p><strong className="text-zinc-200">Black Flash:</strong> Physical strikes have a base 1.5% critical chance (8% for specialists) to trigger a 2.5x power spike.</p>
              </li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-mono font-bold text-yellow-500 uppercase tracking-widest border-l-2 border-yellow-500 pl-3">Archival Synergy</h3>
            <p className="text-xs text-zinc-500 font-mono uppercase bg-zinc-950 p-4 border border-zinc-900 rounded">Pairing entities from the same lore lineage grants massive bonuses.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {publicSynergies.map(combo => (
                <div 
                  key={combo.id} 
                  className="bg-[#111] border border-zinc-800 rounded p-3 text-[10px] font-mono font-bold text-zinc-400 border-l-2 border-l-yellow-600/50 hover:border-l-yellow-500 hover:bg-zinc-900 transition-all cursor-help"
                  onMouseEnter={() => setHoveredSynergy(combo)}
                  onMouseLeave={() => setHoveredSynergy(null)}
                  onMouseMove={handleMouseMove}
                >
                  {combo.name}
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-zinc-950/50 border border-zinc-800/30 p-4 rounded-lg space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest mb-3">Online Protocol</h4>
              <div className="text-[10px] text-zinc-500 font-mono leading-relaxed space-y-2">
                <p className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">▸</span> <span><span className="text-zinc-300">30s Timer</span> — Each turn has a 30-second countdown. If time expires, the turn passes automatically.</span></p>
                <p className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">▸</span> <span><span className="text-zinc-300">Ban Sync</span> — Both players select bans simultaneously. Bans are synced in real-time and locked on submission.</span></p>
                <p className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">▸</span> <span><span className="text-zinc-300">Clash Ready</span> — After drafting, both players must confirm ready before the clash comparison begins.</span></p>
                <p className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">▸</span> <span><span className="text-zinc-300">Turn Order</span> — Players alternate picks. Filled players are skipped automatically.</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {hoveredSynergy && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed z-[9999] w-72 bg-[#1a1515]/95 border border-yellow-900/50 backdrop-blur-md p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] pointer-events-none transition-opacity duration-200"
          style={{ top: tooltipPos.y, left: tooltipPos.x }}
        >
          <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay"></div>
          <h4 className="font-display font-black text-yellow-500 text-lg mb-1 relative z-10">{hoveredSynergy.name}</h4>
          <div className="text-xs font-bold text-yellow-600/80 border-b border-yellow-900/30 uppercase tracking-widest mb-2 relative z-10 pb-1">
            Synergy Protocol
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed relative z-10 font-serif mb-3">
            {hoveredSynergy.description}
          </p>
          <div className="relative z-10 space-y-2">
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Required Entities:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {hoveredSynergy.entities.map((entId: string) => {
                  const ent = characters.find(c => c.id === entId);
                  return (
                    <span key={entId} className="text-[10px] bg-zinc-900 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">
                      {ent ? ent.name : entId}
                    </span>
                  );
                })}
              </div>
            </div>
            <div>
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Stat Bonuses:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(hoveredSynergy.bonusStats).map(([stat, val]) => (
                  <span key={stat} className="text-[10px] bg-green-950/30 border border-green-900/50 px-1.5 py-0.5 rounded text-green-400 font-bold">
                    +{val as number} {statLabels[stat] || stat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
