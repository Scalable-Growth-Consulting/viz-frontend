import React from 'react';
import { TrendingUp, BarChart3, Brain } from 'lucide-react';
import { AgentHero } from '@/shared/components';
import { Button } from '@/components/ui/button';

export const DUFAHero: React.FC = () => {
  const scrollToForecasting = () => {
    const element = document.getElementById('dufa-interface');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AgentHero
      title="DUFA"
      subtitle="Demand Understanding & Forecasting Agent"
      description="AI-powered demand forecasting that transforms historical data into accurate predictions. Optimize inventory, reduce costs, and maximize revenue with intelligent forecasting."
      icon={TrendingUp}
      gradient="bg-gradient-to-r from-viz-accent to-blue-600"
      tags={['Forecasting', 'Demand Planning', 'AI Predictions', 'Retail Intelligence']}
      actions={
        <>
          <Button
            onClick={scrollToForecasting}
            className="px-8 py-6 text-lg bg-gradient-to-r from-viz-accent to-blue-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Brain className="w-5 h-5 mr-2" />
            Start Forecasting
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-slate-300 dark:border-viz-light/30 hover:border-viz-accent dark:hover:border-viz-accent rounded-xl transition-all duration-200"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Capabilities
          </Button>
        </>
      }
    />
  );
};
