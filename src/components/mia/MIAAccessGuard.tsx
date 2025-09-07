import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL, hasPremiumAccess } from '@/utils/adminAccess';
import MIARegularUser from '@/modules/MIA/components/MIARegularUser';

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

  // Regular users see the Meta and Google integration page
  console.log('[MIAAccessGuard] ✅ Regular user access - showing Meta and Google integration');
  return <MIARegularUser />;
};

export default MIAAccessGuard;
