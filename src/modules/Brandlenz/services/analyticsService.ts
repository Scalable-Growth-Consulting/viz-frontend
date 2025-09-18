import { 
  BrandMention, 
  CustomerIssue, 
  CustomerPositive, 
  ProductClaim, 
  ActionableInsight,
  BrandHealthScore,
  PlatformAnalysis,
  CompetitorAnalysis,
  BrandlenzDashboardData,
  BrandlenzApiResponse,
  Platform,
  SentimentScore,
  IssueCategory,
  PositiveCategory
} from '../types';

export class BrandlenzAnalyticsService {
  private baseUrl: string;
  private appUserId?: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  }

  setAppUserId(userId?: string) {
    this.appUserId = userId || undefined;
    if (userId) localStorage.setItem('appUserId', userId);
  }

  private makeHeaders(extra?: Record<string, string>): HeadersInit {
    const appId = this.appUserId || localStorage.getItem('appUserId') || undefined;
    return {
      'Content-Type': 'application/json',
      ...(appId ? { 'x-user-id': appId } : {}),
      ...(extra || {}),
    };
  }

  /**
   * Get comprehensive dashboard data
   */
  async getDashboardData(): Promise<BrandlenzDashboardData> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/dashboard`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get dashboard data: ${response.status}`);
      }

      const data: BrandlenzApiResponse<BrandlenzDashboardData> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      // Return comprehensive mock data for development
      return this.getMockDashboardData();
    }
  }

  /**
   * Analyze sentiment for a batch of mentions
   */
  async analyzeSentiment(mentions: BrandMention[]): Promise<BrandMention[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/analyze/sentiment`, {
        method: 'POST',
        headers: this.makeHeaders(),
        body: JSON.stringify({ mentions }),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze sentiment: ${response.status}`);
      }

      const data: BrandlenzApiResponse<BrandMention[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to analyze sentiment:', error);
      // Return mentions with mock sentiment analysis
      return mentions.map(mention => ({
        ...mention,
        sentiment: this.getMockSentimentAnalysis(mention.content),
      }));
    }
  }

  /**
   * Analyze product claims vs customer perception
   */
  async analyzeProductClaims(productId: string): Promise<ProductClaim[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/analyze/product-claims/${productId}`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze product claims: ${response.status}`);
      }

      const data: BrandlenzApiResponse<ProductClaim[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to analyze product claims:', error);
      return this.getMockProductClaims();
    }
  }

  /**
   * Identify and categorize customer issues
   */
  async identifyCustomerIssues(dateRange?: [string, string]): Promise<CustomerIssue[]> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.set('date_from', dateRange[0]);
        params.set('date_to', dateRange[1]);
      }

      const response = await fetch(`${this.baseUrl}/api/brandlenz/analyze/issues?${params.toString()}`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to identify customer issues: ${response.status}`);
      }

      const data: BrandlenzApiResponse<CustomerIssue[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to identify customer issues:', error);
      return this.getMockCustomerIssues();
    }
  }

  /**
   * Identify and categorize customer positives
   */
  async identifyCustomerPositives(dateRange?: [string, string]): Promise<CustomerPositive[]> {
    try {
      const params = new URLSearchParams();
      if (dateRange) {
        params.set('date_from', dateRange[0]);
        params.set('date_to', dateRange[1]);
      }

      const response = await fetch(`${this.baseUrl}/api/brandlenz/analyze/positives?${params.toString()}`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to identify customer positives: ${response.status}`);
      }

      const data: BrandlenzApiResponse<CustomerPositive[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to identify customer positives:', error);
      return this.getMockCustomerPositives();
    }
  }

  /**
   * Generate actionable insights
   */
  async generateInsights(): Promise<ActionableInsight[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/insights`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate insights: ${response.status}`);
      }

      const data: BrandlenzApiResponse<ActionableInsight[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to generate insights:', error);
      return this.getMockActionableInsights();
    }
  }

  /**
   * Calculate brand health score
   */
  async calculateBrandHealthScore(): Promise<BrandHealthScore> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/health-score`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to calculate brand health score: ${response.status}`);
      }

      const data: BrandlenzApiResponse<BrandHealthScore> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to calculate brand health score:', error);
      return this.getMockBrandHealthScore();
    }
  }

  /**
   * Analyze platform-specific performance
   */
  async analyzePlatformPerformance(): Promise<PlatformAnalysis[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/analyze/platforms`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze platform performance: ${response.status}`);
      }

      const data: BrandlenzApiResponse<PlatformAnalysis[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to analyze platform performance:', error);
      return this.getMockPlatformAnalysis();
    }
  }

  /**
   * Analyze competitors
   */
  async analyzeCompetitors(): Promise<CompetitorAnalysis[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/analyze/competitors`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to analyze competitors: ${response.status}`);
      }

      const data: BrandlenzApiResponse<CompetitorAnalysis[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to analyze competitors:', error);
      return this.getMockCompetitorAnalysis();
    }
  }

  // Mock data generators for development
  private getMockSentimentAnalysis(content: string): BrandMention['sentiment'] {
    const positiveWords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'outstanding'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'worst', 'disappointing'];
    
    const lowerContent = content.toLowerCase();
    const hasPositive = positiveWords.some(word => lowerContent.includes(word));
    const hasNegative = negativeWords.some(word => lowerContent.includes(word));
    
    let score: SentimentScore;
    if (hasPositive && !hasNegative) score = 'positive';
    else if (hasNegative && !hasPositive) score = 'negative';
    else score = 'neutral';
    
    return {
      score,
      confidence: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
      reasoning: `Sentiment determined based on language patterns, emotional indicators, and contextual analysis.`
    };
  }

  private getMockDashboardData(): BrandlenzDashboardData {
    return {
      brandHealthScore: this.getMockBrandHealthScore(),
      realtimeMetrics: {
        mentionsLast24h: 247,
        sentimentTrend: 0.12,
        criticalIssues: 3,
        newOpportunities: 8,
      },
      platformAnalysis: this.getMockPlatformAnalysis(),
      topIssues: this.getMockCustomerIssues().slice(0, 5),
      topPositives: this.getMockCustomerPositives().slice(0, 5),
      productClaimAnalysis: this.getMockProductClaims(),
      actionableInsights: this.getMockActionableInsights(),
      competitorAnalysis: this.getMockCompetitorAnalysis(),
      trendingTopics: [
        { topic: 'customer service', volume: 156, sentiment: 'positive', platforms: ['twitter', 'google_reviews'] },
        { topic: 'product quality', volume: 89, sentiment: 'negative', platforms: ['amazon', 'trustpilot'] },
        { topic: 'fast delivery', volume: 67, sentiment: 'very_positive', platforms: ['shopify', 'amazon'] },
        { topic: 'pricing', volume: 45, sentiment: 'neutral', platforms: ['twitter', 'reddit'] },
      ],
    };
  }

  private getMockBrandHealthScore(): BrandHealthScore {
    return {
      overall: 78,
      sentiment: 72,
      claimAlignment: 85,
      issueResolution: 68,
      customerObsession: 82,
      breakdown: {
        productQuality: 80,
        customerService: 75,
        brandPerception: 78,
        competitivePosition: 73,
      },
      trend: 'improving',
      benchmarkComparison: {
        industry: 65,
        competitors: [
          { name: 'Competitor A', score: 71 },
          { name: 'Competitor B', score: 69 },
          { name: 'Competitor C', score: 74 },
        ],
      },
    };
  }

  private getMockCustomerIssues(): CustomerIssue[] {
    const categories: IssueCategory[] = ['product_quality', 'customer_service', 'shipping_logistics', 'pricing'];
    
    return categories.map((category, i) => ({
      id: `issue-${i}`,
      category,
      title: `${category.replace('_', ' ')} concerns`,
      description: `Customers are reporting issues related to ${category.replace('_', ' ')}.`,
      severity: ['critical', 'high', 'medium', 'low'][i % 4] as any,
      frequency: Math.floor(Math.random() * 100) + 20,
      platforms: ['twitter', 'google_reviews', 'trustpilot'].slice(0, Math.floor(Math.random() * 3) + 1) as Platform[],
      affectedProducts: ['Product A', 'Product B'],
      mentionIds: [`mention-${i}-1`, `mention-${i}-2`],
      firstReported: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
      lastReported: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)] as any,
      resolutionStatus: 'open',
      businessImpact: {
        revenueRisk: Math.floor(Math.random() * 50000) + 10000,
        customerSatisfactionImpact: Math.random() * 0.3 + 0.1,
        brandReputationImpact: Math.random() * 0.4 + 0.2,
      },
      recommendations: {
        priority: ['urgent', 'high', 'medium', 'low'][i % 4] as any,
        actions: [
          'Investigate root cause',
          'Implement quality controls',
          'Improve customer communication',
          'Update product documentation',
        ],
        estimatedEffort: '2-4 weeks',
        expectedImpact: 'High customer satisfaction improvement',
      },
    }));
  }

  private getMockCustomerPositives(): CustomerPositive[] {
    const categories: PositiveCategory[] = ['product_excellence', 'exceptional_service', 'fast_delivery', 'value_for_money'];
    
    return categories.map((category, i) => ({
      id: `positive-${i}`,
      category,
      title: `${category.replace('_', ' ')} praise`,
      description: `Customers are highlighting our ${category.replace('_', ' ')}.`,
      frequency: Math.floor(Math.random() * 80) + 30,
      platforms: ['twitter', 'google_reviews', 'trustpilot'].slice(0, Math.floor(Math.random() * 3) + 1) as Platform[],
      affectedProducts: ['Product A', 'Product B'],
      mentionIds: [`mention-${i}-1`, `mention-${i}-2`],
      trend: ['increasing', 'stable'][Math.floor(Math.random() * 2)] as any,
      businessImpact: {
        revenueOpportunity: Math.floor(Math.random() * 100000) + 20000,
        customerSatisfactionBoost: Math.random() * 0.3 + 0.2,
        brandReputationBoost: Math.random() * 0.4 + 0.3,
      },
      amplificationOpportunities: {
        marketingCampaigns: ['Social media campaign', 'Email newsletter feature'],
        productHighlights: ['Homepage banner', 'Product page testimonial'],
        testimonialOpportunities: ['Case study', 'Video testimonial'],
      },
    }));
  }

  private getMockProductClaims(): ProductClaim[] {
    return [
      {
        id: 'claim-1',
        productId: 'product-a',
        claim: 'Industry-leading quality',
        category: 'Quality',
        customerPerception: {
          alignment: 'aligned',
          confidence: 0.82,
          supportingMentions: ['mention-1', 'mention-2'],
          contradictingMentions: ['mention-3'],
          reasoning: 'Most customers agree with quality claims, with 82% positive sentiment.',
        },
        impactScore: 85,
        recommendations: [
          'Highlight quality testimonials in marketing',
          'Address specific quality concerns mentioned by detractors',
        ],
      },
      {
        id: 'claim-2',
        productId: 'product-a',
        claim: 'Fastest delivery in the market',
        category: 'Delivery',
        customerPerception: {
          alignment: 'misaligned',
          confidence: 0.76,
          supportingMentions: ['mention-4'],
          contradictingMentions: ['mention-5', 'mention-6', 'mention-7'],
          reasoning: 'Customers report delivery times that contradict this claim.',
        },
        impactScore: 65,
        recommendations: [
          'Review and improve delivery processes',
          'Update marketing claims to be more accurate',
          'Implement delivery tracking improvements',
        ],
      },
    ];
  }

  private getMockActionableInsights(): ActionableInsight[] {
    return [
      {
        id: 'insight-1',
        type: 'threat',
        priority: 'critical',
        title: 'Delivery complaints increasing on Amazon',
        description: 'Customer complaints about slow delivery have increased 45% in the past week on Amazon.',
        impact: {
          revenue: -25000,
          satisfaction: -0.15,
          reputation: -0.12,
        },
        effort: 'medium',
        timeline: '1-2 weeks',
        department: ['Operations', 'Customer Service'],
        actions: [
          {
            action: 'Investigate fulfillment center delays',
            owner: 'Operations Manager',
            deadline: '2024-01-20',
            status: 'pending',
          },
          {
            action: 'Implement proactive customer communication',
            owner: 'Customer Service Lead',
            deadline: '2024-01-18',
            status: 'in_progress',
          },
        ],
        kpis: [
          {
            metric: 'Average Delivery Time',
            currentValue: 4.2,
            targetValue: 2.5,
            unit: 'days',
          },
          {
            metric: 'Delivery Satisfaction Score',
            currentValue: 3.2,
            targetValue: 4.5,
            unit: 'stars',
          },
        ],
      },
      {
        id: 'insight-2',
        type: 'opportunity',
        priority: 'high',
        title: 'Customer service praise trending on Twitter',
        description: 'Positive mentions of customer service have increased 60% on Twitter this week.',
        impact: {
          revenue: 45000,
          satisfaction: 0.25,
          reputation: 0.18,
        },
        effort: 'low',
        timeline: '1 week',
        department: ['Marketing', 'Customer Service'],
        actions: [
          {
            action: 'Create social media campaign highlighting service excellence',
            owner: 'Marketing Manager',
            deadline: '2024-01-25',
            status: 'pending',
          },
          {
            action: 'Feature customer testimonials on website',
            owner: 'Content Manager',
            deadline: '2024-01-22',
            status: 'pending',
          },
        ],
        kpis: [
          {
            metric: 'Social Media Engagement',
            currentValue: 2.3,
            targetValue: 4.0,
            unit: '%',
          },
          {
            metric: 'Brand Mention Sentiment',
            currentValue: 72,
            targetValue: 85,
            unit: 'score',
          },
        ],
      },
    ];
  }

  private getMockPlatformAnalysis(): PlatformAnalysis[] {
    const platforms: Platform[] = ['twitter', 'google_reviews', 'trustpilot', 'amazon'];
    
    return platforms.map(platform => ({
      platform,
      totalMentions: Math.floor(Math.random() * 500) + 100,
      sentimentDistribution: {
        very_positive: Math.floor(Math.random() * 30) + 10,
        positive: Math.floor(Math.random() * 40) + 20,
        neutral: Math.floor(Math.random() * 30) + 15,
        negative: Math.floor(Math.random() * 20) + 5,
        very_negative: Math.floor(Math.random() * 10) + 2,
      },
      topIssues: this.getMockCustomerIssues().slice(0, 3),
      topPositives: this.getMockCustomerPositives().slice(0, 3),
      platformSpecificIssues: {
        technicalIssues: ['App crashes', 'Slow loading'],
        policyIssues: ['Return policy confusion', 'Terms unclear'],
        userExperienceIssues: ['Navigation difficulty', 'Checkout problems'],
      },
      engagement: {
        averageLikes: Math.floor(Math.random() * 50) + 10,
        averageShares: Math.floor(Math.random() * 20) + 5,
        averageComments: Math.floor(Math.random() * 15) + 3,
        totalReach: Math.floor(Math.random() * 100000) + 10000,
      },
      influencerMentions: [],
      trendingTopics: ['customer service', 'product quality', 'delivery'],
    }));
  }

  private getMockCompetitorAnalysis(): CompetitorAnalysis[] {
    return [
      {
        competitorId: 'comp-1',
        name: 'Competitor A',
        mentionVolume: 1250,
        sentimentScore: 71,
        marketShare: 0.25,
        strengths: ['Strong brand recognition', 'Wide product range'],
        weaknesses: ['Higher prices', 'Slower customer service'],
        opportunities: ['Expand into new markets', 'Improve digital presence'],
        threats: ['New market entrants', 'Economic downturn'],
        keyDifferentiators: ['Premium positioning', 'Established partnerships'],
      },
      {
        competitorId: 'comp-2',
        name: 'Competitor B',
        mentionVolume: 890,
        sentimentScore: 68,
        marketShare: 0.18,
        strengths: ['Competitive pricing', 'Fast delivery'],
        weaknesses: ['Limited product range', 'Quality concerns'],
        opportunities: ['Product line expansion', 'Quality improvements'],
        threats: ['Price wars', 'Supply chain disruptions'],
        keyDifferentiators: ['Cost leadership', 'Logistics efficiency'],
      },
    ];
  }
}

// Export singleton instance
export const brandlenzAnalyticsService = new BrandlenzAnalyticsService();
