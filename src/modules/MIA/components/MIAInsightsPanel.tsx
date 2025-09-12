import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Target,
  Lightbulb,
  CheckCircle,
  Clock,
  ArrowRight,
  Zap,
  Users,
  Eye,
  MousePointer
} from 'lucide-react';
import { AdInsight } from '../types/insights';

interface MIAInsightsPanelProps {
  insights: AdInsight[];
  showAll?: boolean;
}

const MIAInsightsPanel: React.FC<MIAInsightsPanelProps> = ({ insights, showAll = false }) => {
  const displayInsights = showAll ? insights : insights.slice(0, 5);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'ad_fatigue':
        return <Clock className="w-5 h-5" />;
      case 'budget_optimization':
      case 'budget_exhaustion':
      case 'budget_underutilization':
        return <DollarSign className="w-5 h-5" />;
      case 'keyword_performance':
      case 'bid_optimization':
        return <Target className="w-5 h-5" />;
      case 'creative_performance':
      case 'creative_underperforming':
      case 'performance_spike':
        return <TrendingUp className="w-5 h-5" />;
      case 'ctr_decline':
        return <MousePointer className="w-5 h-5" />;
      case 'impression_share_loss':
        return <Eye className="w-5 h-5" />;
      case 'demographic_opportunity':
      case 'audience_saturation':
        return <Users className="w-5 h-5" />;
      case 'roas_below_target':
      case 'conversion_drop':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Lightbulb className="w-5 h-5" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400';
      case 'high':
        return 'text-orange-600 dark:text-orange-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      case 'opportunity':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive' as const;
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'secondary' as const;
      case 'low':
        return 'outline' as const;
      case 'opportunity':
        return 'default' as const;
      default:
        return 'outline' as const;
    }
  };

  const getPlatformEmoji = (platform: string) => {
    switch (platform) {
      case 'google':
        return '🎯';
      case 'meta':
        return '📘';
      case 'cross-platform':
        return '🔄';
      default:
        return '📊';
    }
  };

  if (displayInsights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Great job! Your campaigns are performing well with no critical issues detected. 
              Keep monitoring performance and consider testing new strategies to drive growth.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-viz-accent" />
          AI Insights & Recommendations
          <Badge variant="secondary" className="ml-auto">
            {insights.length} insights
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {displayInsights.map((insight, index) => (
          <div
            key={`${insight.type}-${index}`}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={getSeverityColor(insight.severity)}>
                  {getInsightIcon(insight.type)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-viz-dark dark:text-white">
                    {insight.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getSeverityBadgeVariant(insight.severity)} className="text-xs">
                      {insight.severity.toUpperCase()} PRIORITY
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {insight.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-lg">{getPlatformEmoji(insight.platform)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {insight.confidence}% confidence
                </Badge>
                {insight.automationPossible && (
                  <Badge variant="default" className="text-xs bg-green-600">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto-Fix
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground leading-relaxed">
              {insight.description}
            </p>

            {/* Recommendation */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-3">
              <div className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-sm text-blue-800 dark:text-blue-200 font-medium">
                    Recommendation:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {insight.recommendation}
                  </p>
                  {insight.estimatedImpact && (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        {insight.estimatedImpact}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {insight.timeframe}
                {insight.dataPoints && (
                  <>
                    <span className="mx-1">•</span>
                    <span>Based on: {insight.dataPoints.join(', ')}</span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {insight.campaignId && (
                  <Button variant="outline" size="sm" className="text-xs">
                    View Campaign
                  </Button>
                )}
                {insight.automationPossible && (
                  <Button size="sm" className="text-xs bg-green-600 hover:bg-green-700">
                    <Zap className="w-3 h-3 mr-1" />
                    Auto-Apply
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Show More Button */}
        {!showAll && insights.length > 5 && (
          <div className="text-center pt-4">
            <Button variant="outline" className="w-full">
              View All {insights.length} Insights
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}

        {/* Summary Stats */}
        {showAll && insights.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {insights.filter(i => i.severity === 'critical').length}
                </div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {insights.filter(i => i.severity === 'high').length}
                </div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {insights.filter(i => i.severity === 'medium').length}
                </div>
                <div className="text-xs text-muted-foreground">Medium Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {insights.filter(i => i.severity === 'low').length}
                </div>
                <div className="text-xs text-muted-foreground">Low Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {insights.filter(i => i.severity === 'opportunity').length}
                </div>
                <div className="text-xs text-muted-foreground">Opportunities</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Badge variant="outline" className="text-xs">
                {insights.filter(i => i.automationPossible).length} insights can be auto-optimized
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MIAInsightsPanel;
