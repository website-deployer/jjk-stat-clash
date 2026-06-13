import { useEffect } from 'react';

export function useEscapeKeyClose(onClose: () => void, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, isEnabled]);
}
