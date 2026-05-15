import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { characters, statLabels, categoryLabels, pairings } from '../data/characters';
import { Search, Info, Swords, Target, Zap, Shield, Brain, Heart, FastForward, HelpCircle, X, ChevronRight, Ban } from 'lucide-react';

interface HelpPageProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpPage({ isOpen, onClose }: HelpPageProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'synergies' | 'stats' | 'rarity'>('rules');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRarity, setFilterRarity] = useState('All');
  const [sortBy, setSortBy] = useState('Default');

  let filteredCharacters = characters.filter(char => {
    const matchesSearch = char.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (char.loreDescription && char.loreDescription.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRarity = filterRarity === 'All' || char.grade === filterRarity || (filterRarity === 'Common' && (!char.grade || char.grade === 'Common'));
    return matchesSearch && matchesRarity;
  });

  const rarityOrder: Record<string, number> = {
    'Calamity': 6,
    'Mythic': 5,
    'Legendary': 4,
    'Epic': 3,
    'Rare': 2,
    'Uncommon': 1,
    'Common': 0
  };

  if (sortBy === 'Rarity') {
    filteredCharacters.sort((a, b) => rarityOrder[b.grade || 'Common'] - rarityOrder[a.grade || 'Common']);
  } else if (sortBy === 'Alphabetical') {
    filteredCharacters.sort((a, b) => a.name.localeCompare(b.name));
  }

  const publicSynergies = pairings.filter(p => !p.isSecret);

  const getRarityColor = (grade: string = 'Common') => {
    switch (grade) {
      case 'Calamity': return 'text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.6)]';
      case 'Mythic': return 'text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]';
      case 'Legendary': return 'text-yellow-500';
      case 'Epic': return 'text-purple-500';
      case 'Rare': return 'text-blue-500';
      default: return 'text-zinc-400';
    }
  };

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
            className="relative w-full max-w-5xl h-[85vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black font-display uppercase tracking-widest text-white leading-none">System Archives</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Central Knowledge Database</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-zinc-950 border-b border-zinc-900 px-4 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'rules', label: 'Draft Protocol', icon: Swords },
                { id: 'synergies', label: 'Known Bonds', icon: Zap },
                { id: 'stats', label: 'Entity Database', icon: Info },
                { id: 'rarity', label: 'Rarity Guide', icon: Target },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                    activeTab === tab.id ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
              {activeTab === 'rules' && (
                <div className="max-w-4xl mx-auto space-y-16">
                  <section>
                    <h3 className="text-2xl font-black text-white uppercase font-display mb-8 flex items-center gap-3">
                      <Zap className="text-yellow-500" /> Draft Mechanics
                    </h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 hover:border-red-900/40 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                          <Ban size={16} className="text-red-500" />
                          <h4 className="text-white font-display text-sm uppercase tracking-widest font-bold">Banning Phase</h4>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          The game begins by sealing power. Each player selects 2 entities (Characters, Techniques, or Tools) to remove from the global pool. Strategic bans can dismantle entire build archetypes before they begin.
                        </p>
                      </div>
                      <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 hover:border-red-900/40 transition-colors">
                        <div className="flex items-center gap-2 mb-4">
                          <Target size={16} className="text-red-500" />
                          <h4 className="text-white font-display text-sm uppercase tracking-widest font-bold">11 Slot Protocol</h4>
                        </div>
                        <p className="text-zinc-400 text-xs leading-relaxed">
                          Build your sorcerer across 11 distinct categories. Every choice contributes specialized stat points. Note: Some abilities have <span className="text-red-500">Prerequisites</span> (e.g., Limitless requires Six Eyes).
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-2xl font-black text-white uppercase font-display mb-8 flex items-center gap-3">
                      <Brain className="text-purple-500" /> Niche Battle Features
                    </h3>
                    <div className="grid gap-4">
                      <div className="group bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800 hover:bg-zinc-900/50 transition-all">
                        <h4 className="text-zinc-200 font-bold uppercase tracking-widest text-sm mb-3 group-hover:text-red-500 transition-colors">Domain Clashes & Refinement</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          When two Domain Expansions clash, the one with the higher <span className="text-purple-400">Battle IQ (IQ)</span> and <span className="text-purple-400">Cursed Energy (CE)</span> is considered more "refined." The refined domain will gradually erode the opponent's barrier until it collapses, granting the user full "Sure-Hit" access.
                        </p>
                      </div>

                      <div className="group bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800 hover:bg-zinc-900/50 transition-all">
                        <h4 className="text-zinc-200 font-bold uppercase tracking-widest text-sm mb-3 group-hover:text-yellow-500 transition-colors">Black Flash Trait</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          Any physical attack has a rare chance to trigger a <span className="text-yellow-400">Black Flash</span>. This distortion in space multiplies the strike's power by exactly <span className="text-white font-bold">2.5</span>. Characters with high "Body" stats and martial arts proficiency have a higher chance of entering the "Zone."
                        </p>
                      </div>

                      <div className="group bg-zinc-900/30 rounded-2xl p-6 border border-zinc-800 hover:bg-zinc-900/50 transition-all">
                        <h4 className="text-zinc-200 font-bold uppercase tracking-widest text-sm mb-3 group-hover:text-blue-500 transition-colors">Binding Vows & Overtime</h4>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          Certain characters trigger secret buffs based on game state. <span className="text-blue-400 font-bold">Nanami Kento</span> triggers his "Overtime" vow after Round 3, gaining a 30% boost to CE and Output. Always read the lore descriptions for hidden mechanical hints.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section className="bg-red-950/10 border border-red-900/20 rounded-2xl p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-5 -mr-12 -mt-12 scale-150 rotate-12 pointer-events-none">
                      <Shield size={200} />
                    </div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-zinc-950 rounded border border-zinc-800 flex items-center justify-center shrink-0">
                         <Ban className="text-red-500" size={32} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white uppercase font-display leading-none">Heavenly Restriction</h3>
                        <p className="text-red-500/70 font-mono text-[10px] uppercase tracking-widest mt-2">Special Modification Protocol</p>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 relative z-10">
                      <div>
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest block mb-2">Zero Cursed Energy (Toji/Maki)</span>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          These entities cannot be targeted by domain simple barrier logic. They gain absolute immunity to "Sure-Hit" effects. However, their CE, CT, and DE slots contribute 0 value, forcing a focus on Tools and Pure Physicality.
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest block mb-2">High Output / Low Life (Mechamaru)</span>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          Born with immense range and power in exchange for a destroyed body. These builds excel in CE output but suffer massive penalties to Durability and Speed.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'synergies' && (
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center gap-3 mb-10">
                      <Zap className="text-yellow-500" />
                      <div>
                        <h3 className="text-2xl font-black text-white uppercase font-display leading-none">Known Pairings</h3>
                        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-1">Confirmed Stat-Amplification Records</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {publicSynergies.map(p => (
                        <div key={p.id} className="bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl group hover:border-yellow-900/50 transition-all">
                           <h4 className="text-white font-bold uppercase tracking-wider mb-2 font-display group-hover:text-yellow-500 transition-colors">{p.name}</h4>
                           <p className="text-zinc-500 text-[10px] uppercase mb-4 font-mono tracking-tighter leading-tight">{p.description}</p>
                           
                           <div className="flex flex-wrap gap-2 mb-4">
                              {p.entities.map(eid => {
                                const entity = characters.find(c => c.id === eid);
                                return (
                                  <span key={eid} className="px-2 py-1 bg-black/50 border border-zinc-800 rounded text-[9px] text-zinc-400 font-mono uppercase">
                                    {entity?.name || eid}
                                  </span>
                                );
                              })}
                           </div>

                           <div className="pt-4 border-t border-zinc-800/50 flex gap-4">
                              {Object.entries(p.bonusStats).map(([stat, val]) => (
                                <div key={stat} className="text-[10px] font-mono">
                                   <span className="text-zinc-600 uppercase">{statLabels[stat] || stat}:</span>
                                   <span className="text-yellow-500 ml-1">+{val}</span>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-12 bg-zinc-900/20 border border-dashed border-zinc-800 p-8 rounded-2xl text-center">
                       <HelpCircle size={32} className="text-zinc-800 mx-auto mb-4" />
                       <h4 className="text-zinc-500 font-black uppercase text-xs tracking-widest">Secret Synergies Exist</h4>
                       <p className="text-zinc-700 text-[10px] font-mono uppercase max-w-sm mx-auto mt-2">
                         Numerous undocumented pairings exist within the system archives. Experiment with character themes and lore connections to discover hidden power spikes.
                       </p>
                    </div>
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="h-full flex flex-col">
                  {/* Search Bar */}
                  <div className="relative mb-8 max-w-xl mx-auto w-full shrink-0 flex flex-col gap-4">
                    <div className="relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input 
                        type="text" 
                        placeholder="Search entities, techniques, or tools..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-3 pl-12 pr-6 text-sm focus:border-red-500 outline-none transition-all placeholder:text-zinc-600 font-mono"
                      />
                    </div>
                    <div className="flex gap-4 justify-center">
                      <select 
                        value={filterRarity} 
                        onChange={e => setFilterRarity(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs font-mono text-zinc-400 focus:border-red-500 outline-none"
                      >
                        <option value="All">All Rarities</option>
                        <option value="Calamity">Calamity</option>
                        <option value="Mythic">Mythic</option>
                        <option value="Legendary">Legendary</option>
                        <option value="Epic">Epic</option>
                        <option value="Rare">Rare</option>
                        <option value="Uncommon">Uncommon</option>
                        <option value="Common">Common</option>
                      </select>
                      <select 
                        value={sortBy} 
                        onChange={e => setSortBy(e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-xs font-mono text-zinc-400 focus:border-red-500 outline-none"
                      >
                        <option value="Default">Default Sort</option>
                        <option value="Rarity">Sort by Rarity (Calamity to Common)</option>
                        <option value="Alphabetical">Sort Alphabetical</option>
                      </select>
                    </div>
                  </div>

                  {/* Character Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                    {filteredCharacters.map(char => (
                      <div key={char.id} className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl hover:bg-zinc-900/50 transition-colors group flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-white font-bold font-display uppercase tracking-wider text-sm line-clamp-1">{char.name}</h4>
                            <span className="text-[9px] font-mono font-black text-zinc-600 uppercase tracking-widest">
                              {categoryLabels[char.category] || char.category}
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 border border-current rounded shrink-0 whitespace-nowrap ${getRarityColor(char.grade)}`}>
                            {char.grade || 'Common'}
                          </span>
                        </div>
                        
                        {char.category === 'character' && (char as any).stats ? (
                          <div className="grid grid-cols-3 gap-1.5 mt-2">
                            {Object.entries((char as any).stats).map(([stat, val]) => (
                                <div key={stat} className="bg-black/40 p-1 rounded border border-zinc-800/50">
                                  <div className="text-[7px] font-mono text-zinc-500 uppercase leading-none mb-0.5">{statLabels[stat] || stat}</div>
                                  <div className="text-[10px] font-black text-zinc-100">{val as number}</div>
                                </div>
                            ))}
                          </div>
                        ) : (char as any).statValue ? (
                          <div className="bg-red-950/10 p-2 rounded border border-red-900/30 text-center mt-2">
                            <div className="text-[7px] font-mono text-red-500 uppercase mb-0.5">Power Contribution</div>
                            <div className="text-sm font-black text-red-100">+{(char as any).statValue}</div>
                          </div>
                        ) : null}

                        {char.loreDescription && (
                          <p className="mt-4 text-[9px] text-zinc-500 font-serif leading-relaxed italic border-t border-zinc-800/50 pt-3">
                            "{char.loreDescription}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {filteredCharacters.length === 0 && (
                    <div className="text-center py-20 flex-1 flex flex-col items-center justify-center">
                      <div className="text-zinc-800 text-5xl font-black mb-4 uppercase font-display">No Access</div>
                      <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em]">Search term not found in archives.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'rarity' && (
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-20">
                   {[
                     { grade: 'Calamity', color: 'bg-indigo-600 text-indigo-400', desc: 'Beings that warp the balance of the world. Satoru Gojo, Ryomen Sukuna, Modulo Yuji, and Dabura. Stats push beyond 100, reaching the absolute ceiling of 120.' },
                     { grade: 'Mythic', color: 'bg-red-600 text-red-500', desc: 'Entities that transcend reality. The Sorcerer Killer, Open Barrier domains, and indestructible cursed objects. Stats typically range 95-120.' },
                     { grade: 'Legendary', color: 'bg-yellow-600 text-yellow-500', desc: 'Pinnacle sorcery. 10 Shadows, Rika, and Six Eyes users. Stats range 90-115.' },
                     { grade: 'Epic', color: 'bg-purple-600 text-purple-500', desc: 'First-grade essentials. High CE density, advanced Reverse Cursed Technique usage. Stats 85-108.' },
                     { grade: 'Rare', color: 'bg-blue-600 text-blue-500', desc: 'Standard sorcerers. Core techniques and reliable tools. Stats 72-96.' },
                     { grade: 'Uncommon', color: 'bg-zinc-400 text-zinc-400', desc: 'Basic sorcery and tools. Standard curriculum items. Stats 48-84.' },
                     { grade: 'Common', color: 'bg-zinc-600 text-zinc-600', desc: 'Auxiliary managers and simple tools. Minimal combat utility. Stats below 60.' }
                   ].map(r => (
                     <div key={r.grade} className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 w-24 h-24 ${r.color.split(' ')[0]} blur-[80px] opacity-10 group-hover:opacity-30 transition-opacity`} />
                        <span className={`text-[10px] font-mono font-black uppercase tracking-[0.3em] px-3 py-1 border border-current rounded mb-4 inline-block ${r.color.split(' ')[1]}`}>
                          Grade: {r.grade}
                        </span>
                        <p className="text-zinc-400 text-xs leading-relaxed">{r.desc}</p>
                     </div>
                   ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-zinc-900 bg-zinc-950 text-center shrink-0">
               <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">Version 1.5.0 Alpha Archive Access Granted</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
