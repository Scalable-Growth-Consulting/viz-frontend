import React from 'react';
import TrendAnalysisAgent from '@/pages/KeywordTrend/TrendAnalysisAgent';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';

const TrendAnalysisAgentPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      <TopNav zone="vee" showData={false} />
      <main className="flex-1">
        <TrendAnalysisAgent />
      </main>
      <GlobalFooter />
    </div>
  );
};

export default TrendAnalysisAgentPage;
