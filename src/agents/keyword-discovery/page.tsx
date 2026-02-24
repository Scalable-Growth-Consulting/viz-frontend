import React from 'react';
import KeywordDiscoveryAgent from '@/pages/KeywordTrend/KeywordDiscoveryAgent';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { Target } from 'lucide-react';

const KeywordDiscoveryAgentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-viz-dark dark:via-black dark:to-viz-dark flex flex-col">
      <TopNav zone="vee" showData={false} />
      
      <main className="flex-1">
        {/* Hero Header */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg">
              <Target className="w-3 h-3" />
              Keyword Research
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-viz-dark dark:text-white">
              Keyword Discovery Agent
            </h1>
            <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-3xl">
              Uncover high-value keywords with AI-powered research. Discover what your audience is searching for and dominate your niche with data-driven insights.
            </p>
          </div>
        </div>
        
        {/* Keyword Discovery Interface */}
        <div className="container mx-auto px-4 pb-12">
          <KeywordDiscoveryAgent />
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  );
};

export default KeywordDiscoveryAgentPage;
