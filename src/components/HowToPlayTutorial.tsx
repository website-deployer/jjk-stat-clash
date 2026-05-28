import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Swords, Ban, Target, Zap, CheckCircle, Book, Users, Cpu, Globe, Dices, Shield, Brain, Trophy, ChevronRight } from 'lucide-react';

interface HowToPlayTutorialProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'overview', label: 'Overview', icon: Book },
  { id: 'phases', label: 'Game Phases', icon: Swords },
  { id: 'drafting', label: 'Draft System', icon: Target },
  { id: 'synergies', label: 'Synergies', icon: Zap },
  { id: 'gamble', label: 'Gambling Mode', icon: Dices },
  { id: 'modes', label: 'Game Modes', icon: Users },
  { id: 'tips', label: 'Tips & Strategy', icon: Trophy },
] as const;

type TabId = typeof TABS[number]['id'];

export const HowToPlayTutorial: React.FC<HowToPlayTutorialProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className="relative w-full max-w-4xl h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,1)]"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center text-red-500">
                  <Swords size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black font-display uppercase tracking-widest text-white leading-none">How to Play</h2>
                  <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Complete Sorcerer's Guide</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex bg-zinc-950 border-b border-zinc-900 px-4 overflow-x-auto no-scrollbar shrink-0">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] transition-all relative whitespace-nowrap ${
                    activeTab === tab.id ? 'text-red-500' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div layoutId="htpTab" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {activeTab === 'overview' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-gradient-to-br from-red-950/30 to-zinc-900/50 rounded-2xl p-8 border border-red-900/20 text-center">
                    <Swords className="mx-auto text-red-500 mb-4" size={48} />
                    <h3 className="text-3xl font-black font-display text-white uppercase tracking-tight mb-4">What is JJK Stat Clash?</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl mx-auto">
                      A competitive drafting game set in the Jujutsu Kaisen universe. You build a sorcerer by selecting characters, techniques, and abilities across 11 stat slots, then clash against opponents in head-to-head stat comparisons.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 text-center hover:border-red-900/30 transition-all">
                      <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ban className="text-red-500" size={24} />
                      </div>
                      <h4 className="text-white font-display font-bold uppercase text-sm mb-2">1. Ban</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">Remove 2 entities from the pool to weaken opponents and protect your strategy</p>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 text-center hover:border-red-900/30 transition-all">
                      <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Target className="text-red-500" size={24} />
                      </div>
                      <h4 className="text-white font-display font-bold uppercase text-sm mb-2">2. Draft</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">Fill 11 slots with characters, cursed techniques, tools, domains, and more</p>
                    </div>
                    <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-6 text-center hover:border-red-900/30 transition-all">
                      <div className="w-12 h-12 bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Swords className="text-red-500" size={24} />
                      </div>
                      <h4 className="text-white font-display font-bold uppercase text-sm mb-2">3. Clash</h4>
                      <p className="text-zinc-500 text-xs leading-relaxed">Compare stats head-to-head — win more categories to claim victory</p>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <h4 className="text-white font-bold uppercase text-sm mb-3 flex items-center gap-2">
                      <CheckCircle className="text-green-500" size={16} />
                      Goal
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Out-draft your opponent by building a balanced sorcerer with strong synergies. The player who wins the most stat categories during the Clash phase wins the match. Best of 3 rounds determines the overall victor.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'phases' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center">
                        <Ban className="text-red-500" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black font-display text-white uppercase">Ban Phase</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Phase 01</p>
                      </div>
                    </div>
                    <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800 space-y-4">
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Each player selects <strong className="text-white">2 entities</strong> to remove from the global pool. This is your chance to weaken your opponent by banning powerful characters or key synergy components.
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-zinc-400 text-xs">
                          <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={14} />
                          <span>Bans apply globally — neither player can draft a banned entity</span>
                        </li>
                        <li className="flex items-start gap-3 text-zinc-400 text-xs">
                          <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={14} />
                          <span>Strategically target high-tier characters (Gojo, Sukuna) or key synergy pieces</span>
                        </li>
                        <li className="flex items-start gap-3 text-zinc-400 text-xs">
                          <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={14} />
                          <span>In Custom Rules, ban count can be adjusted to 1–3 per player</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center">
                        <Target className="text-red-500" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black font-display text-white uppercase">Draft Phase</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Phase 02</p>
                      </div>
                    </div>
                    <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800 space-y-4">
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Fill <strong className="text-white">11 slots</strong> with characters, techniques, tools, and abilities. Your choices determine your stat values across 8 combat categories.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-800/50 p-3 rounded-lg">
                          <span className="text-red-400 text-xs font-bold uppercase block mb-1">Physical Stats</span>
                          <span className="text-zinc-500 text-[10px]">Strength, Speed, Durability, Body</span>
                        </div>
                        <div className="bg-zinc-800/50 p-3 rounded-lg">
                          <span className="text-purple-400 text-xs font-bold uppercase block mb-1">Cursed Stats</span>
                          <span className="text-zinc-500 text-[10px]">CE, Battle IQ, CT, Domain Expansion</span>
                        </div>
                      </div>
                      <ul className="space-y-2 text-zinc-400 text-xs">
                        <li className="flex items-start gap-2">
                          <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={12} />
                          <span>Players alternate picks — each selection is permanent</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={12} />
                          <span>Some abilities have <strong className="text-red-400">Prerequisites</strong> (e.g., Limitless requires Six Eyes)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={12} />
                          <span>Binding Vows provide high-risk, high-reward stat modifications</span>
                        </li>
                      </ul>
                    </div>
                  </section>

                  <section>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-lg bg-red-950/50 border border-red-900/50 flex items-center justify-center">
                        <Swords className="text-red-500" size={20} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black font-display text-white uppercase">Clash Phase</h3>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Phase 03</p>
                      </div>
                    </div>
                    <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800 space-y-4">
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Compare your stats head-to-head with your opponent. The player with higher stats wins each category. Win more categories to win the round!
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-zinc-800/40 p-4 rounded-lg border border-zinc-700">
                          <h5 className="text-white text-xs font-bold uppercase mb-2">Round Scoring</h5>
                          <p className="text-zinc-400 text-[11px]">Win 5+ of 8 stat categories to claim the round. First to 2 round wins takes the match.</p>
                        </div>
                        <div className="bg-zinc-800/40 p-4 rounded-lg border border-zinc-700">
                          <h5 className="text-white text-xs font-bold uppercase mb-2">Domain Refinement</h5>
                          <p className="text-zinc-400 text-[11px]">When two Domains clash, higher IQ + CE = refined barrier. Grants sure-hit advantage.</p>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {activeTab === 'drafting' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-black font-display text-white uppercase mb-4">11 Slot Breakdown</h3>
                    <p className="text-zinc-400 text-sm mb-6">
                      Your draft sheet has 11 slots, each contributing to different stats. Understanding what each slot does is key to building a balanced sorcerer.
                    </p>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        { label: 'Character', desc: 'Your main sorcerer. Determines base stats and available synergies.', color: 'text-red-400' },
                        { label: 'Strength', desc: 'Raw physical power. Affects melee damage output.', color: 'text-red-400' },
                        { label: 'Speed', desc: 'Movement and reflexes. Determines attack initiative.', color: 'text-red-400' },
                        { label: 'Durability', desc: 'Defense and staying power. Determines damage absorption.', color: 'text-red-400' },
                        { label: 'Body', desc: 'Physical mastery. Increases Black Flash critical chance.', color: 'text-red-400' },
                        { label: 'Cursed Energy', desc: 'Energy reserves. Powers techniques and domain refinement.', color: 'text-purple-400' },
                        { label: 'Battle IQ', desc: 'Tactical intelligence. Affects domain clash outcomes.', color: 'text-purple-400' },
                        { label: 'Cursed Technique', desc: 'Your innate special ability selection.', color: 'text-purple-400' },
                        { label: 'Tool', desc: 'Cursed tools inventory. Adds bonus stats and effects.', color: 'text-blue-400' },
                        { label: 'Shikigami', desc: 'Summoned familiars. Provide tactical support.', color: 'text-green-400' },
                        { label: 'Domain Expansion', desc: 'Ultimate technique. Sure-hit effect on activation.', color: 'text-yellow-400' },
                      ].map(slot => (
                        <div key={slot.label} className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-3">
                          <span className={`text-xs font-bold uppercase block mb-1 ${slot.color}`}>{slot.label}</span>
                          <span className="text-zinc-500 text-[10px] leading-relaxed">{slot.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <h4 className="text-white font-bold uppercase text-sm mb-3 flex items-center gap-2">
                      <Shield className="text-red-500" size={16} />
                      Prerequisites
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed mb-3">
                      Some abilities require specific other entities to function. For example:
                    </p>
                    <ul className="space-y-2 text-zinc-400 text-xs">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-yellow-500 shrink-0 mt-0.5" size={12} />
                        <span><strong className="text-white">Limitless</strong> requires <strong className="text-white">Six Eyes</strong> — without it, Limitless provides no benefit</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-yellow-500 shrink-0 mt-0.5" size={12} />
                        <span><strong className="text-white">Sukuna's Fingers</strong> require a vessel (Yuji, Sukuna, Megumi, or a curse-user)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="text-yellow-500 shrink-0 mt-0.5" size={12} />
                        <span>If a prerequisite is not met, the slot is automatically invalidated</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'synergies' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-gradient-to-br from-yellow-950/20 to-zinc-900/40 rounded-2xl p-8 border border-yellow-900/20">
                    <Zap className="text-yellow-500 mb-4" size={36} />
                    <h3 className="text-2xl font-black font-display text-white uppercase mb-3">How Synergies Work</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Synergies are special combinations of entities that grant massive bonus stats when paired together. 
                      Building around synergies is the most effective path to victory.
                    </p>
                  </div>

                  <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800">
                    <h4 className="text-white font-bold uppercase text-sm mb-4">Key Rules</h4>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-950/30 border border-yellow-900/30 flex items-center justify-center shrink-0">
                          <span className="text-yellow-500 font-bold text-sm">1</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 text-sm font-bold">Pair Entities from the Same Lore Lineage</p>
                          <p className="text-zinc-500 text-xs mt-1">Gojo + Six Eyes, Sukuna + Megumi, Yuji + Todo — characters connected by lore grant synergy bonuses.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-950/30 border border-yellow-900/30 flex items-center justify-center shrink-0">
                          <span className="text-yellow-500 font-bold text-sm">2</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 text-sm font-bold">Both Entities Must Be in Your Draft</p>
                          <p className="text-zinc-500 text-xs mt-1">Having only half a pair provides no bonus. You must draft both entities to activate the synergy.</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-yellow-950/30 border border-yellow-900/30 flex items-center justify-center shrink-0">
                          <span className="text-yellow-500 font-bold text-sm">3</span>
                        </div>
                        <div>
                          <p className="text-zinc-300 text-sm font-bold">Bonuses Stack</p>
                          <p className="text-zinc-500 text-xs mt-1">Multiple synergies can activate simultaneously, creating massive stat spikes. Some synergies even chain into others.</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <h4 className="text-white font-bold uppercase text-sm mb-3 flex items-center gap-2">
                      <Brain className="text-purple-400" size={16} />
                      Secret Synergies
                    </h4>
                    <p className="text-zinc-400 text-xs leading-relaxed">
                      Not all pairings are documented. Experiment with thematic combinations to discover hidden synergies. 
                      If a combination makes narrative sense (e.g., Mechamaru + Ultimate Mechamaru, or Kenjaku + Geto's Body), 
                      there may be a secret stat bonus waiting to be discovered.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'gamble' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-gradient-to-br from-green-950/20 to-zinc-900/40 rounded-2xl p-8 border border-green-900/20">
                    <Dices className="text-green-500 mb-4" size={36} />
                    <h3 className="text-2xl font-black font-display text-white uppercase mb-3">Gambling Mode</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      An alternative drafting mode where you use limited rolls to generate random stats instead of picking entities directly.
                      High risk, high reward — for those who trust their luck.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800">
                      <h4 className="text-white font-bold uppercase text-sm mb-3">How It Works</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-zinc-400 text-xs">
                          <ChevronRight className="text-green-500 shrink-0 mt-0.5" size={12} />
                          <span>Configure total rolls, lucky rolls, and rolls per stat before starting</span>
                        </li>
                        <li className="flex items-start gap-2 text-zinc-400 text-xs">
                          <ChevronRight className="text-green-500 shrink-0 mt-0.5" size={12} />
                          <span>Each stat slot can be rolled multiple times — higher rolls replace lower ones</span>
                        </li>
                        <li className="flex items-start gap-2 text-zinc-400 text-xs">
                          <ChevronRight className="text-green-500 shrink-0 mt-0.5" size={12} />
                          <span>Lucky rolls have dramatically better odds for high stat values</span>
                        </li>
                      </ul>
                    </div>
                    <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800">
                      <h4 className="text-white font-bold uppercase text-sm mb-3">Strategy Tips</h4>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-2 text-zinc-400 text-xs">
                          <ChevronRight className="text-green-500 shrink-0 mt-0.5" size={12} />
                          <span>Save lucky rolls for your most important stats</span>
                        </li>
                        <li className="flex items-start gap-2 text-zinc-400 text-xs">
                          <ChevronRight className="text-green-500 shrink-0 mt-0.5" size={12} />
                          <span>Distribute rolls across all 11 slots — don't over-invest in one</span>
                        </li>
                        <li className="flex items-start gap-2 text-zinc-400 text-xs">
                          <ChevronRight className="text-green-500 shrink-0 mt-0.5" size={12} />
                          <span>Gambling mode skips entity selection — synergy planning is different</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'modes' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-zinc-900/40 rounded-xl p-6 border border-zinc-800">
                    <h3 className="text-lg font-black font-display text-white uppercase mb-6">Choose Your Mode</h3>
                    <div className="grid gap-4">
                      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <Users className="text-blue-500" size={20} />
                          <h4 className="text-white font-display font-bold uppercase text-sm">Local Multiplayer (Hot Seat)</h4>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          2–8 players take turns on the same device. Pass the device between turns. Perfect for in-person games with friends. Includes optional draft timer and custom rules.
                        </p>
                      </div>
                      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:border-red-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <Cpu className="text-red-500" size={20} />
                          <h4 className="text-white font-display font-bold uppercase text-sm">Bot (Single Player)</h4>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          Play against AI opponents in 3 difficulty levels: Easy (random picks), Medium (balanced), and Hard (optimized drafting with synergy pursuit). Great for practice.
                        </p>
                      </div>
                      <div className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5 hover:border-purple-500/30 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                          <Globe className="text-purple-500" size={20} />
                          <h4 className="text-white font-display font-bold uppercase text-sm">Online Multiplayer</h4>
                        </div>
                        <p className="text-zinc-500 text-xs leading-relaxed">
                          Real-time matches over the internet. Share a room code with friends. Includes 30-second draft timer, live ban sync, and automatic clash resolution.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'tips' && (
                <div className="max-w-3xl mx-auto space-y-8">
                  <div className="bg-gradient-to-br from-red-950/20 to-zinc-900/40 rounded-2xl p-8 border border-red-900/20">
                    <Trophy className="text-yellow-500 mb-4" size={36} />
                    <h3 className="text-2xl font-black font-display text-white uppercase mb-3">Pro Strategies</h3>
                    <p className="text-zinc-400 text-sm">Master these techniques to dominate your opponents.</p>
                  </div>

                  <div className="space-y-4">
                    {[
                      { title: 'Ban Key Synergy Pieces', desc: 'Identify the most popular synergy combos and ban one component. Without Gojo, Six Eyes is useless. Without Megumi, 10 Shadows won\'t activate.', icon: Ban },
                      { title: 'Build Around Your Character', desc: 'Your character choice determines your base stats. Pick a character that aligns with your planned build — don\'t force a technique-heavy build on a physical brawler.', icon: Target },
                      { title: 'Balance Physical & Cursed Stats', desc: 'A glass cannon with 150 Strength but 10 Durability loses to an all-rounder. Spread your picks across both physical and cursed categories.', icon: Shield },
                      { title: 'Watch for Prerequisites', desc: 'Always check if your key abilities have prerequisites. A Limitless technique without Six Eyes is a wasted slot. Plan your picks in order.', icon: Brain },
                      { title: 'Use Binding Vows Wisely', desc: 'Binding Vows are game-changers. Life Gamble (1 HP, 2x STR/SPD) is devastating if you\'re ahead. Soul Binding sacrifices IQ for massive CE.', icon: Zap },
                      { title: 'Exploit Secret Synergies', desc: 'Experiment with lore-accurate combinations. Many undocumented synergies exist — discover them for an edge over opponents who only use public pairings.', icon: Book },
                    ].map(tip => (
                      <div key={tip.title} className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 hover:border-red-900/30 transition-all group">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-lg bg-red-950/20 border border-red-900/20 flex items-center justify-center shrink-0 group-hover:bg-red-950/40 transition-colors">
                            <tip.icon className="text-red-500" size={18} />
                          </div>
                          <div>
                            <h4 className="text-white font-bold uppercase text-sm mb-1">{tip.title}</h4>
                            <p className="text-zinc-500 text-xs leading-relaxed">{tip.desc}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-zinc-900/20 border border-zinc-800 rounded-xl p-6 text-center">
                    <p className="text-zinc-500 text-xs italic">
                      "The strongest sorcerer isn't the one with the highest stats — it's the one who builds the smartest."
                    </p>
                  </div>
                </div>
              )}
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
