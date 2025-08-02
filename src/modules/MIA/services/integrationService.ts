import { IntegrationConfig, Campaign, AdGroup, SyncJob } from '../types';

/**
 * Base Integration Service
 * Abstract class that all platform integrations should extend
 */
export abstract class BaseIntegrationService {
  protected config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  abstract authenticate(): Promise<boolean>;
  abstract fetchCampaigns(dateRange?: { start: string; end: string }): Promise<Campaign[]>;
  abstract fetchAdGroups(campaignId: string): Promise<AdGroup[]>;
  abstract syncData(): Promise<SyncJob>;
  abstract disconnect(): Promise<void>;

  protected async makeAuthenticatedRequest(url: string, options: RequestInit = {}): Promise<Response> {
    if (!this.config.accessToken) {
      throw new Error(`No access token available for ${this.config.platform}`);
    }

    const headers = {
      'Authorization': `Bearer ${this.config.accessToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  protected handleApiError(error: any, context: string): never {
    console.error(`${this.config.platform} API Error in ${context}:`, error);
    throw new Error(`Failed to ${context}: ${error.message || 'Unknown error'}`);
  }
}

/**
 * Meta (Facebook) Ads Integration Service
 */
export class MetaIntegrationService extends BaseIntegrationService {
  private readonly baseUrl = 'https://graph.facebook.com/v18.0';

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/me`);
      return response.ok;
    } catch (error) {
      this.handleApiError(error, 'authenticate with Meta');
    }
  }

  async fetchCampaigns(dateRange?: { start: string; end: string }): Promise<Campaign[]> {
    try {
      const fields = 'id,name,status,budget_remaining,spend,impressions,clicks,conversions,ctr,cpa,created_time,updated_time';
      let url = `${this.baseUrl}/${this.config.accountId}/campaigns?fields=${fields}`;
      
      if (dateRange) {
        url += `&time_range={'since':'${dateRange.start}','until':'${dateRange.end}'}`;
      }

      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();

      return data.data.map((campaign: any) => ({
        id: campaign.id,
        name: campaign.name,
        platform: 'meta' as const,
        status: campaign.status,
        budget: parseFloat(campaign.budget_remaining || '0'),
        spend: parseFloat(campaign.spend || '0'),
        impressions: parseInt(campaign.impressions || '0'),
        clicks: parseInt(campaign.clicks || '0'),
        conversions: parseInt(campaign.conversions || '0'),
        ctr: parseFloat(campaign.ctr || '0'),
        cpa: parseFloat(campaign.cpa || '0'),
        roas: campaign.spend > 0 ? (campaign.conversions * 100) / campaign.spend : 0,
        startDate: campaign.created_time,
        createdAt: campaign.created_time,
        updatedAt: campaign.updated_time,
      }));
    } catch (error) {
      this.handleApiError(error, 'fetch Meta campaigns');
    }
  }

  async fetchAdGroups(campaignId: string): Promise<AdGroup[]> {
    try {
      const fields = 'id,name,budget_remaining,spend,impressions,clicks,conversions,ctr,cpa,targeting';
      const url = `${this.baseUrl}/${campaignId}/adsets?fields=${fields}`;

      const response = await this.makeAuthenticatedRequest(url);
      const data = await response.json();

      return data.data.map((adset: any) => ({
        id: adset.id,
        campaignId,
        name: adset.name,
        platform: 'meta' as const,
        budget: parseFloat(adset.budget_remaining || '0'),
        spend: parseFloat(adset.spend || '0'),
        impressions: parseInt(adset.impressions || '0'),
        clicks: parseInt(adset.clicks || '0'),
        conversions: parseInt(adset.conversions || '0'),
        ctr: parseFloat(adset.ctr || '0'),
        cpa: parseFloat(adset.cpa || '0'),
        targeting: adset.targeting,
      }));
    } catch (error) {
      this.handleApiError(error, 'fetch Meta ad groups');
    }
  }

  async syncData(): Promise<SyncJob> {
    const syncJob: SyncJob = {
      id: `meta-sync-${Date.now()}`,
      platform: 'meta',
      status: 'running',
      startTime: new Date().toISOString(),
    };

    try {
      // Implement actual sync logic here
      // This would typically involve:
      // 1. Fetching campaigns and ad groups
      // 2. Normalizing the data
      // 3. Storing in BigQuery or database
      // 4. Updating sync status

      syncJob.status = 'completed';
      syncJob.endTime = new Date().toISOString();
      syncJob.recordsProcessed = 0; // Update with actual count
    } catch (error) {
      syncJob.status = 'failed';
      syncJob.endTime = new Date().toISOString();
      syncJob.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    return syncJob;
  }

  async disconnect(): Promise<void> {
    // Revoke access token and clean up
    this.config.accessToken = undefined;
    this.config.refreshToken = undefined;
    this.config.isConnected = false;
  }
}

/**
 * Google Ads Integration Service
 */
export class GoogleAdsIntegrationService extends BaseIntegrationService {
  private readonly baseUrl = 'https://googleads.googleapis.com/v14';

  async authenticate(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/customers`);
      return response.ok;
    } catch (error) {
      this.handleApiError(error, 'authenticate with Google Ads');
    }
  }

  async fetchCampaigns(dateRange?: { start: string; end: string }): Promise<Campaign[]> {
    try {
      // Google Ads API implementation
      // This is a simplified version - actual implementation would use Google Ads Query Language (GAQL)
      const query = `
        SELECT 
          campaign.id,
          campaign.name,
          campaign.status,
          campaign_budget.amount_micros,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.ctr,
          metrics.cost_per_conversion
        FROM campaign 
        WHERE segments.date DURING LAST_30_DAYS
      `;

      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/customers/${this.config.accountId}/googleAds:searchStream`,
        {
          method: 'POST',
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();
      
      // Transform Google Ads data to our Campaign format
      return data.results?.map((result: any) => ({
        id: result.campaign.id,
        name: result.campaign.name,
        platform: 'google' as const,
        status: result.campaign.status.toLowerCase(),
        budget: result.campaign_budget.amount_micros / 1000000,
        spend: result.metrics.cost_micros / 1000000,
        impressions: parseInt(result.metrics.impressions || '0'),
        clicks: parseInt(result.metrics.clicks || '0'),
        conversions: parseFloat(result.metrics.conversions || '0'),
        ctr: parseFloat(result.metrics.ctr || '0') * 100,
        cpa: result.metrics.cost_per_conversion / 1000000,
        roas: result.metrics.cost_micros > 0 ? (result.metrics.conversions * 100) / (result.metrics.cost_micros / 1000000) : 0,
        startDate: new Date().toISOString(), // Would get from actual campaign data
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })) || [];
    } catch (error) {
      this.handleApiError(error, 'fetch Google Ads campaigns');
    }
  }

  async fetchAdGroups(campaignId: string): Promise<AdGroup[]> {
    try {
      const query = `
        SELECT 
          ad_group.id,
          ad_group.name,
          ad_group.status,
          metrics.cost_micros,
          metrics.impressions,
          metrics.clicks,
          metrics.conversions,
          metrics.ctr,
          metrics.cost_per_conversion
        FROM ad_group 
        WHERE campaign.id = ${campaignId}
        AND segments.date DURING LAST_30_DAYS
      `;

      const response = await this.makeAuthenticatedRequest(
        `${this.baseUrl}/customers/${this.config.accountId}/googleAds:searchStream`,
        {
          method: 'POST',
          body: JSON.stringify({ query }),
        }
      );

      const data = await response.json();

      return data.results?.map((result: any) => ({
        id: result.ad_group.id,
        campaignId,
        name: result.ad_group.name,
        platform: 'google' as const,
        budget: 0, // Ad groups don't have individual budgets in Google Ads
        spend: result.metrics.cost_micros / 1000000,
        impressions: parseInt(result.metrics.impressions || '0'),
        clicks: parseInt(result.metrics.clicks || '0'),
        conversions: parseFloat(result.metrics.conversions || '0'),
        ctr: parseFloat(result.metrics.ctr || '0') * 100,
        cpa: result.metrics.cost_per_conversion / 1000000,
      })) || [];
    } catch (error) {
      this.handleApiError(error, 'fetch Google Ads ad groups');
    }
  }

  async syncData(): Promise<SyncJob> {
    const syncJob: SyncJob = {
      id: `google-sync-${Date.now()}`,
      platform: 'google',
      status: 'running',
      startTime: new Date().toISOString(),
    };

    try {
      // Implement actual sync logic
      syncJob.status = 'completed';
      syncJob.endTime = new Date().toISOString();
      syncJob.recordsProcessed = 0;
    } catch (error) {
      syncJob.status = 'failed';
      syncJob.endTime = new Date().toISOString();
      syncJob.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    }

    return syncJob;
  }

  async disconnect(): Promise<void> {
    this.config.accessToken = undefined;
    this.config.refreshToken = undefined;
    this.config.isConnected = false;
  }
}

/**
 * Integration Service Factory
 */
export class IntegrationServiceFactory {
  static create(config: IntegrationConfig): BaseIntegrationService {
    switch (config.platform) {
      case 'meta':
        return new MetaIntegrationService(config);
      case 'google':
        return new GoogleAdsIntegrationService(config);
      case 'linkedin':
        // TODO: Implement LinkedIn Ads integration
        throw new Error('LinkedIn Ads integration not yet implemented');
      case 'tiktok':
        // TODO: Implement TikTok Ads integration
        throw new Error('TikTok Ads integration not yet implemented');
      default:
        throw new Error(`Unsupported platform: ${config.platform}`);
    }
  }
}
