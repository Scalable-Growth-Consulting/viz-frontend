import { supabase } from '@/lib/supabase';
import { AnalysisInput, AnalysisResult } from '../types';

// AWS API Gateway configuration
const AWS_API_BASE = (import.meta.env.VITE_AWS_API_BASE as string) || 'https://nrl3k5c472.execute-api.ap-south-1.amazonaws.com/dev';

// Job status types
export type JobStatus = 'pending' | 'queued' | 'fetched' | 'processing' | 'geo_scored' | 'scored' |'failed' | 'error';

export interface SEOJob {
  job_id?: string;  // Standard snake_case
  jobId?: string;   // Alternative camelCase
  status: JobStatus;
  url?: string;
  primary_keyword?: string;
  target_market?: string;
  competitors?: string[];
  created_at?: string;
  updated_at?: string;
  result?: AnalysisResult;
  error_message?: string;
  progress?: number;
  // Optional scored timestamps from DynamoDB indicating completion of respective pipelines
  seo_scored_at?: string | null;
  geo_scored_at?: string | null;
}

export interface CreateJobRequest {
  url: string;
  primary_keyword?: string;
  target_market?: string;
  competitors?: string[];
}

export interface CreateJobResponse {
  job_id?: string;  // Standard snake_case
  jobId?: string;   // Alternative camelCase
  status: JobStatus;
  message?: string;
}

/**
 * URL validation utility
 */
export const validateUrl = (url: string): { isValid: boolean; error?: string } => {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();
  
  // Check if URL starts with http:// or https://
  if (!trimmedUrl.match(/^https?:\/\//i)) {
    return { isValid: false, error: 'URL must start with http:// or https://' };
  }

  try {
    const urlObj = new URL(trimmedUrl);
    
    // Check if hostname is valid
    if (!urlObj.hostname || urlObj.hostname.length === 0) {
      return { isValid: false, error: 'Invalid hostname' };
    }

    // Check for valid domain structure
    if (!urlObj.hostname.includes('.') || urlObj.hostname.startsWith('.') || urlObj.hostname.endsWith('.')) {
      return { isValid: false, error: 'Invalid domain format' };
    }

    // Check for localhost or IP addresses (optional restriction)
    if (urlObj.hostname === 'localhost' || urlObj.hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
      return { isValid: false, error: 'Please provide a public domain URL' };
    }

    // Check for common problematic domains that might block crawlers
    const problematicDomains = [
      'facebook.com', 'instagram.com', 'twitter.com', 'linkedin.com',
      'youtube.com', 'tiktok.com', 'snapchat.com', 'pinterest.com'
    ];
    
    const hostname = urlObj.hostname.toLowerCase();
    for (const domain of problematicDomains) {
      if (hostname === domain || hostname.endsWith('.' + domain)) {
        return { 
          isValid: false, 
          error: `Social media platforms like ${domain} typically block automated analysis. Please try a regular website instead.` 
        };
      }
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
};

/**
 * AWS Lambda SEO Analysis Service
 * Provides secure integration with AWS API Gateway for SEO analysis
 */
export class AWSLambdaService {
  private static instance: AWSLambdaService;
  
  public static getInstance(): AWSLambdaService {
    if (!AWSLambdaService.instance) {
      AWSLambdaService.instance = new AWSLambdaService();
    }
    return AWSLambdaService.instance;
  }

  /**
   * Get authentication token from Supabase
   */
  private async getAuthToken(): Promise<string> {
    const session = await supabase.auth.getSession();
    const token = session?.data?.session?.access_token;
    
    if (!token) {
      throw new Error('Authentication required. Please sign in to continue.');
    }
    
    return token;
  }

  /**
   * Make authenticated request to AWS API Gateway
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit & { timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
  ): Promise<T> {
    const token = await this.getAuthToken();

    const { timeoutMs = 15000, retries = 2, retryDelayMs = 500, ...fetchOptions } = options as any;

    const url = `${AWS_API_BASE}${endpoint}`;
    console.log('Making request to:', url);
    console.log('Method:', fetchOptions.method || 'GET');
    console.log('Token present:', !!token);
    console.log('Token preview:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');

    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            // Allow callers to add headers, but never override our Authorization
            ...(fetchOptions.headers || {}),
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        clearTimeout(timer);

        if (!response.ok) {
          // Auth errors should not be retried here
          if (response.status === 401 || response.status === 403) {
            const errorBody = await response.text().catch(() => '');
            throw new Error(`Auth error ${response.status}: ${errorBody || response.statusText}`);
          }

          // Retry on 5xx and network-ish conditions
          if (response.status >= 500 && response.status < 600 && attempt < retries) {
            await new Promise(r => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
            continue;
          }

          let errorMessage = `API error ${response.status}: ${response.statusText}`;
          try {
            const errorData = await response.text();
            const reqId = response.headers.get('x-amzn-requestid') || response.headers.get('x-amz-request-id') || '';
            const apigwId = response.headers.get('x-amz-apigw-id') || '';
            const suffix = [reqId && `reqId=${reqId}`, apigwId && `apiGwId=${apigwId}`].filter(Boolean).join(' ');
            if (errorData) errorMessage = `API error ${response.status}: ${errorData}${suffix ? ` (${suffix})` : ''}`;
          } catch {}
          throw new Error(errorMessage);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const jsonResponse = await response.json();

          // Handle API Gateway proxy integration envelope
          if (jsonResponse && jsonResponse.statusCode && jsonResponse.body) {
            console.log('Detected API Gateway response format, parsing body...');
            try {
              const parsedBody = JSON.parse(jsonResponse.body);
              return parsedBody as T;
            } catch (parseError) {
              console.error('Failed to parse API Gateway response body:', parseError);
              throw new Error('Invalid JSON in API Gateway response body');
            }
          }

          return jsonResponse as T;
        }

        return (await response.text()) as unknown as T;
      } catch (err: any) {
        clearTimeout(timer);
        lastError = err;
        // Retry AbortError and network errors
        const message = err?.message || '';
        const isAbort = err?.name === 'AbortError' || /aborted|timeout/i.test(message);
        const isNetwork = /network|fetch failed|failed to fetch/i.test(message);
        if ((isAbort || isNetwork) && attempt < retries) {
          await new Promise(r => setTimeout(r, retryDelayMs * Math.pow(2, attempt)));
          continue;
        }
        throw err;
      }
    }

    throw lastError || new Error('Unknown request error');
  }

  /**
   * Create a new SEO analysis job
   */
  public async createJob(input: AnalysisInput): Promise<CreateJobResponse> {
    // Validate required URL
    if (!input.url) {
      throw new Error('URL is required for analysis');
    }

    const urlValidation = validateUrl(input.url);
    if (!urlValidation.isValid) {
      throw new Error(urlValidation.error || 'Invalid URL provided');
    }

    const requestData: CreateJobRequest = {
      url: input.url.trim(),
      primary_keyword: input.primaryKeyword?.trim() || undefined,
      target_market: input.targetMarket?.trim() || undefined,
      competitors: input.competitors?.filter(c => c.trim().length > 0) || undefined,
    };

    try {
      const response = await this.makeRequest<CreateJobResponse>('/jobs', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      console.log('AWS Lambda createJob response (parsed):', response);

      // Handle both job_id and jobId field names
      const jobId = response?.job_id || response?.jobId;
      
      console.log('Extracted job ID:', jobId);
      
      // Validate response has required job ID
      if (!response || !jobId) {
        console.error('Invalid response from AWS Lambda:', response);
        throw new Error('AWS Lambda did not return a valid job ID (expected job_id or jobId field). Please check your Lambda function.');
      }

      // Normalize response to always use job_id
      const normalizedResponse = {
        ...response,
        job_id: jobId
      };

      console.log('Normalized response:', normalizedResponse);
      return normalizedResponse;
    } catch (error) {
      console.error('Failed to create SEO analysis job:', error);
      
      // Handle specific error cases
      if (error instanceof Error) {
        // Check for robots.txt related errors
        if (error.message.includes('robots') || error.message.includes('blocked') || error.message.includes('disallowed')) {
          throw new Error(`The website ${input.url} blocks automated crawlers via robots.txt. Try analyzing a different page or contact the site owner for permission.`);
        }
        
        // Check for authentication errors
        if (error.message.includes('403') || error.message.includes('not authorized')) {
          throw new Error('Authentication failed. Please ensure you are logged in and try again.');
        }
        
        // Check for rate limiting
        if (error.message.includes('429') || error.message.includes('rate limit')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        
        // Check for server errors
        if (error.message.includes('500') || error.message.includes('502') || error.message.includes('503')) {
          throw new Error('Server temporarily unavailable. Please try again in a few minutes.');
        }
      }
      
      throw new Error(`Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get job status and results
   */
  public async getJob(jobId: string): Promise<SEOJob> {
    console.log('getJob called with jobId:', jobId, 'type:', typeof jobId);
    
    if (!jobId || jobId.trim().length === 0) {
      console.error('Job ID validation failed:', { jobId, type: typeof jobId });
      throw new Error('Job ID is required');
    }

    try {
      const response = await this.makeRequest<SEOJob>(`/jobs/${encodeURIComponent(jobId.trim())}`, {
        method: 'GET',
      });

      // Normalize response to always have job_id field
      if (response && !response.job_id && response.jobId) {
        response.job_id = response.jobId;
      }

      return response;
    } catch (error) {
      console.error('Failed to get job status:', error);
      throw new Error(`Failed to get job status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Poll job until completion with configurable intervals
   */
  public async pollUntilComplete(
    jobId: string,
    onUpdate?: (job: SEOJob) => void,
    options: {
      maxAttempts?: number;
      intervalMs?: number;
      timeoutMs?: number;
    } = {}
  ): Promise<SEOJob> {
    const {
      maxAttempts = 60, // Maximum polling attempts
      intervalMs = 3000, // 3 seconds between polls
      timeoutMs = 300000, // 5 minutes total timeout
    } = options;

    const startTime = Date.now();
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        attempts++;
        
        // Check timeout
        if (Date.now() - startTime > timeoutMs) {
          reject(new Error('Analysis timeout. Please try again with a simpler page.'));
          return;
        }

        // Check max attempts
        if (attempts > maxAttempts) {
          reject(new Error('Maximum polling attempts reached. Please try again later.'));
          return;
        }

        try {
          const job = await this.getJob(jobId);
          
          // Call update callback if provided
          if (onUpdate) {
            onUpdate(job);
          }

          // Check if job is complete - both SEO and GEO scoring must be finished
          // Be more flexible with status since backend might not update it correctly
          const hasValidStatus = job.status === 'scored' || job.status === 'geo_scored';
          
          // Check for GEO completion timestamps
          const hasGeoScore = (job as any)?.item?.geo_scored_at !== undefined && (job as any)?.item?.geo_scored_at !== null;
          const hasGeoScorecard = (job as any)?.scorecard?.generative_ai?.geo_scored_at !== undefined && (job as any)?.scorecard?.generative_ai?.geo_scored_at !== null;
          
          // Check for SEO completion timestamp
          const hasSeoScore = (job as any)?.item?.seo_score?.evaluated_at !== undefined && (job as any)?.item?.seo_score?.evaluated_at !== null;
          
          // Job is complete when we have all required completion indicators
          // Don't rely solely on status since backend might not update it correctly
          if (hasGeoScore && hasGeoScorecard && hasSeoScore) {
            resolve(job);
            return;
          }
          
          // Also accept if status indicates completion AND we have at least some completion indicators
          // This handles cases where backend status is correct but timestamps are still updating
          if (hasValidStatus && (hasGeoScore || hasSeoScore)) {
            resolve(job);
            return;
          }
        
          // Check if job failed
          if (job.status === 'failed' || job.status === 'error') {
            reject(new Error(job.error_message || `Analysis failed with status: ${job.status}`));
            return;
          }

          // Continue polling for pending/queued/fetched/processing states
          if (['pending', 'queued', 'fetched', 'processing','parsed'].includes(job.status)) {
            setTimeout(poll, intervalMs);
            return;
          }

          // Unknown status
          reject(new Error(`Unknown job status: ${job.status}`));
        } catch (error) {
          console.error('Polling error:', error);
          
          // Handle specific error cases
          if (error instanceof Error) {
            // If it's a 403 error, it might be an auth issue with the GET endpoint
            if (error.message.includes('403') || error.message.includes('not authorized')) {
              reject(new Error('Authentication failed when checking job status. Please ensure your AWS Lambda GET endpoint is properly configured for authentication.'));
              return;
            }
            
            // If it's a 404 error, the job might not exist
            if (error.message.includes('404')) {
              reject(new Error('Job not found. The analysis job may have expired or been deleted.'));
              return;
            }
            
            // For other errors, retry a few times before giving up
            if (attempts <= 3) {
              console.log(`Polling attempt ${attempts} failed, retrying in ${intervalMs}ms...`);
              setTimeout(poll, intervalMs);
              return;
            }
          }
          
          reject(error);
        }
      };

      // Start polling
      poll();
    });
  }

  /**
   * Cancel a running job (if supported by backend)
   */
  public async cancelJob(jobId: string): Promise<void> {
    if (!jobId || jobId.trim().length === 0) {
      throw new Error('Job ID is required');
    }

    try {
      await this.makeRequest(`/jobs/${encodeURIComponent(jobId.trim())}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to cancel job:', error);
      throw new Error(`Failed to cancel job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Trigger competitor keyword fetch for a job via GET /comp/{jobId}
   */
  public async triggerCompetitorKeywords(
    jobId: string,
    options: { signal?: AbortSignal; timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
  ): Promise<any> {
    const id = jobId?.trim();
    if (!id) throw new Error('Job ID is required');

    try {
      const { signal, timeoutMs = 15000, retries = 3, retryDelayMs = 600 } = options;
      const response = await this.makeRequest<any>(`/comp/${encodeURIComponent(id)}`, {
        method: 'GET',
        signal,
        timeoutMs,
        retries,
        retryDelayMs,
      });
      return response;
    } catch (error) {
      console.error('Failed to trigger competitor keyword fetch:', error);
      throw error;
    }
  }

  /**
   * Submit competitor URLs for a job via POST /comp/{jobId}
   */
  public async submitCompetitors(
    jobId: string,
    competitors: string[],
    options: { signal?: AbortSignal; timeoutMs?: number; retries?: number; retryDelayMs?: number } = {}
  ): Promise<any> {
    const id = jobId?.trim();
    if (!id) throw new Error('Job ID is required');
    const list = (competitors || [])
      .map(c => (c || '').trim())
      .filter(Boolean);
    if (list.length === 0) return { ok: true, message: 'No competitors to submit' };

    try {
      const { signal, timeoutMs = 15000, retries = 3, retryDelayMs = 600 } = options;
      const response = await this.makeRequest<any>(`/comp/${encodeURIComponent(id)}`, {
        method: 'POST',
        signal,
        timeoutMs,
        retries,
        retryDelayMs,
        body: JSON.stringify({ competitors: list }),
      });
      return response;
    } catch (error) {
      console.error('Failed to submit competitor URLs:', error);
      throw error;
    }
  }

  /**
   * Get AI recommendations for a job via POST /recom/{jobId}
   * Lambda returns API Gateway proxy format with a JSON body, handled by makeRequest
   */
  public async getRecommendations(
    jobId: string,
    options: { signal?: AbortSignal; timeoutMs?: number; retries?: number; retryDelayMs?: number; method?: 'POST' | 'GET' } = {}
  ): Promise<any> {
    const id = jobId?.trim();
    if (!id) throw new Error('Job ID is required');

    try {
      const {
        signal,
        timeoutMs = 15000,
        retries = 3,
        retryDelayMs = 600,
        method = 'POST',
      } = options;

      const response = await this.makeRequest<any>(`/recom/${encodeURIComponent(id)}`, {
        method,
        signal,
        timeoutMs,
        retries,
        retryDelayMs,
      });
      return response;
    } catch (error) {
      console.error('Failed to fetch recommendations:', error);
      throw error;
    }
  }

  /**
   * Get user's job history (if supported by backend)
   */
  public async getJobHistory(limit: number = 10): Promise<SEOJob[]> {
    try {
      const response = await this.makeRequest<SEOJob[]>(`/jobs?limit=${limit}`, {
        method: 'GET',
      });

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Failed to get job history:', error);
      // Return empty array instead of throwing to make this feature optional
      return [];
    }
  }

  /**
   * Health check for the AWS API
   */
  public async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.makeRequest<{ status: string; timestamp: string }>('/health', {
        method: 'GET',
      });

      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('AWS API is currently unavailable. Please try again later.');
    }
  }
}

// Export singleton instance
export const awsLambdaService = AWSLambdaService.getInstance();
