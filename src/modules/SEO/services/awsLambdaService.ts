import { supabase } from '@/lib/supabase';
import { AnalysisInput, AnalysisResult } from '../types';

// AWS API Gateway configuration
const AWS_API_BASE = 'https://nrl3k5c472.execute-api.ap-south-1.amazonaws.com/dev';

// Job status types
export type JobStatus = 'pending' | 'queued' | 'fetched' | 'processing' | 'completed' | 'failed' | 'error';

export interface SEOJob {
  job_id: string;
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
}

export interface CreateJobRequest {
  url: string;
  primary_keyword?: string;
  target_market?: string;
  competitors?: string[];
}

export interface CreateJobResponse {
  job_id: string;
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
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getAuthToken();
    
    const response = await fetch(`${AWS_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'X-Client-Info': 'viz-bi-agent/1.0.0',
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.text();
        if (errorData) {
          errorMessage = `API error ${response.status}: ${errorData}`;
        }
      } catch (e) {
        // If we can't parse error response, use the default message
      }
      
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as T;
    }
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

      return response;
    } catch (error) {
      console.error('Failed to create SEO analysis job:', error);
      throw new Error(`Failed to start analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get job status and results
   */
  public async getJob(jobId: string): Promise<SEOJob> {
    if (!jobId || jobId.trim().length === 0) {
      throw new Error('Job ID is required');
    }

    try {
      const response = await this.makeRequest<SEOJob>(`/jobs/${encodeURIComponent(jobId.trim())}`, {
        method: 'GET',
      });

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

          // Check if job is complete
          if (job.status === 'completed') {
            resolve(job);
            return;
          }

          // Check if job failed
          if (job.status === 'failed' || job.status === 'error') {
            reject(new Error(job.error_message || `Analysis failed with status: ${job.status}`));
            return;
          }

          // Continue polling for pending/queued/fetched/processing states
          if (['pending', 'queued', 'fetched', 'processing'].includes(job.status)) {
            setTimeout(poll, intervalMs);
            return;
          }

          // Unknown status
          reject(new Error(`Unknown job status: ${job.status}`));
        } catch (error) {
          console.error('Polling error:', error);
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
