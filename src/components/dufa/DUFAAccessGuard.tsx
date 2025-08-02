import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { ADMIN_EMAIL } from '@/utils/adminAccess';

interface DUFAAccessGuardProps {
  children: React.ReactNode;
}

const DUFAAccessGuard: React.FC<DUFAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug logging for access control
  console.log('[DUFAAccessGuard] Access Check:', {
    userExists: !!user,
    userEmail: user?.email,
    isAdmin: user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    timestamp: new Date().toISOString()
  });

  // PERMANENT ACCESS: Only allow creatorvision03@gmail.com
  const hasAdminAccess = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  if (!hasAdminAccess) {
    console.log('[DUFAAccessGuard] ❌ Access denied - redirecting to Coming Soon page');
    return <Navigate to="/dufa-coming-soon" replace />;
  }

  console.log('[DUFAAccessGuard] ✅ Admin access granted for', ADMIN_EMAIL);
  return <>{children}</>;
};

export default DUFAAccessGuard;
