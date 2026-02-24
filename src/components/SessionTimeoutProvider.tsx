import React from 'react';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

/**
 * Session Timeout Provider
 * Wraps the app to enable automatic session timeout
 */
export const SessionTimeoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useSessionTimeout();
  return <>{children}</>;
};
