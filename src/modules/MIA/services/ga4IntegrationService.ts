export interface GA4ConnectionStatus {
  authenticated: boolean;
  provider?: 'google-analytics';
  expires_at?: string | null;
  user_id?: string | null;
}

export interface GA4Account {
  id: string;
  name?: string;
}

export interface GA4Property {
  id: string;
  displayName?: string;
  timeZone?: string;
  currencyCode?: string;
}

export interface GA4Metrics {
  sessions?: number;
  users?: number;
  pageViews?: number;
  conversions?: number;
  revenue?: number;
}

/**
 * GA4 Integration Service (frontend)
 * - Talks to backend endpoints under /auth/google-analytics/*
 * - Initiates popup OAuth and waits for postMessage or polls status.
 */
export class Ga4IntegrationService {
  private baseUrl: string;
  private toast: any;
  private appUserId?: string;

  constructor() {
    // default backend URL — adjust via VITE_BACKEND_URL
    // frontend dev usually runs on :3000; backend :4000
    this.baseUrl = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:4000';
  }

  setToast(toast: any) {
    this.toast = toast;
  }

  setAppUserId(id?: string) {
    this.appUserId = id;
  }

  private makeHeaders(extra?: Record<string, string>) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(extra || {})
    };
    if (this.appUserId) headers['x-user-id'] = String(this.appUserId);
    return headers;
  }

  async checkConnectionStatus(): Promise<GA4ConnectionStatus> {
    const url = `${this.baseUrl}/auth/google-analytics/status`;
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: this.makeHeaders()
      });
      if (!res.ok) {
        if (this.toast) this.toast({ title: 'GA4 Status Failed', variant: 'destructive' });
        return { authenticated: false };
      }
      const data = await res.json();
      return {
        authenticated: Boolean(data?.authenticated),
        provider: 'google-analytics',
        expires_at: data?.expires_at ?? null,
        user_id: data?.user_id ?? null
      };
    } catch (err) {
      console.error('GA4 status error', err);
      return { authenticated: false };
    }
  }

  /**
   * Start GA4 connect flow:
   * - Calls backend /auth/google-analytics/start (GET)
   * - Opens popup to returned authUrl and waits for postMessage OR polls status
   */
  async connectGA4(timeoutMs = 120000): Promise<GA4ConnectionStatus> {
    const startUrl = `${this.baseUrl}/auth/google-analytics/start${this.appUserId ? `?userId=${encodeURIComponent(this.appUserId)}` : ''}`;
    let authUrl: string | null = null;
    try {
      const r = await fetch(startUrl, { method: 'GET', headers: this.makeHeaders() });
      if (!r.ok) {
        const body = await r.text().catch(() => null);
        throw new Error(`Start request failed: ${r.status} ${body || ''}`);
      }
      const json = await r.json();
      authUrl = json.authUrl || json.url || null;
      if (!authUrl) throw new Error('No authUrl returned from backend');
    } catch (err) {
      console.error('connectGA4 start error', err);
      throw err;
    }

    // Open popup
    const popup = window.open(authUrl, 'ga4_oauth', 'width=900,height=700');
    if (!popup) throw new Error('Popup blocked');

    // Wait for postMessage from popup OR fallback to polling status
    return await new Promise<GA4ConnectionStatus>((resolve, reject) => {
      const start = Date.now();

      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
        if (!popup.closed) try { popup.close(); } catch {}
        clearInterval(pollInterval);
      };

      const timeout = () => {
        cleanup();
        reject(new Error('GA4 auth timed out'));
      };

      const messageHandler = (evt: MessageEvent) => {
        // accept messages from any origin but you can restrict using evt.origin
        try {
          const data = evt.data;
          if (!data) return;
          if (data.type === 'GOOGLE_ANALYTICS_AUTH_SUCCESS' || data.type === 'GOOGLE_AUTH_SUCCESS') {
            cleanup();
            resolve({ authenticated: true, provider: 'google-analytics', user_id: data.user_id ?? null });
          } else if (data.type === 'GOOGLE_ANALYTICS_AUTH_ERROR' || data.type === 'GOOGLE_AUTH_ERROR') {
            cleanup();
            reject(new Error(data.error || 'GA4 auth error'));
          }
        } catch (err) {
          // ignore
        }
      };

      window.addEventListener('message', messageHandler);

      // Poll backend status in case popup doesn't postMessage
      const pollInterval = setInterval(async () => {
        if (popup.closed) {
          // If popup closed, check status once then finish
          try {
            const status = await this.checkConnectionStatus();
            cleanup();
            if (status.authenticated) resolve(status);
            else reject(new Error('Popup closed before authentication completed'));
          } catch (err) {
            cleanup();
            reject(err);
          }
          return;
        }

        // timeout
        if (Date.now() - start > timeoutMs) {
          timeout();
          return;
        }

        // Otherwise no-op; we only rely on popup postMessage or closed/poll check above.
      }, 1000);
    });
  }

  async disconnectGA4(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/auth/google-analytics/disconnect`;
      const res = await fetch(url, {
        method: 'POST',
        headers: this.makeHeaders()
      });
      if (!res.ok) {
        const body = await res.text().catch(() => null);
        console.warn('GA4 disconnect returned', res.status, body);
        return false;
      }
      return true;
    } catch (err) {
      console.error('GA4 disconnect error', err);
      return false;
    }
  }

  async getAccounts(): Promise<GA4Account[]> {
    try {
      const url = `${this.baseUrl}/auth/google-analytics/accounts${this.appUserId ? `?userId=${encodeURIComponent(this.appUserId)}` : ''}`;
      const res = await fetch(url, { headers: this.makeHeaders() });
      if (!res.ok) throw new Error('Failed to list GA4 accounts');
      const json = await res.json();
      return json.accounts || [];
    } catch (err) {
      console.error('getAccounts error', err);
      throw err;
    }
  }

  async getProperties(accountId: string): Promise<GA4Property[]> {
    try {
      const url = `${this.baseUrl}/auth/google-analytics/properties?accountName=${encodeURIComponent(accountId)}${this.appUserId ? `&userId=${encodeURIComponent(this.appUserId)}` : ''}`;
      const res = await fetch(url, { headers: this.makeHeaders() });
      if (!res.ok) throw new Error('Failed to list GA4 properties');
      const json = await res.json();
      return json.properties || [];
    } catch (err) {
      console.error('getProperties error', err);
      throw err;
    }
  }

  async getMetrics(propertyId: string, startDate = '7daysAgo', endDate = 'today'): Promise<GA4Metrics> {
    try {
      const url = `${this.baseUrl}/auth/google-analytics/metrics?propertyId=${encodeURIComponent(propertyId)}&startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}${this.appUserId ? `&userId=${encodeURIComponent(this.appUserId)}` : ''}`;
      const res = await fetch(url, { headers: this.makeHeaders() });
      if (!res.ok) {
        const body = await res.text().catch(() => null);
        throw new Error(`Metrics request failed: ${res.status} ${body || ''}`);
      }
      const json = await res.json();
      return json.metrics || {};
    } catch (err) {
      console.error('getMetrics error', err);
      throw err;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/auth/google-analytics/refresh`;
      const res = await fetch(url, { method: 'POST', headers: this.makeHeaders() });
      return res.ok;
    } catch (err) {
      console.error('refreshToken error', err);
      return false;
    }
  }
}

export const ga4Service = new Ga4IntegrationService();