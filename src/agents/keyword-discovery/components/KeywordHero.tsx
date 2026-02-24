import React from 'react';
import { Target, Search, TrendingUp } from 'lucide-react';
import { AgentHero } from '@/shared/components';
import { Button } from '@/components/ui/button';

export const KeywordHero: React.FC = () => {
  const scrollToDiscovery = () => {
    const element = document.getElementById('keyword-discovery');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AgentHero
      title="Keyword Discovery Agent"
      subtitle="Uncover High-Value Keywords"
      description="AI-powered keyword research that reveals untapped opportunities. Discover what your audience is searching for and dominate your niche with data-driven insights."
      icon={Target}
      gradient="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
      tags={['Keyword Research', 'SEO', 'Market Intelligence', 'AI-Powered']}
      actions={
        <>
          <Button
            onClick={scrollToDiscovery}
            className="px-8 py-6 text-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Search className="w-5 h-5 mr-2" />
            Discover Keywords
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-slate-300 dark:border-viz-light/30 hover:border-purple-500 dark:hover:border-purple-400 rounded-xl transition-all duration-200"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            View Trends
          </Button>
        </>
      }
    />
  );
};
