import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Swords, Users, Cpu, Trophy, FileText, Github, Twitter, MessageSquare, Dices, Zap } from 'lucide-react';
import { ChangelogModal } from '../components/Changelog';

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const navigate = useNavigate();

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/play');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 relative overflow-hidden flex flex-col">
      <Helmet>
        <title>JJK Stat Clash | Build Your Ultimate Sorcerer</title>
        <meta name="description" content="Draft your ultimate Jujutsu Kaisen sorcerer. Create legendary synergies, battle against bots or friends, and see who reigns supreme in the Culling Games." />
      </Helmet>

      {/* Optimized Video Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-50 grayscale-[0.3] contrast-[1.1]"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        
        {/* Refined Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] opacity-80"></div>
        <div className="absolute inset-0 bg-[#050505]/20 backdrop-blur-[1px]"></div>
        
        {/* Subtle Cursed Energy Particles */}
        <div className="absolute inset-0 z-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] bg-red-500/30 rounded-full"
              initial={{ 
                x: Math.random() * 100 + "%", 
                y: "110%",
                opacity: 0 
              }}
              animate={{ 
                y: "-10%",
                opacity: [0, 1, 0]
              }}
              transition={{ 
                duration: 6 + Math.random() * 8, 
                repeat: Infinity, 
                delay: Math.random() * 10,
                ease: "linear"
              }}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ scale: 1.1, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[160px] font-black font-display uppercase tracking-[-0.06em] text-center leading-[0.85] mb-12 relative select-none"
        >
          <span className="relative z-10 block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            JJK STAT
          </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-950 drop-shadow-[0_0_60px_rgba(220,38,38,0.8)] relative z-10 block mt-2" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>
            CLASH
          </span>
          {/* Subtle Outer Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-600/5 blur-[120px] rounded-full -z-10"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex flex-col items-center gap-12"
        >
          <p className="text-zinc-300 font-mono tracking-[0.4em] uppercase text-[10px] md:text-xs text-center max-w-2xl mx-auto leading-relaxed bg-black/40 border border-white/5 py-4 px-10 rounded-sm backdrop-blur-md shadow-2xl">
            領域展開 • 伏魔御廚子 • 無下限呪術
          </p>

          <button 
            onClick={handleStart}
            className="group relative"
          >
            <div className="absolute -inset-4 bg-red-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="px-20 py-7 bg-zinc-950/80 border border-white/10 group-hover:border-red-500/50 text-white font-black text-2xl uppercase tracking-[0.3em] relative overflow-hidden transition-all backdrop-blur-md hover:shadow-[0_0_50px_rgba(220,38,38,0.3)] flex items-center justify-center gap-6 group-active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Swords size={32} className="group-hover:rotate-12 transition-transform duration-500 text-red-500" />
              <span className="relative z-10">Start Playing</span>
            </div>
          </button>
        </motion.div>

        {/* Feature Showcase Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-24"
        >
          {/* Online Multiplayer Card */}
          <div className="bg-zinc-900/30 border border-purple-500/10 p-8 rounded-2xl backdrop-blur-xl hover:border-purple-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full group-hover:bg-purple-600/20 transition-all"></div>
            <Users className="text-purple-500 mb-6 w-10 h-10 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <h3 className="text-xl font-black font-display uppercase tracking-wider mb-3 text-white">Online Clash</h3>
            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">Global matchmaking via PartyKit. Experience zero-latency synchronization in the ultimate sorcerer showdown.</p>
            <div className="mt-6 flex items-center gap-2 text-[8px] font-black text-purple-400 uppercase tracking-[0.2em]">Live Lobby System • Global Rank</div>
          </div>
          
          {/* Cursed Lottery Card */}
          <div className="bg-zinc-900/30 border border-yellow-500/10 p-8 rounded-2xl backdrop-blur-xl hover:border-yellow-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-600/10 blur-[50px] rounded-full group-hover:bg-yellow-600/20 transition-all"></div>
            <Dices className="text-yellow-500 mb-6 w-10 h-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform" />
            <h3 className="text-xl font-black font-display uppercase tracking-wider mb-3 text-white">Cursed Lottery</h3>
            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">A high-stakes gamble mode. Burn your rolls to secure legendary entities or fall to the RNG of the Culling Games.</p>
            <div className="mt-6 flex items-center gap-2 text-[8px] font-black text-yellow-400 uppercase tracking-[0.2em]">High Stakes • Random Draft</div>
          </div>

          {/* Simulated Combat Card */}
          <div className="bg-zinc-900/30 border border-blue-500/10 p-8 rounded-2xl backdrop-blur-xl hover:border-blue-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full group-hover:bg-blue-600/20 transition-all"></div>
            <Cpu className="text-blue-500 mb-6 w-10 h-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black font-display uppercase tracking-wider mb-3 text-white">Elite AI</h3>
            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">Hone your skills against our Special Grade AI. Three difficulty tiers designed to test even the strongest sorcerers.</p>
            <div className="mt-6 flex items-center gap-2 text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">3 Tiers • Adaptive Logic</div>
          </div>

          {/* Secret Bonds Card */}
          <div className="bg-zinc-900/30 border border-red-500/10 p-8 rounded-2xl backdrop-blur-xl hover:border-red-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 blur-[50px] rounded-full group-hover:bg-red-600/20 transition-all"></div>
            <Zap className="text-red-500 mb-6 w-10 h-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-black font-display uppercase tracking-wider mb-3 text-white">Forbidden Ties</h3>
            <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">Discover hidden character synergies. Complete legendary pairings like 'The Honored One' to unlock devastating power.</p>
            <div className="mt-6 flex items-center gap-2 text-[8px] font-black text-red-400 uppercase tracking-[0.2em]">40+ Synergies • Secret Stats</div>
          </div>
        </motion.div>

        {/* Marketing CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 w-full max-w-4xl bg-gradient-to-r from-red-950/20 via-zinc-900/50 to-red-950/20 border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_70%)] pointer-events-none"></div>
          <h2 className="text-3xl font-black font-display uppercase tracking-widest text-white mb-6">Master the Cursed Energy</h2>
          <p className="text-sm text-zinc-400 font-mono uppercase tracking-[0.2em] mb-10 max-w-2xl mx-auto">The most comprehensive stat-clash experience for Jujutsu Kaisen fans. Built by sorcerers, for sorcerers.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">100+ Entities</div>
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Deep Lore Stats</div>
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Series Win Tracking</div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full py-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.4em] mb-2">Build: Production 1.2.4</p>
            <p className="text-xs text-zinc-600 font-mono uppercase">© 2026 Jujutsu Intelligence Systems</p>
          </div>
          
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setIsChangelogOpen(true)}
              className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 border border-zinc-800 rounded-sm"
            >
              <FileText size={14} />
              Changelogs
            </button>
            <div className="flex items-center gap-4 border-l border-zinc-800 pl-8">
              <Twitter size={16} className="text-zinc-500 hover:text-white cursor-pointer transition-colors" />
              <Github size={16} className="text-zinc-500 hover:text-white cursor-pointer transition-colors" />
              <MessageSquare size={16} className="text-zinc-500 hover:text-white cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />

      {/* Domain Expansion Transition Overlay - Optimized */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Cinematic Camera Shake Layer */}
            <motion.div
              animate={{ 
                x: [0, -10, 10, -5, 5, 0],
                y: [0, 5, -5, 10, -10, 0]
              }}
              transition={{ duration: 0.2, repeat: 10 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {/* Shatter Effect (CSS Shapes) */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, opacity: 0, rotate: i * 60 }}
                  animate={{ 
                    scale: [0, 2, 4], 
                    opacity: [0, 0.8, 0],
                    x: [0, (i % 2 === 0 ? 500 : -500)],
                    y: [0, (i < 3 ? 500 : -500)]
                  }}
                  transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                  className="absolute w-64 h-64 border border-white/20 bg-white/5 backdrop-blur-sm transform"
                  style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
                />
              ))}

              {/* Optimized Slash Layer */}
              <motion.div 
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 2, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 0.4, ease: "circInOut" }}
                className="absolute w-full h-[4px] bg-white z-30 shadow-[0_0_50px_#fff]"
              />
              
              {/* Optimized GIF Layer */}
              <motion.div
                initial={{ opacity: 0, scale: 1.2 }}
                animate={{ opacity: [0, 1, 0], scale: [1.2, 1.25, 1.3] }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden"
              >
                <img 
                  src="/clash.gif" 
                  className="w-[110%] h-[110%] object-cover mix-blend-screen opacity-60 filter contrast-150 brightness-125" 
                  alt="clash" 
                  style={{ willChange: 'transform, opacity' }}
                />
              </motion.div>

              {/* Domain Expansion Text */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, filter: 'blur(10px)' }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.5, 1, 1.1, 2], filter: ['blur(10px)', 'blur(0px)', 'blur(0px)', 'blur(20px)'] }}
                transition={{ duration: 2, delay: 0.1, times: [0, 0.2, 0.8, 1] }}
                className="relative z-40 flex flex-col items-center select-none pointer-events-none"
              >
                <span className="text-8xl md:text-[220px] font-black font-display text-white tracking-[0.2em] drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]">領域</span>
                <span className="text-8xl md:text-[220px] font-black font-display text-red-600 tracking-[0.2em] drop-shadow-[0_0_50px_rgba(220,38,38,0.8)] -mt-10">展開</span>
              </motion.div>
            </motion.div>

            {/* Final Flash to White */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 2.5, times: [0, 0.85, 1] }}
              className="absolute inset-0 bg-white z-50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
