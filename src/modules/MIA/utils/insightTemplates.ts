// Pre-built insight templates for common scenarios
export const INSIGHT_TEMPLATES = {
  // Performance Insights
  CTR_DECLINE_CRITICAL: {
    title: "Critical CTR Decline Alert",
    severity: 'critical' as const,
    type: 'ctr_decline' as const,
    actionable: true,
    automationPossible: false
  },
  
  ROAS_BELOW_BREAKEVEN: {
    title: "Campaign Below Breakeven Point",
    severity: 'critical' as const,
    type: 'roas_below_target' as const,
    actionable: true,
    automationPossible: true
  },

  CONVERSION_RATE_DROP: {
    title: "Significant Conversion Rate Decline", 
    severity: 'high' as const,
    type: 'conversion_drop' as const,
    actionable: true,
    automationPossible: false
  },

  // Budget & Bidding Insights
  BUDGET_EXHAUSTED: {
    title: "Daily Budget Exhausted Early",
    severity: 'high' as const,
    type: 'budget_exhaustion' as const,
    actionable: true,
    automationPossible: true
  },

  CPA_ABOVE_INDUSTRY: {
    title: "Cost Per Acquisition Above Industry Benchmark",
    severity: 'medium' as const,
    type: 'bid_optimization' as const,
    actionable: true,
    automationPossible: true
  },

  // Creative & Content Insights
  AD_FATIGUE_DETECTED: {
    title: "Ad Fatigue Symptoms Detected",
    severity: 'medium' as const,
    type: 'ad_fatigue' as const,
    actionable: true,
    automationPossible: false
  },

  VIDEO_LOW_COMPLETION: {
    title: "Low Video Completion Rate",
    severity: 'medium' as const,
    type: 'video_completion_low' as const,
    actionable: true,
    automationPossible: false
  },

  // Audience & Targeting Insights
  AUDIENCE_SATURATION: {
    title: "Audience Saturation Detected",
    severity: 'medium' as const,
    type: 'audience_saturation' as const,
    actionable: true,
    automationPossible: true
  },

  HIGH_PERFORMING_DEMOGRAPHIC: {
    title: "High-Performing Demographic Segment",
    severity: 'opportunity' as const,
    type: 'demographic_opportunity' as const,
    actionable: true,
    automationPossible: true
  },

  // Platform-Specific Insights
  GOOGLE_QUALITY_SCORE_LOW: {
    title: "Quality Score Below Threshold",
    severity: 'high' as const,
    type: 'quality_score_drop' as const,
    actionable: true,
    automationPossible: false
  },

  GOOGLE_IMPRESSION_SHARE_LOW: {
    title: "Lost Impression Share Opportunity",
    severity: 'medium' as const,
    type: 'impression_share_loss' as const,
    actionable: true,
    automationPossible: true
  },

  META_QUALITY_RANKING_LOW: {
    title: "Meta Quality Ranking Below Average",
    severity: 'high' as const,
    type: 'creative_underperforming' as const,
    actionable: true,
    automationPossible: false
  },

  // Cross-Platform Insights
  PLATFORM_PERFORMANCE_GAP: {
    title: "Performance Gap Between Platforms",
    severity: 'opportunity' as const,
    type: 'platform_arbitrage' as const,
    actionable: true,
    automationPossible: true
  },

  DUPLICATE_AUDIENCE_TARGETING: {
    title: "Overlapping Audience Targeting Detected",
    severity: 'medium' as const,
    type: 'duplicate_targeting' as const,
    actionable: true,
    automationPossible: true
  }
};

// Insight message generators with dynamic data
export const generateInsightMessage = (template: keyof typeof INSIGHT_TEMPLATES, data: any) => {
  const base = INSIGHT_TEMPLATES[template];
  
  switch (template) {
    case 'CTR_DECLINE_CRITICAL':
      return {
        ...base,
        description: `CTR has dropped ${data.decline}% from ${data.previous}% to ${data.current}% in the last ${data.timeframe} days. This significant decline suggests ad fatigue, audience saturation, or increased competition.`,
        recommendation: `Immediate action required: Refresh ad creatives, test new audiences, or pause underperforming ads. Consider A/B testing new messaging approaches.`,
        estimatedImpact: `Recovering to previous CTR levels could increase clicks by ${Math.round(data.potentialClicks)} (${data.potentialRevenue} potential revenue)`
      };

    case 'ROAS_BELOW_BREAKEVEN':
      return {
        ...base,
        description: `Current ROAS of ${data.roas}:1 is ${data.roas < 1 ? 'below breakeven' : 'below target'}. ${data.roas < 1 ? 'Every dollar spent is losing money.' : 'Profitability is suboptimal.'}`,
        recommendation: data.roas < 1 
          ? 'URGENT: Pause campaign or dramatically reduce budget. Focus spend on highest-converting segments only.'
          : 'Optimize for high-value audiences, improve landing page conversion, or adjust bidding to profitable keywords/placements.',
        estimatedImpact: `Reaching ${data.targetRoas}:1 ROAS would generate additional $${Math.round(data.potentialProfit)} profit`
      };

    case 'BUDGET_EXHAUSTED':
      return {
        ...base,
        description: `Campaign budget is being fully utilized by ${data.exhaustionTime} daily, limiting potential reach and conversions. Current spend: $${data.dailySpend}/${data.budget}`,
        recommendation: 'Consider increasing daily budget by ${data.recommendedIncrease}% or optimize bids to reduce CPC and extend budget throughout the day.',
        estimatedImpact: `Budget increase could capture an estimated ${data.additionalConversions} more conversions per day`
      };

    case 'AD_FATIGUE_DETECTED':
      return {
        ...base,
        description: `Average frequency of ${data.frequency} indicates users are seeing ads too often. CTR has declined ${data.ctrDecline}% as frequency increased.`,
        recommendation: 'Refresh creative assets, expand audience size by ${data.audienceExpansion}%, or implement frequency capping at ${data.recommendedFrequency}.',
        estimatedImpact: `Creative refresh typically improves CTR by 15-25% and reduces CPC by 10-20%`
      };

    case 'GOOGLE_QUALITY_SCORE_LOW':
      return {
        ...base,
        description: `Quality Score of ${data.qualityScore}/10 is significantly impacting performance. Low Quality Score increases CPC by an estimated ${data.cpcImpact}%.`,
        recommendation: 'Focus on ad relevance improvement, landing page optimization, and expected CTR enhancement. Review keyword-ad-landing page alignment.',
        estimatedImpact: `Improving Quality Score to 7+ could reduce CPC by 20-40% (estimated monthly savings: $${data.potentialSavings})`
      };

    case 'HIGH_PERFORMING_DEMOGRAPHIC':
      return {
        ...base,
        description: `${data.demographic} segment is performing ${data.performance}% better than account average with ${data.ctr}% CTR and $${data.cpa} CPA.`,
        recommendation: 'Scale this high-performing segment by increasing budget allocation by ${data.budgetIncrease}% or expanding similar audiences.',
        estimatedImpact: `Scaling this segment could increase monthly conversions by ${data.potentialConversions} with similar efficiency`
      };

    default:
      return base;
  }
};

// Insight priority scoring system
export const calculateInsightPriority = (insight: any) => {
  let score = 0;
  
  // Severity weight (0-100)
  const severityWeights = {
    critical: 100,
    high: 75,
    medium: 50,
    low: 25,
    opportunity: 30
  };
  score += severityWeights[insight.severity] || 0;
  
  // Confidence boost (0-20)
  score += (insight.confidence / 100) * 20;
  
  // Actionability boost (0-15)
  if (insight.actionable) score += 15;
  
  // Automation possibility boost (0-10)
  if (insight.automationPossible) score += 10;
  
  // Financial impact boost (0-25)
  if (insight.estimatedImpact?.includes('$')) {
    const amount = parseFloat(insight.estimatedImpact.match(/\$(\d+)/)?.[1] || '0');
    if (amount > 1000) score += 25;
    else if (amount > 500) score += 15;
    else if (amount > 100) score += 10;
    else if (amount > 50) score += 5;
  }
  
  return Math.min(score, 200); // Cap at 200
};
