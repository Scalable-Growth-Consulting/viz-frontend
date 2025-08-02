import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import MIAComingSoon from '@/pages/MIAComingSoon';

interface MIAAccessGuardProps {
  children: React.ReactNode;
}

const MIAAccessGuard: React.FC<MIAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug: Log user email and admin check
  if (process.env.NODE_ENV !== 'production') {
    console.log('[MIAAccessGuard] user:', user?.email, 'isAdmin:', hasPremiumAccess(user));
  }

  // Robust admin access check
  if (user?.email && user.email.toLowerCase() === 'creationvision03@gmail.com') {
    return <>{children}</>;
  }

  // Fallback to util-based check (future-proof)
  if (hasPremiumAccess(user)) {
    return <>{children}</>;
  }

  // Otherwise, show Coming Soon
  return <MIAComingSoon />;
};

export default MIAAccessGuard;
