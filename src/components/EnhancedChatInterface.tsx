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

// Declare Chart.js types for TypeScript
declare global {
  interface Window {
    Chart?: any;
  }
}

// Define a type for the metadata object properties, assuming it's an object when present
interface ExpectedSessionMetadataProperties {
  timestamp?: string;
  data?: Json; // Use Json for data as its structure is dynamic
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
  metadata: Json | null; // Changed to Json | null to match Supabase's return type
  created_at: string;
}

type TabType = 'answer' | 'sql' | 'charts';

const EnhancedChatInterface: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('answer');
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

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
      // Ensure metadata is typed correctly when setting sessions
      setSessions(data.map(s => ({ ...s, metadata: s.metadata as Json | null })) || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
    }
  };

  const handleSubmitPrompt = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a question or request",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('=== Starting query processing ===');
      console.log('Input prompt:', prompt.trim());
      
      // Call inference edge function
      console.log('Calling inference function...');
      const { data: inferenceResult, error: inferenceError } = await supabase.functions.invoke('inference', {
        body: {
          prompt: prompt.trim()
        }
      });

      console.log('Inference API response:', { inferenceResult, inferenceError });

      if (inferenceError) {
        console.error('Inference function failed:', inferenceError);
        throw new Error(inferenceError.message || 'Failed to process query');
      }

      if (!inferenceResult || !inferenceResult.success) {
        console.error('Inference returned unsuccessful:', inferenceResult);
        throw new Error(inferenceResult?.error || 'Failed to process query');
      }

      // Create new chat session with the response
      const { data: sessionData, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert([{
          user_id: user?.id,
          prompt: prompt.trim(),
          answer: inferenceResult.data.answer,
          sql_query: inferenceResult.data.sql,
          metadata: { 
            timestamp: new Date().toISOString(),
            data: inferenceResult.data.queryData
          } as Json // Cast to Json when inserting
        }])
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation failed:', sessionError);
        throw sessionError;
      }

      console.log('Session created with response:', sessionData);
      // Ensure metadata is typed correctly when setting currentSession
      setCurrentSession({ ...sessionData, metadata: sessionData.metadata as Json | null });
      setPrompt('');
      setActiveTab('answer');
      loadRecentSessions();
      
      console.log('=== Query processing completed successfully ===');

      toast({
        title: "Success",
        description: "Your query has been processed successfully",
      });
    } catch (error) {
      console.error('Error submitting prompt:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to process your request. Please check the console for more details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateChart = async () => {
    console.log('handleGenerateChart called. currentSession:', currentSession);
    const metadata = currentSession?.metadata;
    console.log('handleGenerateChart - extracted metadata:', metadata);

    // Detailed checks for debugging
    console.log('Check 1: !currentSession:', !currentSession);
    console.log('Check 2: !currentSession?.sql_query:', !currentSession?.sql_query);
    console.log('Check 3: !metadata:', !metadata);
    console.log('Check 4: typeof metadata !== 'object':', typeof metadata !== 'object');
    console.log('Check 5: Array.isArray(metadata):', Array.isArray(metadata));
    console.log('Check 6: !(\'data\' in metadata):', metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? !('data' in metadata) : 'N/A - metadata not object');

    if (!currentSession || !currentSession.sql_query || !metadata || typeof metadata !== 'object' || Array.isArray(metadata) || !('data' in metadata)) {
      toast({
        title: "No data available",
        description: "Please run a query first to generate charts",
        variant: "destructive",
      });
      return;
    }

    // Now metadata is known to be an object with a 'data' property
    const sessionMetadata = metadata as ExpectedSessionMetadataProperties; 

    setChartLoading(true);
    try {
      console.log('Calling generate-chart function for session:', currentSession.id);
      
      const { data: chartResult, error: chartError } = await supabase.functions.invoke('generate-chart', {
        body: {
          sessionId: currentSession.id
        }
      });

      console.log('Chart result:', { chartResult, chartError });

      if (chartError) {
        console.error('Chart generation error:', chartError);
        throw new Error(chartError.message || 'Failed to generate chart');
      }

      if (!chartResult || !chartResult.success) {
        throw new Error(chartResult?.error || 'Failed to generate chart');
      }

      // Reload session data
      const { data: updatedSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', currentSession.id)
        .single();

      if (fetchError) throw fetchError;

      // Ensure metadata is typed correctly when setting currentSession
      setCurrentSession({ ...updatedSession, metadata: updatedSession.metadata as Json | null });

      // Inject chart code into DOM
      if (updatedSession.chart_code) {
        const chartContainer = document.getElementById('chartContainer');
        if (chartContainer) {
          chartContainer.innerHTML = '<canvas id="myChart" width="400" height="200"></canvas>';
          
          // Add Chart.js library if not already loaded
          if (typeof window.Chart === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.onload = () => executeChartScript(updatedSession.chart_code);
            document.head.appendChild(script);
          } else {
            executeChartScript(updatedSession.chart_code);
          }
        }
      }

      toast({
        title: "Chart generated",
        description: "Your chart has been created successfully",
      });
    } catch (error) {
      console.error('Error generating chart:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate chart. Please check the console for more details.",
        variant: "destructive",
      });
    } finally {
      setChartLoading(false);
    }
  };

  const executeChartScript = (chartCode: string) => {
    try {
      console.log('Executing chart script:', chartCode);
      // Extract and execute script content
      const scriptMatch = chartCode.match(/<script>(.*?)<\/script>/s);
      if (scriptMatch) {
        const scriptContent = scriptMatch[1];
        // Ensure scriptContent is a string before passing to new Function
        const func = new Function(scriptContent as string); // Cast to string
        func();
      }
    } catch (error) {
      console.error('Error executing chart script:', error);
    }
  };

  const selectSession = (session: ChatSession) => {
    // When selecting a session, ensure metadata is treated as Json
    setCurrentSession({ ...session, metadata: session.metadata as Json | null });
    setActiveTab('answer');
    
    // If switching to charts and we have chart code, render it
    if (session.chart_code && activeTab === 'charts') {
      setTimeout(() => executeChartScript(session.chart_code), 100);
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    console.log('handleTabChange called. Tab:', tab, 'currentSession:', currentSession);
    
    // If switching to charts and we have chart code, render it
    if (tab === 'charts') {
      if (currentSession?.chart_code) {
        setTimeout(() => executeChartScript(currentSession.chart_code), 100);
      } else {
        // Check if currentSession.metadata is an object with a data property before calling handleGenerateChart
        const metadata = currentSession?.metadata;
        if (currentSession?.sql_query && metadata && typeof metadata === 'object' && !Array.isArray(metadata) && 'data' in metadata) {
          console.log('Attempting to generate chart as data is available.');
          handleGenerateChart();
        }
      }
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
                placeholder="Ask me anything about your data... (e.g., 'give monthly revenue?')"
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
                    {chartLoading ? (
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
                        <Button 
                          onClick={handleGenerateChart} 
                          disabled={!currentSession.sql_query || !(currentSession.metadata && typeof currentSession.metadata === 'object' && !Array.isArray(currentSession.metadata) && 'data' in currentSession.metadata)}
                        >
                          Generate Chart
                        </Button>
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
