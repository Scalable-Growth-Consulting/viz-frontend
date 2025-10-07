// Core Brandlenz Types for Social Listening & Brand Intelligence

export type Platform = 
  | 'twitter' 
  | 'google_reviews' 
  | 'trustpilot' 
  | 'amazon' 
  | 'shopify' 
  | 'wordpress' 
  | 'facebook' 
  | 'instagram' 
  | 'linkedin' 
  | 'reddit' 
  | 'youtube';

export type SentimentScore = 'very_positive' | 'positive' | 'neutral' | 'negative' | 'very_negative';

export type IssueCategory = 
  | 'product_quality' 
  | 'customer_service' 
  | 'shipping_logistics' 
  | 'pricing' 
  | 'user_experience' 
  | 'platform_technical' 
  | 'brand_perception' 
  | 'competitor_comparison';

export type PositiveCategory = 
  | 'product_excellence' 
  | 'exceptional_service' 
  | 'fast_delivery' 
  | 'value_for_money' 
  | 'user_friendly' 
  | 'brand_loyalty' 
  | 'innovation' 
  | 'sustainability';

export interface BrandMention {
  id: string;
  platform: Platform;
  content: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    followerCount?: number;
    verifiedStatus: boolean;
    profileImage?: string;
  };
  timestamp: string;
  url: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  sentiment: {
    score: SentimentScore;
    confidence: number;
    reasoning: string;
  };
  topics: string[];
  productMentions: string[];
  location?: {
    country: string;
    city?: string;
    coordinates?: [number, number];
  };
  language: string;
  isVerified: boolean;
  parentId?: string; // For replies/comments
  threadId?: string;
}

export interface ProductClaim {
  id: string;
  productId: string;
  claim: string;
  category: string;
  customerPerception: {
    alignment: 'strongly_aligned' | 'aligned' | 'neutral' | 'misaligned' | 'strongly_misaligned';
    confidence: number;
    supportingMentions: string[];
    contradictingMentions: string[];
    reasoning: string;
  };
  impactScore: number;
  recommendations: string[];
}

export interface CustomerIssue {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  frequency: number;
  platforms: Platform[];
  affectedProducts: string[];
  mentionIds: string[];
  firstReported: string;
  lastReported: string;
  trend: 'increasing' | 'stable' | 'decreasing';
  resolutionStatus: 'open' | 'investigating' | 'resolved' | 'wont_fix';
  businessImpact: {
    revenueRisk: number;
    customerSatisfactionImpact: number;
    brandReputationImpact: number;
  };
  recommendations: {
    priority: 'urgent' | 'high' | 'medium' | 'low';
    actions: string[];
    estimatedEffort: string;
    expectedImpact: string;
  };
}

export interface CustomerPositive {
  id: string;
  category: PositiveCategory;
  title: string;
  description: string;
  frequency: number;
  platforms: Platform[];
  affectedProducts: string[];
  mentionIds: string[];
  trend: 'increasing' | 'stable' | 'decreasing';
  businessImpact: {
    revenueOpportunity: number;
    customerSatisfactionBoost: number;
    brandReputationBoost: number;
  };
  amplificationOpportunities: {
    marketingCampaigns: string[];
    productHighlights: string[];
    testimonialOpportunities: string[];
  };
}

export interface PlatformAnalysis {
  platform: Platform;
  totalMentions: number;
  sentimentDistribution: Record<SentimentScore, number>;
  topIssues: CustomerIssue[];
  topPositives: CustomerPositive[];
  platformSpecificIssues: {
    technicalIssues: string[];
    policyIssues: string[];
    userExperienceIssues: string[];
  };
  engagement: {
    averageLikes: number;
    averageShares: number;
    averageComments: number;
    totalReach: number;
  };
  influencerMentions: BrandMention[];
  trendingTopics: string[];
}

export interface BrandHealthScore {
  overall: number;
  sentiment: number;
  claimAlignment: number;
  issueResolution: number;
  customerObsession: number;
  breakdown: {
    productQuality: number;
    customerService: number;
    brandPerception: number;
    competitivePosition: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  benchmarkComparison: {
    industry: number;
    competitors: Array<{
      name: string;
      score: number;
    }>;
  };
}

export interface ActionableInsight {
  id: string;
  type: 'opportunity' | 'threat' | 'improvement' | 'amplification';
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: {
    revenue: number;
    satisfaction: number;
    reputation: number;
  };
  effort: 'low' | 'medium' | 'high';
  timeline: string;
  department: string[];
  actions: Array<{
    action: string;
    owner: string;
    deadline: string;
    status: 'pending' | 'in_progress' | 'completed';
  }>;
  kpis: Array<{
    metric: string;
    currentValue: number;
    targetValue: number;
    unit: string;
  }>;
}

export interface CompetitorAnalysis {
  competitorId: string;
  name: string;
  mentionVolume: number;
  sentimentScore: number;
  marketShare: number;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  keyDifferentiators: string[];
}

export interface BrandlenzDashboardData {
  brandHealthScore: BrandHealthScore;
  realtimeMetrics: {
    mentionsLast24h: number;
    sentimentTrend: number;
    criticalIssues: number;
    newOpportunities: number;
  };
  platformAnalysis: PlatformAnalysis[];
  topIssues: CustomerIssue[];
  topPositives: CustomerPositive[];
  productClaimAnalysis: ProductClaim[];
  actionableInsights: ActionableInsight[];
  competitorAnalysis: CompetitorAnalysis[];
  trendingTopics: Array<{
    topic: string;
    volume: number;
    sentiment: SentimentScore;
    platforms: Platform[];
  }>;
}

export interface IntegrationStatus {
  platform: Platform;
  connected: boolean;
  lastSync?: string;
  status: 'active' | 'error' | 'syncing' | 'paused';
  error?: string;
  errorMessage?: string;
  accountInfo?: {
    name?: string;
    username?: string;
    id?: string;
  };
  dataPoints?: {
    totalMentions: number;
    lastMentionDate: string;
    avgDailyMentions: number;
  };
  configuration?: {
    keywords: string[];
    languages: string[];
    regions: string[];
    includeReplies: boolean;
    minimumEngagement: number;
  };
}

export interface BrandlenzConfig {
  brandName: string;
  brandKeywords: string[];
  productNames: string[];
  competitorNames: string[];
  monitoringLanguages: string[];
  monitoringRegions: string[];
  alertThresholds: {
    criticalSentimentDrop: number;
    viralMentionThreshold: number;
    issueFrequencyAlert: number;
  };
  integrations: IntegrationStatus[];
}

// API Response Types
export interface BrandlenzApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Hook Return Types
export interface UseBrandlenzReturn {
  dashboardData: BrandlenzDashboardData | null;
  integrationStatuses: IntegrationStatus[];
  loading: Record<string, boolean>;
  error: string | null;
  refreshData: () => Promise<void>;
  updateConfig: (config: Partial<BrandlenzConfig>) => Promise<void>;
  connectPlatform: (platform: Platform) => Promise<void>;
  disconnectPlatform: (platform: Platform) => Promise<void>;
  syncPlatform: (platform: Platform) => Promise<void>;
}

export interface UseMentionsReturn {
  mentions: BrandMention[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  filters: {
    platforms: Platform[];
    sentiment: SentimentScore[];
    dateRange: [string, string];
    keywords: string[];
  };
  updateFilters: (filters: Partial<UseMentionsReturn['filters']>) => void;
}

export interface UseInsightsReturn {
  insights: ActionableInsight[];
  loading: boolean;
  error: string | null;
  markAsCompleted: (insightId: string, actionId: string) => Promise<void>;
  dismissInsight: (insightId: string) => Promise<void>;
  prioritizeInsight: (insightId: string, priority: ActionableInsight['priority']) => Promise<void>;
}
