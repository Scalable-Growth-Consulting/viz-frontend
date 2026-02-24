import React from 'react';
import BrandlenzDashboard from '@/components/brandlenz/BrandlenzDashboard';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { Globe } from 'lucide-react';

const BrandLenzAgentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-viz-dark dark:via-black dark:to-viz-dark flex flex-col">
      <TopNav zone="mia" showData={false} />
      
      <main className="flex-1">
        {/* Compact Header */}
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0F3D5F] via-[#256D85] to-[#3BA39C] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              <Globe className="w-3 h-3" />
              Visibility Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-viz-dark dark:text-white">
              Brandlenz Sentinel
            </h1>
            <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-3xl">
              Continuously sense brand health, competitive signals, and market bias across channels.
            </p>
          </div>
        </div>
        
        {/* BrandLenz Dashboard */}
        <div className="container mx-auto px-4 pb-12">
          <BrandlenzDashboard />
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  );
};

export default BrandLenzAgentPage;
