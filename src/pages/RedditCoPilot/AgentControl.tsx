import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, ArrowLeft, Activity, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import redditCopilotAPI, { LogEntry, AgentSession } from '@/services/redditCopilotApi';

const AgentControl: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<AgentSession | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Load agent status and profile on mount
  useEffect(() => {
    loadInitialData();
    return () => {
      // Cleanup WebSocket on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Check if client profile exists
      const profile = await redditCopilotAPI.getClientProfile();
      setIsProfileComplete(!!profile && !!profile.usp && !!profile.industry && profile.keywords.length > 0);
      
      // Check current agent status
      const agentStatus = await redditCopilotAPI.getAgentStatus();
      if (agentStatus) {
        setCurrentSession(agentStatus);
        setIsRunning(agentStatus.status === 'running');
        
        // Load recent logs
        const recentLogs = await redditCopilotAPI.getAgentLogs(agentStatus.session_id);
        setLogs(recentLogs);
        
        // Connect to live logs if agent is running
        if (agentStatus.status === 'running') {
          connectToLiveLog(agentStatus.session_id);
        }
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectToLiveLog = (sessionId: string) => {
    try {
      const ws = redditCopilotAPI.connectToLogs(
        sessionId,
        (log: LogEntry) => {
          setLogs(prev => [...prev, log]);
        },
        (error: Error) => {
          console.error('WebSocket error:', error);
          toast({
            title: "Connection Error",
            description: "Lost connection to live logs. Refreshing...",
            variant: "destructive"
          });
        }
      );
      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to live logs:', error);
    }
  };

  const handleStartAgent = async () => {
    if (!isProfileComplete) {
      navigate('/mia/reddit-copilot/client-setup');
      return;
    }

    try {
      setIsLoading(true);
      
      // Start agent via Lambda API
      const session = await redditCopilotAPI.startAgent();
      setCurrentSession(session);
      setIsRunning(true);
      setLogs([]); // Clear previous logs
      
      // Connect to live logs
      connectToLiveLog(session.session_id);
      
      toast({
        title: "Agent Started",
        description: "Reddit commenting agent is now running.",
      });
    } catch (error) {
      console.error('Failed to start agent:', error);
      toast({
        title: "Start Failed",
        description: "Failed to start Reddit commenting agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopAgent = async () => {
    if (!currentSession) return;

    try {
      setIsLoading(true);
      
      // Stop agent via Lambda API
      await redditCopilotAPI.stopAgent(currentSession.session_id);
      setIsRunning(false);
      
      // Close WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      toast({
        title: "Agent Stopped",
        description: "Reddit commenting agent has been stopped.",
      });
    } catch (error) {
      console.error('Failed to stop agent:', error);
      toast({
        title: "Stop Failed",
        description: "Failed to stop Reddit commenting agent. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-viz-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-viz-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-viz-light/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/mia/reddit-copilot')}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Agent Control Panel
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
              isRunning 
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
              {isRunning ? 'Running' : 'Idle'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Reddit Commenting Agent
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Monitor and control your automated Reddit engagement
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Control Panel */}
            <div className="lg:col-span-1">
              <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Agent Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                      Reddit Commenting Agent
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      The agent will find relevant posts and generate compliant GEO-optimized responses.
                    </p>

                    {isLoading ? (
                      <Button disabled className="w-full">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </Button>
                    ) : !isProfileComplete ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
                          Please complete your client profile first
                        </p>
                        <Button
                          onClick={() => navigate('/mia/reddit-copilot/client-setup')}
                          variant="outline"
                          className="w-full"
                        >
                          Setup Profile
                        </Button>
                      </div>
                    ) : !isRunning ? (
                      <Button
                        onClick={handleStartAgent}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Starting Agent...
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Run Reddit Commenting Agent
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStopAgent}
                        disabled={isLoading}
                        variant="destructive"
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Stopping Agent...
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 mr-2" />
                            Stop Agent
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Statistics */}
                  {logs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-slate-900 dark:text-white">Session Stats</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {logs.filter(log => log.type === 'search').length}
                          </div>
                          <div className="text-xs text-blue-600 dark:text-blue-400">Searches</div>
                        </div>
                        <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                            {logs.filter(log => log.type === 'generate').length}
                          </div>
                          <div className="text-xs text-purple-600 dark:text-purple-400">Generated</div>
                        </div>
                        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="text-xl font-bold text-green-600 dark:text-green-400">
                            {logs.filter(log => log.type === 'post').length}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400">Posted</div>
                        </div>
                        <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                          <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                            {Math.round((logs.filter(log => log.type === 'post').length / Math.max(logs.filter(log => log.type === 'generate').length, 1)) * 100)}%
                          </div>
                          <div className="text-xs text-orange-600 dark:text-orange-400">Success</div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Live Log Display */}
            <div className="lg:col-span-2">
              <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Live Activity Log
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
                    <AnimatePresence>
                      {logs.length === 0 && !isRunning ? (
                        <div className="text-slate-400 text-center py-8">
                          <div className="text-4xl mb-2">⚡</div>
                          <p>Ready to start Reddit engagement</p>
                          <p className="text-xs mt-1">Click "Run Reddit Commenting Agent" to begin</p>
                        </div>
                      ) : (
                        logs.map((log, index) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="mb-2 text-green-400"
                          >
                            <span className="text-slate-500">
                              [{new Date(log.timestamp).toLocaleTimeString()}]
                            </span>{' '}
                            {log.message}
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                    
                    {isRunning && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-yellow-400 animate-pulse"
                      >
                        <span className="text-slate-500">
                          [{new Date().toLocaleTimeString()}]
                        </span>{' '}
                        ⏳ Processing...
                      </motion.div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentControl;
