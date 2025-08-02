import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import MIAComingSoon from '@/pages/MIAComingSoon';

interface MIAAccessGuardProps {
  children: React.ReactNode;
}

const MIAAccessGuard: React.FC<MIAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Check if user has access to MIA
  if (!hasPremiumAccess(user)) {
    return <MIAComingSoon />;
  }

  return <>{children}</>;
};

export default MIAAccessGuard;
