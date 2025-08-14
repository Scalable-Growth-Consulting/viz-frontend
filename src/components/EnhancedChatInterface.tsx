import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SendIcon, DatabaseIcon, BarChartIcon, FileTextIcon, Loader2 } from 'lucide-react';
import { format } from 'sql-formatter';
import { Json } from '@/integrations/supabase/types';
import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  PieController,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PointElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  BarElement,
  LineElement,
  PieController,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  PointElement
);

// Define a type for the metadata object properties
interface ExpectedSessionMetadataProperties {
  timestamp?: string;
  data?: Json;
  user_query?: string;
  chart_generated?: boolean;
  chart_generated_at?: string;
}

interface ChatSession {
  id: string;
  prompt: string;
  answer: string | null;
  sql_query: string | null;
  chart_code: string | null;
  metadata: Json | null;
  created_at: string;
}

type TabType = 'answer' | 'sql' | 'charts';

const EnhancedChatInterface: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('answer');
  const [loading, setLoading] = useState(false);
  const [isChartLoading, setIsChartLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 2;
  const REQUEST_TIMEOUT = 30000; // 30 seconds
  const { user } = useAuth();
  const { toast } = useToast();

  // Utility function for retrying failed requests
  const fetchWithRetry = async <T,>(
    fn: () => Promise<T>,
    options: { maxRetries: number; onRetry?: (attempt: number, error: Error) => void } = { maxRetries: 0 }
  ): Promise<T> => {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt < options.maxRetries) {
          options.onRetry?.(attempt + 1, error as Error);
          // Exponential backoff: 1s, 2s, 4s, etc.
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
        }
      }
    }
    
    throw lastError || new Error('Unknown error occurred');
  };

  useEffect(() => {
    if (user) {
      loadRecentSessions();
    }
  }, [user]);

  const loadRecentSessions = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setSessions(data.map(s => ({ ...s, metadata: s.metadata as Json | null })) || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleSubmitPrompt = async () => {
    // Input validation
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast({
        title: "Empty prompt",
        description: "Please enter a question or request",
        variant: "destructive",
      });
      return;
    }

    // Cancel any ongoing request
    if (abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
    setAbortController(controller);

    setLoading(true);
    setIsChartLoading(false);
    setRetryCount(0);

    try {
      // Call inference edge function with retry logic
      const inferenceResponse = await fetchWithRetry(
        async () => {
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/inference`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              prompt: trimmedPrompt,
              email: user?.email || ''
            }),
            signal: controller.signal
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `Request failed with status ${response.status}`);
          }

          return response.json();
        },
        {
          maxRetries: MAX_RETRIES,
          onRetry: (attempt, error) => {
            console.log(`Retry attempt ${attempt} after error:`, error);
            toast({
              title: `Retrying... (${attempt}/${MAX_RETRIES})`,
              description: error.message,
              variant: "default",
            });
          }
        }
      );

      const inferenceResult = inferenceResponse;

      if (!inferenceResult || !inferenceResult.success) {
        throw new Error(inferenceResult?.error || 'Failed to process query');
      }

      const inferenceData = inferenceResult.data;

      // Generate chart if we have SQL and data
      let chartResult = null;
      if (inferenceData.sql && inferenceData.queryData) {
        try {
          setIsChartLoading(true);
          
          const chartResponse = await fetchWithRetry(
            async () => {
              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-chart`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
                },
                body: JSON.stringify({
                  sql: inferenceData.sql,
                  data: inferenceData.queryData,
                  inference: inferenceData.answer,
                  User_query: trimmedPrompt
                }),
                signal: controller.signal
              });

              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `Chart generation failed with status ${response.status}`);
              }

              return response.json();
            },
            {
              maxRetries: 1, // Only retry once for chart generation
              onRetry: (attempt) => {
                toast({
                  title: 'Retrying chart generation...',
                  description: `Attempt ${attempt} of 1`,
                  variant: 'default',
                });
              }
            }
          );

          chartResult = chartResponse;
          console.log('Chart generation successful:', chartResult);
        } catch (chartError) {
          console.error('Chart generation failed:', chartError);
          toast({
            title: 'Chart Generation Skipped',
            description: 'Proceeding without chart visualization.',
            variant: 'default',
          });
        } finally {
          setIsChartLoading(false);
        }
      }

      // Create new chat session with both inference and chart response
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user?.id,
          prompt: prompt.trim(),
          answer: inferenceData.answer,
          sql_query: inferenceData.sql,
          chart_code: chartResult?.chart_code || null,
          metadata: { 
            timestamp: new Date().toISOString(),
            data: inferenceData.queryData,
            user_query: prompt.trim(),
            chart_generated: chartResult?.success || false,
            chart_generated_at: chartResult?.success ? new Date().toISOString() : undefined,
          } as Json
        }])
        .select()
        .single();

      if (sessionError) {
        throw sessionError;
      }

      setCurrentSession({ ...sessionData, metadata: sessionData.metadata as Json | null });
      setPrompt('');
      setActiveTab('answer');
      loadRecentSessions();

      toast({
        title: "Success",
        description: "Your query has been processed successfully",
      });
    } catch (error) {
      console.error('Error submitting prompt:', error);
      
      let errorMessage = 'Failed to process your request';
      let errorTitle = 'Error';
      
      if (error.name === 'AbortError') {
        errorTitle = 'Request Timeout';
        errorMessage = 'The request took too long to complete. Please try a different query or try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      setIsChartLoading(false);
      setAbortController(null);
    }
  };

  const executeChartScript = (chartCode: string) => {
    try {
      const scriptMatch = chartCode.match(/<script>(.*?)<\/script>/s);
      if (scriptMatch) {
        const scriptContent = scriptMatch[1];
        const func = new Function(scriptContent);
        func();
      }
    } catch (error) {
      console.error('Error executing chart script:', error);
    }
  };

  const selectSession = (session: ChatSession) => {
    setCurrentSession({ ...session, metadata: session.metadata as Json | null });
    setActiveTab('answer');
    
    // If selecting a session that has chart code and we're on charts tab, render it
    if (session.chart_code && activeTab === 'charts') {
      setTimeout(() => executeChartScript(session.chart_code), 100);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    
    // If switching to charts and we have chart code, render it
    if (tab === 'charts' && currentSession?.chart_code) {
      setTimeout(() => executeChartScript(currentSession.chart_code), 100);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
      {/* Chat History Sidebar */}
      <div className="lg:col-span-1">
        <Card className="h-full">
          <CardContent className="p-4">
            <h3 className="font-semibold text-viz-dark dark:text-white mb-4">Recent Queries</h3>
            <div className="space-y-2">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => selectSession(session)}
                  className={`w-full text-left p-3 rounded-lg text-sm transition-colors ${
                    currentSession?.id === session.id 
                      ? 'bg-viz-accent/10 border border-viz-accent/30' 
                      : 'hover:bg-slate-50 dark:hover:bg-viz-light/10'
                  }`}
                >
                  <p className="font-medium truncate">{session.prompt}</p>
                  <p className="text-xs text-viz-text-secondary mt-1">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {session.answer && <Badge variant="outline" className="text-xs">Answer</Badge>}
                    {session.sql_query && <Badge variant="outline" className="text-xs">SQL</Badge>}
                    {session.chart_code && <Badge variant="outline" className="text-xs">Chart</Badge>}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chat Interface */}
      <div className="lg:col-span-3 flex flex-col">
        {/* Input Area */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me anything about your data..."
                className="flex-1 min-h-[60px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmitPrompt();
                  }
                }}
              />
              <Button
                onClick={handleSubmitPrompt}
                disabled={loading || !prompt.trim()}
                className="bg-viz-accent hover:bg-viz-accent-light"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <SendIcon className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Area */}
        <Card className="flex-1 flex flex-col">
          {/* Tabs */}
          <div className="border-b border-slate-200 dark:border-viz-light/20">
            <div className="flex">
              <button
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'answer'
                    ? 'border-viz-accent text-viz-accent'
                    : 'border-transparent text-viz-text-secondary hover:text-viz-dark dark:hover:text-white'
                }`}
                onClick={() => handleTabChange('answer')}
              >
                <FileTextIcon className="w-4 h-4 mr-2 inline" />
                Answer
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'sql'
                    ? 'border-viz-accent text-viz-accent'
                    : 'border-transparent text-viz-text-secondary hover:text-viz-dark dark:hover:text-white'
                }`}
                onClick={() => handleTabChange('sql')}
              >
                <DatabaseIcon className="w-4 h-4 mr-2 inline" />
                SQL
              </button>
              <button
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'charts'
                    ? 'border-viz-accent text-viz-accent'
                    : 'border-transparent text-viz-text-secondary hover:text-viz-dark dark:hover:text-white'
                }`}
                onClick={() => handleTabChange('charts')}
              >
                <BarChartIcon className="w-4 h-4 mr-2 inline" />
                Charts
              </button>
            </div>
          </div>

          {/* Content */}
          <CardContent className="flex-1 p-6 overflow-auto">
            {!currentSession ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <FileTextIcon className="w-12 h-12 text-viz-text-secondary mb-4" />
                <h3 className="text-lg font-medium text-viz-dark dark:text-white mb-2">No query selected</h3>
                <p className="text-viz-text-secondary">Ask a question above or select a previous query from the sidebar</p>
              </div>
            ) : (
              <div>
                {activeTab === 'answer' && (
                  <div className="prose dark:prose-invert max-w-none">
                    {currentSession.answer || (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Analyzing your query...</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'sql' && (
                  <div>
                    {currentSession.sql_query ? (
                      <div className="bg-viz-dark p-4 rounded-lg">
                        <pre className="text-viz-accent text-sm overflow-x-auto whitespace-pre-wrap">
                          <code>{format(currentSession.sql_query, { language: 'bigquery', tabWidth: 2 })}</code>
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center py-8">
                        <DatabaseIcon className="w-6 h-6 text-viz-text-secondary mr-2" />
                        <span className="text-viz-text-secondary">No SQL query generated yet</span>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'charts' && (
                  <div>
                    {isChartLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        <span>Generating chart...</span>
                      </div>
                    ) : currentSession.chart_code ? (
                      <div id="chartContainer" className="w-full min-h-[400px]">
                        {/* Chart will be injected here */}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8">
                        <BarChartIcon className="w-6 h-6 text-viz-text-secondary mb-2" />
                        <span className="text-viz-text-secondary mb-4">No chart available</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedChatInterface;
