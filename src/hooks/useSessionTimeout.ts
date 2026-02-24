import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/utils/security';

/**
 * Session timeout hook
 * Automatically logs out user after inactivity
 */
export const useSessionTimeout = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (warningRef.current) {
      clearTimeout(warningRef.current);
      warningRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(async () => {
    clearTimers();
    await signOut();
    toast({
      title: 'Session Expired',
      description: 'You have been logged out due to inactivity.',
      variant: 'destructive',
    });
  }, [signOut, toast, clearTimers]);

  const showWarning = useCallback(() => {
    toast({
      title: 'Session Expiring Soon',
      description: 'Your session will expire in 2 minutes due to inactivity. Move your mouse or press a key to stay logged in.',
      duration: 10000,
    });
  }, [toast]);

  const resetTimer = useCallback(() => {
    if (!user) return;

    lastActivityRef.current = Date.now();
    clearTimers();

    // Set warning timer (13 minutes)
    warningRef.current = setTimeout(() => {
      showWarning();
    }, SESSION_WARNING_MS);

    // Set logout timer (15 minutes)
    timeoutRef.current = setTimeout(() => {
      handleLogout();
    }, SESSION_TIMEOUT_MS);
  }, [user, clearTimers, showWarning, handleLogout]);

  useEffect(() => {
    if (!user) {
      clearTimers();
      return;
    }

    // Activity events to track
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    // Throttle reset to avoid excessive calls
    let throttleTimeout: NodeJS.Timeout | null = null;
    const throttledReset = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          resetTimer();
          throttleTimeout = null;
        }, 1000); // Throttle to once per second
      }
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, throttledReset);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, throttledReset);
      });
      clearTimers();
      if (throttleTimeout) {
        clearTimeout(throttleTimeout);
      }
    };
  }, [user, resetTimer, clearTimers]);

  return {
    lastActivity: lastActivityRef.current,
    resetTimer,
  };
};
