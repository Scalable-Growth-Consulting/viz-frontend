import React from 'react';
import { Globe, Eye, TrendingUp } from 'lucide-react';
import { AgentHero } from '@/shared/components';
import { Button } from '@/components/ui/button';

export const BrandlenzHero: React.FC = () => {
  const scrollToDashboard = () => {
    const element = document.getElementById('brandlenz-dashboard');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AgentHero
      title="BrandLenz Sentinel"
      subtitle="Continuous Brand Intelligence"
      description="Monitor brand health, competitive signals, and market perception across all channels. Stay ahead with real-time visibility intelligence."
      icon={Globe}
      gradient="bg-gradient-to-r from-[#0F3D5F] via-[#256D85] to-[#3BA39C]"
      tags={['Brand Monitoring', 'Competitive Intelligence', 'Market Analysis', 'Real-time']}
      actions={
        <>
          <Button
            onClick={scrollToDashboard}
            className="px-8 py-6 text-lg bg-gradient-to-r from-[#0F3D5F] via-[#256D85] to-[#3BA39C] hover:opacity-90 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Eye className="w-5 h-5 mr-2" />
            View Dashboard
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-slate-300 dark:border-viz-light/30 hover:border-[#3BA39C] dark:hover:border-[#3BA39C] rounded-xl transition-all duration-200"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Analytics
          </Button>
        </>
      }
    />
  );
};
