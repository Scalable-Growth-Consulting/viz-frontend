import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import InventoryComingSoon from '@/pages/InventoryComingSoon';

interface InventoryAccessGuardProps {
  children: React.ReactNode;
}

const InventoryAccessGuard: React.FC<InventoryAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();

  // Debug logging for access control
  const access = {
    userExists: !!user,
    userEmail: user?.email,
    hasPremiumAccess: hasPremiumAccess(user),
    timestamp: new Date().toISOString(),
  };
  console.log('[InventoryAccessGuard] Access Check:', access);

  if (hasPremiumAccess(user)) {
    console.log('[InventoryAccessGuard] ✅ Premium access granted for', user?.email);
    return <>{children}</>;
  }

  // All other users see Coming Soon page inline without the extra header
  console.log('[InventoryAccessGuard] ❌ Access denied - showing Coming Soon page');
  return <InventoryComingSoon showHeader={false} />;
};

export default InventoryAccessGuard;
