// MIA (Marketing Intelligence Agent) Type Definitions

export interface Campaign {
  id: string;
  name: string;
  platform: 'meta' | 'google' | 'linkedin' | 'tiktok';
  status: 'active' | 'paused' | 'ended';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number; // Click-through rate
  cpa: number; // Cost per acquisition
  roas: number; // Return on ad spend
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdGroup {
  id: string;
  campaignId: string;
  name: string;
  platform: 'meta' | 'google' | 'linkedin' | 'tiktok';
  budget: number;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpa: number;
  keywords?: string[];
  targeting?: {
    age?: string;
    gender?: string;
    location?: string;
    interests?: string[];
  };
}

export interface PlatformMetrics {
  platform: 'meta' | 'google' | 'linkedin' | 'tiktok';
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalConversions: number;
  averageCTR: number;
  averageCPA: number;
  averageROAS: number;
  activeCampaigns: number;
}

export interface PerformanceInsight {
  type: 'ad_fatigue' | 'budget_optimization' | 'keyword_performance' | 'creative_performance';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendation: string;
  campaignId?: string;
  adGroupId?: string;
  estimatedImpact?: string;
}

export interface MarketingQuery {
  id: string;
  query: string;
  response: string;
  insights?: PerformanceInsight[];
  timestamp: string;
  userId: string;
}

export interface IntegrationConfig {
  platform: 'meta' | 'google' | 'linkedin' | 'tiktok';
  isConnected: boolean;
  accessToken?: string;
  refreshToken?: string;
  accountId?: string;
  lastSync?: string;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
  errorMessage?: string;
}

export interface DashboardFilters {
  platforms: string[];
  dateRange: {
    start: string;
    end: string;
  };
  campaigns?: string[];
  status?: string[];
}

export interface SyncJob {
  id: string;
  platform: 'meta' | 'google' | 'linkedin' | 'tiktok';
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  recordsProcessed?: number;
  errorMessage?: string;
}
