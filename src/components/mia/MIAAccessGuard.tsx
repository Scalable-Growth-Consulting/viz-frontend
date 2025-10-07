import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ADMIN_EMAIL, hasPremiumAccess } from '@/utils/adminAccess';
import MIAComingSoon from '@/pages/MIAComingSoon';
import { useLocation } from 'react-router-dom';

interface MIAAccessGuardProps {
  children: React.ReactNode;
}

const MIAAccessGuard: React.FC<MIAAccessGuardProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // Debug logging for access control
  const access = {
    userExists: !!user,
    userEmail: user?.email,
    hasPremiumAccess: hasPremiumAccess(user),
    timestamp: new Date().toISOString()
  };
  console.log('[MIAAccessGuard] Access Check:', access);

  // Public access for SEO-GEO routes (open to all users)
  const path = (location?.pathname || '').toLowerCase();
  const isSeoGeo = path.includes('/mia/seo-geo') || path.includes('/seo-geo-ai-tool');

  if (isSeoGeo) {
    console.log('[MIAAccessGuard] 🎯 Public access granted for SEO-GEO route');
    return <>{children}</>;
  }

  if (hasPremiumAccess(user)) {
    console.log('[MIAAccessGuard] ✅ Premium access granted for', user?.email);
    return <>{children}</>;
  }

  // Non-qualified users see the MIA Coming Soon page
  console.log('[MIAAccessGuard] ✅ Non-qualified user access - showing MIA Coming Soon page');
  return <MIAComingSoon showHeader={false} />;
};

export default MIAAccessGuard;
