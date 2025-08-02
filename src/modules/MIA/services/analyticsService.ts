import { Campaign, AdGroup, PlatformMetrics, PerformanceInsight, DashboardFilters } from '../types';

/**
 * MIA Analytics Service
 * Handles data analysis, insights generation, and performance calculations
 */
export class AnalyticsService {
  /**
   * Calculate platform-level metrics from campaigns
   */
  static calculatePlatformMetrics(campaigns: Campaign[]): PlatformMetrics[] {
    const platformGroups = campaigns.reduce((acc, campaign) => {
      if (!acc[campaign.platform]) {
        acc[campaign.platform] = [];
      }
      acc[campaign.platform].push(campaign);
      return acc;
    }, {} as Record<string, Campaign[]>);

    return Object.entries(platformGroups).map(([platform, platformCampaigns]) => {
      const totalSpend = platformCampaigns.reduce((sum, c) => sum + c.spend, 0);
      const totalImpressions = platformCampaigns.reduce((sum, c) => sum + c.impressions, 0);
      const totalClicks = platformCampaigns.reduce((sum, c) => sum + c.clicks, 0);
      const totalConversions = platformCampaigns.reduce((sum, c) => sum + c.conversions, 0);
      const activeCampaigns = platformCampaigns.filter(c => c.status === 'active').length;

      return {
        platform: platform as 'meta' | 'google' | 'linkedin' | 'tiktok',
        totalSpend,
        totalImpressions,
        totalClicks,
        totalConversions,
        averageCTR: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
        averageCPA: totalConversions > 0 ? totalSpend / totalConversions : 0,
        averageROAS: totalSpend > 0 ? (totalConversions * 100) / totalSpend : 0,
        activeCampaigns,
      };
    });
  }

  /**
   * Generate performance insights from campaign data
   */
  static generateInsights(campaigns: Campaign[], adGroups: AdGroup[] = []): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Ad Fatigue Detection
    const fatigueInsights = this.detectAdFatigue(campaigns);
    insights.push(...fatigueInsights);

    // Budget Optimization
    const budgetInsights = this.analyzeBudgetOptimization(campaigns);
    insights.push(...budgetInsights);

    // Performance Analysis
    const performanceInsights = this.analyzePerformance(campaigns);
    insights.push(...performanceInsights);

    return insights.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }

  /**
   * Detect ad fatigue based on CTR trends
   */
  private static detectAdFatigue(campaigns: Campaign[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    campaigns.forEach(campaign => {
      if (campaign.ctr < 1.0 && campaign.impressions > 10000) {
        insights.push({
          type: 'ad_fatigue',
          severity: campaign.ctr < 0.5 ? 'high' : 'medium',
          title: `Ad Fatigue Detected: ${campaign.name}`,
          description: `CTR has dropped to ${campaign.ctr.toFixed(2)}% with ${campaign.impressions.toLocaleString()} impressions`,
          recommendation: 'Consider refreshing ad creatives, updating targeting, or pausing underperforming ads',
          campaignId: campaign.id,
          estimatedImpact: 'Could improve CTR by 15-30%',
        });
      }
    });

    return insights;
  }

  /**
   * Analyze budget optimization opportunities
   */
  private static analyzeBudgetOptimization(campaigns: Campaign[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    // Find high-performing campaigns that might need more budget
    const highPerformers = campaigns
      .filter(c => c.roas > 300 && c.status === 'active')
      .sort((a, b) => b.roas - a.roas);

    // Find low-performing campaigns that might need budget reduction
    const lowPerformers = campaigns
      .filter(c => c.roas < 100 && c.spend > 100 && c.status === 'active')
      .sort((a, b) => a.roas - b.roas);

    if (highPerformers.length > 0) {
      highPerformers.slice(0, 3).forEach(campaign => {
        insights.push({
          type: 'budget_optimization',
          severity: 'medium',
          title: `Scale High-Performing Campaign: ${campaign.name}`,
          description: `Excellent ROAS of ${campaign.roas.toFixed(0)}% with $${campaign.spend.toFixed(2)} spent`,
          recommendation: 'Consider increasing budget by 20-50% to scale performance',
          campaignId: campaign.id,
          estimatedImpact: 'Could increase conversions by 25-40%',
        });
      });
    }

    if (lowPerformers.length > 0) {
      lowPerformers.slice(0, 2).forEach(campaign => {
        insights.push({
          type: 'budget_optimization',
          severity: 'high',
          title: `Underperforming Campaign: ${campaign.name}`,
          description: `Low ROAS of ${campaign.roas.toFixed(0)}% with $${campaign.spend.toFixed(2)} spent`,
          recommendation: 'Consider reducing budget, optimizing targeting, or pausing this campaign',
          campaignId: campaign.id,
          estimatedImpact: 'Could save 30-50% of wasted ad spend',
        });
      });
    }

    return insights;
  }

  /**
   * Analyze overall performance trends
   */
  private static analyzePerformance(campaigns: Campaign[]): PerformanceInsight[] {
    const insights: PerformanceInsight[] = [];

    const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
    const averageROAS = totalSpend > 0 ? (totalConversions * 100) / totalSpend : 0;

    if (averageROAS < 150 && totalSpend > 1000) {
      insights.push({
        type: 'keyword_performance',
        severity: 'high',
        title: 'Overall Performance Below Target',
        description: `Average ROAS of ${averageROAS.toFixed(0)}% across all campaigns is below the 150% target`,
        recommendation: 'Review targeting, keywords, and ad creatives across all campaigns. Consider A/B testing new approaches.',
        estimatedImpact: 'Could improve overall ROAS by 20-40%',
      });
    }

    // Platform comparison insights
    const platformMetrics = this.calculatePlatformMetrics(campaigns);
    if (platformMetrics.length > 1) {
      const bestPlatform = platformMetrics.reduce((best, current) => 
        current.averageROAS > best.averageROAS ? current : best
      );
      const worstPlatform = platformMetrics.reduce((worst, current) => 
        current.averageROAS < worst.averageROAS ? current : worst
      );

      if (bestPlatform.averageROAS > worstPlatform.averageROAS * 1.5) {
        insights.push({
          type: 'creative_performance',
          severity: 'medium',
          title: `${bestPlatform.platform.toUpperCase()} Outperforming ${worstPlatform.platform.toUpperCase()}`,
          description: `${bestPlatform.platform.toUpperCase()} has ${bestPlatform.averageROAS.toFixed(0)}% ROAS vs ${worstPlatform.platform.toUpperCase()}'s ${worstPlatform.averageROAS.toFixed(0)}%`,
          recommendation: `Consider reallocating budget from ${worstPlatform.platform} to ${bestPlatform.platform} or applying successful strategies across platforms`,
          estimatedImpact: 'Could improve overall ROAS by 10-25%',
        });
      }
    }

    return insights;
  }

  /**
   * Filter campaigns based on dashboard filters
   */
  static filterCampaigns(campaigns: Campaign[], filters: DashboardFilters): Campaign[] {
    return campaigns.filter(campaign => {
      // Platform filter
      if (filters.platforms.length > 0 && !filters.platforms.includes(campaign.platform)) {
        return false;
      }

      // Date range filter
      const campaignDate = new Date(campaign.startDate);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (campaignDate < startDate || campaignDate > endDate) {
        return false;
      }

      // Campaign filter
      if (filters.campaigns && filters.campaigns.length > 0 && !filters.campaigns.includes(campaign.id)) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status.length > 0 && !filters.status.includes(campaign.status)) {
        return false;
      }

      return true;
    });
  }

  /**
   * Get top performing campaigns
   */
  static getTopPerformers(campaigns: Campaign[], metric: 'roas' | 'conversions' | 'ctr' = 'roas', limit: number = 5): Campaign[] {
    return campaigns
      .filter(c => c[metric] > 0)
      .sort((a, b) => b[metric] - a[metric])
      .slice(0, limit);
  }

  /**
   * Get worst performing campaigns
   */
  static getWorstPerformers(campaigns: Campaign[], metric: 'roas' | 'conversions' | 'ctr' = 'roas', limit: number = 5): Campaign[] {
    return campaigns
      .filter(c => c[metric] >= 0)
      .sort((a, b) => a[metric] - b[metric])
      .slice(0, limit);
  }

  /**
   * Calculate trend data for charts
   */
  static calculateTrends(campaigns: Campaign[], days: number = 30): Array<{
    date: string;
    spend: number;
    conversions: number;
    roas: number;
    impressions: number;
    clicks: number;
  }> {
    // This would typically aggregate data by date
    // For now, we'll create sample trend data
    const trends = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const daySpend = campaigns.reduce((sum, c) => sum + (c.spend / days), 0);
      const dayConversions = campaigns.reduce((sum, c) => sum + (c.conversions / days), 0);
      const dayImpressions = campaigns.reduce((sum, c) => sum + (c.impressions / days), 0);
      const dayClicks = campaigns.reduce((sum, c) => sum + (c.clicks / days), 0);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        spend: Math.round(daySpend * 100) / 100,
        conversions: Math.round(dayConversions * 100) / 100,
        roas: daySpend > 0 ? Math.round((dayConversions * 100 / daySpend) * 100) / 100 : 0,
        impressions: Math.round(dayImpressions),
        clicks: Math.round(dayClicks),
      });
    }
    
    return trends;
  }
}
