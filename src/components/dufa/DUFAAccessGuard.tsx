import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface DUFAAccessGuardProps {
  children: React.ReactNode;
}

const DUFAAccessGuard: React.FC<DUFAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Check if user has admin access to DUFA
  const hasAdminAccess = user?.email === 'creatorvision03@gmail.com';

  if (!hasAdminAccess) {
    return <Navigate to="/dufa-coming-soon" replace />;
  }

  return <>{children}</>;
};

export default DUFAAccessGuard;
