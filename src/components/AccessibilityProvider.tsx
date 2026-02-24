import React, { useEffect } from 'react';
import { useFocusManagement } from '@/hooks/useFocusManagement';

/**
 * Accessibility Provider
 * Enables keyboard navigation and focus management
 */
export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useFocusManagement();

  useEffect(() => {
    // Add skip to main content link
    const skipLink = document.getElementById('skip-to-main');
    if (!skipLink) {
      const link = document.createElement('a');
      link.id = 'skip-to-main';
      link.href = '#main-content';
      link.textContent = 'Skip to main content';
      link.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-viz-accent focus:text-white focus:rounded-lg focus:shadow-lg';
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const main = document.querySelector('main') || document.querySelector('#main-content');
        if (main instanceof HTMLElement) {
          main.setAttribute('tabindex', '-1');
          main.focus();
        }
      });
      document.body.insertBefore(link, document.body.firstChild);
    }

    // Keyboard shortcuts
    const handleKeyboard = (e: KeyboardEvent) => {
      // Alt + H: Go to home
      if (e.altKey && e.key === 'h') {
        e.preventDefault();
        window.location.href = '/';
      }
      
      // Alt + /: Focus search (if exists)
      if (e.altKey && e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement;
        searchInput?.focus();
      }
      
      // Escape: Close modals/dialogs
      if (e.key === 'Escape') {
        const closeButtons = document.querySelectorAll('[data-dialog-close], [aria-label="Close"]');
        if (closeButtons.length > 0) {
          (closeButtons[closeButtons.length - 1] as HTMLElement)?.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    return () => {
      document.removeEventListener('keydown', handleKeyboard);
    };
  }, []);

  return <>{children}</>;
};
