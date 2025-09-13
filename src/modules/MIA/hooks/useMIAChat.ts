import { useState } from 'react';

export interface ChatApiResponse {
  id: string;
  response: string;
  timestamp: string;
  insights?: Array<{
    title: string;
    severity: string;
    recommendation: string;
  }>;
}

export interface ChatApiRequest {
  message: string;
  userId: string;
  timestamp: string;
  context?: string;
}

export const useMIAChat = () => {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (request: ChatApiRequest): Promise<ChatApiResponse> => {
    setIsLoading(true);
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // Get auth token if available
      const token = localStorage.getItem('auth_token') || 
                   sessionStorage.getItem('auth_token') ||
                   localStorage.getItem('supabase.auth.token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${backendUrl}/chat/gemini`, {
        method: 'POST',
        headers,
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        id: data.id || `msg_${Date.now()}`,
        response: data.response || data.message || 'No response received',
        timestamp: data.timestamp || new Date().toISOString(),
        insights: data.insights || []
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading
  };
};
