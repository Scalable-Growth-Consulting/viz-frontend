import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Brain,
  TrendingUp,
  DollarSign,
  Target,
  Zap,
  BarChart3,
  Settings,
  RefreshCw,
  Download,
  Share
} from 'lucide-react';

import MIAInsightsPanel from './MIAInsightsPanel';
import ROIMetricsCard from './ROIMetricsCard';
import AutoOptimizationPanel from './AutoOptimizationPanel';
import { MIAInsightEngine } from '../services/insightEngine';
import { AdInsight, InsightContext } from '../types/insights';
import { INSIGHT_TEMPLATES, generateInsightMessage, calculateInsightPriority } from '../utils/insightTemplates';

interface MIAInsightsDashboardProps {
  campaignData: any[]; // Your campaign data from Google/Meta APIs
  isLoading?: boolean;
  onRefresh?: () => void;
}

const MIAInsightsDashboard: React.FC<MIAInsightsDashboardProps> = ({
  campaignData,
  isLoading = false,
  onRefresh
}) => {
  const [insights, setInsights] = useState<AdInsight[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [automationSettings, setAutomationSettings] = useState({
    enabled: false,
    maxBudgetChange: 20,
    maxBidChange: 25,
    minConfidenceThreshold: 80,
    approvalRequired: true
  });

  const insightEngine = new MIAInsightEngine();

  // Sample ROI metrics data - replace with real data
  const sampleMetrics = {
    platform: 'combined' as const,
    timeframe: selectedTimeframe,
    spend: 15420,
    revenue: 52680,
    roas: 3.42,
    impressions: 1250000,
    clicks: 18750,
    ctr: 1.5,
    cpc: 0.82,
    conversions: 342,
    conversionRate: 1.82,
    cpa: 45.09,
    ltv: 154.50,
    paybackPeriod: 45,
    trends: {
      spend: 12.3,
      revenue: 18.7,
      roas: 5.2,
      conversions: 15.8
    }
  };

  useEffect(() => {
    generateInsights();
  }, [campaignData, selectedTimeframe]);

  const generateInsights = () => {
    if (!campaignData || campaignData.length === 0) return;

    const allInsights: AdInsight[] = [];

    // Generate insights for each campaign
    campaignData.forEach(campaign => {
      // Create context for insight generation
      const context: InsightContext = {
        campaign: {
          id: campaign.id,
          name: campaign.name,
          objective: campaign.objective || 'conversions',
          budget: campaign.budget || 100,
          bidStrategy: campaign.bidStrategy || 'automatic',
          status: campaign.status || 'active'
        },
        timeframe: {
          current: {
            impressions: campaign.impressions || 10000,
            clicks: campaign.clicks || 150,
            ctr: campaign.ctr || 1.5,
            cost: campaign.cost || 500,
            conversions: campaign.conversions || 8,
            conversionRate: campaign.conversionRate || 5.3,
            cpa: campaign.cpa || 62.5,
            roas: campaign.roas || 2.8,
            google: campaign.platform === 'google' ? {
              qualityScore: campaign.qualityScore || 6,
              impressionShare: campaign.impressionShare || 65,
              searchImpressionShare: campaign.searchImpressionShare || 70,
              topOfPageRate: campaign.topOfPageRate || 45,
              absoluteTopRate: campaign.absoluteTopRate || 25,
              avgPosition: campaign.avgPosition || 2.1
            } : undefined,
            meta: campaign.platform === 'meta' ? {
              reach: campaign.reach || 8500,
              frequency: campaign.frequency || 2.3,
              cpm: campaign.cpm || 12.50,
              engagementRate: campaign.engagementRate || 3.2,
              videoViews: campaign.videoViews || 1200,
              videoCompletionRate: campaign.videoCompletionRate || 35,
              qualityRanking: campaign.qualityRanking || 'average',
              engagementRanking: campaign.engagementRanking || 'above_average',
              conversionRanking: campaign.conversionRanking || 'average'
            } : undefined
          },
          previous: {
            // Previous period data (simulate 20% worse performance)
            impressions: (campaign.impressions || 10000) * 0.8,
            clicks: (campaign.clicks || 150) * 0.75,
            ctr: (campaign.ctr || 1.5) * 0.7,
            cost: (campaign.cost || 500) * 0.9,
            conversions: (campaign.conversions || 8) * 0.6,
            conversionRate: (campaign.conversionRate || 5.3) * 0.65,
            cpa: (campaign.cpa || 62.5) * 1.4,
            roas: (campaign.roas || 2.8) * 0.8
          },
          baseline: {
            // Baseline/benchmark data
            impressions: 12000,
            clicks: 180,
            ctr: 1.8,
            cost: 400,
            conversions: 12,
            conversionRate: 6.7,
            cpa: 33.33,
            roas: 4.2
          }
        },
        benchmarks: {
          industry: {
            impressions: 15000,
            clicks: 225,
            ctr: 1.5,
            cost: 600,
            conversions: 15,
            conversionRate: 6.7,
            cpa: 40.0,
            roas: 3.8
          },
          account: {
            impressions: 11000,
            clicks: 165,
            ctr: 1.5,
            cost: 450,
            conversions: 10,
            conversionRate: 6.1,
            cpa: 45.0,
            roas: 3.2
          },
          topPerforming: {
            impressions: 20000,
            clicks: 400,
            ctr: 2.0,
            cost: 800,
            conversions: 25,
            conversionRate: 6.25,
            cpa: 32.0,
            roas: 5.0
          }
        }
      };

      const campaignInsights = insightEngine.generateInsights(context);
      allInsights.push(...campaignInsights);
    });

    // Sort insights by priority
    const sortedInsights = allInsights
      .map(insight => ({
        ...insight,
        priority: calculateInsightPriority(insight)
      }))
      .sort((a, b) => b.priority - a.priority);

    setInsights(sortedInsights);
  };

  const handleToggleAutomation = (enabled: boolean) => {
    setAutomationSettings(prev => ({ ...prev, enabled }));
  };

  const handleApplyOptimization = (insightId: string) => {
    console.log('Applying optimization:', insightId);
    // Here you would implement the actual optimization logic
    // This might involve API calls to Google/Meta to adjust campaigns
  };

  const handleUpdateSettings = (newSettings: any) => {
    setAutomationSettings(prev => ({ ...prev, ...newSettings }));
  };

  const criticalInsights = insights.filter(i => i.severity === 'critical').length;
  const automationEligible = insights.filter(i => i.automationPossible).length;
  const totalPotentialImpact = insights.reduce((sum, insight) => {
    const match = insight.estimatedImpact.match(/\$(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-viz-dark dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-viz-accent" />
            MIA Intelligence Dashboard
          </h2>
          <p className="text-muted-foreground">
            AI-powered insights and optimization recommendations for your advertising campaigns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Insights</p>
                <p className="text-2xl font-bold">{insights.length}</p>
              </div>
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{criticalInsights}</p>
              </div>
              <Target className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Auto-Optimizable</p>
                <p className="text-2xl font-bold text-green-600">{automationEligible}</p>
              </div>
              <Zap className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Potential Impact</p>
                <p className="text-2xl font-bold text-viz-accent">${totalPotentialImpact.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-viz-accent" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Auto-Optimization
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ROIMetricsCard
              title="Google Ads Performance"
              metrics={{
                ...sampleMetrics,
                platform: 'google',
                google: {
                  qualityScore: 7.2,
                  impressionShare: 68.5,
                  searchImpressionShare: 72.1
                }
              }}
            />
            <ROIMetricsCard
              title="Meta Ads Performance"
              metrics={{
                ...sampleMetrics,
                platform: 'meta',
                meta: {
                  frequency: 2.8,
                  reach: 145000,
                  engagementRate: 4.2,
                  videoCompletionRate: 42.5
                }
              }}
            />
          </div>

          {/* Quick Insights Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Insights Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.slice(0, 6).map((insight, index) => (
                  <div key={insight.id} className="p-3 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={insight.severity === 'critical' ? 'destructive' : 'outline'}>
                        {insight.severity}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {insight.platform}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">{insight.estimatedImpact}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <MIAInsightsPanel insights={insights} showAll={true} />
        </TabsContent>

        <TabsContent value="optimization">
          <AutoOptimizationPanel
            insights={insights}
            automationSettings={automationSettings}
            onToggleAutomation={handleToggleAutomation}
            onApplyOptimization={handleApplyOptimization}
            onUpdateSettings={handleUpdateSettings}
          />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Insight Generation</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Minimum Confidence Threshold</div>
                      <div className="text-sm text-muted-foreground">
                        Only show insights with confidence above this threshold
                      </div>
                    </div>
                    <Badge variant="outline">80%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Data Freshness</div>
                      <div className="text-sm text-muted-foreground">
                        How recent data should be for insight generation
                      </div>
                    </div>
                    <Badge variant="outline">24 hours</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Automation Limits</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Maximum Budget Change</div>
                      <div className="text-sm text-muted-foreground">
                        Maximum percentage change allowed for budgets
                      </div>
                    </div>
                    <Badge variant="outline">{automationSettings.maxBudgetChange}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Maximum Bid Adjustment</div>
                      <div className="text-sm text-muted-foreground">
                        Maximum percentage change allowed for bids
                      </div>
                    </div>
                    <Badge variant="outline">{automationSettings.maxBidChange}%</Badge>
                  </div>
                </div>
              </div>

              <Button className="w-full">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MIAInsightsDashboard;
