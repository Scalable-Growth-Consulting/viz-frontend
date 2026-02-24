import React from 'react';
import { Target, TrendingUp, Zap, Shield, Globe, Sparkles } from 'lucide-react';
import { FeatureCard } from '@/shared/components';

export const SEOGeoFeatures: React.FC = () => {
  const features = [
    {
      icon: Target,
      title: 'Precision Analysis',
      description: 'Deep-dive SEO audits with actionable recommendations tailored to your industry and competition.',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: TrendingUp,
      title: 'GEO Optimization',
      description: 'Optimize for AI-powered search engines like ChatGPT, Perplexity, and Google SGE.',
      gradient: 'from-purple-500 to-violet-600',
    },
    {
      icon: Zap,
      title: 'Quick Wins',
      description: 'Identify and implement high-impact optimizations that deliver immediate results.',
      gradient: 'from-orange-500 to-red-600',
    },
    {
      icon: Shield,
      title: 'Competitor Intelligence',
      description: 'Analyze competitor strategies and discover untapped keyword opportunities.',
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      icon: Globe,
      title: 'Multi-Channel Insights',
      description: 'Comprehensive analysis across search engines, social platforms, and AI assistants.',
      gradient: 'from-indigo-500 to-blue-600',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Recommendations',
      description: 'Machine learning algorithms provide personalized optimization strategies.',
      gradient: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 font-semibold">
            Platform Capabilities
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-viz-dark dark:text-white">
            Everything You Need to Dominate Search
          </h2>
          <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-2xl mx-auto">
            Comprehensive SEO and GEO tools designed for modern marketers and growth teams.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              gradient={feature.gradient}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
