import React from 'react';
import DUFA from '@/pages/DUFA';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { TrendingUp } from 'lucide-react';

const DUFAAgentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-viz-dark dark:via-black dark:to-viz-dark flex flex-col">
      <TopNav zone="riz" showData={false} />
      
      <main className="flex-1">
        {/* Compact Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              <TrendingUp className="w-3 h-3" />
              Demand Forecasting
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-viz-dark dark:text-white">
              DUFA
            </h1>
            <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-3xl">
              AI-powered demand forecasting and trend analysis to optimize inventory and reduce waste.
            </p>
          </div>
        </div>
        
        {/* DUFA Interface */}
        <div className="container mx-auto px-4 pb-12">
          <DUFA showTopNav={false} />
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  );
};

export default DUFAAgentPage;
