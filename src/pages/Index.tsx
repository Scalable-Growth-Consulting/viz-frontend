import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import type { InferenceFunctionResponse, GenerateChartFunctionResponse } from '@/types/data';
import { invokeWithRetry } from "@/integrations/supabase/client";
import { showErrorToast } from "@/lib/toastUtils";
import { debounce } from '@/lib/debounce';
import { useRef } from 'react';

type APIResponse<T> = { data: T | null; error: Error | null; };

// Helper function for retrying API calls
const retryFetch = async <T,>(fn: () => Promise<APIResponse<T>>, retries = 3, delay = 1000): Promise<APIResponse<T>> => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await fn();
      if (result.error && result.error.message.includes('Failed to send a request to the Edge Function')) {
        throw result.error; // Treat network errors as retryable
      }
      return result;
    } catch (error) {
      if (i < retries - 1) {
        console.warn(`Attempt ${i + 1} failed. Retrying in ${delay / 1000}s...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error; // Last attempt, re-throw the error
      }
    }
  }
  throw new Error('All retry attempts failed'); // Should not be reached
};

const Index = () => {
  // State for query results
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [sqlQuery, setSqlQuery] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  
  // Loading states
  const [isQueryLoading, setIsQueryLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState<'answer' | 'sql' | 'charts'>('answer');
  
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Show loading spinner while checking auth
  if (loading) {
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

  // Handle user query submission
  const handleQuerySubmit = async (query: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const requestId = Date.now();
    setIsQueryLoading(true);
    console.log(`[${requestId}] handleQuerySubmit started`);
    try {
      if (!query.trim()) {
        showErrorToast("Empty query", "Please enter a question or request");
        setIsQueryLoading(false);
        console.log(`[${requestId}] Empty query, exiting early.`);
        return;
      }
      if (!user) {
        showErrorToast("User not found", "You must be logged in to submit a query.");
        setIsQueryLoading(false);
        console.log(`[${requestId}] User not found, exiting early.`);
        return;
      }
      const timeoutId = setTimeout(() => controller.abort(), 240000); // 4 minutes
      console.log(`[${requestId}] About to call supabase.functions.invoke('inference')`);
      const { data: inferenceResult, error: inferenceError } = await invokeWithRetry<InferenceFunctionResponse>('inference', {
        body: { prompt: query, email: user?.email || '' }
      });
      clearTimeout(timeoutId);
      console.log(`[${requestId}] Supabase inference response:`, { inferenceResult, inferenceError });
      if (inferenceError) {
        throw new Error(inferenceError.message || 'Failed to process query');
      }
      if (!inferenceResult || !inferenceResult.success) {
        console.error(`[${requestId}] Inference unsuccessful:`, inferenceResult);
        throw new Error(inferenceResult?.error || 'Failed to process query');
      }
      setQueryResult(inferenceResult.data.answer);
      setSqlQuery(inferenceResult.data.sql);
      setIsQueryLoading(false);
      if (inferenceResult.data.queryData) {
        console.log(`[${requestId}] queryData is present. Attempting chart generation...`);
        let transformedQueryData = inferenceResult.data.queryData;
        if (Array.isArray(transformedQueryData) && transformedQueryData.length > 0 && Array.isArray(transformedQueryData[0])) {
          transformedQueryData = transformedQueryData[0];
        }
        setIsChartLoading(true);
        (async () => {
          try {
            const { data: sessionData, error: sessionError } = await supabase
              .from('chat_sessions')
              .insert([{
                user_id: user?.id,
                prompt: query,
                answer: inferenceResult.data.answer,
                sql_query: inferenceResult.data.sql,
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
            const chartController = new AbortController();
            const chartTimeoutId = setTimeout(() => chartController.abort(), 240000); // 4 minutes
            console.log(`[${requestId}] About to call supabase.functions.invoke('generate-chart')`);
            const { data: chartResult, error: chartError } = await invokeWithRetry<GenerateChartFunctionResponse>('generate-chart', {
              body: { sessionId: sessionData.id }
            });
            clearTimeout(chartTimeoutId);
            console.log(`[${requestId}] Supabase generate-chart response:`, { chartResult, chartError });
            if (chartError) {
              throw new Error(chartError.message || 'Failed to generate chart');
            }
            if (chartResult && chartResult.chart_code) {
              setChartData({ chartScript: chartResult.chart_code });
              setActiveTab('charts');
            } else {
              setChartData({ chartScript: null });
            }
          } catch (chartError) {
            if (chartError.name === 'AbortError') {
              showErrorToast("Chart generation timeout", "The chart generation request took too long and was aborted. Please try again.");
              console.error(`[${requestId}] Chart generation request timed out (aborted).`, chartError);
            } else {
              showErrorToast("Chart generation failed", chartError.message || "There was a problem generating the chart. Please try again.");
              console.error(`[${requestId}] Error during chart generation:`, chartError);
            }
          } finally {
            setIsChartLoading(false);
            console.log(`[${requestId}] Chart generation finished (finally block).`);
          }
        })();
      } else {
        setIsChartLoading(false);
      }
      console.log(`[${requestId}] handleQuerySubmit finished successfully.`);
    } catch (error) {
      if (error.name === 'AbortError') {
        showErrorToast("Timeout", "The request took too long and was aborted. Please try again.");
        console.error(`[${requestId}] Request timed out (aborted).`, error);
      } else {
        showErrorToast("Query failed", error.message || "There was a problem processing your query. Please try again.");
        console.error(`[${requestId}] Error processing query:`, error);
      }
      setIsQueryLoading(false);
      setIsChartLoading(false);
      console.log(`[${requestId}] handleQuerySubmit finished (finally block).`);
    }
  };

  const debouncedHandleQuerySubmit = debounce(handleQuerySubmit, 400);

  // Handle tab change
  const handleTabChange = (tab: 'answer' | 'sql' | 'charts') => {
    if (isQueryLoading) {
      // Don't allow tab changes during initial query loading
      return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          <div className="lg:col-span-1 flex flex-col">
            <div className="bg-white dark:bg-viz-medium backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 dark:border-viz-light/20 p-5 animate-fade-in">
              <ChatInterface 
                onQuerySubmit={debouncedHandleQuerySubmit} 
                isLoading={isQueryLoading}
              />
            </div>
          </div>
          <div className="lg:col-span-2 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
            <ResultsArea 
              queryResult={activeTab === 'sql' ? sqlQuery : queryResult} 
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isLoading={isQueryLoading}
              isChartLoading={isChartLoading}
              chartData={chartData}
            />
          </div>
        </div>
      </main>
      <footer className="bg-viz-dark text-white text-center py-3 text-sm">
        <p className="text-viz-text-secondary">© 2025 Viz • Powered by Advanced Business Intelligence AI</p>
      </footer>
    </div>
  );
};

export default Index;
