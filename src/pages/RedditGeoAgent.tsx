import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Brain,
  CheckCircle2,
  Clock3,
  Copy,
  Flame,
  Gauge,
  Radar,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Tag,
  Target,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  redditIntelligenceApi, 
  RedditAPIError,
  type AnalyticsResponse,
  type AccountRiskResponse,
  type BusinessAnalysisResponse,
} from '@/services/redditIntelligenceApi';

type Goal = 'lead_generation' | 'authority' | 'seo_visibility' | 'geo_visibility';
type Tone = 'professional' | 'casual' | 'technical';
type Length = 'short' | 'medium' | 'long';
type IntentType = 'Question' | 'Comparison' | 'Complaint' | 'Recommendation';

interface SubredditRow {
  name: string;
  members: string;
  activity: number;
  buyerIntent: number;
  risk: number;
  leadProbability: number;
  bestFormat: string;
}

interface ThreadRow {
  id: string;
  subreddit: string;
  title: string;
  intent: IntentType;
  leadScore: number;
  riskScore: number;
  hoursAgo: number;
}

interface ToolModule {
  title: string;
  painPoint: string;
  capability: string;
  impact: string;
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
}

const subredditData: SubredditRow[] = [
  { name: 'r/SaaS', members: '189K', activity: 74, buyerIntent: 91, risk: 28, leadProbability: 88, bestFormat: 'Benchmarks' },
  { name: 'r/startups', members: '1.8M', activity: 88, buyerIntent: 82, risk: 35, leadProbability: 81, bestFormat: 'Founder Q&A' },
  { name: 'r/Entrepreneur', members: '2.9M', activity: 80, buyerIntent: 75, risk: 51, leadProbability: 72, bestFormat: 'Case Study' },
  { name: 'r/smallbusiness', members: '1.6M', activity: 77, buyerIntent: 79, risk: 41, leadProbability: 75, bestFormat: 'How-to' },
];

const threadData: ThreadRow[] = [
  { id: 'th1', subreddit: 'r/SaaS', title: 'How are you lowering CAC without hurting quality?', intent: 'Question', leadScore: 89, riskScore: 20, hoursAgo: 3 },
  { id: 'th2', subreddit: 'r/startups', title: 'What channels are still working for B2B lead gen in 2026?', intent: 'Comparison', leadScore: 83, riskScore: 31, hoursAgo: 8 },
  { id: 'th3', subreddit: 'r/Entrepreneur', title: 'Agency outreach feels dead. What replaced it?', intent: 'Complaint', leadScore: 72, riskScore: 30, hoursAgo: 12 },
  { id: 'th4', subreddit: 'r/smallbusiness', title: 'Need recommendations for growth partner in the US', intent: 'Recommendation', leadScore: 79, riskScore: 26, hoursAgo: 18 },
  { id: 'th5', subreddit: 'r/startups', title: 'Any practical GEO playbook for AI search visibility?', intent: 'Question', leadScore: 76, riskScore: 17, hoursAgo: 22 },
];

const goalLabel: Record<Goal, string> = {
  lead_generation: 'Lead Generation',
  authority: 'Authority Building',
  seo_visibility: 'SEO Visibility',
  geo_visibility: 'GEO Visibility',
};

const defaultScoringWeights = {
  intentWeight: 0.35,
  personaMatchWeight: 0.25,
  activityWeight: 0.2,
  competitionWeight: 0.1,
  riskWeight: 0.1,
};

type ScoringWeights = typeof defaultScoringWeights;

type ScanContext = {
  priorityClusters: BusinessAnalysisResponse['data']['keywordClusters'];
  personaSignals: BusinessAnalysisResponse['data']['personaModel'];
  subredditSeeds: BusinessAnalysisResponse['data']['subredditTargets'];
  scoringWeights: ScoringWeights;
  engagementStrategy: NonNullable<BusinessAnalysisResponse['data']['engagementStrategy']>;
  goal: Goal;
};

const variantText = {
  authority:
    'The highest-performing pattern here is value-first replies: explain the framework, show one practical execution step, and avoid direct promotion in your first response.',
  practical:
    'A practical route is to map this to buyer-intent clusters first and then answer with context + a reusable checklist so you build trust before introducing tools.',
  educational:
    'Quick breakdown: classify intent, answer the question directly, add one proof point, then invite follow-up. This keeps moderation risk low and response quality high.',
};

const toolModules: ToolModule[] = [
  {
    title: 'Audience Radar',
    painPoint: 'Community Complexity',
    capability: 'Track high-intent conversations across target subreddits with context filters.',
    impact: 'Cuts manual monitoring time by ~60%',
    icon: Search,
    iconClass: 'text-cyan-300',
  },
  {
    title: 'Trend Velocity',
    painPoint: 'Content Saturation',
    capability: 'Surface rising topics before they peak to improve early traction odds.',
    impact: 'Improves thread discovery quality',
    icon: BarChart3,
    iconClass: 'text-viz-accent',
  },
  {
    title: 'Timing Intelligence',
    painPoint: 'Timing Sensitivity',
    capability: 'Recommend posting windows based on subreddit activity rhythm.',
    impact: 'Boosts first-hour visibility',
    icon: Clock3,
    iconClass: 'text-orange-300',
  },
  {
    title: 'Safety Shield',
    painPoint: 'Account Security Risk',
    capability: 'Enforce safe-mode rules and moderation-friendly response patterns.',
    impact: 'Reduces ban/shadowban risk',
    icon: ShieldCheck,
    iconClass: 'text-emerald-300',
  },
  {
    title: 'Reply Studio',
    painPoint: 'Scale vs. Authenticity',
    capability: 'Generate tone-aware, value-first drafts with human approval built in.',
    impact: 'Faster engagement without spam signals',
    icon: Bot,
    iconClass: 'text-indigo-300',
  },
  {
    title: 'Persona Mapper',
    painPoint: 'Audience Mismatch',
    capability: 'Align thread intent with ICP segments and conversion probability.',
    impact: 'Higher relevance and reply acceptance',
    icon: Users,
    iconClass: 'text-rose-300',
  },
];

const guardrailChecklist = [
  'Value-first reply style before any CTA',
  'No identical copy across multiple subreddits',
  'Context check against subreddit norms and rules',
  'Human approval before publishing AI-assisted comments',
];

const RedditGeoAgent: React.FC = () => {
  const { toast } = useToast();

  const [websiteUrl, setWebsiteUrl] = useState('');
  const [competitorSet, setCompetitorSet] = useState('');
  const [businessContext, setBusinessContext] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [targetRegion, setTargetRegion] = useState('United States');
  const [goal, setGoal] = useState<Goal>('lead_generation');
  const [safeMode, setSafeMode] = useState(true);

  const [selectedSubreddit, setSelectedSubreddit] = useState<string>('all');
  const [intentFilter, setIntentFilter] = useState<'all' | IntentType>('all');
  const [last24Only, setLast24Only] = useState(true);

  const [selectedThread, setSelectedThread] = useState<ThreadRow | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [tone, setTone] = useState<Tone>('professional');
  const [length, setLength] = useState<Length>('medium');
  const [variant, setVariant] = useState<'authority' | 'practical' | 'educational'>('authority');
  const [analyzed, setAnalyzed] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [generatingComment, setGeneratingComment] = useState(false);
  const [analysisData, setAnalysisData] = useState<BusinessAnalysisResponse['data'] | null>(null);
  const [devMode, setDevMode] = useState(false);

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [accountRisk, setAccountRisk] = useState<AccountRiskResponse | null>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [loadingRisk, setLoadingRisk] = useState(false);

  const filteredThreads = useMemo(() => {
    return threadData.filter((thread) => {
      if (selectedSubreddit !== 'all' && thread.subreddit !== selectedSubreddit) return false;
      if (intentFilter !== 'all' && thread.intent !== intentFilter) return false;
      if (last24Only && thread.hoursAgo > 24) return false;
      return true;
    });
  }, [selectedSubreddit, intentFilter, last24Only]);

  const opportunityScore = useMemo(() => {
    if (analysisData?.opportunityBaselineScore?.overall) {
      return analysisData.opportunityBaselineScore.overall;
    }
    if (!filteredThreads.length) return 0;
    return Math.round(filteredThreads.reduce((sum, thread) => sum + thread.leadScore, 0) / filteredThreads.length);
  }, [analysisData, filteredThreads]);

  const visibilityScore = useMemo(() => {
    if (!filteredThreads.length) return 0;
    return Math.round(filteredThreads.reduce((sum, thread) => sum + (100 - thread.riskScore), 0) / filteredThreads.length);
  }, [filteredThreads]);

  const finalComment = useMemo(() => {
    const tonePrefix =
      tone === 'casual'
        ? 'Quick thought: '
        : tone === 'technical'
          ? 'Execution note: '
          : 'Practical perspective: ';

    const lengthSuffix =
      length === 'short'
        ? ' Happy to share a concise checklist.'
        : length === 'long'
          ? ' If helpful, I can also map this by subreddit maturity, moderation strictness, and likely reply velocity so you can prioritize correctly.'
          : ' If useful, I can share a repeatable checklist for this flow.';

    const safetyTag = safeMode
      ? ' (Safe Mode ON: no direct link and no hard CTA.)'
      : ' (Direct CTA allowed.)';

    return `${tonePrefix}${variantText[variant]}${lengthSuffix}${safetyTag}`;
  }, [tone, length, safeMode, variant]);

  const runScan = async () => {
    if (!websiteUrl.trim() || !businessContext.trim() || !targetAudience.trim()) {
      toast({
        title: 'Missing context',
        description: 'Complete website, business context, and target audience first.',
        variant: 'destructive',
      });
      return;
    }

    setScanning(true);
    
    try {
      let stage1: BusinessAnalysisResponse['data'];

      if (devMode) {
        // Mock data for UX testing when API is unavailable
        await new Promise(r => setTimeout(r, 1500));
        stage1 = {
          nicheProfile: {
            primaryNiche: 'AI Agents for Business Automation',
            subNiches: ['AI agents for fintech', 'AI agents for ecommerce', 'Agent orchestration'],
            industryCategory: 'AI Consulting / Intelligent Automation',
            targetMarket: 'United States mid-market to enterprise',
          },
          keywordClusters: [
            {
              cluster: 'AI agents fintech',
              keywords: ['AI agents for fintech', 'autonomous agents fintech', 'compliance AI agents'],
              intent: 'commercial' as const,
              priority: 'high' as const,
            },
            {
              cluster: 'AI agents ecommerce',
              keywords: ['AI agents for ecommerce', 'personalization AI agents', 'customer support AI'],
              intent: 'commercial' as const,
              priority: 'high' as const,
            },
            {
              cluster: 'AI agent implementation',
              keywords: ['AI agent consulting', 'build AI agents', 'enterprise AI integration'],
              intent: 'transactional' as const,
              priority: 'high' as const,
            },
          ],
          personaModel: {
            demographics: {
              age: '30-50',
              location: 'United States (NY, SF, Austin)',
              occupation: 'CTO / Head of Engineering / VP of Data',
            },
            painPoints: [
              'Need to speed up product development and reduce time-to-market',
              'Scaling personalization without increasing headcount',
              'Demonstrating clear ROI to executives',
            ],
            goals: [
              'Automate repetitive workflows',
              'Deploy compliant AI agents quickly',
              'Prove measurable ROI within 3-6 months',
            ],
            redditBehavior: {
              activeSubreddits: ['r/MachineLearning', 'r/MLOps', 'r/Fintech', 'r/ecommerce'],
              engagementStyle: 'Lurks for research, posts technical questions, values concrete examples',
            },
          },
          opportunityBaselineScore: {
            overall: 70,
            factors: {
              marketDemand: 85,
              competitionLevel: 60,
              redditPresence: 55,
              conversionPotential: 75,
            },
            reasoning: 'Strong market demand for AI agents in fintech and ecommerce. Competition is moderate-to-high. Reddit presence is emerging—can be used for awareness and trust-building.',
          },
          scoringWeights: {
            intentWeight: 0.35,
            personaMatchWeight: 0.25,
            activityWeight: 0.2,
            competitionWeight: 0.1,
            riskWeight: 0.1,
          },
          subredditTargets: [
            { name: 'r/MachineLearning', type: 'technical-authority' as const, confidence: 0.8 },
            { name: 'r/Fintech', type: 'industry-specific' as const, confidence: 0.9 },
            { name: 'r/ecommerce', type: 'industry-specific' as const, confidence: 0.85 },
            { name: 'r/Entrepreneur', type: 'broad-awareness' as const, confidence: 0.6 },
          ],
          engagementStrategy: {
            commentStyle: 'Technical authority with value-first approach',
            ctaStyle: 'Soft reference with optional follow-up',
            evidenceType: 'Case studies + benchmarks',
            riskTolerance: 'medium-low' as const,
            reasoning: 'Lead with insight, de-risk with proof, invite follow-up.',
          },
        };
      } else {
        const analysisText = `Business: ${businessContext}\nTarget Audience: ${targetAudience}\nGoal: ${goalLabel[goal]}`;
        const payload = {
          text: analysisText,
          website: websiteUrl.trim(),
          region: targetRegion.trim(),
          description: businessContext.trim(),
          idealBuyer: targetAudience.trim(),
          goal: goalLabel[goal],
          competitors: competitorSet.trim(),
          context: {
            industry: businessContext.split(' ')[0],
            keywords: targetAudience.split(',').map((k) => k.trim()).filter(Boolean),
          },
        };

        const result = await redditIntelligenceApi.analyzeBusinessContent(payload);
        stage1 = result.data;
      }

      setAnalysisData(stage1);

      // Stage 2: Trigger subreddit scan with enriched context
      const priorityClusters = (stage1.keywordClusters || [])
        .filter((cluster) => cluster.priority !== 'low')
        .slice(0, 6);

      if (!devMode && stage1.personaModel && priorityClusters.length) {
        try {
          const scanResult = await redditIntelligenceApi.scanSubreddits({
            region: targetRegion.trim(),
            goal: goalLabel[goal],
            scanContext: {
              targetClusters: priorityClusters,
              personaSignals: stage1.personaModel,
              subredditSeeds: stage1.subredditTargets,
              scoringWeights: stage1.scoringWeights,
              engagementStrategy: stage1.engagementStrategy,
              goal: goalLabel[goal],
              region: targetRegion.trim(),
            },
          });

          toast({
            title: 'Subreddit scan complete',
            description: `${scanResult.metadata?.totalFound ?? 0} subreddits ranked${scanResult.data?.[0]?.subreddit ? ` | Top: r/${scanResult.data[0].subreddit}` : ''}`,
          });
        } catch (scanError) {
          console.warn('Stage 2 subreddit scan failed (non-blocking):', scanError);
        }
      }
      
      setAnalyzed(true);
      const score = stage1?.opportunityBaselineScore?.overall;
      const primaryNiche = stage1?.nicheProfile?.primaryNiche;
      toast({ 
        title: 'Opportunity scan complete', 
        description: `Score: ${typeof score === 'number' ? score : 'N/A'}/100${primaryNiche ? ` | Niche: ${primaryNiche}` : ''}${devMode ? ' (Dev Mode)' : ''}`
      });
    } finally {
      setScanning(false);
    }
  };

  const scanContext = useMemo<ScanContext | null>(() => {
    if (!analysisData) return null;

    const weights: ScoringWeights = {
      intentWeight: analysisData.scoringWeights?.intentWeight ?? defaultScoringWeights.intentWeight,
      personaMatchWeight: analysisData.scoringWeights?.personaMatchWeight ?? defaultScoringWeights.personaMatchWeight,
      activityWeight: analysisData.scoringWeights?.activityWeight ?? defaultScoringWeights.activityWeight,
      competitionWeight: analysisData.scoringWeights?.competitionWeight ?? defaultScoringWeights.competitionWeight,
      riskWeight: analysisData.scoringWeights?.riskWeight ?? defaultScoringWeights.riskWeight,
    };

    const fallbackSubreddits = analysisData.personaModel?.redditBehavior?.activeSubreddits?.map((name) => ({
      name,
      type: 'technical-authority' as const,
      confidence: 0.55,
    })) ?? [];

    const subredditSeeds = (analysisData.subredditTargets?.length ? analysisData.subredditTargets : fallbackSubreddits) ?? [];

    const engagementStrategy = {
      commentStyle: analysisData.engagementStrategy?.commentStyle ?? 'Value-first authority',
      ctaStyle: analysisData.engagementStrategy?.ctaStyle ?? 'Soft reference with optional CTA',
      evidenceType: analysisData.engagementStrategy?.evidenceType ?? 'Case studies + benchmarks',
      riskTolerance: analysisData.engagementStrategy?.riskTolerance ?? 'medium-low',
      reasoning: analysisData.engagementStrategy?.reasoning ?? 'Lead with insight, de-risk with proof, invite follow-up.',
    };

    const priorityClusters = (analysisData.keywordClusters || []).filter((cluster) => cluster.priority !== 'low').slice(0, 6);

    return {
      priorityClusters,
      personaSignals: analysisData.personaModel,
      subredditSeeds,
      scoringWeights: weights,
      engagementStrategy,
      goal,
    };
  }, [analysisData, goal]);

  const openCommentDrawer = async (thread: ThreadRow) => {
    setSelectedThread(thread);
    setDrawerOpen(true);
    
    setGeneratingComment(true);
    try {
      const result = await redditIntelligenceApi.analyzeBusinessContent({
        text: thread.title,
        subreddit: thread.subreddit.replace('r/', ''),
        website: websiteUrl.trim(),
        region: targetRegion.trim(),
        description: businessContext.trim(),
        idealBuyer: targetAudience.trim(),
        goal: goalLabel[goal],
        competitors: competitorSet.trim(),
        context: {
          industry: businessContext || 'Technology',
          keywords: targetAudience.split(',').map((k) => k.trim()).filter(Boolean),
        },
      });
      
      const clusterCount = result.data?.keywordClusters?.length ?? 0;
      toast({ 
        title: 'Thread analyzed', 
        description: `${clusterCount} keyword clusters generated` 
      });
    } catch (error: any) {
      console.error('Thread analysis failed:', error);
    } finally {
      setGeneratingComment(false);
    }
  };
  
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoadingAnalytics(true);
      try {
        const data = await redditIntelligenceApi.getAnalytics({
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          groupBy: 'day',
        });
        setAnalytics(data);
      } catch (error: any) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoadingAnalytics(false);
      }
    };
    
    fetchAnalytics();
  }, []);
  
  const fetchAccountRisk = async (username: string) => {
    setLoadingRisk(true);
    try {
      const data = await redditIntelligenceApi.assessAccountRisk({
        username,
        lookbackDays: 30,
        includeHistory: true,
      });
      setAccountRisk(data);
      
      toast({ 
        title: 'Account risk assessed', 
        description: `Risk level: ${data.riskLevel} (${(data.riskScore * 100).toFixed(0)}%)` 
      });
    } catch (error: any) {
      console.error('Failed to assess account risk:', error);
      
      let errorMessage = 'Failed to assess account risk';
      if (error instanceof RedditAPIError) {
        errorMessage = error.message;
      }
      
      toast({ 
        title: 'Risk assessment failed', 
        description: errorMessage, 
        variant: 'destructive' 
      });
    } finally {
      setLoadingRisk(false);
    }
  };

  const copyComment = async () => {
    await navigator.clipboard.writeText(finalComment);
    toast({ title: 'Copied', description: 'Comment copied to clipboard.' });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f8fb] text-slate-900 flex flex-col">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 right-0 h-96 w-96 rounded-full bg-viz-accent/10 blur-3xl" />
        <div className="absolute top-40 -left-20 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopNav zone="vee" showData={false} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <Card className="border-slate-200 bg-white/90 shadow-xl backdrop-blur">
                <CardContent className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-viz-accent/10 text-viz-accent border border-viz-accent/20">VIZ Branded Agent</Badge>
                    <Badge className="bg-orange-100 text-orange-700 border border-orange-200">Reddit Intelligence OS</Badge>
                    <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Community-first Safety</Badge>
                    <button
                      onClick={() => setDevMode(!devMode)}
                      className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-100 transition-colors"
                      title="Toggle dev mode with mock data"
                    >
                      {devMode ? '🟢 Dev Mode' : '⚪ Live API'}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900">Reddit GEO Agent</h1>
                    <p className="text-slate-600 max-w-4xl">
                      Built in VIZ style: signal-heavy, conversion-aware, and moderation-safe. Discover the right Reddit conversations,
                      prioritize by intent and risk, and ship human-approved replies with confidence.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <MetricCard
                      title="Opportunity Intelligence Score"
                      value={`${opportunityScore || 77}/100`}
                      icon={Target}
                      variant="cyan"
                    />
                    <MetricCard
                      title="Generative Visibility Score"
                      value={`${visibilityScore || 82}/100`}
                      icon={Radar}
                      variant="indigo"
                    />
                    <MetricCard
                      title="Estimated Monthly Opportunity"
                      value={`${Math.max(120, opportunityScore * 3)} leads`}
                      icon={Flame}
                      variant="orange"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {analysisData && scanContext && (
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="space-y-6"
              >
                <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50/50 shadow-xl overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl" />
                  <CardHeader className="relative">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl flex items-center gap-2 text-slate-900">
                        <Brain className="w-5 h-5 text-cyan-600" />
                        Opportunity Intelligence
                      </CardTitle>
                      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200">Stage 1 Complete</Badge>
                    </div>
                    <CardDescription className="text-slate-600">
                      AI-powered market analysis • {analysisData.nicheProfile.primaryNiche}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Market Demand</span>
                          <TrendingUp className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div className="text-2xl font-bold text-emerald-900">
                          {analysisData.opportunityBaselineScore?.factors?.marketDemand ?? 'N/A'}
                        </div>
                        <div className="mt-1 text-xs text-emerald-600">High willingness to pay</div>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-amber-700 uppercase tracking-wide">Competition</span>
                          <Flame className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="text-2xl font-bold text-amber-900">
                          {analysisData.opportunityBaselineScore?.factors?.competitionLevel ?? 'N/A'}
                        </div>
                        <div className="mt-1 text-xs text-amber-600">Moderate friction</div>
                      </div>

                      <div className="rounded-xl border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-cyan-700 uppercase tracking-wide">Reddit Presence</span>
                          <Radar className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="text-2xl font-bold text-cyan-900">
                          {analysisData.opportunityBaselineScore?.factors?.redditPresence ?? 'N/A'}
                        </div>
                        <div className="mt-1 text-xs text-cyan-600">Emerging opportunity</div>
                      </div>

                      <div className="rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-violet-700 uppercase tracking-wide">Conversion</span>
                          <Target className="w-4 h-4 text-violet-600" />
                        </div>
                        <div className="text-2xl font-bold text-violet-900">
                          {analysisData.opportunityBaselineScore?.factors?.conversionPotential ?? 'N/A'}
                        </div>
                        <div className="mt-1 text-xs text-violet-600">Strong potential</div>
                      </div>
                    </div>

                    {analysisData.opportunityBaselineScore?.reasoning && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                        <div className="text-xs font-medium text-slate-700 mb-2 uppercase tracking-wide">Strategic Reasoning</div>
                        <p className="text-sm text-slate-600 leading-relaxed">{analysisData.opportunityBaselineScore.reasoning}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-slate-200 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                        <Users className="w-5 h-5 text-indigo-600" />
                        Persona Strategy
                      </CardTitle>
                      <CardDescription className="text-slate-600">Decision maker profile & engagement approach</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {analysisData.personaModel?.demographics && (
                        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-3">
                          <div className="text-xs font-semibold text-indigo-700 mb-2 uppercase tracking-wide">Primary Decision Maker</div>
                          <div className="text-sm font-medium text-slate-900">
                            {analysisData.personaModel.demographics.occupation || 'Technical Leader'}
                          </div>
                          <div className="text-xs text-slate-600 mt-1">
                            {analysisData.personaModel.demographics.age && `${analysisData.personaModel.demographics.age} • `}
                            {analysisData.personaModel.demographics.location || 'United States'}
                          </div>
                        </div>
                      )}

                      {analysisData.personaModel?.painPoints && analysisData.personaModel.painPoints.length > 0 && (
                        <div>
                          <div className="text-xs font-semibold text-slate-700 mb-2 uppercase tracking-wide">Key Pain Points</div>
                          <div className="space-y-2">
                            {analysisData.personaModel.painPoints.slice(0, 3).map((pain, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{pain}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {scanContext.engagementStrategy && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3 space-y-2">
                          <div className="text-xs font-semibold text-emerald-700 mb-2 uppercase tracking-wide">Recommended Engagement</div>
                          <div className="grid gap-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Comment Style:</span>
                              <span className="font-medium text-slate-900">{scanContext.engagementStrategy.commentStyle}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">CTA Approach:</span>
                              <span className="font-medium text-slate-900">{scanContext.engagementStrategy.ctaStyle}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Evidence Type:</span>
                              <span className="font-medium text-slate-900">{scanContext.engagementStrategy.evidenceType}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Risk Tolerance:</span>
                              <Badge
                                className={
                                  scanContext.engagementStrategy.riskTolerance === 'low'
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : scanContext.engagementStrategy.riskTolerance === 'medium-low'
                                      ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                                      : 'bg-amber-100 text-amber-700 border-amber-200'
                                }
                              >
                                {scanContext.engagementStrategy.riskTolerance}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      {analysisData.personaModel?.redditBehavior?.engagementStyle && (
                        <div className="text-xs text-slate-500 italic border-l-2 border-slate-200 pl-3">
                          <strong>Reddit Behavior:</strong> {analysisData.personaModel.redditBehavior.engagementStyle}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                        <Zap className="w-5 h-5 text-orange-600" />
                        Priority Keywords
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        High-intent clusters for Stage 2 targeting
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {scanContext.priorityClusters.slice(0, 4).map((cluster, idx) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 hover:border-cyan-300 hover:bg-cyan-50/30 transition-all"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium text-sm text-slate-900">{cluster.cluster}</div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={
                                  cluster.intent === 'transactional'
                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    : cluster.intent === 'commercial'
                                      ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                                      : 'bg-slate-100 text-slate-700 border-slate-200'
                                }
                              >
                                {cluster.intent}
                              </Badge>
                              {cluster.priority === 'high' && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {cluster.keywords.slice(0, 4).map((kw, kidx) => (
                              <span
                                key={kidx}
                                className="inline-flex items-center gap-1 text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md"
                              >
                                <Tag className="w-3 h-3" />
                                {kw}
                              </span>
                            ))}
                            {cluster.keywords.length > 4 && (
                              <span className="text-xs text-slate-500 px-2 py-0.5">+{cluster.keywords.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {scanContext.subredditSeeds && scanContext.subredditSeeds.length > 0 && (
                  <Card className="border-slate-200 bg-white shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                        <Target className="w-5 h-5 text-violet-600" />
                        Subreddit Targets
                      </CardTitle>
                      <CardDescription className="text-slate-600">
                        Prioritized communities based on persona behavior & confidence scoring
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {scanContext.subredditSeeds.slice(0, 9).map((target, idx) => (
                          <div
                            key={idx}
                            className="rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-3 hover:border-violet-300 hover:shadow-md transition-all"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm text-slate-900">{target.name}</div>
                              <div className="text-xs font-semibold text-violet-600">{Math.round(target.confidence * 100)}%</div>
                            </div>
                            <Badge
                              className={
                                target.type === 'technical-authority'
                                  ? 'bg-indigo-100 text-indigo-700 border-indigo-200 text-xs'
                                  : target.type === 'industry-specific'
                                    ? 'bg-cyan-100 text-cyan-700 border-cyan-200 text-xs'
                                    : 'bg-slate-100 text-slate-700 border-slate-200 text-xs'
                              }
                            >
                              {target.type.replace('-', ' ')}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}>
              <Card className="border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2 text-slate-900"><Sparkles className="w-5 h-5 text-viz-accent" /> VIZ Reddit Toolstack</CardTitle>
                  <CardDescription className="text-slate-600">
                    Designed from proven Reddit marketing patterns: audience research, timing optimization, safety controls, and AI-assisted response quality.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {toolModules.map((module, index) => {
                    const Icon = module.icon;
                    return (
                      <motion.div
                        key={module.title}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, delay: 0.08 + index * 0.05 }}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">{module.title}</div>
                            <div className="text-xs text-slate-500 mt-1">Solves: {module.painPoint}</div>
                          </div>
                          <div className="h-9 w-9 rounded-md bg-slate-100 grid place-items-center">
                            <Icon className={`h-4 w-4 ${module.iconClass}`} />
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-3">{module.capability}</p>
                        <div className="mt-3 text-xs inline-flex items-center rounded-full border border-slate-200 px-2.5 py-1 text-cyan-700 bg-cyan-100">
                          {module.impact}
                        </div>
                      </motion.div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
            <div className="space-y-6">
              <Card className="border-slate-200 bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-slate-900">1) Business Context</CardTitle>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Stage 1</Badge>
                  </div>
                  <CardDescription className="text-slate-600">Define offer, buyer, competitors, and objective to calibrate discovery.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="Website URL" className="bg-white border-slate-200" />
                    <Input value={targetRegion} onChange={(e) => setTargetRegion(e.target.value)} placeholder="Target region" className="bg-white border-slate-200" />
                  </div>
                  <Input
                    value={competitorSet}
                    onChange={(e) => setCompetitorSet(e.target.value)}
                    placeholder="Top competitors (comma-separated): competitor1.com, competitor2.com, competitor3.com"
                    className="bg-white border-slate-200"
                  />
                  <Textarea value={businessContext} onChange={(e) => setBusinessContext(e.target.value)} placeholder="What do you sell? Why do customers buy from you?" className="min-h-[90px] bg-white border-slate-200" />
                  <Textarea value={targetAudience} onChange={(e) => setTargetAudience(e.target.value)} placeholder="Who is your ideal buyer?" className="min-h-[90px] bg-white border-slate-200" />
                  <p className="text-xs text-slate-500">Tip: include 2-3 differentiators so the AI drafts match your positioning and tone.</p>
                  <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <Select value={goal} onValueChange={(value: Goal) => setGoal(value)}>
                      <SelectTrigger className="bg-white border-slate-200">
                        <SelectValue placeholder="Select goal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead_generation">Lead Generation</SelectItem>
                        <SelectItem value="authority">Authority Building</SelectItem>
                        <SelectItem value="seo_visibility">SEO Visibility</SelectItem>
                        <SelectItem value="geo_visibility">GEO Visibility</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={runScan} disabled={scanning} className="bg-cyan-600 hover:bg-cyan-500 text-white disabled:opacity-50">
                      {scanning ? 'Scanning...' : 'Run Opportunity Scan'} <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-slate-900">2) Subreddit Intelligence</CardTitle>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Stage 2</Badge>
                  </div>
                  <CardDescription className="text-slate-600">Ranked by lead probability, activity, and moderation risk.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-100">
                        <TableHead>Subreddit</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Activity</TableHead>
                        <TableHead>Buyer Intent</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Lead Probability</TableHead>
                        <TableHead>Best Format</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subredditData.map((row) => (
                        <TableRow key={row.name} className="border-slate-100">
                          <TableCell className="font-medium text-slate-900">{row.name}</TableCell>
                          <TableCell>{row.members}</TableCell>
                          <TableCell>{row.activity}</TableCell>
                          <TableCell>{row.buyerIntent}</TableCell>
                          <TableCell className={row.risk > 45 ? 'text-amber-500' : 'text-emerald-600'}>{row.risk}</TableCell>
                          <TableCell>{row.leadProbability}</TableCell>
                          <TableCell className="text-slate-600">{row.bestFormat}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-slate-900">3) Live Thread Opportunities</CardTitle>
                    <Badge className="bg-slate-100 text-slate-700 border border-slate-200">Stage 3</Badge>
                  </div>
                  <CardDescription className="text-slate-600">Filter by subreddit, intent, and timing to prioritize actionable threads.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <Select value={selectedSubreddit} onValueChange={setSelectedSubreddit}>
                      <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Subreddit" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All subreddits</SelectItem>
                        {subredditData.map((row) => <SelectItem key={row.name} value={row.name}>{row.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={intentFilter} onValueChange={(value: 'all' | IntentType) => setIntentFilter(value)}>
                      <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Intent" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All intents</SelectItem>
                        <SelectItem value="Question">Question</SelectItem>
                        <SelectItem value="Comparison">Comparison</SelectItem>
                        <SelectItem value="Complaint">Complaint</SelectItem>
                        <SelectItem value="Recommendation">Recommendation</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 bg-slate-50">
                      <span className="text-sm text-slate-700">Last 24 hours</span>
                      <Switch checked={last24Only} onCheckedChange={setLast24Only} />
                    </div>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead>Thread</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Lead Score</TableHead>
                        <TableHead>Risk</TableHead>
                        <TableHead>Posted</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredThreads.map((thread) => (
                        <TableRow key={thread.id} className="border-slate-100">
                          <TableCell>{thread.title}</TableCell>
                          <TableCell>{thread.intent}</TableCell>
                          <TableCell className="text-emerald-600">{thread.leadScore}</TableCell>
                          <TableCell className={thread.riskScore > 35 ? 'text-amber-500' : 'text-cyan-600'}>{thread.riskScore}</TableCell>
                          <TableCell>{thread.hoursAgo}h ago</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => openCommentDrawer(thread)} className="bg-slate-900 text-white hover:bg-slate-800">
                              Generate Reply
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filteredThreads.length && (
                        <TableRow className="border-slate-100">
                          <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                            No live threads match your filter set. Relax filters or disable the 24h constraint.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-slate-900"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Community-First Guardrails</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  {guardrailChecklist.map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{item}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2 text-slate-900"><Shield className="w-4 h-4 text-cyan-500" /> Account Risk Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-slate-600"><span>Safe Mode</span><Switch checked={safeMode} onCheckedChange={setSafeMode} /></div>
                  <div>
                    <div className="flex justify-between text-xs mb-1 text-slate-500">
                      <span>Promotion Risk</span>
                      <span>{accountRisk ? accountRisk.riskLevel : (safeMode ? 'Low' : 'Medium')}</span>
                    </div>
                    <Progress value={accountRisk ? accountRisk.riskScore * 100 : (safeMode ? 24 : 47)} className="h-2" />
                  </div>
                  <p className="text-xs text-slate-500 flex gap-2"><AlertTriangle className="w-3 h-3 mt-0.5 text-amber-500" />Value-first response mode reduces moderation flags.</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader><CardTitle className="text-base text-slate-900">Usage Meter</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Comments generated</span>
                      <span>{analytics?.summary.totalComments || 182} / 500</span>
                    </div>
                    <Progress value={((analytics?.summary.totalComments || 182) / 500) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1"><span>Subreddits tracked</span><span>14 / 30</span></div>
                    <Progress value={47} className="h-2" />
                  </div>
                  <div className="text-xs text-slate-500">Goal focus: {goalLabel[goal]}</div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardHeader><CardTitle className="text-base flex items-center gap-2 text-slate-900"><Gauge className="w-4 h-4 text-emerald-500" /> Performance Dashboard</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm text-slate-600">
                  <div className="flex justify-between">
                    <span>Engagement rate</span>
                    <span className="text-emerald-600">
                      {analytics ? `${(analytics.summary.engagementRate * 100).toFixed(1)}%` : '78%'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg score</span>
                    <span>{analytics ? analytics.summary.averageScore.toFixed(1) : '2.6'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total upvotes</span>
                    <span className="text-cyan-600">{analytics ? analytics.summary.totalUpvotes : '3420'}</span>
                  </div>
                  <div className="flex justify-between"><span>Status</span><span>{analyzed ? 'Ready' : 'Awaiting scan'}</span></div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white shadow-sm">
                <CardContent className="p-5 text-sm text-slate-600">
                  <div className="flex items-center gap-2 mb-2 text-slate-900"><Sparkles className="w-4 h-4 text-cyan-500" /> AI Comment Generator • Stage 4</div>
                  <p>Open any thread row to generate tone-tuned, risk-aware responses before posting.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        </main>

        <GlobalFooter variant="default" />
      </div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-xl bg-white border-slate-200 text-slate-900 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>4) AI Comment Generator</SheetTitle>
            <SheetDescription className="text-slate-600">
              {selectedThread ? `${selectedThread.subreddit} • ${selectedThread.intent}` : 'Select a thread to generate'}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            {selectedThread && (
              <>
                <Card className="border-slate-200 bg-slate-50">
                  <CardContent className="p-4 text-sm text-slate-700">{selectedThread.title}</CardContent>
                </Card>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                    <div className="text-slate-500">Lead score</div>
                    <div className="text-lg font-semibold text-emerald-600">{selectedThread.leadScore}</div>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-500">
                    <div className="text-slate-500">Moderation risk</div>
                    <div className="text-lg font-semibold text-orange-500">{selectedThread.riskScore}</div>
                  </div>
                </div>
              </>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={tone} onValueChange={(value: Tone) => setTone(value)}>
                <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Tone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>

              <Select value={length} onValueChange={(value: Length) => setLength(value)}>
                <SelectTrigger className="bg-white border-slate-200"><SelectValue placeholder="Length" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Button variant={variant === 'authority' ? 'default' : 'outline'} onClick={() => setVariant('authority')}>Authority Insight</Button>
              <Button variant={variant === 'practical' ? 'default' : 'outline'} onClick={() => setVariant('practical')}>Practical Recommendation</Button>
              <Button variant={variant === 'educational' ? 'default' : 'outline'} onClick={() => setVariant('educational')}>Educational Breakdown</Button>
            </div>

            <Textarea value={finalComment} readOnly className="min-h-[190px] bg-slate-50 border-slate-200 text-slate-700" />

            <Button onClick={copyComment} className="w-full bg-viz-accent hover:bg-viz-accent/90 text-white">
              <Copy className="w-4 h-4 mr-2" /> Copy Final Comment
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const metricVariants: Record<string, string> = {
  cyan: 'bg-gradient-to-r from-cyan-500 to-sky-500 text-white border-transparent',
  indigo: 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-transparent',
  orange: 'bg-gradient-to-r from-orange-500 to-amber-400 text-white border-transparent',
  default: 'bg-slate-900/70 border-slate-800 text-white',
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  variant = 'default',
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  variant?: keyof typeof metricVariants;
}) => (
  <div className={`rounded-xl border p-4 shadow-sm ${metricVariants[variant] || metricVariants.default}`}>
    <div className="flex items-center justify-between gap-3">
      <div>
        <div className="text-xs uppercase tracking-wide opacity-80">{title}</div>
        <div className="mt-1 text-xl font-semibold">{value}</div>
      </div>
      <div className="w-9 h-9 rounded-md bg-white/15 grid place-items-center">
        <Icon className="w-4 h-4" />
      </div>
    </div>
  </div>
);

export default RedditGeoAgent;
