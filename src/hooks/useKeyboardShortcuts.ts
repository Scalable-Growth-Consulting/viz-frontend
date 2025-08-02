import { useEffect, useCallback } from 'react';

interface KeyboardShortcutsConfig {
  onNext?: () => void;
  onPrevious?: () => void;
  onEscape?: () => void;
  onEnter?: () => void;
  disabled?: boolean;
}

export const useKeyboardShortcuts = (config: KeyboardShortcutsConfig) => {
  const {
    onNext,
    onPrevious,
    onEscape,
    onEnter,
    disabled = false,
  } = config;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts if disabled or if user is typing in an input
    if (disabled) return;
    
    const target = event.target as HTMLElement;
    const isInputFocused = target.tagName === 'INPUT' || 
                          target.tagName === 'TEXTAREA' || 
                          target.contentEditable === 'true';
    
    if (isInputFocused) return;

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        onNext?.();
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onPrevious?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
      case 'Enter':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          onEnter?.();
        }
        break;
    }
  }, [onNext, onPrevious, onEscape, onEnter, disabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return {
    // Helper function to show keyboard shortcuts to users
    getShortcutText: () => ({
      next: '→',
      previous: '←',
      escape: 'Esc',
      enter: 'Ctrl+Enter',
    }),
  };
};
