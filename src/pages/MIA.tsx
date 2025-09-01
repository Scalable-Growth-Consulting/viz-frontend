import React from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import MIADashboard from '@/modules/MIA/components/MIADashboard';
import { Link } from 'react-router-dom';

interface MIAProps {
  showHeader?: boolean;
}

const MIA: React.FC<MIAProps> = ({ showHeader = true }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      {showHeader && <Header showDataSection={false} />}
      <div className="flex-1">
        <MIADashboard userId={user?.id || ''} />
      </div>
      <footer className="w-full border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm flex items-center justify-center gap-6 text-slate-600 dark:text-slate-300">
          <Link to="/riz/mia/privacy" className="hover:text-viz-accent transition-colors">Privacy Policy</Link>
          <span className="text-slate-400">•</span>
          <Link to="/riz/mia/terms" className="hover:text-viz-accent transition-colors">Terms of Service</Link>
          <span className="text-slate-400">•</span>
          <Link to="/riz/mia/data-deletion" className="hover:text-viz-accent transition-colors">Data Deletion Policy</Link>
        </div>
      </footer>
    </div>
  );
};

export default MIA;
