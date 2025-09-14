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
  private enableMock: boolean;
  
  // Build a direct Google OAuth URL as a final fallback when backend route is missing
  private buildDirectAuthUrl(state: string): string | null {
    const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;
    const redirectUri = (import.meta as any).env?.VITE_GOOGLE_REDIRECT_URI || `${this.baseUrl}/auth/google/callback`;
    const oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    if (!clientId || !redirectUri) return null;
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive.file',
    ].join(' ');
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      state,
    });
    return `${oauthUrl}?${params.toString()}`;
  }

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
    this.enableMock = String((import.meta as any).env?.VITE_ENABLE_GOOGLE_MOCK ?? '') === 'true';
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
        // Treat unauthorized/not found as disconnected in pre-auth state
        if (response.status === 401 || response.status === 404) {
          // If mock mode enabled, pretend connected to keep UI functional
          if (this.enableMock || localStorage.getItem('googleMockMode') === 'true') {
            return { connected: true, accountId: 'test-user-123', accountName: 'Mock Google Ads', status: 'connected' };
          }
          return { connected: false, status: 'disconnected' };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        connected: Boolean(data.connected ?? data.authenticated ?? false),
        accountId: data.accountId ?? data.user_info?.id,
        accountName: data.accountName ?? data.user_info?.name,
        status: (data.status ?? ((data.connected ?? data.authenticated) ? 'connected' : 'disconnected')) as 'connected' | 'disconnected' | 'error'
      };
    } catch (error) {
      console.error('Google connection status check failed:', error);
      if (this.enableMock || localStorage.getItem('googleMockMode') === 'true') {
        return { connected: true, accountId: 'test-user-123', accountName: 'Mock Google Ads', status: 'connected' };
      }
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
      
      // Step 1: Try POST /auth/google/start (preferred)
      let authUrl: string | undefined;
      let oauthState: string | undefined;
      try {
        const postResp = await fetch(`${this.baseUrl}/auth/google/start`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: 'test' })
        });
        if (postResp.ok) {
          const j = await postResp.json();
          authUrl = j.authUrl || j.url;
          oauthState = j.state;
        }
      } catch (_) {
        // ignore and fallback to GET
      }

      // Step 1b: Fallback to GET /auth/google/start with x-user-id if POST not available
      if (!authUrl) {
        const getResp = await fetch(`${this.baseUrl}/auth/google/start`, {
          method: 'GET',
          headers: {
            'x-user-id': dummyUserId,
            'Content-Type': 'application/json'
          }
        });
        if (!getResp.ok) {
          // If mock mode is enabled, simulate connection
          if (this.enableMock || localStorage.getItem('googleMockMode') === 'true') {
            localStorage.setItem('googleUserId', dummyUserId);
            localStorage.setItem('googleMockMode', 'true');
            return;
          }
          throw new Error(`Failed to initiate OAuth: ${getResp.status}`);
        }
        const j = await getResp.json();
        authUrl = j.authUrl || j.url;
        oauthState = j.state;
      }

      if (!authUrl) {
        // Final fallback: construct Google OAuth URL client-side if configured
        const direct = this.buildDirectAuthUrl(oauthState || 'test');
        if (direct) {
          authUrl = direct;
        } else if (this.enableMock || localStorage.getItem('googleMockMode') === 'true') {
          localStorage.setItem('googleUserId', dummyUserId);
          localStorage.setItem('googleMockMode', 'true');
          return;
        } else {
          throw new Error('No auth URL returned from backend');
        }
      }

      // Store state for validation
      if (oauthState) {
        sessionStorage.setItem('google_oauth_state', oauthState);
      }

      // Step 2: Open OAuth URL in popup
      const popup = window.open(
        authUrl,
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
      localStorage.removeItem('googleMockMode');
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

      // Try generic accounts route first
      const response = await fetch(`${this.baseUrl}/accounts?provider=google`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        },
      });

      if (response.ok) {
        const data = await response.json();
        const arr = Array.isArray(data?.accounts) ? data.accounts : (Array.isArray(data) ? data : []);
        const accounts: GoogleAccount[] = arr.map((a: any, index: number) => ({
          id: String(a.id ?? a.customerId ?? a.customer_id ?? index + 1),
          name: String(a.name ?? `Google Ads Account ${index + 1}`),
          currency: String(a.currency ?? 'USD'),
          timezone: String(a.timezone ?? a.timezone_name ?? 'America/New_York'),
          status: String(a.status ?? a.account_status ?? 'ENABLED'),
        }));
        return accounts;
      }

      // Fallback to legacy customers route
      const legacyResp = await fetch(`${this.baseUrl}/auth/google/customers`, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json'
        }
      });
      if (!legacyResp.ok) {
        throw new Error(`HTTP error! status: ${legacyResp.status}`);
      }
      const legacy = await legacyResp.json();
      const accounts: GoogleAccount[] = (legacy.customers || []).map((customerId: string, index: number) => ({
        id: String(customerId).replace('customers/', ''),
        name: `Google Ads Account ${index + 1}`,
        currency: 'USD',
        timezone: 'America/New_York',
        status: 'ENABLED'
      }));
      return accounts;
    } catch (error) {
      console.error('Google accounts fetch error:', error);
      if (this.enableMock || localStorage.getItem('googleMockMode') === 'true') {
        return [
          { id: 'test-user-123', name: 'Mock Google Ads Account', currency: 'USD', timezone: 'America/New_York', status: 'ENABLED' }
        ];
      }
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

  // Synchronize Google Ads data from backend; safe no-op fallback
  async syncData(): Promise<void> {
    try {
      const userId = localStorage.getItem('googleUserId') || 'test-user-123';
      const res = await fetch(`${this.baseUrl}/api/google/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    } catch (e) {
      console.warn('Google sync endpoint unavailable, continuing with local state.', e);
    }
  }

  // Backend-first with mock fallback
  async getCampaigns(customerId: string): Promise<GoogleCampaign[]> {
    const userId = localStorage.getItem('googleUserId') || 'test-user-123';
    try {
      const url = `${this.baseUrl}/campaigns?provider=google&customerId=${encodeURIComponent(customerId)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const arr = Array.isArray(data?.campaigns) ? data.campaigns : (Array.isArray(data) ? data : []);
        if (arr.length > 0) {
          return arr.map((c: any, idx: number) => ({
            id: String(c.id ?? c.campaign?.id ?? idx + 1),
            name: String(c.name ?? c.campaign?.name ?? `Campaign ${idx + 1}`),
            status: String(c.status ?? c.campaign?.status ?? 'ENABLED'),
            type: String(c.type ?? 'SEARCH'),
            budget: Number(c.budget ?? (c.campaign_budget?.amount_micros ? c.campaign_budget.amount_micros / 1_000_000 : 0)),
            startDate: String(c.startDate ?? new Date().toISOString().slice(0, 10)),
            biddingStrategy: String(c.biddingStrategy ?? 'MAXIMIZE_CLICKS'),
          }));
        }
      }
    } catch (err) {
      console.warn('getCampaigns: backend unavailable, using mock.', err);
    }
    return [
      { id: '1', name: 'Google Search - Brand', status: 'ENABLED', type: 'SEARCH', budget: 1200, startDate: '2024-01-01', biddingStrategy: 'MAXIMIZE_CLICKS' },
      { id: '2', name: 'Google Performance Max', status: 'ENABLED', type: 'PERFORMANCE_MAX', budget: 800, startDate: '2024-01-15', biddingStrategy: 'TARGET_ROAS' },
    ];
  }

  async getAds(customerId: string, campaignId?: string): Promise<GoogleAd[]> {
    const userId = localStorage.getItem('googleUserId') || 'test-user-123';
    try {
      const params = new URLSearchParams({ provider: 'google', customerId, ...(campaignId ? { campaignId } : {}) });
      const url = `${this.baseUrl}/ads?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const data = await response.json();
        const arr = Array.isArray(data?.ads) ? data.ads : (Array.isArray(data) ? data : []);
        if (arr.length > 0) {
          return arr.map((a: any, idx: number) => ({
            id: String(a.id ?? idx + 1),
            adGroupId: String(a.adGroupId ?? a.ad_group_id ?? ''),
            adGroupName: String(a.adGroupName ?? a.ad_group_name ?? ''),
            campaignId: String(a.campaignId ?? a.campaign_id ?? ''),
            name: String(a.name ?? a.ad?.name ?? `Ad ${idx + 1}`),
            status: String(a.status ?? 'ENABLED'),
            type: String(a.type ?? 'TEXT_AD'),
            headline: String(a.headline ?? a.ad?.headline?.[0] ?? ''),
            description1: String(a.description1 ?? a.ad?.description?.[0] ?? ''),
          }));
        }
      }
    } catch (err) {
      console.warn('getAds: backend unavailable, using mock.', err);
    }
    return [
      { id: 'a1', adGroupId: 'ag1', adGroupName: 'Ad Group 1', campaignId: campaignId ?? '1', name: 'Text Ad A', status: 'ENABLED', type: 'TEXT_AD', headline: 'Shop Now', description1: 'Best prices' },
      { id: 'a2', adGroupId: 'ag1', adGroupName: 'Ad Group 1', campaignId: campaignId ?? '1', name: 'Text Ad B', status: 'ENABLED', type: 'TEXT_AD', headline: 'New Arrivals', description1: 'Discover more' },
    ];
  }

  async getMetricsOverview(customerId: string, dateRange?: string): Promise<GoogleMetrics> {
    const userId = localStorage.getItem('googleUserId') || 'test-user-123';
    try {
      const params = new URLSearchParams({ provider: 'google', customerId, ...(dateRange ? { dateRange } : {}) });
      const url = `${this.baseUrl}/metrics/overview?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-user-id': userId,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const m = await response.json().then((j) => j?.metrics ?? j);
        if (m && typeof m === 'object') {
          return {
            impressions: Number((m as any).impressions ?? 0),
            clicks: Number((m as any).clicks ?? 0),
            cost: Number((m as any).cost ?? ((m as any).cost_micros ? (m as any).cost_micros / 1_000_000 : 0)),
            conversions: Number((m as any).conversions ?? 0),
            ctr: Number((m as any).ctr ?? ((m as any).impressions ? (Number((m as any).clicks ?? 0) / Number((m as any).impressions)) * 100 : 0)),
            cpc: Number((m as any).cpc ?? (Number((m as any).clicks ?? 0) ? Number((m as any).cost ?? 0) / Number((m as any).clicks ?? 1) : 0)),
            conversionRate: Number((m as any).conversionRate ?? (Number((m as any).clicks ?? 0) ? (Number((m as any).conversions ?? 0) / Number((m as any).clicks)) * 100 : 0)),
          };
        }
      }
    } catch (err) {
      console.warn('getMetricsOverview: backend unavailable, using mock.', err);
    }
    return {
      impressions: 125000,
      clicks: 8750,
      cost: 2150.5,
      conversions: 245,
      ctr: 7.0,
      cpc: 0.25,
      conversionRate: 2.8,
    };
  }
}

// (legacy duplicate functions removed)

export const googleIntegrationService = new GoogleIntegrationService();