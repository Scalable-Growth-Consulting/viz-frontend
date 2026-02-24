import React from 'react';
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';

const SEOGeoAgentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-viz-dark dark:via-black dark:to-viz-dark flex flex-col">
      <TopNav zone="vee" showData={false} />
      
      <main className="flex-1">
        {/* Hero Header */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              SEO & GEO Intelligence
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-viz-dark dark:text-white">
              SEO-GEO Agent
            </h1>
            <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-3xl">
              Comprehensive SEO analysis and Generative Engine Optimization powered by AI. Analyze your website's performance and get actionable insights.
            </p>
          </div>
        </div>
        
        {/* Analysis Section */}
        <div className="container mx-auto px-4 pb-12">
          <SEOGeoChecker />
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  );
};

export default SEOGeoAgentPage;
