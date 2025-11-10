import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { keywordTrendApi, KeywordItem, TrendsResult, APIError, NetworkError, AuthenticationError, TimeoutError } from '@/services/keywordTrendApi';
import { Loader2, BarChart3, Sparkles, Cloud, Download, TrendingUp, AlertCircle, CheckCircle2, XCircle, Activity, Zap, Target, Eye, ArrowRight, Info } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const INDUSTRIES = [
  'Mechatronic Systems',
  'Avionics',
  'FinTech',
  'EdTech',
  'Manufacturing',
  'Healthcare',
  'E-commerce',
  'SaaS',
  'Automotive',
  'Energy',
  'Aerospace',
  'Telecommunications',
  'Consumer Electronics',
  'Biotech',
  'Logistics',
  'Retail',
  'Real Estate',
  'Travel & Hospitality',
  'Gaming',
  'Food & Beverage',
];

type Step = 'idle' | 'orchestrate' | 'trends' | 'polling' | 'done' | 'error';

const KeywordTrendAgent: React.FC = () => {
  const { toast } = useToast();
  const [industry, setIndustry] = useState('');
  const [keywordsText, setKeywordsText] = useState('');
  const [usp, setUsp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>('idle');
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [result, setResult] = useState<TrendsResult | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [insightTopEmerging, setInsightTopEmerging] = useState<string[]>([]);
  const [momentumIndex, setMomentumIndex] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<TrendsResult['status'] | 'IDLE'>('IDLE');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);
  const [error, setError] = useState<{ message: string; type: string; details?: string } | null>(null);
  const [debugLogs, setDebugLogs] = useState<Array<{ timestamp: string; level: string; message: string }>>([]);

  const filteredIndustries = useMemo(() => INDUSTRIES, []);
  
  // Add debug log
  const addDebugLog = (level: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugLogs(prev => [...prev.slice(-19), { timestamp, level, message }]);
  };

  const totalTimeout = 200000;
  const progress = useMemo(() => {
    if (step === 'idle') return 0;
    if (step === 'orchestrate') return 20;
    if (step === 'trends') return 40;
    if (step === 'polling') return Math.min(95, 40 + Math.round((elapsedMs / totalTimeout) * 55));
    if (step === 'done') return 100;
    return 0;
  }, [step, elapsedMs]);

  const startAnalysis = async () => {
    try {
      if (!industry || !usp.trim()) {
        toast({ title: 'Missing input', description: 'Select an industry and enter a USP.', variant: 'destructive' });
        return;
      }
      
      // Reset state
      setLoading(true);
      setStep('orchestrate');
      setAttempt(0);
      setResult(null);
      setKeywords([]);
      setInsightTopEmerging([]);
      setMomentumIndex(undefined);
      setStatus('IDLE');
      setElapsedMs(0);
      setError(null);
      setDebugLogs([]);
      controller?.abort();
      const ctr = new AbortController();
      setController(ctr);
      
      addDebugLog('info', 'Starting analysis...');

      // Build key_services from user-entered keywords and USP phrases (comma/newline separated)
      const ksFromKeywords = keywordsText
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const ksFromUsp = usp
        .split(/[\n,]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const key_services = Array.from(new Set([...ksFromKeywords, ...ksFromUsp]));

      addDebugLog('info', `Orchestrating keywords for ${industry}...`);
      let orch;
      try {
        orch = await keywordTrendApi.orchestrate({ industry, usp, key_services });
        addDebugLog('success', `Orchestrate completed: ${orch.keywords?.length || 0} keywords generated`);
      } catch (orchError: any) {
        addDebugLog('error', `Orchestrate failed: ${orchError.message}`);
        // Continue with trends even if orchestrate fails
        if (orchError instanceof AuthenticationError) {
          throw orchError; // Auth errors should stop the flow
        }
        // For other errors, use user-provided keywords if available
        if (!keywordsText.trim()) {
          throw new Error('Keyword generation failed and no manual keywords provided. Please add keywords manually or try again.');
        }
        addDebugLog('warn', 'Using manual keywords only');
        orch = { keywords: [] };
      }
      
      let kws: KeywordItem[] = [];
      const rawKeywords = orch.keywords || [];
      kws = (rawKeywords as any[]).map((k: any) =>
        typeof k === 'string' ? { term: k } : { term: k.term, weight: k.weight, frequency: k.frequency }
      );

      // Merge user-provided keywords (comma/line separated)
      const userKws = keywordsText
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((term) => ({ term } as KeywordItem));
      if (userKws.length) {
        const existing = new Set(kws.map((k) => k.term.toLowerCase()));
        userKws.forEach((k) => {
          if (!existing.has(k.term.toLowerCase())) kws.push(k);
        });
      }
      setKeywords(kws);

      // Derive insights from orchestrate output if available
      try {
        // topEmerging from keywords list if available
        const topEmerging = (rawKeywords as any[])
          .map((k: any) => (typeof k === 'string' ? k : k?.term))
          .filter(Boolean)
          .slice(0, 10) as string[];
        setInsightTopEmerging(topEmerging);
        // Simple momentum index heuristic based on keyword count
        setMomentumIndex(Math.min(100, Math.max(10, (rawKeywords as any[]).length * 7)));
      } catch {}

      setStep('trends');
      addDebugLog('info', `Starting trends analysis for ${kws.length} keywords...`);
      
      let start;
      try {
        start = await keywordTrendApi.trendsStart({ keywords: kws.map((k) => k.term) });
        addDebugLog('success', `Trends started: ${start.status} (Job ID: ${start.job_id || 'N/A'})`);
      } catch (trendsError: any) {
        addDebugLog('error', `Trends failed: ${trendsError.message}`);
        throw new Error(`Trend analysis failed: ${trendsError.message}`);
      }

      if (start.status === 'COMPLETED') {
        setResult(start);
        setStep('done');
        setLoading(false);
        addDebugLog('success', 'Analysis completed immediately');
        toast({ title: 'Success!', description: 'Trend analysis completed successfully.' });
        return;
      }

      if (start.job_id) {
        setStep('polling');
        addDebugLog('info', `Polling job ${start.job_id}...`);
        const final = await keywordTrendApi.pollUntilComplete(start.job_id, {
          intervalMs: 10000,
          timeoutMs: totalTimeout,
          maxConsecutiveErrors: 7,
          onTick: (a, elapsed) => {
            setAttempt(a);
            setElapsedMs(elapsed);
          },
          onStatus: (s) => setStatus(s),
          signal: ctr.signal,
          backoff: { enabled: true, factor: 1.5, maxIntervalMs: 30000, jitter: true },
        });
        setResult(final);
        setStep('done');
        setLoading(false);
        addDebugLog('success', 'Analysis completed successfully');
        toast({ title: 'Success!', description: 'Trend analysis completed successfully.' });
        return;
      }

      toast({ title: 'Unexpected response', description: 'No job id received for polling', variant: 'destructive' });
      addDebugLog('error', 'No job ID received');
      setStep('error');
      setLoading(false);
    } catch (e: any) {
      console.error('Analysis error:', e);
      addDebugLog('error', `Analysis failed: ${e.message}`);
      
      let errorType = 'Error';
      let errorMessage = e?.message || 'Please try again.';
      let errorDetails = '';
      
      if (e instanceof AuthenticationError) {
        errorType = 'Authentication Error';
        errorMessage = 'Please sign in to continue';
        errorDetails = 'Your session may have expired';
      } else if (e instanceof NetworkError) {
        errorType = 'Network Error';
        errorMessage = 'Unable to connect to the server';
        errorDetails = 'Check your internet connection';
      } else if (e instanceof TimeoutError) {
        errorType = 'Timeout Error';
        errorMessage = 'Request took too long';
        errorDetails = 'The server is taking longer than expected';
      } else if (e instanceof APIError) {
        errorType = 'API Error';
        errorMessage = e.message;
        errorDetails = e.status ? `Status: ${e.status}` : '';
      }
      
      setError({ message: errorMessage, type: errorType, details: errorDetails });
      toast({ 
        title: errorType, 
        description: errorMessage, 
        variant: 'destructive' 
      });
      setStep('error');
      setLoading(false);
    }
  };

  const cancelPolling = () => {
    controller?.abort();
    setStatus('IDLE');
    setStep('error');
    toast({ title: 'Cancelled', description: 'Trend analysis has been cancelled.', variant: 'destructive' });
  };

  const downloadCSV = () => {
    const rows: string[] = [];
    rows.push(['date', 'term', 'value'].join(','));
    (result?.timeline || []).forEach((p) => rows.push([p.date, p.term, String(p.value)].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword_trends.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full w-full overflow-auto bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/30">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.div 
              className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <TrendingUp className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Keyword & Trend Agent
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">AI-Powered Market Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {result?.timeline?.length && (
              <Button 
                variant="outline" 
                onClick={downloadCSV}
                className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-950"
              >
                <Download className="w-4 h-4 mr-2" /> Export Data
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="ml-2">
                  <div className="font-semibold text-red-900 dark:text-red-100">{error.type}</div>
                  <div className="text-sm text-red-700 dark:text-red-300">{error.message}</div>
                  {error.details && <div className="text-xs text-red-600 dark:text-red-400 mt-1">{error.details}</div>}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="relative overflow-hidden border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Market Analysis</CardTitle>
                    <CardDescription className="text-xs">Discover trending opportunities</CardDescription>
                  </div>
                </div>
              </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  placeholder="Select Industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  list="industry-list"
                />
                <datalist id="industry-list">
                  {filteredIndustries.map((i) => (
                    <option key={i} value={i} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="keywords">Keywords (optional)</Label>
                <Textarea
                  id="keywords"
                  placeholder="Comma or newline separated keywords (e.g. anomaly detection, healthcare IoT, EHR security)"
                  value={keywordsText}
                  onChange={(e) => setKeywordsText(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="usp">USP</Label>
                <Textarea
                  id="usp"
                  placeholder="Enter your brand’s USP (e.g. affordability, sustainability, innovation)"
                  value={usp}
                  onChange={(e) => setUsp(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={startAnalysis}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing market signals…
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" /> Analyze
                    </>
                  )}
                </Button>
                <div className="flex-1">
                  <Progress value={progress} />
                </div>
              </div>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-slate-600 dark:text-slate-300"
                  >
                    {step === 'orchestrate' && 'Generating keywords…'}
                    {step === 'trends' && 'Analyzing trend insights…'}
                    {step === 'polling' && 'Crunching data... please wait.'}
                  </motion.div>
                )}
              </AnimatePresence>

              {!!keywords.length && (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Generated Keywords</div>
                  <div className="flex flex-wrap gap-2">
                    {keywords.slice(0, 40).map((k) => {
                      const size = k.weight || k.frequency || 1;
                      const scale = Math.min(1.6, 0.9 + size / 10);
                      return (
                        <Badge key={k.term} className="bg-indigo-50 text-indigo-700 border border-indigo-200" style={{ transform: `scale(${scale})` }}>
                          {k.term}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

            {/* Debug Panel */}
            {debugLogs.length > 0 && (
              <Card className="border-slate-200/50 dark:border-slate-700/50 bg-slate-50/50 dark:bg-slate-900/50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-600" />
                    <CardTitle className="text-sm">Debug Log</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 max-h-40 overflow-y-auto text-xs font-mono">
                    {debugLogs.map((log, idx) => (
                      <div key={idx} className={`flex gap-2 ${
                        log.level === 'error' ? 'text-red-600' : 
                        log.level === 'warn' ? 'text-yellow-600' : 
                        log.level === 'success' ? 'text-green-600' : 
                        'text-slate-600'
                      }`}>
                        <span className="text-slate-400">{log.timestamp}</span>
                        <span>{log.message}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Chart */}
            <Card className="relative overflow-hidden border-slate-200/50 dark:border-slate-700/50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none" />
              <CardHeader className="relative">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Trend Timeline</CardTitle>
                      <CardDescription className="text-xs">Real-time market trends</CardDescription>
                    </div>
                  </div>
                  {step === 'polling' && (
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        <Activity className="w-3 h-3 mr-1 animate-pulse" />
                        Attempt #{attempt}
                      </Badge>
                      <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
                        {Math.floor(elapsedMs / 1000)}s
                      </Badge>
                      <Button size="sm" variant="outline" onClick={cancelPolling} className="h-8">
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  {result?.timeline && result.timeline.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={result.timeline} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                        <defs>
                          <linearGradient id="colorIndigo" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                        <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Legend />
                        {Array.from(new Set(result.timeline.map((d) => d.term))).slice(0, 4).map((t, i) => (
                          <Line 
                            key={t} 
                            type="monotone" 
                            dataKey={(d: any) => (d.term === t ? d.value : null)} 
                            name={t} 
                            stroke={["#6366f1","#10b981","#f59e0b","#ef4444"][i % 4]} 
                            strokeWidth={2}
                            dot={{ fill: ["#6366f1","#10b981","#f59e0b","#ef4444"][i % 4], r: 4 }}
                            activeDot={{ r: 6 }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg"
                          >
                            <BarChart3 className="w-8 h-8 text-white" />
                          </motion.div>
                          <div className="text-center space-y-2">
                            <div className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                              {step === 'orchestrate' && 'Generating keywords...'}
                              {step === 'trends' && 'Analyzing trends...'}
                              {step === 'polling' && 'Processing data...'}
                            </div>
                            <div className="text-sm text-slate-500">Status: {status}</div>
                            <div className="w-64 mx-auto">
                              <Progress value={progress} className="h-2" />
                            </div>
                            {step === 'polling' && (
                              <div className="text-xs text-slate-400">
                                Attempt #{attempt} • {Math.floor(elapsedMs / 1000)}s elapsed
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="text-center space-y-3">
                          <div className="p-4 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl inline-block">
                            <Eye className="w-8 h-8 text-slate-400" />
                          </div>
                          <div className="text-sm text-slate-500">No data yet. Start an analysis to see trends.</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Insights Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Top Emerging */}
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-green-200/50 dark:border-green-800/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/20 dark:to-emerald-950/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-green-500 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-white rotate-[-45deg]" />
                      </div>
                      <CardTitle className="text-sm font-bold text-green-900 dark:text-green-100">Top Emerging</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(result?.insights?.topEmerging || insightTopEmerging).slice(0, 10).map((i, idx) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-2 bg-white dark:bg-green-950/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium shadow-sm"
                        >
                          {i}
                        </motion.div>
                      ))}
                      {!((result?.insights?.topEmerging || insightTopEmerging) || []).length && (
                        <div className="text-slate-400 text-sm text-center py-4">No data yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Declining */}
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-rose-200/50 dark:border-rose-800/50 bg-gradient-to-br from-rose-50/50 to-red-50/50 dark:from-rose-950/20 dark:to-red-950/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-rose-500 rounded-lg">
                        <ArrowRight className="w-4 h-4 text-white rotate-[45deg]" />
                      </div>
                      <CardTitle className="text-sm font-bold text-rose-900 dark:text-rose-100">Declining</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {(result?.insights?.declining || []).slice(0, 10).map((i, idx) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="px-3 py-2 bg-white dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 rounded-lg text-sm font-medium shadow-sm"
                        >
                          {i}
                        </motion.div>
                      ))}
                      {!(result?.insights?.declining || []).length && (
                        <div className="text-slate-400 text-sm text-center py-4">No data yet</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Momentum Index */}
              <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
                <Card className="h-full border-indigo-200/50 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Zap className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Momentum Index</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="text-6xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {result?.insights?.momentumIndex ?? momentumIndex ?? '--'}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">Higher is better</div>
                    {(result?.insights?.momentumIndex ?? momentumIndex) && (
                      <div className="mt-4 w-full">
                        <Progress 
                          value={result?.insights?.momentumIndex ?? momentumIndex ?? 0} 
                          className="h-2"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordTrendAgent;
