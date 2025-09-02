import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useToast } from '@/components/ui/use-toast';
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
  FlaskConical,
  Users,
  Palette,
  Wallet,
  Database,
} from 'lucide-react';
import { Campaign, PlatformMetrics, PerformanceInsight, DashboardFilters } from '../types';
import { AnalyticsService } from '../services/analyticsService';
import { AIChatService } from '../services/aiChatService';
import MIAMetricsCards from './MIAMetricsCards';
import MIAPerformanceChart from './MIAPerformanceChart';
import MIACampaignTable from './MIACampaignTable';
import MIAInsightsPanel from './MIAInsightsPanel';
import MIAChatInterface from './MIAChatInterface';
import MIAIntegrationStatus from './MIAIntegrationStatus';
import MIAMetaIntegration from './MIAMetaIntegration';

interface MIADashboardProps {
  userId: string;
}

const MIADashboard: React.FC<MIADashboardProps> = ({ userId }) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [platformMetrics, setPlatformMetrics] = useState<PlatformMetrics[]>([]);
  const [insights, setInsights] = useState<PerformanceInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  type Section = 'sources' | 'quality' | 'insights' | 'mmm' | 'budget' | 'creative' | 'audience' | 'experiments' | 'chat' | 'settings';
  const [activeSection, setActiveSection] = useState<Section>('insights');
  const [filters, setFilters] = useState<DashboardFilters>({
    platforms: [],
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0],
    },
  });

  const { toast } = useToast();
  const aiChatService = new AIChatService(campaigns);

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
      setInsights(generatedInsights);
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
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-8 mt-8">
          <MIACampaignTable campaigns={campaigns} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-8 mt-8">
          <MIAInsightsPanel insights={insights} showAll />
        </TabsContent>

        <TabsContent value="chat" className="space-y-8 mt-8">
          <MIAChatInterface 
            aiChatService={aiChatService} 
            userId={userId} 
          />
        </TabsContent>
      </Tabs>
    </>
  );

  const MMMPannel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-viz-accent" /> MMM Copilot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">1. Data Assembly</div>
              <div className="text-slate-600 dark:text-slate-300">Spend, impressions, clicks, conversions, revenue, promos, seasonality, price, macro.</div>
              <div className="mt-2 flex gap-2"><Badge variant="secondary">CSV</Badge><Badge variant="secondary">API</Badge></div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">2. Calibration</div>
              <div className="text-slate-600 dark:text-slate-300">Adstock + saturation priors per channel. Constraints by business logic.</div>
              <Button size="sm" variant="outline" className="mt-2">Auto-calibrate</Button>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">3. Model Training</div>
              <div className="text-slate-600 dark:text-slate-300">Hierarchical Bayesian MMM with MCMC; uncertainty bands and diagnostics.</div>
              <Button size="sm" className="mt-2">Train MMM</Button>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">4. Channel Lift & ROAS</div>
              <div className="text-slate-600 dark:text-slate-300">Elasticity by channel, diminishing returns, incremental ROAS.</div>
              <div className="mt-2"><Badge>Meta</Badge> <Badge>Google</Badge> <Badge>LinkedIn</Badge> <Badge>TikTok</Badge></div>
            </div>
            <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium mb-1">5. What-if & Budget Optimizer</div>
              <div className="text-slate-600 dark:text-slate-300">Constrained optimizer: maximize revenue or ROAS under budget/caps.</div>
              <div className="mt-2 flex gap-2"><Button size="sm">Run Scenario</Button><Button size="sm" variant="outline">Export Plan</Button></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const BudgetPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-600" /> Bidding & Budget Copilot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid md:grid-cols-3 gap-4">
            {['Meta','Google','LinkedIn'].map((p) => (
              <div key={p} className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
                <div className="font-medium mb-1">{p} allocation</div>
                <div className="text-slate-600 dark:text-slate-300">Suggested +10% this week. CPA below target.</div>
                <div className="mt-2 flex gap-2"><Button size="sm">Apply</Button><Button size="sm" variant="outline">Details</Button></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const CreativePanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5 text-purple-600" /> Creative Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          {['Hook rate','Hold rate','Thumb stop','Conversion driver'].map((m, i) => (
            <div key={m} className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
              <div className="font-medium">{m}</div>
              <div className="text-slate-600 dark:text-slate-300 mt-1">Top percentile {80 - i * 5}% vs peers</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const AudiencePanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-indigo-600" /> Audience Intelligence</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm">
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
        </CardContent>
      </Card>
    </div>
  );

  const ExperimentsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><FlaskConical className="w-5 h-5 text-rose-600" /> Experiments Registry</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            {name:'Creative A/B: Hook line', status:'Running'},
            {name:'Landing page test', status:'Planned'},
            {name:'Bid strategy compare', status:'Completed'},
          ].map((e, i) => (
            <div key={i} className="p-3 rounded-lg border border-slate-200/60 dark:border-viz-light/20 flex items-center justify-between">
              <div>{e.name}</div>
              <Badge variant="outline">{e.status}</Badge>
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <Button size="sm">New experiment</Button>
            <Button size="sm" variant="outline">View templates</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SourcesPanel: React.FC = () => (
    <div className="space-y-6">
      {/* Meta Integration - Fully Functional */}
      <MIAMetaIntegration 
        onConnectionChange={(connected) => {
          console.log('Meta connection status changed:', connected);
          // You can update dashboard state here if needed
        }}
      />

      {/* Other Data Sources - Coming Soon */}
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5 text-viz-accent" /> 
            Other Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { name: 'Google Ads', icon: '🔍', status: 'coming-soon' },
            { name: 'GA4', icon: '📊', status: 'coming-soon' },
            { name: 'LinkedIn Ads', icon: '💼', status: 'coming-soon' },
            { name: 'TikTok Ads', icon: '🎵', status: 'coming-soon' },
            { name: 'CRM', icon: '👥', status: 'coming-soon' },
            { name: 'Revenue', icon: '💰', status: 'coming-soon' },
          ].map((source) => (
            <div key={source.name} className="relative">
              <Button 
                variant="outline" 
                className="w-full justify-start opacity-60 cursor-not-allowed"
                disabled
              >
                <span className="mr-2">{source.icon}</span>
                Connect {source.name}
              </Button>
              <Badge 
                className="absolute -top-2 -right-2 bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs"
              >
                Soon
              </Badge>
            </div>
          ))}
          <div className="col-span-full text-xs text-slate-500 mt-4 p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
            <strong>Meta Ads integration is live!</strong> Other platform integrations are coming soon. 
            Contact support if you need priority access to specific platforms.
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const QualityPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CheckCircle className="w-5 h-5 text-emerald-600" /> Data Checks & Validation</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
            <div className="font-medium">Missing values</div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Spend, clicks, conversions</div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
            <div className="font-medium">Outliers</div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Spikes & anomalies</div>
          </div>
          <div className="p-4 rounded-lg border border-slate-200/60 dark:border-viz-light/20">
            <div className="font-medium">Attribution sanity</div>
            <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">Last-click vs MMM</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const SettingsPanel: React.FC = () => (
    <div className="space-y-6">
      <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Settings className="w-5 h-5 text-viz-accent" /> Settings</CardTitle>
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
              <NavButton id="sources" label="Data Sources" icon={Database} gradient="bg-gradient-to-r from-emerald-500 to-green-600" desc="Connect ads, analytics, CRM" />
              <NavButton id="quality" label="Data Quality" icon={CheckCircle} gradient="bg-gradient-to-r from-indigo-500 to-blue-600" desc="Anomalies, gaps, sanity" />
              <NavButton id="insights" label="Insights & Dashboards" icon={BarChart3} gradient="bg-gradient-to-r from-viz-accent to-blue-600" desc="KPIs, trends, deep dives" />
              <NavButton id="mmm" label="MMM Copilot" icon={Brain} gradient="bg-gradient-to-r from-pink-500 to-viz-accent" desc="Modeling & optimizer" />
              <NavButton id="budget" label="Budget Copilot" icon={Wallet} gradient="bg-gradient-to-r from-teal-500 to-emerald-600" desc="Bids & pacing" />
              <NavButton id="creative" label="Creative Intelligence" icon={Palette} gradient="bg-gradient-to-r from-purple-500 to-indigo-600" desc="Hooks, holds, drivers" />
              <NavButton id="audience" label="Audience Intelligence" icon={Users} gradient="bg-gradient-to-r from-cyan-500 to-blue-600" desc="Segments & LTV" />
              <NavButton id="experiments" label="Experiments" icon={FlaskConical} gradient="bg-gradient-to-r from-amber-500 to-rose-600" desc="Registry & results" />
              <NavButton id="chat" label="AI Chat / Q&A" icon={MessageSquare} gradient="bg-gradient-to-r from-pink-500 to-viz-accent" desc="Ask with charts" />
              <NavButton id="settings" label="Settings" icon={Settings} gradient="bg-gradient-to-r from-purple-500 to-indigo-600" desc="Alerts & defaults" />
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Mobile quick tabs for sections */}
            <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur border-b border-slate-200/50 dark:border-viz-light/20">
              <div className="px-4 py-2 grid grid-cols-3 gap-2">
                {[
                  { id: 'insights', label: 'Insights' },
                  { id: 'mmm', label: 'MMM' },
                  { id: 'chat', label: 'Chat' },
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
              {activeSection === 'sources' && <SourcesPanel />}
              {activeSection === 'quality' && <QualityPanel />}
              {activeSection === 'insights' && <InsightsPanel />}
              {activeSection === 'mmm' && <MMMPannel />}
              {activeSection === 'budget' && <BudgetPanel />}
              {activeSection === 'creative' && <CreativePanel />}
              {activeSection === 'audience' && <AudiencePanel />}
              {activeSection === 'experiments' && <ExperimentsPanel />}
              {activeSection === 'chat' && (
                <div className="space-y-8 mt-2">
                  <MIAChatInterface aiChatService={aiChatService} userId={userId} />
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
