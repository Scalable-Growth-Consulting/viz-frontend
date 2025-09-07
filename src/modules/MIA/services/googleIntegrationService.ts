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
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        return { connected: false, status: 'disconnected' };
      }

      const response = await fetch(`${this.baseUrl}/auth/google/status`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        connected: data.connected,
        accountId: data.accountId,
        accountName: data.accountName,
        status: data.connected ? 'connected' : 'disconnected'
      };
    } catch (error) {
      console.error('Google connection status check failed:', error);
      return { connected: false, status: 'error' };
    }
  }

  /**
   * Initiate Google OAuth connection
   * Opens a popup window for Google authentication
   * Expects the backend callback page to postMessage back { success: true, userId: "<id>" }
   * Stores userId in localStorage under key "googleUserId" on success.
   */
  async connectGoogle(): Promise<void> {
    try {
      const authUrl = `${this.baseUrl}/auth/google/start`;
      
      // POST to backend to get the real OAuth URL
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to get OAuth URL from backend');
      const { url } = await response.json();
      if (!url) throw new Error('No URL returned from backend');

      // Open the returned URL in a popup (GET to provider)
      const popupName = 'google-auth-' + Date.now();
      const popup = window.open(
        url,
        popupName,
        'width=600,height=700,scrollbars=yes,resizable=yes,left=' +
          (window.screen.width / 2 - 300) +
          ',top=' +
          (window.screen.height / 2 - 350)
      );
      if (!popup) throw new Error('Popup blocked. Please allow popups for this site and try again.');

      // Listen for a postMessage from the popup (callback page should postMessage the result)
      const allowedOrigin = new URL(this.baseUrl).origin;
      let resolved = false;

      return await new Promise<void>((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          try {
            // Security: accept messages only from backend origin
            if (event.origin !== allowedOrigin) return;

            const data = event.data;
            if (!data) return;

            // Expected success response { success: true, userId: "..." }
            if (data.success === true && data.userId) {
              // store userId and resolve
              try {
                localStorage.setItem('googleUserId', String(data.userId));
              } catch (err) {
                console.warn('Failed to persist google userId to localStorage', err);
              }
              resolved = true;
              window.removeEventListener('message', messageHandler);
              if (!popup.closed) popup.close();
              resolve();
              return;
            }

            // In case backend signals failure
            if (data.success === false) {
              const msg = data.error || 'Authentication failed';
              resolved = true;
              window.removeEventListener('message', messageHandler);
              if (!popup.closed) popup.close();
              reject(new Error(msg));
              return;
            }
          } catch (err) {
            console.error('Error handling popup message', err);
          }
        };

        window.addEventListener('message', messageHandler);

        // Fallback: poll for popup close; if closed without message -> check backend status
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            setTimeout(() => {
              this.checkConnectionStatus()
                .then((status) => {
                  if (status.connected) {
                    if (status.accountId) {
                      try {
                        localStorage.setItem('googleUserId', String(status.accountId));
                      } catch (err) {
                        console.warn('Failed to persist google userId from status', err);
                      }
                    }
                    resolve();
                  } else {
                    reject(new Error('Authentication was cancelled or failed.'));
                  }
                })
                .catch(reject);
            }, 1000);
          }
        }, 1000);

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!popup.closed) popup.close();
          if (!resolved) reject(new Error('Authentication timeout. Please try again.'));
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
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        throw new Error('No Google user ID found');
      }

      const response = await fetch(`${this.baseUrl}/auth/google/disconnect`, {
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

      // Remove stored user ID
      localStorage.removeItem('googleUserId');
    } catch (error) {
      console.error('Google disconnect error:', error);
      throw error;
    }
  }

  /**
   * Get Google Ads accounts
   */
  async getAccounts(): Promise<GoogleAccount[]> {
    try {
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        throw new Error('No Google user ID found');
      }

      const response = await fetch(`${this.baseUrl}/accounts?provider=google`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.accounts || [];
    } catch (error) {
      console.error('Google accounts fetch error:', error);
      throw error;
    }
  }

  /**
   * Get Google campaigns
   */
  async getCampaigns(customerId: string): Promise<GoogleCampaign[]> {
    try {
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        throw new Error('No Google user ID found');
      }

      const response = await fetch(`${this.baseUrl}/campaigns?provider=google&customerId=${customerId}`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.campaigns || [];
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
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        throw new Error('No Google user ID found');
      }

      let url = `${this.baseUrl}/ads?provider=google&customerId=${customerId}`;
      if (campaignId) {
        url += `&campaignId=${campaignId}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.ads || [];
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
      const userId = localStorage.getItem('googleUserId');
      if (!userId) {
        throw new Error('No Google user ID found');
      }

      let url = `${this.baseUrl}/metrics/overview?provider=google&customerId=${customerId}`;
      if (dateRange) {
        url += `&dateRange=${dateRange}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.metrics || {
        impressions: 0,
        clicks: 0,
        cost: 0,
        conversions: 0,
        ctr: 0,
        cpc: 0,
        conversionRate: 0
      };
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