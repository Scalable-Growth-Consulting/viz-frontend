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
  private appUserId?: string;
  
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
    // Mock mode disabled: enforce real backend-only behavior
    this.enableMock = false;
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
   * Check Google Ads connection status
   */
  async checkConnectionStatus(): Promise<GoogleConnectionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/google/status`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        // Treat unauthorized/not found as disconnected in pre-auth state
        if (response.status === 401 || response.status === 404) {
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
      return { connected: false, status: 'error' };
    }
  }

  /**
   * Initiate Google OAuth connection
   */
  // ...existing code...
  /**
   * Initiate Google OAuth connection
   */
  async connectGoogle(): Promise<void> {
    try {
      // Step 1: GET first (some backends expose GET only), fallback to POST
      let authUrl: string | undefined;
      let oauthState: string | undefined;
      try {
        const getResp = await fetch(`${this.baseUrl}/auth/google/start`, {
          method: 'GET',
          headers: this.makeHeaders(),
          credentials: 'include'
        });
        if (getResp.ok) {
          const j = await getResp.json();
          authUrl = j.authUrl || j.url;
          oauthState = j.state;
        }
      } catch (e) {
        // ignore GET failure, try POST
      }

      if (!authUrl) {
        try {
          const postResp = await fetch(`${this.baseUrl}/auth/google/start`, {
            method: 'POST',
            headers: this.makeHeaders(),
            credentials: 'include',
            body: JSON.stringify({ state: 'test' })
          });
          if (postResp.ok) {
            const j = await postResp.json();
            authUrl = j.authUrl || j.url;
            oauthState = j.state;
          }
        } catch (e) {
          // will handle below if still no authUrl
        }
      }

      if (!authUrl) {
        const direct = this.buildDirectAuthUrl(oauthState || 'test');
        if (!direct) throw new Error('No auth URL returned from backend');
        authUrl = direct;
      }

      if (oauthState) sessionStorage.setItem('google_oauth_state', oauthState);

      // Step 2: Open popup
      const popup = window.open(
        authUrl,
        'google-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,left=' +
          (window.screen.width / 2 - 300) +
          ',top=' +
          (window.screen.height / 2 - 350)
      );
      if (!popup) throw new Error('Popup blocked. Allow popups and try again.');

      // Step 3: Preferred: wait for postMessage from callback. Fallback: poll backend status.
      return await new Promise<void>((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
          settled = true;
          window.removeEventListener('message', onMessage);
          if (statusInterval) clearInterval(statusInterval);
          if (timeoutId) clearTimeout(timeoutId);
          try { popup.close(); } catch {}
        };

        const onMessage = async (evt: MessageEvent) => {
          try {
            const data = evt?.data;
            // expect backend callback to post { type: 'GOOGLE_AUTH_SUCCESS', accountId: '...' }
            if (data && data.type === 'GOOGLE_AUTH_SUCCESS') {
              // optional: validate origin if you want
              cleanup();
              if (data.accountId) localStorage.setItem('googleUserId', String(data.accountId));
              // final server-side check
              const status = await this.checkConnectionStatus();
              if (status.connected) return resolve();
              return reject(new Error('Authentication succeeded but server reports not connected'));
            }
          } catch (err) {
            // ignore and wait for other signals
          }
        };

        window.addEventListener('message', onMessage);

        // Fallback: poll backend /auth/google/status every 1.5s to detect successful connection
        const statusInterval = setInterval(async () => {
          if (settled) return;
          try {
            const s = await this.checkConnectionStatus();
            if (s.connected) {
              cleanup();
              if (s.accountId) localStorage.setItem('googleUserId', String(s.accountId));
              return resolve();
            }
          } catch (e) {
            // ignore polling errors
          }
        }, 1500);

        // Timeout after 5 minutes
        const timeoutId = setTimeout(() => {
          if (settled) return;
          cleanup();
          return reject(new Error('Authentication was cancelled or failed.'));
        }, 300000);
      });
    } catch (error) {
      console.error('Google connection error:', error);
      throw error;
    }
  }
    
  /**
   * Disconnect Google Ads account (frontend-only: clear local state, no network call)
   */
  async disconnectGoogle(): Promise<void> {
    try {
      // Clear client-side state immediately so UI updates without server
      localStorage.removeItem('googleUserId');
      sessionStorage.removeItem('google_oauth_state');
      localStorage.removeItem('googleMockMode');

      // Intentionally do NOT call backend to avoid 404 noise.
      // If you later add a server endpoint, you can notify it here (best-effort).
      return;
    } catch (error) {
      console.error('Google disconnect error:', error);
      throw error;
    }
  }
//end

  /**
   * Get Google Ads customers/accounts
   */
  async getAccounts(): Promise<GoogleAccount[]> {
    try {
      // Use the actual Google user ID (no dummy fallback)
      const userId = localStorage.getItem('googleUserId') || undefined;

      // Try generic accounts route first
      const response = await fetch(`${this.baseUrl}/accounts?provider=google`, {
        method: 'GET',
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
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
          ...(userId ? { 'x-user-id': userId } : {}),
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
      throw error;
    }
  }

  /**
   * Refresh Google OAuth token
   */
  async refreshToken(): Promise<void> {
    try {
      const userId = localStorage.getItem('googleUserId') || undefined;

      const response = await fetch(`${this.baseUrl}/auth/google/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
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
      const userId = localStorage.getItem('googleUserId') || undefined;
      if (!userId) throw new Error('Missing googleUserId. Connect Google first.');
      const res = await fetch(`${this.baseUrl}/api/google/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userId ? { 'x-user-id': userId } : {}),
        },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    } catch (e) {
      console.warn('Google sync failed.', e);
      throw e;
    }
  }

  // Backend-first with mock fallback
  async getCampaigns(customerId: string): Promise<GoogleCampaign[]> {
    const userId = localStorage.getItem('googleUserId') || undefined;
    try {
      const url = `${this.baseUrl}/campaigns?provider=google&customerId=${encodeURIComponent(customerId)}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
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
      throw new Error('No campaigns returned');
    } catch (err) {
      console.warn('getCampaigns error', err);
      throw err;
    }
  }

  async getAds(customerId: string, campaignId?: string): Promise<GoogleAd[]> {
    const userId = localStorage.getItem('googleUserId') || undefined;
    try {
      const params = new URLSearchParams({ provider: 'google', customerId, ...(campaignId ? { campaignId } : {}) });
      const url = `${this.baseUrl}/ads?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
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
      throw new Error('No ads returned');
    } catch (err) {
      console.warn('getAds error', err);
      throw err;
    }
  }

  async getMetricsOverview(customerId: string, dateRange?: string): Promise<GoogleMetrics> {
    const userId = localStorage.getItem('googleUserId') || undefined;
    try {
      const params = new URLSearchParams({ provider: 'google', customerId, ...(dateRange ? { dateRange } : {}) });
      const url = `${this.baseUrl}/metrics/overview?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          ...(userId ? { 'x-user-id': userId } : {}),
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
      throw new Error('No metrics returned');
    } catch (err) {
      console.warn('getMetricsOverview error', err);
      throw err;
    }
  }
}

// (legacy duplicate functions removed)

export const googleIntegrationService = new GoogleIntegrationService();