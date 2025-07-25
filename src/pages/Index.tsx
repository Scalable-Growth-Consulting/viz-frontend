import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';
import ErrorBoundary from '../components/ErrorBoundary';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { QueryResponse, ChartData } from '../types/data';

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
    setIsQueryLoading(true);
    setChartData(null); // Reset chart data on new query
    
    try {
      console.log('=== Processing query ===');
      console.log('Query:', query);

      // Call inference via Supabase Edge Function with retry logic
      const { data: inferenceResult, error: inferenceError } = await retryFetch(async () => {
        const result = await supabase.functions.invoke('inference', {
          body: { prompt: query, email: user?.email || '' }
        });
        return { data: result.data, error: result.error };
      }, 3, 2000);

      if (inferenceError) {
        console.error('Inference error:', inferenceError);
        throw new Error(inferenceError.message || 'Failed to process query');
      }

      if (!inferenceResult || !inferenceResult.success) {
        console.error('Inference unsuccessful:', inferenceResult);
        throw new Error(inferenceResult?.error || 'Query processing failed. Please try rephrasing your question.');
      }

      // Immediately update UI with inference results and SQL
      setQueryResult(inferenceResult.data.answer);
      setSqlQuery(inferenceResult.data.sql);
      setIsQueryLoading(false); // Stop the main loading state
      
      // If we have query data, start chart generation in parallel
      if (inferenceResult.data.queryData) {
        console.log('queryData is present. Attempting chart generation...');
        let transformedQueryData = inferenceResult.data.queryData;
        // Check if queryData is a nested array like [[value]] and flatten it
        if (Array.isArray(transformedQueryData) && transformedQueryData.length > 0 && Array.isArray(transformedQueryData[0])) {
          transformedQueryData = transformedQueryData[0]; // Take the inner array
        }

        setIsChartLoading(true); // Only set chart loading state
        (async () => {
          try {
            console.log('Starting chart generation process...');
            
            // Insert the chat session and get the sessionId with retry logic
            const { data: sessionData, error: sessionError } = await retryFetch(async () => {
              const result = await supabase
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
              return { data: result.data, error: result.error };
            }, 3, 1000);

            if (sessionError) {
              console.error('Session creation error:', sessionError);
              throw new Error('Failed to create session for chart generation');
            }

            console.log('Session created, generating chart...');

            // Now call generate-chart with the sessionId and retry logic
            const { data: chartResult, error: chartError } = await retryFetch(async () => {
              const result = await supabase.functions.invoke('generate-chart', {
                body: { sessionId: sessionData.id }
              });
              return { data: result.data, error: result.error };
            }, 2, 3000); // Fewer retries for chart generation, longer delay

            if (chartError) {
              console.error('Chart generation error:', chartError);
              throw new Error(chartError.message || 'Chart generation service is currently unavailable');
            }

            if (chartResult && chartResult.success && chartResult.chart_code) {
              console.log('Chart script received successfully.');
              setChartData({ chartScript: chartResult.chart_code });
              setActiveTab('charts'); // Automatically switch to charts tab
              toast({
                title: "Chart generated!",
                description: "Your data visualization is ready.",
              });
            } else {
              console.warn('Chart generation completed but no valid script returned:', chartResult);
              setChartData({ chartScript: null });
              toast({
                title: "Chart unavailable",
                description: "Unable to create a chart for this data type.",
                variant: "destructive",
              });
            }

          } catch (chartError) {
            console.error('Error during chart generation:', chartError);
            setChartData({ chartScript: null });
            
            // More specific error messages
            let errorMessage = "There was a problem generating the chart.";
            if (chartError.message.includes('timeout')) {
              errorMessage = "Chart generation timed out. The service may be busy.";
            } else if (chartError.message.includes('unavailable')) {
              errorMessage = chartError.message;
            }
            
            toast({
              title: "Chart generation failed",
              description: errorMessage + " You can still view the answer and SQL results.",
              variant: "destructive",
            });
          } finally {
            setIsChartLoading(false);
          }
        })();
      } else {
        setIsChartLoading(false); // Ensure loader is off if no chart data
      }

      console.log('=== Query processed successfully ===');
    } catch (error) {
      console.error('Error processing query:', error);
      
      // More specific error messages
      let errorTitle = "Query failed";
      let errorDescription = "Please try again.";
      
      if (error.message.includes('timeout')) {
        errorTitle = "Request timed out";
        errorDescription = "The query is taking longer than expected. Please try with a simpler question.";
      } else if (error.message.includes('network') || error.message.includes('Failed to send')) {
        errorTitle = "Connection error";
        errorDescription = "Please check your internet connection and try again.";
      } else if (error.message.includes('rephrasing')) {
        errorTitle = "Query processing failed";
        errorDescription = error.message;
      } else {
        errorDescription = error.message || "There was a problem processing your query. Please try again.";
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
      
      // Reset states
      setQueryResult(null);
      setSqlQuery(null);
      setChartData(null);
      setIsQueryLoading(false);
      setIsChartLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (tab: 'answer' | 'sql' | 'charts') => {
    if (isQueryLoading) {
      // Don't allow tab changes during initial query loading
      return;
    }
    setActiveTab(tab);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
        <Header />
        <main className="flex-1 container max-w-6xl mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
            <div className="lg:col-span-1 flex flex-col">
              <div className="bg-white dark:bg-viz-medium backdrop-blur-sm rounded-2xl shadow-lg border border-slate-100 dark:border-viz-light/20 p-5 animate-fade-in">
                <ChatInterface 
                  onQuerySubmit={handleQuerySubmit} 
                  isLoading={isQueryLoading}
                />
              </div>
            </div>
            <div className="lg:col-span-2 h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)]">
              <ErrorBoundary fallback={
                <div className="flex items-center justify-center h-full bg-white dark:bg-viz-medium rounded-2xl border">
                  <p className="text-gray-500">Error loading results area. Please refresh.</p>
                </div>
              }>
                <ResultsArea 
                  queryResult={activeTab === 'sql' ? sqlQuery : queryResult} 
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                  isLoading={isQueryLoading}
                  isChartLoading={isChartLoading}
                  chartData={chartData}
                />
              </ErrorBoundary>
            </div>
          </div>
        </main>
        <footer className="bg-viz-dark text-white text-center py-3 text-sm">
          <p className="text-viz-text-secondary">© 2025 Viz • Powered by Advanced Business Intelligence AI</p>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default Index;
