import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL, hasPremiumAccess } from '@/utils/adminAccess';
import MIAComingSoon from '@/pages/MIAComingSoon';

interface MIAAccessGuardProps {
  children: React.ReactNode;
}

const MIAAccessGuard: React.FC<MIAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug logging for access control
  const access = {
    userExists: !!user,
    userEmail: user?.email,
    hasPremiumAccess: hasPremiumAccess(user),
    timestamp: new Date().toISOString()
  };
  console.log('[MIAAccessGuard] Access Check:', access);

  if (hasPremiumAccess(user)) {
    console.log('[MIAAccessGuard] ✅ Premium access granted for', user?.email);
    return <>{children}</>;
  }

  // Non-qualified users see the MIA Coming Soon page
  console.log('[MIAAccessGuard] ✅ Non-qualified user access - showing MIA Coming Soon page');
  return <MIAComingSoon showHeader={false} />;
};

export default MIAAccessGuard;
