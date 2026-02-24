import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { AgentAccess } from '@/shared/types/agent';

interface AccessGuardProps {
  children: React.ReactNode;
  requiredAccess: AgentAccess;
  fallback?: React.ReactNode;
}

export const AccessGuard: React.FC<AccessGuardProps> = ({ 
  children, 
  requiredAccess,
  fallback 
}) => {
  const { user } = useAuth();
  
  if (requiredAccess === 'public') {
    return <>{children}</>;
  }
  
  const hasPremiumAccess = user?.user_metadata?.premium === true;
  
  if (requiredAccess === 'premium' && !hasPremiumAccess) {
    return fallback ? <>{fallback}</> : null;
  }
  
  return <>{children}</>;
};
