import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { characters } from '../data/characters';
import { MessageSquare, Send, History, X, AlertCircle, CheckCircle2, ChevronRight, User, Copy, Globe } from 'lucide-react';
import { db } from '../utils/firebase';
import { collection, addDoc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';

interface FeedbackEntry {
  id: string;
  characterId: string;
  characterName: string;
  stat: string;
  proposedValue: number;
  argument: string;
  timestamp: string;
}

export function FeedbackSystem() {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'form' | 'vault'>('form');
  const [entries, setEntries] = useState<FeedbackEntry[]>([]);
  
  const [formData, setFormData] = useState({
    characterId: '',
    stat: 'strength',
    proposedValue: 50,
    argument: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  useEffect(() => {
    // Real-time synchronization with Firestore
    const q = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const globalEntries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp instanceof Timestamp ? doc.data().timestamp.toDate().toISOString() : doc.data().timestamp
      })) as FeedbackEntry[];
      setEntries(globalEntries);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.characterId || !formData.argument) return;

    setStatus('submitting');
    
    try {
      const char = characters.find(c => c.id === formData.characterId);
      const newEntry = {
        characterId: formData.characterId,
        characterName: char?.name || 'Unknown',
        stat: formData.stat,
        proposedValue: formData.proposedValue,
        argument: formData.argument,
        timestamp: Timestamp.now()
      };

      await addDoc(collection(db, 'feedback'), newEntry);

      setStatus('success');
      setFormData({ characterId: '', stat: 'strength', proposedValue: 50, argument: '' });
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      setStatus('idle');
      alert("Transmission failed. The barrier is too thick.");
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-[60] w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.4)] border-2 border-white/20 transition-colors"
      >
        <MessageSquare size={28} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-zinc-800 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center border border-blue-500/30">
                    <AlertCircle className="text-blue-500" size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Balance Protocol</h2>
                    <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Recommend Stat Adjustments</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setView(view === 'form' ? 'vault' : 'form')}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                    title={view === 'form' ? 'View History' : 'New Suggestion'}
                  >
                    {view === 'form' ? <History size={20} /> : <MessageSquare size={20} />}
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {view === 'form' ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Subject Entity</label>
                      <select 
                        required
                        value={formData.characterId}
                        onChange={e => setFormData({...formData, characterId: e.target.value})}
                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Character...</option>
                        {characters.filter(c => c.category === 'character').map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Stat Metric</label>
                        <select 
                          value={formData.stat}
                          onChange={e => setFormData({...formData, stat: e.target.value})}
                          className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="strength">Strength</option>
                          <option value="speed">Speed</option>
                          <option value="durability">Durability</option>
                          <option value="ce">Cursed Energy</option>
                          <option value="ct">Cursed Technique</option>
                          <option value="domainExpansion">Domain</option>
                          <option value="iq">IQ</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Proposed value ({formData.proposedValue})</label>
                        <input 
                          type="range"
                          min="0"
                          max="300"
                          value={formData.proposedValue}
                          onChange={e => setFormData({...formData, proposedValue: parseInt(e.target.value)})}
                          className="w-full h-12 accent-blue-500 cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Combat Rationale (Argument)</label>
                      <textarea 
                        required
                        placeholder="Explain why this adjustment is necessary for game balance..."
                        value={formData.argument}
                        onChange={e => setFormData({...formData, argument: e.target.value})}
                        className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white focus:border-blue-500 outline-none transition-all min-h-[120px] resize-none"
                      />
                    </div>

                    <button 
                      type="submit"
                      disabled={status !== 'idle'}
                      className={`w-full py-4 rounded-xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all ${
                        status === 'success' ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20'
                      }`}
                    >
                      {status === 'idle' && <><Send size={18} /> Submit Transmission</>}
                      {status === 'submitting' && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                      {status === 'success' && <><CheckCircle2 size={18} /> Transmission Received</>}
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    {entries.length === 0 ? (
                      <div className="text-center py-20">
                        <MessageSquare className="mx-auto text-zinc-800 mb-4" size={48} />
                        <p className="text-zinc-600 font-mono text-xs uppercase tracking-widest">Vault is empty</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex gap-2 mb-6">
                          <button 
                            onClick={() => {
                              const text = JSON.stringify(entries, null, 2);
                              navigator.clipboard.writeText(text);
                              alert('Feedback data copied to clipboard! Send this to the developer.');
                            }}
                            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-zinc-700"
                          >
                            <Copy size={14} /> Copy All Data
                          </button>
                          <a 
                            href={`mailto:pmsma99@gmail.com?subject=JJK Stat Clash - Character Balance Suggestions&body=${encodeURIComponent("Here are my character balance suggestions:\n\n" + JSON.stringify(entries, null, 2))}`}
                            className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-xl font-mono text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-blue-500/30"
                          >
                            <Send size={14} /> Email Dev
                          </a>
                        </div>
                        {entries.map(entry => (
                          <div key={entry.id} className="bg-black/40 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all group">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <span className="font-display font-black text-white uppercase text-sm">{entry.characterName}</span>
                                <ChevronRight size={14} className="text-zinc-700" />
                                <span className="text-blue-400 font-mono text-[10px] font-bold uppercase">{entry.stat} → {entry.proposedValue}</span>
                              </div>
                              <span className="text-[9px] font-mono text-zinc-600 uppercase">{new Date(entry.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-zinc-400 text-xs italic line-clamp-3 group-hover:line-clamp-none transition-all cursor-default">
                              "{entry.argument}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Footer Information */}
              <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Globe size={12} className="text-blue-500 animate-pulse" />
                  <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Global Sync Active</span>
                </div>
                <div className="flex items-center gap-4">
                   <span className="text-[9px] font-mono text-zinc-700 uppercase">{entries.length} Total Transmissions</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
