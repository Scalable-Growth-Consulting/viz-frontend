import React from 'react';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';

interface AgentLayoutProps {
  children: React.ReactNode;
  zone?: 'home' | 'biz' | 'vee' | 'mia' | 'riz' | 'fiz' | 'hiz';
  showData?: boolean;
}

export const AgentLayout: React.FC<AgentLayoutProps> = ({ 
  children, 
  zone = 'home', 
  showData = false 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      <TopNav zone={zone} showData={showData} />
      <main className="flex-1">
        {children}
      </main>
      <GlobalFooter />
    </div>
  );
};
