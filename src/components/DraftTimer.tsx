import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Timer, Pause, Play } from 'lucide-react';

interface DraftTimerProps {
  isActive: boolean;
  duration: number;
  onTimeUp: () => void;
  onToggle?: () => void;
}

export function DraftTimer({ isActive, duration, onTimeUp }: DraftTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasFired = useRef(false);

  useEffect(() => {
    setTimeLeft(duration);
    hasFired.current = false;
  }, [duration, isActive]);

  useEffect(() => {
    if (!isActive || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          if (!hasFired.current) {
            hasFired.current = true;
            onTimeUp();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, isPaused, onTimeUp]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const isUrgent = timeLeft <= 10;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-sm transition-colors ${
        isUrgent ? 'bg-red-950/40 border-red-800/50 text-red-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-300'
      }`}>
        {isUrgent ? (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Timer size={14} className="text-red-400" />
          </motion.div>
        ) : (
          <Clock size={14} className="text-zinc-500" />
        )}
        <span className={`font-bold tabular-nums ${isUrgent ? 'text-red-400' : ''}`}>
          {minutes}:{seconds.toString().padStart(2, '0')}
        </span>
      </div>
      <button
        onClick={() => setIsPaused(!isPaused)}
        className="p-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-colors"
        title={isPaused ? 'Resume' : 'Pause'}
      >
        {isPaused ? <Play size={12} /> : <Pause size={12} />}
      </button>
    </div>
  );
}
