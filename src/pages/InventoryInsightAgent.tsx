import React, { useState, useCallback, useEffect } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { Loader2, Wifi, WifiOff } from 'lucide-react';
import { supabase, fetchWithRetry } from '@/lib/supabase';
import { mapErrorToToast } from '@/lib/errorMessages';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import ResultsArea from '@/components/ResultsArea';
import { Link } from 'react-router-dom';
import { useSchema } from '@/contexts/SchemaContext';

interface Props { showHeader?: boolean }

const InventoryInsightAgent: React.FC<Props> = ({ showHeader = true }) => {
  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();
  const { hasTables, setHasTables } = useSchema();
  const [limitOpen, setLimitOpen] = useState(false);

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

  // Sample quick queries for the chat interface (inventory-focused)
  const quickQueries = [
    'Which SKUs are at risk of stockout this week?',
    'Show top 10 slow-moving items by location',
    'Inventory turns by category for the last 12 months',
    'Suggest reorder quantities for items below ROP',
  ];

  // Test API connection with retry logic
  const testApiConnection = useCallback(async () => {
    setApiStatus('checking');

    const { data, error } = await fetchWithRetry(
      () => supabase.functions.invoke('health-check'),
      { retries: 2, delay: 1000 }
    );

    if (error || data?.status !== 'ok') {
      // Fallback: try direct fetch
      try {
        const base = (import.meta as any).env?.VITE_SUPABASE_URL as string | undefined;
        const anon = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY as string | undefined;
        if (base) {
          const resp = await fetch(`${base}/functions/v1/health-check`, {
            method: 'GET',
            headers: anon ? { apikey: anon } : undefined,
            cache: 'no-store'
          });
          const json = await resp.json().catch(() => ({}));
          if (resp.ok && json?.status === 'ok') {
            setApiStatus('online');
            return;
          }
        }
      } catch {
        // ignore
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

    if (!hasTables) {
      toast({
        title: 'No Data Source Connected',
        description: 'Please add a data source before making a query.',
        action: (
          <Link to="/data-control">
            <ToastAction altText="Add Data">Add Data</ToastAction>
          </Link>
        ),
      });
      return;
    }

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

      // Normalize response shape
      let payload: any = data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch {}
      }
      let res: any = payload?.data ?? payload;
      if (typeof res === 'string') {
        try { res = JSON.parse(res); } catch {}
      }

      setQueryResult(res?.answer || 'No answer provided.');
      setQuerySQL(res?.sql || '');
      // Map possible data keys
      const mappedData = ((): any => {
        if (!res) return null;
        if (res.data !== undefined) return res.data;
        if (res.queryData !== undefined) return res.queryData;
        if (res.rows !== undefined) return res.rows;
        return null;
      })();
      setQueryData(mappedData);
      setUserQuery(query);
    } catch (error: any) {
      try {
        const payload = await mapErrorToToast(error);
        toast(payload);
        if ((error as any)?.context?.response?.status === 429 || payload.title === 'Daily limit reached') {
          setLimitOpen(true);
        }
      } catch (e) {
        console.error('Error mapping toast:', e);
        toast({ title: 'Query failed', description: 'An unexpected error occurred.', variant: 'destructive' });
      }
      console.error('Error processing query:', error);
    } finally {
      setIsLoading(false);
    }
  }, [toast, hasTables]);

  // Handle chart data updates
  const handleChartUpdate = (data: any) => {
    if (!data) {
      setChartData(null);
      setChartHtml(null);
      return;
    }

    try {
      const sanitizeChartCode = (input: string): string => {
        if (!input) return input as any;
        let s = String(input).trim();
        while ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith('\'') && s.endsWith('\''))) {
          s = s.slice(1, -1).trim();
        }
        s = s.replace(/^```[a-zA-Z0-9_-]*\s*\n?/g, '')
             .replace(/\n?```\s*$/g, '')
             .replace(/```[a-zA-Z0-9_-]*\s*/g, '')
             .replace(/```/g, '');
        s = s.trim();
        return s;
      };

      if (typeof data === 'string' && /<script[\s\S]*?>[\s\S]*<\/script>/i.test(data)) {
        setChartHtml(sanitizeChartCode(data));
        return;
      }
      if (data?.html && typeof data.html === 'string') {
        setChartHtml(sanitizeChartCode(data.html));
        return;
      }
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

  // Generate chart on-demand
  const generateChart = useCallback(async () => {
    if (!querySQL || !queryResult) return;
    setIsChartLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await fetchWithRetry(
        () => supabase.auth.getSession()
      );
      if (sessionError) throw sessionError;
      if (!sessionData?.session) throw new Error('No active session');

      let dataForAgent: any = queryData ?? {};
      let dataStruct: any = undefined;
      if (Array.isArray(queryData) && queryData.length > 0 && Array.isArray(queryData[0])) {
        try {
          const rows = (queryData as any[]).map((r) => ({ label: String(r[0]), value: r[1] }));
          const columns = ['label', 'value'];
          dataStruct = { columns, rows };
          dataForAgent = queryData;
        } catch {}
      }

      const payload = {
        sql: (querySQL || '').toString(),
        inference: (queryResult || '').toString(),
        data: dataForAgent,
        data_struct: dataStruct,
        user_query: (userQuery || '').toString(),
        User_query: (userQuery || '').toString(),
      };

      const { data, error: apiError } = await fetchWithRetry(
        () => supabase.functions.invoke('generate-chart', { body: payload })
      );
      if (apiError) throw apiError;

      let resp: any = data;
      if (typeof resp === 'string') {
        try {
          const maybe = JSON.parse(resp);
          resp = maybe;
        } catch {
          handleChartUpdate(resp);
          return;
        }
      }
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
            handleChartUpdate({ labels, datasets: [{ label: 'Values', data: values, backgroundColor: 'rgba(99, 102, 241, 0.5)', borderColor: 'rgba(99, 102, 241, 1)', borderWidth: 1 }] });
            toast({ title: 'Rendered local chart', description: 'Used returned data to render chart while the server request failed.' });
            return;
          }
        }
      } catch {}
      try {
        const payload = await mapErrorToToast(error);
        if (payload.title === 'Request failed') {
          payload.description = payload.description + ' Tip: open the SQL tab to validate the query, or try a narrower time range.';
        }
        toast(payload);
        if ((error as any)?.context?.response?.status === 429 || payload.title === 'Daily limit reached') {
          setLimitOpen(true);
        }
      } catch (e) {
        console.error('Error mapping toast:', e);
        toast({ title: 'Chart generation failed', description: 'Could not generate chart. Please try again.', variant: 'destructive' });
      }
      console.error('Error generating chart:', error);
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
      if (!user?.email) {
        setHasTables(false);
        return;
      }
      try {
        const response = await fetch('https://viz-fetch-schema-286070583332.us-central1.run.app', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
        if (!response.ok) {
          setHasTables(false);
          return;
        }
        const schemaData = await response.json();
        const tables = Array.isArray(schemaData?.tables) ? schemaData.tables : [];
        setHasTables(tables.length > 0);
      } catch (error) {
        console.error('Error checking data access:', error);
        setHasTables(false);
      }
    };
    checkDataAccess();
  }, [user?.email, setHasTables]);

  // Initialize component - test API regardless of auth
  useEffect(() => {
    const initialize = async () => {
      await testApiConnection();
    };
    initialize();
  }, [testApiConnection]);

  // Warn if Supabase URL is misconfigured
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
  }, [toast, hasTables, setHasTables]);

  return (
    <div className="min-h-screen flex flex-col">
      {showHeader && (
        <>
          <Header />
          {/* Status bar: right-aligned API status */}
          <div className="px-4 py-2 flex justify-end items-center">
            {apiStatus === 'checking' && (
              <div className="flex items-center text-yellow-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Checking API...</span>
              </div>
            )}
            {apiStatus === 'online' && (
              <div className="flex items-center text-green-500">
                <Wifi className="w-4 h-4 mr-2" />
                <span>API Online</span>
              </div>
            )}
            {(apiStatus === 'offline' || apiStatus === 'error') && (
              <div className="flex items-center text-red-500">
                <WifiOff className="w-4 h-4 mr-2" />
                <span>API Offline</span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Main content - Simple two-panel layout */}
      <main className="h-[calc(100vh-6.5rem)] flex overflow-hidden min-h-0">
        {/* Left panel - Chat interface (input only) */}
        <div className="w-1/2 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-auto min-h-0">
          <div className="p-4">
            <ChatInterface onQuerySubmit={handleAsk} quickQueries={quickQueries} isLoading={isLoading} />
          </div>
        </div>

        {/* Right panel - Results */}
        <div className="w-1/2 h-full bg-white dark:bg-gray-900 overflow-auto min-h-0">
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
            className="h-full min-h-0"
          />
        </div>
      </main>

      {/* Rate limit dialog */}
      <Dialog open={limitOpen} onOpenChange={setLimitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daily limit reached</DialogTitle>
            <DialogDescription>
              You have reached today's 5-message limit. To continue with higher limits or a custom implementation, contact our team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="secondary" onClick={() => setLimitOpen(false)}>OK</Button>
            <a href="mailto:viz-sales@sgconsultingtech.com?subject=VIZ%20Pricing%20and%20Custom%20Implementation" target="_blank" rel="noopener noreferrer">
              <Button className="ml-2">Contact Sales</Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InventoryInsightAgent;
