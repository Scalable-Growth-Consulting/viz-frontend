import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  isAnalysisComplete: (job: SEOJob) => boolean;
  
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
  const navigate = useNavigate();
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
   * Check if analysis is truly complete based on timestamps
   */
  const isAnalysisComplete = useCallback((job: SEOJob): boolean => {
    // Check for GEO completion timestamps
    const hasGeoScore = (job as any)?.item?.geo_scored_at !== undefined && (job as any)?.item?.geo_scored_at !== null;
    const hasGeoScorecard = (job as any)?.scorecard?.generative_ai?.geo_scored_at !== undefined && (job as any)?.scorecard?.generative_ai?.geo_scored_at !== null;

    // Check for SEO completion timestamp
    const hasSeoScore = (job as any)?.item?.seo_score?.evaluated_at !== undefined && (job as any)?.item?.seo_score?.evaluated_at !== null;

    // Job is complete when we have all required completion indicators
    // Don't rely solely on status since backend might not update it correctly
    if (hasGeoScore && hasGeoScorecard && hasSeoScore) {
      return true;
    }

    // Also accept if status indicates completion AND we have at least some completion indicators
    // This handles cases where backend status is correct but timestamps are still updating
    const hasValidStatus = job.status === 'scored' || job.status === 'geo_scored';
    if (hasValidStatus && (hasGeoScore || hasSeoScore)) {
      return true;
    }

    return false;
  }, []);

  /**
   * Update progress based on job status and completion state
   */
  const updateProgress = useCallback((job: SEOJob) => {
    let progressValue = 0;
    
    // Check if truly complete first
    if (isAnalysisComplete(job)) {
      progressValue = 100;
    } else {
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
          progressValue = job.progress || 65;
          break;
        case 'geo_scored':
        case 'scored':
          // Partial completion - waiting for all timestamps
          progressValue = 85;
          break;
        case 'failed':
        case 'error':
          progressValue = 0;
          break;
        default:
          progressValue = 0;
      }
    }
    
    setProgress(progressValue);
  }, [isAnalysisComplete]);

  /**
   * Handle job status updates during polling
   */
  const handleJobUpdate = useCallback((job: SEOJob) => {
    setCurrentJob(job);
    updateProgress(job);
    
    // Check if analysis is truly complete
    const isComplete = isAnalysisComplete(job);
    
    // Show status updates via toast
    const statusMessages: Record<JobStatus, string> = {
      pending: 'Analysis queued...',
      queued: 'Starting analysis...',
      fetched: 'Page content retrieved...',
      processing: 'Analyzing SEO & GEO signals...',
      geo_scored: 'GEO analysis complete, finalizing SEO...',
      scored: 'Analysis complete, processing results...',
      failed: 'Analysis failed',
      error: 'An error occurred',
    };
    
    let message = statusMessages[job.status];
    
    // Override message if truly complete
    if (isComplete) {
      message = 'Analysis completed!';
    }
    
    if (message && !isComplete) {
      toast({
        title: 'Analysis Progress',
        description: message,
        duration: 2000,
      });
    }
  }, [toast, updateProgress, isAnalysisComplete]);

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
      
      // Verify the job is truly complete
      if (!isAnalysisComplete(completedJob)) {
        throw new Error('Analysis polling completed but job is not fully processed');
      }
      
      // Transform AWS Lambda response to expected AnalysisResult format
      const transformAWSResponse = (job: any): AnalysisResult => {
        const seoScore = job.item?.seo_score || {};
        const geoSignals = job.scorecard?.generative_ai || {};
        const onPageMetrics = job.scorecard?.on_page || {};

        // Calculate overall score correctly: (SEO_score * 10 + GEO_score) / 2
        // SEO is on scale of 10, GEO is on scale of 100
        const seoScoreOutOf10 = seoScore.overall_score || 0;
        const geoScoreOutOf100 = geoSignals.geo_overall_score || 0;
        const calculatedOverallScore = Math.round((seoScoreOutOf10 * 10 + geoScoreOutOf100) / 2);

        return {
          url: job.item?.url || '',
          computedAt: new Date().toISOString(),
          overallScore: calculatedOverallScore,
          // Store raw scores for display
          seoScoreOutOf10: seoScoreOutOf10,
          geoScoreOutOf100: geoScoreOutOf100,
          pillars: {
            visibility: Math.round((seoScore.canonical_score || 0 + seoScore.link_score || 0 + onPageMetrics.h1_count || 0) / 3),
            trust: Math.round((seoScore.structured_score || 0 + geoSignals.authority_signals || 0) / 2),
            relevance: Math.round((seoScore.content_score || 0 + geoSignals.contextual_relevance || 0) / 2),
          },
          onPage: {
            title: job.item?.title || '',
            titleLength: onPageMetrics.title_length || 0,
            metaDescription: job.item?.meta_description || '',
            metaDescriptionLength: onPageMetrics.meta_description_length || 0,
            h1Count: onPageMetrics.h1_count || 0,
            h2Count: onPageMetrics.h2_count || 0,
            h3Count: onPageMetrics.h3_count || 0,
            wordCount: onPageMetrics.word_count || 0,
            keywordDensity: [],
            imageCount: onPageMetrics.images?.count || 0,
            imagesWithAlt: Math.round((onPageMetrics.images?.alt_coverage_percent || 0) * (onPageMetrics.images?.count || 0) / 100),
            schemaPresent: onPageMetrics.schema_markup_present || false,
            internalLinks: job.item?.internal_links?.length || 0,
            externalLinks: job.item?.external_links?.length || 0,
          },
          geo: {
            aiVisibilityRate: geoSignals.ai_visibility_rate || 0,
            citationFrequency: geoSignals.citation_frequency || 0,
            brandMentionScore: geoSignals.brand_mention_score || 0,
            sentimentAccuracy: geoSignals.sentiment_accuracy || 0,
            structuredDataScore: geoSignals.structured_data_score || 0,
            contextualRelevance: geoSignals.contextual_relevance || 0,
            authoritySignals: geoSignals.authority_signals || 0,
            conversationalOptimization: geoSignals.conversational_ai_presence || 0,
            factualAccuracy: geoSignals.factual_signal_score || 0,
            topicCoverage: geoSignals.topic_coverage || 0,
            hreflangTags: [],
            localKeywords: [],
          },
          offPage: {
            backlinkCountEstimate: null,
            domainTrustScore: null,
            competitorKeywordOverlap: [],
          },
          topQuickFixes: [],
          missedOpportunities: [],
          competitorSummaries: [],
        };
      };

      // Transform the completed job to the expected format
      const transformedResult = transformAWSResponse(completedJob);

      // Set the transformed result
      setResult(transformedResult);
      
      toast({
        title: 'Analysis Complete!',
        description: 'Your SEO & GEO analysis is ready.',
      });
      
      // Call completion callback if provided (this should handle navigation)
      if (onComplete) {
        onComplete();
      } else {
        // Default navigation to SEO page with results tab
        navigate('/seo?tab=report');
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
    isAnalysisComplete,
    
    // Job management
    getJobHistory,
    retryAnalysis,
  };
};
