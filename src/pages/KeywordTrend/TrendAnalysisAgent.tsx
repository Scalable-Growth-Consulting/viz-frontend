import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Search,
  TrendingUp,
  Download,
  Loader2,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  Info,
  Zap,
  Globe,
  Target,
  ExternalLink,
  Clock,
  Flame,
  LineChart as LineChartIcon,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Timer,
  Layers,
  Brain,
} from 'lucide-react';
import { keywordTrendApi, TrendsResult } from '@/services/keywordTrendApi';

const INDUSTRIES = [
  'FinTech',
  'Healthcare',
  'E-commerce',
  'SaaS',
  'EdTech',
  'Manufacturing',
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

// Pagination Controls Component
type PaginationControlsProps = {
  total: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({
  total,
  pageSize,
  page,
  onPageChange,
  itemLabel = 'items',
}) => {
  if (total <= pageSize) return null;
  const totalPages = Math.ceil(total / pageSize);
  const start = page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 mt-4">
      <span>
        Showing {start}-{end} of {total} {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div className="text-slate-600 dark:text-slate-300 px-2">
          {page + 1} / {totalPages}
        </div>
        <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => onPageChange(page + 1)}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Shared context interface
export interface TrendAnalysisContext {
  industry: string;
  keywords: string[];
}

interface TrendAnalysisAgentProps {
  initialIndustry?: string;
  initialKeywords?: string[];
}

const TrendAnalysisAgent: React.FC<TrendAnalysisAgentProps> = ({
  initialIndustry = '',
  initialKeywords = [],
}) => {
  const { toast } = useToast();

  // Form state
  const [industry, setIndustry] = useState(initialIndustry);
  const [keywordsInput, setKeywordsInput] = useState(initialKeywords.join(', '));

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'idle' | 'starting' | 'polling' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<TrendsResult | null>(null);
  const [status, setStatus] = useState<TrendsResult['status'] | 'IDLE'>('IDLE');
  const [attempt, setAttempt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [controller, setController] = useState<AbortController | null>(null);
  const analysisStartRef = useRef<number | null>(null);

  // UI state
  const [topSourcesPage, setTopSourcesPage] = useState(0);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Update initial values when props change
  useEffect(() => {
    if (initialIndustry) setIndustry(initialIndustry);
    if (initialKeywords.length > 0) setKeywordsInput(initialKeywords.join(', '));
  }, [initialIndustry, initialKeywords]);

  // Parse keywords from input
  const parsedKeywords = useMemo(() => {
    return keywordsInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [keywordsInput]);

  // Progress calculation
  const progress = useMemo(() => {
    if (step === 'idle') return 0;
    if (step === 'starting') return 10;
    if (step === 'polling') return Math.min(95, 10 + Math.round((elapsed / 1200000) * 85));
    if (step === 'done') return 100;
    return 5;
  }, [step, elapsed]);

  // Reset pagination on new results
  useEffect(() => {
    setTopSourcesPage(0);
    setSpotlightIndex(0);
  }, [result]);

  useEffect(() => {
    setSpotlightIndex(0);
  }, [searchQuery]);

  const TOP_SOURCES_PAGE_SIZE = 5;

  const topSourcesTotal = result?.top_sources?.length ?? 0;
  const paginatedTopSources = useMemo(() => {
    if (!result?.top_sources) return [];
    const start = topSourcesPage * TOP_SOURCES_PAGE_SIZE;
    return result.top_sources.slice(start, start + TOP_SOURCES_PAGE_SIZE);
  }, [result?.top_sources, topSourcesPage]);

  // Timeline chart data
  const timelineChartData = useMemo(() => {
    if (!result?.timeline?.length) return [];
    const bucket = new Map<string, number>();
    result.timeline.forEach((point) => {
      const safeDate = point?.date ? new Date(point.date).toISOString().slice(0, 10) : 'Unknown';
      const prev = bucket.get(safeDate) ?? 0;
      bucket.set(safeDate, prev + (isFinite(point.value) ? point.value : 0));
    });
    return Array.from(bucket.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, value]) => ({ date, value }));
  }, [result?.timeline]);

  // Trend spotlights
  const trendSpotlights = useMemo(() => {
    if (!result) return [];
    const keywordsInPlay = result.keywords?.length ?? parsedKeywords.length;
    const totalSources = result.top_sources?.length ?? 0;
    const totalTrends = result.top_trends?.length ?? 0;
    const topSignals = (result.trend_items ?? [])
      .filter((item) => item && typeof item.phrase === 'string')
      .sort((a, b) => (b?.correlation ?? 0) - (a?.correlation ?? 0))
      .slice(0, 6)
      .map((item, idx) => {
        const sourceTitles = (item?.sources ?? [])
          .map((s) => s?.title || s?.domain)
          .filter(Boolean)
          .slice(0, 2);
        return {
          id: `${item?.phrase ?? 'trend'}-${idx}`,
          title: item?.phrase ?? 'Trend signal',
          score: typeof item?.correlation === 'number' ? item.correlation : null,
          narrative: sourceTitles.length ? `Validated by ${sourceTitles.join(' & ')}` : undefined,
          supportingTrends: result.top_trends?.slice(0, 8) ?? [],
          stats: [
            { label: 'Momentum Score', value: item?.correlation ? item.correlation.toFixed(2) : '—' },
            { label: 'Supporting Sources', value: item?.sources?.length ?? 0 },
            { label: 'Keywords In Play', value: keywordsInPlay },
          ],
          totals: { totalSources, totalTrends, keywordsInPlay },
        };
      });

    if (topSignals.length) return topSignals;

    if (result.top_trends?.length) {
      return result.top_trends.slice(0, 6).map((trend, idx) => ({
        id: `${trend}-${idx}`,
        title: trend,
        score: null,
        narrative: 'Emerging narrative detected across multiple sources',
        supportingTrends: result.top_trends?.slice(0, 8) ?? [],
        stats: [
          { label: 'Trend Rank', value: `#${idx + 1}` },
          { label: 'Total Trend Signals', value: totalTrends },
          { label: 'Keywords In Play', value: keywordsInPlay },
        ],
        totals: { totalSources, totalTrends, keywordsInPlay },
      }));
    }
    return [];
  }, [result, parsedKeywords]);

  // Filtered spotlights
  const filteredSpotlights = useMemo(() => {
    if (!searchQuery.trim()) return trendSpotlights;
    const query = searchQuery.toLowerCase();
    return trendSpotlights.filter((spotlight) => {
      const titleMatch = spotlight.title?.toLowerCase().includes(query);
      const narrativeMatch = spotlight.narrative?.toLowerCase().includes(query);
      const supportingMatch = spotlight.supportingTrends?.some((trend) => trend.toLowerCase().includes(query));
      return Boolean(titleMatch || narrativeMatch || supportingMatch);
    });
  }, [trendSpotlights, searchQuery]);

  const totalSpotlights = filteredSpotlights.length;
  const safeSpotlightIndex = totalSpotlights ? Math.min(spotlightIndex, totalSpotlights - 1) : 0;
  const activeSpotlight = totalSpotlights ? filteredSpotlights[safeSpotlightIndex] : null;

  // Search matches in trend items
  const trendSearchMatches = useMemo(() => {
    if (!result?.trend_items || !searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return result.trend_items.filter((item) => {
      if (!item) return false;
      const phraseMatch = item.phrase?.toLowerCase().includes(query);
      const sourceMatch = item.sources?.some(
        (source) =>
          Boolean(source?.title?.toLowerCase().includes(query) || source?.domain?.toLowerCase().includes(query))
      );
      return Boolean(phraseMatch || sourceMatch);
    });
  }, [result?.trend_items, searchQuery]);

  const handleSpotlightNav = (direction: number) => {
    if (!totalSpotlights) return;
    setSpotlightIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return totalSpotlights - 1;
      if (next >= totalSpotlights) return 0;
      return next;
    });
  };

  const dataPointCount = result?.timeline?.length ?? result?.trend_items?.length ?? 0;
  const keywordCount = result?.keywords?.length ?? parsedKeywords.length;

  // Start trend analysis
  const handleStartAnalysis = async () => {
    if (!industry || parsedKeywords.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Provide an industry and at least one keyword for trend analysis.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      setStep('starting');
      setResult(null);
      setStatus('IDLE');
      setAttempt(0);
      setElapsed(0);
      setError(null);
      controller?.abort();
      const ctr = new AbortController();
      setController(ctr);
      analysisStartRef.current = Date.now();

      const start = await keywordTrendApi.trendsStart({
        industry,
        keywords: parsedKeywords,
      });

      console.log('[TrendAgent] START Lambda Response:', {
        hasJobId: !!start.job_id,
        status: start.status,
        message: start.message,
        hasTrendItems: !!start.trend_items?.length,
        hasTopSources: !!start.top_sources?.length,
        hasTopTrends: !!start.top_trends?.length,
      });

      const resolvedStatus = start.status ?? 'COMPLETED';
      setStatus(resolvedStatus);

      const jobInProgress = Boolean(start.job_id && resolvedStatus !== 'COMPLETED' && resolvedStatus !== 'FAILED');

      if (!jobInProgress) {
        console.log('[TrendAgent] Result ready immediately, no polling needed');

        if (resolvedStatus === 'FAILED') {
          const message = start.message || 'Trend analysis failed. Please try again.';
          setStep('error');
          setError(message);
          toast({ title: 'Trend analysis failed', description: message, variant: 'destructive' });
          analysisStartRef.current = null;
          return;
        }

        setResult(start);
        setStep('done');
        if (analysisStartRef.current) {
          setElapsed(Date.now() - analysisStartRef.current);
          analysisStartRef.current = null;
        }
        setAttempt(1);

        toast({
          title: 'Trend analysis complete',
          description: `Found ${start.trend_items?.length || 0} trend signals and ${start.top_sources?.length || 0} sources.`,
        });
        return;
      }

      if (start.job_id) {
        setStep('polling');
        console.log(`[TrendAgent] Job created: ${start.job_id}. Starting polling...`);

        const final = await keywordTrendApi.pollUntilComplete(start.job_id, {
          intervalMs: 15000,
          timeoutMs: 1200000,
          maxConsecutiveErrors: 10,
          onTick: (attemptNum, elapsedMs) => {
            setAttempt(attemptNum);
            setElapsed(elapsedMs);
          },
          onStatus: (s) => {
            setStatus(s);
          },
          signal: ctr.signal,
          backoff: { enabled: true, factor: 1.5, maxIntervalMs: 30000, jitter: true },
        });

        console.log('[TrendAgent] Polling complete! Results received:', {
          status: final.status,
          trendItemsCount: final.trend_items?.length || 0,
          topSourcesCount: final.top_sources?.length || 0,
          topTrendsCount: final.top_trends?.length || 0,
          executionTime: final.execution_time,
        });

        setResult(final);
        setStep('done');
        setStatus(final.status ?? 'COMPLETED');
        if (analysisStartRef.current) {
          setElapsed(Date.now() - analysisStartRef.current);
          analysisStartRef.current = null;
        }

        const execTime = final.execution_time ? ` (${Math.round(final.execution_time)}s)` : '';
        toast({
          title: 'Trend analysis complete',
          description: `Found ${final.trend_items?.length || 0} trend signals and ${final.top_sources?.length || 0} sources${execTime}.`,
        });
        return;
      }

      throw new Error('Trend API did not return a job_id for polling.');
    } catch (err: any) {
      console.error('Trend analysis failed:', err);
      setStep('error');

      let errorMessage = 'An unexpected error occurred. Please try again.';
      let errorTitle = 'Analysis Failed';

      if (err?.name === 'TimeoutError' || err?.status === 504) {
        errorTitle = 'Backend Processing Timeout';
        errorMessage =
          err?.message ||
          'The backend API is taking too long. Please try with fewer keywords or contact support.';
      } else if (err?.name === 'NetworkError') {
        errorTitle = 'Connection Issue';
        errorMessage = 'Unable to connect to the analysis service. Please check your internet connection.';
      } else if (err?.name === 'AuthenticationError') {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please sign in again.';
      } else if (err?.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      analysisStartRef.current = null;

      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelAnalysis = () => {
    controller?.abort();
    setStatus('IDLE');
    setStep('idle');
    setLoading(false);
    toast({ title: 'Cancelled', description: 'Trend analysis has been cancelled.' });
  };

  const downloadCSV = () => {
    const rows: string[] = [];
    rows.push(['date', 'term', 'value'].join(','));
    (result?.timeline || []).forEach((p) => rows.push([p.date, p.term, String(p.value)].join(',')));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trend_analysis_${industry}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Format elapsed time
  const formatElapsed = (ms: number) => {
    if (ms >= 60000) {
      return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
    }
    return `${Math.round(ms / 1000)}s`;
  };

  // Get status icon
  const getStatusIcon = () => {
    switch (step) {
      case 'idle':
        return <Clock className="w-5 h-5 text-slate-400" />;
      case 'starting':
        return <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />;
      case 'polling':
        return <RefreshCw className="w-5 h-5 text-purple-500 animate-spin" />;
      case 'done':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-purple-950/20">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/40 dark:to-pink-900/40 text-purple-700 dark:text-purple-300 text-sm font-semibold shadow-sm">
            <TrendingUp className="w-4 h-4" />
            Trend Analysis Agent
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent leading-tight py-2">
            Analyze Market Trends
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            AI-powered trend analysis that uncovers market momentum, emerging narratives, and actionable insights in real-time.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Form - Left Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Configuration Card */}
            <Card className="border-2 shadow-xl sticky top-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-md">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Configure Analysis</CardTitle>
                    <CardDescription>Define your trend analysis parameters</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                {/* Industry Selection */}
                <div className="space-y-2">
                  <Label htmlFor="industry" className="text-sm font-semibold flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-500" />
                    Industry *
                  </Label>
                  <select
                    id="industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all text-sm"
                  >
                    <option value="">Select your industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Keywords Input */}
                <div className="space-y-2">
                  <Label htmlFor="keywords" className="text-sm font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-pink-500" />
                    Keywords *
                  </Label>
                  <Textarea
                    id="keywords"
                    placeholder="Enter keywords to analyze (comma or newline separated)&#10;e.g., AI automation, machine learning, predictive analytics"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    rows={5}
                    className="text-sm resize-none rounded-xl border-2"
                  />
                  <p className="text-xs text-slate-500">
                    {parsedKeywords.length} keyword{parsedKeywords.length !== 1 ? 's' : ''} detected
                  </p>
                </div>

                {/* Keywords Preview */}
                {parsedKeywords.length > 0 && (
                  <div className="rounded-xl border border-dashed border-purple-200 dark:border-purple-800 p-4 bg-purple-50/60 dark:bg-purple-950/20">
                    <div className="flex flex-wrap gap-2">
                      {parsedKeywords.slice(0, 8).map((kw) => (
                        <Badge
                          key={kw}
                          variant="secondary"
                          className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"
                        >
                          {kw}
                        </Badge>
                      ))}
                      {parsedKeywords.length > 8 && (
                        <Badge variant="outline" className="text-xs">
                          +{parsedKeywords.length - 8} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={handleStartAnalysis}
                    disabled={loading}
                    size="lg"
                    className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all rounded-xl"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Analyze Trends
                      </>
                    )}
                  </Button>

                  {loading && (
                    <Button
                      onClick={cancelAnalysis}
                      variant="outline"
                      size="sm"
                      className="w-full rounded-xl"
                    >
                      Cancel Analysis
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Status Card */}
            <Card className="border shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  {getStatusIcon()}
                  Analysis Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100 capitalize">
                      {status?.toLowerCase() || 'idle'}
                    </p>
                    <p className="text-xs text-slate-500">Status</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{attempt}</p>
                    <p className="text-xs text-slate-500">Attempts</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatElapsed(elapsed)}</p>
                    <p className="text-xs text-slate-500">Elapsed</p>
                  </div>
                </div>

                <Progress value={progress} className="h-2" />

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="ml-2">{error}</AlertDescription>
                  </Alert>
                )}

                {!error && step === 'polling' && elapsed > 60000 && (
                  <Alert className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-900">
                    <Info className="h-4 w-4 text-purple-600" />
                    <AlertDescription className="ml-2 text-sm text-purple-800 dark:text-purple-200">
                      <strong>Deep analysis in progress.</strong> Complex trend analysis can take several minutes.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section - Right Column */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Stats Overview */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <BarChart3 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{dataPointCount}</p>
                            <p className="text-xs text-purple-100">Data Points</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Target className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{keywordCount}</p>
                            <p className="text-xs text-pink-100">Keywords</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-rose-500 to-rose-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Flame className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{result.top_trends?.length || 0}</p>
                            <p className="text-xs text-rose-100">Trends</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-lg">
                            <Layers className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-2xl font-bold">{topSourcesTotal}</p>
                            <p className="text-xs text-emerald-100">Sources</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Search & Actions */}
                  <Card className="border-2 shadow-lg">
                    <CardContent className="p-5">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1 relative">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            placeholder="Search trends, spotlights, or sources..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-12 h-12 text-base rounded-xl border-2"
                          />
                        </div>
                        {result?.timeline?.length && (
                          <Button variant="outline" onClick={downloadCSV} className="rounded-xl">
                            <Download className="w-4 h-4 mr-2" />
                            Export CSV
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Momentum Spotlight */}
                  {totalSpotlights > 0 && activeSpotlight && (
                    <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl overflow-hidden">
                      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/40 dark:via-slate-950 dark:to-pink-950/30 p-6 space-y-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-purple-500 font-semibold">
                              Momentum Spotlight
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Surfacing the strongest narratives from {totalSpotlights} high-correlation signals.
                            </p>
                          </div>
                          {totalSpotlights > 1 && (
                            <div className="flex items-center gap-3 text-sm text-slate-500">
                              <span className="font-medium">
                                {spotlightIndex + 1}/{totalSpotlights}
                              </span>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => handleSpotlightNav(-1)} className="rounded-lg">
                                  <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="icon" onClick={() => handleSpotlightNav(1)} className="rounded-lg">
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          <div className="flex-1 space-y-3">
                            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white capitalize">
                              {activeSpotlight.title}
                            </h3>
                            {activeSpotlight.narrative && (
                              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
                                {activeSpotlight.narrative}
                              </p>
                            )}
                            {activeSpotlight.supportingTrends?.length ? (
                              <div className="flex flex-wrap gap-2">
                                {activeSpotlight.supportingTrends.map((trend) => (
                                  <Badge
                                    key={trend}
                                    variant="outline"
                                    className="bg-white/70 dark:bg-slate-900/50 border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-200"
                                  >
                                    {trend}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-28 h-28 rounded-full bg-white dark:bg-slate-900 shadow-inner shadow-purple-200 dark:shadow-purple-900/40 border-2 border-purple-200 dark:border-purple-800 flex flex-col items-center justify-center">
                              <span className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                                {activeSpotlight.score ? Number(activeSpotlight.score).toFixed(2) : 'Live'}
                              </span>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Momentum</p>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          {activeSpotlight.stats.map((stat) => (
                            <div
                              key={stat.label}
                              className="rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/40 p-4 shadow-sm"
                            >
                              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {stat.label}
                              </p>
                              <p className="text-xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  )}

                  {/* Timeline Chart */}
                  {timelineChartData.length > 0 && (
                    <Card className="border-2 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                              <LineChartIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">Trend Momentum Timeline</CardTitle>
                              <CardDescription>{timelineChartData.length} data points</CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                              <defs>
                                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4} />
                                  <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                              <XAxis
                                dataKey="date"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                tickMargin={8}
                                minTickGap={30}
                              />
                              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickMargin={8} width={40} />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: 12,
                                  borderColor: '#e9d5ff',
                                  backgroundColor: 'rgba(255,255,255,0.95)',
                                }}
                                formatter={(value: number) => [Math.round(value), 'Signal Strength']}
                              />
                              <Area
                                type="monotone"
                                dataKey="value"
                                stroke="#a855f7"
                                strokeWidth={2}
                                fill="url(#trendGradient)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Top Sources */}
                  {paginatedTopSources.length > 0 && (
                    <Card className="border-2 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 rounded-lg">
                            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">Top Sources</CardTitle>
                            <CardDescription>Curated sources validating these trends</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {paginatedTopSources.map((source, idx) => (
                          <div
                            key={`${source.url}-${source.title}-${idx}`}
                            className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                  {source.title || source.domain || 'Source'}
                                </h4>
                                <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-1">
                                  {source.domain && <span>{source.domain}</span>}
                                  {source.source && (
                                    <Badge variant="outline" className="text-[10px] uppercase">
                                      {source.source}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {source.final_score && (
                                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                    {source.final_score.toFixed(2)}
                                  </Badge>
                                )}
                                {source.url && (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <ExternalLink className="w-4 h-4 text-slate-400" />
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <PaginationControls
                          total={topSourcesTotal}
                          pageSize={TOP_SOURCES_PAGE_SIZE}
                          page={topSourcesPage}
                          onPageChange={setTopSourcesPage}
                          itemLabel="sources"
                        />
                      </CardContent>
                    </Card>
                  )}

                  {/* Insights */}
                  {result.insights && (
                    <Card className="border-2 shadow-lg">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                            <Brain className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">AI Insights</CardTitle>
                            <CardDescription>Generated analysis and recommendations</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-200 dark:border-slate-800 rounded-xl p-4 bg-slate-50 dark:bg-slate-900">
                          {typeof result.insights === 'string'
                            ? result.insights
                            : JSON.stringify(result.insights, null, 2)}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center min-h-[600px]"
                >
                  <div className="text-center space-y-6 max-w-md">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 shadow-lg">
                      <TrendingUp className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        Ready to Analyze Trends?
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                        Enter your industry and keywords to discover market momentum, emerging narratives, and actionable trend insights.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary" className="text-xs">Real-time Analysis</Badge>
                      <Badge variant="secondary" className="text-xs">Source Validation</Badge>
                      <Badge variant="secondary" className="text-xs">Momentum Scoring</Badge>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendAnalysisAgent;
