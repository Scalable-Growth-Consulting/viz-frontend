export interface GoogleConnectionStatus {
  connected: boolean;
  accountId?: string;
  accountName?: string;
  status: 'connected' | 'disconnected' | 'error';
}

export interface GoogleAccount {
  id: string;
  name: string;
  currency: string;
  timezone: string;
  status: string;
}

export interface GoogleCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  budget: number;
  startDate: string;
  biddingStrategy: string;
}

export interface GoogleAd {
  id: string;
  adGroupId: string;
  adGroupName: string;
  campaignId: string;
  name: string;
  status: string;
  type: string;
  headline: string;
  description1: string;
}

export interface GoogleMetrics {
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  ctr: number;
  cpc: number;
  conversionRate: number;
}

export class GoogleIntegrationService {
  private baseUrl: string;
  private toast: any;

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  /**
   * Check Google Ads connection status
   */
  async checkConnectionStatus(): Promise<GoogleConnectionStatus> {
    try {
      // Use dummy user ID for testing as requested
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      const response = await fetch(`${this.baseUrl}/auth/google/status`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        connected: data.authenticated || false,
        accountId: data.user_info?.id,
        accountName: data.user_info?.name,
        status: data.authenticated ? 'connected' : 'disconnected'
      };
    } catch (error) {
      console.error('Google connection status check failed:', error);
      return { connected: false, status: 'error' };
    }
  }

  /**
   * Initiate Google OAuth connection
   */
  async connectGoogle(): Promise<void> {
    try {
      // Use dummy user ID for testing as requested
      const dummyUserId = 'test-user-123';
      
      // Step 1: Get OAuth URL from backend (following Postman guide)
      const response = await fetch(`${this.baseUrl}/auth/google/start`, {
        method: 'GET',
        headers: {
          'x-user-id': dummyUserId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to initiate OAuth: ${response.status}`);
      }

      const data = await response.json();
      if (!data.authUrl) {
        throw new Error('No auth URL returned from backend');
      }

      // Store state for validation
      if (data.state) {
        sessionStorage.setItem('google_oauth_state', data.state);
      }

      // Step 2: Open OAuth URL in popup
      const popup = window.open(
        data.authUrl,
        'google-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,left=' +
          (window.screen.width / 2 - 300) +
          ',top=' +
          (window.screen.height / 2 - 350)
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      // Step 3: Monitor popup for completion
      return new Promise<void>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          try {
            // Check if popup was closed
            if (popup.closed) {
              clearInterval(checkInterval);
              
              // Wait a moment then check connection status
              setTimeout(async () => {
                try {
                  const status = await this.checkConnectionStatus();
                  if (status.connected && status.accountId) {
                    // Store the Google user ID from the backend response
                    localStorage.setItem('googleUserId', status.accountId);
                    resolve();
                  } else {
                    reject(new Error('Authentication was cancelled or failed.'));
                  }
                } catch (error) {
                  reject(error);
                }
              }, 1000);
              
              return;
            }

            // Check if we can access popup URL (will throw if cross-origin)
            try {
              const popupUrl = popup.location.href;
              if (popupUrl.includes('/auth/google/callback')) {
                // OAuth callback completed, close popup and check status
                popup.close();
              }
            } catch (e) {
              // Cross-origin error is expected during OAuth flow
            }
          } catch (error) {
            console.error('Error monitoring popup:', error);
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!popup.closed) {
            popup.close();
          }
          reject(new Error('Authentication timeout. Please try again.'));
        }, 300000);
      });
    } catch (error) {
      console.error('Google connection error:', error);
      throw error;
    }
  }

  /**
   * Disconnect Google Ads account
   */
  async disconnectGoogle(): Promise<void> {
    try {
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      const response = await fetch(`${this.baseUrl}/auth/google/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Remove stored user ID
      localStorage.removeItem('googleUserId');
      sessionStorage.removeItem('google_oauth_state');
    } catch (error) {
      console.error('Google disconnect error:', error);
      throw error;
    }
  }

  /**
   * Get Google Ads customers/accounts
   */
  async getAccounts(): Promise<GoogleAccount[]> {
    try {
      // Use the actual Google user ID or fallback to dummy
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      const response = await fetch(`${this.baseUrl}/auth/google/customers`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the customers response to match our interface
      const accounts: GoogleAccount[] = (data.customers || []).map((customerId: string, index: number) => ({
        id: customerId.replace('customers/', ''),
        name: `Google Ads Account ${index + 1}`,
        currency: 'USD',
        timezone: 'America/New_York',
        status: 'ENABLED'
      }));

      return accounts;
    } catch (error) {
      console.error('Google accounts fetch error:', error);
      throw error;
    }
  }

  /**
   * Refresh Google OAuth token
   */
  async refreshToken(): Promise<void> {
    try {
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      const response = await fetch(`${this.baseUrl}/auth/google/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({})
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Token refreshed successfully:', data);
    } catch (error) {
      console.error('Google token refresh error:', error);
      throw error;
    }
  }
  
  /**
   * Get Google campaigns  
   */
  async getCampaigns(customerId: string): Promise<GoogleCampaign[]> {
    try {
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      // For now, return mock data since your backend doesn't have campaign endpoints yet
      // You can replace this with actual API calls when implemented
      const mockCampaigns: GoogleCampaign[] = [
        {
          id: '1',
          name: 'Google Search Campaign 1',
          status: 'ENABLED',
          type: 'SEARCH',
          budget: 1000,
          startDate: '2024-01-01',
          biddingStrategy: 'MAXIMIZE_CLICKS'
        },
        {
          id: '2', 
          name: 'Google Display Campaign 1',
          status: 'ENABLED',
          type: 'DISPLAY',
          budget: 500,
          startDate: '2024-01-15',
          biddingStrategy: 'TARGET_CPA'
        }
      ];

      return mockCampaigns;
    } catch (error) {
      console.error('Google campaigns fetch error:', error);
      throw error;
    }
  }

  /**
   * Get Google ads
   */
  async getAds(customerId: string, campaignId?: string): Promise<GoogleAd[]> {
    try {
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      // Return mock data for now
      const mockAds: GoogleAd[] = [
        {
          id: '1',
          adGroupId: 'ag_1',
          adGroupName: 'Ad Group 1',
          campaignId: campaignId || '1',
          name: 'Text Ad 1',
          status: 'ENABLED',
          type: 'EXPANDED_TEXT_AD',
          headline: 'Premium Marketing Solutions',
          description1: 'Boost your ROI with our advanced tools'
        },
        {
          id: '2',
          adGroupId: 'ag_1',
          adGroupName: 'Ad Group 1', 
          campaignId: campaignId || '1',
          name: 'Text Ad 2',
          status: 'ENABLED',
          type: 'EXPANDED_TEXT_AD',
          headline: 'Data-Driven Marketing',
          description1: 'Transform your campaigns with AI insights'
        }
      ];

      return mockAds;
    } catch (error) {
      console.error('Google ads fetch error:', error);
      throw error;
    }
  }

  /**
   * Get Google metrics overview
   */
  async getMetricsOverview(customerId: string, dateRange?: string): Promise<GoogleMetrics> {
    try {
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';

      // Return mock metrics for now
      const mockMetrics: GoogleMetrics = {
        impressions: 125000,
        clicks: 8750,
        cost: 2150.50,
        conversions: 245,
        ctr: 7.0,
        cpc: 0.25,
        conversionRate: 2.8
      };

      return mockMetrics;
    } catch (error) {
      console.error('Google metrics fetch error:', error);
      throw error;
    }
  }

  /**
   * Sync Google data (placeholder for future implementation)
   */
  async syncData(): Promise<void> {
    try {
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        throw new Error('No Google user ID found');
      }

      // Note: This endpoint might not exist yet in your backend
      const response = await fetch(`${this.baseUrl}/api/google/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Google sync error:', error);
      throw error;
    }
  }
}

export const googleIntegrationService = new GoogleIntegrationService();