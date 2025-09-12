// Comprehensive insight types for Meta and Google Ads analysis

export interface AdInsight {
  id: string;
  type: InsightType;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'opportunity';
  title: string;
  description: string;
  recommendation: string;
  estimatedImpact: string;
  confidence: number; // 0-100
  dataPoints: string[]; // Which metrics contributed to this insight
  platform: 'meta' | 'google' | 'cross-platform';
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  timeframe: string;
  actionable: boolean;
  automationPossible: boolean;
}

export type InsightType =
  // Performance Insights
  | 'performance_decline'
  | 'performance_spike'
  | 'conversion_drop'
  | 'roas_below_target'
  | 'cpa_increasing'
  | 'quality_score_drop'
  
  // Budget & Bidding
  | 'budget_exhaustion'
  | 'budget_underutilization'
  | 'budget_optimization'
  | 'bid_optimization'
  | 'dayparting_opportunity'
  | 'geographic_reallocation'
  
  // Creative & Content
  | 'ad_fatigue'
  | 'creative_underperforming'
  | 'high_performing_creative'
  | 'video_completion_low'
  | 'ctr_decline'
  
  // Audience & Targeting
  | 'audience_saturation'
  | 'demographic_opportunity'
  | 'placement_optimization'
  | 'device_performance_gap'
  | 'lookalike_expansion'
  
  // Competition & Market
  | 'impression_share_loss'
  | 'competitor_activity'
  | 'seasonal_trend'
  | 'keyword_opportunity'
  
  // Cross-Platform
  | 'platform_arbitrage'
  | 'attribution_discrepancy'
  | 'duplicate_targeting'
  | 'budget_reallocation';

export interface InsightGenerationRules {
  performanceThresholds: {
    criticalCtrDrop: number; // % drop that triggers critical alert
    roasTarget: number; // Minimum acceptable ROAS
    qualityScoreMin: number; // Minimum quality score
    frequencyMax: number; // Max frequency before fatigue
    conversionRateMin: number; // Minimum conversion rate
    costIncreaseAlert: number; // % cost increase that triggers alert
  };
  timeframesToAnalyze: {
    shortTerm: number; // days
    mediumTerm: number; // days  
    longTerm: number; // days
  };
  confidenceThresholds: {
    minimumSpend: number; // Minimum spend before insights are reliable
    minimumConversions: number; // Minimum conversions for statistical significance
    minimumImpressions: number; // Minimum impressions for CTR insights
  };
}

export interface MetricsSnapshot {
  // Campaign metadata
  campaignId?: string;
  campaignName?: string;
  platform?: 'google' | 'meta' | 'combined';
  
  // Universal Metrics
  impressions: number;
  clicks: number;
  ctr: number;
  cost: number;
  conversions: number;
  conversionRate: number;
  cpa: number;
  roas: number;
  
  // Platform-Specific Metrics
  google?: {
    qualityScore: number;
    impressionShare: number;
    searchImpressionShare: number;
    topOfPageRate: number;
    absoluteTopRate: number;
    avgPosition: number;
    budgetLostIS?: number;
    rankLostIS?: number;
  };
  
  meta?: {
    reach: number;
    frequency: number;
    cpm: number;
    engagementRate: number;
    videoViews: number;
    videoCompletionRate: number;
    qualityRanking: 'above_average' | 'average' | 'below_average';
    engagementRanking: 'above_average' | 'average' | 'below_average';
    conversionRanking: 'above_average' | 'average' | 'below_average';
  };
}

export interface InsightContext {
  campaign: {
    id: string;
    name: string;
    objective: string;
    budget: number;
    bidStrategy: string;
    status: string;
  };
  adSet?: {
    id: string;
    name: string;
    targeting: string[];
    placements: string[];
    audience: string;
  };
  ad?: {
    id: string;
    name: string;
    type: string;
    creative: string;
  };
  timeframe: {
    current: MetricsSnapshot;
    previous: MetricsSnapshot;
    baseline: MetricsSnapshot;
  };
  benchmarks: {
    industry: MetricsSnapshot;
    account: MetricsSnapshot;
    topPerforming: MetricsSnapshot;
  };
}
