import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RedditToken {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  reddit_username: string;
}

export interface ClientProfile {
  usp: string;
  industry: string;
  keywords: string[];
}

export interface LogEntry {
  id: string;
  type: 'search' | 'generate' | 'post' | 'error';
  message: string;
  timestamp: Date;
}

interface RedditCoPilotState {
  // Reddit Connection
  redditToken: RedditToken | null;
  isRedditConnected: boolean;

  // Client Profile
  clientProfile: ClientProfile | null;

  // Agent Status
  isAgentRunning: boolean;
  agentLogs: LogEntry[];

  // Actions
  setRedditToken: (token: RedditToken | null) => void;
  setClientProfile: (profile: ClientProfile | null) => void;
  setAgentRunning: (running: boolean) => void;
  addLog: (type: LogEntry['type'], message: string) => void;
  clearLogs: () => void;

  // Computed getters
  getConnectionStatus: () => 'disconnected' | 'connected' | 'expired';
  getProfileCompletion: () => number; // 0-100 percentage
}

export const useRedditCoPilotStore = create<RedditCoPilotState>()(
  persist(
    (set, get) => ({
      // Initial state
      redditToken: null,
      isRedditConnected: false,
      clientProfile: null,
      isAgentRunning: false,
      agentLogs: [],

      // Actions
      setRedditToken: (token) => {
        set({
          redditToken: token,
          isRedditConnected: !!token && !isTokenExpired(token.expires_at)
        });
      },

      setClientProfile: (profile) => {
        set({ clientProfile: profile });
      },

      setAgentRunning: (running) => {
        set({ isAgentRunning: running });
      },

      addLog: (type, message) => {
        const newLog: LogEntry = {
          id: Date.now().toString() + Math.random(),
          type,
          message,
          timestamp: new Date()
        };
        set((state) => ({
          agentLogs: [...state.agentLogs, newLog]
        }));
      },

      clearLogs: () => {
        set({ agentLogs: [] });
      },

      // Computed getters
      getConnectionStatus: () => {
        const { redditToken } = get();
        if (!redditToken) return 'disconnected';

        if (isTokenExpired(redditToken.expires_at)) return 'expired';

        return 'connected';
      },

      getProfileCompletion: () => {
        const { clientProfile } = get();
        if (!clientProfile) return 0;

        let completion = 0;
        if (clientProfile.usp.trim()) completion += 40;
        if (clientProfile.industry) completion += 30;
        if (clientProfile.keywords.length > 0) completion += 30;

        return Math.min(completion, 100);
      }
    }),
    {
      name: 'reddit-copilot-storage',
      // Only persist certain parts of the state for security
      partialize: (state) => ({
        redditToken: state.redditToken,
        clientProfile: state.clientProfile,
        // Don't persist logs or runtime state
      })
    }
  )
);

// Helper function to check if token is expired
function isTokenExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

// Selectors for convenience
export const useRedditConnection = () => {
  const store = useRedditCoPilotStore();
  return {
    token: store.redditToken,
    isConnected: store.isRedditConnected,
    status: store.getConnectionStatus(),
    username: store.redditToken?.reddit_username || null
  };
};

export const useClientProfile = () => {
  const store = useRedditCoPilotStore();
  return {
    profile: store.clientProfile,
    completion: store.getProfileCompletion(),
    isComplete: store.getProfileCompletion() === 100
  };
};

export const useAgentStatus = () => {
  const store = useRedditCoPilotStore();
  return {
    isRunning: store.isAgentRunning,
    logs: store.agentLogs,
    addLog: store.addLog,
    clearLogs: store.clearLogs
  };
};
