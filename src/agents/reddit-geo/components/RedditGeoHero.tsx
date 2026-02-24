import React from 'react';
import { MessageCircle, Target, Zap } from 'lucide-react';
import { AgentHero } from '@/shared/components';
import { Button } from '@/components/ui/button';

export const RedditGeoHero: React.FC = () => {
  const scrollToAgent = () => {
    const element = document.getElementById('reddit-agent');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AgentHero
      title="Reddit GEO CoPilot"
      subtitle="Intelligent Reddit Growth Automation"
      description="Discover high-intent Reddit opportunities and craft risk-aware, conversion-ready responses. Automate your Reddit marketing with AI-powered intelligence."
      icon={MessageCircle}
      gradient="bg-gradient-to-r from-orange-500 to-red-600"
      tags={['Reddit Marketing', 'AI Automation', 'Lead Generation', 'Risk Analysis']}
      actions={
        <>
          <Button
            onClick={scrollToAgent}
            className="px-8 py-6 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Target className="w-5 h-5 mr-2" />
            Launch Agent
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-slate-300 dark:border-viz-light/30 hover:border-orange-500 dark:hover:border-orange-400 rounded-xl transition-all duration-200"
          >
            <Zap className="w-5 h-5 mr-2" />
            Learn More
          </Button>
        </>
      }
    />
  );
};
