import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import MIADashboard from '@/modules/MIA/components/MIADashboard';

const MIA: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      <MIADashboard userId={user?.id || ''} />
    </div>
  );
};

export default MIA;
