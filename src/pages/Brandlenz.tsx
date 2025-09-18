import React from 'react';
import BrandlenzDashboardSimple from '@/modules/Brandlenz/components/BrandlenzDashboardSimple';
import GlobalFooter from '@/components/GlobalFooter';

interface BrandlenzProps {
  showHeader?: boolean;
}

const Brandlenz: React.FC<BrandlenzProps> = ({ showHeader = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-viz-dark dark:via-viz-medium dark:to-viz-dark">
      {showHeader && (
        <div className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-viz-light/20 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-viz-dark dark:text-white">Brandlenz</h1>
                <p className="text-slate-600 dark:text-viz-text-secondary">Social Listening & Brand Intelligence</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600 dark:text-gray-400">Live Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BrandlenzDashboardSimple />
      </div>
      
      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
};

export default Brandlenz;
