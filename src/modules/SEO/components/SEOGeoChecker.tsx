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
import { ArrowRight, FileDown, Image as ImageIcon, Loader2, RefreshCcw, Sparkles, Globe2, Target, Users, Brain, Zap, Rocket, TrendingUp, Eye, Star, X, RotateCcw, AlertCircle, CheckCircle, Clock, Info, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from '@/components/ui/use-toast';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useCompetitorKeywords } from '../hooks/useCompetitorKeywords';
import { useRecommendations } from '../hooks/useRecommendations';
import { analyzeKeywordOverlap, type CompetitorKeywords } from '../utils/keywordOverlap';
import { ScoreSection } from './ScoreSection';
import { buildSEOSections, buildGEOSections } from '../utils/buildScoreSections';
import { KPIDefinitionsDialog } from './KPIDefinitionsDialog';
import { SEO_DEFINITIONS, GEO_DEFINITIONS, PILLAR_DEFINITIONS } from '../utils/kpiDefinitions';

// Circular Score Gauge Component (Wireframe Style)
const CircularScore = ({ score, label }: { score: number; label: string }) => {
  const circumference = 2 * Math.PI * 80;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 70 ? '#06b6d4' : score >= 40 ? '#3b82f6' : '#6366f1';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-48 h-48">
        <svg className="transform -rotate-90 w-48 h-48">
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="96"
            cy="96"
            r="80"
            stroke={color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl font-black" style={{ color }}>{score}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">{label}</p>
    </div>
  );
};

// Performance Pillar Card (Wireframe Style)
const PillarCard = ({ title, score, maxScore, color, icon }: { title: string; score: number; maxScore: number; color: string; icon: React.ReactNode }) => {
  const percentage = (score / maxScore) * 100;
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">{title}</h3>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black`} style={{ color }}>{score}</span>
            <span className="text-sm text-slate-500">{percentage.toFixed(0)}% of {maxScore}</span>
          </div>
        </div>
        <div className={`p-2 rounded-lg`} style={{ backgroundColor: `${color}20` }}>
          {icon}
        </div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </motion.div>
  );
};

// Enhanced Glass Pill with KPI Marker (supports external expand control)
const GlassPillWithMarker = ({ label, value, color, icon, kpi, externalExpand }: { label: string; value: number; color: string; icon: React.ReactNode; kpi: keyof typeof kpiDefinitions; externalExpand?: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Sync with external expand/collapse all
  React.useEffect(() => {
    if (typeof externalExpand === 'boolean') {
      setIsExpanded(externalExpand);
    }
  }, [externalExpand]);

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03, y: -5 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/95 via-white/70 to-white/50 dark:from-gray-800/95 dark:via-gray-800/70 dark:to-gray-900/50 backdrop-blur-3xl border-2 border-white/40 dark:border-cyan-400/30 p-5 shadow-2xl transition-all duration-500 hover:shadow-3xl hover:border-cyan-400/50"
    >
      {/* Animated glow effect */}
      <motion.div 
        className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-cyan-500/20 blur-2xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent pointer-events-none" />
      
      <button type="button" onClick={() => setIsExpanded(!isExpanded)} className="relative w-full text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 flex-1">
            <motion.div 
              className={`p-3 rounded-2xl bg-gradient-to-br ${color} shadow-xl`}
              whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.15 }}
              transition={{ duration: 0.5 }}
            >
              {icon}
            </motion.div>
            <div className="flex-1">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 block mb-1">{label}</span>
              <div className="text-4xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">{value}</div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-6 h-6 text-cyan-500" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-cyan-200/30 dark:border-cyan-700/30 pt-4 mt-2"
          >
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {kpiDefinitions[kpi]?.definition || 'Detailed metrics and insights'}
              </p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-medium shadow-lg transition-all duration-300 hover:scale-105"
              >
                <Info className="w-4 h-4" />
                Learn More
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <KPIModalPopup kpi={kpi} isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </motion.div>
  );
};

function ModernScoreDial({ score }: { score: number }) {
  const data = [{ name: 'Score', value: score, fill: 'url(#modernGrad)' }];
  const bg = [{ name: 'bg', value: 100, fill: 'rgba(148,163,184,0.1)' }];

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={220}>
        <RadialBarChart innerRadius="58%" outerRadius="92%" data={bg} startAngle={90} endAngle={-270}>
          <RadialBar minPointSize={15} dataKey="value" cornerRadius={14} background />
          <RadialBar dataKey="value" data={data} cornerRadius={14} />
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
          <div className="text-5xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent drop-shadow-sm">
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
              <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
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

              <div className="p-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 rounded-xl border border-cyan-200/50 dark:border-cyan-400/30">
                <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Formula</div>
                <div className="text-sm font-mono text-cyan-700 dark:text-cyan-300 bg-white/50 dark:bg-gray-800/50 p-2 rounded-lg border">
                  {definition.formula}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Key Components</div>
                <ul className="space-y-1">
                  {definition.details.map((detail, index) => (
                    <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full flex-shrink-0" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-lg"
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
        <div className="bg-gradient-to-br from-cyan-50/90 to-blue-50/90 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200/50 dark:border-cyan-400/30 rounded-2xl p-4 mt-3 shadow-lg">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                {definition.title}
              </h4>
              <button
                onClick={onClose}
                className="p-1 hover:bg-cyan-100 dark:hover:bg-cyan-800/50 rounded-lg transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              {definition.definition}
            </p>

            <div className="p-2 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-cyan-200/30 dark:border-cyan-400/30">
              <div className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 mb-1">Formula</div>
              <div className="text-xs font-mono text-cyan-700 dark:text-cyan-300">
                {definition.formula}
              </div>
            </div>

            <div>
              <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Components</div>
              <ul className="space-y-1">
                {definition.details.map((detail, index) => (
                  <li key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                    <div className="w-1 h-1 bg-cyan-400 rounded-full flex-shrink-0" />
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
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-white shadow-lg transition-all duration-300 hover:scale-110 ${className}`}
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
  // Pillars expand/collapse control (default collapsed)
  const [pillarsExpandAll, setPillarsExpandAll] = useState<boolean>(false);
  
  // KPI Definitions Dialog state
  const [seoDialogOpen, setSeoDialogOpen] = useState(false);
  const [geoDialogOpen, setGeoDialogOpen] = useState(false);
  const [pillarDialogOpen, setPillarDialogOpen] = useState(false);
  
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

  // Section breakdowns (must come after 'result' is defined)
  const seoSections = React.useMemo(() => (
    result ? buildSEOSections(result) : { title: 'SEO Score Breakdown', items: [] }
  ), [result]);
  const geoSections = React.useMemo(() => (
    result ? buildGEOSections(result) : { title: 'GEO Score Breakdown', items: [] }
  ), [result]);

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

  const localQuickWins = React.useMemo(() => {
    const arr = result?.topQuickFixes;
    return Array.isArray(arr) ? arr : [];
  }, [result]);

  const localGrowthOpps = React.useMemo(() => {
    const arr = result?.missedOpportunities;
    return Array.isArray(arr) ? arr : [];
  }, [result]);

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
          <TabsList className="grid w-full max-w-md grid-cols-3 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-cyan-200/20 dark:border-blue-400/20 rounded-2xl p-1">
            <TabsTrigger 
              value="input" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <Rocket className="w-4 h-4 mr-2" />
              Launch
            </TabsTrigger>
            <TabsTrigger 
              value="report" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger 
              value="ai" 
              disabled={!result}
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold transition-all duration-300"
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
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-cyan-600/5 pointer-events-none" />
              <CardHeader className="relative px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg"
                  >
                    <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-xl sm:text-2xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">
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
                        <Globe2 className="w-4 h-4 text-cyan-500" />
                        Website URL
                      </label>
                      <div className="flex items-center rounded-xl border-2 border-cyan-200/50 dark:border-blue-400/30 bg-white/80 dark:bg-gray-900/60 backdrop-blur-sm focus-within:border-cyan-400 focus-within:dark:border-blue-400 transition-all">
                        <span className="px-3 text-sm font-semibold text-cyan-600 dark:text-cyan-300 border-r border-cyan-100/60 dark:border-blue-400/20 bg-white/70 dark:bg-gray-900/70 rounded-l-xl">
                          https://
                        </span>
                        <Input
                          type="text"
                          inputMode="url"
                          autoComplete="url"
                          placeholder="mybusiness.com"
                          value={input.url ? input.url.replace(/^https?:\/\//, '') : ''}
                          onChange={(e)=> {
                            const rawValue = e.target.value.trim();
                            const sanitized = rawValue.replace(/^https?:\/\//, '');
                            setInput((s)=> ({ ...s, url: sanitized ? `https://${sanitized}` : '' }));
                          }}
                          className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base placeholder:text-slate-400 dark:placeholder:text-slate-500 px-3 py-2"
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Enter your full domain — we automatically add the secure https:// prefix.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-500" />
                        Target Market
                      </label>
                      <Input 
                        placeholder="e.g., San Francisco, CA" 
                        value={input.targetMarket || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, targetMarket: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-blue-200/50 dark:border-cyan-400/30 rounded-xl focus:border-blue-400 dark:focus:border-cyan-400 transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-600" />
                        Primary Keyword
                      </label>
                      <Input 
                        placeholder="e.g., AI-powered marketing tools" 
                        value={input.primaryKeyword || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, primaryKeyword: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-cyan-200/50 dark:border-blue-400/30 rounded-xl focus:border-cyan-400 dark:focus:border-blue-400 transition-all duration-300"
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
                        <Brain className="w-4 h-4 text-blue-500" />
                        Raw HTML (optional)
                      </label>
                      <Textarea 
                        rows={6} 
                        placeholder="Paste your page's HTML for maximum AI precision..." 
                        value={input.rawHtml || ''} 
                        onChange={(e)=> setInput((s)=> ({ ...s, rawHtml: e.target.value }))}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-blue-200/50 dark:border-cyan-400/30 rounded-xl focus:border-blue-400 dark:focus:border-cyan-400 transition-all duration-300 resize-none"
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
                      <Users className="w-4 h-4 text-cyan-600" />
                      Competitor Analysis
                    </label>
                    <Badge className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-0 rounded-full px-3 py-1">
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
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-2 border-cyan-200/50 dark:border-blue-400/30 rounded-xl focus:border-cyan-400 dark:focus:border-blue-400 transition-all duration-300"
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Analysis Mode Toggle */}
                <motion.div 
                  className="flex items-center justify-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30"
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
                        className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-700 hover:from-cyan-600 hover:via-blue-700 hover:to-cyan-800 text-white border-0 rounded-xl px-6 sm:px-8 py-3 font-bold text-base sm:text-lg shadow-2xl transition-all duration-300"
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

                <Alert className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border-2 border-cyan-200/50 dark:border-blue-400/30 rounded-xl">
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                  <AlertDescription className="text-sm text-cyan-700 dark:text-cyan-300">
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
            <div ref={containerRef} className="relative overflow-hidden space-y-4 sm:space-y-6 p-2 sm:p-4">
              <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-cyan-500/10 rounded-full blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 w-[28rem] h-[28rem] bg-gradient-to-br from-cyan-400/10 via-blue-400/10 to-cyan-500/10 rounded-full blur-3xl" />
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div className="space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">SEO & GEO Scorecard</h2>
                  <p className="text-xs text-muted-foreground break-all sm:break-normal">{result.url || 'HTML input'} • Computed {new Date(result.computedAt).toLocaleString()}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" size="sm" onClick={handleSaveImage} className="gap-2 w-full sm:w-auto rounded-xl bg-white/70 dark:bg-gray-800/50 border-white/40 dark:border-gray-700/50 backdrop-blur-md">
                    <ImageIcon className="w-4 h-4" /> Save Image
                  </Button>
                  <Button size="sm" onClick={handleExportPDF} className="gap-2 w-full sm:w-auto rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg">
                    <FileDown className="w-4 h-4" /> Export PDF
                  </Button>
                </div>
              </div>

              {/* Hero Section - Improved Structure */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Overall Score - Circular Gauge */}
                <div className="col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-full flex flex-col">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Overall Score</h3>
                    <p className="text-xs text-slate-500 mt-1">Combined SEO & GEO performance</p>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <CircularScore score={result.overallScore} label="out of 100" />
                  </div>
                </div>

                {/* Performance Pillars - 3 Cards */}
                <div className="col-span-1 lg:col-span-3">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">Performance Pillars</h3>
                            <button
                              type="button"
                              onClick={() => setPillarDialogOpen(true)}
                              className="p-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors group"
                              title="View pillar definitions"
                            >
                              <Info className="w-4 h-4 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                            </button>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Core metrics driving your SEO & GEO success</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <PillarCard
                        title="Visibility"
                        score={result.pillars.visibility}
                        maxScore={10}
                        color="#3b82f6"
                        icon={<Eye className="w-5 h-5" style={{ color: '#3b82f6' }} />}
                      />
                      <PillarCard
                        title="Trust"
                        score={result.pillars.trust}
                        maxScore={10}
                        color="#06b6d4"
                        icon={<Star className="w-5 h-5" style={{ color: '#06b6d4' }} />}
                      />
                      <PillarCard
                        title="Relevance"
                        score={result.pillars.relevance}
                        maxScore={10}
                        color="#8b5cf6"
                        icon={<Target className="w-5 h-5" style={{ color: '#8b5cf6' }} />}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Hierarchical Score Trees - The Jony Ive Experience */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Section Header */}
                <div className="text-center space-y-2">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent">
                    Score Architecture
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Understand how each component contributes to your overall score. 
                    Expand nodes to see the full breakdown and impact of each metric.
                  </p>
                </div>

                {/* Section Visualizations Grid (clean cards) */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* SEO Sections */}
                  <ScoreSection 
                    section={seoSections} 
                    color="blue" 
                    score={Math.round(result.seoScoreOutOf10 * 10 || 0)}
                    onInfoClick={() => setSeoDialogOpen(true)}
                  />

                  {/* GEO Sections */}
                  <ScoreSection 
                    section={geoSections} 
                    color="cyan" 
                    score={result.geoScoreOutOf100 || 0}
                    onInfoClick={() => setGeoDialogOpen(true)}
                  />
                </div>
              </motion.div>

              {/* Detailed Metrics Section - Material UI Style */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* SEO Score Card */}
                <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <Target className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">SEO Score</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-900 dark:text-slate-100">{Math.round(result.seoScoreOutOf10 * 10 || 0)}</span>
                          <span className="text-sm text-slate-500">out of 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-blue-600 mb-1">{result.onPage.titleLength}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Title Length</div>
                        <div className="text-xs text-blue-600 font-semibold mt-1">
                          {result.onPage.titleLength > 30 && result.onPage.titleLength < 60 ? 'Great length' : 'Characters'}
                        </div>
                      </div>
                      <div className="p-5 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-cyan-600 mb-1">{result.onPage.metaDescriptionLength}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Meta Description</div>
                        <div className="text-xs text-cyan-600 font-semibold mt-1">Characters</div>
                      </div>
                    </div>
                    {/* Heading Counts */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{result.onPage.h1Count}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">H1</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{result.onPage.h2Count}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">H2</div>
                      </div>
                      <div className="text-center p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl">
                        <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{result.onPage.h3Count}</div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">H3</div>
                      </div>
                    </div>

                    {/* Word Count & Images */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Word Count</span>
                        <span className="text-lg font-black text-blue-600">{result.onPage.wordCount}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Images</span>
                        <span className="text-lg font-black text-cyan-600">{result.onPage.imageCount}</span>
                      </div>
                    </div>

                    {/* Schema Markup */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Schema Markup</span>
                        <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          {result.onPage.schemaPresent ? 'Present' : 'Missing'}
                        </span>
                      </div>
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

                {/* GEO Score Card */}
                <Card className="bg-white dark:bg-slate-800 border-0 shadow-lg rounded-3xl overflow-hidden">
                  <CardContent className="p-8 space-y-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                        <Brain className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400">GEO Score</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black text-slate-900 dark:text-slate-100">{result.geoScoreOutOf100 || 0}</span>
                          <span className="text-sm text-slate-500">out of 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-cyan-600 mb-1">{result.geo.aiVisibilityRate}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">AI Visibility Ratio</div>
                        <div className="text-xs text-cyan-600 font-semibold mt-1">Content accessible</div>
                      </div>
                      <div className="p-5 bg-teal-50 dark:bg-teal-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-teal-600 mb-1">{result.geo.citationFrequency}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Citation Frequency</div>
                        <div className="text-xs text-teal-600 font-semibold mt-1">External citations</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-5 bg-sky-50 dark:bg-sky-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-sky-600 mb-1">{result.geo.brandMentionScore}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Brand Mention Score</div>
                        <div className="text-xs text-sky-600 font-semibold mt-1">Authority & credibility signals</div>
                      </div>
                      <div className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                        <div className="text-3xl font-black text-blue-600 mb-1">{result.geo.sentimentAccuracy}</div>
                        <div className="text-xs font-medium text-slate-600 dark:text-slate-400">Sentiment Accuracy</div>
                        <div className="text-xs text-blue-600 font-semibold mt-1">Positive messaging analysis</div>
                      </div>
                    </div>

                    {/* Advanced AI Metrics */}
                    <div className="p-6 bg-cyan-50 dark:bg-cyan-900/20 rounded-2xl space-y-3">
                      <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Advanced AI Metrics</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Structured Data</span>
                          <span className="text-lg font-black text-cyan-600">{result.geo.structuredDataScore}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Contextual Relevance</span>
                          <span className="text-lg font-black text-blue-600">{result.geo.contextualRelevance}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Authority Signals</span>
                          <span className="text-lg font-black text-cyan-700">{result.geo.authoritySignals}</span>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                </Card>
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

                          {!recomLoading && !recomError && lambdaQuickWins.length === 0 && (result.topQuickFixes || []).length === 0 && (
                            <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/30 bg-gradient-to-br from-white/80 via-emerald-50/70 to-white/80 dark:from-viz-medium/80 dark:via-emerald-900/15 dark:to-viz-dark/70 text-sm text-emerald-800 dark:text-emerald-200 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-base font-semibold">No major quick wins detected</div>
                                  <div className="text-xs text-emerald-700/80 dark:text-emerald-200/80">Our signals didn’t surface immediate fixes. Let’s align with the consulting team for nuanced recommendations.</div>
                                </div>
                              </div>
                              <div className="text-xs text-emerald-700/80 dark:text-emerald-200/80 leading-relaxed">
                                Share your current campaign context at <a href="mailto:team@sgconsultingtech.com" className="font-semibold underline decoration-emerald-500/60 hover:decoration-emerald-500">team@sgconsultingtech.com</a> and we’ll craft a deeper optimization plan.
                              </div>
                            </div>
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
                          {!recomLoading && !recomError && lambdaQuickWins.length === 0 && localQuickWins.length > 0 && (
                            <div className="space-y-3">
                              {localQuickWins.map((item, i) => (
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
                                    <div className="text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">{item}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {!recomLoading && !recomError && lambdaQuickWins.length === 0 && localQuickWins.length === 0 && (
                            <div className="p-5 rounded-2xl border border-emerald-200/50 dark:border-emerald-400/30 bg-gradient-to-br from-white/90 via-emerald-50/70 to-white/90 dark:from-viz-medium/85 dark:via-emerald-900/20 dark:to-viz-dark/75 text-sm text-emerald-900 dark:text-emerald-200 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg">
                                  <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-base font-semibold">No major quick wins surfaced</div>
                                  <div className="text-xs text-emerald-700/85 dark:text-emerald-200/80">Signals look steady. Consult our specialists for precision improvements tuned to your roadmap.</div>
                                </div>
                              </div>
                              <div className="text-xs text-emerald-700/85 dark:text-emerald-200/80 leading-relaxed">
                                Email <a href="mailto:team@sgconsultingtech.com" className="font-semibold underline decoration-emerald-500/60 hover:decoration-emerald-500">team@sgconsultingtech.com</a> to co-create a focused optimization sprint.
                              </div>
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
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                          <TrendingUp className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
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
                                  className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200/50 dark:border-blue-400/30"
                                >
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 text-white text-xs font-bold">{i + 1}</span>
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
                                        <Badge className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200 border-cyan-200/60 dark:border-cyan-700">Effort: {item.effort_score}</Badge>
                                      )}
                                      {item.estimated_time && (
                                        <Badge variant="outline" className="border-blue-300 text-blue-700 dark:text-blue-200">ETA: {item.estimated_time}</Badge>
                                      )}
                                      {item.area && (
                                        <Badge variant="outline" className="border-cyan-300 text-cyan-700 dark:text-cyan-200">Area: {item.area}</Badge>
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
                          {!recomLoading && !recomError && lambdaGrowthOpps.length === 0 && localGrowthOpps.length > 0 && (
                            <div className="space-y-3">
                              {localGrowthOpps.map((item, i) => (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.3, delay: 0.1 * i }}
                                  className="group p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl border border-blue-200/50 dark:border-blue-400/30 hover:shadow-lg transition-all duration-300"
                                >
                                  <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                      {i + 1}
                                    </div>
                                    <div className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{item}</div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          )}
                          {!recomLoading && !recomError && lambdaGrowthOpps.length === 0 && localGrowthOpps.length === 0 && (
                            <div className="p-5 rounded-2xl border border-blue-200/50 dark:border-blue-400/30 bg-gradient-to-br from-white/90 via-blue-50/70 to-white/90 dark:from-viz-medium/85 dark:via-blue-900/20 dark:to-viz-dark/75 text-sm text-blue-900 dark:text-blue-200 space-y-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white flex items-center justify-center shadow-lg">
                                  <Rocket className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-base font-semibold">No standout growth plays detected</div>
                                  <div className="text-xs text-blue-700/85 dark:text-blue-200/80">Trajectory is steady. Partner with our strategy team to engineer the next leap.</div>
                                </div>
                              </div>
                              <div className="text-xs text-blue-700/85 dark:text-blue-200/80 leading-relaxed">
                                Reach out at <a href="mailto:team@sgconsultingtech.com" className="font-semibold underline decoration-blue-500/60 hover:decoration-blue-500">team@sgconsultingtech.com</a> to architect a bespoke acceleration roadmap.
                              </div>
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
              <CardContent className="py-12 text-center text-sm text-muted-foreground">Run an analysis first to unlock your AI Strategy consultation.</CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-50/90 via-blue-50/70 to-cyan-100/50 dark:from-cyan-900/20 dark:via-blue-900/20 dark:to-cyan-800/20 backdrop-blur-xl border-2 border-gradient-to-r from-cyan-200 to-blue-200 dark:border-cyan-700/50 shadow-2xl rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-blue-500/5 to-cyan-600/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-3xl" />
                
                <CardHeader className="relative px-6 py-8 text-center">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="mx-auto mb-4 p-4 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg w-fit"
                  >
                    <Brain className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 bg-clip-text text-transparent mb-2">
                    Ready to Dominate Search Results?
                  </CardTitle>
                  <CardDescription className="text-lg text-gray-700 dark:text-gray-300 font-medium">
                    Transform your SEO & GEO insights into explosive growth
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative px-6 pb-8 space-y-6">
                  <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/30 dark:border-gray-700/30">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                      <Rocket className="w-5 h-5 text-cyan-500" />
                      Your Custom Execution Strategy Awaits
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      You've got the insights. Now let our expert team at <span className="font-bold text-cyan-600 dark:text-cyan-400">SG Consulting</span> craft a 
                      bulletproof execution strategy that will skyrocket your search rankings and dominate your competition.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                          <Target className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">Precision Targeting</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Custom keyword & GEO strategies</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">Rapid Results</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">90-day performance boost</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">Expert Analysis</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">Deep competitive insights</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Rocket className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm">Full Execution</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">End-to-end implementation</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-cyan-700 hover:from-cyan-700 hover:via-blue-700 hover:to-cyan-800 text-white font-bold py-4 px-8 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-3 text-lg"
                      onClick={() => window.open('mailto:team@sgconsultingtech.com?subject=SEO%20%26%20GEO%20Execution%20Strategy%20Consultation&body=Hi%20SG%20Consulting%20Team%2C%0A%0AI%27ve%20completed%20my%20SEO%20%26%20GEO%20analysis%20and%20I%27m%20ready%20to%20take%20my%20search%20performance%20to%20the%20next%20level.%20I%27d%20like%20to%20discuss%20a%20custom%20execution%20strategy.%0A%0APlease%20schedule%20a%20consultation%20at%20your%20earliest%20convenience.%0A%0AThank%20you!', '_blank')}
                    >
                      <Sparkles className="w-5 h-5" />
                      Connect with SG Consulting Team
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                    
                    <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Expert Team</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Proven Results</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                        <span>Custom Strategy</span>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">
                      "Ready to transform your SEO insights into market dominance? Let's make it happen."
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </TabsContent>
      </Tabs>

      {/* KPI Definitions Dialogs */}
      <KPIDefinitionsDialog
        open={seoDialogOpen}
        onClose={() => setSeoDialogOpen(false)}
        title="SEO Score Breakdown Definitions"
        subtitle="Understanding the metrics and formulas behind your score"
        definitions={SEO_DEFINITIONS}
      />

      <KPIDefinitionsDialog
        open={geoDialogOpen}
        onClose={() => setGeoDialogOpen(false)}
        title="GEO Score Breakdown Definitions"
        subtitle="Understanding the metrics and formulas behind your score"
        definitions={GEO_DEFINITIONS}
      />

      <KPIDefinitionsDialog
        open={pillarDialogOpen}
        onClose={() => setPillarDialogOpen(false)}
        title="Performance Pillars Definitions"
        subtitle="Understanding the metrics and formulas behind your score"
        definitions={PILLAR_DEFINITIONS}
      />
    </div>
  );
};
