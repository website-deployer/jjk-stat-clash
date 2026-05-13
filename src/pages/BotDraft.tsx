import React, { useState, useEffect, useRef } from 'react';
import { characters, statsList, statLabels, categoryLabels, pairings, statCategoryMap, Entity } from '../data/characters';
import { PlayerCard, DraftSelection, SearchableSelect, bindingVows } from '../components/PlayerCard';
import { Comparison } from '../components/Comparison';
import { CursedConvergenceTransition } from '../components/CursedConvergenceTransition';
import { PhaseTransition } from '../components/PhaseTransition';
import { motion, AnimatePresence } from 'motion/react';
import { SystemProtocol } from '../components/SystemProtocol';
import { Swords, Ban, CheckCircle2, Trophy, Clock, Cpu, ArrowLeft, Dices, Sparkles, Target, Zap, Shield, AlertTriangle, Skull } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { getBotPick } from '../utils/botLogic';
import { Helmet } from 'react-helmet-async';

const TURN_TIME_SECONDS = 30;

const emptyDraft = (): DraftSelection => {
  const draft: Partial<DraftSelection> = {};
  statsList.forEach(stat => { draft[stat] = null; });
  draft.bindingVow = null;
  return draft as DraftSelection;
};

export default function BotDraft() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [draftMode, setDraftMode] = useState<'normal' | 'gamble'>('normal');
  const [gambleConfig, setGambleConfig] = useState({ totalRolls: 50, luckyRolls: 10, rollsPerStat: 5 });
  const [gambleStates, setGambleStates] = useState<Record<number, any>>({
    0: { remainingTotal: 50, remainingLucky: 10, statRolls: {} },
    1: { remainingTotal: 50, remainingLucky: 10, statRolls: {} }
  });

  const [players, setPlayers] = useState<DraftSelection[]>([emptyDraft(), emptyDraft()]);
  const [draftPhase, setDraftPhase] = useState<'setup' | 'banning' | 'drafting' | 'comparing' | 'transitioning'>('setup');
  const [bans, setBans] = useState<string[][]>([[], []]);
  const [roundWins, setRoundWins] = useState<number[]>([0, 0]);
  const [matchHistory, setMatchHistory] = useState<any[]>([]);

  // Turn-based State
  const [activePlayer, setActivePlayer] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TURN_TIME_SECONDS);
  const [activeOverlay, setActiveOverlay] = useState<'ban' | 'clash' | 'startToBan' | 'startToDraft' | 'banToDraft' | 'transitioning' | 'gambleConfig' | null>(null);

  // Initialize
  useEffect(() => {
    const newPlayers = [...players];
    newPlayers[0].playerName = "Human Sorcerer";
    newPlayers[1].playerName = `AI Protocol: ${difficulty?.toUpperCase()}`;
    setPlayers(newPlayers);
  }, [difficulty]);

  const allSelected = players.every(draft => statsList.every(stat => draft[stat] !== null));

  // Keep a ref for latest players state (avoids stale closures in timers)
  const playersRef = useRef(players);
  playersRef.current = players;

  // Timer & Auto-Turn Logic
  useEffect(() => {
    if (draftPhase !== 'drafting' || allSelected) return;

    // If it's Bot's turn (Player 1)
    if (activePlayer === 1 && difficulty) {
      const delay = 1000 + Math.random() * 2000;
      const botTimer = setTimeout(() => {
        executeBotTurn();
      }, delay);
      return () => clearTimeout(botTimer);
    }

    // If it's Human's turn, run countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Auto-turn for Human — pick random and pass turn
          setTimeout(() => executeAutoTurn(0), 0);
          return TURN_TIME_SECONDS;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [draftPhase, activePlayer, allSelected, players]);

  const executeBotTurn = () => {
    if (!difficulty) return;

    if (draftMode === 'gamble') {
      // Bot gamble logic
      const emptyStats = statsList.filter(stat => !players[1][stat]);
      if (emptyStats.length === 0) {
        passTurn();
        return;
      }

      const statToRoll = emptyStats[Math.floor(Math.random() * emptyStats.length)];
      const currentState = gambleStates[1];

      // Bot decided whether to use lucky roll (Hard bot uses it more wisely)
      let useLucky = false;
      if (currentState.remainingLucky > 0) {
        if (difficulty === 'hard') {
          // Hard bot saves lucky rolls for character/domain/ct
          if (['character', 'domainExpansion', 'ct'].includes(statToRoll)) useLucky = true;
        } else if (difficulty === 'medium') {
          useLucky = Math.random() < 0.3;
        } else {
          useLucky = Math.random() < 0.1;
        }
      }

      handleGambleRoll(1, statToRoll, useLucky);
      return;
    }

    const takenIds = new Set<string>();
    players.forEach(draft => {
      Object.values(draft).forEach(id => {
        if (typeof id === 'string') takenIds.add(id);
      });
    });

    const globalBans = bans.flat().filter(Boolean);
    const pick = getBotPick(difficulty, players[1], [players[0]], globalBans, takenIds);

    if (pick) {
      handleSelect(1, pick.stat, pick.id);
    } else {
      // Fallback
      executeAutoTurn(1);
    }
  };

  const handleGambleRoll = (playerIndex: number, stat: string, isLucky: boolean) => {
    const currentState = gambleStates[playerIndex];
    if (!currentState) return;

    const isVow = stat === 'bindingVow';
    if (!isVow && currentState.remainingTotal <= 0) return;
    if ((currentState.statRolls[stat] || 0) >= gambleConfig.rollsPerStat) return;
    if (isLucky && currentState.remainingLucky <= 0) return;

    const draft = players[playerIndex];
    const category = stat === 'bindingVow' ? 'bindingVow' : (statCategoryMap[stat] || 'character');

    const selectedIds = new Set<string>();
    players.forEach(d => {
      Object.values(d).forEach(id => { if (typeof id === 'string') selectedIds.add(id); });
    });
    const globalBans = bans.flat().filter(Boolean);

    let available = characters.filter(entity => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id)) return false;
      if (entity.id !== 'binding-vow' && selectedIds.has(entity.id)) return false;
      return true;
    });

    if (stat === 'bindingVow') available = bindingVows as any;

    if (available.length === 0) return;

    if (isLucky) {
      const getEntityPower = (entity: any) => {
        let pwr = 50;
        if (entity.statValue) pwr = entity.statValue;
        else if (entity.stats && entity.stats[stat]) pwr = entity.stats[stat];
        const grade = entity.grade || '';
        if (grade === 'Mythic') pwr += 100;
        else if (grade === 'Legendary') pwr += 50;
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
      statRolls: { ...currentState.statRolls, [stat]: (currentState.statRolls[stat] || 0) + 1 }
    };
    setGambleStates(newGambleStates);

    const newPlayers = [...players];
    newPlayers[playerIndex] = { ...newPlayers[playerIndex], [stat]: randomEntity.id };
    newPlayers[playerIndex] = validateDraft(newPlayers[playerIndex]);
    setPlayers(newPlayers);
    passTurn();
  };

  const executeAutoTurn = (pIndex: number) => {
    if (draftMode === 'gamble') {
      const emptyStats = statsList.filter(stat => !players[pIndex][stat]);
      if (emptyStats.length === 0) {
        passTurn();
        return;
      }
      const randomStat = emptyStats[Math.floor(Math.random() * emptyStats.length)];
      handleGambleRoll(pIndex, randomStat, false);
      return;
    }

    const takenIds = new Set<string>();
    players.forEach(draft => {
      Object.values(draft).forEach(id => { if (typeof id === 'string') takenIds.add(id); });
    });
    const globalBans = bans.flat().filter(Boolean);

    const emptyStats = statsList.filter(stat => !players[pIndex][stat]);
    if (emptyStats.length === 0) {
      passTurn();
      return;
    }

    const randomStat = emptyStats[Math.floor(Math.random() * emptyStats.length)];
    const category = statCategoryMap[randomStat] || 'character';

    const available = characters.filter(entity => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id)) return false;
      if (entity.id !== 'binding-vow' && takenIds.has(entity.id)) return false;
      return true;
    });

    if (available.length > 0) {
      const pick = available[Math.floor(Math.random() * available.length)];
      handleSelect(pIndex, randomStat, pick.id);
    } else {
      passTurn();
    }
  };

  const passTurn = () => {
    setActivePlayer(prev => (prev === 0 ? 1 : 0));
    setTimeLeft(TURN_TIME_SECONDS);
  };

  const validateDraft = (draft: DraftSelection) => {
    const newDraft = { ...draft };
    statsList.forEach(s => {
      const selectedId = newDraft[s];
      if (selectedId) {
        const entity = characters.find(c => c.id === selectedId);
        if (entity && 'prerequisite' in entity && entity.prerequisite) {
          if (!Object.values(newDraft).includes(entity.prerequisite)) newDraft[s] = null;
        }
      }
    });
    return newDraft as DraftSelection;
  };

  const handleSelect = (playerIndex: number, stat: string, entityId: string) => {
    // Only allow selection if it's that player's turn
    if (playerIndex !== activePlayer) return;

    // Prevent changing selection once made
    if (players[playerIndex][stat]) return;

    const newPlayers = [...players];
    const updatedDraft = { ...newPlayers[playerIndex], [stat]: entityId || null };
    newPlayers[playerIndex] = validateDraft(updatedDraft);
    setPlayers(newPlayers);
    passTurn();
  };

  const getAvailableEntities = (currentSelectedId: string | null, category: string, draft: DraftSelection): Entity[] => {
    const selectedIds = new Set<string>();
    players.forEach(d => {
      Object.values(d).forEach(id => { if (typeof id === 'string') selectedIds.add(id); });
    });
    const globalBans = bans.flat().filter(Boolean);

    return characters.filter(entity => {
      if (entity.category !== category) return false;
      if (globalBans.includes(entity.id) && entity.id !== currentSelectedId) return false;
      if (entity.id !== 'binding-vow' && selectedIds.has(entity.id) && entity.id !== currentSelectedId) return false;
      if ('prerequisite' in entity && entity.prerequisite) {
        if (!Object.values(draft).includes(entity.prerequisite)) return false;
      }
      return true;
    });
  };


  if (draftPhase === 'setup') {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center relative py-20 px-4">
        <Helmet><title>Bot Match | JJK Stat Clash</title></Helmet>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1)_0%,transparent_50%)] pointer-events-none z-0"></div>
        <button onClick={() => navigate('/play')} className="absolute top-8 left-8 text-zinc-500 hover:text-white flex items-center gap-2 font-mono uppercase text-sm z-20">
          <ArrowLeft size={16} /> Return
        </button>

        <div className="z-10 flex flex-col items-center w-full max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <Cpu className="text-blue-500 mx-auto mb-6" size={64} />
            <h1 className="text-4xl md:text-6xl font-black font-display uppercase text-white mb-4 tracking-tighter">Simulated Combat</h1>
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em]">Protocol: Neutralize Simulated Sorcerer</p>
          </motion.div>

          {!difficulty ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
              {[
                {
                  id: 'easy',
                  title: 'Grade 4',
                  desc: 'Randomized drafting. For beginners.',
                  icon: <Shield className="text-green-500" size={32} />,
                  color: 'border-green-500/20 hover:border-green-500 text-green-500',
                  bg: 'hover:bg-green-500/5',
                  glow: 'rgba(34,197,94,0.2)'
                },
                {
                  id: 'medium',
                  title: 'Grade 1',
                  desc: 'Prioritizes high stats and character grades.',
                  icon: <AlertTriangle className="text-yellow-500" size={32} />,
                  color: 'border-yellow-500/20 hover:border-yellow-500 text-yellow-500',
                  bg: 'hover:bg-yellow-500/5',
                  glow: 'rgba(234,179,8,0.2)'
                },
                {
                  id: 'hard',
                  title: 'Special Grade',
                  desc: 'Hate drafting & complex synergy completion.',
                  icon: <Skull className="text-red-500" size={32} />,
                  color: 'border-red-500/20 hover:border-red-500 text-red-500',
                  bg: 'hover:bg-red-500/5',
                  glow: 'rgba(239,68,68,0.2)'
                }
              ].map((diff, i) => (
                <motion.button
                  key={diff.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => setDifficulty(diff.id as any)}
                  className={`flex flex-col items-center p-8 rounded-3xl border-2 bg-zinc-900/40 backdrop-blur-sm transition-all duration-500 group relative overflow-hidden ${diff.color} ${diff.bg}`}
                  style={{ boxShadow: `0 0 0 transparent` }}
                  whileHover={{ y: -10, boxShadow: `0 20px 40px ${diff.glow}` }}
                >
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">{diff.icon}</div>
                  <h2 className="text-3xl font-black uppercase tracking-widest mb-4 font-display">{diff.title}</h2>
                  <p className="text-zinc-500 font-mono text-[10px] text-center uppercase tracking-widest leading-relaxed">
                    {diff.desc}
                  </p>
                  <div className="mt-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                    Initialize Protocol <ArrowLeft className="rotate-180" size={12} />
                  </div>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center w-full max-w-2xl bg-zinc-900/50 border border-zinc-800 p-12 rounded-[2rem] backdrop-blur-xl relative"
            >
              <button
                onClick={() => setDifficulty(null)}
                className="absolute top-6 left-6 text-zinc-600 hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className={`w-3 h-3 rounded-full animate-pulse ${difficulty === 'easy' ? 'bg-green-500' :
                  difficulty === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                <span className="text-zinc-400 font-mono text-xs uppercase tracking-[0.3em]">Difficulty: {difficulty}</span>
              </div>

              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-12">Select Engagement Mode</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <button
                  onClick={() => { 
                    setDraftMode('normal'); 
                    setActiveOverlay('startToBan');
                  }}
                  className="flex flex-col items-center p-8 bg-black/40 border border-zinc-800 rounded-2xl hover:border-blue-500 transition-all group"
                >
                  <Target className="text-zinc-500 group-hover:text-blue-500 mb-4 transition-colors" size={32} />
                  <span className="text-xl font-bold text-white uppercase tracking-widest mb-2">Standard</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Competitive Drafting</span>
                </button>

                <button
                  onClick={() => { 
                    setDraftMode('gamble'); 
                    setActiveOverlay('startToDraft');
                  }}
                  className="flex flex-col items-center p-8 bg-black/40 border border-zinc-800 rounded-2xl hover:border-yellow-500 transition-all group"
                >
                  <Dices className="text-zinc-500 group-hover:text-yellow-500 mb-4 transition-colors" size={32} />
                  <span className="text-xl font-bold text-white uppercase tracking-widest mb-2">Cursed Lottery</span>
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">High Stakes Gambling</span>
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
      <Helmet><title>Vs Bot | JJK Stat Clash</title></Helmet>

      {draftPhase === 'drafting' && (
        <div className="w-full bg-[#111] border-b border-zinc-800 p-4 sticky top-0 z-50 flex justify-between items-center px-8">
          <div className="flex items-center gap-4">
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded ${activePlayer === 0 ? 'bg-blue-500/20 text-blue-500 border border-blue-500/50 animate-pulse' : 'text-zinc-500'}`}>HUMAN TURN</span>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded ${activePlayer === 1 ? 'bg-red-500/20 text-red-500 border border-red-500/50 animate-pulse' : 'text-zinc-500'}`}>BOT TURN</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className={timeLeft <= 5 && activePlayer === 0 ? 'text-red-500 animate-bounce' : 'text-zinc-400'} size={20} />
            <span className={`text-2xl font-mono font-black ${timeLeft <= 5 && activePlayer === 0 ? 'text-red-500' : 'text-white'}`}>00:{timeLeft.toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center">
        {draftPhase === 'banning' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center w-full">
            <h2 className="text-4xl font-black text-red-500 uppercase tracking-widest mb-12 flex items-center gap-3">
              <Ban size={36} /> Ban Phase
            </h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 w-full max-w-md">
              <h3 className="text-xl font-bold uppercase mb-4 text-white">Your Bans</h3>
              {[0, 1].map(bIndex => {
                const currentBans = bans.flat().filter(Boolean);
                const options = characters
                  .filter(c => !currentBans.includes(c.id) || bans[0][bIndex] === c.id)
                  .map(c => ({ value: c.id, label: c.name, grade: c.grade }));

                return (
                  <div key={bIndex} className="mb-4">
                    <SearchableSelect
                      value={bans[0][bIndex] || ""}
                      options={options}
                      onChange={(val: string) => {
                        const newBans = [...bans];
                        newBans[0][bIndex] = val;

                        // Auto-assign bot ban if slot is empty or changing
                        if (!newBans[1][bIndex] || newBans[1][bIndex] === val) {
                          const currentBansAll = newBans.flat().filter(Boolean);
                          const available = characters.filter(c => !currentBansAll.includes(c.id));
                          if (available.length > 0) {
                            const randomBan = available[Math.floor(Math.random() * available.length)].id;
                            newBans[1][bIndex] = randomBan;
                          }
                        }
                        setBans(newBans);
                      }}
                      placeholder="Select Entity..."
                      kanji="禁"
                    />
                  </div>
                );
              })}
            </div>
            {bans[0].length === 2 && bans[0][1] && (
              <button 
                onClick={() => setActiveOverlay('banToDraft')} 
                className="mt-8 bg-red-600 px-8 py-3 rounded-full font-bold uppercase text-white hover:bg-red-700"
              >
                Begin Draft
              </button>
            )}
          </motion.div>
        )}

        {draftPhase === 'drafting' && (
          <div className="flex flex-col items-center gap-8 w-full">
            <div className="flex flex-wrap justify-center gap-8 w-full items-start relative z-20">
              {players.map((draft, index) => (
                <div key={index} className={`relative ${activePlayer !== index ? 'opacity-60 pointer-events-none' : 'ring-4 ring-blue-500/50 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)]'}`}>
                  {/* Block interactions if it's the bot's card */}
                  {index === 1 && activePlayer === 1 && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
                      <div className="bg-zinc-900 border border-red-500 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                        <Cpu className="text-red-500" />
                        <span className="font-mono text-white font-bold">AI IS THINKING...</span>
                      </div>
                    </div>
                  )}
                  <PlayerCard
                    playerNum={index + 1}
                    draft={draft}
                    onSelect={(stat, entityId) => handleSelect(index, stat, entityId)}
                    onNameChange={() => { }}
                    onRemove={() => { }}
                    canRemove={false}
                    getAvailableEntities={getAvailableEntities}
                    allEntities={characters}
                    draftMode={draftMode}
                    lockOnSelect={true}
                    gambleState={gambleStates[index]}
                    onGambleRoll={(stat, isLucky) => handleGambleRoll(index, stat, isLucky)}
                  />
                </div>
              ))}
            </div>

            <SystemProtocol
              onClash={() => setDraftPhase('transitioning')}
              showClashButton={allSelected}
            />

            {!allSelected && activePlayer === 0 && (
              <div className="mt-8 flex flex-col items-center gap-4">
                <div className="text-zinc-500 font-mono text-xs animate-pulse tracking-widest uppercase">
                  Your Turn - {draftMode === 'gamble' ? 'Roll for a category' : 'Select a category to draft'}
                </div>
                {draftMode === 'gamble' && (
                  <div className="flex items-center gap-6 bg-zinc-900/50 border border-zinc-800 px-6 py-3 rounded-full">
                    <div className="flex items-center gap-2">
                      <Dices size={16} className="text-zinc-400" />
                      <span className="text-[10px] font-mono text-zinc-500 uppercase">Rolls: {gambleStates[0].remainingTotal}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-yellow-500" />
                      <span className="text-[10px] font-mono text-yellow-500 uppercase tracking-tighter">Lucky: {gambleStates[0].remainingLucky}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {activeOverlay === 'startToBan' && (
            <PhaseTransition
              key="startToBan"
              topKanji="拒否"
              topEnglish="REJECTION PHASE"
              bottomPhase="PHASE 01"
              bottomTitle="BAN SELECTION"
              onPhaseSwap={() => setDraftPhase('banning')}
              onComplete={() => setActiveOverlay(null)}
            />
          )}
          {activeOverlay === 'startToDraft' && (
            <PhaseTransition
              key="startToDraft"
              topKanji="運命"
              topEnglish="DESTINY PHASE"
              bottomPhase="PHASE 02"
              bottomTitle="CURSED LOTTERY"
              onPhaseSwap={() => setDraftPhase('drafting')}
              onComplete={() => setActiveOverlay(null)}
            />
          )}
          {activeOverlay === 'banToDraft' && (
            <PhaseTransition
              key="banToDraft"
              topKanji="呪術"
              topEnglish="SORCERY PHASE"
              bottomPhase="PHASE 02"
              bottomTitle="DRAFT SELECTION"
              onPhaseSwap={() => setDraftPhase('drafting')}
              onComplete={() => setActiveOverlay(null)}
            />
          )}
          {draftPhase === 'transitioning' && (
            <CursedConvergenceTransition
              players={players}
              onPhaseSwap={() => setDraftPhase('comparing')}
              onComplete={() => { }}
            />
          )}
        </AnimatePresence>

        {draftPhase === 'comparing' && (
          <div className="w-full flex justify-center pb-24 relative z-20">
            <Comparison
              players={players}
              roundWins={roundWins}
              onReset={(winners, finalScores) => {
                const newWins = [...roundWins];
                winners.forEach(w => newWins[w]++);
                setRoundWins(newWins);
                setPlayers([emptyDraft(), emptyDraft()]);
                setBans([[], []]);
                setGambleStates({
                  0: { remainingTotal: gambleConfig.totalRolls, remainingLucky: gambleConfig.luckyRolls, statRolls: {} },
                  1: { remainingTotal: gambleConfig.totalRolls, remainingLucky: gambleConfig.luckyRolls, statRolls: {} }
                });
                setDraftPhase('setup');
                setActivePlayer(0);
                setTimeLeft(TURN_TIME_SECONDS);
              }}
            />
          </div>
        )}
      </main>
    </div>
  );
}
