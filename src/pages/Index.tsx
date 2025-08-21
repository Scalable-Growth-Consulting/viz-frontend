import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { mapErrorToToast } from '@/lib/errorMessages';
import { useSchema } from '@/contexts/SchemaContext';
import RateLimitModal from '../components/RateLimitModal';

type APIResponse<T> = { data: T | null; error: Error | null; };

// Helper function for retrying API calls
const retryFetch = async <T,>(fn: () => Promise<APIResponse<T>>, retries = 3, delay = 1000): Promise<APIResponse<T>> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result.error && result.error.message.includes('Failed to send a request to the Edge Function')) {
        throw result.error;
      }
      return result;
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error('All retry attempts failed');
};

const Index = () => {
  // State for query results
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{ label: string; data: number[]; backgroundColor: string; borderColor?: string; borderWidth?: number }>;
  } | null>(null);
  const [chartHtml, setChartHtml] = useState<string | null>(null);
  const [limitOpen, setLimitOpen] = useState(false);
  
  // Consolidated loading states
  const [loadingStates, setLoadingStates] = useState({
    query: false,
    chart: false
  });
  
  // UI states
  const [activeTab, setActiveTab] = useState<'answer' | 'sql' | 'chart'>('answer');
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { hasTables, setHasTables } = useSchema();
  const [schemaCheckLoading, setSchemaCheckLoading] = useState<boolean>(true);
  
  // Ref to track if component is mounted
  const isMountedRef = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Proactively check if user already has tables (without needing to open Data page)
  useEffect(() => {
    const checkSchemas = async () => {
      if (!user?.email) { setSchemaCheckLoading(false); return; }
      try {
        const res = await fetch('https://viz-fetch-schema-286070583332.us-central1.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'fetch schema failed');
        const tables = Array.isArray(json?.tables) ? json.tables : [];
        setHasTables(tables.length > 0);
      } catch (e) {
        // On failure, assume no tables rather than breaking flow
        setHasTables(false);
      } finally {
        setSchemaCheckLoading(false);
      }
    };
    checkSchemas();
  }, [user?.email, setHasTables]);

  // Helper to update loading states safely
  const updateLoadingState = useCallback((key: keyof typeof loadingStates, value: boolean) => {
    if (!isMountedRef.current) return;
    setLoadingStates(prev => ({ ...prev, [key]: value }));
  }, []);

  // Show loading spinner while checking auth or schema status
  if (loading || schemaCheckLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
        <Loader2 className="w-8 h-8 animate-spin text-viz-accent" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Chart generation function
  const generateChart = useCallback(async (queryData: any, query: string, answer: string, sql: string) => {
    if (!isMountedRef.current) return;
    
    updateLoadingState('chart', true);
    
    try {
      let transformedQueryData = queryData;
      // Check if queryData is a nested array and flatten it
      if (Array.isArray(transformedQueryData) && transformedQueryData.length > 0 && Array.isArray(transformedQueryData[0])) {
        transformedQueryData = transformedQueryData[0];
      }

      // Insert the chat session
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user?.id,
          prompt: query,
          answer: answer,
          sql_query: sql,
          metadata: {
            timestamp: new Date().toISOString(),
            data: transformedQueryData,
            user_query: query
          }
        }])
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      if (!isMountedRef.current) return;

      // Generate chart
      const { data: chartResult, error: chartError } = await supabase.functions.invoke('generate-chart', {
        body: { sessionId: sessionData.id }
      });

      if (chartError) {
        throw new Error(chartError.message || 'Failed to generate chart');
      }

      if (!isMountedRef.current) return;

      if (chartResult && chartResult.chart_code) {
        console.log('Chart script received successfully.');
        setChartHtml(chartResult.chart_code);
        setChartData(null);
        setActiveTab('chart');
      } else {
        console.warn('Chart generation successful but no script returned.', chartResult);
        setChartHtml(null);
        setChartData(null);
      }

    } catch (error) {
      console.error('Error during chart generation:', error);
      if (isMountedRef.current) {
        try {
          const payload = await mapErrorToToast(error);
          // Add small hint for chart context
          if (payload.title === 'Request failed') {
            payload.description = payload.description + ' Tip: open the SQL tab to validate the query, or try a narrower time range.';
          }
          toast(payload);
          if ((error as any)?.context?.response?.status === 429 || payload.title === 'Daily limit reached') {
            setLimitOpen(true);
          }
        } catch (e) {
          console.error('Error mapping toast:', e);
          toast({ title: 'Chart generation failed', description: 'There was a problem generating the chart. Please try again.', variant: 'destructive' });
        }
      }
    } finally {
      updateLoadingState('chart', false);
    }
  }, [user?.id, toast, updateLoadingState]);

  // Handle user query submission
  const handleQuerySubmit = async (query: string) => {
    updateLoadingState('query', true);
    
    try {
      console.log('=== Processing query ===');
      console.log('Query:', query);

      // Call inference via Supabase Edge Function with retry
      const inferenceCall = async () => {
        const { data, error } = await supabase.functions.invoke('inference', {
          body: { prompt: query, email: user?.email || '' }
        });
        return { data, error };
      };

      const { data: inferenceResult, error: inferenceError } = await retryFetch(inferenceCall);

      if (inferenceError) {
        const status = (inferenceError as any)?.context?.response?.status;
        if (status === 429) {
          toast({
            title: "Daily limit reached",
            description: "🚫 You have reached your 5-message limit.",
            variant: "destructive",
          });
          updateLoadingState('query', false);
          updateLoadingState('chart', false);
          setLimitOpen(true);
          return;
        }
        throw new Error(inferenceError.message || 'Failed to process query');
      }

      if (!inferenceResult || !inferenceResult.success) {
        console.error('Inference unsuccessful:', inferenceResult);
        throw new Error(inferenceResult?.error || 'Failed to process query');
      }

      if (!isMountedRef.current) return;

      // Update UI with inference results
      setQueryResult(inferenceResult.data.answer);
      setSqlQuery(inferenceResult.data.sql);
      updateLoadingState('query', false);
      
      // Generate chart if query data exists
      if (inferenceResult.data.queryData) {
        console.log('queryData is present. Attempting chart generation...');
        generateChart(
          inferenceResult.data.queryData,
          query,
          inferenceResult.data.answer,
          inferenceResult.data.sql
        );
      }

      console.log('=== Query processed successfully ===');
    } catch (error) {
      console.error('Error processing query:', error);
      if (isMountedRef.current) {
        try {
          const payload = await mapErrorToToast(error);
          toast(payload);
          if ((error as any)?.context?.response?.status === 429 || payload.title === 'Daily limit reached') {
            setLimitOpen(true);
          }
        } catch (e) {
          console.error('Error mapping toast:', e);
          toast({ title: 'Query failed', description: 'There was a problem processing your query. Please try again.', variant: 'destructive' });
        }
        updateLoadingState('query', false);
        updateLoadingState('chart', false);
      }
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'answer' | 'sql' | 'chart') => {
    if (loadingStates.query) {
      // Don't allow tab changes during initial query loading
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 md:py-8">
        {hasTables ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-1 flex flex-col">
              <div className="bg-white dark:bg-viz-medium backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 dark:border-viz-light/20 p-5 animate-fade-in">
                <ChatInterface 
                  onQuerySubmit={handleQuerySubmit} 
                  isLoading={loadingStates.query}
                />
              </div>
            </div>
            <div className="lg:col-span-2 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
              <ResultsArea 
                answer={queryResult || ''}
                sql={sqlQuery || ''}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isLoading={loadingStates.query}
                isChartLoading={loadingStates.chart}
                chartData={chartData as any}
                chartHtml={chartHtml}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-[60vh]">
            <div className="text-center space-y-4 bg-white dark:bg-viz-medium border rounded-xl p-8 max-w-md">
              <div className="text-lg font-semibold">No tables found</div>
              <p className="text-sm text-viz-text-secondary">Please add data first from the Data Control page to start chatting with your data.</p>
              <button
                onClick={() => navigate('/data-control')}
                className="viz-button-primary"
              >
                Go to Data Control
              </button>
            </div>
          </div>
        )}
      </main>
      {/* Rate limit modal with calendar */}
      <RateLimitModal 
        isOpen={limitOpen} 
        onClose={() => setLimitOpen(false)} 
      />
      <footer className="bg-viz-dark text-white text-center py-3 text-sm">
        <p className="text-viz-text-secondary"> 2025 Viz • Powered by Advanced Business Intelligence AI</p>
      </footer>
    </div>
  );
};

export default Index;