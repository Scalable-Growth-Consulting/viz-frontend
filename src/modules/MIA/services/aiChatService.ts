import { Campaign, AdGroup, MarketingQuery, PerformanceInsight } from '../types';
import { AnalyticsService } from './analyticsService';

/**
 * MIA AI Chat Service
 * Handles natural language queries and generates AI-powered marketing insights
 */
export class AIChatService {
  private campaigns: Campaign[] = [];
  private adGroups: AdGroup[] = [];

  constructor(campaigns: Campaign[] = [], adGroups: AdGroup[] = []) {
    this.campaigns = campaigns;
    this.adGroups = adGroups;
  }

  /**
   * Process a natural language marketing query
   */
  async processQuery(query: string, userId: string): Promise<MarketingQuery> {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Analyze query intent
    const intent = this.analyzeQueryIntent(normalizedQuery);
    
    // Generate response based on intent
    const response = await this.generateResponse(intent, normalizedQuery);
    
    // Generate relevant insights
    const insights = this.generateRelevantInsights(intent);

    return {
      id: `query-${Date.now()}`,
      query,
      response,
      insights,
      timestamp: new Date().toISOString(),
      userId,
    };
  }

  /**
   * Analyze the intent of the user's query
   */
  private analyzeQueryIntent(query: string): {
    type: 'performance' | 'optimization' | 'comparison' | 'trend' | 'budget' | 'general';
    entities: string[];
    timeframe?: string;
    metric?: string;
    platform?: string;
  } {
    const intent = {
      type: 'general' as const,
      entities: [] as string[],
    };

    // Performance queries
    if (query.includes('roi') || query.includes('roas') || query.includes('return')) {
      intent.type = 'performance';
      intent.metric = 'roas';
    } else if (query.includes('ctr') || query.includes('click-through')) {
      intent.type = 'performance';
      intent.metric = 'ctr';
    } else if (query.includes('cpa') || query.includes('cost per')) {
      intent.type = 'performance';
      intent.metric = 'cpa';
    } else if (query.includes('conversion')) {
      intent.type = 'performance';
      intent.metric = 'conversions';
    }

    // Optimization queries
    if (query.includes('optimize') || query.includes('improve') || query.includes('better')) {
      intent.type = 'optimization';
    }

    // Comparison queries
    if (query.includes('compare') || query.includes('vs') || query.includes('versus') || query.includes('best') || query.includes('worst')) {
      intent.type = 'comparison';
    }

    // Trend queries
    if (query.includes('trend') || query.includes('over time') || query.includes('dropped') || query.includes('increased')) {
      intent.type = 'trend';
    }

    // Budget queries
    if (query.includes('budget') || query.includes('spend') || query.includes('cost')) {
      intent.type = 'budget';
    }

    // Extract time entities
    if (query.includes('today')) intent.timeframe = 'today';
    else if (query.includes('yesterday')) intent.timeframe = 'yesterday';
    else if (query.includes('week')) intent.timeframe = 'week';
    else if (query.includes('month')) intent.timeframe = 'month';

    // Extract platform entities
    if (query.includes('facebook') || query.includes('meta')) intent.platform = 'meta';
    else if (query.includes('google')) intent.platform = 'google';
    else if (query.includes('linkedin')) intent.platform = 'linkedin';
    else if (query.includes('tiktok')) intent.platform = 'tiktok';

    return intent;
  }

  /**
   * Generate AI response based on query intent
   */
  private async generateResponse(intent: any, query: string): Promise<string> {
    switch (intent.type) {
      case 'performance':
        return this.generatePerformanceResponse(intent);
      case 'optimization':
        return this.generateOptimizationResponse(intent);
      case 'comparison':
        return this.generateComparisonResponse(intent);
      case 'trend':
        return this.generateTrendResponse(intent);
      case 'budget':
        return this.generateBudgetResponse(intent);
      default:
        return this.generateGeneralResponse(query);
    }
  }

  /**
   * Generate performance-focused response
   */
  private generatePerformanceResponse(intent: any): string {
    const filteredCampaigns = intent.platform 
      ? this.campaigns.filter(c => c.platform === intent.platform)
      : this.campaigns;

    if (filteredCampaigns.length === 0) {
      return "I don't have enough campaign data to analyze performance. Please ensure your ad platforms are connected and synced.";
    }

    const totalSpend = filteredCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalConversions = filteredCampaigns.reduce((sum, c) => sum + c.conversions, 0);
    const averageROAS = totalSpend > 0 ? (totalConversions * 100) / totalSpend : 0;
    const totalClicks = filteredCampaigns.reduce((sum, c) => sum + c.clicks, 0);
    const totalImpressions = filteredCampaigns.reduce((sum, c) => sum + c.impressions, 0);
    const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    const platformText = intent.platform ? ` on ${intent.platform.toUpperCase()}` : ' across all platforms';

    if (intent.metric === 'roas') {
      return `Your current ROAS${platformText} is ${averageROAS.toFixed(1)}%. ${
        averageROAS > 200 ? 'This is excellent performance! 🎉' :
        averageROAS > 150 ? 'This is good performance, but there\'s room for improvement.' :
        'This is below target. I recommend reviewing your targeting and ad creatives.'
      } You've spent $${totalSpend.toFixed(2)} and generated ${totalConversions} conversions.`;
    }

    if (intent.metric === 'ctr') {
      return `Your average CTR${platformText} is ${averageCTR.toFixed(2)}%. ${
        averageCTR > 2 ? 'This is excellent! Your ads are highly engaging.' :
        averageCTR > 1 ? 'This is decent, but you could improve ad relevance.' :
        'This is low. Consider refreshing your ad creatives and improving targeting.'
      } You've had ${totalClicks.toLocaleString()} clicks from ${totalImpressions.toLocaleString()} impressions.`;
    }

    return `Here's your performance summary${platformText}: ${averageROAS.toFixed(1)}% ROAS, ${averageCTR.toFixed(2)}% CTR, ${totalConversions} conversions from $${totalSpend.toFixed(2)} spend.`;
  }

  /**
   * Generate optimization recommendations
   */
  private generateOptimizationResponse(intent: any): string {
    const insights = AnalyticsService.generateInsights(this.campaigns, this.adGroups);
    const highPriorityInsights = insights.filter(i => i.severity === 'high').slice(0, 3);

    if (highPriorityInsights.length === 0) {
      return "Your campaigns are performing well! Here are some general optimization tips: 1) Test new ad creatives regularly, 2) Refine your targeting based on best-performing audiences, 3) Adjust bids based on performance data.";
    }

    let response = "Here are my top optimization recommendations:\n\n";
    highPriorityInsights.forEach((insight, index) => {
      response += `${index + 1}. **${insight.title}**\n   ${insight.recommendation}\n   ${insight.estimatedImpact}\n\n`;
    });

    return response;
  }

  /**
   * Generate comparison response
   */
  private generateComparisonResponse(intent: any): string {
    if (intent.platform) {
      const platformCampaigns = this.campaigns.filter(c => c.platform === intent.platform);
      const topPerformer = AnalyticsService.getTopPerformers(platformCampaigns, 'roas', 1)[0];
      const worstPerformer = AnalyticsService.getWorstPerformers(platformCampaigns, 'roas', 1)[0];

      if (!topPerformer || !worstPerformer) {
        return `I need more campaign data for ${intent.platform.toUpperCase()} to make meaningful comparisons.`;
      }

      return `On ${intent.platform.toUpperCase()}:\n🏆 **Best Performer**: ${topPerformer.name} (${topPerformer.roas.toFixed(1)}% ROAS)\n📉 **Needs Attention**: ${worstPerformer.name} (${worstPerformer.roas.toFixed(1)}% ROAS)\n\nConsider reallocating budget from underperformers to top performers.`;
    }

    const platformMetrics = AnalyticsService.calculatePlatformMetrics(this.campaigns);
    if (platformMetrics.length < 2) {
      return "I need data from multiple platforms to make comparisons. Please connect more ad platforms.";
    }

    const bestPlatform = platformMetrics.reduce((best, current) => 
      current.averageROAS > best.averageROAS ? current : best
    );

    let response = `**Platform Performance Comparison:**\n\n`;
    platformMetrics.forEach(platform => {
      const emoji = platform.platform === bestPlatform.platform ? '🏆' : '📊';
      response += `${emoji} **${platform.platform.toUpperCase()}**: ${platform.averageROAS.toFixed(1)}% ROAS, $${platform.totalSpend.toFixed(2)} spend, ${platform.totalConversions} conversions\n`;
    });

    return response;
  }

  /**
   * Generate trend analysis response
   */
  private generateTrendResponse(intent: any): string {
    const trends = AnalyticsService.calculateTrends(this.campaigns, 7);
    const recentTrend = trends.slice(-3);
    const avgRecentROAS = recentTrend.reduce((sum, t) => sum + t.roas, 0) / recentTrend.length;
    const avgRecentSpend = recentTrend.reduce((sum, t) => sum + t.spend, 0) / recentTrend.length;

    const olderTrend = trends.slice(0, 3);
    const avgOlderROAS = olderTrend.reduce((sum, t) => sum + t.roas, 0) / olderTrend.length;

    const roasChange = ((avgRecentROAS - avgOlderROAS) / avgOlderROAS) * 100;

    let response = `**Recent Performance Trends:**\n\n`;
    response += `📈 Average ROAS: ${avgRecentROAS.toFixed(1)}% (${roasChange > 0 ? '+' : ''}${roasChange.toFixed(1)}% vs last week)\n`;
    response += `💰 Daily Spend: $${avgRecentSpend.toFixed(2)}\n\n`;

    if (roasChange > 10) {
      response += "🎉 Great news! Your ROAS is trending upward. Keep doing what you're doing!";
    } else if (roasChange < -10) {
      response += "⚠️ Your ROAS has declined recently. Consider reviewing recent changes to campaigns, targeting, or creatives.";
    } else {
      response += "📊 Your performance is relatively stable. Consider testing new strategies to drive growth.";
    }

    return response;
  }

  /**
   * Generate budget-focused response
   */
  private generateBudgetResponse(intent: any): string {
    const totalSpend = this.campaigns.reduce((sum, c) => sum + c.spend, 0);
    const totalBudget = this.campaigns.reduce((sum, c) => sum + c.budget, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

    const highPerformers = AnalyticsService.getTopPerformers(this.campaigns, 'roas', 3);
    const lowPerformers = AnalyticsService.getWorstPerformers(this.campaigns, 'roas', 2);

    let response = `**Budget Analysis:**\n\n`;
    response += `💰 Total Spend: $${totalSpend.toFixed(2)}\n`;
    response += `📊 Budget Utilization: ${budgetUtilization.toFixed(1)}%\n\n`;

    if (highPerformers.length > 0) {
      response += `**Scale These Winners:**\n`;
      highPerformers.forEach(campaign => {
        response += `• ${campaign.name}: ${campaign.roas.toFixed(1)}% ROAS - Consider increasing budget\n`;
      });
      response += `\n`;
    }

    if (lowPerformers.length > 0) {
      response += `**Budget Reallocation Opportunities:**\n`;
      lowPerformers.forEach(campaign => {
        response += `• ${campaign.name}: ${campaign.roas.toFixed(1)}% ROAS - Consider reducing or pausing\n`;
      });
    }

    return response;
  }

  /**
   * Generate general response for unrecognized queries
   */
  private generateGeneralResponse(query: string): string {
    const totalCampaigns = this.campaigns.length;
    const activeCampaigns = this.campaigns.filter(c => c.status === 'active').length;
    const totalSpend = this.campaigns.reduce((sum, c) => sum + c.spend, 0);

    return `I'm here to help with your marketing analytics! Currently tracking ${totalCampaigns} campaigns (${activeCampaigns} active) with $${totalSpend.toFixed(2)} total spend.\n\nTry asking me:\n• "What's my ROI this week?"\n• "Which campaign is performing best?"\n• "How can I optimize my ad spend?"\n• "Compare Facebook vs Google performance"`;
  }

  /**
   * Generate relevant insights based on query intent
   */
  private generateRelevantInsights(intent: any): PerformanceInsight[] {
    const allInsights = AnalyticsService.generateInsights(this.campaigns, this.adGroups);
    
    // Filter insights based on query intent
    switch (intent.type) {
      case 'optimization':
        return allInsights.filter(i => i.type === 'budget_optimization' || i.type === 'ad_fatigue');
      case 'budget':
        return allInsights.filter(i => i.type === 'budget_optimization');
      case 'performance':
        return allInsights.filter(i => i.type === 'keyword_performance' || i.type === 'creative_performance');
      default:
        return allInsights.slice(0, 3); // Return top 3 insights
    }
  }

  /**
   * Update campaign data for the chat service
   */
  updateData(campaigns: Campaign[], adGroups: AdGroup[] = []): void {
    this.campaigns = campaigns;
    this.adGroups = adGroups;
  }

  /**
   * Get suggested queries based on current data
   */
  getSuggestedQueries(): string[] {
    const suggestions = [
      "What's my ROAS this month?",
      "Which campaigns need optimization?",
      "Compare platform performance",
      "Show me budget recommendations",
    ];

    // Add platform-specific suggestions if data exists
    const platforms = [...new Set(this.campaigns.map(c => c.platform))];
    if (platforms.includes('meta')) {
      suggestions.push("How is Facebook performing?");
    }
    if (platforms.includes('google')) {
      suggestions.push("What's my Google Ads ROI?");
    }

    // Add performance-specific suggestions
    const lowPerformers = this.campaigns.filter(c => c.roas < 100);
    if (lowPerformers.length > 0) {
      suggestions.push("Why are my conversions low?");
    }

    return suggestions.slice(0, 6);
  }
}
