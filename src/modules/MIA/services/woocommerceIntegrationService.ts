export interface WooCommerceConnectionStatus {
  connected: boolean;
  siteUrl?: string;
  siteName?: string;
  status: 'connected' | 'disconnected' | 'error';
  errorMessage?: string;
}

export interface WooCommerceStore {
  id: string;
  name: string;
  url: string;
  currency: string;
  timezone: string;
  status: string;
}

export interface WooCommerceProduct {
  id: string;
  name: string;
  status: string;
  type: string;
  price: number;
  salePrice?: number;
  stockQuantity?: number;
  categories: string[];
}

export interface WooCommerceOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  currency: string;
  dateCreated: string;
  customerEmail: string;
  items: WooCommerceOrderItem[];
}

export interface WooCommerceOrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface WooCommerceMetrics {
  totalSales: number;
  totalOrders: number;
  averageOrderValue: number;
  totalProducts: number;
  conversionRate: number;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
}

export class WooCommerceIntegrationService {
  private baseUrl: string;
  private toast: any;
  private appUserId?: string;

  // Build a direct WordPress OAuth URL as a fallback when backend route is missing
  private buildDirectAuthUrl(state: string): string | null {
    const clientId = (import.meta as any).env?.VITE_WORDPRESS_CLIENT_ID;
    const redirectUri = (import.meta as any).env?.VITE_WORDPRESS_REDIRECT_URI || `${this.baseUrl}/wordpress/oauth/callback`;
    const oauthUrl = 'https://public-api.wordpress.com/oauth2/authorize';
    
    if (!clientId || !redirectUri) return null;
    
    const scopes = [
      'auth',
      'global',
    ].join(',');
    
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      state,
    });
    
    return `${oauthUrl}?${params.toString()}`;
  }

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
   * Check WooCommerce connection status
   */
  async checkConnectionStatus(): Promise<WooCommerceConnectionStatus> {
    try {
      const response = await fetch(`${this.baseUrl}/wordpress/oauth/status`, {
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
        siteUrl: data.siteUrl ?? data.site_url,
        siteName: data.siteName ?? data.site_name,
        status: (data.status ?? ((data.connected ?? data.authenticated) ? 'connected' : 'disconnected')) as 'connected' | 'disconnected' | 'error'
      };
    } catch (error) {
      console.error('WooCommerce connection status check failed:', error);
      return { connected: false, status: 'error', errorMessage: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  /**
   * Initiate WordPress/WooCommerce OAuth connection
   */
  async connectWooCommerce(): Promise<void> {
    try {
      // Real OAuth flow only
      // Step 1: Try POST /wordpress/oauth/authorize (preferred)
      let authUrl: string | undefined;
      let oauthState: string | undefined;
      
      try {
        const postResp = await fetch(`${this.baseUrl}/wordpress/oauth/authorize`, {
          method: 'GET',
          headers: this.makeHeaders(),
          // body: JSON.stringify({ state: 'woocommerce-integration' })
        });
        
        if (postResp.ok) {
          const j = await postResp.json();
          authUrl = j.authUrl || j.url;
          oauthState = j.state;
        }
      } catch (_) {
        // ignore and fallback to GET
      }

      // Step 1b: Fallback to GET /wordpress/oauth/authorize with x-user-id if POST not available
      if (!authUrl) {
        const getResp = await fetch(`${this.baseUrl}/wordpress/oauth/authorize`, {
          method: 'GET',
          headers: this.makeHeaders(),
        });
        
        if (!getResp.ok) {
          throw new Error(`Failed to initiate WordPress OAuth: ${getResp.status}`);
        }
        
        const j = await getResp.json();
        authUrl = j.authUrl || j.url;
        oauthState = j.state;
      }

      if (!authUrl) {
        // Final fallback: construct WordPress OAuth URL client-side if configured
        const direct = this.buildDirectAuthUrl(oauthState || 'woocommerce-integration');
        if (direct) {
          authUrl = direct;
        } else {
          throw new Error('No auth URL returned from backend');
        }
      }

      // Store state for validation
      if (oauthState) {
        sessionStorage.setItem('wordpress_oauth_state', oauthState);
      }

      // Step 2: Open OAuth URL in popup
      const popup = window.open(
        authUrl,
        'wordpress-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes,left=' +
          (window.screen.width / 2 - 300) +
          ',top=' +
          (window.screen.height / 2 - 350)
      );

      if (!popup) {
        throw new Error('Popup blocked. Please allow popups for this site and try again.');
      }

      // Step 3: Wait for OAuth completion
      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            // Check if we got a successful connection
            this.checkConnectionStatus().then(status => {
              if (status.connected) {
                resolve();
              } else {
                reject(new Error('WordPress OAuth was cancelled or failed'));
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
          reject(new Error('WordPress OAuth timeout'));
        }, 300000);
      });
    } catch (error) {
      console.error('WooCommerce connection failed:', error);
      throw error;
    }
  }

  /**
   * Disconnect WooCommerce integration
   */
  async disconnectWooCommerce(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/wordpress/oauth/disconnect`, {
        method: 'POST',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to disconnect: ${response.status}`);
      }
    } catch (error) {
      console.error('WooCommerce disconnection failed:', error);
      throw error;
    }
  }

  /**
   * Sync WooCommerce data
   */
  async syncData(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/woocommerce/sync`, {
        method: 'POST',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }
    } catch (error) {
      console.error('WooCommerce sync failed:', error);
      throw error;
    }
  }

  /**
   * Get WooCommerce stores
   */
  async getStores(): Promise<WooCommerceStore[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/woocommerce/stores`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get stores: ${response.status}`);
      }

      const data = await response.json();
      return data.stores || [];
    } catch (error) {
      console.error('Failed to get WooCommerce stores:', error);
      // Return mock data for development
      return [
        {
          id: 'store-1',
          name: 'My WooCommerce Store',
          url: 'https://mystore.com',
          currency: 'USD',
          timezone: 'America/New_York',
          status: 'active'
        }
      ];
    }
  }

  /**
   * Get WooCommerce products
   */
  async getProducts(storeId?: string): Promise<WooCommerceProduct[]> {
    try {
      const url = storeId 
        ? `${this.baseUrl}/api/woocommerce/products?store_id=${storeId}`
        : `${this.baseUrl}/api/woocommerce/products`;
        
      const response = await fetch(url, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get products: ${response.status}`);
      }

      const data = await response.json();
      return data.products || [];
    } catch (error) {
      console.error('Failed to get WooCommerce products:', error);
      // Return mock data for development
      return [];
    }
  }

  /**
   * Get WooCommerce orders
   */
  async getOrders(storeId?: string, dateRange?: string): Promise<WooCommerceOrder[]> {
    try {
      const params = new URLSearchParams();
      if (storeId) params.set('store_id', storeId);
      if (dateRange) params.set('date_range', dateRange);
      
      const response = await fetch(`${this.baseUrl}/api/woocommerce/orders?${params.toString()}`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get orders: ${response.status}`);
      }

      const data = await response.json();
      return data.orders || [];
    } catch (error) {
      console.error('Failed to get WooCommerce orders:', error);
      // Return mock data for development
      return [];
    }
  }

  /**
   * Get WooCommerce metrics overview
   */
  async getMetricsOverview(storeId?: string, dateRange?: string): Promise<WooCommerceMetrics> {
    try {
      const params = new URLSearchParams();
      if (storeId) params.set('store_id', storeId);
      if (dateRange) params.set('date_range', dateRange);
      
      const response = await fetch(`${this.baseUrl}/api/woocommerce/metrics?${params.toString()}`, {
        method: 'GET',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get metrics: ${response.status}`);
      }

      const data = await response.json();
      return data.metrics || {
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        totalProducts: 0,
        conversionRate: 0,
        topProducts: []
      };
    } catch (error) {
      console.error('Failed to get WooCommerce metrics:', error);
      // Return mock data for development
      return {
        totalSales: 125000,
        totalOrders: 450,
        averageOrderValue: 278,
        totalProducts: 120,
        conversionRate: 3.2,
        topProducts: [
          { id: '1', name: 'Premium Product A', sales: 85, revenue: 12750 },
          { id: '2', name: 'Best Seller B', sales: 72, revenue: 9360 },
          { id: '3', name: 'Popular Item C', sales: 58, revenue: 7540 }
        ]
      };
    }
  }

  /**
   * Refresh WordPress access token
   */
  async refreshToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/wordpress/oauth/refresh`, {
        method: 'POST',
        headers: this.makeHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to refresh WordPress token:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const woocommerceIntegrationService = new WooCommerceIntegrationService();
