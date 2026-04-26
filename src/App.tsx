import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { characters, statsList, statLabels, categoryLabels, pairings, statCategoryMap } from './data/characters';
import { PlayerCard, DraftSelection, SearchableSelect, bindingVows } from './components/PlayerCard';
import { Comparison } from './components/Comparison';
import { CursedConvergenceTransition } from './components/CursedConvergenceTransition';
import { PhaseTransition } from './components/PhaseTransition';
import { HelpPage } from './components/HelpPage';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Plus, CheckCircle2, ChevronDown, Ban, Zap, Dices, Sparkles, Target, Trash2, HelpCircle, Trophy } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';

const emptyDraft = (): DraftSelection => {
  const draft: Partial<DraftSelection> = {};
  statsList.forEach(stat => {
    draft[stat] = null;
  });
  draft.bindingVow = null;
  return draft as DraftSelection;
};

interface GambleState {
  remainingTotal: number;
  remainingLucky: number;
  statRolls: Record<string, number>;
}

export default function App() {
  const [players, setPlayers] = useState<DraftSelection[]>([emptyDraft(), emptyDraft()]);
  const [draftPhase, setDraftPhase] = useState<'start' | 'gambleConfig' | 'banning' | 'drafting' | 'comparing' | 'transitioning'>('start');
  const [draftMode, setDraftMode] = useState<'normal' | 'gamble'>('normal');
  const [bans, setBans] = useState<string[][]>([[], []]);
  const [roundWins, setRoundWins] = useState<number[]>([0, 0]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Gamble configurations
  const [gambleConfig, setGambleConfig] = useState({ totalRolls: 50, luckyRolls: 10, rollsPerStat: 5 });
  const [gambleStates, setGambleStates] = useState<Record<number, GambleState>>({});
  
  // Sync gamble states if players are added/removed
  React.useEffect(() => {
    if (draftMode === 'gamble' && players.length > 0) {
      setGambleStates(prev => {
        const next = { ...prev };
        let changed = false;
        players.forEach((_, i) => {
          if (!next[i]) {
            next[i] = {
              remainingTotal: gambleConfig.totalRolls,
              remainingLucky: gambleConfig.luckyRolls,
              statRolls: {}
            };
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }
  }, [players.length, draftMode, gambleConfig.totalRolls, gambleConfig.luckyRolls]);

  // Triggers for full-screen transition overlays
  const [activeOverlay, setActiveOverlay] = useState<'ban' | 'clash' | 'startToBan' | null>(null);

  const publicSynergies = pairings.filter(p => !p.isSecret);

  const [hoveredSynergy, setHoveredSynergy] = useState<any>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const tooltipWidth = 288;
    const tooltipHeight = 200;
    
    let x = e.clientX + 15;
    let y = e.clientY + 15;
    
    if (x + tooltipWidth > window.innerWidth) {
      x = e.clientX - tooltipWidth - 15;
    }
    if (y + tooltipHeight > window.innerHeight) {
      y = e.clientY - tooltipHeight - 15;
    }

    x = Math.max(10, x);
    y = Math.max(10, y);

    setTooltipPos({ x, y });
  };

  const handleSelect = (playerIndex: number, stat: string, entityId: string) => {
    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], [stat]: entityId || null };
    setPlayers(newPlayers);
  };

  const handleNameChange = (playerIndex: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], playerName: name };
    setPlayers(newPlayers);
  };

  // Update gamble states if players are added/removed
  const handleAddPlayer = () => {
    if (players.length < 8) {
      setPlayers([...players, emptyDraft()]);
      setBans([...bans, []]);
      setRoundWins(prev => [...prev, 0]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    if (players.length > 2) {
      const newPlayers = [...players];
      newPlayers.splice(index, 1);
      setPlayers(newPlayers);
      
      const newBans = [...bans];
      newBans.splice(index, 1);
      setBans(newBans);

      const newWins = [...roundWins];
      newWins.splice(index, 1);
      setRoundWins(newWins);

      // Re-index gamble states
      if (Object.keys(gambleStates).length > 0) {
        setGambleStates(prev => {
          const next: Record<number, GambleState> = {};
          Object.keys(prev).forEach(keyStr => {
            const k = parseInt(keyStr);
            if (k < index) next[k] = prev[k];
            else if (k > index) next[k - 1] = prev[k];
          });
          return next;
        });
      }
    }
  };

  const getSelectedIds = () => {
    const ids = new Set<string>();
    players.forEach(draft => {
      Object.values(draft).forEach(id => {
        if (typeof id === 'string') ids.add(id);
      });
    });
    return ids;
  };

  const handleGambleRoll = (playerIndex: number, stat: string, isLucky: boolean) => {
    const currentState = gambleStates[playerIndex];
    if (!currentState) return;
    
    // Binding Vows are exempt from the global currency pool but still respect the per-stat limit
    const isVow = stat === 'bindingVow';
    
    if (!isVow) {
      if (currentState.remainingTotal <= 0) return;
    }
    
    if ((currentState.statRolls[stat] || 0) >= gambleConfig.rollsPerStat) return;

    if (isLucky && currentState.remainingLucky <= 0) return;

    const draft = players[playerIndex];
    const category = stat === 'bindingVow' ? 'bindingVow' : (statCategoryMap[stat] || 'character');
    
    let available: any = stat === 'bindingVow' ? bindingVows : getAvailableEntities(draft[stat], category as string, draft);
    
    if (stat === 'tool') {
      available = getAvailableEntities(draft[stat], 'tool', draft);
    }

    if (available.length === 0) return;

    // Filter logic for lucky roll
    if (isLucky) {
      const getEntityPower = (entity: any) => {
        let pwr = 50;
        if (entity.statValue) pwr = entity.statValue;
        else if (entity.stats && entity.stats[stat]) pwr = entity.stats[stat];
        const grade = entity.grade || '';
        if (grade === 'Mythic') pwr += 100;
        else if (grade === 'Legendary') pwr += 50;
        else if (grade === 'Epic') pwr += 30;
        else if (grade === 'Rare') pwr += 15;
        return pwr;
      };
      
      const sorted = [...available].sort((a, b) => getEntityPower(b) - getEntityPower(a));
      available = sorted.slice(0, Math.max(1, Math.ceil(sorted.length * 0.3)));
    }

    const randomEntity = available[Math.floor(Math.random() * available.length)];
    
    const newGambleStates = { ...gambleStates };
    newGambleStates[playerIndex] = {
      ...currentState,
      remainingTotal: isVow ? currentState.remainingTotal : currentState.remainingTotal - 1,
      remainingLucky: (isLucky && !isVow) ? currentState.remainingLucky - 1 : currentState.remainingLucky,
      statRolls: {
        ...currentState.statRolls,
        [stat]: (currentState.statRolls[stat] || 0) + 1
      }
    };
    setGambleStates(newGambleStates);

    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], [stat]: randomEntity.id };
    
    // Auto-resolve Sukuna's Fingers edge case if vessel changes
    if (stat !== 'tool') {
      newPlayers[playerIndex] = { ...newPlayers[playerIndex] };
    }
    setPlayers(newPlayers);
  };

  const getAvailableEntities = (currentSelectedId: string | null, category: string, draft: DraftSelection) => {
    const selectedIds = getSelectedIds();
    const globalBans = bans.flat().filter(Boolean);
    
    return characters.filter(entity => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id) && entity.id !== currentSelectedId) return false;
      
      // Allow 'binding-vow' to be selected by multiple players
      if (entity.id !== 'binding-vow') {
        if (selectedIds.has(entity.id) && entity.id !== currentSelectedId) return false;
      }
      
      if ('prerequisite' in entity && entity.prerequisite) {
        const hasPrerequisite = Object.values(draft).includes(entity.prerequisite);
        if (!hasPrerequisite) return false;
      }

      if (entity.id === 'sukunas-fingers') {
        const hasVessel = Object.values(draft).some(id => {
          if (!id) return false;
          if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id)) return true;
          const char = characters.find(c => c.id === id);
          if (char && char.loreDescription && (char.loreDescription.includes('Curse') || char.loreDescription.includes('curses'))) return true;
          return false;
        });
        if (!hasVessel) return false;
      }
      
      return true;
    });
  };

  const handleAutoFill = () => {
    const newPlayers = players.map(draft => ({ ...draft }));
    const takenIds = new Set(getSelectedIds());
    const globalBans = bans.flat().filter(Boolean);
    
    newPlayers.forEach((draft) => {
      statsList.forEach(stat => {
        if (!draft[stat]) {
          const category = statCategoryMap[stat] || 'character';
          const available = characters.filter(entity => {
            if (entity.category !== category) return false;
            if (globalBans.includes(entity.id)) return false;
            if (entity.id !== 'binding-vow' && takenIds.has(entity.id)) return false;
            if ('prerequisite' in entity && entity.prerequisite) {
              const hasReq = Object.values(draft).includes(entity.prerequisite);
              if (!hasReq) return false;
            }
            if (entity.id === 'sukunas-fingers') {
              const hasVessel = Object.values(draft).some(id => {
                if (!id) return false;
                if (['yuji', 'modulo-yuji', 'sukuna', 'megumi'].includes(id as string)) return true;
                const char = characters.find(c => c.id === id);
                if (char && char.loreDescription && (char.loreDescription.includes('Curse') || char.loreDescription.includes('curses'))) return true;
                return false;
              });
              if (!hasVessel) return false;
            }
            return true;
          });

          if (available.length > 0) {
            const randomEntity = available[Math.floor(Math.random() * available.length)];
            draft[stat] = randomEntity.id;
            takenIds.add(randomEntity.id);
          }
        }
      });
    });

    setPlayers(newPlayers);

    if (draftMode === 'gamble') {
      const newGambleStates = { ...gambleStates };
      newPlayers.forEach((_, i) => {
         if (newGambleStates[i]) {
            newGambleStates[i] = {
               ...newGambleStates[i],
               remainingTotal: 0,
               remainingLucky: 0
            };
         }
      });
      setGambleStates(newGambleStates);
    }
  };

  const allSelected = players.every((draft, index) => {
    const filled = statsList.every(stat => draft[stat] !== null);
    if (draftMode === 'gamble') {
      const state = gambleStates[index];
      const outOfRolls = state && state.remainingTotal <= 0;
      return filled || outOfRolls;
    }
    return filled;
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 relative overflow-x-hidden">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.08)_0%,transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(220,38,38,0.05)_0%,transparent_40%)]"></div>
        <div className="absolute inset-0 bg-pattern opacity-30"></div>
      </div>

      {draftPhase !== 'start' && (
      <header className="w-full py-3 md:py-4 border-b border-zinc-900/80 bg-[#050505]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
          <div className="flex flex-col items-center md:items-start">
            <h1 className="text-2xl md:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-400 uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.3)] transform skew-x-[-5deg]">
              JJK Stat Draft
            </h1>
            <p className="text-zinc-500 font-mono text-[10px] md:text-xs tracking-widest uppercase mt-[-2px]">Build Your Ultimate Sorcerer</p>
          </div>
          
          {!draftPhase.includes('comparing') && draftPhase === 'drafting' && (
            <div className="flex gap-2">
              <button
                onClick={() => allSelected && setActiveOverlay('clash')}
                disabled={!allSelected}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold font-display uppercase tracking-wider transition-all ${
                  allSelected 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:scale-105' 
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 size={20} />
                {allSelected ? 'Finish Draft' : 'Complete Selections'}
              </button>
            </div>
          )}
        </div>
      </header>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
        {draftPhase !== 'start' && draftPhase !== 'comparing' && matchHistory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-4 md:gap-8 items-center mb-10 bg-zinc-900 border border-zinc-800 px-8 py-3 rounded-full shadow-lg relative z-20"
          >
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={20} />
              <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">{matchHistory.length} Matches</span>
            </div>
            <div className="flex gap-6 items-center font-mono font-bold text-sm tracking-widest uppercase">
              {players.map((p, i) => (
                <span key={i} className={roundWins[i] > 0 ? "text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" : "text-zinc-500"}>
                  {p.playerName || `P${i+1}`}: <span className="text-xl">{roundWins[i] || 0}</span>
                </span>
              ))}
            </div>
            <div className="hidden md:block w-px h-6 bg-zinc-700"></div>
            <button 
              onClick={() => { setMatchHistory([]); setRoundWins(players.map(() => 0)); setDraftPhase('start'); }} 
              className="text-[10px] font-mono text-zinc-500 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
            >
              End Series
            </button>
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {draftPhase === 'start' && (
            <motion.div 
              key="start" 
              className="min-h-[80vh] flex flex-col items-center justify-center relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.8 }}
            >
               <motion.div
                 initial={{ scale: 3, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 transition={{ duration: 1.5, ease: "circOut", bounce: 0 }}
                 className="text-7xl md:text-[180px] font-black font-display uppercase tracking-[-0.05em] text-center leading-[0.85] z-10"
               >
                  JJK
                  <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-800 drop-shadow-[0_0_40px_rgba(220,38,38,0.6)]" style={{ WebkitTextStroke: '2px rgba(255,0,0,0.3)' }}>
                    DRAFT
                  </span>
               </motion.div>

               <motion.p 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                 className="mt-8 text-zinc-400 font-mono tracking-[0.3em] uppercase text-sm md:text-lg text-center mb-8"
                 style={{ willChange: "opacity, transform" }}
               >
                 Build Your Ultimate Sorcerer
               </motion.p>

               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 1.5, duration: 0.6 }}
                 className="flex flex-col md:flex-row gap-6 mt-4 z-20"
               >
                 <motion.button
                   initial={{ opacity: 0, scale: 0.9, y: 30 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
                   onClick={() => { setDraftMode('normal'); setActiveOverlay('startToBan'); }}
                   className="px-12 py-5 bg-zinc-900 border-2 border-red-900/50 hover:bg-red-950 text-red-500 hover:text-white hover:border-red-500 font-black text-xl uppercase tracking-[0.2em] relative overflow-hidden group transition-all rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(220,38,38,0.4)]"
                 >
                    <div className="absolute inset-0 bg-red-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-20 duration-300"></div>
                    <span className="relative inline-flex items-center gap-3">
                      <Swords size={24} className="group-hover:rotate-180 transition-transform duration-500" />
                      Normal Protocol
                    </span>
                 </motion.button>

                 <motion.button
                   initial={{ opacity: 0, scale: 0.9, y: 30 }}
                   animate={{ opacity: 1, scale: 1, y: 0 }}
                   transition={{ delay: 2.2, duration: 0.8, ease: "easeOut" }}
                   onClick={() => { setDraftMode('gamble'); setDraftPhase('gambleConfig'); }}
                   className="px-12 py-5 bg-zinc-900 border-2 border-yellow-900/50 hover:bg-yellow-950 text-yellow-500 hover:text-white hover:border-yellow-500 font-black text-xl uppercase tracking-[0.2em] relative overflow-hidden group transition-all rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)] hover:shadow-[0_0_40px_rgba(234,179,8,0.4)]"
                 >
                    <div className="absolute inset-0 bg-yellow-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left opacity-20 duration-300"></div>
                    <span className="relative inline-flex items-center gap-3">
                      <Zap size={24} className="group-hover:rotate-12 transition-transform duration-500" />
                      Gamble Mode
                    </span>
                 </motion.button>
               </motion.div>
               
               {/* Decorative background element for start screen */}
               <motion.div 
                 initial={{ scale: 0, rotate: -45, opacity: 0 }}
                 animate={{ scale: 1, rotate: 0, opacity: 0.05 }}
                 transition={{ duration: 3, delay: 0.5, ease: "easeOut" }}
                 className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10 overflow-hidden"
               >
                  <div className="text-[400px] md:text-[600px] font-black font-display rotate-12 leading-none text-white blur-[4px]">
                    呪
                  </div>
               </motion.div>

               {/* Match History / Series Recorder */}
               {matchHistory.length > 0 && (
                 <motion.div 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="mt-16 w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden group"
                 >
                   <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl italic -rotate-12 pointer-events-none">HISTORY</div>
                   <h3 className="text-xl font-black font-display text-white uppercase tracking-widest mb-6 flex items-center gap-3">
                     <Trophy className="text-yellow-500" size={24} /> 
                     Series Logs
                   </h3>
                   <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                     {matchHistory.map((m, i) => (
                       <div key={i} className="bg-black/40 border border-white/5 p-3 rounded-lg flex items-center justify-between group-hover:border-red-500/20 transition-colors">
                         <div className="flex flex-col">
                           <span className="text-[10px] font-mono text-zinc-500 uppercase">{new Date(m.date).toLocaleTimeString()}</span>
                           <div className="flex gap-2 items-center mt-1">
                             {m.players.map((p: any, pi: number) => (
                               <div key={pi} className="flex items-center gap-1">
                                 <span className={`text-xs font-black uppercase ${p.isWinner ? 'text-yellow-500 underline decoration-yellow-500/50 underline-offset-2' : 'text-zinc-400'}`}>
                                   {p.name}: {p.score}
                                 </span>
                                 {pi < m.players.length - 1 && <span className="text-zinc-700 text-[10px]">VS</span>}
                               </div>
                             ))}
                           </div>
                         </div>
                         {m.players.length > 0 && (
                           <div className="text-[10px] font-mono font-black text-red-500 bg-red-500/10 px-2 py-1 rounded">
                             MATCH {matchHistory.length - i}
                           </div>
                         )}
                       </div>
                     ))}
                   </div>
                   <button 
                    onClick={() => { setMatchHistory([]); setRoundWins(players.map(() => 0)); }}
                    className="mt-4 text-[10px] font-mono text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-colors flex items-center gap-2"
                   >
                     <Trash2 size={12} /> Clear Records
                   </button>
                 </motion.div>
               )}
            </motion.div>
          )}

           {draftPhase === 'gambleConfig' && (
             <div className="flex justify-center items-center h-[80vh] py-8">
              <motion.div
                key="gambleConfig"
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ type: "spring", damping: 20, stiffness: 100 }}
                className="flex flex-col items-center gap-5 w-full max-w-xl bg-black/90 backdrop-blur-xl border border-yellow-500/20 p-6 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.15)] relative overflow-y-auto max-h-[85vh] custom-scrollbar"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(234,179,8,0.1)_0%,transparent_70%)] pointer-events-none"></div>

                <div className="text-center z-10 relative">
                  <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-700 uppercase tracking-widest font-display flex items-center justify-center gap-3 drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]">
                    <Dices size={32} className="text-yellow-500" /> 
                    Cursed Lottery
                  </h2>
                  <p className="text-yellow-500/50 font-mono tracking-[0.2em] uppercase text-xs mt-1">Configure Rules</p>
                </div>

                <div className="flex flex-col gap-4 w-full text-zinc-300 z-10 mt-2">
                  <div className="bg-[#111] p-4 rounded-xl border border-white/5 relative group hover:border-yellow-500/30 transition-colors">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex gap-3 items-center">
                        <Dices className="text-zinc-500 group-hover:text-yellow-500 transition-colors" size={20} />
                        <div>
                          <label className="text-base font-black uppercase tracking-wider text-white">Global Roll Pool</label>
                          <p className="text-[10px] text-zinc-500 font-mono">Total spins shared across 10 categories.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-yellow-500 font-display">{gambleConfig.totalRolls}</span>
                        {gambleConfig.totalRolls < gambleConfig.rollsPerStat * 10 && (
                          <div className="text-[10px] text-red-500 font-bold animate-pulse">Below Optimal: {gambleConfig.rollsPerStat * 10} min</div>
                        )}
                      </div>
                    </div>
                    <input type="range" min={Math.max(10, gambleConfig.rollsPerStat * 10)} max="300" step="5" value={gambleConfig.totalRolls} onChange={e => {
                      const val = +e.target.value;
                      setGambleConfig({...gambleConfig, totalRolls: val});
                    }} className="w-full accent-yellow-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none" />
                  </div>

                  <div className="bg-[#111] p-4 rounded-xl border border-white/5 relative group hover:border-yellow-400/30 transition-colors">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex gap-3 items-center">
                        <Sparkles className="text-zinc-500 group-hover:text-yellow-400 transition-colors" size={20} />
                        <div>
                          <label className="text-base font-black uppercase tracking-wider text-white">Jackpot (Lucky) Rolls</label>
                          <p className="text-[10px] text-zinc-500 font-mono">Elite/Mythic focus (Uses Global Pool + Stat Capacity).</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-yellow-400 font-display">{gambleConfig.luckyRolls}</span>
                    </div>
                    <input type="range" min="0" max={Math.min(50, gambleConfig.totalRolls)} step="1" value={gambleConfig.luckyRolls} onChange={e => {
                      setGambleConfig({...gambleConfig, luckyRolls: +e.target.value});
                    }} className="w-full accent-yellow-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none" />
                  </div>

                  <div className="bg-[#111] p-4 rounded-xl border border-white/5 relative group hover:border-red-500/30 transition-colors">
                    <div className="flex justify-between items-end mb-3">
                      <div className="flex gap-3 items-center">
                        <Target className="text-zinc-500 group-hover:text-red-500 transition-colors" size={20} />
                        <div>
                          <label className="text-base font-black uppercase tracking-wider text-white">Category Limit</label>
                          <p className="text-[10px] text-zinc-500 font-mono">Max spins allowed per individual category.</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-red-500 font-display">{gambleConfig.rollsPerStat}</span>
                    </div>
                    <input type="range" min="1" max={Math.floor(gambleConfig.totalRolls / 10)} step="1" value={gambleConfig.rollsPerStat} onChange={e => {
                      const val = +e.target.value;
                      setGambleConfig({...gambleConfig, rollsPerStat: val});
                    }} className="w-full accent-red-500 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none" />
                  </div>
                </div>

                <motion.button
                  onClick={() => {
                    const initialGambleStates: Record<number, GambleState> = {};
                    players.forEach((_, i) => {
                      initialGambleStates[i] = {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {}
                      };
                    });
                    setGambleStates(initialGambleStates);
                    setActiveOverlay('startToBan');
                  }}
                  className="mt-4 w-full py-4 bg-[linear-gradient(45deg,#b45309,#eab308,#b45309)] bg-[length:200%_auto] text-black font-black uppercase tracking-[0.3em] rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] animate-[gradient_3s_ease_infinite] shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_50px_rgba(234,179,8,0.5)] z-10 text-lg"
                >
                  Confirm Vow
                </motion.button>
              </motion.div>
             </div>
           )}

          {draftPhase === 'banning' && (
            <motion.div
              key="banning"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="flex flex-col items-center gap-12 w-full"
            >
              <div className="text-center">
                <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-2 flex items-center justify-center gap-3">
                  <Ban size={36} /> Ban Phase
                </h2>
                <p className="text-zinc-400">Each player must ban 2 entities from the draft pool.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-8 w-full items-start">
                {players.map((_, pIndex) => (
                  <div key={pIndex} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col gap-4 w-full max-w-sm relative transition-all duration-300 hover:z-50 focus-within:z-50">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-2xl font-black text-white uppercase truncate pr-2">
                        {players[pIndex].playerName || `Player ${pIndex + 1}`} Bans
                      </h3>
                      {players.length > 2 && (
                        <button onClick={() => handleRemovePlayer(pIndex)} className="text-zinc-500 hover:text-red-500 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                      )}
                    </div>
                    {[0, 1].map(banIndex => {
                      const availableBans = characters.filter(c => !bans.flat().includes(c.id) || bans[pIndex][banIndex] === c.id);
                      const options = availableBans.map(c => ({
                        value: c.id,
                        label: `${c.name} (${categoryLabels[c.category] || c.category})`,
                        loreDescription: c.loreDescription,
                        grade: c.grade
                      }));

                      return (
                        <div key={banIndex} className="relative">
                          <SearchableSelect
                            value={bans[pIndex][banIndex] || ""}
                            options={options}
                            onChange={(val: string) => {
                              const newBans = [...bans];
                              newBans[pIndex][banIndex] = val;
                              setBans(newBans);
                            }}
                            placeholder="Select entity to ban..."
                            kanji="禁"
                            colorTheme={{ text: 'text-red-500', border: 'border-red-900/50', shadow: '', glow: 'shadow-[0_0_15px_rgba(220,38,38,0.2)]', bg: '' }}
                            isSynergyActive={false}
                          />
                        </div>
                      );
                    })}
                  </div>
                ))}
                {players.length < 8 && (
                  <button onClick={handleAddPlayer} className="h-full min-h-[250px] w-full max-w-sm flex items-center justify-center bg-zinc-900/30 border border-dashed border-zinc-700 hover:border-red-500 hover:bg-zinc-900/50 hover:text-red-400 text-zinc-500 rounded-xl font-mono text-lg uppercase tracking-widest transition-all gap-3 cursor-pointer">
                    <Plus size={24} /> Add Challenger
                  </button>
                )}
              </div>
              
              {bans.every(pBans => pBans.length === 2 && pBans[0] && pBans[1]) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setActiveOverlay('ban')}
                  className="bg-red-600 hover:bg-red-700 text-white font-black font-display py-4 px-12 rounded-full text-xl uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-105"
                >
                  Begin Draft
                </motion.button>
              )}
            </motion.div>
          )}

          {draftPhase === 'drafting' && (
            <motion.div
              key="selection"
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
              className="flex flex-col items-center gap-12"
            >
              <div className="flex flex-wrap justify-center gap-8 w-full items-start relative z-20">
                {players.map((draft, index) => (
                  <PlayerCard
                    key={index}
                    playerNum={index + 1}
                    draft={draft}
                    onSelect={(stat, entityId) => handleSelect(index, stat, entityId)}
                    onNameChange={(name) => handleNameChange(index, name)}
                    onRemove={() => handleRemovePlayer(index)}
                    canRemove={players.length > 2}
                    getAvailableEntities={getAvailableEntities}
                    allEntities={characters}
                    draftMode={draftMode}
                    gambleState={gambleStates[index]}
                    gambleConfig={gambleConfig}
                    onGambleRoll={(stat, isLucky) => handleGambleRoll(index, stat, isLucky)}
                  />
                ))}
              </div>

              {allSelected && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setActiveOverlay('clash')}
                  className="bg-red-600 hover:bg-red-700 text-white font-black font-display py-5 px-16 rounded-full text-2xl uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(220,38,38,0.4)] transition-all hover:scale-105 flex items-center gap-4"
                >
                  <Swords size={32} />
                  Clash!
                </motion.button>
              )}

              <div className="w-full max-w-5xl mt-16 bg-[#0a0a0a] border border-zinc-800/80 rounded-xl p-6 md:p-10 shadow-2xl relative overflow-hidden z-10">
                {/* Technical Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                <div className="relative z-10">
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
                          <p><strong className="text-zinc-200">Domain Refinement:</strong> High IQ and Cursed Energy grant a 15% efficiency bonus to Domain Expansion stats during clashes.</p>
                        </li>
                        <li className="flex items-start gap-3 bg-zinc-900/30 p-3 rounded border border-zinc-800/50">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                          <p><strong className="text-zinc-200">Black Flash:</strong> Every physical hit has a critical chance to trigger a 2.5x power multiplier.</p>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-sm font-mono font-bold text-yellow-500 uppercase tracking-widest border-l-2 border-yellow-500 pl-3">Archival Synergy</h3>
                      <p className="text-xs text-zinc-500 font-mono uppercase bg-zinc-950 p-4 border border-zinc-900 rounded">Pairing entities from the same lore lineage grants massive bonuses. Detecting current bonds...</p>
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
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {draftPhase === 'comparing' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center"
            >
              <Comparison
                players={players}
                roundWins={roundWins}
                onReset={(winners, finalScores) => {
                  const newWins = [...roundWins];
                  while (newWins.length < players.length) newWins.push(0);
                  
                  const matchRecord = {
                    date: new Date().toISOString(),
                    players: players.map((p, i) => ({
                      name: p.playerName || `Player ${i + 1}`,
                      score: finalScores[i],
                      isWinner: winners.includes(i)
                    }))
                  };
                  setMatchHistory(prev => [matchRecord, ...prev]);

                  winners.forEach(w => {
                    if (newWins[w] !== undefined) newWins[w]++;
                  });
                  setRoundWins(newWins);

                  // Reset gamble states for new matchup if in gamble mode
                  if (draftMode === 'gamble') {
                    const resetGambleStates: Record<number, GambleState> = {};
                    players.forEach((_, i) => {
                      resetGambleStates[i] = {
                        remainingTotal: gambleConfig.totalRolls,
                        remainingLucky: gambleConfig.luckyRolls,
                        statRolls: {}
                      };
                    });
                    setGambleStates(resetGambleStates);
                  }

                  const names = players.map(p => p.playerName || '');
                  const newPlayers = players.map(() => emptyDraft());
                  names.forEach((n, i) => { newPlayers[i].playerName = n; });
                  
                  setPlayers(newPlayers);
                  setBans(players.map(() => []));
                  setDraftPhase('banning');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Full Screen Interactive Overlays */}
      {activeOverlay === 'startToBan' && (
        <PhaseTransition
          topKanji="封印開始"
          topEnglish="Banning Phase"
          bottomPhase="Phase 1"
          bottomTitle="COMMENCE SEALING"
          onPhaseSwap={() => setDraftPhase('banning')}
          onComplete={() => setActiveOverlay(null)}
        />
      )}

      {activeOverlay === 'ban' && (
        <PhaseTransition
          topKanji="選別開始"
          topEnglish="Drafting Phase"
          bottomPhase="Phase 2"
          bottomTitle="COMMENCE DRAFTING"
          onPhaseSwap={() => setDraftPhase('drafting')}
          onComplete={() => setActiveOverlay(null)} 
        />
      )}
      
      {activeOverlay === 'clash' && (
        <CursedConvergenceTransition 
          players={players}
          onPhaseSwap={() => setDraftPhase('comparing')}
          onComplete={() => setActiveOverlay(null)} 
        />
      )}

      {/* Synergy Tooltip */}
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
      {/* Help Modal */}
      <HelpPage isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Floating Help Button - Only on start screen */}
      {draftPhase === 'start' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsHelpOpen(true)}
          className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.4)] border-2 border-white/20 transition-colors"
        >
          <HelpCircle size={32} />
        </motion.button>
      )}
      <Analytics />
    </div>
  );
}
