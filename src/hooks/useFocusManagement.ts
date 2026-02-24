import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Focus management hook for accessibility
 * Manages focus on route changes for screen readers
 */
export const useFocusManagement = () => {
  const location = useLocation();

  useEffect(() => {
    // Set focus to main content on route change
    const mainContent = document.querySelector('main') || document.querySelector('#root');
    
    if (mainContent instanceof HTMLElement) {
      // Make element focusable
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus({ preventScroll: false });
      
      // Announce route change to screen readers
      const routeName = location.pathname.split('/').filter(Boolean).pop() || 'home';
      const announcement = `Navigated to ${routeName.replace(/-/g, ' ')} page`;
      
      // Create live region for announcement
      const liveRegion = document.getElementById('route-announcer') || createLiveRegion();
      liveRegion.textContent = announcement;
      
      // Clear announcement after delay
      setTimeout(() => {
        liveRegion.textContent = '';
      }, 1000);
    }
  }, [location.pathname]);
};

const createLiveRegion = (): HTMLElement => {
  const liveRegion = document.createElement('div');
  liveRegion.id = 'route-announcer';
  liveRegion.setAttribute('role', 'status');
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';
  
  // Add screen reader only styles
  liveRegion.style.position = 'absolute';
  liveRegion.style.left = '-10000px';
  liveRegion.style.width = '1px';
  liveRegion.style.height = '1px';
  liveRegion.style.overflow = 'hidden';
  
  document.body.appendChild(liveRegion);
  return liveRegion;
};
