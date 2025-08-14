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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Upload Data removed per request */}
        {/* Main Dashboard Content */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-viz-dark dark:text-white flex items-center gap-3">
                <Zap className="w-9 h-9 text-viz-accent" />
                Marketing Intelligence Agent
              </h1>
              <p className="text-lg text-slate-600 dark:text-viz-text-secondary">
                AI-powered marketing analytics and optimization platform
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={handleSync}
                disabled={syncing}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Data'}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="mb-8">
          <MIAIntegrationStatus />
        </div>

        {/* Filters Section */}
        <Card className="mb-8 bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm">
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
          <div className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 rounded-2xl p-1 shadow-sm">
            <TabsList className="grid w-full grid-cols-4 bg-slate-50 dark:bg-viz-dark/50 rounded-xl p-1 h-auto">
              <TabsTrigger 
                value="overview" 
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="campaigns" 
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Campaigns</span>
              </TabsTrigger>
              <TabsTrigger 
                value="insights" 
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chat" 
                className="flex items-center justify-center gap-2 text-sm font-semibold py-4 px-6 rounded-xl data-[state=active]:bg-white data-[state=active]:text-viz-accent data-[state=active]:shadow-sm text-slate-600 dark:text-slate-400 data-[state=active]:dark:bg-viz-medium data-[state=active]:dark:text-viz-accent transition-all duration-200 hover:text-viz-accent"
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
      </div>
    </div>
  );
};

export default MIADashboard;
