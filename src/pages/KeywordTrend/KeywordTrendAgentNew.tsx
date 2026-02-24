import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useToast } from '@/hooks/use-toast';
import {
  Sparkles,
  Search,
  TrendingUp,
  Download,
  Copy,
  Check,
  Loader2,
  BarChart3,
  Zap,
  Target,
  Filter,
  SortAsc,
  Grid3x3,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Activity,
  Lightbulb,
  Info,
} from 'lucide-react';
import { discoverKeywords, KeywordDiscoveryError } from '@/services/keywordDiscoveryApi';
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

type PaginationControlsProps = {
  total: number;
  pageSize: number;
  page: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;
};

const PaginationControls: React.FC<PaginationControlsProps> = ({ total, pageSize, page, onPageChange, itemLabel = 'items' }) => {
  if (total <= pageSize) return null;
  const totalPages = Math.ceil(total / pageSize);
  const start = page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 mt-3">
      <span>
        Showing {start}-{end} of {total} {itemLabel}
      </span>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <div className="text-slate-600 dark:text-slate-300">
          Page {page + 1} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={page + 1 >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const KeywordTrendAgentNew: React.FC = () => {
  const { toast } = useToast();
  
  // Form state
  const [industry, setIndustry] = useState('');
  const [usp, setUsp] = useState('');
  const [keyServices, setKeyServices] = useState('');
  
  // Discovery state
  const [discovering, setDiscovering] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  
  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(new Set());

  // Trend analysis state
  const [trendKeywordsInput, setTrendKeywordsInput] = useState('');
  const [trendLoading, setTrendLoading] = useState(false);
  const [trendStep, setTrendStep] = useState<'idle' | 'starting' | 'polling' | 'done' | 'error'>('idle');
  const [trendResult, setTrendResult] = useState<TrendsResult | null>(null);
  const [trendStatus, setTrendStatus] = useState<TrendsResult['status'] | 'IDLE'>('IDLE');
  const [trendAttempt, setTrendAttempt] = useState(0);
  const [trendElapsed, setTrendElapsed] = useState(0);
  const [trendError, setTrendError] = useState<string | null>(null);
  const [trendController, setTrendController] = useState<AbortController | null>(null);
  const [topSourcesPage, setTopSourcesPage] = useState(0);
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [trendInsightsQuery, setTrendInsightsQuery] = useState('');
  const analysisStartRef = useRef<number | null>(null);
  
  // Filtered keywords
  const filteredKeywords = useMemo(() => {
    if (!searchQuery.trim()) return keywords;
    const query = searchQuery.toLowerCase();
    return keywords.filter(kw => kw.toLowerCase().includes(query));
  }, [keywords, searchQuery]);

  const preparedKeywordsForTrends = useMemo(() => {
    if (selectedKeywords.size > 0) return Array.from(selectedKeywords);
    if (filteredKeywords.length > 0) return filteredKeywords;
    return [];
  }, [selectedKeywords, filteredKeywords]);

  const trendProgress = useMemo(() => {
    if (trendStep === 'idle') return 0;
    if (trendStep === 'starting') return 10;
    // 20 minutes = 1,200,000ms - progress bar fills gradually over this time
    if (trendStep === 'polling') return Math.min(95, 10 + Math.round((trendElapsed / 1200000) * 85));
    if (trendStep === 'done') return 100;
    return 5;
  }, [trendStep, trendElapsed]);

  useEffect(() => {
    setTopSourcesPage(0);
    setSpotlightIndex(0);
  }, [trendResult]);

  useEffect(() => {
    setSpotlightIndex(0);
  }, [trendInsightsQuery]);

  const TOP_SOURCES_PAGE_SIZE = 5;

  const topSourcesTotal = trendResult?.top_sources?.length ?? 0;
  const paginatedTopSources = useMemo(() => {
    if (!trendResult?.top_sources) return [];
    const start = topSourcesPage * TOP_SOURCES_PAGE_SIZE;
    return trendResult.top_sources.slice(start, start + TOP_SOURCES_PAGE_SIZE);
  }, [trendResult?.top_sources, topSourcesPage]);

  const timelineChartData = useMemo(() => {
    if (!trendResult?.timeline?.length) return [];
    const bucket = new Map<string, number>();
    trendResult.timeline.forEach((point) => {
      const safeDate = point?.date ? new Date(point.date).toISOString().slice(0, 10) : 'Unknown';
      const prev = bucket.get(safeDate) ?? 0;
      bucket.set(safeDate, prev + (isFinite(point.value) ? point.value : 0));
    });
    return Array.from(bucket.entries())
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([date, value]) => ({ date, value }));
  }, [trendResult?.timeline]);

  const trendSpotlights = useMemo(() => {
    if (!trendResult) return [];
    const keywordsInPlay = trendResult.keywords?.length ?? preparedKeywordsForTrends.length;
    const totalSources = trendResult.top_sources?.length ?? 0;
    const totalTrends = trendResult.top_trends?.length ?? 0;
    const topSignals = (trendResult.trend_items ?? [])
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
          supportingTrends: trendResult.top_trends?.slice(0, 8) ?? [],
          stats: [
            { label: 'Momentum Score', value: item?.correlation ? item.correlation.toFixed(2) : '—' },
            { label: 'Supporting Sources', value: item?.sources?.length ?? 0 },
            { label: 'Keywords In Play', value: keywordsInPlay },
          ],
          totals: { totalSources, totalTrends, keywordsInPlay },
        };
      });

    if (topSignals.length) return topSignals;

    if (trendResult.top_trends?.length) {
      return trendResult.top_trends.slice(0, 6).map((trend, idx) => ({
        id: `${trend}-${idx}`,
        title: trend,
        score: null,
        narrative: 'Emerging narrative detected across multiple sources',
        supportingTrends: trendResult.top_trends?.slice(0, 8) ?? [],
        stats: [
          { label: 'Trend Rank', value: `#${idx + 1}` },
          { label: 'Total Trend Signals', value: totalTrends },
          { label: 'Keywords In Play', value: keywordsInPlay },
        ],
        totals: { totalSources, totalTrends, keywordsInPlay },
      }));
    }
    return [];
  }, [trendResult, preparedKeywordsForTrends]);

  const filteredSpotlights = useMemo(() => {
    if (!trendInsightsQuery.trim()) return trendSpotlights;
    const query = trendInsightsQuery.toLowerCase();
    return trendSpotlights.filter((spotlight) => {
      const titleMatch = spotlight.title?.toLowerCase().includes(query);
      const narrativeMatch = spotlight.narrative?.toLowerCase().includes(query);
      const supportingMatch = spotlight.supportingTrends?.some((trend) => trend.toLowerCase().includes(query));
      return Boolean(titleMatch || narrativeMatch || supportingMatch);
    });
  }, [trendSpotlights, trendInsightsQuery]);

  const totalSpotlights = filteredSpotlights.length;
  const safeSpotlightIndex = totalSpotlights ? Math.min(spotlightIndex, totalSpotlights - 1) : 0;
  const activeSpotlight = totalSpotlights ? filteredSpotlights[safeSpotlightIndex] : null;
  const momentumExplanation = 'Momentum score reflects how strongly this phrase correlates with rising coverage across sources.';

  const trendSearchMatches = useMemo(() => {
    if (!trendResult?.trend_items || !trendInsightsQuery.trim()) return [];
    const query = trendInsightsQuery.toLowerCase();
    return trendResult.trend_items.filter((item) => {
      if (!item) return false;
      const phraseMatch = item.phrase?.toLowerCase().includes(query);
      const sourceMatch = item.sources?.some((source) =>
        Boolean(source?.title?.toLowerCase().includes(query) || source?.domain?.toLowerCase().includes(query))
      );
      return Boolean(phraseMatch || sourceMatch);
    });
  }, [trendResult?.trend_items, trendInsightsQuery]);

  const TREND_SEARCH_PREVIEW_COUNT = 5;
  const trendSearchPreview = trendSearchMatches.slice(0, TREND_SEARCH_PREVIEW_COUNT);
  const hasMoreTrendMatches = trendSearchMatches.length > trendSearchPreview.length;
  const handleSpotlightNav = (direction: number) => {
    if (!totalSpotlights) return;
    setSpotlightIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return totalSpotlights - 1;
      if (next >= totalSpotlights) return 0;
      return next;
    });
  };
  const dataPointCount = trendResult?.timeline?.length ?? trendResult?.trend_items?.length ?? 0;
  const keywordCount = trendResult?.keywords?.length ?? preparedKeywordsForTrends.length;

  const handleDiscoverKeywords = async () => {
    if (!industry || !usp.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please select an industry and enter your USP.',
        variant: 'destructive',
      });
      return;
    }

    setDiscovering(true);
    setKeywords([]);
    setTotalCount(0);
    setSelectedKeywords(new Set());

    try {
      const keyServicesArray = keyServices
        .split(/[,\n]/)
        .map(s => s.trim())
        .filter(Boolean);

      const result = await discoverKeywords({
        industry,
        usp,
        key_services: keyServicesArray,
      });

      setKeywords(result.unified_keywords);
      setTotalCount(result.total_count);

      toast({
        title: 'Keywords Discovered!',
        description: `Found ${result.total_count} relevant keywords for your business.`,
      });
    } catch (error) {
      console.error('Keyword discovery failed:', error);
      
      const errorMessage = error instanceof KeywordDiscoveryError
        ? error.message
        : 'Failed to discover keywords. Please try again.';

      toast({
        title: 'Discovery Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setDiscovering(false);
    }
  };

  const handleCopyKeyword = (keyword: string) => {
    navigator.clipboard.writeText(keyword);
    setCopiedKeyword(keyword);
    setTimeout(() => setCopiedKeyword(null), 2000);
  };

  const handleCopyAll = () => {
    const text = filteredKeywords.join('\n');
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${filteredKeywords.length} keywords copied to clipboard.`,
    });
  };

  const handleDownloadCSV = () => {
    const csv = filteredKeywords.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keywords-${industry}-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const toggleKeywordSelection = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleStartTrends = async () => {
    const keywordsFromInput = trendKeywordsInput
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);

    const keywordsForTrend = keywordsFromInput.length
      ? keywordsFromInput
      : preparedKeywordsForTrends;

    if (!industry || keywordsForTrend.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Provide an industry and at least one keyword for trend analysis.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setTrendLoading(true);
      setTrendStep('starting');
      setTrendResult(null);
      setTrendStatus('IDLE');
      setTrendAttempt(0);
      setTrendElapsed(0);
      setTrendError(null);
      trendController?.abort();
      const ctr = new AbortController();
      setTrendController(ctr);
      analysisStartRef.current = Date.now();

      const start = await keywordTrendApi.trendsStart({
        industry,
        keywords: keywordsForTrend,
      });
      
      // Debug logging - START Lambda response
      console.log('[KeywordTrend] START Lambda Response:', {
        hasJobId: !!start.job_id,
        status: start.status,
        message: start.message,
        hasTrendItems: !!start.trend_items?.length,
        hasTopSources: !!start.top_sources?.length,
        hasTopTrends: !!start.top_trends?.length,
        fullResponse: start
      });
      
      const resolvedStatus = start.status ?? 'COMPLETED';
      setTrendStatus(resolvedStatus);

      const jobInProgress = Boolean(start.job_id && resolvedStatus !== 'COMPLETED' && resolvedStatus !== 'FAILED');

      if (!jobInProgress) {
        console.log('[KeywordTrend] Result ready immediately, no polling needed');
        
        if (resolvedStatus === 'FAILED') {
          const message = start.message || 'Trend analysis failed. Please try again.';
          setTrendStep('error');
          setTrendError(message);
          toast({ title: 'Trend analysis failed', description: message, variant: 'destructive' });
          analysisStartRef.current = null;
          return;
        }

        // Set result immediately
        setTrendResult(start);
        setTrendStep('done');
        if (analysisStartRef.current) {
          setTrendElapsed(Date.now() - analysisStartRef.current);
          analysisStartRef.current = null;
        }
        setTrendAttempt(1);
        
        console.log('[KeywordTrend] Results set:', {
          trendItemsCount: start.trend_items?.length || 0,
          topSourcesCount: start.top_sources?.length || 0,
          topTrendsCount: start.top_trends?.length || 0
        });
        
        toast({ title: 'Trend analysis complete', description: `Found ${start.trend_items?.length || 0} trend signals and ${start.top_sources?.length || 0} sources.` });
        return;
      }

      if (start.job_id) {
        setTrendStep('polling');
        console.log(`[KeywordTrend] Job created: ${start.job_id}. Starting polling with 20-minute timeout...`);
        
        const final = await keywordTrendApi.pollUntilComplete(start.job_id, {
          intervalMs: 15000, // Poll every 15 seconds
          timeoutMs: 1200000, // 20 minutes total
          maxConsecutiveErrors: 10, // More tolerant of temporary errors
          onTick: (attempt, elapsed) => {
            setTrendAttempt(attempt);
            setTrendElapsed(elapsed);
            
            // Log progress every 4 attempts (every minute)
            if (attempt % 4 === 0) {
              const minutes = Math.floor(elapsed / 60000);
              console.log(`[KeywordTrend] Polling... ${minutes}m ${Math.round((elapsed % 60000) / 1000)}s elapsed, attempt ${attempt}`);
            }
          },
          onStatus: (status) => {
            setTrendStatus(status);
            console.log(`[KeywordTrend] STATUS Lambda update:`, { status, attempt: trendAttempt });
          },
          signal: ctr.signal,
          backoff: { enabled: true, factor: 1.5, maxIntervalMs: 30000, jitter: true },
        });
        
        console.log('[KeywordTrend] Polling complete! Results received:', {
          status: final.status,
          trendItemsCount: final.trend_items?.length || 0,
          topSourcesCount: final.top_sources?.length || 0,
          topTrendsCount: final.top_trends?.length || 0,
          executionTime: final.execution_time
        });
        
        setTrendResult(final);
        setTrendStep('done');
        setTrendStatus(final.status ?? 'COMPLETED');
        if (analysisStartRef.current) {
          setTrendElapsed(Date.now() - analysisStartRef.current);
          analysisStartRef.current = null;
        }
        
        const execTime = final.execution_time ? ` (${Math.round(final.execution_time)}s)` : '';
        toast({ 
          title: 'Trend analysis complete', 
          description: `Found ${final.trend_items?.length || 0} trend signals and ${final.top_sources?.length || 0} sources${execTime}.` 
        });
        return;
      }

      throw new Error('Trend API did not return a job_id for polling.');
    } catch (error: any) {
      console.error('Trend analysis failed:', error);
      setTrendStep('error');
      
      // Graceful error messages
      let errorMessage = 'An unexpected error occurred. Please try again.';
      let errorTitle = 'Analysis Failed';
      
      if (error?.name === 'TimeoutError' || error?.status === 504) {
        errorTitle = 'Backend Processing Timeout';
        errorMessage = error?.message || 'The backend API is taking too long to process this request. This typically happens when the analysis is very complex. The backend should be configured to return a job_id immediately and process the analysis asynchronously. Please contact support or try with fewer keywords.';
      } else if (error?.name === 'NetworkError') {
        errorTitle = 'Connection Issue';
        errorMessage = 'Unable to connect to the analysis service. Please check your internet connection and try again.';
      } else if (error?.name === 'AuthenticationError') {
        errorTitle = 'Authentication Required';
        errorMessage = 'Your session has expired. Please sign in again.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setTrendError(errorMessage);
      analysisStartRef.current = null;
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setTrendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Keyword Discovery & Trend Analysis
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight md:leading-snug py-1">
            Discover High-Impact Keywords
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Uncover the most relevant keywords for your business and analyze market trends to stay ahead of the competition.
          </p>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="discovery" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 h-12">
            <TabsTrigger value="discovery" className="text-base">
              <Target className="w-4 h-4 mr-2" />
              Keyword Discovery
            </TabsTrigger>
            <TabsTrigger value="trends" className="text-base">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trend Analysis
            </TabsTrigger>
          </TabsList>

          {/* Keyword Discovery Tab */}
          <TabsContent value="discovery" className="space-y-6">
            {/* Input Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50">
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Configure Your Search
                  </CardTitle>
                  <CardDescription>
                    Tell us about your business to discover the most relevant keywords
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Industry Selection */}
                    <div className="space-y-2">
                      <Label htmlFor="industry" className="text-base font-semibold">
                        Industry *
                      </Label>
                      <select
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 transition-all"
                      >
                        <option value="">Select your industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Key Services */}
                    <div className="space-y-2">
                      <Label htmlFor="keyServices" className="text-base font-semibold">
                        Key Services (Optional)
                      </Label>
                      <Input
                        id="keyServices"
                        placeholder="e.g., AI consulting, cloud migration"
                        value={keyServices}
                        onChange={(e) => setKeyServices(e.target.value)}
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-slate-500">Separate multiple services with commas</p>
                    </div>
                  </div>

                  {/* USP */}
                  <div className="space-y-2">
                    <Label htmlFor="usp" className="text-base font-semibold">
                      Unique Selling Proposition (USP) *
                    </Label>
                    <Textarea
                      id="usp"
                      placeholder="Describe what makes your business unique and valuable to customers..."
                      value={usp}
                      onChange={(e) => setUsp(e.target.value)}
                      rows={4}
                      className="text-base resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      Be specific about your unique value, target audience, and key differentiators
                    </p>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleDiscoverKeywords}
                    disabled={discovering}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    {discovering ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Discovering Keywords...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Discover Keywords
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Section */}
            <AnimatePresence>
              {keywords.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {/* Stats & Controls */}
                  <Card className="border-2 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Stats */}
                        <div className="flex items-center gap-6">
                          <div>
                            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                              {totalCount}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              Keywords Discovered
                            </div>
                          </div>
                          <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
                          <div>
                            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                              {filteredKeywords.length}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {searchQuery ? 'Filtered' : 'Showing'}
                            </div>
                          </div>
                          {selectedKeywords.size > 0 && (
                            <>
                              <div className="h-12 w-px bg-slate-200 dark:bg-slate-700" />
                              <div>
                                <div className="text-3xl font-bold text-pink-600 dark:text-pink-400">
                                  {selectedKeywords.size}
                                </div>
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                  Selected
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                          >
                            {viewMode === 'grid' ? (
                              <List className="w-4 h-4" />
                            ) : (
                              <Grid3x3 className="w-4 h-4" />
                            )}
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleCopyAll}>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy All
                          </Button>
                          <Button variant="outline" size="sm" onClick={handleDownloadCSV}>
                            <Download className="w-4 h-4 mr-2" />
                            Download CSV
                          </Button>
                        </div>
                      </div>

                      {/* Search Bar */}
                      <div className="mt-4 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          placeholder="Search keywords..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-12 h-12 text-base"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Keywords Display */}
                  <Card className="border-2 shadow-lg">
                    <CardContent className="p-6">
                      {filteredKeywords.length === 0 ? (
                        <div className="text-center py-12">
                          <Filter className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                          <p className="text-slate-500 dark:text-slate-400">
                            No keywords match your search
                          </p>
                        </div>
                      ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {filteredKeywords.map((keyword, index) => (
                            <motion.div
                              key={keyword}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.01 }}
                              className={`group relative p-4 rounded-lg border-2 transition-all cursor-pointer ${
                                selectedKeywords.has(keyword)
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900'
                              }`}
                              onClick={() => toggleKeywordSelection(keyword)}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-1">
                                  {keyword}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopyKeyword(keyword);
                                  }}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                                >
                                  {copiedKeyword === keyword ? (
                                    <Check className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4 text-slate-400" />
                                  )}
                                </button>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredKeywords.map((keyword, index) => (
                            <motion.div
                              key={keyword}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.01 }}
                              className={`group flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                selectedKeywords.has(keyword)
                                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                              }`}
                              onClick={() => toggleKeywordSelection(keyword)}
                            >
                              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                {keyword}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopyKeyword(keyword);
                                }}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                              >
                                {copiedKeyword === keyword ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4 text-slate-400" />
                                )}
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Empty State */}
            {!discovering && keywords.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 mb-6">
                  <Lightbulb className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ready to Discover Keywords?
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Fill in your industry and USP above to generate a comprehensive list of relevant keywords for your business.
                </p>
              </motion.div>
            )}
          </TabsContent>

          {/* Trend Analysis Tab */}
          <TabsContent value="trends" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-2 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    Launch Trend Analysis
                  </CardTitle>
                  <CardDescription>
                    Provide any additional keywords (or use discovered ones) and start the trends API flow
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Industry *</Label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800 transition-all"
                      >
                        <option value="">Select industry</option>
                        {INDUSTRIES.map((ind) => (
                          <option key={ind} value={ind}>
                            {ind}
                          </option>
                        ))}
                      </select>
                      <p className="text-xs text-slate-500">
                        Trend API requires the same industry context as keyword discovery.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">Manual Keywords (Optional)</Label>
                      <Textarea
                        placeholder="Paste keywords to override or extend the discovered list"
                        value={trendKeywordsInput}
                        onChange={(e) => setTrendKeywordsInput(e.target.value)}
                        rows={4}
                        className="text-base resize-none"
                      />
                      <p className="text-xs text-slate-500">
                        Separate by comma or newline. Leave blank to use selected/discovered keywords.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-dashed border-purple-200 dark:border-purple-800 p-4 bg-purple-50/60 dark:bg-purple-950/20">
                    <div className="flex flex-wrap gap-2">
                      {preparedKeywordsForTrends.slice(0, 12).map((kw) => (
                        <Badge key={kw} variant="secondary" className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
                          {kw}
                        </Badge>
                      ))}
                      {preparedKeywordsForTrends.length === 0 && (
                        <span className="text-sm text-slate-500">
                          No keywords selected yet. Discover keywords or paste some manually above.
                        </span>
                      )}
                    </div>
                    {preparedKeywordsForTrends.length > 12 && (
                      <p className="text-xs text-slate-500 mt-2">+{preparedKeywordsForTrends.length - 12} more keywords will be included.</p>
                    )}
                  </div>

                  <Button
                    onClick={handleStartTrends}
                    disabled={trendLoading}
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all"
                  >
                    {trendLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Starting Trend Analysis...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Analyze Trends
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4" />
                  Trend Analysis Status
                </CardTitle>
                <CardDescription>
                  Live status from the trend API—works instantly or polls when needed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Status</p>
                    <p className="text-lg font-semibold text-slate-800 dark:text-slate-100 capitalize">
                      {trendStatus?.toLowerCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Attempts</p>
                    <p className="text-lg font-semibold">{trendAttempt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Elapsed</p>
                    <p className="text-lg font-semibold">
                      {trendElapsed >= 60000 
                        ? `${Math.floor(trendElapsed / 60000)}m ${Math.round((trendElapsed % 60000) / 1000)}s`
                        : `${Math.round(trendElapsed / 1000)}s`
                      }
                    </p>
                  </div>
                </div>
                <Progress value={trendProgress} className="h-3" />
                {trendError && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{trendError}</AlertDescription>
                  </Alert>
                )}
                {!trendError && trendStep === 'idle' && (
                  <p className="text-sm text-slate-500">
                    Start an analysis to see real-time status updates here.
                  </p>
                )}
                {!trendError && trendStep === 'polling' && trendElapsed > 60000 && (
                  <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="ml-2 text-sm text-blue-800 dark:text-blue-200">
                      <strong>Deep analysis in progress.</strong> Complex trend analysis can take several minutes. 
                      The system will wait up to 20 minutes to ensure comprehensive results.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <AnimatePresence>
              {trendResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="border-2 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        Trend Insights
                      </CardTitle>
                      <CardDescription>
                        {dataPointCount} signal{dataPointCount === 1 ? '' : 's'} · {keywordCount} keyword{keywordCount === 1 ? '' : 's'} analyzed
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {trendResult.message && (
                        <Alert>
                          <AlertDescription>{trendResult.message}</AlertDescription>
                        </Alert>
                      )}
                      <div className="space-y-3">
                        <div className="relative max-w-lg">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <Input
                            placeholder="Search trends, spotlights, or sources..."
                            value={trendInsightsQuery}
                            onChange={(e) => setTrendInsightsQuery(e.target.value)}
                            className="pl-12 h-12 text-base"
                          />
                        </div>
                        {trendInsightsQuery && (
                          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/40 p-4 space-y-3">
                            <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                              <span>Search results</span>
                              <Badge variant="secondary" className="text-[0.65rem]">
                                {trendSearchMatches.length} match{trendSearchMatches.length === 1 ? '' : 'es'}
                              </Badge>
                            </div>
                            {trendSearchPreview.length ? (
                              <div className="space-y-2">
                                {trendSearchPreview.map((item, idx) => (
                                  <div
                                    key={`${item?.phrase ?? 'trend'}-${idx}`}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-white/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/40 p-3"
                                  >
                                    <div>
                                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 capitalize">
                                        {item?.phrase ?? 'Trend signal'}
                                      </p>
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {(item?.sources?.length ?? 0)} curated source{(item?.sources?.length ?? 0) === 1 ? '' : 's'} ·
                                        {' '}
                                        {typeof item?.count === 'number' ? `${item.count} mentions` : 'live momentum'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      {typeof item?.correlation === 'number' ? (
                                        <p className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                                          {item.correlation.toFixed(2)}
                                        </p>
                                      ) : (
                                        <p className="text-xs text-slate-500">—</p>
                                      )}
                                      <p className="text-[0.65rem] uppercase tracking-wide text-slate-400">Momentum</p>
                                    </div>
                                  </div>
                                ))}
                                {hasMoreTrendMatches && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">
                                    +{trendSearchMatches.length - trendSearchPreview.length} more signal{trendSearchMatches.length - trendSearchPreview.length === 1 ? '' : 's'} match your search.
                                  </p>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                No trend signals match “{trendInsightsQuery}”. Try another keyword.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      {totalSpotlights > 0 && activeSpotlight ? (
                        <div className="rounded-3xl border border-purple-100 dark:border-purple-900/40 bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/40 dark:via-slate-950 dark:to-pink-950/30 p-6 space-y-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                              <p className="text-xs uppercase tracking-[0.2em] text-purple-500">Momentum spotlight</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">Surfacing the strongest narratives from {totalSpotlights} high-correlation signals.</p>
                            </div>
                            {totalSpotlights > 1 && (
                              <div className="flex items-center gap-3 text-sm text-slate-500">
                                <span>
                                  {spotlightIndex + 1}/{totalSpotlights}
                                </span>
                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="icon" onClick={() => handleSpotlightNav(-1)}>
                                    <ChevronLeft className="w-4 h-4" />
                                  </Button>
                                  <Button variant="outline" size="icon" onClick={() => handleSpotlightNav(1)}>
                                    <ChevronRight className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col md:flex-row md:items-center gap-6">
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-1 text-xs uppercase tracking-wide text-purple-500">
                                <span>Spotlight</span>
                                <span className="text-purple-400">#{spotlightIndex + 1}</span>
                              </div>
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
                                    <Badge key={trend} variant="outline" className="bg-white/70 dark:bg-slate-900/50 border-purple-200 dark:border-purple-900/50 text-purple-700 dark:text-purple-200">
                                      {trend}
                                    </Badge>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                            <div className="flex flex-col items-center gap-3 text-center">
                              <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-900 shadow-inner shadow-purple-200 dark:shadow-purple-900/40 border-2 border-purple-200 dark:border-purple-800 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-purple-600 dark:text-purple-300">
                                  {activeSpotlight.score ? Number(activeSpotlight.score).toFixed(2) : 'Live'}
                                </span>
                                <p className="text-xs uppercase tracking-wide text-slate-500">Momentum</p>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs">{momentumExplanation}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {activeSpotlight.totals.totalSources} sources · {activeSpotlight.totals.totalTrends} trend signals
                              </p>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            {activeSpotlight.stats.map((stat) => (
                              <div key={stat.label} className="rounded-2xl border border-white/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/40 p-4 shadow-sm">
                                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {trendInsightsQuery
                            ? `No spotlights match “${trendInsightsQuery}”.`
                            : 'No spotlight data available for these keywords.'}
                        </p>
                      )}
                      {timelineChartData.length ? (
                        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500">Trend momentum</p>
                              <p className="text-base font-semibold text-slate-800 dark:text-slate-100">Timeline overview</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {timelineChartData.length} pts
                            </Badge>
                          </div>
                          <div className="h-60">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={timelineChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="trendLine" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.9} />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.2} />
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="date"
                                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                                  tickMargin={8}
                                  minTickGap={20}
                                />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={8} width={40} />
                                <Tooltip
                                  contentStyle={{ borderRadius: 12, borderColor: '#cbd5f5' }}
                                  formatter={(value: number) => [Math.round(value), 'Signal']}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke="url(#trendLine)"
                                  strokeWidth={3}
                                  dot={false}
                                  activeDot={{ r: 6 }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ) : null}
                      {!timelineChartData.length && (
                        <p className="text-sm text-slate-500">No timeline data returned for these keywords.</p>
                      )}
                      {trendResult.insights && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Insights</h4>
                          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border border-slate-200 dark:border-slate-800 rounded-lg p-3 bg-slate-50 dark:bg-slate-900">
                            {typeof trendResult.insights === 'string' ? trendResult.insights : JSON.stringify(trendResult.insights, null, 2)}
                          </div>
                        </div>
                      )}
                      {paginatedTopSources.length ? (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Top Sources</h4>
                          <div className="space-y-2">
                            {paginatedTopSources.map((source, idx) => (
                              <div key={`${source.url}-${source.title}`} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{source.title || source.domain || 'Source'}</span>
                                  {source.final_score && (
                                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{source.final_score.toFixed(2)}</span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500 flex flex-wrap gap-2 mt-1">
                                  {source.domain && <span>{source.domain}</span>}
                                  {source.source && <span className="uppercase tracking-wide">{source.source}</span>}
                                </div>
                                {source.url && (
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-purple-600 dark:text-purple-300 underline mt-1 inline-block"
                                  >
                                    View source
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                          <PaginationControls
                            total={topSourcesTotal}
                            pageSize={TOP_SOURCES_PAGE_SIZE}
                            page={topSourcesPage}
                            onPageChange={setTopSourcesPage}
                            itemLabel="sources"
                          />
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-16 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-3xl"
                >
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 mb-6">
                    <TrendingUp className="w-10 h-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No trend results yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                    Launch an analysis to visualize timeline scores and insights for your selected keywords.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default KeywordTrendAgentNew;
