import React from 'react';
import { Brain, Sparkles, Zap } from 'lucide-react';
import { AgentHero } from '@/shared/components';
import { Button } from '@/components/ui/button';

export const SEOGeoHero: React.FC = () => {
  const scrollToAnalysis = () => {
    const element = document.getElementById('seo-analysis');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AgentHero
      title="SEO & GEO Intelligence"
      subtitle="Search + Generative Engine Optimization"
      description="Master-level SEO analysis with AI-driven GEO signals. Get actionable insights, quick wins, and growth strategies powered by advanced algorithms."
      icon={Brain}
      gradient="bg-gradient-to-r from-blue-500 to-cyan-600"
      tags={['SEO', 'GEO', 'AI-Powered', 'Real-time Analysis']}
      actions={
        <>
          <Button
            onClick={scrollToAnalysis}
            className="px-8 py-6 text-lg bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Analysis
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-slate-300 dark:border-viz-light/30 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl transition-all duration-200"
          >
            <Zap className="w-5 h-5 mr-2" />
            View Demo
          </Button>
        </>
      }
    />
  );
};
