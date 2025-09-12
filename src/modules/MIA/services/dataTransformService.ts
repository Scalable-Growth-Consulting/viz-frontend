import { AdInsight, InsightContext, MetricsSnapshot } from '../types/insights';

export interface GoogleAdsRawData {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    budget: {
      amount_micros: string;
      delivery_method: string;
    };
    bidding_strategy_type: string;
    
    // Performance metrics
    metrics: {
      impressions: string;
      clicks: string;
      cost_micros: string;
      conversions: number;
      conversions_value: number;
      average_cpc: string;
      ctr: number;
      conversion_rate: number;
      cost_per_conversion: string;
      search_impression_share: number;
      search_budget_lost_impression_share: number;
      search_rank_lost_impression_share: number;
    };
    
    // Ad groups
    ad_groups?: Array<{
      id: string;
      name: string;
      status: string;
      cpc_bid_micros: string;
      target_cpa_micros?: string;
    }>;
    
    // Keywords
    keywords?: Array<{
      criterion_id: string;
      keyword: string;
      match_type: string;
      quality_score: number;
      first_page_cpc_micros: string;
      top_of_page_cpc_micros: string;
    }>;
  }>;
  
  // Account-level data
  account: {
    customer_id: string;
    descriptive_name: string;
    currency_code: string;
    time_zone: string;
  };
}

export interface MetaAdsRawData {
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    objective: string;
    buying_type: string;
    budget_remaining: string;
    daily_budget: string;
    lifetime_budget: string;
    
    // Insights/metrics
    insights: {
      data: Array<{
        impressions: string;
        clicks: string;
        spend: string;
        reach: string;
        frequency: string;
        ctr: string;
        cpc: string;
        cpm: string;
        cpp: string;
        actions?: Array<{
          action_type: string;
          value: string;
        }>;
        conversion_values?: Array<{
          action_type: string;
          value: string;
        }>;
        video_play_actions?: Array<{
          action_type: string;
          value: string;
        }>;
        video_avg_time_watched_actions?: Array<{
          action_type: string;
          value: string;
        }>;
        quality_ranking?: string;
        engagement_rate_ranking?: string;
        conversion_rate_ranking?: string;
      }>;
    };
    
    // Ad Sets
    adsets?: Array<{
      id: string;
      name: string;
      status: string;
      optimization_goal: string;
      bid_strategy: string;
      daily_budget: string;
      targeting: {
        age_min: number;
        age_max: number;
        genders: number[];
        geo_locations: any;
        interests: any[];
        behaviors: any[];
        custom_audiences: string[];
        lookalike_audiences: string[];
      };
    }>;
    
    // Ads
    ads?: Array<{
      id: string;
      name: string;
      status: string;
      creative: {
        title: string;
        body: string;
        call_to_action_type: string;
        image_url?: string;
        video_id?: string;
      };
    }>;
  }>;
  
  account: {
    account_id: string;
    name: string;
    account_status: number;
    currency: string;
    timezone_name: string;
  };
}

export interface CrossPlatformMetrics {
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalImpressions: number;
  totalClicks: number;
  averageROAS: number;
  averageCPA: number;
  averageCTR: number;
  
  platformBreakdown: {
    google: {
      spend: number;
      revenue: number;
      conversions: number;
      roas: number;
      share: number; // percentage of total
    };
    meta: {
      spend: number;
      revenue: number;
      conversions: number;
      roas: number;
      share: number;
    };
  };
  
  topPerformingCampaigns: Array<{
    id: string;
    name: string;
    platform: 'google' | 'meta' | 'combined';
    roas: number;
    spend: number;
    conversions: number;
  }>;
}

export class MIADataTransformService {
  
  /**
   * Transform Google Ads raw data into standardized metrics
   */
  transformGoogleAdsData(rawData: GoogleAdsRawData): MetricsSnapshot[] {
    return rawData.campaigns.map(campaign => {
      const metrics = campaign.metrics;
      const budget = parseInt(campaign.budget.amount_micros) / 1000000; // Convert micros to currency
      const cost = parseInt(metrics.cost_micros) / 1000000;
      const impressions = parseInt(metrics.impressions);
      const clicks = parseInt(metrics.clicks);
      const conversions = metrics.conversions;
      const conversionValue = metrics.conversions_value;
      
      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        platform: 'google' as const,
        
        // Universal metrics
        impressions,
        clicks,
        ctr: metrics.ctr,
        cost,
        conversions,
        conversionRate: metrics.conversion_rate,
        cpa: cost / (conversions || 1),
        roas: conversionValue / (cost || 1),
        
        // Google-specific metrics
        google: {
          qualityScore: this.calculateAverageQualityScore(campaign.keywords || []),
          impressionShare: metrics.search_impression_share,
          searchImpressionShare: metrics.search_impression_share,
          topOfPageRate: 0, // Would need additional data
          absoluteTopRate: 0, // Would need additional data
          avgPosition: 0, // Deprecated but kept for compatibility
          budgetLostIS: metrics.search_budget_lost_impression_share,
          rankLostIS: metrics.search_rank_lost_impression_share
        }
      };
    });
  }
  
  /**
   * Transform Meta Ads raw data into standardized metrics
   */
  transformMetaAdsData(rawData: MetaAdsRawData): MetricsSnapshot[] {
    return rawData.campaigns.map(campaign => {
      const insights = campaign.insights.data[0]; // Most recent insights
      if (!insights) return null;
      
      const impressions = parseInt(insights.impressions);
      const clicks = parseInt(insights.clicks);
      const spend = parseFloat(insights.spend);
      const reach = parseInt(insights.reach);
      const frequency = parseFloat(insights.frequency);
      
      // Extract conversions from actions
      const conversions = this.extractMetaConversions(insights.actions || []);
      const conversionValue = this.extractMetaConversionValue(insights.conversion_values || []);
      
      // Calculate video metrics
      const videoViews = this.extractVideoViews(insights.video_play_actions || []);
      const avgWatchTime = this.extractAvgWatchTime(insights.video_avg_time_watched_actions || []);
      
      return {
        campaignId: campaign.id,
        campaignName: campaign.name,
        platform: 'meta' as const,
        
        // Universal metrics
        impressions,
        clicks,
        ctr: parseFloat(insights.ctr),
        cost: spend,
        conversions,
        conversionRate: (conversions / clicks) * 100,
        cpa: spend / (conversions || 1),
        roas: conversionValue / (spend || 1),
        
        // Meta-specific metrics
        meta: {
          reach,
          frequency,
          cpm: parseFloat(insights.cpm),
          engagementRate: this.calculateEngagementRate(insights.actions || [], impressions),
          videoViews,
          videoCompletionRate: this.calculateVideoCompletionRate(insights.video_play_actions || []),
          qualityRanking: this.normalizeRanking(insights.quality_ranking),
          engagementRanking: this.normalizeRanking(insights.engagement_rate_ranking),
          conversionRanking: this.normalizeRanking(insights.conversion_rate_ranking)
        }
      };
    }).filter(Boolean) as MetricsSnapshot[];
  }
  
  /**
   * Create cross-platform analysis
   */
  createCrossPlatformAnalysis(
    googleData: MetricsSnapshot[], 
    metaData: MetricsSnapshot[]
  ): CrossPlatformMetrics {
    const allCampaigns = [...googleData, ...metaData];
    
    const totalSpend = allCampaigns.reduce((sum, c) => sum + c.cost, 0);
    const totalRevenue = allCampaigns.reduce((sum, c) => sum + (c.roas * c.cost), 0);
    const totalConversions = allCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const totalImpressions = allCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const totalClicks = allCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    
    const googleMetrics = googleData.reduce((acc, c) => ({
      spend: acc.spend + c.cost,
      revenue: acc.revenue + (c.roas * c.cost),
      conversions: acc.conversions + c.conversions
    }), { spend: 0, revenue: 0, conversions: 0 });
    
    const metaMetrics = metaData.reduce((acc, c) => ({
      spend: acc.spend + c.cost,
      revenue: acc.revenue + (c.roas * c.cost),
      conversions: acc.conversions + c.conversions
    }), { spend: 0, revenue: 0, conversions: 0 });
    
    return {
      totalSpend,
      totalRevenue,
      totalConversions,
      totalImpressions,
      totalClicks,
      averageROAS: totalRevenue / totalSpend,
      averageCPA: totalSpend / totalConversions,
      averageCTR: (totalClicks / totalImpressions) * 100,
      
      platformBreakdown: {
        google: {
          spend: googleMetrics.spend,
          revenue: googleMetrics.revenue,
          conversions: googleMetrics.conversions,
          roas: googleMetrics.revenue / googleMetrics.spend,
          share: (googleMetrics.spend / totalSpend) * 100
        },
        meta: {
          spend: metaMetrics.spend,
          revenue: metaMetrics.revenue,
          conversions: metaMetrics.conversions,
          roas: metaMetrics.revenue / metaMetrics.spend,
          share: (metaMetrics.spend / totalSpend) * 100
        }
      },
      
      topPerformingCampaigns: allCampaigns
        .filter(c => c.platform !== 'combined') // Filter out combined platforms
        .sort((a, b) => b.roas - a.roas)
        .slice(0, 10)
        .map(c => ({
          id: c.campaignId!,
          name: c.campaignName!,
          platform: c.platform as 'google' | 'meta',
          roas: c.roas,
          spend: c.cost,
          conversions: c.conversions
        }))
    };
  }
  
  /**
   * Generate insights for campaigns based on performance data
   */
  generateInsightsFromData(
    googleData: MetricsSnapshot[],
    metaData: MetricsSnapshot[],
    crossPlatformMetrics: CrossPlatformMetrics,
    timeframe: { days: number; label: string }
  ): AdInsight[] {
    const insights: AdInsight[] = [];
    const allCampaigns = [...googleData, ...metaData];
    
    // Performance comparison insights
    insights.push(...this.generatePerformanceInsights(allCampaigns, crossPlatformMetrics));
    
    // Platform arbitrage opportunities
    insights.push(...this.generatePlatformArbitrageInsights(crossPlatformMetrics));
    
    // Budget optimization insights
    insights.push(...this.generateBudgetOptimizationInsights(allCampaigns));
    
    // Quality and targeting insights
    insights.push(...this.generateQualityInsights(googleData, metaData));
    
    return insights.sort((a, b) => this.calculateInsightPriority(b) - this.calculateInsightPriority(a));
  }
  
  // Helper methods
  private calculateAverageQualityScore(keywords: any[]): number {
    if (keywords.length === 0) return 7; // Default
    const total = keywords.reduce((sum, kw) => sum + (kw.quality_score || 7), 0);
    return total / keywords.length;
  }
  
  private extractMetaConversions(actions: any[]): number {
    const conversionActions = ['purchase', 'complete_registration', 'lead', 'add_to_cart'];
    return actions
      .filter(action => conversionActions.includes(action.action_type))
      .reduce((sum, action) => sum + parseInt(action.value), 0);
  }
  
  private extractMetaConversionValue(conversionValues: any[]): number {
    return conversionValues
      .filter(cv => cv.action_type === 'purchase')
      .reduce((sum, cv) => sum + parseFloat(cv.value), 0);
  }
  
  private extractVideoViews(videoActions: any[]): number {
    const videoViewActions = ['video_view', 'video_play'];
    return videoActions
      .filter(action => videoViewActions.includes(action.action_type))
      .reduce((sum, action) => sum + parseInt(action.value), 0);
  }
  
  private extractAvgWatchTime(watchTimeActions: any[]): number {
    if (watchTimeActions.length === 0) return 0;
    const total = watchTimeActions.reduce((sum, action) => sum + parseFloat(action.value), 0);
    return total / watchTimeActions.length;
  }
  
  private calculateEngagementRate(actions: any[], impressions: number): number {
    const engagementActions = ['like', 'comment', 'share', 'post_engagement'];
    const totalEngagements = actions
      .filter(action => engagementActions.includes(action.action_type))
      .reduce((sum, action) => sum + parseInt(action.value), 0);
    return (totalEngagements / impressions) * 100;
  }
  
  private calculateVideoCompletionRate(videoActions: any[]): number {
    const views = videoActions.find(action => action.action_type === 'video_view');
    const completions = videoActions.find(action => action.action_type === 'video_complete');
    
    if (!views || !completions) return 0;
    return (parseInt(completions.value) / parseInt(views.value)) * 100;
  }
  
  private normalizeRanking(ranking?: string): 'above_average' | 'average' | 'below_average' {
    if (!ranking) return 'average';
    return ranking as 'above_average' | 'average' | 'below_average';
  }
  
  private generatePerformanceInsights(campaigns: MetricsSnapshot[], crossPlatform: CrossPlatformMetrics): AdInsight[] {
    const insights: AdInsight[] = [];
    
    // Find underperforming campaigns
    const avgROAS = crossPlatform.averageROAS;
    const underperformingCampaigns = campaigns.filter(c => c.roas < avgROAS * 0.7);
    
    underperformingCampaigns.forEach(campaign => {
      insights.push({
        id: `underperforming_${campaign.campaignId}`,
        type: 'roas_below_target',
        severity: campaign.roas < 1 ? 'critical' : 'high',
        title: `${campaign.campaignName} Underperforming`,
        description: `Campaign ROAS of ${campaign.roas.toFixed(2)} is ${((avgROAS - campaign.roas) / avgROAS * 100).toFixed(1)}% below account average.`,
        recommendation: 'Review targeting, adjust bids, or pause low-performing ad groups to improve efficiency.',
        estimatedImpact: `Potential monthly savings: $${((campaign.cost * 0.3)).toFixed(0)}`,
        confidence: 85,
        dataPoints: ['roas', 'cost', 'conversions'],
        platform: campaign.platform === 'combined' ? 'cross-platform' : campaign.platform,
        campaignId: campaign.campaignId,
        timeframe: 'Last 30 days',
        actionable: true,
        automationPossible: true
      });
    });
    
    return insights;
  }
  
  private generatePlatformArbitrageInsights(crossPlatform: CrossPlatformMetrics): AdInsight[] {
    const insights: AdInsight[] = [];
    const { google, meta } = crossPlatform.platformBreakdown;
    
    if (Math.abs(google.roas - meta.roas) > 0.5) {
      const betterPlatform = google.roas > meta.roas ? 'Google' : 'Meta';
      const worsePlatform = google.roas > meta.roas ? 'Meta' : 'Google';
      const roasDiff = Math.abs(google.roas - meta.roas);
      
      insights.push({
        id: 'platform_arbitrage',
        type: 'platform_arbitrage',
        severity: 'opportunity',
        title: `${betterPlatform} Outperforming ${worsePlatform}`,
        description: `${betterPlatform} has ${roasDiff.toFixed(2)} higher ROAS. Consider reallocating budget to maximize returns.`,
        recommendation: `Shift 20-30% of budget from ${worsePlatform} to ${betterPlatform} to improve overall performance.`,
        estimatedImpact: `Potential monthly revenue increase: $${(crossPlatform.totalSpend * 0.2 * roasDiff).toFixed(0)}`,
        confidence: 75,
        dataPoints: ['roas', 'spend', 'platform_performance'],
        platform: 'cross-platform',
        timeframe: 'Last 30 days',
        actionable: true,
        automationPossible: false
      });
    }
    
    return insights;
  }
  
  private generateBudgetOptimizationInsights(campaigns: MetricsSnapshot[]): AdInsight[] {
    const insights: AdInsight[] = [];
    
    // Find campaigns with high ROAS that might benefit from budget increase
    const highPerformers = campaigns.filter(c => c.roas > 4 && c.cost > 1000);
    
    highPerformers.forEach(campaign => {
      insights.push({
        id: `budget_opportunity_${campaign.campaignId}`,
        type: 'budget_optimization',
        severity: 'opportunity',
        title: `Scale High-Performing Campaign: ${campaign.campaignName}`,
        description: `Campaign has excellent ROAS of ${campaign.roas.toFixed(2)} and could benefit from increased budget allocation.`,
        recommendation: 'Consider increasing budget by 25-50% to capture more profitable conversions.',
        estimatedImpact: `Potential additional monthly revenue: $${(campaign.cost * 0.5 * campaign.roas).toFixed(0)}`,
        confidence: 80,
        dataPoints: ['roas', 'spend', 'conversions'],
        platform: campaign.platform === 'combined' ? 'cross-platform' : campaign.platform,
        campaignId: campaign.campaignId,
        timeframe: 'Last 30 days',
        actionable: true,
        automationPossible: true
      });
    });
    
    return insights;
  }
  
  private generateQualityInsights(googleData: MetricsSnapshot[], metaData: MetricsSnapshot[]): AdInsight[] {
    const insights: AdInsight[] = [];
    
    // Google Quality Score insights
    googleData.forEach(campaign => {
      if (campaign.google && campaign.google.qualityScore < 6) {
        insights.push({
          id: `quality_score_${campaign.campaignId}`,
          type: 'quality_score_drop',
          severity: 'high',
          title: `Low Quality Score: ${campaign.campaignName}`,
          description: `Quality Score of ${campaign.google.qualityScore.toFixed(1)} is impacting campaign efficiency and costs.`,
          recommendation: 'Improve ad relevance, landing page experience, and keyword alignment to boost Quality Score.',
          estimatedImpact: `Potential CPC reduction: 20-40% (Monthly savings: $${(campaign.cost * 0.3).toFixed(0)})`,
          confidence: 90,
          dataPoints: ['qualityScore', 'cpc', 'ctr'],
          platform: 'google',
          campaignId: campaign.campaignId,
          timeframe: 'Current',
          actionable: true,
          automationPossible: false
        });
      }
    });
    
    // Meta Quality Ranking insights
    metaData.forEach(campaign => {
      if (campaign.meta && campaign.meta.qualityRanking === 'below_average') {
        insights.push({
          id: `meta_quality_${campaign.campaignId}`,
          type: 'creative_underperforming',
          severity: 'high',
          title: `Poor Meta Ad Quality: ${campaign.campaignName}`,
          description: 'Meta has rated this campaign\'s quality as below average, leading to higher costs.',
          recommendation: 'Refresh creative content, improve targeting relevance, and enhance post-click experience.',
          estimatedImpact: `Expected cost reduction: 15-25% (Monthly savings: $${(campaign.cost * 0.2).toFixed(0)})`,
          confidence: 85,
          dataPoints: ['qualityRanking', 'cpm', 'engagementRate'],
          platform: 'meta',
          campaignId: campaign.campaignId,
          timeframe: 'Current',
          actionable: true,
          automationPossible: false
        });
      }
    });
    
    return insights;
  }
  
  private calculateInsightPriority(insight: AdInsight): number {
    const severityWeights = { critical: 100, high: 75, medium: 50, low: 25, opportunity: 30 };
    let score = severityWeights[insight.severity] || 0;
    
    score += (insight.confidence / 100) * 20;
    if (insight.actionable) score += 15;
    if (insight.automationPossible) score += 10;
    
    const impactMatch = insight.estimatedImpact.match(/\$(\d+)/);
    if (impactMatch) {
      const amount = parseInt(impactMatch[1]);
      if (amount > 1000) score += 25;
      else if (amount > 500) score += 15;
      else if (amount > 100) score += 10;
    }
    
    return Math.min(score, 200);
  }
}
