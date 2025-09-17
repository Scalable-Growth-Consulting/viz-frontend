import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';
import BrandlenzDashboard from '@/components/brandlenz/BrandlenzDashboard';

interface BrandlenzProps {
  showHeader?: boolean;
}

const Brandlenz: React.FC<BrandlenzProps> = ({ showHeader = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-violet-900/20">
      {showHeader && <TopNav zone="riz" showData={false} />}
      
      <div className={`${showHeader ? 'pt-[73px]' : ''} h-full`}>
        <BrandlenzDashboard />
      </div>
    </div>
  );
};

export default Brandlenz;
