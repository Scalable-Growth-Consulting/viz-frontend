import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Loader2, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { supabase, fetchWithRetry } from '../lib/supabase';
import Header from '../components/Header';
import ChatInterface from '../components/ChatInterface';
import ResultsArea from '../components/ResultsArea';

// (no local API config; using fetchWithRetry)

const BIZ: React.FC = () => {
  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();

  // State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isChartLoading, setIsChartLoading] = useState<boolean>(false);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [queryResult, setQueryResult] = useState<string>('');
  const [querySQL, setQuerySQL] = useState<string>('');
  const [chartData, setChartData] = useState<{
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor?: string;
      borderWidth?: number;
    }>;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'answer' | 'sql' | 'chart'>('answer');
  const [hasData, setHasData] = useState<boolean>(false);

  // Refs (removed - not needed)

  // Sample FAQs for the chat interface
  const faqs = [
    'Show me sales by product category',
    'What are our top performing products?',
    'Generate a revenue trend for the last 6 months'
  ];

  // Test API connection with retry logic
  const testApiConnection = useCallback(async () => {
    setApiStatus('checking');
    
    const { data, error } = await fetchWithRetry(
      () => supabase.functions.invoke('health-check'),
      { retries: 2, delay: 1000 }
    );

    if (error || data?.status !== 'ok') {
      console.error('API connection test failed (invoke path):', {
        error,
        data,
        viteSupabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL,
        origin: window.location.origin,
      });

      // Fallback: try direct fetch to narrow down issue
      try {
        const base = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
        const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
        if (base) {
          const resp = await fetch(`${base}/functions/v1/health-check`, {
            method: 'GET',
            // only send minimal headers that won't trigger blocked preflight
            headers: anon ? { apikey: anon } : undefined,
            cache: 'no-store'
          });
          const json = await resp.json().catch(() => ({}));
          console.log('Direct health-check response:', resp.status, json);
          if (resp.ok && json?.status === 'ok') {
            setApiStatus('online');
            return;
          }
        }
      } catch (e) {
        console.warn('Direct health-check fetch failed:', e);
      }

      setApiStatus('offline');
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to the API. Please check your environment URL and try again.',
        variant: 'destructive',
      });
      return;
    }
    
    setApiStatus('online');
  }, [toast]);

  // Handle ask button click
  const handleAsk = useCallback(async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setQueryResult('');
    setQuerySQL('');
    setChartData(null);
    setActiveTab('answer');

    try {
      // Get current session with retry logic
      const { data: sessionData, error: sessionError } = await fetchWithRetry(
        () => supabase.auth.getSession()
      );

      if (sessionError) throw sessionError;
      if (!sessionData?.session) {
        throw new Error('No active session');
      }

      // Call the inference API
      const { data, error: apiError } = await fetchWithRetry(
        () => supabase.functions.invoke('inference', {
          body: {
            prompt: query,
            email: sessionData.session?.user?.email || ''
          }
        })
      );

      if (apiError) throw apiError;

      // Adapt to { success, data: { answer, sql, data } }
      const payload: any = data;
      const res = payload?.data ?? payload;

      // Update state with response
      setQueryResult(res?.answer || 'No answer provided.');
      setQuerySQL(res?.sql || '');
      
      setHasData(true);
    } catch (error: any) {
      // Surface function error details if present
      let errDetails: string | undefined;
      try {
        const resp = error?.context?.response as Response | undefined;
        if (resp) {
          const ct = resp.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await resp.clone().json();
            errDetails = JSON.stringify(j);
          } else {
            errDetails = await resp.clone().text();
          }
        }
      } catch {}
      const errMsg = error?.message || errDetails || 'Unknown error';
      console.error('Error processing query:', errMsg, error);
      toast({
        title: 'Query failed',
        description: typeof errMsg === 'string' ? errMsg : 'The server returned an error.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Handle chart data updates
  const handleChartUpdate = (data: any) => {
    if (!data) {
      setChartData(null);
      return;
    }

    // Convert API response to chart.js format
    try {
      // Example conversion - adjust based on your actual API response
      const chartData = {
        labels: data.labels || [],
        datasets: [{
          label: data.datasetLabel || 'Data',
          data: data.values || [],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      };
      setChartData(chartData);
    } catch (error) {
      console.error('Error formatting chart data:', error);
      setChartData(null);
    }
  };

  // Generate chart on demand when user navigates to Chart tab
  const generateChart = useCallback(async () => {
    if (!querySQL) return;
    setIsChartLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await fetchWithRetry(
        () => supabase.auth.getSession()
      );
      if (sessionError) throw sessionError;
      if (!sessionData?.session) throw new Error('No active session');

      const { data, error: apiError } = await fetchWithRetry(
        () => supabase.functions.invoke('generate-chart', {
          body: {
            sql: querySQL,
            inference: queryResult,
          }
        })
      );
      if (apiError) throw apiError;

      handleChartUpdate((data as any)?.chartData || (data as any));
    } catch (error: any) {
      let errDetails: string | undefined;
      try {
        const resp = error?.context?.response as Response | undefined;
        if (resp) {
          const ct = resp.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const j = await resp.clone().json();
            errDetails = JSON.stringify(j);
          } else {
            errDetails = await resp.clone().text();
          }
        }
      } catch {}
      console.error('Error generating chart:', error?.message || errDetails || error);
      toast({
        title: 'Chart generation failed',
        description: error?.message || errDetails || 'Could not generate chart. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsChartLoading(false);
    }
  }, [querySQL, queryResult, toast]);

  // Tab change handler to trigger chart lazily
  const handleTabChange = useCallback((tab: 'answer' | 'sql' | 'chart') => {
    setActiveTab(tab);
    if (tab === 'chart' && querySQL && !chartData) {
      generateChart();
    }
  }, [generateChart, querySQL, chartData]);

  // Check data access when user changes
  useEffect(() => {
    const checkDataAccess = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setHasData(!!data);
      } catch (error) {
        console.error('Error checking data access:', error);
        setHasData(false);
      }
    };
    if (user) {
      checkDataAccess();
    }
  }, [user, setHasData]);

  // Render API status indicator
  const renderApiStatus = useCallback(() => {
    switch (apiStatus) {
      case 'checking':
        return (
          <div className="flex items-center text-yellow-500">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Checking API...</span>
          </div>
        );
      case 'online':
        return (
          <div className="flex items-center text-green-500">
            <Wifi className="w-4 h-4 mr-2" />
            <span>API Online</span>
          </div>
        );
      case 'offline':
      case 'error':
        return (
          <div className="flex items-center text-red-500">
            <WifiOff className="w-4 h-4 mr-2" />
            <span>API Offline</span>
          </div>
        );
      default:
        return null;
    }
  }, [apiStatus]);

  // Initialize component - test API regardless of auth
  useEffect(() => {
    const initialize = async () => {
      await testApiConnection();
    };
    initialize();
  }, [testApiConnection]);

  // Warn if Supabase URL is misconfigured (common CORS cause)
  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
    if (url && url.includes('supabase.com/dashboard')) {
      console.error('Invalid VITE_SUPABASE_URL points to dashboard. Use your project URL like https://xxxx.supabase.co');
      toast({
        title: 'Supabase URL misconfigured',
        description: 'Update VITE_SUPABASE_URL to your project URL (https://xxxx.supabase.co).',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Render the component
  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900">
      {/* Main Navbar */}
      <Header />
      {/* API status bar under navbar */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-end">
        <div className="flex items-center space-x-2">
          {renderApiStatus()}
          {apiStatus === 'offline' && (
            <button
              onClick={testApiConnection}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Retry connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main content - Simple two-panel layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left panel - Chat interface (input only) */}
        <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-auto">
          <div className="p-4">
            <ChatInterface onQuerySubmit={handleAsk} quickQueries={faqs} isLoading={isLoading} />
          </div>
        </div>

        {/* Right panel - Results */}
        <div className="w-1/2 h-full bg-white dark:bg-gray-900 overflow-auto">
          <ResultsArea
            activeTab={activeTab}
            onTabChange={handleTabChange}
            answer={queryResult}
            sql={querySQL}
            chartData={chartData}
            isLoading={isLoading}
            isChartLoading={isChartLoading}
            onChartUpdate={handleChartUpdate}
            className="h-full"
          />
        </div>
      </main>
    </div>
  );
};

// ...

export default BIZ;
