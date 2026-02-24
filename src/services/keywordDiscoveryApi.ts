/**
 * Keyword Discovery API Service
 * Uses n8n webhook for keyword generation
 */

import { supabase } from '@/integrations/supabase/client';

class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

async function getAuthToken(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session?.access_token) {
    throw new AuthenticationError();
  }
  
  return session.access_token;
}

const WEBHOOK_URL =
  import.meta.env.VITE_KEYWORD_DISCOVERY_WEBHOOK_URL?.trim() ||
  'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/keywords';

export interface KeywordDiscoveryResponse {
  unified_keywords: string[];
  total_count: number;
}

export interface KeywordDiscoveryPayload {
  industry: string;
  usp: string;
  key_services?: string[];
}

class KeywordDiscoveryError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'KeywordDiscoveryError';
  }
}

function coerceKeywords(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((kw) => (typeof kw === 'string' ? kw.trim() : ''))
    .filter((kw): kw is string => Boolean(kw));
}

function extractKeywordsFromPayload(payload: any): { keywords: string[]; totalCount?: number } {
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const result = extractKeywordsFromPayload(entry);
      if (result.keywords.length) return result;
    }
    return { keywords: [], totalCount: undefined };
  }

  if (!payload || typeof payload !== 'object') {
    return { keywords: [], totalCount: undefined };
  }

  const candidatePaths = [
    payload.unified_keywords,
    payload.keywords,
    payload.output?.unified_keywords,
    payload.output?.keywords,
    payload.data?.unified_keywords,
    payload.data?.keywords,
  ];

  for (const candidate of candidatePaths) {
    const keywords = coerceKeywords(candidate);
    if (keywords.length) {
      const countPaths = [
        payload.total_count,
        payload.output?.total_count,
        payload.data?.total_count,
        candidate?.length,
      ];
      const totalCount = countPaths.find((value) => typeof value === 'number' && Number.isFinite(value));
      return {
        keywords,
        totalCount: typeof totalCount === 'number' ? totalCount : keywords.length,
      };
    }
  }

  return { keywords: [], totalCount: undefined };
}

/**
 * Discover keywords using n8n webhook
 */
export async function discoverKeywords(payload: KeywordDiscoveryPayload): Promise<KeywordDiscoveryResponse> {
  try {
    const token = await getAuthToken();
    const headers = {
      'Authorization': `Bearer ${token}`,
    };
    
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        industry: payload.industry,
        usp: payload.usp,
        key_services: payload.key_services || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new KeywordDiscoveryError(
        `Keyword discovery failed: ${errorText}`,
        response.status
      );
    }

    const data = await response.json();
    const { keywords, totalCount } = extractKeywordsFromPayload(data);

    if (!keywords.length) {
      throw new KeywordDiscoveryError('Invalid response format from keyword discovery API');
    }

    return {
      unified_keywords: keywords,
      total_count: totalCount ?? keywords.length,
    };
  } catch (error) {
    if (error instanceof KeywordDiscoveryError) {
      throw error;
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new KeywordDiscoveryError('Network error: Unable to connect to keyword discovery service');
    }
    
    throw new KeywordDiscoveryError(
      error instanceof Error ? error.message : 'Unknown error occurred'
    );
  }
}

export { KeywordDiscoveryError };
