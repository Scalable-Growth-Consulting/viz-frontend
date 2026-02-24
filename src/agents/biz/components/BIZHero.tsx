import React from 'react';
import { MessageSquare, Database, BarChart3 } from 'lucide-react';
import { AgentHero } from '@/shared/components';
import { Button } from '@/components/ui/button';

export const BIZHero: React.FC = () => {
  const scrollToChat = () => {
    const element = document.getElementById('bi-chat');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <AgentHero
      title="Business Intelligence Zone"
      subtitle="Chat with Your Data, Instantly"
      description="Transform raw data into actionable insights with AI-powered analytics. Build dashboards, generate reports, and make data-driven decisions in seconds."
      icon={MessageSquare}
      gradient="bg-gradient-to-r from-viz-accent to-blue-600"
      tags={['BI', 'Analytics', 'AI Chat', 'Dashboards']}
      actions={
        <>
          <Button
            onClick={scrollToChat}
            className="px-8 py-6 text-lg bg-gradient-to-r from-viz-accent to-blue-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <Database className="w-5 h-5 mr-2" />
            Start Analyzing
          </Button>
          <Button
            variant="outline"
            className="px-8 py-6 text-lg border-2 border-slate-300 dark:border-viz-light/30 hover:border-viz-accent dark:hover:border-viz-accent rounded-xl transition-all duration-200"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            View Examples
          </Button>
        </>
      }
    />
  );
};
