import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL } from '@/utils/adminAccess';
import MIAComingSoon from '@/pages/MIAComingSoon';

interface MIAAccessGuardProps {
  children: React.ReactNode;
}

const MIAAccessGuard: React.FC<MIAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug logging for access control
  console.log('[MIAAccessGuard] Access Check:', {
    userExists: !!user,
    userEmail: user?.email,
    isAdmin: user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    timestamp: new Date().toISOString()
  });

  // PERMANENT ACCESS: Only allow creatorvision03@gmail.com
  if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    console.log('[MIAAccessGuard] ✅ Admin access granted for', ADMIN_EMAIL);
    return <>{children}</>;
  }

  // All other users see Coming Soon page
  console.log('[MIAAccessGuard] ❌ Access denied - showing Coming Soon page');
  return <MIAComingSoon />;
};

export default MIAAccessGuard;
