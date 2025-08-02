import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  MousePointer,
  Activity,
} from 'lucide-react';
import { Campaign, PlatformMetrics } from '../types';

interface MIAMetricsCardsProps {
  campaigns: Campaign[];
  platformMetrics: PlatformMetrics[];
}

const MIAMetricsCards: React.FC<MIAMetricsCardsProps> = ({ campaigns, platformMetrics }) => {
  // Calculate overall metrics
  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalImpressions = campaigns.reduce((sum, c) => sum + c.impressions, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const totalConversions = campaigns.reduce((sum, c) => sum + c.conversions, 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPA = totalConversions > 0 ? totalSpend / totalConversions : 0;
  const averageROAS = totalSpend > 0 ? (totalConversions * 100) / totalSpend : 0;
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;

  // Calculate trends (mock data for now - in real app, compare with previous period)
  const spendTrend = 12.5; // +12.5%
  const roasTrend = -3.2; // -3.2%
  const ctrTrend = 8.1; // +8.1%
  const conversionsTrend = 15.3; // +15.3%

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number, decimals: number = 1) => {
    return `${num.toFixed(decimals)}%`;
  };

  const TrendIndicator: React.FC<{ trend: number; showPercentage?: boolean }> = ({ 
    trend, 
    showPercentage = true 
  }) => {
    const isPositive = trend > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    
    return (
      <div className={`flex items-center gap-1 text-sm ${colorClass}`}>
        <Icon className="w-4 h-4" />
        {showPercentage ? formatPercentage(Math.abs(trend)) : formatNumber(Math.abs(trend))}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {/* Total Spend */}
      <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-viz-text-secondary">
            Total Spend
          </CardTitle>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-viz-dark dark:text-white mb-4">
            {formatCurrency(totalSpend)}
          </div>
          <div className="flex items-center justify-between">
            <TrendIndicator trend={spendTrend} />
            <Badge variant="secondary" className="text-xs px-2 py-1">
              {activeCampaigns} active
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* ROAS */}
      <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-viz-text-secondary">
            Average ROAS
          </CardTitle>
          <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-viz-dark dark:text-white mb-4">
            {formatPercentage(averageROAS, 0)}
          </div>
          <div className="flex items-center justify-between">
            <TrendIndicator trend={roasTrend} />
            <Badge 
              variant={averageROAS > 200 ? "default" : averageROAS > 150 ? "secondary" : "destructive"}
              className="text-xs px-2 py-1"
            >
              {averageROAS > 200 ? 'Excellent' : averageROAS > 150 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* CTR */}
      <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-viz-text-secondary">
            Average CTR
          </CardTitle>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <MousePointer className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-viz-dark dark:text-white mb-4">
            {formatPercentage(averageCTR)}
          </div>
          <div className="flex items-center justify-between">
            <TrendIndicator trend={ctrTrend} />
            <div className="text-xs text-slate-500 dark:text-viz-text-secondary font-medium">
              {formatNumber(totalClicks)} clicks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversions */}
      <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-slate-600 dark:text-viz-text-secondary">
            Total Conversions
          </CardTitle>
          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <Activity className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-3xl font-bold text-viz-dark dark:text-white mb-4">
            {formatNumber(totalConversions)}
          </div>
          <div className="flex items-center justify-between">
            <TrendIndicator trend={conversionsTrend} showPercentage={false} />
            <div className="text-xs text-slate-500 dark:text-viz-text-secondary font-medium">
              {formatCurrency(averageCPA)} CPA
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-viz-accent to-viz-accent-dark" />
      </Card>

      {/* Platform Breakdown */}
      {platformMetrics.length > 1 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Platform Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformMetrics.map((platform) => (
                <div key={platform.platform} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium capitalize">{platform.platform}</h4>
                    <Badge variant="outline" className="text-xs">
                      {platform.activeCampaigns} campaigns
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spend:</span>
                      <span className="font-medium">{formatCurrency(platform.totalSpend)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ROAS:</span>
                      <span className={`font-medium ${
                        platform.averageROAS > 200 ? 'text-green-600' :
                        platform.averageROAS > 150 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {formatPercentage(platform.averageROAS, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">CTR:</span>
                      <span className="font-medium">{formatPercentage(platform.averageCTR)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Conversions:</span>
                      <span className="font-medium">{formatNumber(platform.totalConversions)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MIAMetricsCards;
