import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, duration = 3000) => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => removeToast(id), duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

const toastConfig: Record<
  ToastType,
  { bg: string; border: string; icon: React.ReactNode; textColor: string }
> = {
  success: {
    bg: 'bg-green-900/30',
    border: 'border-green-700/50',
    icon: <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />,
    textColor: 'text-green-200',
  },
  error: {
    bg: 'bg-red-900/30',
    border: 'border-red-700/50',
    icon: <AlertCircle size={18} className="text-red-500 flex-shrink-0" />,
    textColor: 'text-red-200',
  },
  warning: {
    bg: 'bg-yellow-900/30',
    border: 'border-yellow-700/50',
    icon: <AlertTriangle size={18} className="text-yellow-500 flex-shrink-0" />,
    textColor: 'text-yellow-200',
  },
  info: {
    bg: 'bg-blue-900/30',
    border: 'border-blue-700/50',
    icon: <Info size={18} className="text-blue-500 flex-shrink-0" />,
    textColor: 'text-blue-200',
  },
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastMessage key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastMessage: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const config = toastConfig[toast.type];

  return (
    <motion.div
      initial={{ opacity: 0, x: 400, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 400, scale: 0.9 }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      className={`${config.bg} border ${config.border} rounded-lg p-4 mb-2 max-w-sm backdrop-blur-sm shadow-lg pointer-events-auto`}
    >
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${config.textColor} leading-relaxed break-words`}>
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onRemove(toast.id)}
          className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 ml-2"
        >
          <X size={16} />
        </button>
      </div>
    </motion.div>
  );
};
