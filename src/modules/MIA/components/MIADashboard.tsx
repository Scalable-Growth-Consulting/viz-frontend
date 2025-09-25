import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  MousePointer,
  Eye,
  RefreshCw,
  Settings,
  MessageSquare,
  BarChart3,
  PieChart,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Brain,
  Users,
  Palette,
  Wallet,
  Database,
  Linkedin,
  Twitter,
  ShoppingCart,
  Store,
  Wand2,
  Tag,
  Image,
  Video,
  FileDown,
  Globe2,
} from 'lucide-react';
import { Campaign, PlatformMetrics, DashboardFilters } from '../types';
import { seoGeoService } from '../services/seoGeoService';
import { AdInsight } from '../types/insights';
import { AnalyticsService } from '../services/analyticsService';
import { AIChatService } from '../services/aiChatService';
import MIAMetricsCards from './MIAMetricsCards';
import MIAPerformanceChart from './MIAPerformanceChart';
import MIACampaignTable from './MIACampaignTable';
import MIAInsightsPanel from './MIAInsightsPanel';
import MIAChatInterface from './MIAChatInterface';
import MIAIntegrationStatus from './MIAIntegrationStatus';
import MIAMetaIntegration from './MIAMetaIntegration';
import MIAGoogleIntegration from './MIAGoogleIntegration';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, RadialBarChart, RadialBar } from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface MIADashboardProps {
  userId: string;
}

const MIADashboard: React.FC<MIADashboardProps> = ({ userId }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  type Section = 'quickwins' | 'insights' | 'actions' | 'sources' | 'quality' | 'seogeo' | 'budget' | 'attribution' | 'settings' | 'mmm' | 'audience' | 'chat';
  const [activeSection, setActiveSection] = useState<Section>('quickwins');
  const [filters, setFilters] = useState<DashboardFilters>({
    platforms: [],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const { toast } = useToast();
  const aiChatService = new AIChatService(campaigns);

  // Convert PerformanceInsight to AdInsight for compatibility
  const convertToAdInsights = (performanceInsights: any[]): AdInsight[] => {
    return performanceInsights.map((insight, index) => ({
      id: `insight_${index + 1}`,
      type: insight.type as any,
      severity: insight.severity as any,
      title: insight.title,
      description: insight.description,
      recommendation: insight.recommendation,
      estimatedImpact: insight.estimatedImpact || 'Medium',
      confidence: 85, // Default confidence
      dataPoints: ['performance_metrics'],
      platform: 'cross-platform' as const,
      campaignId: insight.campaignId,
      adSetId: insight.adGroupId,
      timeframe: '30 days',
      actionable: true,
      automationPossible: false
    }));
  };

  useEffect(() => {
    loadDashboardData();
  }, [filters]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from your API/database
      // Impressive demo data for professional showcase
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Black Friday Mega Sale - Meta',
          platform: 'meta',
          status: 'active',
          budget: 25000,
          spend: 23750,
          impressions: 2850000,
          clicks: 142500,
          conversions: 3420,
          ctr: 5.0,
          cpa: 6.94,
          roas: 485,
          startDate: '2024-01-15T00:00:00Z',
          createdAt: '2024-01-15T00:00:00Z',
          updatedAt: '2024-01-20T00:00:00Z',
        },
        {
          id: '2',
          name: 'Premium Brand Campaign - Google',
          platform: 'google',
          status: 'active',
          budget: 18000,
          spend: 17250,
          impressions: 1950000,
          clicks: 97500,
          conversions: 2145,
          ctr: 5.0,
          cpa: 8.04,
          roas: 378,
          startDate: '2024-01-10T00:00:00Z',
          createdAt: '2024-01-10T00:00:00Z',
          updatedAt: '2024-01-18T00:00:00Z',
        },
        {
          id: '3',
          name: 'Holiday Collection - LinkedIn',
          platform: 'linkedin',
          status: 'active',
          budget: 12000,
          spend: 11400,
          impressions: 850000,
          clicks: 34000,
          conversions: 1020,
          ctr: 4.0,
          cpa: 11.18,
          roas: 295,
          startDate: '2024-01-05T00:00:00Z',
          createdAt: '2024-01-05T00:00:00Z',
          updatedAt: '2024-01-15T00:00:00Z',
        },
        {
          id: '4',
          name: 'Viral Video Campaign - TikTok',
          platform: 'tiktok',
          status: 'active',
          budget: 8500,
          spend: 8075,
          impressions: 3200000,
          clicks: 160000,
          conversions: 1280,
          ctr: 5.0,
          cpa: 6.31,
          roas: 425,
          startDate: '2024-01-12T00:00:00Z',
          createdAt: '2024-01-12T00:00:00Z',
          updatedAt: '2024-01-22T00:00:00Z',
        },
        {
          id: '5',
          name: 'Retargeting Masterclass - Meta',
          platform: 'meta',
          status: 'active',
          budget: 15000,
          spend: 14250,
          impressions: 1200000,
          clicks: 84000,
          conversions: 2520,
          ctr: 7.0,
          cpa: 5.65,
          roas: 520,
          startDate: '2024-01-08T00:00:00Z',
          createdAt: '2024-01-08T00:00:00Z',
          updatedAt: '2024-01-25T00:00:00Z',
        },
        {
          id: '6',
          name: 'Search Domination - Google',
          platform: 'google',
          status: 'active',
          budget: 22000,
          spend: 20900,
          impressions: 1650000,
          clicks: 115500,
          conversions: 3465,
          ctr: 7.0,
          cpa: 6.03,
          roas: 445,
          startDate: '2024-01-03T00:00:00Z',
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-28T00:00:00Z',
        },
      ];

      const filteredCampaigns = AnalyticsService.filterCampaigns(mockCampaigns, filters);
      const metrics = AnalyticsService.calculatePlatformMetrics(filteredCampaigns);
      const generatedInsights = AnalyticsService.generateInsights(filteredCampaigns);

      setCampaigns(filteredCampaigns);
      setPlatformMetrics(metrics);
      setInsights(convertToAdInsights(generatedInsights));
      aiChatService.updateData(filteredCampaigns);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadDashboardData();
      toast({
        title: 'Sync Complete',
        description: 'Campaign data has been updated successfully.',
      });
    } catch (error) {
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync campaign data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<DashboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-viz-accent" />
          <p className="text-muted-foreground">Loading marketing intelligence...</p>
        </div>
      </div>
    );
  }

  // Sidebar navigation button
  const NavButton: React.FC<{ id: Section; label: string; icon: React.ElementType; gradient: string; desc?: string }>
    = ({ id, label, icon: Icon, gradient, desc }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
        activeSection === id
          ? `${gradient} text-white shadow-md border-transparent`
          : 'bg-white/70 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeSection === id ? 'bg-white/20' : 'bg-white/70 dark:bg-viz-dark/70'}`}>
        <Icon className={`w-5 h-5 ${activeSection === id ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        {activeSection === id && desc && (
          <div className="text-sm text-white/85 line-clamp-2">{desc}</div>
        )}
      </div>
      {activeSection === id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );

  // Panels
  const InsightsPanel: React.FC = () => (
    <>
      {/* Filters Section */}
      <Card className="mb-8 bg-white/80 dark:bg-viz-medium/70 backdrop-blur border border-slate-200/60 dark:border-viz-light/20 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[70px]">
                Platform:
              </label>
              <Select
                value={filters.platforms[0] || 'all'}
                onValueChange={(value) => 
                  handleFilterChange({ 
                    platforms: value === 'all' ? [] : [value] 
                  })
                }
              >
                <SelectTrigger className="w-40 border-slate-200 dark:border-viz-light/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="meta">Meta</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 min-w-[85px]">
                Date Range:
              </label>
              <DatePickerWithRange
                value={{
                  from: new Date(filters.dateRange.start),
                  to: new Date(filters.dateRange.end),
                }}
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    handleFilterChange({
                      dateRange: {
                        start: range.from.toISOString().split('T')[0],
                        end: range.to.toISOString().split('T')[0],
                      },
                    });
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="bg-white/80 dark:bg-viz-medium/70 backdrop-blur border border-slate-200/60 dark:border-viz-light/20 rounded-2xl p-1 shadow-sm">
          <TabsList className="grid w-full grid-cols-4 bg-slate-50/70 dark:bg-viz-dark/40 rounded-xl p-1 h-auto">
            <TabsTrigger 
              value="overview" 
              className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viz-accent/40"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="campaigns" 
              className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viz-accent/40"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Campaigns</span>
            </TabsTrigger>
            <TabsTrigger 
              value="insights" 
              className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viz-accent/40"
            >
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger 
              value="chat" 
              className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-viz-accent/40"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">AI Chat</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-8 mt-8">
          <MIAMetricsCards 
            campaigns={campaigns} 
            platformMetrics={platformMetrics} 
          />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <MIAPerformanceChart campaigns={campaigns} />
            <MIAInsightsPanel insights={insights.slice(0, 5)} />
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-sm">
              <CardHeader>
                <CardTitle>Attribution Snapshot</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                  <span>Meta</span>
                  <span className="font-semibold">62%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                  <span>Google</span>
                  <span className="font-semibold">38%</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 pt-1">Top path: Ad → LP → Checkout</div>
              </CardContent>
            </Card>
            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> Forecast (next 14 days)</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                    <div className="text-xs text-slate-500">Spend</div>
                    <div className="font-bold">+8%</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                    <div className="text-xs text-slate-500">Conversions</div>
                    <div className="font-bold">+12%</div>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                    <div className="text-xs text-slate-500">ROAS</div>
                    <div className="font-bold">+4%</div>
                  </div>
                </div>
                <div className="text-slate-600 dark:text-slate-300">Assumptions: steady promo calendar, no stockouts, current bid strategy.</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-8 mt-8">
          <MIACampaignTable campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-8 mt-8">
          <MIAInsightsPanel insights={insights} showAll />
        </TabsContent>

        <TabsContent value="chat" className="space-y-8 mt-8">
          <MIAChatInterface />
        </TabsContent>
      </Tabs>
    </>
  );
  // ...

  // QuickWins landing panel
  const QuickWinsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: 'Profit ROAS', value: '3.8x' },
              { label: 'Total Profit (30d)', value: '$124k' },
              { label: 'Total Spend', value: '$58k' },
              { label: 'Incr. Revenue', value: '$86k' },
              { label: 'Inventory Risk', value: '6 days' },
              { label: 'QuickWins', value: '3' },
            ].map((k) => (
              <div key={k.label} className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 p-3 bg-white/60 dark:bg-viz-dark/40">
                <div className="text-xs text-slate-500 dark:text-slate-300">{k.label}</div>
                <div className="text-lg font-bold">{k.value}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 dark:bg-viz-medium/85 border border-slate-200/60 dark:border-viz-light/20 shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-viz-accent" /> Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {/* SWOT grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200/50 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-900/10">
              <div className="font-semibold mb-1 flex items-center gap-2 text-emerald-800 dark:text-emerald-300"><TrendingUp className="w-4 h-4" /> Strengths</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Retargeting ROAS 4.2x (p80 vs peers)</li>
                <li>High AOV on repeat buyers (+18%)</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-rose-200/50 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-900/10">
              <div className="font-semibold mb-1 flex items-center gap-2 text-rose-800 dark:text-rose-300"><TrendingDown className="w-4 h-4" /> Weaknesses</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>CPC on Google Brand +35% vs 7d avg</li>
                <li>Top SKU stock risk in 6–10 days</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-indigo-200/50 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-900/10">
              <div className="font-semibold mb-1 flex items-center gap-2 text-indigo-800 dark:text-indigo-300"><Target className="w-4 h-4" /> Opportunities</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Shift +10% to Meta high-LTV segment</li>
                <li>Launch bundle promo for top margin set</li>
              </ul>
            </div>
            <div className="p-4 rounded-xl border border-amber-200/50 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-900/10">
              <div className="font-semibold mb-1 flex items-center gap-2 text-amber-800 dark:text-amber-300"><AlertTriangle className="w-4 h-4" /> Threats</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li>Attribution mismatch vs GA4 on 2 paths</li>
                <li>Creative fatigue in prospecting set</li>
              </ul>
            </div>
          </div>
          {/* Channel opportunities + actions */}
          <div className="grid md:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">Opportunities by Channel</div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">Meta +$1.2k</Badge>
                <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">Google +$900</Badge>
                <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">TikTok +$300</Badge>
              </div>
            </div>
            <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Risk Alerts</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>2 SKUs trending to stockout; throttle prospecting by 15% temporarily.</li>
                <li>Tracking drop on 1 landing page; verify pixel and GA4 events.</li>
              </ul>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" className="rounded-full bg-gradient-to-r from-viz-accent to-blue-600 text-white">Generate Weekly Plan</Button>
            <Button size="sm" variant="outline" className="rounded-full">Download PDF</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/90 dark:bg-viz-medium/85 border border-slate-200/60 dark:border-viz-light/20 shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Zap className="w-5 h-5 text-viz-accent" /> QuickWins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { title: 'Reallocate $150/day from Prospecting A → Retargeting B', impact: '+$900/mo', action: 'Shift budget now', tags: ['ROAS','CAC'] },
            { title: 'Pause low-ROAS Creative C (ROAS 0.6x)', impact: '+$400/mo', action: 'Pause 24h', tags: ['ROAS','CPC'] },
            { title: 'Increase bid cap on Meta Retargeting', impact: '+$300/mo', action: 'Raise by 10%', tags: ['ROI','AOV'] },
          ].map((w) => (
            <div key={w.title} className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-gradient-to-r from-white/80 to-slate-50 dark:from-viz-dark/40 dark:to-viz-dark/20 flex items-start justify-between gap-3">
              <div>
                <div className="font-medium flex items-center gap-2">
                  {w.title}
                  <div className="flex flex-wrap gap-1">
                    {w.tags.map(t => (
                      <Badge key={t} variant="secondary" className="text-[10px] px-2 py-0.5 inline-flex items-center gap-1"><Tag className="w-3 h-3" /> {t}</Badge>
                    ))}
                  </div>
                </div>
                <div className="text-slate-600 dark:text-slate-300 text-sm">Estimated impact: {w.impact}</div>
              </div>
              <Button size="sm" className="rounded-full">{w.action}</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // ...

  // SEO & GEO (Gen AI Engine Optimization) panel
  const SeoGeoPanel: React.FC = () => {
    const [url, setUrl] = useState('');
    const [html, setHtml] = useState('');
    const [primaryKeyword, setPrimaryKeyword] = useState('');
    const [targetMarket, setTargetMarket] = useState('');
    const [competitors, setCompetitors] = useState<string[]>(['', '', '']);
    const [loading, setLoading] = useState(false);
    const [includePsi, setIncludePsi] = useState(false);
    const [psiKey, setPsiKey] = useState<string>(
      (import.meta as any).env?.VITE_PSI_API_KEY || (import.meta as any).env?.VITE_PAGESPEED_API_KEY || ''
    );
    const [result, setResult] = useState<any | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [demoMode, setDemoMode] = useState(false);

    const { toast } = useToast();

    const overallScore = useMemo(() => {
      if (!result) return undefined;
      const seo = Number(result.seoScore ?? 0);
      const geo = Number(result.geoScore ?? 0);
      return Math.round(seo * 0.6 + geo * 0.4);
    }, [result]);

    const recommendedTitle = useMemo(() => {
      if (!result) return '';
      const pk = primaryKeyword.trim();
      let brand = 'Your Brand';
      try { brand = new URL(result?.url || url || window.location.href).hostname.replace('www.', ''); } catch { /* noop */ }
      if (pk) return `${pk} | ${brand}`.slice(0, 64);
      return `${result?.metrics?.title || 'Home'} | ${brand}`.slice(0, 64);
    }, [result, primaryKeyword, url]);

    const recommendedDescription = useMemo(() => {
      if (!result) return '';
      const pk = primaryKeyword.trim();
      const benefits = ['fast', 'reliable', 'trusted', 'affordable'];
      const msg = pk
        ? `Discover ${pk} — ${benefits[0]} and ${benefits[1]}. Get started today.`
        : `Discover what makes us ${benefits[0]} and ${benefits[1]}. Get started today.`;
      return msg.slice(0, 155);
    }, [result, primaryKeyword]);

    const analyzeViaUrl = async () => {
      if (!url) return toast({ title: 'Enter URL', description: 'Please provide a valid URL to analyze.' });
      try {
        setLoading(true);
        const page = await seoGeoService.fetchPage(url);
        const analysis = seoGeoService.analyzeHtml(page, url);
        if (includePsi) {
          try {
            const psi = await seoGeoService.runPageSpeedInsights(url, psiKey);
            (analysis as any).psi = psi;
          } catch (e) {
            console.warn('PSI error', e);
          }
        }
        // Attach demo-style extras for UI richness
        (analysis as any).pillars = {
          visibility: Math.round((analysis.seoScore ?? 0) * 0.9),
          trust: Math.round(((analysis.metrics?.schemaTypes?.length ? 10 : 0) + (analysis.psi?.bestPractices ?? 0)) / 2),
          relevance: Math.round(((analysis.seoScore ?? 0) * 0.5) + ((analysis.geoScore ?? 0) * 0.5)),
        };
        (analysis as any).topQuickFixes = [
          'Optimize title to 50–60 chars with keyword near start',
          'Write a compelling meta description (120–160 chars)',
          'Ensure exactly one H1; use H2/H3 for structure',
        ];
        (analysis as any).missedOpportunities = [
          'Add FAQ schema for answerability',
          'Add internal links to pillar pages',
          'Include local city/region terms for GEO',
        ];
        (analysis as any).competitorKeywordOverlap = competitors
          .filter(Boolean)
          .map((c, i) => ({ competitor: c, overlap: 40 + i * 15 })); // placeholder estimate
        setResult(analysis as any);
      } catch (e) {
        console.error(e);
        toast({ title: 'Analysis failed', description: 'Could not fetch or analyze the page.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    const analyzeViaHtml = async () => {
      if (!html.trim()) return toast({ title: 'Paste HTML', description: 'Provide HTML markup to analyze.' });
      try {
        setLoading(true);
        const analysis = seoGeoService.analyzeHtml(html, url || undefined);
        (analysis as any).pillars = {
          visibility: Math.round((analysis.seoScore ?? 0) * 0.9),
          trust: Math.round(((analysis.metrics?.schemaTypes?.length ? 10 : 0) + (analysis.psi?.bestPractices ?? 0)) / 2),
          relevance: Math.round(((analysis.seoScore ?? 0) * 0.5) + ((analysis.geoScore ?? 0) * 0.5)),
        };
        (analysis as any).topQuickFixes = [
          'Optimize title to 50–60 chars with keyword near start',
          'Write a compelling meta description (120–160 chars)',
          'Ensure exactly one H1; use H2/H3 for structure',
        ];
        (analysis as any).missedOpportunities = [
          'Add FAQ schema for answerability',
          'Add internal links to pillar pages',
          'Include local city/region terms for GEO',
        ];
        (analysis as any).competitorKeywordOverlap = competitors
          .filter(Boolean)
          .map((c, i) => ({ competitor: c, overlap: 40 + i * 15 }));
        setResult(analysis as any);
      } catch (e) {
        console.error(e);
        toast({ title: 'Analysis failed', description: 'Invalid HTML content.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    const ScoreCard: React.FC<{ label: string; value?: number; tone: 'emerald' | 'violet' | 'blue' | 'amber'; }> = ({ label, value, tone }) => (
      <div className={`p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40`}> 
        <div className="text-xs text-slate-500">{label}</div>
        <div className={`text-2xl font-extrabold ${tone === 'emerald' ? 'text-emerald-600' : tone === 'violet' ? 'text-violet-600' : tone === 'blue' ? 'text-blue-600' : 'text-amber-600'}`}>{value ?? '—'}</div>
      </div>
    );

    const ScoreDial: React.FC<{ score?: number }> = ({ score }) => {
      const data = [{ name: 'Score', value: score ?? 0, fill: 'url(#grad2)' }];
      const bg = [{ name: 'bg', value: 100, fill: 'rgba(148,163,184,0.15)' }];
      return (
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart innerRadius="70%" outerRadius="100%" data={bg} startAngle={90} endAngle={-270}>
            <RadialBar minPointSize={15} dataKey="value" cornerRadius={8} background clockWise />
            <RadialBar dataKey="value" data={data} cornerRadius={8} clockWise />
            <defs>
              <linearGradient id="grad2" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </RadialBarChart>
        </ResponsiveContainer>
      );
    };

    const loadDemoReport = () => {
      setDemoMode(true);
      const demo: any = {
        url: url || 'https://brand.example/landing',
        seoScore: 82,
        geoScore: 76,
        psi: { overall: 78, seo: 85, performance: 72, accessibility: 88, bestPractices: 90 },
        metrics: {
          title: 'Next‑Gen CRM for Startups — Close More, Faster',
          titleLength: 49,
          metaDescription: 'All‑in‑one CRM built for speed. Automations, pipelines, AI emails. Try it free.',
          metaDescriptionLength: 117,
          h1Count: 1,
          h2Count: 6,
          canonical: 'https://brand.example/landing',
          robotsMeta: 'index,follow',
          lang: 'en',
          ogTags: ['og:title','og:description','og:image'],
          twitterTags: ['twitter:card','twitter:title','twitter:description'],
          schemaTypes: ['Organization','WebSite','FAQPage'],
          images: { total: 18, missingAlt: 2 },
          links: { internal: 42, external: 6 },
          wordCount: 1280,
          listCount: 7,
          tableCount: 1,
          faqPresent: true,
          howToPresent: false,
          summaryPresent: true,
        },
        issues: [
          { severity: 'medium', message: 'Meta description slightly short; aim for ~140–155 characters' },
          { severity: 'low', message: '2 images missing alt text' },
        ],
        recommendations: [
          'Add HowTo schema for onboarding steps to improve snippet eligibility.',
          'Link pricing page from hero for faster crawl discovery.',
        ],
        generated: {
          faqJsonLd: '{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}',
          howToJsonLd: '{"@context":"https://schema.org","@type":"HowTo","name":"Get started"}',
          summary: 'A concise summary about the page content for AI readiness.'
        },
        pillars: { visibility: 85, trust: 72, relevance: 79 },
        topQuickFixes: [
          'Increase meta description to ~150 chars with value prop + CTA',
          'Add alt text for 2 images in hero and testimonials section',
          'Add internal links from blog posts to this landing page',
        ],
        missedOpportunities: [
          'Create a geo‑targeted variant for New York and London',
          'Publish a step‑by‑step onboarding HowTo',
          'Add Product schema to key features section',
        ],
        competitorKeywordOverlap: [
          { competitor: 'https://competitor-a.com', overlap: 62 },
          { competitor: 'https://competitor-b.com', overlap: 48 },
          { competitor: 'https://competitor-c.com', overlap: 36 },
        ],
      };
      setResult(demo);
    };

    const handleExportPDF = async () => {
      if (!containerRef.current) return;
      const canvas = await html2canvas(containerRef.current, { scale: 2, backgroundColor: '#0B0F1A' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = canvas.height * (imgWidth / canvas.width);
      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save('mia-seo-geo-scorecard.pdf');
    };

    const handleSaveImage = async () => {
      if (!containerRef.current) return;
      const canvas = await html2canvas(containerRef.current, { scale: 2, backgroundColor: '#0B0F1A' });
      const link = document.createElement('a');
      link.download = 'mia-seo-geo-scorecard.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    return (
      <div className="space-y-6">
        <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-viz-accent" /> SEO & GEO Checker</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" className="rounded-full" onClick={loadDemoReport}>Load Demo Report</Button>
                <label className="text-xs inline-flex items-center gap-2">
                  <input type="checkbox" checked={demoMode} onChange={(e)=> setDemoMode(e.target.checked)} /> Demo Mode
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Website URL</label>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/page" className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none" />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={analyzeViaUrl} disabled={loading} className="rounded-full">
                    {loading ? 'Analyzing…' : 'Analyze URL'}
                  </Button>
                  <label className="inline-flex items-center gap-2 text-xs">
                    <input type="checkbox" checked={includePsi} onChange={e => setIncludePsi(e.target.checked)} /> Include PageSpeed Insights
                  </label>
                </div>
                {includePsi && (
                  <input value={psiKey} onChange={e => setPsiKey(e.target.value)} placeholder="PSI API Key (optional)" className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-xs font-medium">Target Market</label>
                    <input value={targetMarket} onChange={(e)=> setTargetMarket(e.target.value)} placeholder="e.g., New York, USA" className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Primary Keyword</label>
                    <input value={primaryKeyword} onChange={(e)=> setPrimaryKeyword(e.target.value)} placeholder="e.g., best crm for startups" className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Or paste HTML</label>
                <textarea value={html} onChange={e => setHtml(e.target.value)} placeholder="<!doctype html>..." rows={7} className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                <div>
                  <Button size="sm" variant="outline" onClick={analyzeViaHtml} disabled={loading} className="rounded-full">Analyze HTML</Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Competitor URLs (optional)</label>
                <Badge variant="outline">Up to 3</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {[0,1,2].map((i)=> (
                  <input key={i} value={competitors[i] || ''} onChange={(e)=> {
                    const next = [...competitors]; next[i] = e.target.value; setCompetitors(next);
                  }} placeholder={`https://competitor${i+1}.com`} className="w-full px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {result && (
          <div ref={containerRef} className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div className="space-y-1">
                <div className="text-xl font-bold">SEO & GEO Scorecard</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">{result.url || 'HTML input'}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSaveImage} className="rounded-full"><Image className="w-4 h-4 mr-1" /> Save Image</Button>
                <Button size="sm" onClick={handleExportPDF} className="rounded-full"><FileDown className="w-4 h-4 mr-1" /> Export PDF</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader className="pb-0"><CardTitle className="text-sm">Overall Score</CardTitle></CardHeader>
                <CardContent>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center"><div className="text-3xl font-extrabold">{overallScore ?? '—'}</div></div>
                    <ScoreDial score={overallScore} />
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2 bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm">Pillars</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Visibility</div><div className="font-semibold">{result.pillars?.visibility ?? '—'}</div></div>
                    <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Trust</div><div className="font-semibold">{result.pillars?.trust ?? '—'}</div></div>
                    <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Relevance</div><div className="font-semibold">{result.pillars?.relevance ?? '—'}</div></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="text-base">Scores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <ScoreCard label="SEO Score" value={(result as any).seoScore} tone="emerald" />
                  <ScoreCard label="GEO Score" value={(result as any).geoScore} tone="violet" />
                  <ScoreCard label="PSI SEO" value={(result as any).psi?.seo} tone="blue" />
                  <ScoreCard label="PSI Perf" value={(result as any).psi?.performance} tone="amber" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="text-base">Key Metrics</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-3 text-sm">
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Title</div><div className="font-semibold truncate">{(result as any).metrics.title || '—'}</div><div className="text-xs">{(result as any).metrics.titleLength} chars</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Meta Description</div><div className="truncate">{(result as any).metrics.metaDescription || '—'}</div><div className="text-xs">{(result as any).metrics.metaDescriptionLength} chars</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Headings</div><div>H1: {(result as any).metrics.h1Count} • H2: {(result as any).metrics.h2Count}</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Images</div><div>Total: {(result as any).metrics.images.total} • Missing alt: {(result as any).metrics.images.missingAlt}</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Links</div><div>Internal: {(result as any).metrics.links.internal} • External: {(result as any).metrics.links.external}</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Schema</div><div className="truncate">{(result as any).metrics.schemaTypes.join(', ') || '—'}</div></div>
              </CardContent>
            </Card>

            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Globe2 className="w-4 h-4" /> GEO Signals</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-3 text-sm">
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Language</div><div>{(result as any).metrics.lang || '—'}</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">FAQ schema</div><div>{(result as any).metrics.faqPresent ? 'Yes' : 'No'}</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">HowTo schema</div><div>{(result as any).metrics.howToPresent ? 'Yes' : 'No'}</div></div>
                <div className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20"><div className="text-xs text-slate-500">Summary near top</div><div>{(result as any).metrics.summaryPresent ? 'Yes' : 'No'}</div></div>
              </CardContent>
            </Card>

            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="text-base">Competitors — Keyword Overlap</CardTitle>
              </CardHeader>
              <CardContent>
                {result.competitorKeywordOverlap?.length ? (
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={result.competitorKeywordOverlap}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="competitor" hide />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="overlap" fill="#60a5fa" radius={[6,6,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300">Add competitor URLs above or load the demo report.</div>
                )}
              </CardContent>
            </Card>

            {(result as any).issues?.length > 0 && (
              <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader>
                  <CardTitle className="text-base">Issues</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(result as any).issues.map((it: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                      <div>{it.message}</div>
                      <Badge className={`${it.severity === 'high' ? 'bg-rose-500/10 text-rose-700 border-rose-500/20' : it.severity === 'medium' ? 'bg-amber-500/10 text-amber-700 border-amber-500/20' : 'bg-slate-500/10 text-slate-700 border-slate-500/20'} border`}>{it.severity}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {(result as any).recommendations?.length > 0 && (
              <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader>
                  <CardTitle className="text-base">Recommendations</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-3 text-sm">
                  {(result as any).recommendations.map((r: string, i: number) => (
                    <div key={i} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40">{r}</div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader><CardTitle className="text-base">Top Quick Wins</CardTitle></CardHeader>
                <CardContent className="grid sm:grid-cols-2 gap-3 text-sm">
                  {(result.topQuickFixes || []).map((f: string, i: number)=> (
                    <div key={i} className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 p-3">• {f}</div>
                  ))}
                </CardContent>
              </Card>
              <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
                <CardHeader><CardTitle className="text-base">Missed Opportunities</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {(result.missedOpportunities || []).map((m: string, i: number)=> (
                    <div key={i} className="rounded-lg border border-slate-200/60 dark:border-viz-light/20 p-3">• {m}</div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2"><Wand2 className="w-4 h-4" /> AI: Rewrite Meta Tags</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-slate-500">Recommended Title (≤ 65 chars)</div>
                  <input value={recommendedTitle} readOnly className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                </div>
                <div>
                  <div className="text-xs text-slate-500">Recommended Meta Description (≤ 155 chars)</div>
                  <textarea value={recommendedDescription} readOnly rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40 outline-none text-xs" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="text-base">Generated JSON-LD (copy & paste)</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold mb-1">FAQPage</div>
                  <pre className="text-xs p-3 rounded-lg bg-slate-950 text-slate-100 overflow-x-auto"><code>{(result as any).generated?.faqJsonLd}</code></pre>
                </div>
                <div>
                  <div className="text-xs font-semibold mb-1">HowTo</div>
                  <pre className="text-xs p-3 rounded-lg bg-slate-950 text-slate-100 overflow-x-auto"><code>{(result as any).generated?.howToJsonLd}</code></pre>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  };

  // Actions panel (Playbooks)
  const ActionsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-viz-accent" /> Playbooks</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            { name: 'Spend: Pause & Reallocate', desc: 'Shift budget from low-ROAS to high-ROAS sets' },
            { name: 'Creative Refresh', desc: 'Replace low CTR assets; launch variant' },
            { name: 'Inventory Protect', desc: 'Reduce spend on low-stock SKUs' },
            { name: 'Audience Tune', desc: 'Adjust caps and bands by performance' },
            { name: 'Bundles', desc: 'Promote high-margin bundles' },
          ].map((p) => (
            <div key={p.name} className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40">
              <div className="font-medium">{p.name}</div>
              <div className="text-slate-600 dark:text-slate-300">{p.desc}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="rounded-full">Configure</Button>
                <Button size="sm" className="rounded-full bg-gradient-to-r from-viz-accent to-blue-600 text-white">Simulate</Button>
              </div>
            </div>
          ))}
          <div className="mt-4 grid md:grid-cols-2 gap-4 col-span-full">
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/60 dark:bg-viz-dark/40">
              <div className="font-medium mb-1">Pending approvals</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-slate-600 dark:text-slate-300">Reallocate $150/day to Retargeting B</div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-full">Approve</Button>
                    <Button size="sm" variant="outline" className="rounded-full">Reject</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-slate-600 dark:text-slate-300">Pause low-ROAS Creative C</div>
                  <div className="flex gap-2">
                    <Button size="sm" className="rounded-full">Approve</Button>
                    <Button size="sm" variant="outline" className="rounded-full">Reject</Button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/60 dark:bg-viz-dark/40">
              <div className="font-medium mb-1 flex items-center gap-2"><Clock className="w-4 h-4" /> Recent changes</div>
              <div className="space-y-2 text-slate-600 dark:text-slate-300">
                <div>✔ Bid strategy updated on Meta Prospecting A — 2h ago</div>
                <div>✔ Launched Creative Variant V2 — 1d ago</div>
                <div>✔ Increased retargeting cap by $120/day — 3d ago</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ...

  // Data Sources panel (reduced detail; connectors grouped)
  const SourcesPanel: React.FC = () => (
    <div className="space-y-6">
      {/* Header / controls only; no metrics on this page */}
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-viz-accent" /> Connectors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full">Sync now</Button>
            <Button size="sm" variant="outline" className="rounded-full">Manage permissions</Button>
          </div>
        </CardContent>
      </Card>

      {/* 1. Ads Channels */}
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="text-base">Ads Channels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <MIAMetaIntegration variant="tile" />
            <MIAGoogleIntegration variant="tile" />
            {/* LinkedIn tile */}
            <Card className="h-full min-h-[190px] bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 rounded-xl shadow-sm">
              <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-700 flex items-center justify-center shadow-sm">
                      <Linkedin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">LinkedIn Ads</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300">Not Connected</div>
                    </div>
                  </div>
                  <Badge variant="outline">Not Connected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[110px] flex items-center justify-center">
                <Button size="sm" variant="outline" className="rounded-full w-[120px]" onClick={() => toast({ title: 'LinkedIn Ads', description: 'Connector scaffold present; enabling soon.', })}>
                  Connect
                </Button>
              </CardContent>
            </Card>
            {/* TikTok tile */}
            <Card className="h-full min-h-[190px] bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 rounded-xl shadow-sm">
              <CardHeader className="py-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-rose-600 flex items-center justify-center shadow-sm">
                      <Video className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">TikTok Ads</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-300">Not Connected</div>
                    </div>
                  </div>
                  <Badge variant="outline">Not Connected</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[110px] flex items-center justify-center">
                <Button size="sm" variant="outline" className="rounded-full w-[120px]" onClick={() => toast({ title: 'TikTok Ads', description: 'Connector coming soon without disrupting existing data.', })}>
                  Connect
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 2. CRM & Sales Data */}
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="text-base">CRM & Sales Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Shopify */}
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="w-4 h-4 text-emerald-600" />
                <span className="font-medium text-sm">Shopify</span>
              </div>
              <Badge variant="secondary" className="mb-2">Not Connected</Badge>
              <Button size="sm" variant="outline" className="w-full rounded-full" onClick={() => toast({ title: 'Shopify', description: 'Connector coming soon. We will not remove existing connections.', })}>
                Connect
              </Button>
            </div>
            {/* WooCommerce */}
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40">
              <div className="flex items-center gap-2 mb-2">
                <Store className="w-4 h-4 text-indigo-600" />
                <span className="font-medium text-sm">WooCommerce</span>
              </div>
              <Badge variant="secondary" className="mb-2">Not Connected</Badge>
              <Button size="sm" variant="outline" className="w-full rounded-full" onClick={() => toast({ title: 'WooCommerce', description: 'Connector coming soon. Your data will remain intact.', })}>
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 3. GA Data */}
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="text-base">GA Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            {/* Google Analytics (GA4) */}
            <div className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-amber-600" />
                <span className="font-medium text-sm">Google Analytics (GA4)</span>
              </div>
              <Badge variant="secondary" className="mb-2">Not Connected</Badge>
              <Button size="sm" variant="outline" className="w-full rounded-full" onClick={() => toast({ title: 'Google Analytics (GA4)', description: 'GA4 auth and property selection UI is being wired.', })}>
                Connect
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ...

  // Data Validation panel
  const QualityPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600" /> Data Checks & Validation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="text-xs text-slate-500">Passes</div>
              <div className="text-lg font-bold text-emerald-600">28</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="text-xs text-slate-500">Warnings</div>
              <div className="text-lg font-bold text-amber-600">4</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="text-xs text-slate-500">Errors</div>
              <div className="text-lg font-bold text-rose-600">1</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-2">Coverage</div>
              <div className="space-y-3 text-sm">
                <div>
                  <div className="flex items-center justify-between mb-1"><span>Tracking events (GA4)</span><span className="font-medium">92%</span></div>
                  <Progress value={92} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1"><span>UTM completeness</span><span className="font-medium">88%</span></div>
                  <Progress value={88} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1"><span>Conversions mapped</span><span className="font-medium">96%</span></div>
                  <Progress value={96} />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1"><span>Identity match rate</span><span className="font-medium">78%</span></div>
                  <Progress value={78} />
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-2">Lineage & Freshness</div>
              <div className="text-sm space-y-2 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between"><span>Meta sync</span><span>2h ago</span></div>
                <div className="flex items-center justify-between"><span>Google Ads sync</span><span>2h ago</span></div>
                <div className="flex items-center justify-between"><span>GA4 ingestion</span><span>25m ago</span></div>
                <div className="flex items-center justify-between"><span>Next scheduled</span><span>04:00 local</span></div>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="rounded-full">Run validation</Button>
                <Button size="sm" variant="outline" className="rounded-full">View report</Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" className="rounded-full">Run validation</Button>
            <Button size="sm" variant="outline" className="rounded-full">View report</Button>
          </div>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Recent anomalies</div>
              <ul className="list-disc ml-5 space-y-1 text-slate-600 dark:text-slate-300">
                <li>Spend spike on Google Brand — +48% vs 7d avg</li>
                <li>Meta Retargeting CPC jumped to $1.20 — p90 threshold</li>
                <li>Attribution mismatch: GA4 vs platform convs on 2025-09-10</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">Schema & Tracking Health</div>
              <div className="space-y-1 text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> GA4 UTM mapping — OK</div>
                <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600" /> Campaign naming convention — OK</div>
                <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> Pixel events on LP-02 — Low volume</div>
              </div>
            </div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20 text-sm">
            <div className="font-medium mb-2">Top failing checks</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between"><span>Missing utm_term on Google Search</span><Badge variant="destructive">12</Badge></div>
              <div className="flex items-center justify-between"><span>Duplicate campaign names (Meta)</span><Badge variant="secondary">3</Badge></div>
              <div className="flex items-center justify-between"><span>Unmapped GA4 events</span><Badge variant="secondary">5</Badge></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Additional panels to ensure file compiles and keep navigation functional
  const MMMPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-viz-accent" /> MMM Copilot</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 dark:text-slate-300">Configure data, train MMM, and run scenarios.</CardContent>
      </Card>
    </div>
  );

  const BudgetPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-600" /> Budget Autopilot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">MMM Signal (summary)</div>
              <div className="text-slate-600 dark:text-slate-300">Model suggests shifting <span className="font-semibold">+12%</span> to Meta Retargeting and <span className="font-semibold">-6%</span> from Google Brand. Expected lift <span className="font-semibold">+4% ROAS</span>.</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm">Open MMM</Button>
                <Button size="sm" variant="outline">Assumptions</Button>
              </div>
            </div>
            <div className="lg:col-span-2 p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-2">Actionable allocation</div>
              <div className="grid md:grid-cols-3 gap-3">
                {[{p:'Meta',s:'+10%',note:'CPA below target'},{p:'Google',s:'-6%',note:'CPC elevated'},{p:'LinkedIn',s:'+3%',note:'High-quality leads'}].map(x => (
                  <div key={x.p} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                    <div className="flex items-center justify-between"><div className="font-medium">{x.p}</div><Badge variant="secondary">{x.s}</Badge></div>
                    <div className="text-slate-600 dark:text-slate-300 text-xs mt-1">{x.note}</div>
                    <div className="mt-2 flex gap-2"><Button size="sm">Apply</Button><Button size="sm" variant="outline">Details</Button></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AudiencePanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> Audience Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              {k:'Reach',v:'1.2M'},
              {k:'CPA (avg)',v:'$4.20'},
              {k:'Conv. Rate',v:'2.9%'},
              {k:'LTV 90d',v:'$78'}
            ].map(x => (
              <div key={x.k} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20 text-center">
                <div className="text-xs text-slate-500">{x.k}</div>
                <div className="text-lg font-bold">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="font-medium mb-2">Top Segments</div>
              <div className="space-y-2">
                {['Lookalike 1%','Retarget 30d','High LTV'].map(s => (
                  <div key={s} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20 flex items-center justify-between"><span>{s}</span><Badge variant="secondary">High</Badge></div>
                ))}
              </div>
            </div>
            <div>
              <div className="font-medium mb-2">Underperformers</div>
              <div className="space-y-2">
                {['Broad 18-24','Interest: Tech','Affinity: Sports'].map(s => (
                  <div key={s} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20 flex items-center justify-between"><span>{s}</span><Badge className="bg-amber-500">Watch</Badge></div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200/60 dark:border-viz-light/20 bg-white/70 dark:bg-viz-dark/40">
            <div className="font-medium mb-2">Shopping Recommendations</div>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                {n:'Bundle A • +12% AOV',note:'Show to High LTV & Lookalike 1%'},
                {n:'SKU-123 • Free Ship',note:'Retarget cart abandoners'},
                {n:'New Arrivals',note:'Prospecting broad 25-44'}
              ].map(r => (
                <div key={r.n} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                  <div className="font-medium">{r.n}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-300">{r.note}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const AttributionPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5 text-viz-accent" /> Attribution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid md:grid-cols-3 gap-3">
            {[
              {k:'Paid Share',v:'62%'},
              {k:'Organic Share',v:'28%'},
              {k:'Direct/Other',v:'10%'}
            ].map(x => (
              <div key={x.k} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20 text-center">
                <div className="text-xs text-slate-500">{x.k}</div>
                <div className="text-lg font-bold">{x.v}</div>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-2">Model comparison</div>
              <div className="space-y-1 text-slate-700 dark:text-slate-300">
                <div className="flex items-center justify-between"><span>Last-click ROAS</span><span>2.1x</span></div>
                <div className="flex items-center justify-between"><span>First-click ROAS</span><span>2.6x</span></div>
                <div className="flex items-center justify-between"><span>Data-driven ROAS</span><span>2.8x</span></div>
              </div>
              <div className="mt-2 text-xs text-slate-500">Recommendation: Use data-driven for budgeting.</div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-2">Top paths</div>
              <div className="space-y-2">
                {[
                  {p:'Meta → Direct', share:'18%'},
                  {p:'Google Brand → Direct', share:'14%'},
                  {p:'Meta → Google Generic → Direct', share:'9%'}
                ].map(t => (
                  <div key={t.p} className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300">{t.p}</span>
                    <Badge variant="secondary">{t.share}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5" /> Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
            <div>
              <div className="font-medium">Email digests</div>
              <div className="text-slate-600 dark:text-slate-300 text-sm">Weekly summary</div>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ...

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white via-slate-50 to-slate-100 dark:from-viz-dark dark:via-black dark:to-[#0a0a0a]">
      <div className="relative">
        {/* Premium gradient hero */}
        <div className="absolute inset-x-0 -top-24 h-64 blur-3xl opacity-30 pointer-events-none" aria-hidden>
          <div className="mx-auto h-full max-w-6xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-viz-accent rounded-full" />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Premium Hero */}
        <div className="mb-8">
          <div className="rounded-2xl bg-white/70 dark:bg-viz-medium/60 backdrop-blur-md border border-slate-200/60 dark:border-viz-light/20 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.25)] p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-500 to-viz-accent text-white shadow">
                  <Zap className="w-3.5 h-3.5" />
                  Top 1% Marketing Intelligence
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-viz-dark dark:text-white">
                  Marketing Intelligence Agent
                </h1>
                <p className="text-base md:text-lg text-slate-600 dark:text-viz-text-secondary">
                  Premium analytics, optimization, and AI copilots for elite growth teams.
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">ROAS Intelligence</Badge>
                  <Badge className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">Creative Insights</Badge>
                  <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">Budget Copilot</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-viz-accent text-white shadow hover:shadow-lg hover:brightness-105 transition-all"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Data'}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-all"
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mb-8">
          <MIAIntegrationStatus />
        </div>

        {/* Two-panel layout */}
        <div className="flex min-h-[60vh]">
          {/* Sidebar */}
          <div className="hidden md:flex w-72 bg-white/85 dark:bg-viz-medium/70 backdrop-blur-sm border border-slate-200/50 dark:border-viz-light/20 rounded-2xl p-5 mr-6 flex-col flex-shrink-0">
            <div className="text-center pb-4 border-b border-slate-200/50 dark:border-viz-light/20">
              <h2 className="text-base font-semibold text-viz-dark dark:text-white">MIA</h2>
              <p className="text-xs text-slate-600 dark:text-viz-text-secondary">Marketing Intelligence Agent</p>
            </div>
            <nav className="flex-1 pt-4 space-y-3">
              <NavButton id="quickwins" label="Home / QuickWins" icon={Zap} gradient="bg-gradient-to-r from-pink-500 to-viz-accent" desc="Top actions now" />
              <NavButton id="sources" label="Data Sources" icon={Database} gradient="bg-gradient-to-r from-emerald-500 to-green-600" desc="Connectors" />
              <NavButton id="quality" label="Data Validation" icon={CheckCircle} gradient="bg-gradient-to-r from-indigo-500 to-blue-600" desc="Health & fixes" />
              {/* <NavButton id="seogeo" label="SEO & GEO" icon={BarChart3} gradient="bg-gradient-to-r from-amber-500 to-rose-600" desc="Search & Gen AI readiness" /> */}
              <NavButton id="insights" label="Insights" icon={BarChart3} gradient="bg-gradient-to-r from-viz-accent to-blue-600" desc="KPIs & drilldowns" />
              <NavButton id="actions" label="Actions" icon={Activity} gradient="bg-gradient-to-r from-amber-500 to-rose-600" desc="Playbooks & history" />
              <NavButton id="budget" label="Budget Autopilot" icon={Wallet} gradient="bg-gradient-to-r from-teal-500 to-emerald-600" desc="Targets & allocation" />
              <NavButton id="audience" label="Audience Intelligence" icon={Users} gradient="bg-gradient-to-r from-indigo-500 to-blue-600" desc="Segments & personas" />
              <NavButton id="attribution" label="Attribution" icon={PieChart} gradient="bg-gradient-to-r from-amber-500 to-rose-600" desc="Paths & models" />
              <NavButton id="settings" label="Settings" icon={Settings} gradient="bg-gradient-to-r from-purple-500 to-indigo-600" desc="Safety & defaults" />
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile quick tabs for sections */}
            <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur border-b border-slate-200/50 dark:border-viz-light/20">
              <div className="px-4 py-2 grid grid-cols-3 gap-2">
                {[
                  { id: 'quickwins', label: 'QuickWins' },
                  { id: 'sources', label: 'Data Sources' },
                  { id: 'quality', label: 'Data Validation' },
                  { id: 'seogeo', label: 'SEO & GEO' },
                  { id: 'insights', label: 'Insights' },
                  { id: 'actions', label: 'Actions' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveSection(t.id as Section)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeSection === (t.id as Section)
                        ? 'bg-gradient-to-r from-viz-accent to-blue-600 text-white shadow'
                        : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              {activeSection === 'quickwins' && <QuickWinsPanel />}
              {activeSection === 'insights' && <InsightsPanel />}
              {activeSection === 'actions' && <ActionsPanel />}
              {activeSection === 'sources' && <SourcesPanel />}
              {activeSection === 'quality' && <QualityPanel />}
              {/* {activeSection === 'seogeo' && <SeoGeoPanel />} */}
              {activeSection === 'mmm' && <MMMPanel />}
              {activeSection === 'budget' && <BudgetPanel />}
              {activeSection === 'audience' && <AudiencePanel />}
              {activeSection === 'attribution' && <AttributionPanel />}
              {activeSection === 'chat' && (
                <div className="space-y-8 mt-2">
                  <MIAChatInterface />
                </div>
              )}
              {activeSection === 'settings' && <SettingsPanel />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MIADashboard;
