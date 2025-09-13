// Meta Integration Service for MIA
import { useToast } from '@/components/ui/use-toast';

export interface MetaConnectionStatus {
  isConnected: boolean;
  accountId?: string;
  accountName?: string;
  lastSync?: string;
  status: 'idle' | 'connecting' | 'connected' | 'error';
  errorMessage?: string;
}

export class MetaIntegrationService {
  private baseUrl: string;
  private toast: any;
  private dummyUserId: string = 'test-user-123'; // Dummy user ID for testing

  constructor() {
    this.baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';
  }

  /**
   * Initiate Meta OAuth connection
   * Opens a popup window for Meta authentication
   * Expects the backend callback page to postMessage back { success: true, userId: "<id>" }
   * Stores userId in localStorage under key "metaUserId" on success.
   */
  async connectMeta(): Promise<void> {
    try {
      const authUrl = `${this.baseUrl}/auth/meta/start`;
      // POST to backend to get the real OAuth URL
      console.log(authUrl);
      const response = await fetch(authUrl, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': this.dummyUserId
        },
        credentials: 'include',
      });
      // console.log(response.url)
      console.log(response)
      if (!response.ok) throw new Error('Failed to get OAuth URL from backend');
      const data = await response.json();
      console.log('[MetaIntegration] Auth response data:', data);
      const url = data.authUrl || data.url; // ✅ Looking for 'authUrl' first, fallback to 'url'
      if (!url) throw new Error('No authUrl returned from backend');

      // Open the returned URL in a popup (GET to provider)
      const popupName = 'meta-auth-' + Date.now();
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
            console.log(messageHandler);
            // Security: accept messages only from backend origin
            if (event.origin !== allowedOrigin) return;

            const data = event.data;
            if (!data) return;
            console.log(data.userId);
            // Expected success response { success: true, userId: "..." }
            if (data.success === true && data.userId) {
              // store userId and resolve
              try {
                localStorage.setItem('metaUserId', String(data.userId));
              } catch (err) {
                console.warn('Failed to persist meta userId to localStorage', err);
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
            // ignore and wait for other messages / popup close
            console.error('Error handling popup message', err);
          }
        };

        window.addEventListener('message', messageHandler);

        // Fallback: poll for popup close; if closed without message -> check backend status (existing behavior)
        const checkClosed = setInterval(() => {
          if (popup.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', messageHandler);
            // Small delay to allow backend to update status
            setTimeout(() => {
              this.checkConnectionStatus()
                .then((status) => {
                  if (status.isConnected) {
                    // store accountId if provided by status (best-effort)
                    if (status.accountId) {
                      try {
                        localStorage.setItem('metaUserId', String(status.accountId));
                      } catch (err) {
                        console.warn('Failed to persist meta userId from status', err);
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
        const timeout = setTimeout(() => {
          clearInterval(checkClosed);
          window.removeEventListener('message', messageHandler);
          if (!popup.closed) popup.close();
          if (!resolved) reject(new Error('Authentication timeout. Please try again.'));
        }, 300000);
      });
    } catch (error) {
      console.error('Meta connection error:', error);
      throw error;
    }
  }
//
  /**
   * Initiate Meta OAuth connection
   * Opens a popup window for Meta authentication
   */
  // async connectMeta(): Promise<void> {
  //   try {
  //     const authUrl = `${this.baseUrl}/auth/meta/start`;
  //     // POST to backend to get the real OAuth URL
  //     const response = await fetch(authUrl, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       credentials: 'include',
  //     });
  //     if (!response.ok) throw new Error('Failed to get OAuth URL from backend');
  //     const { url } = await response.json();
  //     if (!url) throw new Error('No URL returned from backend');

  //     // Open the returned URL in a popup
  //     const popup = window.open(
  //       url,
  //       'meta-auth',
  //       'width=600,height=700,scrollbars=yes,resizable=yes,left=' +
  //         (window.screen.width / 2 - 300) + ',top=' + (window.screen.height / 2 - 350)
  //     );
  //     if (!popup) throw new Error('Popup blocked. Please allow popups for this site and try again.');

  //     // Listen for popup completion
  //     return new Promise((resolve, reject) => {
  //       const checkClosed = setInterval(() => {
  //         if (popup.closed) {
  //           clearInterval(checkClosed);
  //           // Small delay to allow backend to process the callback
  //           setTimeout(() => {
  //             this.checkConnectionStatus()
  //               .then((status) => {
  //                 if (status.isConnected) {
  //                   resolve();
  //                 } else {
  //                   reject(new Error('Authentication was cancelled or failed.'));
  //                 }
  //               })
  //               .catch(reject);
  //           }, 1000);
  //         }
  //       }, 1000);

  //       // Timeout after 5 minutes
  //       setTimeout(() => {
  //         clearInterval(checkClosed);
  //         if (!popup.closed) {
  //           popup.close();
  //         }
  //         reject(new Error('Authentication timeout. Please try again.'));
  //       }, 300000);
  //     });
  //   } catch (error) {
  //     console.error('Meta connection error:', error);
  //     throw error;
  //   }
  // }

  /**
   * Check current Meta connection status
   * ORIGINAL IMPLEMENTATION - COMMENTED OUT FOR DUMMY TESTING
   */
  async checkConnectionStatus(): Promise<MetaConnectionStatus> {
  try {
    const metaUserId = localStorage.getItem('metaUserId') || this.dummyUserId;

    const response = await fetch(`${this.baseUrl}/auth/meta/status`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': metaUserId,
      },
    });

      console.log(`[MetaIntegration] Status response: ${response.status}`);

      if (!response.ok) {
        // If backend is not running, return idle status instead of error
        if (response.status === 0 || !response.status) {
          console.warn('[MetaIntegration] Backend appears to be offline');
          return {
            isConnected: false,
            status: 'idle',
            errorMessage: 'Backend service is not available. Please ensure the backend is running on ' + this.baseUrl,
          };
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[MetaIntegration] Status data:', data);
      
      return {
        isConnected: data.connected || false,
        accountId: data.accountId,
        accountName: data.accountName,
        lastSync: data.lastSync,
        status: data.connected ? 'connected' : 'idle',
      };
    } catch (error) {
      console.error('Error checking Meta connection status:', error);
      
      // Check if it's a network error (backend not running)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return {
          isConnected: false,
          status: 'idle',
          errorMessage: `Cannot connect to backend at ${this.baseUrl}. Please ensure the backend server is running.`,
        };
      }
      
      return {
        isConnected: false,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * DUMMY CONNECTION STATUS - Returns connected state for testing
   * Remove this and uncomment above method when backend is ready
   */
  // async checkConnectionStatus(): Promise<MetaConnectionStatus> {
  //   console.log('[MetaIntegration] Using DUMMY status - always returns connected');
    
  //   // Simulate API delay
  //   await new Promise(resolve => setTimeout(resolve, 500));
    
  //   return {
  //     isConnected: true,
  //     accountId: 'act_123456789',
  //     accountName: 'Demo Meta Ads Account',
  //     lastSync: new Date().toISOString(),
  //     status: 'connected',
  //   };
  // }

  /**
   * Disconnect Meta account
   */
  async disconnectMeta(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/meta/disconnect`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.dummyUserId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error disconnecting Meta:', error);
      throw error;
    }
  }

  /**
   * Sync Meta data
   */
  async syncMetaData(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meta/sync`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.dummyUserId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error syncing Meta data:', error);
      throw error;
    }
  }

  /**
   * Get Meta campaigns
   */
  async getMetaCampaigns(): Promise<any[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/meta/campaigns`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': this.dummyUserId,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.campaigns || [];
    } catch (error) {
      console.error('Error fetching Meta campaigns:', error);
      return [];
    }
  }
}

export const metaIntegrationService = new MetaIntegrationService();