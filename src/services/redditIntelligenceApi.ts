import { supabase } from '@/integrations/supabase/client';

const BASE_URL = import.meta.env.VITE_REDDIT_API_BASE_URL || 
  'https://aios-reddit-functions.azurewebsites.net/api';
const FUNCTION_KEY = import.meta.env.VITE_REDDIT_FUNCTION_KEY || 
  'Rq19PG-e681zKYC_beSih-F0GmXgALoIJBvnGeteqbLgAzFu7bjWsA==';

const DEBUG = import.meta.env.DEV || localStorage.getItem('REDDIT_INTELLIGENCE_DEBUG') === 'true';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const logger = {
  log: (level: LogLevel, message: string, data?: any) => {
    if (!DEBUG && level === 'debug') return;
    const timestamp = new Date().toISOString();
    const prefix = `[RedditIntelligenceAPI][${level.toUpperCase()}][${timestamp}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  },
  info: (msg: string, data?: any) => logger.log('info', msg, data),
  warn: (msg: string, data?: any) => logger.log('warn', msg, data),
  error: (msg: string, data?: any) => logger.log('error', msg, data),
  debug: (msg: string, data?: any) => logger.log('debug', msg, data),
};

export class RedditAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'RedditAPIError';
  }
}

export class NetworkError extends RedditAPIError {
  constructor(message: string, endpoint?: string) {
    super(message, undefined, endpoint);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends RedditAPIError {
  constructor(message: string = 'Authentication required') {
    super(message, 403);
    this.name = 'AuthenticationError';
  }
}

export class TimeoutError extends RedditAPIError {
  constructor(message: string = 'Request timed out', endpoint?: string) {
    super(message, 408, endpoint);
    this.name = 'TimeoutError';
  }
}

async function makeRequest<T>(
  endpoint: string,
  options: RequestInit & { timeoutMs?: number; retries?: number } = {}
): Promise<T> {
  const { timeoutMs = 30000, retries = 2, ...fetchOptions } = options;
  const requestId = Math.random().toString(36).substring(7);
  
  logger.debug(`[${requestId}] Request to ${endpoint}`, { method: options.method || 'GET' });
  
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}code=${FUNCTION_KEY}`;
  
  let lastError: any;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      logger.warn(`[${requestId}] Request timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);
    
    try {
      const startTime = Date.now();
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
      
      clearTimeout(timer);
      const duration = Date.now() - startTime;
      logger.debug(`[${requestId}] Response received in ${duration}ms`, { status: response.status });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        logger.error(`[${requestId}] Request failed`, { status: response.status, response: errorText });
        
        if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError('Invalid API key. Please check configuration.');
        }
        if (response.status === 429) {
          throw new RedditAPIError('Rate limit exceeded. Please try again later.', 429, endpoint);
        }
        if (response.status >= 500) {
          const retryable = attempt < retries;
          if (retryable) {
            const backoffMs = 2000 * Math.pow(2, attempt);
            logger.warn(`[${requestId}] Server error, retrying in ${backoffMs}ms`, { attempt: attempt + 1 });
            await new Promise(r => setTimeout(r, backoffMs));
            continue;
          }
          throw new RedditAPIError('Server error. Please try again in a few moments.', response.status, endpoint);
        }
        
        throw new RedditAPIError(
          errorText || `API error: ${response.status}`,
          response.status,
          endpoint
        );
      }
      
      const data = await response.json();
      logger.debug(`[${requestId}] Response parsed successfully`);
      return data as T;
    } catch (error: any) {
      clearTimeout(timer);
      lastError = error;
      
      if (error.name === 'AbortError') {
        throw new TimeoutError('Request timeout. Please try again.', endpoint);
      }
      if (error.message?.includes('fetch') || error.message?.includes('network')) {
        if (attempt < retries) {
          const backoffMs = 1000 * Math.pow(2, attempt);
          logger.warn(`[${requestId}] Network error, retrying in ${backoffMs}ms`, { attempt: attempt + 1 });
          await new Promise(r => setTimeout(r, backoffMs));
          continue;
        }
        throw new NetworkError('Network error. Please check your connection.', endpoint);
      }
      
      if (error instanceof RedditAPIError) {
        throw error;
      }
      
      if (attempt < retries) {
        logger.warn(`[${requestId}] Request failed, retrying`, { attempt: attempt + 1, error: error.message });
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
        continue;
      }
      
      throw error;
    }
  }
  
  throw lastError || new RedditAPIError('Request failed after all retries', undefined, endpoint);
}

export interface BusinessAnalysisPayload {
  text: string;
  subreddit?: string;
  context?: {
    industry?: string;
    keywords?: string[];
  };
}

export interface BusinessAnalysisResponse {
  analysis: {
    sentiment: string;
    businessRelevance: number;
    keyInsights: string[];
    actionableItems: string[];
    industryAlignment: number;
  };
  metadata: {
    processedAt: string;
    model: string;
  };
}

export interface AccountRiskPayload {
  username: string;
  lookbackDays?: number;
  includeHistory?: boolean;
}

export interface AccountRiskResponse {
  riskScore: number;
  riskLevel: string;
  factors: {
    activityFrequency: number;
    contentQuality: number;
    engagementPattern: number;
    suspiciousActivity: number;
  };
  recentActivity: {
    totalPosts: number;
    totalComments: number;
    averageKarma: number;
    lastActive: string;
  };
  recommendations: string[];
}

export interface AnalyticsParams {
  startDate?: string;
  endDate?: string;
  subreddit?: string;
  groupBy?: 'day' | 'week' | 'month';
}

export interface AnalyticsResponse {
  summary: {
    totalComments: number;
    totalUpvotes: number;
    totalDownvotes: number;
    averageScore: number;
    engagementRate: number;
  };
  timeline: Array<{
    date: string;
    comments: number;
    upvotes: number;
    downvotes: number;
    avgScore: number;
  }>;
  topSubreddits: Array<{
    name: string;
    comments: number;
    avgScore: number;
  }>;
  topPerformers: Array<{
    commentId: string;
    text: string;
    score: number;
    subreddit: string;
  }>;
}

export interface PublishCommentPayload {
  postId: string;
  commentText: string;
  subreddit: string;
  accountId: string;
  metadata?: {
    campaign?: string;
    tags?: string[];
  };
}

export interface PublishCommentResponse {
  success: boolean;
  commentId?: string;
  commentUrl?: string;
  publishedAt?: string;
  logged?: boolean;
  logId?: string;
  error?: string;
  details?: string;
}

export interface UsageParams {
  accountId: string;
  startDate?: string;
  endDate?: string;
}

export interface UsageResponse {
  accountId: string;
  period: {
    start: string;
    end: string;
  };
  usage: {
    totalRequests: number;
    totalTokens: number;
    totalCost: number;
    byEndpoint: Record<string, { requests: number; tokens: number }>;
  };
  limits: {
    dailyRequestLimit: number;
    remainingToday: number;
    resetAt: string;
  };
}

export interface LogUsagePayload {
  accountId: string;
  endpoint: string;
  tokens: number;
  cost: number;
  metadata?: Record<string, any>;
}

export interface HRCandidatePayload {
  name: string;
  email: string;
  phone?: string;
  resume?: string;
  skills?: string[];
  experience?: number;
  location?: string;
}

export interface HRCandidateResponse {
  success: boolean;
  candidateId?: string;
  message?: string;
}

export interface HRCandidatesResponse {
  candidates: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    skills?: string[];
    experience?: number;
    location?: string;
    createdAt: string;
  }>;
  total: number;
}

export interface HRSystemJobsResponse {
  jobs: Array<{
    id: string;
    title: string;
    department: string;
    location: string;
    type: string;
    description: string;
    requirements: string[];
    postedAt: string;
  }>;
  total: number;
}

export const redditIntelligenceApi = {
  async analyzeBusinessContent(payload: BusinessAnalysisPayload): Promise<BusinessAnalysisResponse> {
    logger.info('Analyzing business content', { textLength: payload.text.length });
    
    try {
      const result = await makeRequest<BusinessAnalysisResponse>('/analyze-business', {
        method: 'POST',
        body: JSON.stringify(payload),
        timeoutMs: 45000,
      });
      
      logger.info('Business analysis completed', { sentiment: result.analysis.sentiment });
      return result;
    } catch (error) {
      logger.error('Business analysis failed', error);
      throw error;
    }
  },

  async assessAccountRisk(payload: AccountRiskPayload): Promise<AccountRiskResponse> {
    logger.info('Assessing account risk', { username: payload.username });
    
    try {
      const result = await makeRequest<AccountRiskResponse>('/account-risk', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      logger.info('Account risk assessment completed', { riskLevel: result.riskLevel });
      return result;
    } catch (error) {
      logger.error('Account risk assessment failed', error);
      throw error;
    }
  },

  async getAnalytics(params?: AnalyticsParams): Promise<AnalyticsResponse> {
    logger.info('Fetching analytics', params);
    
    try {
      const query = params ? new URLSearchParams(params as any).toString() : '';
      const result = await makeRequest<AnalyticsResponse>(`/analytics${query ? '?' + query : ''}`);
      
      logger.info('Analytics fetched', { totalComments: result.summary.totalComments });
      return result;
    } catch (error) {
      logger.error('Analytics fetch failed', error);
      throw error;
    }
  },

  async publishComment(payload: PublishCommentPayload): Promise<PublishCommentResponse> {
    logger.info('Publishing comment', { subreddit: payload.subreddit, postId: payload.postId });
    
    try {
      const result = await makeRequest<PublishCommentResponse>('/publish-comment', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      logger.info('Comment published', { success: result.success, commentId: result.commentId });
      return result;
    } catch (error) {
      logger.error('Comment publishing failed', error);
      throw error;
    }
  },

  async getUsage(params: UsageParams): Promise<UsageResponse> {
    logger.info('Fetching usage data', params);
    
    try {
      const query = new URLSearchParams(params as any).toString();
      const result = await makeRequest<UsageResponse>(`/usage?${query}`);
      
      logger.info('Usage data fetched', { totalRequests: result.usage.totalRequests });
      return result;
    } catch (error) {
      logger.error('Usage fetch failed', error);
      throw error;
    }
  },

  async logUsage(payload: LogUsagePayload): Promise<{ success: boolean; logId: string }> {
    logger.debug('Logging usage', { endpoint: payload.endpoint });
    
    try {
      const result = await makeRequest<{ success: boolean; logId: string }>('/usage', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      logger.debug('Usage logged', { logId: result.logId });
      return result;
    } catch (error) {
      logger.error('Usage logging failed', error);
      throw error;
    }
  },

  async registerHRCandidate(payload: HRCandidatePayload): Promise<HRCandidateResponse> {
    logger.info('Registering HR candidate', { name: payload.name, email: payload.email });
    
    try {
      const result = await makeRequest<HRCandidateResponse>('/hr-candidate-manual-reg', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      
      logger.info('HR candidate registered', { success: result.success, candidateId: result.candidateId });
      return result;
    } catch (error) {
      logger.error('HR candidate registration failed', error);
      throw error;
    }
  },

  async getHRCandidates(params?: { limit?: number; offset?: number }): Promise<HRCandidatesResponse> {
    logger.info('Fetching HR candidates', params);
    
    try {
      const query = params ? new URLSearchParams(params as any).toString() : '';
      const result = await makeRequest<HRCandidatesResponse>(`/hr-candidates${query ? '?' + query : ''}`);
      
      logger.info('HR candidates fetched', { total: result.total });
      return result;
    } catch (error) {
      logger.error('HR candidates fetch failed', error);
      throw error;
    }
  },

  async getHRSystemJobs(params?: { department?: string; location?: string }): Promise<HRSystemJobsResponse> {
    logger.info('Fetching HR system jobs', params);
    
    try {
      const query = params ? new URLSearchParams(params as any).toString() : '';
      const result = await makeRequest<HRSystemJobsResponse>(`/hr-get-system-jobs${query ? '?' + query : ''}`);
      
      logger.info('HR system jobs fetched', { total: result.total });
      return result;
    } catch (error) {
      logger.error('HR system jobs fetch failed', error);
      throw error;
    }
  },
};
