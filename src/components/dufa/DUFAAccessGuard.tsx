import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ADMIN_EMAIL, hasPremiumAccess } from '@/utils/adminAccess';

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
    console.log('[DUFAAccessGuard] ❌ Access denied - redirecting to Coming Soon page');
    return <Navigate to="/dufa-coming-soon" replace />;
  }

  console.log('[DUFAAccessGuard] ✅ Premium access granted for', user?.email);
  return <>{children}</>;
};

export default DUFAAccessGuard;
