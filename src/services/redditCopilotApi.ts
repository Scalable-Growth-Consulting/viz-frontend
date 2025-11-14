import axios from 'axios';

// API Gateway base URL - update this with your actual API Gateway URL
const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'https://api.yourdomain.com/prod';

// API endpoints
const ENDPOINTS = {
  // Reddit OAuth
  REDDIT_AUTH_INIT: '/reddit/auth/init',
  REDDIT_AUTH_CALLBACK: '/reddit/auth/callback',
  REDDIT_AUTH_REVOKE: '/reddit/auth/revoke',
  REDDIT_AUTH_REFRESH: '/reddit/auth/refresh',
  
  // Client Profile
  CLIENT_PROFILE: '/client/profile',
  
  // Agent Control
  AGENT_START: '/agent/start',
  AGENT_STOP: '/agent/stop',
  AGENT_STATUS: '/agent/status',
  AGENT_LOGS: '/agent/logs',
  
  // User Data
  USER_TOKENS: '/user/tokens',
  USER_PROFILE: '/user/profile'
};

// Types
export interface RedditToken {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  reddit_username: string;
  scope: string[];
}

export interface ClientProfile {
  usp: string;
  industry: string;
  keywords: string[];
  created_at?: string;
  updated_at?: string;
}

export interface AgentSession {
  session_id: string;
  status: 'idle' | 'running' | 'stopped' | 'error';
  started_at?: string;
  stopped_at?: string;
  stats: {
    searches: number;
    generated: number;
    posted: number;
    errors: number;
  };
}

export interface LogEntry {
  id: string;
  session_id: string;
  type: 'search' | 'generate' | 'post' | 'info' | 'error';
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// API Service Class
class RedditCoPilotAPI {
  private isDemoMode = !API_BASE_URL || API_BASE_URL.includes('yourdomain.com');

  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Demo mode fallback methods
  private async demoDelay(ms: number = 1000) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }

  private generateMockToken(): RedditToken {
    return {
      access_token: `reddit_token_${Date.now()}`,
      refresh_token: `refresh_token_${Date.now()}`,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      reddit_username: `user_${Math.random().toString(36).substring(7)}`,
      scope: ['identity', 'read', 'submit']
    };
  }

  // Reddit OAuth Methods
  async initiateRedditAuth(): Promise<{ auth_url: string }> {
    if (this.isDemoMode) {
      await this.demoDelay(500);
      // In demo mode, simulate successful connection
      const mockToken = this.generateMockToken();
      localStorage.setItem('reddit-copilot-token', JSON.stringify(mockToken));
      return { auth_url: '#demo-connected' };
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.REDDIT_AUTH_INIT}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Reddit auth init failed:', error);
      throw new Error('Failed to initiate Reddit authentication');
    }
  }

  async handleRedditCallback(code: string, state: string): Promise<RedditToken> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.REDDIT_AUTH_CALLBACK}`,
        { code, state },
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Reddit auth callback failed:', error);
      throw new Error('Failed to complete Reddit authentication');
    }
  }

  async revokeRedditAuth(): Promise<void> {
    if (this.isDemoMode) {
      await this.demoDelay(500);
      localStorage.removeItem('reddit-copilot-token');
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}${ENDPOINTS.REDDIT_AUTH_REVOKE}`,
        {},
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Reddit auth revoke failed:', error);
      throw new Error('Failed to revoke Reddit authentication');
    }
  }

  async refreshRedditToken(): Promise<RedditToken> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.REDDIT_AUTH_REFRESH}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Reddit token refresh failed:', error);
      throw new Error('Failed to refresh Reddit token');
    }
  }

  // Client Profile Methods
  async saveClientProfile(profile: ClientProfile): Promise<ClientProfile> {
    if (this.isDemoMode) {
      await this.demoDelay(1000);
      const savedProfile = {
        ...profile,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('reddit-copilot-profile', JSON.stringify(savedProfile));
      return savedProfile;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.CLIENT_PROFILE}`,
        profile,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Save client profile failed:', error);
      throw new Error('Failed to save client profile');
    }
  }

  async getClientProfile(): Promise<ClientProfile | null> {
    if (this.isDemoMode) {
      await this.demoDelay(500);
      const profile = localStorage.getItem('reddit-copilot-profile');
      return profile ? JSON.parse(profile) : null;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.CLIENT_PROFILE}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // Profile doesn't exist yet
      }
      console.error('Get client profile failed:', error);
      throw new Error('Failed to retrieve client profile');
    }
  }

  // Agent Control Methods
  async startAgent(): Promise<AgentSession> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}${ENDPOINTS.AGENT_START}`,
        {},
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Start agent failed:', error);
      throw new Error('Failed to start Reddit commenting agent');
    }
  }

  async stopAgent(sessionId: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}${ENDPOINTS.AGENT_STOP}`,
        { session_id: sessionId },
        { headers: this.getAuthHeaders() }
      );
    } catch (error) {
      console.error('Stop agent failed:', error);
      throw new Error('Failed to stop Reddit commenting agent');
    }
  }

  async getAgentStatus(): Promise<AgentSession | null> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.AGENT_STATUS}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No active session
      }
      console.error('Get agent status failed:', error);
      throw new Error('Failed to get agent status');
    }
  }

  async getAgentLogs(sessionId?: string, limit: number = 50): Promise<LogEntry[]> {
    try {
      const params = new URLSearchParams();
      if (sessionId) params.append('session_id', sessionId);
      params.append('limit', limit.toString());

      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.AGENT_LOGS}?${params.toString()}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get agent logs failed:', error);
      throw new Error('Failed to retrieve agent logs');
    }
  }

  // User Data Methods
  async getUserTokens(): Promise<RedditToken | null> {
    if (this.isDemoMode) {
      await this.demoDelay(500);
      const token = localStorage.getItem('reddit-copilot-token');
      return token ? JSON.parse(token) : null;
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.USER_TOKENS}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null; // No tokens found
      }
      console.error('Get user tokens failed:', error);
      throw new Error('Failed to retrieve user tokens');
    }
  }

  async getUserProfile(): Promise<{ reddit_token: RedditToken | null; client_profile: ClientProfile | null }> {
    if (this.isDemoMode) {
      await this.demoDelay(500);
      const token = localStorage.getItem('reddit-copilot-token');
      const profile = localStorage.getItem('reddit-copilot-profile');
      return {
        reddit_token: token ? JSON.parse(token) : null,
        client_profile: profile ? JSON.parse(profile) : null
      };
    }

    try {
      const response = await axios.get(
        `${API_BASE_URL}${ENDPOINTS.USER_PROFILE}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get user profile failed:', error);
      throw new Error('Failed to retrieve user profile');
    }
  }

  // WebSocket connection for real-time logs (optional)
  connectToLogs(sessionId: string, onMessage: (log: LogEntry) => void, onError?: (error: Error) => void): WebSocket | null {
    try {
      const wsUrl = `${API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')}/agent/logs/stream?session_id=${sessionId}`;
      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const log: LogEntry = JSON.parse(event.data);
          onMessage(log);
        } catch (error) {
          console.error('Failed to parse log message:', error);
        }
      };

      ws.onerror = (event) => {
        const error = new Error('WebSocket connection error');
        console.error('WebSocket error:', event);
        if (onError) onError(error);
      };

      return ws;
    } catch (error) {
      console.error('Failed to connect to log stream:', error);
      if (onError) onError(error as Error);
      return null;
    }
  }
}

// Export singleton instance
export const redditCopilotAPI = new RedditCoPilotAPI();

// Export types and API instance as default
export default redditCopilotAPI;
