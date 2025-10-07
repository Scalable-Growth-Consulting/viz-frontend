import React, { useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSEOGeo } from '../services/seoAnalyzer';
import { useAWSLambdaAnalysis } from '../hooks/useAWSLambdaAnalysis';
import type { AnalysisInput, AnalysisResult } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, FileDown, Image as ImageIcon, Loader2, RefreshCcw, Sparkles, Globe2, Target, Users, Brain, Zap, Rocket, TrendingUp, Eye, Star, X, RotateCcw, AlertCircle, CheckCircle, Clock, Info } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useCompetitorKeywords } from '../hooks/useCompetitorKeywords';
import { useRecommendations } from '../hooks/useRecommendations';
import { analyzeKeywordOverlap, type CompetitorKeywords } from '../utils/keywordOverlap';

const GlassPill = ({ label, value, color, icon }: { label: string; value: number; color: string; icon: React.ReactNode }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -2 }}
    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 shadow-lg"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
    <div className="relative flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
      </div>
      <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{value}</div>
    </div>
  </motion.div>
);

// Enhanced Glass Pill with KPI Marker
const GlassPillWithMarker = ({ label, value, color, icon, kpi }: { label: string; value: number; color: string; icon: React.ReactNode; kpi: keyof typeof kpiDefinitions }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-900/40 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 p-4 shadow-lg"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
      <div className="relative flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
            {icon}
          </div>
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        </div>
        <div className="text-2xl font-black bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{value}</div>
      </div>
      <div className="flex justify-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-110"
          title="Click to learn more about this KPI"
        >
          <Info className="w-3 h-3" />
        </button>
      </div>
      <KPIModalPopup kpi={kpi} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </motion.div>
  );
};

function ModernScoreDial({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: 'url(#modernGrad)' }];
  const bg = [{ name: 'bg', value: 100, fill: 'rgba(148,163,184,0.1)' }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart innerRadius="60%" outerRadius="90%" data={bg} startAngle={90} endAngle={-270}>
          <RadialBar minPointSize={15} dataKey="value" cornerRadius={12} background />
          <RadialBar dataKey="value" data={data} cornerRadius={12} />
          <defs>
            <linearGradient id="modernGrad" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
            {score}
          </div>
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            AI Score
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, description, icon }: { title: string; description?: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-base font-semibold">{title}</h3>
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}

// KPI Definitions Data
const kpiDefinitions = {
  overallScore: {
    title: "Overall Score",
    definition: "A comprehensive AI-powered score combining SEO (Search Engine Optimization) and GEO (Generative Engine Optimization) metrics.",
    formula: "(SEO_Score × 10 + GEO_Score) ÷ 2",
    details: [
      "SEO Score: Technical optimization (0-10 scale)",
      "GEO Score: AI visibility & authority (0-100 scale)",
      "Combined using weighted average for balanced assessment"
    ]
  },
  seoScore: {
    title: "SEO Score",
    definition: "Technical Search Engine Optimization score measuring on-page optimization factors.",
    formula: "Based on canonical tags, internal linking, content quality, and technical implementation",
    details: [
      "Canonical URL optimization",
      "Internal link structure",
      "Content quality and relevance",
      "Technical SEO implementation"
    ]
  },
  geoScore: {
    title: "GEO Score",
    definition: "Generative Engine Optimization score measuring AI visibility, citations, and brand authority.",
    formula: "AI_Visibility_Rate + Citation_Frequency + Brand_Mention_Score + Authority_Signals",
    details: [
      "AI visibility in search results",
      "Citation frequency and quality",
      "Brand mention analysis",
      "Authority and credibility signals"
    ]
  },
  visibility: {
    title: "Visibility Score",
    definition: "Measures how easily search engines can discover and index your content.",
    formula: "(Canonical_Score + Link_Score + H1_Count) ÷ 3",
    details: [
      "Canonical URL implementation",
      "Internal linking structure",
      "Header tag optimization (H1)",
      "Crawl accessibility"
    ]
  },
  trust: {
    title: "Trust Score",
    definition: "Evaluates the authority and credibility signals of your content.",
    formula: "(Structured_Data_Score + Authority_Signals) ÷ 2",
    details: [
      "Schema markup implementation",
      "Authority and credibility signals",
      "Brand reputation factors",
      "Content authenticity"
    ]
  },
  relevance: {
    title: "Relevance Score",
    definition: "Assesses how well your content matches user intent and search queries.",
    formula: "(Content_Score + Contextual_Relevance) ÷ 2",
    details: [
      "Content quality and depth",
      "Contextual relevance to queries",
      "User intent alignment",
      "Topic coverage completeness"
    ]
  }
};

// Elegant KPI Info Popup Component - Modal overlay for main window
function KPIModalPopup({ kpi, isOpen, onClose }: { kpi: keyof typeof kpiDefinitions; isOpen: boolean; onClose: () => void }) {
  const definition = kpiDefinitions[kpi];

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-10 sm:pt-16 bg-black/30"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 rounded-3xl shadow-2xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                {definition.title}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                {definition.definition}
              </p>

              <div className="p-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Formula</div>
                <div className="text-sm font-mono text-violet-700 dark:text-violet-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg border">
                  {definition.formula}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Key Components</div>
                <ul className="space-y-1">
                  {definition.details.map((detail, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg"
              >
                Got it
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// Elegant KPI Info Popup Component - Opens within card
function KPIPopup({ kpi, isOpen, onClose, position }: { kpi: keyof typeof kpiDefinitions; isOpen: boolean; onClose: () => void; position?: 'header' | 'inline' }) {
  const definition = kpiDefinitions[kpi];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0, y: -10 }}
        animate={{ opacity: 1, height: 'auto', y: 0 }}
        exit={{ opacity: 0, height: 0, y: -10 }}
        transition={{ type: "spring", duration: 0.3 }}
        className="overflow-hidden"
      >
        <div className="bg-gradient-to-br from-violet-50/90 to-purple-50/90 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-400/30 rounded-2xl p-4 mt-3 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-violet-600 dark:text-violet-400">
                {definition.title}
              </h4>
              <button
                onClick={onClose}
                className="p-1 hover:bg-violet-100 dark:hover:bg-violet-800/50 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {definition.definition}
            </p>

            <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-violet-200/30 dark:border-violet-400/30">
              <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 mb-1">Formula</div>
              <div className="text-xs font-mono text-violet-700 dark:text-violet-300">
                {definition.formula}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Components</div>
              <ul className="space-y-1">
                {definition.details.map((detail, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-1 h-1 bg-violet-400 rounded-full flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Elegant Marker Component - always opens site-wide modal
function KPIMarker({ kpi, className = "" }: { kpi: keyof typeof kpiDefinitions; className?: string; position?: 'header' | 'inline' | 'modal' }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600 text-white shadow-lg transition-all duration-300 hover:scale-110 ${className}`}
        title="Click to learn more about this KPI"
      >
        <Info className="w-3 h-3" />
      </button>
      <KPIModalPopup kpi={kpi} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

export const SEOGeoChecker: React.FC = () => {
  const [input, setInput] = useState<AnalysisInput>({ competitors: [] });
  const [activeTab, setActiveTab] = useState('input');
  const [useCloudAnalysis, setUseCloudAnalysis] = useState(true);
  const [searchParams] = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // AWS Lambda integration
  const {
    loading: awsLoading,
    analyzing: awsAnalyzing,
    currentJob,
    result: awsResult,
    error: awsError,
    progress,
    startAnalysis: startAWSAnalysis,
    cancelAnalysis,
    clearResults: clearAWSResults,
    validateUrl,
    retryAnalysis,
  } = useAWSLambdaAnalysis();
  
  // Local analysis state (fallback)
  const [localLoading, setLocalLoading] = useState(false);
  const [localResult, setLocalResult] = useState<AnalysisResult | null>(null);
  
  // Determine which result to use
  const result = useCloudAnalysis ? awsResult : localResult;
  const loading = useCloudAnalysis ? awsLoading : localLoading;
  const analyzing = useCloudAnalysis ? awsAnalyzing : localLoading;

  // Trigger competitor keywords fetch for the completed job when viewing the report
  const jobId = (currentJob?.job_id || (currentJob as any)?.jobId || '') as string;
  const { data: compData, loading: compLoading, error: compError, refetch: refetchComp } = useCompetitorKeywords(jobId, {
    enabled: useCloudAnalysis && activeTab === 'report' && Boolean(jobId),
    retries: 3,
    timeoutMs: 15000,
    delayMsBeforeFirstTry: 2000,
    competitors: input.competitors || [],
    submitBeforeFetch: true,
    postOnly: true,
  });

  // Recommendations (Priority Quick Wins, Growth Opportunities) via Lambda: POST /recom/{jobId}
  const { data: recomData, loading: recomLoading, error: recomError, refetch: refetchRecom } = useRecommendations(jobId, {
    enabled: useCloudAnalysis && activeTab === 'report' && Boolean(jobId),
    timeoutMs: 15000,
    retries: 2,
    delayMsBeforeFirstTry: 1000,
    method: 'POST',
  });

  const lambdaQuickWins = React.useMemo(() => {
    const arr = recomData?.recommendations?.priority_quick_wins;
    return Array.isArray(arr) ? arr : [];
  }, [recomData]);
  const lambdaGrowthOpps = React.useMemo(() => {
    const arr = recomData?.recommendations?.growth_opportunities;
    return Array.isArray(arr) ? arr : [];
  }, [recomData]);

  // Build site keywords from analysis result.
  // Fallback for cloud results where keywordDensity is empty: derive tokens from title/meta/primary keyword.
  const siteKeywords: string[] = useMemo(() => {
    if (!result) return [];
    const densityTerms = Array.isArray(result.onPage?.keywordDensity) && result.onPage.keywordDensity.length > 0
      ? (result.onPage.keywordDensity as any[]).map((k: any) => String(k?.term || ''))
      : [];

    const fallbackTokens = () => {
      const STOPWORDS = new Set<string>([
        'the','and','is','to','in','of','a','for','on','with','this','that','by','as','from','it','at','be','or','an','are','we','you','your','our','us','their','they','he','she','them','its','but','if','will','can','about','more','all','not','out','up','so','what','when','how','why'
      ]);
      const text = [input.primaryKeyword || '', result.onPage?.title || '', result.onPage?.metaDescription || '']
        .join(' ');
      const tokens = text.match(/[A-Za-z0-9]+/g) || [];
      // Filter short tokens and stopwords, uniq, cap length
      const uniq = Array.from(new Set(tokens.filter((w) => w.length > 2 && !STOPWORDS.has(w.toLowerCase()))));
      return uniq.slice(0, 60);
    };

    const base = densityTerms.length ? densityTerms : fallbackTokens();
    return Array.from(new Set(base)).filter(Boolean);
  }, [result, input.primaryKeyword]);

  // Normalize competitor response into { domain, keywords[] }
  const competitorList: CompetitorKeywords[] = useMemo(() => {
    const domains = (input.competitors || [])
      .map((u) => (u || '').trim())
      .filter(Boolean)
      .map((u) => {
        try { const url = new URL(/^https?:\/\//i.test(u) ? u : `https://${u}`); return url.hostname.replace(/^www\./, ''); } catch { return u.replace(/^https?:\/\//i, '').replace(/^www\./, ''); }
      });

    const list: CompetitorKeywords[] = [];
    // Flexible parsing of compData shapes
    const pushItem = (domain: string, keywords: any) => {
      const arr = Array.isArray(keywords) ? keywords.map(String) : [];
      if (domain) list.push({ domain, keywords: arr });
    };

    if (compData && typeof compData === 'object') {
      // Case: { results: [{ domain, keywords }] }
      if (Array.isArray((compData as any).results)) {
        for (const it of (compData as any).results) pushItem(String(it.domain || ''), it.keywords);
      }
      // Case: { items: [{ domain, keywords }] }
      if (Array.isArray((compData as any).items)) {
        for (const it of (compData as any).items) pushItem(String(it.domain || ''), it.keywords);
      }
      // Case: { keywordsByDomain: { domain: string[] } }
      if ((compData as any).keywordsByDomain && typeof (compData as any).keywordsByDomain === 'object') {
        const map = (compData as any).keywordsByDomain as Record<string, string[]>;
        for (const d of Object.keys(map)) pushItem(d, map[d]);
      }
      // Case: { data: { domain, keywords } } or { data: [{...}] }
      if ((compData as any).data) {
        const data = (compData as any).data;
        if (Array.isArray(data)) {
          for (const it of data) pushItem(String(it?.domain || ''), it?.keywords);
        } else if (data && typeof data === 'object') {
          if (Array.isArray((data as any).items)) {
            for (const it of (data as any).items) pushItem(String(it?.domain || ''), it?.keywords);
          } else if ((data as any).domain && Array.isArray((data as any).keywords)) {
            pushItem(String((data as any).domain), (data as any).keywords);
          }
        }
      }
      // Case: { domain, keywords } single
      if ((compData as any).domain && Array.isArray((compData as any).keywords)) {
        pushItem(String((compData as any).domain), (compData as any).keywords);
      }
    }

    // Ensure all requested domains appear, even if no keywords yet
    for (const d of domains) {
      if (!list.find((x) => x.domain === d)) list.push({ domain: d, keywords: [] });
    }
    return list;
  }, [compData, input.competitors]);

  // Compute overlap only when we have site keywords and any competitor domains
  const overlapByDomain = useMemo(() => {
    if (!siteKeywords.length || !competitorList.length) return {} as Record<string, { overlap: string[]; competitorOnly: string[]; siteOnly: string[] }>;
    return analyzeKeywordOverlap(siteKeywords, competitorList);
  }, [siteKeywords, competitorList]);

  // Auto-switch to results tab when analysis completes and URL has tab=report
  React.useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'report' && result && !analyzing && !loading) {
      setActiveTab('report');
    }
  }, [searchParams, result, analyzing, loading]);

  const canAnalyze = useMemo(() => {
    if (useCloudAnalysis) {
      // Cloud analysis requires a valid URL
      return Boolean(input.url && input.url.trim().length > 0 && validateUrl(input.url.trim()).isValid);
    } else {
      // Local analysis can use URL or raw HTML
      return Boolean((input.url && input.url.trim().length > 0) || (input.rawHtml && input.rawHtml.trim().length > 0));
    }
  }, [input.url, input.rawHtml, useCloudAnalysis, validateUrl]);
  
  const urlValidation = useMemo(() => {
    if (!input.url || input.url.trim().length === 0) {
      return { isValid: true }; // Don't show error for empty URL
    }
    return validateUrl(input.url.trim());
  }, [input.url, validateUrl]);

  const handleAnalyze = async () => {
    if (useCloudAnalysis) {
      // Use AWS Lambda for analysis
      try {
        await startAWSAnalysis(input, () => {
          // Switch to report tab when analysis completes
          setActiveTab('report');
        });
      } catch (error) {
        console.error('AWS analysis failed:', error);
      }
    } else {
      // Use local analysis as fallback
      try {
        setLocalLoading(true);
        const res = await analyzeSEOGeo(input);
        setLocalResult(res);
        setActiveTab('report');
      } catch (e: any) {
        toast({ title: 'Analysis failed', description: e?.message || 'Unable to analyze the page', variant: 'destructive' });
      } finally {
        setLocalLoading(false);
      }
    }
  };
  
  const handleCancelAnalysis = async () => {
    if (useCloudAnalysis) {
      await cancelAnalysis();
    }
  };
  
  const handleClearResults = () => {
    if (useCloudAnalysis) {
      clearAWSResults();
    } else {
      setLocalResult(null);
    }
    setActiveTab('input');
  };
  
  const handleRetryAnalysis = async () => {
    if (useCloudAnalysis) {
      await retryAnalysis();
    } else {
      await handleAnalyze();
    }
  };

  const handleSaveImage = async () => {
    if (!containerRef.current) return;
    toast({ title: 'Capturing Image...', description: 'Creating your visual report' });
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all text is rendered properly
          const textElements = clonedDoc.querySelectorAll('*');
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            if (computedStyle.webkitBackgroundClip === 'text') {
              htmlEl.style.webkitBackgroundClip = 'unset';
              htmlEl.style.backgroundClip = 'unset';
              htmlEl.style.color = computedStyle.color || '#1f2937';
            }
          });
        }
      });
      
      const link = document.createElement('a');
      link.download = 'master-seo-geo-report.png';
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
      
      toast({ title: "Image saved successfully!" });
    } catch (error) {
      console.error('Error saving image:', error);
      toast({ title: "Error saving image", variant: "destructive" });
    }
  };

  const handleExportPDF = async () => {
    if (!containerRef.current) return;
    toast({ title: 'Generating PDF...', description: 'Creating your AI-powered report' });
    
    try {
      const canvas = await html2canvas(containerRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (clonedDoc) => {
          // Ensure all text is rendered properly
          const textElements = clonedDoc.querySelectorAll('*');
          textElements.forEach(el => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);
            if (computedStyle.webkitBackgroundClip === 'text') {
              htmlEl.style.webkitBackgroundClip = 'unset';
              htmlEl.style.backgroundClip = 'unset';
              htmlEl.style.color = computedStyle.color || '#1f2937';
            }
          });
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 190;
      const pageHeight = 277;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 10;
      
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('master-seo-geo-report.pdf');
      toast({ title: "PDF exported successfully!" });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({ title: "Error exporting PDF", variant: "destructive" });
    }
  };


  const recommendedTitle = useMemo(() => {
    if (!result) return '';
    const pk = (input.primaryKeyword || '').trim();
    const base = result.onPage.title || '';
    const brand = new URL(result.url || window.location.href).hostname.replace('www.', '');
    if (pk) return `${pk} | ${brand}`.slice(0, 64);
    if (base) return `${base} | ${brand}`.slice(0, 64);
    return `Your ${brand} | Official Site`.slice(0, 64);
  }, [result, input.primaryKeyword]);

  const recommendedDescription = useMemo(() => {
    if (!result) return '';
    const pk = (input.primaryKeyword || '').trim();
    const benefits = ['fast', 'reliable', 'trusted', 'affordable', 'award-winning'];
    const msg = pk
      ? `Discover ${pk} — ${benefits[0]} and ${benefits[1]}. Get started today.`
      : `Discover what makes us ${benefits[0]} and ${benefits[1]}. Get started today.`;
    return msg.slice(0, 155);
  }, [result, input.primaryKeyword]);

  return (
    <div className="w-full max-w-none space-y-6 sm:space-y-8">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-center mb-6 sm:mb-8">
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-indigo-500/10 backdrop-blur-sm border border-violet-200/20 dark:border-purple-400/20 rounded-2xl p-1">
            <TabsTrigger 
              value="input" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Strategy
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="input">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative overflow-hidden bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-900/50 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-indigo-500/5 pointer-events-none" />
              <CardHeader className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-2 sm:p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg"
                  >
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      Launch Analysis
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      Unleash the power of Master SEO and GEO
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="relative space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Globe2 className="w-4 h-4 text-violet-500" />
                        Website URL
                      </label>
                      <Input 
                        placeholder="https://your-awesome-site.com" 
                        value={input.url || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, url: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-violet-200/50 dark:border-purple-400/30 rounded-xl focus:border-violet-400 dark:focus:border-purple-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-purple-500" />
                        Target Market
                      </label>
                      <Input 
                        placeholder="e.g., San Francisco, CA" 
                        value={input.targetMarket || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, targetMarket: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-indigo-400/30 rounded-xl focus:border-purple-400 dark:focus:border-indigo-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        Primary Keyword
                      </label>
                      <Input 
                        placeholder="e.g., AI-powered marketing tools" 
                        value={input.primaryKeyword || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, primaryKeyword: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-indigo-200/50 dark:border-violet-400/30 rounded-xl focus:border-indigo-400 dark:focus:border-violet-400 transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="space-y-4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-purple-500" />
                        Raw HTML (optional)
                      </label>
                      <Textarea 
                        rows={6} 
                        placeholder="Paste your page's HTML for maximum AI precision..." 
                        value={input.rawHtml || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, rawHtml: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-purple-200/50 dark:border-indigo-400/30 rounded-xl focus:border-purple-400 dark:focus:border-indigo-400 transition-all duration-300 resize-none"
                      />
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                >
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Users className="w-4 h-4 text-indigo-500" />
                      Competitor Analysis
                    </label>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-violet-600 text-white border-0 rounded-full px-3 py-1">
                      Up to 3 rivals
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {[0,1,2].map((idx)=> (
                      <Input 
                        key={idx} 
                        placeholder={`https://competitor-${idx+1}.com`} 
                        value={(input.competitors?.[idx] || '')} 
                        onChange={(e)=> {
                          const list = [...(input.competitors||[])];
                          list[idx] = e.target.value;
                          setInput((s)=> ({ ...s, competitors: list }));
                        }}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-indigo-200/50 dark:border-violet-400/30 rounded-xl focus:border-indigo-400 dark:focus:border-violet-400 transition-all duration-300"
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Analysis Mode Toggle */}
                <motion.div 
                  className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                >
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Analysis Mode:</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="analysisMode"
                        checked={useCloudAnalysis}
                        onChange={() => setUseCloudAnalysis(true)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Cloud AI (Recommended)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="analysisMode"
                        checked={!useCloudAnalysis}
                        onChange={() => setUseCloudAnalysis(false)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Local Analysis</span>
                    </label>
                  </div>
                </motion.div>

                {/* URL Validation Error */}
                {useCloudAnalysis && input.url && !urlValidation.isValid && (
                  <Alert className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-400/30 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                      <strong>Invalid URL:</strong> {urlValidation.error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Progress Bar for Cloud Analysis */}
                {useCloudAnalysis && analyzing && (
                  <motion.div 
                    className="space-y-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-400/30"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600 animate-pulse" />
                        <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                          {currentJob?.status === 'pending' && 'Queuing analysis...'}
                          {currentJob?.status === 'queued' && 'Starting analysis...'}
                          {currentJob?.status === 'fetched' && 'Content retrieved...'}
                          {currentJob?.status === 'processing' && 'Analyzing SEO & GEO signals...'}
                          {!currentJob && 'Initializing...'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    {currentJob?.job_id && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Job ID: {currentJob.job_id}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Error Display */}
                {useCloudAnalysis && awsError && (
                  <Alert className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200/50 dark:border-red-400/30 rounded-xl">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <AlertDescription className="text-sm text-red-700 dark:text-red-300">
                      <strong>Analysis Failed:</strong> {awsError}
                    </AlertDescription>
                  </Alert>
                )}

                <motion.div 
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                >
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={()=> setInput({ competitors: [] })}
                      className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex-shrink-0"
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Reset
                    </Button>
                    
                    {result && (
                      <Button 
                        variant="outline" 
                        onClick={handleClearResults}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-gray-200/50 dark:border-gray-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex-shrink-0"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Clear Results
                      </Button>
                    )}
                    
                    {useCloudAnalysis && awsError && (
                      <Button 
                        variant="outline" 
                        onClick={handleRetryAnalysis}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-orange-200/50 dark:border-orange-600/50 rounded-xl hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 flex-shrink-0"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Retry
                      </Button>
                    )}
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 sm:flex-initial"
                  >
                    {analyzing ? (
                      <Button 
                        onClick={handleCancelAnalysis}
                        variant="destructive"
                        className="w-full sm:w-auto rounded-xl px-6 sm:px-8 py-3 font-bold text-base sm:text-lg shadow-2xl transition-all duration-300"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                        Cancel Analysis
                      </Button>
                    ) : (
                      <Button 
                        disabled={!canAnalyze || loading} 
                        onClick={handleAnalyze} 
                        className="w-full sm:w-auto bg-gradient-to-r from-violet-500 via-purple-600 to-indigo-600 hover:from-violet-600 hover:via-purple-700 hover:to-indigo-700 text-white border-0 rounded-xl px-6 sm:px-8 py-3 font-bold text-base sm:text-lg shadow-2xl transition-all duration-300"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Launch Analysis
                            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </motion.div>
                </motion.div>

                <Alert className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-2 border-violet-200/50 dark:border-purple-400/30 rounded-xl">
                  <Sparkles className="w-4 h-4 text-violet-500" />
                  <AlertDescription className="text-sm text-violet-700 dark:text-violet-300">
                    <strong>Pro Tip:</strong> {useCloudAnalysis ? 'Cloud AI analysis provides the most comprehensive SEO & GEO insights using advanced algorithms.' : 'For maximum AI precision, paste raw HTML from your CMS or crawler.'}
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="report">
          {!result ? (
            <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">No report yet. Run an analysis from the Input tab.</CardContent>
            </Card>
          ) : (
            <div ref={containerRef} className="space-y-4 sm:space-y-6 p-2 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-bold">SEO & GEO Scorecard</h2>
                  <p className="text-xs text-muted-foreground break-all sm:break-normal">{result.url || 'HTML input'} • Computed {new Date(result.computedAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveImage} className="gap-2 w-full sm:w-auto">
                    <ImageIcon className="w-4 h-4" /> Save Image
                  </Button>
                  <Button size="sm" onClick={handleExportPDF} className="gap-2 w-full sm:w-auto">
                    <FileDown className="w-4 h-4" /> Export PDF
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="col-span-1 bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader className="pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold">Overall Score</CardTitle>
                        <CardDescription className="text-xs">0 – 100</CardDescription>
                      </div>
                      <div className="flex flex-col items-end">
                        <KPIMarker kpi="overallScore" position="header" className="mb-1" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-4xl font-extrabold text-slate-800 dark:text-white drop-shadow-lg bg-white/80 dark:bg-slate-800/80 rounded-full w-20 h-20 flex items-center justify-center backdrop-blur-sm border-2 border-violet-200 dark:border-violet-400">{result.overallScore}</div>
                      </div>
                      <ModernScoreDial score={result.overallScore} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-2 bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-viz-medium/90 dark:to-viz-dark/90 border border-slate-200/60 dark:border-viz-light/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                        <TrendingUp className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          Performance Pillars
                        </CardTitle>
                        <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                          Core metrics driving your SEO & GEO success
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <GlassPillWithMarker
                        label="Visibility"
                        value={result.pillars.visibility}
                        color="from-violet-400 to-violet-600"
                        icon={<Eye className="w-4 h-4 text-white" />}
                        kpi="visibility"
                      />
                      <GlassPillWithMarker
                        label="Trust"
                        value={result.pillars.trust}
                        color="from-purple-400 to-purple-600"
                        icon={<Star className="w-4 h-4 text-white" />}
                        kpi="trust"
                      />
                      <GlassPillWithMarker
                        label="Relevance"
                        value={result.pillars.relevance}
                        color="from-indigo-400 to-indigo-600"
                        icon={<Target className="w-4 h-4 text-white" />}
                        kpi="relevance"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>


              {/* NLP-based Overlap Analysis (moved below score cards) */}
              {/* Placeholder removed here; card inserted after score cards grid */}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-viz-medium/90 dark:to-viz-dark/90 border border-violet-200/50 dark:border-violet-400/30 shadow-xl backdrop-blur-sm h-full flex flex-col">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            On-Page SEO Analysis
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            Technical optimization metrics
                          </CardDescription>
                        </div>
                        <KPIMarker kpi="seoScore" position="header" />
                      </div>
                    </CardHeader>

                    {/* SEO Score Card */}
                    <CardContent className="space-y-6 flex-1">
                      <div className="flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50/90 to-purple-50/90 dark:from-violet-900/30 dark:to-purple-900/30 backdrop-blur-xl border border-violet-200/50 dark:border-violet-400/30 p-6 shadow-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/10 to-purple-400/10 pointer-events-none" />
                          <div className="relative text-center">
                            <div className="text-sm font-semibold text-violet-600 dark:text-violet-400 mb-2">SEO Score</div>
                            <div className="text-4xl font-black bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                              {Math.round(result.seoScoreOutOf10 * 10 || 0)}
                            </div>
                            <div className="text-xs text-violet-500 dark:text-violet-400 mt-1">out of 100</div>
                          </div>
                        </motion.div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                          <div className="text-xs font-medium text-violet-600 dark:text-violet-400 mb-1">Title Length</div>
                          <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{result.onPage.titleLength}</div>
                          <div className="text-xs text-violet-500 dark:text-violet-400">characters</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-400/30">
                          <div className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-1">Meta Description</div>
                          <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{result.onPage.metaDescriptionLength}</div>
                          <div className="text-xs text-purple-500 dark:text-purple-400">characters</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="text-center p-3 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200/50 dark:border-indigo-400/30">
                          <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{result.onPage.h1Count}</div>
                          <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">H1</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                          <div className="text-lg font-bold text-violet-600 dark:text-violet-400">{result.onPage.h2Count}</div>
                          <div className="text-xs text-violet-700 dark:text-violet-300 font-medium">H2</div>
                        </div>
                        <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-purple-400/30">
                          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{result.onPage.h3Count}</div>
                          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">H3</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-400/30">
                          <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Word Count</div>
                          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{result.onPage.wordCount}</div>
                          <div className="text-xs text-emerald-500 dark:text-emerald-400">words</div>
                        </div>
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30">
                          <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Images</div>
                          <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{result.onPage.imageCount}</div>
                          <div className="text-xs text-blue-500 dark:text-blue-400">{result.onPage.imageCount ? Math.round(100*result.onPage.imagesWithAlt/result.onPage.imageCount) : 100}% alt coverage</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 rounded-xl border border-slate-200/50 dark:border-slate-600/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${result.onPage.schemaPresent ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className="text-sm font-medium">Schema Markup</span>
                        </div>
                        <span className="text-sm font-semibold">{result.onPage.schemaPresent ? 'Present' : 'Missing'}</span>
                      </div>

                      {result.onPage.pageSpeed && (
                        <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-xl border border-orange-200/50 dark:border-orange-400/30">
                          <div className="text-center">
                            <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{result.onPage.pageSpeed.performance}</div>
                            <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Performance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{result.onPage.pageSpeed.lcp?.toFixed ? result.onPage.pageSpeed.lcp.toFixed(2) : result.onPage.pageSpeed.lcp}</div>
                            <div className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">LCP</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{result.onPage.pageSpeed.cls}</div>
                            <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">CLS</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="h-full"
                >
                  <Card className="bg-gradient-to-br from-white/95 to-violet-50/95 dark:from-viz-medium/90 dark:to-violet-900/20 border border-violet-200/50 dark:border-violet-400/30 shadow-xl backdrop-blur-sm h-full flex flex-col">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Generative AI Engine Optimization
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            AI visibility, citations & brand authority
                          </CardDescription>
                        </div>
                        <KPIMarker kpi="geoScore" position="header" />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-8 flex-1">
                      {/* GEO Score Card */}
                      <div className="flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-900/30 dark:to-indigo-900/30 backdrop-blur-xl border border-purple-200/50 dark:border-purple-400/30 p-6 shadow-lg"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10 pointer-events-none" />
                          <div className="relative text-center">
                            <div className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-2">GEO Score</div>
                            <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                              {result.geoScoreOutOf100 || 0}
                            </div>
                            <div className="text-xs text-purple-500 dark:text-purple-400 mt-1">out of 100</div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-violet-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-violet-50/90 to-purple-50/90 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl border border-violet-200/50 dark:border-violet-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl">
                                <Eye className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{result.geo.aiVisibilityRate}</div>
                            </div>
                            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300 mb-1">AI Visibility Rate</div>
                            <div className="text-xs text-violet-600 dark:text-violet-400">Content structure optimization</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-purple-50/90 to-indigo-50/90 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-2xl border border-purple-200/50 dark:border-purple-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                                <Star className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{result.geo.citationFrequency}</div>
                            </div>
                            <div className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1">Citation Frequency</div>
                            <div className="text-xs text-purple-600 dark:text-purple-400">Factual data & statistics</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-indigo-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-indigo-50/90 to-blue-50/90 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-2xl border border-indigo-200/50 dark:border-indigo-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl">
                                <Target className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{result.geo.brandMentionScore}</div>
                            </div>
                            <div className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">Brand Mention Score</div>
                            <div className="text-xs text-indigo-600 dark:text-indigo-400">Authority & credibility signals</div>
                          </div>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                          className="relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 rounded-2xl"></div>
                          <div className="relative p-6 bg-gradient-to-br from-emerald-50/90 to-teal-50/90 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/30 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                              <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                                <Sparkles className="w-4 h-4 text-white" />
                              </div>
                              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{result.geo.sentimentAccuracy}</div>
                            </div>
                            <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 mb-1">Sentiment Accuracy</div>
                            <div className="text-xs text-emerald-600 dark:text-emerald-400">Positive messaging analysis</div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Advanced AI Metrics</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-xl border border-violet-200/50 dark:border-violet-400/30">
                            <div className="text-2xl font-bold text-violet-600 dark:text-violet-400 mb-1">{result.geo.structuredDataScore}</div>
                            <div className="text-xs text-violet-700 dark:text-violet-300 font-medium">Structured Data</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl border border-purple-200/50 dark:border-indigo-400/30">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">{result.geo.contextualRelevance}</div>
                            <div className="text-xs text-purple-700 dark:text-purple-300 font-medium">Contextual Relevance</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-xl border border-indigo-200/50 dark:border-violet-400/30">
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{result.geo.authoritySignals}</div>
                            <div className="text-xs text-indigo-700 dark:text-indigo-300 font-medium">Authority Signals</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-400/30">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{result.geo.conversationalOptimization}</div>
                            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">Conversational AI</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{result.geo.factualAccuracy}</div>
                            <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">Factual Accuracy</div>
                          </div>
                          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border border-orange-200/50 dark:border-orange-400/30">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">{result.geo.topicCoverage}</div>
                            <div className="text-xs text-orange-700 dark:text-orange-300 font-medium">Topic Coverage</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {false && (
              <div className="mt-8">
                <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                  <CardHeader>
                    <SectionHeader title="Competitors" description="Keyword overlap estimate" icon={<Users className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="text-xs space-y-3">
                    {/* Loading state for competitor keywords fetch */}
                    {compLoading && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Fetching competitor keywords...
                      </div>
                    )}

                    {/* Error state */}
                    {!compLoading && compError && (
                      <div className="space-y-2">
                        <Alert>
                          <AlertDescription className="text-xs text-red-600">{compError}</AlertDescription>
                        </Alert>
                        <div>
                          <Button size="sm" variant="outline" onClick={() => refetchComp()}>Retry</Button>
                        </div>
                      </div>
                    )}

                    {/* Show returned keywords if available (from parsed competitorList) */}
                    {!compLoading && !compError && competitorList.some((c) => c.keywords.length > 0) && (
                      <div className="space-y-4">
                        <div className="font-medium">Competitor Keywords</div>
                        {competitorList.map((c) => (
                          <div key={c.domain} className="space-y-2">
                            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">{c.domain}</div>
                            <ul className="flex flex-wrap gap-2">
                              {c.keywords.slice(0, 60).map((kw) => (
                                <li key={`${c.domain}-${kw}`} className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] border">
                                  {kw}
                                </li>
                              ))}
                              {c.keywords.length === 0 && (
                                <li className="text-muted-foreground">No keywords returned yet</li>
                              )}
                            </ul>

                            {/* Compact overlap summary within Competitors card */}
                            {siteKeywords.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {(() => {
                                  const ov = (overlapByDomain as any)[c.domain] || { overlap: [], competitorOnly: [], siteOnly: [] };
                                  const Chip = (w: string, cls: string) => (
                                    <span key={`${c.domain}-ov-${w}`} className={`px-2 py-0.5 rounded border text-[11px] ${cls}`}>{w}</span>
                                  );
                                  return (
                                    <>
                                      <div>
                                        <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">Common</div>
                                        <div className="flex flex-wrap gap-1">
                                          {ov.overlap.slice(0, 15).map((w: string) => Chip(w, 'bg-blue-50 dark:bg-blue-900/30 border-blue-200/60 dark:border-blue-800/50 text-blue-700 dark:text-blue-300'))}
                                          {ov.overlap.length === 0 && <span className="text-muted-foreground">—</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">Competitor Only</div>
                                        <div className="flex flex-wrap gap-1">
                                          {ov.competitorOnly.slice(0, 15).map((w: string) => Chip(w, 'bg-amber-50 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-800/50 text-amber-700 dark:text-amber-300'))}
                                          {ov.competitorOnly.length === 0 && <span className="text-muted-foreground">—</span>}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Site Only</div>
                                        <div className="flex flex-wrap gap-1">
                                          {ov.siteOnly.slice(0, 15).map((w: string) => Chip(w, 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'))}
                                          {ov.siteOnly.length === 0 && <span className="text-muted-foreground">—</span>}
                                        </div>
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Fallback to overlap visualization from local result if available */}
                    {!compLoading && !compError && (!competitorList.some((c)=>c.keywords.length) ) && result.offPage.competitorKeywordOverlap?.length ? (
                      <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={result.offPage.competitorKeywordOverlap}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="competitor" hide tick={{ fontSize: 10 }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Bar dataKey="overlap" fill="#60a5fa" radius={[6,6,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : null}

                    {/* Empty state */}
                    {!compLoading && !compError && (!result.offPage.competitorKeywordOverlap?.length && !competitorList.some((c)=>c.keywords.length)) && (
                      <div className="text-muted-foreground">No competitor data yet.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
              )}

              {/* Keyword Overlap (NLP) — placed below score cards, above Quick Wins */}
              <div className="mt-8">
                <Card className="bg-gradient-to-br from-white/95 to-slate-50/95 dark:from-viz-medium/90 dark:to-viz-dark/90 border border-slate-200/60 dark:border-viz-light/20 shadow-xl">
                  <CardHeader className="pb-4">
                    <SectionHeader title="Keyword Overlap (NLP)" description="Full-word comparison of site vs competitors" icon={<Users className="w-4 h-4" />} />
                  </CardHeader>
                  <CardContent className="text-xs space-y-5">
                    {compLoading ? (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing keywords...
                      </div>
                    ) : competitorList.length === 0 ? (
                      <div className="text-muted-foreground">Add competitor domains to see overlap.</div>
                    ) : (
                      <div className="space-y-6">
                        {competitorList.map((c, i) => {
                          const ov = (overlapByDomain as any)[c.domain] || { overlap: [], competitorOnly: [], siteOnly: [] };
                          const total = (ov.overlap?.length || 0) + (ov.competitorOnly?.length || 0) + (ov.siteOnly?.length || 0);
                          const pct = total ? Math.round((ov.overlap.length / total) * 100) : 0;
                          const Chip = (w: string, cls: string) => (
                            <span key={`${c.domain}-${w}`} className={`px-2.5 py-1 rounded-full border text-[11px] shadow-sm ${cls}`}>{w}</span>
                          );
                          return (
                            <div key={c.domain} className="p-4 rounded-2xl border bg-gradient-to-br from-white to-slate-50 dark:from-slate-900/40 dark:to-slate-800/40">
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="text-sm font-semibold">{c.domain}</div>
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded-full text-[11px] border bg-blue-50/70 dark:bg-blue-900/30 border-blue-200/60 dark:border-blue-800/50 text-blue-700 dark:text-blue-300">{pct}% overlap</span>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] border bg-slate-50 dark:bg-slate-800 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">{ov.overlap.length} common</span>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] border bg-amber-50/60 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-800/50 text-amber-700 dark:text-amber-300">{ov.competitorOnly.length} gaps</span>
                                  <span className="px-2 py-0.5 rounded-full text-[11px] border bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300">{ov.siteOnly.length} owned</span>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 mb-1">Common</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ov.overlap.slice(0, 60).map((w: string) => Chip(w, 'bg-blue-50 dark:bg-blue-900/30 border-blue-200/60 dark:border-blue-800/50 text-blue-700 dark:text-blue-300'))}
                                    {ov.overlap.length === 0 && <span className="text-muted-foreground">—</span>}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1">Competitor Only</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ov.competitorOnly.slice(0, 60).map((w: string) => Chip(w, 'bg-amber-50 dark:bg-amber-900/30 border-amber-200/60 dark:border-amber-800/50 text-amber-700 dark:text-amber-300'))}
                                    {ov.competitorOnly.length === 0 && <span className="text-muted-foreground">—</span>}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mb-1">Site Only</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ov.siteOnly.slice(0, 60).map((w: string) => Chip(w, 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200/60 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300'))}
                                    {ov.siteOnly.length === 0 && <span className="text-muted-foreground">—</span>}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Card className="bg-gradient-to-br from-white/95 to-emerald-50/95 dark:from-viz-medium/90 dark:to-emerald-900/20 border border-emerald-200/50 dark:border-emerald-400/30 shadow-xl backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
                          <Zap className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Priority Quick Wins
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            High-impact optimizations to implement first
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScrollArea className="h-[420px] pr-2">
                        <div className="space-y-4">
                          {recomLoading && (
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Loading quick wins...
                            </div>
                          )}
                          {!recomLoading && recomError && (
                            <div className="space-y-2">
                              <Alert>
                                <AlertDescription className="text-xs text-red-600">{recomError}</AlertDescription>
                              </Alert>
                              <Button size="sm" variant="outline" onClick={() => refetchRecom()}>Retry</Button>
                            </div>
                          )}
                          {!recomLoading && !recomError && lambdaQuickWins.length > 0 && (
                            <div className="space-y-3">
                              {lambdaQuickWins.map((item: any, i: number) => (
                                <motion.div
                                  key={item.id || i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.05 * i }}
                                  className="p-4 rounded-xl border bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200/50 dark:border-emerald-400/30"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1.5">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-bold">{i + 1}</span>
                                        <div className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">{item.title || 'Quick win'}</div>
                                      </div>
                                      {item.description && (
                                        <div className="text-xs text-emerald-800/80 dark:text-emerald-200/80 leading-relaxed">{item.description}</div>
                                      )}
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {'impact_score' in item && (
                                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-700">Impact: {item.impact_score}</Badge>
                                        )}
                                        {'effort_score' in item && (
                                          <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200 border-teal-200/60 dark:border-teal-700">Effort: {item.effort_score}</Badge>
                                        )}
                                        {item.estimated_time && (
                                          <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-200">ETA: {item.estimated_time}</Badge>
                                        )}
                                        {item.area && (
                                          <Badge variant="outline" className="border-teal-300 text-teal-700 dark:text-teal-200">Area: {item.area}</Badge>
                                        )}
                                      </div>
                                      {item.implementation && (
                                        <div className="text-[11px] text-emerald-800/70 dark:text-emerald-200/70 mt-1"><span className="font-semibold">Steps:</span> {item.implementation}</div>
                                      )}
                                      {item.evidence && (
                                        <div className="text-[11px] text-emerald-800/70 dark:text-emerald-200/70"><span className="font-semibold">Evidence:</span> {item.evidence}</div>
                                      )}
                                    </div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {/* Fallback to local result quick fixes if Lambda has none */}
                          {!recomLoading && !recomError && lambdaQuickWins.length === 0 && (result.topQuickFixes || []).length > 0 && (
                            <div className="space-y-3">
                              {(result.topQuickFixes || []).map((f, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.1 * i }}
                                  className="group p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl border border-emerald-200/50 dark:border-emerald-400/30 hover:shadow-lg transition-all duration-300"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {i + 1}
                                    </div>
                                    <div className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{f}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <Card className="bg-gradient-to-br from-white/95 to-blue-50/95 dark:from-viz-medium/90 dark:to-blue-900/20 border border-blue-200/50 dark:border-blue-400/30 shadow-xl backdrop-blur-sm">
                    <CardHeader className="pb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Growth Opportunities
                          </CardTitle>
                          <CardDescription className="text-sm text-slate-600 dark:text-slate-400">
                            Strategic improvements for long-term success
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ScrollArea className="h-[420px] pr-2">
                        <div className="space-y-4">
                          {recomLoading && (
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-sm">
                              <Loader2 className="w-4 h-4 animate-spin" /> Loading growth opportunities...
                            </div>
                          )}
                          {!recomLoading && recomError && (
                            <div className="space-y-2">
                              <Alert>
                                <AlertDescription className="text-xs text-red-600">{recomError}</AlertDescription>
                              </Alert>
                              <Button size="sm" variant="outline" onClick={() => refetchRecom()}>Retry</Button>
                            </div>
                          )}
                          {!recomLoading && !recomError && lambdaGrowthOpps.length > 0 && (
                            <div className="space-y-3">
                              {lambdaGrowthOpps.map((item: any, i: number) => (
                                <motion.div
                                  key={item.id || i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.05 * i }}
                                  className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200/50 dark:border-blue-400/30"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 text-white text-xs font-bold">{i + 1}</span>
                                      <div className="text-sm font-semibold text-blue-800 dark:text-blue-200">{item.title || 'Growth opportunity'}</div>
                                    </div>
                                    {item.description && (
                                      <div className="text-xs text-blue-800/80 dark:text-blue-200/80 leading-relaxed">{item.description}</div>
                                    )}
                                    <div className="flex flex-wrap gap-2 mt-1">
                                      {'impact_score' in item && (
                                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200 border-blue-200/60 dark:border-blue-700">Impact: {item.impact_score}</Badge>
                                      )}
                                      {'effort_score' in item && (
                                        <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-200/60 dark:border-indigo-700">Effort: {item.effort_score}</Badge>
                                      )}
                                      {item.estimated_time && (
                                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-200">ETA: {item.estimated_time}</Badge>
                                      )}
                                      {item.area && (
                                        <Badge variant="outline" className="border-indigo-300 text-indigo-700 dark:text-indigo-200">Area: {item.area}</Badge>
                                      )}
                                      {item.expected_outcome && (
                                        <Badge variant="outline" className="border-slate-300 text-slate-700 dark:text-slate-200">Outcome: {item.expected_outcome}</Badge>
                                      )}
                                    </div>
                                    {item.strategy_steps && (
                                      <div className="text-[11px] text-blue-800/70 dark:text-blue-200/70 mt-1"><span className="font-semibold">Strategy:</span> {item.strategy_steps}</div>
                                    )}
                                    {item.evidence && (
                                      <div className="text-[11px] text-blue-800/70 dark:text-blue-200/70"><span className="font-semibold">Evidence:</span> {item.evidence}</div>
                                    )}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}

                          {/* Fallback to local result opportunities if Lambda has none */}
                          {!recomLoading && !recomError && lambdaGrowthOpps.length === 0 && (result.missedOpportunities || []).length > 0 && (
                            <div className="space-y-3">
                              {(result.missedOpportunities || []).map((m, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.1 * i }}
                                  className="group p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30 hover:shadow-lg transition-all duration-300"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {i + 1}
                                    </div>
                                    <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{m}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader>
                  <SectionHeader title="AI: Rewrite Meta Tags" description="Instant suggestions based on your primary keyword (no API key required)" icon={<Sparkles className="w-4 h-4" />} />
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <label className="text-xs text-muted-foreground">Recommended Title (≤ 65 chars)</label>
                    <Input value={recommendedTitle} readOnly className="mt-1" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Recommended Meta Description (≤ 155 chars)</label>
                    <Textarea value={recommendedDescription} readOnly className="mt-1" rows={3} />
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-[11px] text-muted-foreground">
                Generated by <span className="font-semibold">MIA</span>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {!result ? (
            <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">Run an analysis first to ask AI about the report.</CardContent>
            </Card>
          ) : (
            <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle>Ask AI About This Report</CardTitle>
                <CardDescription>Freemium gating placeholder — can require signup/upgrade later.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Alert>
                  <AlertDescription className="text-xs">This MVP does not call any external AI API by default. We can wire this to your backend or OpenAI later.</AlertDescription>
                </Alert>
                <p>Suggested prompts:</p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>"Give me a prioritized SEO action plan for this page by effort vs. impact"</li>
                  <li>"Generate 5 blog topics to rank for our primary keyword and city"</li>
                  <li>"What schema types should we add and why?"</li>
                </ul>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
