import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL, hasPremiumAccess } from '@/utils/adminAccess';
import DUFAComingSoon from '@/pages/DUFAComingSoon';

interface DUFAAccessGuardProps {
  children: React.ReactNode;
}

const DUFAAccessGuard: React.FC<DUFAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug logging for access control
  const access = {
    userExists: !!user,
    userEmail: user?.email,
    hasPremiumAccess: hasPremiumAccess(user),
    timestamp: new Date().toISOString()
  };
  console.log('[DUFAAccessGuard] Access Check:', access);

  if (!hasPremiumAccess(user)) {
    console.log('[DUFAAccessGuard] ❌ Access denied - showing Coming Soon inline');
    // Render Coming Soon inline so the RIZ layout (with sidebar) remains visible
    return <DUFAComingSoon showHeader={false} />;
  }

  console.log('[DUFAAccessGuard] ✅ Premium access granted for', user?.email);
  return <>{children}</>;
};

export default DUFAAccessGuard;
