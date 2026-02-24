import React from 'react';
import { Target, Sparkles, Zap } from 'lucide-react';
import { MetricCard } from '@/components/shared/MetricCard';

interface SEOScoreCardsProps {
  seoScore?: number;
  geoScore?: number;
  performanceScore?: number;
  loading?: boolean;
}

export const SEOScoreCards: React.FC<SEOScoreCardsProps> = ({
  seoScore = 0,
  geoScore = 0,
  performanceScore = 0,
  loading = false,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreTrend = (score: number): 'up' | 'down' | 'neutral' => {
    if (score >= 80) return 'up';
    if (score >= 60) return 'neutral';
    return 'down';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard
        title="SEO Score"
        value={loading ? '—' : seoScore}
        icon={Target}
        iconColor={getScoreColor(seoScore)}
        trend={getScoreTrend(seoScore)}
        change={seoScore >= 80 ? 12 : seoScore >= 60 ? 5 : -3}
        changeLabel="vs last check"
        loading={loading}
      />
      
      <MetricCard
        title="GEO Score"
        value={loading ? '—' : geoScore}
        icon={Sparkles}
        iconColor={getScoreColor(geoScore)}
        trend={getScoreTrend(geoScore)}
        change={geoScore >= 80 ? 15 : geoScore >= 60 ? 8 : -5}
        changeLabel="vs last check"
        loading={loading}
      />
      
      <MetricCard
        title="Performance"
        value={loading ? '—' : performanceScore}
        icon={Zap}
        iconColor={getScoreColor(performanceScore)}
        trend={getScoreTrend(performanceScore)}
        change={performanceScore >= 80 ? 10 : performanceScore >= 60 ? 3 : -7}
        changeLabel="vs last check"
        loading={loading}
      />
    </div>
  );
};

export default SEOScoreCards;
