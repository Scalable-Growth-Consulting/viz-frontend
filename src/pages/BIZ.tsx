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
  const [queryData, setQueryData] = useState<any>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [chartHtml, setChartHtml] = useState<string | null>(null);
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
    setQueryData(null);
    setChartData(null);
    setChartHtml(null);
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

      // Adapt to possible shapes:
      // - { success, data: {...} }
      // - {...}
      // - stringified JSON of either of the above
      let payload: any = data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }
      let res: any = payload?.data ?? payload;
      if (typeof res === 'string') {
        try { res = JSON.parse(res); } catch {}
      }

      // Update state with response
      setQueryResult(res?.answer || 'No answer provided.');
      setQuerySQL(res?.sql || '');
      // Map data from various keys: data, queryData, rows
      const mappedData = ((): any => {
        if (!res) return null;
        if (res.data !== undefined) return res.data;
        if (res.queryData !== undefined) return res.queryData;
        if (res.rows !== undefined) return res.rows;
        return null;
      })();
      setQueryData(mappedData);
      setUserQuery(query);
      
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
      setChartHtml(null);
      return;
    }

    // Convert API response to chart.js format
    try {
      // Helper: sanitize potential markdown code fences and quotes
      const sanitizeChartCode = (input: string): string => {
        if (!input) return input as any;
        let s = String(input).trim();
        // Strip wrapping quotes repeatedly
        while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith('\'') && s.endsWith('\''))) {
          s = s.slice(1, -1).trim();
        }
        // Remove any markdown code fences (with optional language), both multiline and inline
        // Examples handled: ```html\n...\n```  |  ```\n...\n```  |  ```html ... ``` (single line)
        s = s.replace(/^```[a-zA-Z0-9_-]*\s*\n?/g, '')
             .replace(/\n?```\s*$/g, '')
             .replace(/```[a-zA-Z0-9_-]*\s*/g, '')
             .replace(/```/g, '');
        // Final trim
        s = s.trim();
        return s;
      };

      // If string with HTML/script, store as chartHtml for iframe rendering
      if (typeof data === 'string' && /<script[\s\S]*?>[\s\S]*<\/script>/i.test(data)) {
        setChartHtml(sanitizeChartCode(data));
        return;
      }
      // If object contains html field
      if (data?.html && typeof data.html === 'string') {
        setChartHtml(sanitizeChartCode(data.html));
        return;
      }
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
      setChartHtml(null);
    } catch (error) {
      console.error('Error formatting chart data:', error);
      setChartData(null);
      setChartHtml(null);
    }
  };

  // Generate chart on demand when user navigates to Chart tab
  const generateChart = useCallback(async () => {
    if (!querySQL || !queryResult) {
      console.warn('[BIZ] Missing core fields for chart generation', {
        hasSql: !!querySQL,
        hasInference: !!queryResult,
      });
      return;
    }
    setIsChartLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await fetchWithRetry(
        () => supabase.auth.getSession()
      );
      if (sessionError) throw sessionError;
      if (!sessionData?.session) throw new Error('No active session');

      // Prepare payload with required keys expected by BI Agent
      // Normalize data shape if it's an array of [label, value] tuples
      // For maximum compatibility, send RAW array in `data` and structured also in `data_struct`.
      let dataForAgent: any = queryData ?? {};
      let dataStruct: any = undefined;
      if (Array.isArray(queryData) && queryData.length > 0 && Array.isArray(queryData[0])) {
        try {
          const rows = (queryData as any[]).map((r) => ({ label: String(r[0]), value: r[1] }));
          const columns = ['label', 'value'];
          dataStruct = { columns, rows };
          dataForAgent = queryData; // raw tuple array in `data`
        } catch {
          // keep original
        }
      }
      const payload = {
        sql: (querySQL || '').toString(),
        inference: (queryResult || '').toString(),
        data: dataForAgent,
        data_struct: dataStruct,
        user_query: (userQuery || '').toString(),
        User_query: (userQuery || '').toString(),
      };
      console.debug('[BIZ] generate-chart payload', {
        hasSql: !!payload.sql,
        hasInference: !!payload.inference,
        hasData: payload.data ? true : false,
        user_query_len: payload.user_query.length,
        userQueryPascal_len: payload.User_query.length,
        dataType: typeof payload.data,
      });

      const { data, error: apiError } = await fetchWithRetry(
        () => supabase.functions.invoke('generate-chart', { body: payload })
      );
      if (apiError) throw apiError;

      // Handle possible response shapes: { success, chart_code }, raw HTML string, { html }, or JSON chart spec
      let resp: any = data;
      if (typeof resp === 'string') {
        // If JSON string, try to parse; else treat as HTML
        try {
          const maybe = JSON.parse(resp);
          resp = maybe;
        } catch {
          // likely HTML snippet
          handleChartUpdate(resp);
          return;
        }
      }
      // If Edge Function returns { success: true, chart_code: "<script>...</script>" }
      if (resp && typeof resp === 'object' && typeof resp.chart_code === 'string') {
        handleChartUpdate(resp.chart_code);
        return;
      }
      if (resp?.html || (typeof resp === 'string')) {
        handleChartUpdate(resp?.html || resp);
        return;
      }
      handleChartUpdate((resp as any)?.chartData || resp);
    } catch (error: any) {
      // Fallback: if we have a simple tuple array in queryData, render it locally
      try {
        if (Array.isArray(queryData) && queryData.length > 0) {
          const labels: string[] = [];
          const values: number[] = [];
          for (const row of queryData) {
            if (Array.isArray(row) && row.length >= 2) {
              labels.push(String(row[0]));
              const num = typeof row[1] === 'number' ? row[1] : Number(row[1]);
              values.push(Number.isFinite(num) ? num : 0);
            }
          }
          if (labels.length && values.length) {
            handleChartUpdate({
              labels,
              datasets: [
                {
                  label: 'Values',
                  data: values,
                  backgroundColor: 'rgba(99, 102, 241, 0.5)',
                  borderColor: 'rgba(99, 102, 241, 1)',
                  borderWidth: 1,
                },
              ],
            });
            toast({
              title: 'Rendered local chart',
              description: 'Used returned data to render chart while the server request failed.',
            });
            return;
          }
        }
      } catch (fallbackErr) {
        console.warn('Local chart fallback failed:', fallbackErr);
      }
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
  }, [querySQL, queryResult, queryData, userQuery, toast]);

  // Tab change handler to trigger chart lazily
  const handleTabChange = useCallback((tab: 'answer' | 'sql' | 'chart') => {
    setActiveTab(tab);
    if (tab === 'chart' && querySQL && !chartData && !chartHtml) {
      generateChart();
    }
  }, [generateChart, querySQL, chartData, chartHtml]);

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
            chartHtml={chartHtml}
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
