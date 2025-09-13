import { AdInsight, InsightType, InsightContext, MetricsSnapshot, InsightGenerationRules } from '../types/insights';

export class MIAInsightEngine {
  private rules: InsightGenerationRules = {
    performanceThresholds: {
      criticalCtrDrop: 30, // 30% CTR drop
      roasTarget: 3.0, // 3:1 ROAS minimum
      qualityScoreMin: 5, // Quality score below 5
      frequencyMax: 3.5, // Frequency above 3.5
      conversionRateMin: 2.0, // 2% minimum conversion rate
      costIncreaseAlert: 25 // 25% cost increase
    },
    timeframesToAnalyze: {
      shortTerm: 7,
      mediumTerm: 30,
      longTerm: 90
    },
    confidenceThresholds: {
      minimumSpend: 100,
      minimumConversions: 5,
      minimumImpressions: 1000
    }
  };

  generateInsights(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    
    // Only generate insights if we have sufficient data
    if (!this.hasSufficientData(context.timeframe.current)) {
      return insights;
    }

    // Performance Analysis
    insights.push(...this.analyzePerformanceDecline(context));
    insights.push(...this.analyzeConversionIssues(context));
    insights.push(...this.analyzeROASPerformance(context));
    
    // Budget & Bidding Analysis
    insights.push(...this.analyzeBudgetUtilization(context));
    insights.push(...this.analyzeBiddingOpportunities(context));
    
    // Creative & Content Analysis
    insights.push(...this.analyzeAdFatigue(context));
    insights.push(...this.analyzeCreativePerformance(context));
    
    // Audience & Targeting Analysis
    insights.push(...this.analyzeAudiencePerformance(context));
    insights.push(...this.analyzePlacementOptimization(context));
    
    // Platform-Specific Analysis
    if (context.timeframe.current.google) {
      insights.push(...this.analyzeGoogleSpecificMetrics(context));
    }
    
    if (context.timeframe.current.meta) {
      insights.push(...this.analyzeMetaSpecificMetrics(context));
    }

    // Sort by severity and confidence
    return insights.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, opportunity: 4 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return b.confidence - a.confidence;
    });
  }

  private hasSufficientData(metrics: MetricsSnapshot): boolean {
    return metrics.cost >= this.rules.confidenceThresholds.minimumSpend &&
           metrics.impressions >= this.rules.confidenceThresholds.minimumImpressions;
  }

  private analyzePerformanceDecline(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current, previous } = context.timeframe;
    
    // CTR Decline Analysis
    if (previous.ctr > 0) {
      const ctrChange = ((current.ctr - previous.ctr) / previous.ctr) * 100;
      if (ctrChange <= -this.rules.performanceThresholds.criticalCtrDrop) {
        insights.push({
          id: `ctr_decline_${context.campaign.id}`,
          type: 'ctr_decline',
          severity: 'critical',
          title: 'Significant CTR Decline Detected',
          description: `Click-through rate has dropped by ${Math.abs(ctrChange).toFixed(1)}% compared to the previous period (${previous.ctr.toFixed(2)}% → ${current.ctr.toFixed(2)}%). This indicates potential ad fatigue, audience saturation, or increased competition.`,
          recommendation: 'Refresh ad creatives, test new audiences, or adjust bidding strategy. Consider pausing underperforming ads and launching new creative variations.',
          estimatedImpact: `Potential to recover ${Math.abs(ctrChange * 0.6).toFixed(1)}% CTR improvement`,
          confidence: 85,
          dataPoints: ['ctr', 'impressions', 'clicks'],
          platform: context.timeframe.current.google ? 'google' : 'meta',
          campaignId: context.campaign.id,
          timeframe: '7-day comparison',
          actionable: true,
          automationPossible: false
        });
      }
    }

    return insights;
  }

  private analyzeConversionIssues(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current, previous, baseline } = context.timeframe;
    
    // Conversion Rate Drop
    if (current.conversions >= this.rules.confidenceThresholds.minimumConversions) {
      if (previous.conversionRate > 0) {
        const conversionChange = ((current.conversionRate - previous.conversionRate) / previous.conversionRate) * 100;
        if (conversionChange <= -20) {
          insights.push({
            id: `conversion_drop_${context.campaign.id}`,
            type: 'conversion_drop',
            severity: 'high',
            title: 'Conversion Rate Decline',
            description: `Conversion rate has dropped by ${Math.abs(conversionChange).toFixed(1)}% from ${previous.conversionRate.toFixed(2)}% to ${current.conversionRate.toFixed(2)}%. This may indicate issues with landing page, offer relevance, or targeting quality.`,
            recommendation: 'Review landing page experience, check for technical issues, validate tracking setup, and consider audience refinement.',
            estimatedImpact: `Potential revenue recovery: $${((current.clicks * (previous.conversionRate / 100) - current.conversions) * (current.cost / current.conversions)).toFixed(0)}`,
            confidence: 80,
            dataPoints: ['conversionRate', 'conversions', 'clicks'],
            platform: context.timeframe.current.google ? 'google' : 'meta',
            campaignId: context.campaign.id,
            timeframe: 'Period comparison',
            actionable: true,
            automationPossible: false
          });
        }
      }
    }

    return insights;
  }

  private analyzeROASPerformance(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current } = context.timeframe;
    
    if (current.roas < this.rules.performanceThresholds.roasTarget) {
      const severity = current.roas < 1 ? 'critical' : current.roas < 2 ? 'high' : 'medium';
      
      insights.push({
        id: `roas_below_target_${context.campaign.id}`,
        type: 'roas_below_target',
        severity,
        title: 'ROAS Below Target',
        description: `Current ROAS of ${current.roas.toFixed(2)}:1 is below the target of ${this.rules.performanceThresholds.roasTarget}:1. ${current.roas < 1 ? 'Campaign is losing money on every conversion.' : 'Campaign profitability is suboptimal.'}`,
        recommendation: current.roas < 1 
          ? 'Immediate action required: Pause underperforming ads, increase bids on high-converting keywords/audiences, or reduce budget until optimization is complete.'
          : 'Optimize for higher-value audiences, improve landing page conversion rate, or adjust bidding strategy to focus on profitable segments.',
        estimatedImpact: `Potential profit increase: $${((this.rules.performanceThresholds.roasTarget - current.roas) * current.cost).toFixed(0)}`,
        confidence: 90,
        dataPoints: ['roas', 'cost', 'conversionValue'],
        platform: context.timeframe.current.google ? 'google' : 'meta',
        campaignId: context.campaign.id,
        timeframe: 'Current period',
        actionable: true,
        automationPossible: true
      });
    }

    return insights;
  }

  private analyzeBudgetUtilization(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current } = context.timeframe;
    const dailySpend = current.cost / this.rules.timeframesToAnalyze.shortTerm;
    const budgetUtilization = (dailySpend / context.campaign.budget) * 100;
    
    if (budgetUtilization > 95) {
      insights.push({
        id: `budget_exhaustion_${context.campaign.id}`,
        type: 'budget_exhaustion',
        severity: 'high',
        title: 'Budget Exhaustion Risk',
        description: `Campaign is utilizing ${budgetUtilization.toFixed(1)}% of daily budget, potentially limiting reach and missing conversion opportunities.`,
        recommendation: 'Consider increasing daily budget, optimize bids to reduce CPC, or reallocate budget from underperforming campaigns.',
        estimatedImpact: 'Potential 15-30% increase in conversions with budget increase',
        confidence: 85,
        dataPoints: ['cost', 'budget', 'impressions'],
        platform: context.timeframe.current.google ? 'google' : 'meta',
        campaignId: context.campaign.id,
        timeframe: 'Daily average',
        actionable: true,
        automationPossible: true
      });
    } else if (budgetUtilization < 50) {
      insights.push({
        id: `budget_underutilization_${context.campaign.id}`,
        type: 'budget_underutilization',
        severity: 'medium',
        title: 'Budget Underutilization',
        description: `Campaign is only using ${budgetUtilization.toFixed(1)}% of available budget, indicating potential for increased reach or targeting expansion.`,
        recommendation: 'Expand targeting, increase bids, or consider broader keyword/audience matching to utilize full budget potential.',
        estimatedImpact: 'Opportunity to double current performance with proper budget utilization',
        confidence: 75,
        dataPoints: ['cost', 'budget', 'reach'],
        platform: context.timeframe.current.google ? 'google' : 'meta',
        campaignId: context.campaign.id,
        timeframe: 'Daily average',
        actionable: true,
        automationPossible: true
      });
    }

    return insights;
  }

  private analyzeBiddingOpportunities(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current } = context.timeframe;
    const { benchmarks } = context;
    
    // CPA vs Industry Benchmark
    if (benchmarks.industry.cpa > 0) {
      const cpaDifference = ((current.cpa - benchmarks.industry.cpa) / benchmarks.industry.cpa) * 100;
      
      if (cpaDifference > 50) {
        insights.push({
          id: `high_cpa_${context.campaign.id}`,
          type: 'bid_optimization',
          severity: 'high',
          title: 'Cost Per Acquisition Above Industry Average',
          description: `Current CPA of $${current.cpa.toFixed(2)} is ${cpaDifference.toFixed(1)}% higher than industry average of $${benchmarks.industry.cpa.toFixed(2)}.`,
          recommendation: 'Optimize targeting to focus on higher-converting audiences, improve Quality Score, or test automated bidding strategies.',
          estimatedImpact: `Potential cost savings: $${((current.cpa - benchmarks.industry.cpa) * current.conversions).toFixed(0)}`,
          confidence: 75,
          dataPoints: ['cpa', 'conversions', 'cost'],
          platform: context.timeframe.current.google ? 'google' : 'meta',
          campaignId: context.campaign.id,
          timeframe: 'Industry comparison',
          actionable: true,
          automationPossible: true
        });
      }
    }

    return insights;
  }

  private analyzeAdFatigue(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current } = context.timeframe;
    
    // Meta-specific frequency analysis
    if (current.meta && current.meta.frequency > this.rules.performanceThresholds.frequencyMax) {
      insights.push({
        id: `ad_fatigue_${context.campaign.id}`,
        type: 'ad_fatigue',
        severity: 'medium',
        title: 'Ad Fatigue Detected',
        description: `Average frequency of ${current.meta.frequency.toFixed(2)} indicates users are seeing ads too often, which can lead to decreased performance and negative user experience.`,
        recommendation: 'Refresh creative assets, expand audience size, or implement frequency capping to prevent overexposure.',
        estimatedImpact: 'Expected 10-20% CTR improvement with creative refresh',
        confidence: 80,
        dataPoints: ['frequency', 'ctr', 'reach'],
        platform: 'meta',
        campaignId: context.campaign.id,
        timeframe: 'Current period',
        actionable: true,
        automationPossible: false
      });
    }

    return insights;
  }

  private analyzeCreativePerformance(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    
    // This would typically compare multiple creatives within the campaign
    // For now, providing a framework for creative analysis
    
    return insights;
  }

  private analyzeAudiencePerformance(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const { current } = context.timeframe;
    const { benchmarks } = context;
    
    // Compare performance against account average
    if (benchmarks.account.ctr > 0) {
      const ctrVsAccount = ((current.ctr - benchmarks.account.ctr) / benchmarks.account.ctr) * 100;
      
      if (ctrVsAccount > 50) {
        insights.push({
          id: `high_performing_audience_${context.campaign.id}`,
          type: 'demographic_opportunity',
          severity: 'opportunity',
          title: 'High-Performing Audience Identified',
          description: `This campaign's CTR of ${current.ctr.toFixed(2)}% is ${ctrVsAccount.toFixed(1)}% higher than account average, indicating strong audience-ad fit.`,
          recommendation: 'Consider expanding this audience targeting to other campaigns or increasing budget allocation to capitalize on high engagement.',
          estimatedImpact: 'Opportunity to scale successful targeting approach',
          confidence: 85,
          dataPoints: ['ctr', 'audience', 'engagement'],
          platform: context.timeframe.current.google ? 'google' : 'meta',
          campaignId: context.campaign.id,
          timeframe: 'Account comparison',
          actionable: true,
          automationPossible: true
        });
      }
    }

    return insights;
  }

  private analyzePlacementOptimization(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    
    // Placement analysis would require breakdown data
    // Framework for future implementation
    
    return insights;
  }

  private analyzeGoogleSpecificMetrics(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const google = context.timeframe.current.google!;
    
    // Quality Score Analysis
    if (google.qualityScore < this.rules.performanceThresholds.qualityScoreMin) {
      insights.push({
        id: `quality_score_${context.campaign.id}`,
        type: 'quality_score_drop',
        severity: 'high',
        title: 'Low Quality Score Impact',
        description: `Quality Score of ${google.qualityScore}/10 is below recommended threshold, leading to higher CPCs and reduced ad visibility.`,
        recommendation: 'Improve ad relevance, landing page experience, and expected CTR through better keyword-ad-landing page alignment.',
        estimatedImpact: 'Potential 20-40% CPC reduction with Quality Score improvement',
        confidence: 90,
        dataPoints: ['qualityScore', 'cpc', 'impressionShare'],
        platform: 'google',
        campaignId: context.campaign.id,
        timeframe: 'Current',
        actionable: true,
        automationPossible: false
      });
    }

    // Impression Share Analysis
    if (google.impressionShare < 70) {
      insights.push({
        id: `impression_share_${context.campaign.id}`,
        type: 'impression_share_loss',
        severity: 'medium',
        title: 'Low Search Impression Share',
        description: `Impression share of ${google.impressionShare.toFixed(1)}% indicates missed opportunities due to budget or rank limitations.`,
        recommendation: 'Increase bids, improve Quality Score, or raise budget to capture more available impressions.',
        estimatedImpact: `Potential ${((100 - google.impressionShare) * 0.3).toFixed(0)}% traffic increase`,
        confidence: 80,
        dataPoints: ['impressionShare', 'budget', 'qualityScore'],
        platform: 'google',
        campaignId: context.campaign.id,
        timeframe: 'Current',
        actionable: true,
        automationPossible: true
      });
    }

    return insights;
  }

  private analyzeMetaSpecificMetrics(context: InsightContext): AdInsight[] {
    const insights: AdInsight[] = [];
    const meta = context.timeframe.current.meta!;
    
    // Quality Ranking Analysis
    if (meta.qualityRanking === 'below_average') {
      insights.push({
        id: `meta_quality_${context.campaign.id}`,
        type: 'creative_underperforming',
        severity: 'high',
        title: 'Below Average Quality Ranking',
        description: 'Meta has rated this ad\'s quality as below average, which may result in higher costs and reduced delivery.',
        recommendation: 'Refresh creative content, ensure ad relevance to target audience, and improve post-click experience.',
        estimatedImpact: 'Expected 15-25% cost reduction with quality improvement',
        confidence: 85,
        dataPoints: ['qualityRanking', 'engagementRanking', 'cpm'],
        platform: 'meta',
        campaignId: context.campaign.id,
        timeframe: 'Current',
        actionable: true,
        automationPossible: false
      });
    }

    // Video Completion Analysis
    if (meta.videoCompletionRate < 25) {
      insights.push({
        id: `video_completion_${context.campaign.id}`,
        type: 'video_completion_low',
        severity: 'medium',
        title: 'Low Video Completion Rate',
        description: `Video completion rate of ${meta.videoCompletionRate.toFixed(1)}% suggests content may not be engaging enough to hold viewer attention.`,
        recommendation: 'Create more engaging opening seconds, optimize video length, add captions, or test different creative formats.',
        estimatedImpact: 'Potential 30-50% improvement in engagement with optimized content',
        confidence: 75,
        dataPoints: ['videoCompletionRate', 'videoViews', 'engagementRate'],
        platform: 'meta',
        campaignId: context.campaign.id,
        timeframe: 'Current',
        actionable: true,
        automationPossible: false
      });
    }

    return insights;
  }
}
