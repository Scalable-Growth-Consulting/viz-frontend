import { Platform, IntegrationStatus, BrandMention, BrandlenzApiResponse } from '../types';
import { toast } from '@/hooks/use-toast';

export class BrandlenzIntegrationService {
  private baseUrl: string;
  private toast: any;
  private appUserId?: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  }

  setToast(toast: any) {
    this.toast = toast;
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
   * Get all integration statuses
   */
  async getIntegrationStatuses(): Promise<IntegrationStatus[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/integrations/status`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get integration statuses: ${response.status}`);
      }

      const data: BrandlenzApiResponse<IntegrationStatus[]> = await response.json();
      return data.data;
    } catch (error) {
      console.error('Failed to get integration statuses:', error);
      // Return mock data for development
      return this.getMockIntegrationStatuses();
    }
  }

  /**
   * Connect to a platform
   */
  async connectPlatform(platform: Platform): Promise<void> {
    try {
      let authUrl: string | undefined;
      let oauthState: string | undefined;

      // Platform-specific OAuth initiation
      const endpoint = this.getOAuthEndpoint(platform);
      
      const postResp = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.makeHeaders(),
        body: JSON.stringify({ 
          state: `brandlenz-${platform}`,
          scopes: this.getPlatformScopes(platform)
        })
      });

      if (postResp.ok) {
        const j = await postResp.json();
        authUrl = j.authUrl || j.url;
        oauthState = j.state;
      } else {
        throw new Error(`Failed to initiate ${platform} OAuth: ${postResp.status}`);
      }

      if (!authUrl) {
        throw new Error(`No auth URL returned for ${platform}`);
      }

      // Store state for validation
      if (oauthState) {
        sessionStorage.setItem(`${platform}_oauth_state`, oauthState);
      }

      // Open OAuth URL in popup
      const popup = window.open(
        authUrl,
        `${platform}-oauth`,
        'width=600,height=700,scrollbars=yes,resizable=yes,left=' +
          (window.screen.width / 2 - 300) +
          ',top=' +
          (window.screen.height / 2 - 350)
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      // Wait for OAuth completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Check if we got a successful connection
            this.checkPlatformStatus(platform).then(status => {
              if (status.connected) {
                resolve();
              } else {
                reject(new Error(`${platform} OAuth was cancelled or failed`));
              }
            }).catch(reject);
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error(`${platform} OAuth timeout`));
        }, 300000);
      });
    } catch (error) {
      console.error(`${platform} connection failed:`, error);
      throw error;
    }
  }

  /**
   * Disconnect from a platform
   */
  async disconnectPlatform(platform: Platform): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/integrations/${platform}/disconnect`, {
        method: 'POST',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect ${platform}: ${response.status}`);
      }

      this.toast?.({
        title: `${this.getPlatformDisplayName(platform)} Disconnected`,
        description: `Successfully disconnected from ${this.getPlatformDisplayName(platform)}.`,
      });
    } catch (error) {
      console.error(`${platform} disconnection failed:`, error);
      throw error;
    }
  }

  /**
   * Sync data from a platform
   */
  async syncPlatform(platform: Platform): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/integrations/${platform}/sync`, {
        method: 'POST',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to sync ${platform}: ${response.status}`);
      }

      this.toast?.({
        title: "Sync Complete",
        description: `${this.getPlatformDisplayName(platform)} data has been synchronized successfully.`,
      });
    } catch (error) {
      console.error(`${platform} sync failed:`, error);
      throw error;
    }
  }

  /**
   * Check platform connection status
   */
  async checkPlatformStatus(platform: Platform): Promise<IntegrationStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/integrations/${platform}/status`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          return this.getDefaultPlatformStatus(platform);
        }
        throw new Error(`Failed to check ${platform} status: ${response.status}`);
      }

      const data: BrandlenzApiResponse<IntegrationStatus> = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Failed to check ${platform} status:`, error);
      return this.getDefaultPlatformStatus(platform);
    }
  }

  /**
   * Update platform configuration
   */
  async updatePlatformConfig(platform: Platform, config: Partial<IntegrationStatus['configuration']>): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/brandlenz/integrations/${platform}/config`, {
        method: 'PUT',
        headers: this.makeHeaders(),
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to update ${platform} config: ${response.status}`);
      }

      this.toast?.({
        title: "Configuration Updated",
        description: `${this.getPlatformDisplayName(platform)} monitoring settings have been updated.`,
      });
    } catch (error) {
      console.error(`Failed to update ${platform} config:`, error);
      throw error;
    }
  }

  /**
   * Get mentions from a specific platform
   */
  async getPlatformMentions(
    platform: Platform, 
    options: {
      limit?: number;
      offset?: number;
      dateFrom?: string;
      dateTo?: string;
      sentiment?: string[];
      keywords?: string[];
    } = {}
  ): Promise<{ mentions: BrandMention[]; hasMore: boolean; total: number }> {
    try {
      const params = new URLSearchParams();
      if (options.limit) params.set('limit', options.limit.toString());
      if (options.offset) params.set('offset', options.offset.toString());
      if (options.dateFrom) params.set('date_from', options.dateFrom);
      if (options.dateTo) params.set('date_to', options.dateTo);
      if (options.sentiment?.length) params.set('sentiment', options.sentiment.join(','));
      if (options.keywords?.length) params.set('keywords', options.keywords.join(','));

      const response = await fetch(`${this.baseUrl}/api/brandlenz/mentions/${platform}?${params.toString()}`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get ${platform} mentions: ${response.status}`);
      }

      const data: BrandlenzApiResponse<{ mentions: BrandMention[]; hasMore: boolean; total: number }> = await response.json();
      return data.data;
    } catch (error) {
      console.error(`Failed to get ${platform} mentions:`, error);
      // Return mock data for development
      return {
        mentions: this.getMockMentions(platform),
        hasMore: false,
        total: 10
      };
    }
  }

  // Helper methods
  private getOAuthEndpoint(platform: Platform): string {
    const endpoints: Record<Platform, string> = {
      twitter: '/auth/twitter/start',
      google_reviews: '/auth/google/start',
      trustpilot: '/auth/trustpilot/start',
      amazon: '/auth/amazon/start',
      shopify: '/auth/shopify/start',
      wordpress: '/auth/wordpress/start',
      facebook: '/auth/facebook/start',
      instagram: '/auth/instagram/start',
      linkedin: '/auth/linkedin/start',
      reddit: '/auth/reddit/start',
      youtube: '/auth/youtube/start',
    };
    return endpoints[platform];
  }

  private getPlatformScopes(platform: Platform): string[] {
    const scopes: Record<Platform, string[]> = {
      twitter: ['read', 'users.read', 'tweet.read'],
      google_reviews: ['https://www.googleapis.com/auth/business.manage'],
      trustpilot: ['public_profile', 'business_units'],
      amazon: ['profile', 'advertising::campaign_management'],
      shopify: ['read_products', 'read_orders', 'read_customers'],
      wordpress: ['auth', 'global'],
      facebook: ['pages_read_engagement', 'pages_show_list'],
      instagram: ['instagram_basic', 'instagram_manage_insights'],
      linkedin: ['r_organization_social', 'rw_organization_admin'],
      reddit: ['identity', 'read'],
      youtube: ['https://www.googleapis.com/auth/youtube.readonly'],
    };
    return scopes[platform] || [];
  }

  private getPlatformDisplayName(platform: Platform): string {
    const names: Record<Platform, string> = {
      twitter: 'X (Twitter)',
      google_reviews: 'Google Reviews',
      trustpilot: 'Trustpilot',
      amazon: 'Amazon',
      shopify: 'Shopify',
      wordpress: 'WordPress',
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      reddit: 'Reddit',
      youtube: 'YouTube',
    };
    return names[platform] || platform;
  }

  private getDefaultPlatformStatus(platform: Platform): IntegrationStatus {
    return {
      platform,
      connected: false,
      lastSync: '',
      status: 'error',
      dataPoints: {
        totalMentions: 0,
        lastMentionDate: '',
        avgDailyMentions: 0,
      },
      configuration: {
        keywords: [],
        languages: ['en'],
        regions: ['global'],
        includeReplies: true,
        minimumEngagement: 0,
      },
    };
  }

  private getMockIntegrationStatuses(): IntegrationStatus[] {
    const platforms: Platform[] = ['twitter', 'google_reviews', 'trustpilot', 'amazon', 'shopify', 'wordpress'];
    
    return platforms.map((platform, index) => ({
      platform,
      connected: index < 2, // First 2 are connected for demo
      lastSync: index < 2 ? new Date(Date.now() - Math.random() * 86400000).toISOString() : '',
      status: index < 2 ? 'active' : 'error',
      dataPoints: {
        totalMentions: index < 2 ? Math.floor(Math.random() * 1000) + 100 : 0,
        lastMentionDate: index < 2 ? new Date(Date.now() - Math.random() * 3600000).toISOString() : '',
        avgDailyMentions: index < 2 ? Math.floor(Math.random() * 50) + 10 : 0,
      },
      configuration: {
        keywords: ['brand', 'product', 'service'],
        languages: ['en'],
        regions: ['global'],
        includeReplies: true,
        minimumEngagement: 0,
      },
    }));
  }

  private getMockMentions(platform: Platform): BrandMention[] {
    const sentiments: Array<BrandMention['sentiment']['score']> = ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'];
    
    return Array.from({ length: 10 }, (_, i) => ({
      id: `${platform}-mention-${i}`,
      platform,
      content: `This is a sample mention from ${platform} about the brand. ${i % 2 === 0 ? 'Great product!' : 'Could be better.'}`,
      author: {
        id: `user-${i}`,
        username: `user${i}`,
        displayName: `User ${i}`,
        followerCount: Math.floor(Math.random() * 10000),
        verifiedStatus: i % 3 === 0,
      },
      timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
      url: `https://${platform}.com/mention/${i}`,
      engagement: {
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        comments: Math.floor(Math.random() * 25),
        views: Math.floor(Math.random() * 1000),
      },
      sentiment: {
        score: sentiments[Math.floor(Math.random() * sentiments.length)],
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        reasoning: 'AI-powered sentiment analysis based on language patterns and context.',
      },
      topics: ['product', 'service', 'experience'],
      productMentions: ['Product A', 'Service B'],
      language: 'en',
      isVerified: i % 5 === 0,
    }));
  }
}

// Export singleton instance
export const brandlenzIntegrationService = new BrandlenzIntegrationService();
