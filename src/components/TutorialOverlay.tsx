import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronRight, ChevronLeft, Ban, Swords, Zap, HelpCircle } from 'lucide-react';

interface TutorialOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  currentPhase: 'start' | 'gambleConfig' | 'banning' | 'drafting' | 'comparing' | 'transitioning';
}

type TutorialStep = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

const tutorialSteps: TutorialStep[] = [
  {
    id: 'banning',
    title: 'Ban Phase',
    description: 'Each player bans 2 entities from the global pool. These entities cannot be drafted by anyone. Use this strategically to remove powerful synergies from your opponents.',
    icon: <Ban size={32} />
  },
  {
    id: 'drafting',
    title: 'Draft Phase',
    description: 'Fill 11 slots: Character stats (Strength, Speed, Durability, CE, Body, IQ), Cursed Technique, Tool, Shikigami, Domain Expansion, and 2 Special Powers. Look for synergies between entities to maximize your power.',
    icon: <Swords size={32} />
  },
  {
    id: 'comparing',
    title: 'Clash Phase',
    description: 'Stats are compared head-to-head with synergy bonuses, Black Flash crits (2.5× multiplier), Binding Vow modifiers, and Heavenly Restriction interactions. The player with the most stat wins takes the round!',
    icon: <Zap size={32} />
  }
];

export function TutorialOverlay({ isOpen, onClose, currentPhase }: TutorialOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem('jjk-tutorial-seen');
    setHasSeenTutorial(!!seen);
  }, []);

  const handleNext = () => {
    if (currentStepIndex < tutorialSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('jjk-tutorial-seen', 'true');
    setHasSeenTutorial(true);
    onClose();
  };

  const handleSkip = () => {
    localStorage.setItem('jjk-tutorial-seen', 'true');
    setHasSeenTutorial(true);
    onClose();
  };

  if (!isOpen) return null;

  const currentStep = tutorialSteps[currentStepIndex];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-[#0a0a0a] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-800 bg-[#050505] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <HelpCircle className="text-red-500" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black font-display text-white uppercase tracking-tight">Tutorial</h2>
                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">
                  Step {currentStepIndex + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleSkip}
              className="text-zinc-500 hover:text-white transition-colors text-[10px] font-mono uppercase tracking-widest"
            >
              Skip
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800">
                {currentStep.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black font-display text-white uppercase tracking-tight mb-3">
                  {currentStep.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="px-8 pb-4">
            <div className="flex gap-2">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-all ${
                    index === currentStepIndex ? 'bg-red-500' : 'bg-zinc-800'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800 bg-[#050505] flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentStepIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-mono text-xs uppercase tracking-widest"
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-all font-mono text-xs uppercase tracking-widest font-bold"
            >
              {currentStepIndex === tutorialSteps.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
