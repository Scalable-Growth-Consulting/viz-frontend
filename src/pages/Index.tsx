import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
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
    
    try {
      console.log('=== Processing query ===');
      console.log('Query:', query);

      // Call inference via Supabase Edge Function
      const { data: inferenceResult, error: inferenceError } = await supabase.functions.invoke('inference', {
        body: { prompt: query, email: user?.email || '' }
      });

      if (inferenceError) {
        throw new Error(inferenceError.message || 'Failed to process query');
      }

      if (!inferenceResult || !inferenceResult.success) {
        console.error('Inference unsuccessful:', inferenceResult);
        throw new Error(inferenceResult?.error || 'Failed to process query');
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
            // Insert the chat session and get the sessionId
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

            // Now call generate-chart with the sessionId
            const { data: chartResult, error: chartError } = await supabase.functions.invoke('generate-chart', {
              body: { sessionId: sessionData.id }
            });

            if (chartError) {
              throw new Error(chartError.message || 'Failed to generate chart');
            }

            if (chartResult && chartResult.chart_code) {
              console.log('Chart script received successfully.');
              setChartData({ chartScript: chartResult.chart_code });
              setActiveTab('charts'); // Automatically switch to charts tab
            } else {
              console.warn('Chart generation successful but no script returned.', chartResult);
              setChartData({ chartScript: null });
            }

          } catch (chartError) {
            console.error('Error during chart generation:', chartError);
            toast({
              title: "Chart generation failed",
              description: "There was a problem generating the chart. Please try again.",
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
      toast({
        title: "Query failed",
        description: "There was a problem processing your query. Please try again.",
        variant: "destructive",
      });
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
