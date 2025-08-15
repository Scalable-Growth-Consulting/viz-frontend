import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import MIADashboard from '@/modules/MIA/components/MIADashboard';

interface MIAProps {
  showHeader?: boolean;
}

const MIA: React.FC<MIAProps> = ({ showHeader = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      {showHeader && <Header showDataSection={false} />}
      <MIADashboard userId={user?.id || ''} />
    </div>
  );
};

export default MIA;
