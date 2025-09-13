import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  Users,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  RefreshCw,
  Settings
} from 'lucide-react';

interface AutoOptimizationPanelProps {
  insights: Array<{
    id: string;
    type: string;
    severity: 'critical' | 'high' | 'medium' | 'low' | 'opportunity';
    title: string;
    description: string;
    recommendation: string;
    estimatedImpact: string;
    automationPossible: boolean;
    confidence: number;
    platform: 'google' | 'meta' | 'cross-platform';
    campaignId?: string;
  }>;
  automationSettings: {
    enabled: boolean;
    maxBudgetChange: number; // percentage
    maxBidChange: number; // percentage
    minConfidenceThreshold: number;
    approvalRequired: boolean;
  };
  onToggleAutomation: (enabled: boolean) => void;
  onApplyOptimization: (insightId: string) => void;
  onUpdateSettings: (settings: any) => void;
}

const AutoOptimizationPanel: React.FC<AutoOptimizationPanelProps> = ({
  insights,
  automationSettings,
  onToggleAutomation,
  onApplyOptimization,
  onUpdateSettings
}) => {
  const automationEligibleInsights = insights.filter(
    insight => insight.automationPossible && insight.confidence >= automationSettings.minConfidenceThreshold
  );

  const potentialImpactSum = automationEligibleInsights.reduce((sum, insight) => {
    const match = insight.estimatedImpact.match(/\$(\d+)/);
    return sum + (match ? parseInt(match[1]) : 0);
  }, 0);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case 'opportunity':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      default:
        return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
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

  return (
    <div className="space-y-6">
      {/* Automation Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-viz-accent" />
              Auto-Optimization Engine
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={automationSettings.enabled ? 'default' : 'secondary'}>
                {automationSettings.enabled ? 'Active' : 'Disabled'}
              </Badge>
              <Button
                variant={automationSettings.enabled ? 'destructive' : 'default'}
                size="sm"
                onClick={() => onToggleAutomation(!automationSettings.enabled)}
              >
                {automationSettings.enabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {automationSettings.enabled ? (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Auto-optimization is active. The system will automatically apply optimizations that meet your confidence threshold of {automationSettings.minConfidenceThreshold}% and stay within your budget change limits.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {automationEligibleInsights.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Eligible Optimizations</div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${potentialImpactSum.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Potential Monthly Impact</div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {automationSettings.maxBudgetChange}%
                  </div>
                  <div className="text-sm text-muted-foreground">Max Budget Change</div>
                </div>
              </div>
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Auto-optimization is disabled. You can still review and manually apply optimization recommendations below.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Automation-Eligible Insights */}
      {automationEligibleInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-green-600" />
              Ready for Auto-Optimization
              <Badge variant="outline" className="ml-auto">
                {automationEligibleInsights.length} actions
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {automationEligibleInsights.map((insight, index) => (
              <div
                key={insight.id}
                className="border border-green-200 dark:border-green-800 rounded-lg p-4 bg-green-50 dark:bg-green-900/10"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(insight.severity)}
                      <span className="text-lg">{getPlatformIcon(insight.platform)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-viz-dark dark:text-white">
                        {insight.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs bg-white">
                          {insight.confidence}% confidence
                        </Badge>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {insight.platform}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onApplyOptimization(insight.id)}
                    disabled={!automationSettings.enabled}
                  >
                    {automationSettings.approvalRequired ? 'Approve' : 'Apply'}
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                  {insight.description}
                </p>

                <div className="bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 rounded-md p-3">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Auto-Optimization Action:
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        {insight.recommendation}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                          {insight.estimatedImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {automationSettings.enabled && (
              <div className="text-center pt-4 border-t">
                <Button className="w-full">
                  Apply All {automationEligibleInsights.length} Optimizations
                  <Zap className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Manual Review Required */}
      {insights.filter(i => !i.automationPossible).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Settings className="w-5 h-5 text-orange-600" />
              Manual Review Required
              <Badge variant="outline" className="ml-auto">
                {insights.filter(i => !i.automationPossible).length} insights
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights
              .filter(insight => !insight.automationPossible)
              .slice(0, 3)
              .map((insight, index) => (
              <div
                key={insight.id}
                className="border border-orange-200 dark:border-orange-800 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/10"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getSeverityIcon(insight.severity)}
                      <span className="text-lg">{getPlatformIcon(insight.platform)}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-viz-dark dark:text-white">
                        {insight.title}
                      </h4>
                      <Badge variant="outline" className="text-xs mt-1">
                        Manual action needed
                      </Badge>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3">
                  {insight.description}
                </p>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                    {insight.estimatedImpact}
                  </span>
                  <Button variant="outline" size="sm">
                    Review Details
                  </Button>
                </div>
              </div>
            ))}

            {insights.filter(i => !i.automationPossible).length > 3 && (
              <div className="text-center">
                <Button variant="outline" className="w-full">
                  View All {insights.filter(i => !i.automationPossible).length} Manual Reviews
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Automation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Max Budget Change</label>
              <div className="text-2xl font-bold text-viz-dark dark:text-white">
                {automationSettings.maxBudgetChange}%
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum daily budget adjustment
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Confidence Threshold</label>
              <div className="text-2xl font-bold text-viz-dark dark:text-white">
                {automationSettings.minConfidenceThreshold}%
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum confidence for auto-apply
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <div className="font-medium">Approval Required</div>
              <div className="text-sm text-muted-foreground">
                Require manual approval before applying optimizations
              </div>
            </div>
            <Badge variant={automationSettings.approvalRequired ? 'default' : 'outline'}>
              {automationSettings.approvalRequired ? 'On' : 'Off'}
            </Badge>
          </div>

          <Button variant="outline" className="w-full" onClick={() => onUpdateSettings({})}>
            <Settings className="w-4 h-4 mr-2" />
            Configure Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoOptimizationPanel;
