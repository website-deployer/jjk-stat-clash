import { motion } from 'motion/react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({ message = 'Loading...', fullScreen = false }: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-10 h-10 border-2 border-red-500/30 border-t-red-500 rounded-full"
      />
      <p className="text-zinc-500 text-sm font-mono uppercase tracking-widest">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
