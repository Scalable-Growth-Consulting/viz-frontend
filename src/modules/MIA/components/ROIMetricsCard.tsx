import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  DollarSign,
  Users,
  Eye,
  MousePointer,
  ShoppingCart,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

interface ROIMetricsCardProps {
  title: string;
  metrics: {
    platform: 'google' | 'meta' | 'combined';
    timeframe: string;
    
    // Core Performance Metrics
    spend: number;
    revenue: number;
    roas: number;
    
    // Traffic Metrics
    impressions: number;
    clicks: number;
    ctr: number;
    cpc: number;
    
    // Conversion Metrics
    conversions: number;
    conversionRate: number;
    cpa: number;
    
    // Advanced Metrics
    ltv?: number;
    paybackPeriod?: number;
    marginROI?: number;
    
    // Platform Specific
    google?: {
      qualityScore: number;
      impressionShare: number;
      searchImpressionShare: number;
    };
    
    meta?: {
      frequency: number;
      reach: number;
      engagementRate: number;
      videoCompletionRate?: number;
    };
    
    // Trend Data
    trends: {
      spend: number; // % change
      revenue: number;
      roas: number;
      conversions: number;
    };
  };
}

const ROIMetricsCard: React.FC<ROIMetricsCardProps> = ({ title, metrics }) => {
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatNumber = (value: number) => value.toLocaleString();

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <BarChart3 className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getROASStatus = (roas: number) => {
    if (roas >= 4) return { color: 'text-green-600', status: 'Excellent', variant: 'default' as const };
    if (roas >= 3) return { color: 'text-blue-600', status: 'Good', variant: 'secondary' as const };
    if (roas >= 2) return { color: 'text-yellow-600', status: 'Fair', variant: 'outline' as const };
    if (roas >= 1) return { color: 'text-orange-600', status: 'Poor', variant: 'outline' as const };
    return { color: 'text-red-600', status: 'Critical', variant: 'destructive' as const };
  };

  const roasStatus = getROASStatus(metrics.roas);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-viz-accent" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {metrics.platform}
            </Badge>
            <Badge variant="secondary">
              {metrics.timeframe}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Primary ROI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-viz-dark dark:text-white">
              {formatCurrency(metrics.spend)}
            </div>
            <div className="text-sm text-muted-foreground">Total Spend</div>
            <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${getTrendColor(metrics.trends.spend)}`}>
              {getTrendIcon(metrics.trends.spend)}
              {Math.abs(metrics.trends.spend).toFixed(1)}%
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-viz-dark dark:text-white">
              {formatCurrency(metrics.revenue)}
            </div>
            <div className="text-sm text-muted-foreground">Revenue</div>
            <div className={`text-xs flex items-center justify-center gap-1 mt-1 ${getTrendColor(metrics.trends.revenue)}`}>
              {getTrendIcon(metrics.trends.revenue)}
              {Math.abs(metrics.trends.revenue).toFixed(1)}%
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className={`text-2xl font-bold ${roasStatus.color}`}>
              {metrics.roas.toFixed(2)}:1
            </div>
            <div className="text-sm text-muted-foreground">ROAS</div>
            <div className="mt-1">
              <Badge variant={roasStatus.variant} className="text-xs">
                {roasStatus.status}
              </Badge>
            </div>
          </div>

          <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="text-2xl font-bold text-viz-dark dark:text-white">
              {formatCurrency(metrics.revenue - metrics.spend)}
            </div>
            <div className="text-sm text-muted-foreground">Profit</div>
            <div className={`text-xs ${metrics.revenue - metrics.spend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {((metrics.revenue - metrics.spend) / metrics.spend * 100).toFixed(1)}% margin
            </div>
          </div>
        </div>

        {/* Traffic & Conversion Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Impressions
              </span>
              <span className="text-sm font-bold">{formatNumber(metrics.impressions)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Clicks
              </span>
              <span className="text-sm font-bold">{formatNumber(metrics.clicks)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CTR</span>
              <span className="text-sm font-bold">{formatPercentage(metrics.ctr)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Conversions
              </span>
              <span className="text-sm font-bold">{formatNumber(metrics.conversions)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Conversion Rate</span>
              <span className="text-sm font-bold">{formatPercentage(metrics.conversionRate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPA</span>
              <span className="text-sm font-bold">{formatCurrency(metrics.cpa)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">CPC</span>
              <span className="text-sm font-bold">{formatCurrency(metrics.cpc)}</span>
            </div>
            {metrics.ltv && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">LTV</span>
                <span className="text-sm font-bold">{formatCurrency(metrics.ltv)}</span>
              </div>
            )}
            {metrics.paybackPeriod && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payback</span>
                <span className="text-sm font-bold">{metrics.paybackPeriod} days</span>
              </div>
            )}
          </div>
        </div>

        {/* Platform-Specific Metrics */}
        {metrics.google && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Google Ads Performance
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{metrics.google.qualityScore}/10</div>
                <div className="text-xs text-muted-foreground">Quality Score</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatPercentage(metrics.google.impressionShare)}</div>
                <div className="text-xs text-muted-foreground">Impression Share</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatPercentage(metrics.google.searchImpressionShare)}</div>
                <div className="text-xs text-muted-foreground">Search IS</div>
              </div>
            </div>
          </div>
        )}

        {metrics.meta && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Meta Ads Performance
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold">{formatNumber(metrics.meta.reach)}</div>
                <div className="text-xs text-muted-foreground">Reach</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{metrics.meta.frequency.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Frequency</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold">{formatPercentage(metrics.meta.engagementRate)}</div>
                <div className="text-xs text-muted-foreground">Engagement Rate</div>
              </div>
            </div>
            {metrics.meta.videoCompletionRate && (
              <div className="mt-2 text-center">
                <div className="text-lg font-bold">{formatPercentage(metrics.meta.videoCompletionRate)}</div>
                <div className="text-xs text-muted-foreground">Video Completion Rate</div>
              </div>
            )}
          </div>
        )}

        {/* Performance Indicators */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold mb-3">Performance Health</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>ROAS Target Progress</span>
                <span>{metrics.roas.toFixed(2)}/4.0</span>
              </div>
              <Progress value={(metrics.roas / 4) * 100} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Conversion Rate Health</span>
                <span>{formatPercentage(metrics.conversionRate)}</span>
              </div>
              <Progress 
                value={Math.min((metrics.conversionRate / 5) * 100, 100)} 
                className="h-2"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Details
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Zap className="w-4 h-4 mr-2" />
            Optimize
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ROIMetricsCard;
