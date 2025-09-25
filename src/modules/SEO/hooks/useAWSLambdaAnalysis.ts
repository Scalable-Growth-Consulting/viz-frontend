import { useState, useCallback, useRef } from 'react';
import { awsLambdaService, SEOJob, JobStatus, validateUrl } from '../services/awsLambdaService';
import { AnalysisInput, AnalysisResult } from '../types';
import { useToast } from '@/components/ui/use-toast';

export interface UseAWSLambdaAnalysisReturn {
  // State
  loading: boolean;
  analyzing: boolean;
  currentJob: SEOJob | null;
  result: AnalysisResult | null;
  error: string | null;
  progress: number;
  
  // Actions
  startAnalysis: (input: AnalysisInput, onComplete?: () => void) => Promise<void>;
  cancelAnalysis: () => Promise<void>;
  clearResults: () => void;
  
  // Utilities
  validateUrl: (url: string) => { isValid: boolean; error?: string };
  
  // Job management
  getJobHistory: () => Promise<SEOJob[]>;
  retryAnalysis: () => Promise<void>;
}

export const useAWSLambdaAnalysis = (): UseAWSLambdaAnalysisReturn => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentJob, setCurrentJob] = useState<SEOJob | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  
  const { toast } = useToast();
  const lastInputRef = useRef<AnalysisInput | null>(null);
  const pollingRef = useRef<boolean>(false);

  /**
   * Clear all results and reset state
   */
  const clearResults = useCallback(() => {
    setCurrentJob(null);
    setResult(null);
    setError(null);
    setProgress(0);
    setAnalyzing(false);
    pollingRef.current = false;
  }, []);

  /**
   * Update progress based on job status
   */
  const updateProgress = useCallback((job: SEOJob) => {
    let progressValue = 0;
    
    switch (job.status) {
      case 'pending':
        progressValue = 10;
        break;
      case 'queued':
        progressValue = 25;
        break;
      case 'fetched':
        progressValue = 50;
        break;
      case 'processing':
        progressValue = job.progress || 75;
        break;
      case 'completed':
        progressValue = 100;
        break;
      case 'failed':
      case 'error':
        progressValue = 0;
        break;
      default:
        progressValue = 0;
    }
    
    setProgress(progressValue);
  }, []);

  /**
   * Handle job status updates during polling
   */
  const handleJobUpdate = useCallback((job: SEOJob) => {
    setCurrentJob(job);
    updateProgress(job);
    
    // Show status updates via toast
    const statusMessages: Record<JobStatus, string> = {
      pending: 'Analysis queued...',
      queued: 'Starting analysis...',
      fetched: 'Page content retrieved...',
      processing: 'Analyzing SEO & GEO signals...',
      completed: 'Analysis completed!',
      failed: 'Analysis failed',
      error: 'An error occurred',
    };
    
    const message = statusMessages[job.status];
    if (message && job.status !== 'completed') {
      toast({
        title: 'Analysis Progress',
        description: message,
        duration: 2000,
      });
    }
  }, [toast, updateProgress]);

  /**
   * Start SEO analysis with AWS Lambda
   */
  const startAnalysis = useCallback(async (input: AnalysisInput, onComplete?: () => void) => {
    try {
      // Clear previous results
      clearResults();
      setLoading(true);
      setError(null);
      
      // Store input for retry functionality
      lastInputRef.current = input;
      
      // Validate URL on frontend
      if (!input.url) {
        throw new Error('URL is required for analysis');
      }
      
      const urlValidation = validateUrl(input.url);
      if (!urlValidation.isValid) {
        throw new Error(urlValidation.error || 'Invalid URL provided');
      }
      
      toast({
        title: 'Starting Analysis',
        description: 'Initializing SEO & GEO analysis...',
      });
      
      // Create job
      const jobResponse = await awsLambdaService.createJob(input);
      
      toast({
        title: 'Analysis Started',
        description: `Job created: ${jobResponse.job_id}`,
      });
      
      setAnalyzing(true);
      pollingRef.current = true;
      
      // Poll for completion
      const completedJob = await awsLambdaService.pollUntilComplete(
        jobResponse.job_id,
        handleJobUpdate,
        {
          maxAttempts: 60,
          intervalMs: 3000,
          timeoutMs: 300000, // 5 minutes
        }
      );
      
      // Check if polling was cancelled
      if (!pollingRef.current) {
        return;
      }
      
      if (completedJob.result) {
        setResult(completedJob.result);
        toast({
          title: 'Analysis Complete!',
          description: 'Your SEO & GEO analysis is ready.',
        });
        
        // Call completion callback if provided
        if (onComplete) {
          onComplete();
        }
      } else {
        throw new Error('Analysis completed but no results were returned');
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Analysis Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      console.error('SEO Analysis Error:', err);
    } finally {
      setLoading(false);
      setAnalyzing(false);
      pollingRef.current = false;
    }
  }, [clearResults, handleJobUpdate, toast]);

  /**
   * Cancel ongoing analysis
   */
  const cancelAnalysis = useCallback(async () => {
    try {
      pollingRef.current = false;
      
      if (currentJob?.job_id) {
        await awsLambdaService.cancelJob(currentJob.job_id);
        
        toast({
          title: 'Analysis Cancelled',
          description: 'The analysis has been stopped.',
        });
      }
      
      clearResults();
    } catch (err) {
      console.error('Failed to cancel analysis:', err);
      
      toast({
        title: 'Cancellation Failed',
        description: 'Could not cancel the analysis. It may complete on its own.',
        variant: 'destructive',
      });
    }
  }, [currentJob, clearResults, toast]);

  /**
   * Retry the last analysis
   */
  const retryAnalysis = useCallback(async () => {
    if (lastInputRef.current) {
      await startAnalysis(lastInputRef.current);
    } else {
      toast({
        title: 'Cannot Retry',
        description: 'No previous analysis to retry.',
        variant: 'destructive',
      });
    }
  }, [startAnalysis, toast]);

  /**
   * Get job history
   */
  const getJobHistory = useCallback(async (): Promise<SEOJob[]> => {
    try {
      return await awsLambdaService.getJobHistory(10);
    } catch (err) {
      console.error('Failed to get job history:', err);
      return [];
    }
  }, []);

  return {
    // State
    loading,
    analyzing,
    currentJob,
    result,
    error,
    progress,
    
    // Actions
    startAnalysis,
    cancelAnalysis,
    clearResults,
    
    // Utilities
    validateUrl,
    
    // Job management
    getJobHistory,
    retryAnalysis,
  };
};
