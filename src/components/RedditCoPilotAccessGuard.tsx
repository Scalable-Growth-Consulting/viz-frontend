import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import RedditCoPilotComingSoon from '@/pages/RedditCoPilot/RedditCoPilotComingSoon';

interface RedditCoPilotAccessGuardProps {
  children: React.ReactNode;
}

const RedditCoPilotAccessGuard: React.FC<RedditCoPilotAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug logging for access control
  const access = {
    userExists: !!user,
    userEmail: user?.email,
    hasPremiumAccess: hasPremiumAccess(user),
    timestamp: new Date().toISOString()
  };
  console.log('[RedditCoPilotAccessGuard] Access Check:', access);

  if (!hasPremiumAccess(user)) {
    console.log('[RedditCoPilotAccessGuard] ❌ Access denied - showing Coming Soon');
    return <RedditCoPilotComingSoon />;
  }

  console.log('[RedditCoPilotAccessGuard] ✅ Premium access granted for', user?.email);
  return <>{children}</>;
};

export default RedditCoPilotAccessGuard;
