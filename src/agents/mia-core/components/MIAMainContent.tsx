import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Filter } from 'lucide-react';
import MIAMetricsCards from '@/modules/MIA/components/MIAMetricsCards';
import MIAPerformanceChart from '@/modules/MIA/components/MIAPerformanceChart';
import MIACampaignTable from '@/modules/MIA/components/MIACampaignTable';
import MIAInsightsPanel from '@/modules/MIA/components/MIAInsightsPanel';
import MIAChatInterface from '@/modules/MIA/components/MIAChatInterface';
import MIAIntegrationStatus from '@/modules/MIA/components/MIAIntegrationStatus';
import { AnalyticsService } from '@/modules/MIA/services/analyticsService';
import { Campaign } from '@/modules/MIA/types';

interface MIAMainContentProps {
  activeView: string;
  userId: string;
}

export const MIAMainContent: React.FC<MIAMainContentProps> = ({ activeView, userId }) => {
  const [loading, setLoading] = React.useState(false);

  const campaigns = useMemo<Campaign[]>(
    () => [
      {
        id: 'camp_meta_1',
        name: 'Meta Demand Gen',
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
        id: 'camp_google_1',
        name: 'Google Premium Brand',
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
        id: 'camp_linkedin_1',
        name: 'LinkedIn Leadership',
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
        id: 'camp_tiktok_1',
        name: 'TikTok Viral Motion',
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
    ],
    []
  );

  const platformMetrics = useMemo(
    () => AnalyticsService.calculatePlatformMetrics(campaigns),
    [campaigns]
  );

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  const handleExport = () => {
    console.log('Exporting data...');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-viz-dark border-b border-slate-200 dark:border-viz-light/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              {activeView === 'overview' && 'Dashboard Overview'}
              {activeView === 'campaigns' && 'Campaign Management'}
              {activeView === 'analytics' && 'Analytics & Reporting'}
              {activeView === 'insights' && 'AI-Powered Insights'}
              {activeView === 'chat' && 'AI Marketing Assistant'}
              {activeView === 'integrations' && 'Platform Integrations'}
              {activeView === 'settings' && 'Settings & Preferences'}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {activeView === 'overview' && 'Real-time marketing intelligence at a glance'}
              {activeView === 'campaigns' && 'Monitor and optimize your marketing campaigns'}
              {activeView === 'analytics' && 'Deep dive into performance metrics'}
              {activeView === 'insights' && 'AI-generated recommendations and opportunities'}
              {activeView === 'chat' && 'Ask questions and get instant marketing insights'}
              {activeView === 'integrations' && 'Connect your marketing platforms'}
              {activeView === 'settings' && 'Customize your MIA experience'}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-black">
        <div className="container mx-auto px-6 py-6 max-w-7xl">
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* KPI Metrics */}
              <MIAMetricsCards
                campaigns={campaigns}
                platformMetrics={platformMetrics}
              />

              {/* Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <MIAPerformanceChart campaigns={campaigns} />
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <MIAInsightsPanel
                insights={[
                  {
                    id: '1',
                    type: 'performance_spike',
                    severity: 'high',
                    title: 'High-performing ad set detected',
                    description: 'Ad Set #3 has 35% higher ROAS than average',
                    recommendation: 'Increase budget by 25% to maximize returns',
                    estimatedImpact: 'High',
                    confidence: 92,
                    dataPoints: ['roas', 'ctr'],
                    platform: 'meta',
                    timeframe: '7 days',
                    actionable: true,
                    automationPossible: true,
                  },
                ]}
              />
            </div>
          )}

          {activeView === 'campaigns' && (
            <Card>
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <MIACampaignTable campaigns={campaigns} />
              </CardContent>
            </Card>
          )}

          {activeView === 'analytics' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg. CTR</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">4.8%</div>
                      <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Conversion Rate</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">2.4%</div>
                      <div className="text-xs text-green-600 mt-1">+8% vs last month</div>
                    </div>
                    <div className="p-4 bg-white dark:bg-viz-medium rounded-lg border border-slate-200 dark:border-viz-light/10">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg. CPA</div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">$7.50</div>
                      <div className="text-xs text-green-600 mt-1">-15% vs last month</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'insights' && (
            <MIAInsightsPanel
              insights={[
                {
                  id: '1',
                  type: 'platform_arbitrage',
                  severity: 'high',
                  title: 'Budget reallocation opportunity',
                  description: 'Meta campaigns outperforming Google by 45%',
                  recommendation: 'Shift 20% of Google budget to Meta for optimal ROAS',
                  estimatedImpact: 'High',
                  confidence: 88,
                  dataPoints: ['roas', 'spend'],
                  platform: 'cross-platform',
                  timeframe: '30 days',
                  actionable: true,
                  automationPossible: false,
                },
                {
                  id: '2',
                  type: 'ad_fatigue',
                  severity: 'medium',
                  title: 'Ad fatigue detected',
                  description: 'CTR declining 15% over past week',
                  recommendation: 'Refresh creative assets and test new variations',
                  estimatedImpact: 'Medium',
                  confidence: 82,
                  dataPoints: ['ctr', 'frequency'],
                  platform: 'meta',
                  timeframe: '7 days',
                  actionable: true,
                  automationPossible: false,
                },
              ]}
            />
          )}

          {activeView === 'chat' && (
            <Card>
              <CardContent className="p-6">
                <MIAChatInterface />
              </CardContent>
            </Card>
          )}

          {activeView === 'integrations' && (
            <div className="space-y-6">
              <MIAIntegrationStatus />
            </div>
          )}

          {activeView === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 dark:bg-viz-medium rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Notification Preferences</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Configure how you receive alerts and insights
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-viz-medium rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Data Refresh Rate</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Set how often MIA syncs with your platforms
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MIAMainContent;
