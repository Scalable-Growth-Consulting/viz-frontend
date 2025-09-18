import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  DollarSign,
  Heart,
  Award,
  X,
  ArrowUp,
  ArrowDown,
  MoreHorizontal
} from 'lucide-react';
import { ActionableInsight } from '../types';
import { useInsights } from '../hooks/useInsights';

interface BrandlenzInsightsProps {
  insights: ActionableInsight[];
  loading: boolean;
}

const BrandlenzInsights: React.FC<BrandlenzInsightsProps> = ({ insights: propInsights, loading: propLoading }) => {
  const { insights, loading, markAsCompleted, dismissInsight, prioritizeInsight } = useInsights();
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'opportunity' | 'threat' | 'improvement' | 'amplification'>('all');

  // Use hook data if available, otherwise use props
  const displayInsights = insights.length > 0 ? insights : propInsights || [];
  const isLoading = loading || propLoading;

  const getInsightIcon = (type: ActionableInsight['type']) => {
    switch (type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'threat': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'improvement': return <Target className="w-5 h-5 text-blue-600" />;
      case 'amplification': return <Zap className="w-5 h-5 text-purple-600" />;
      default: return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getInsightColor = (type: ActionableInsight['type']) => {
    switch (type) {
      case 'opportunity': return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
      case 'threat': return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      case 'improvement': return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20';
      case 'amplification': return 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/20';
      default: return 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800';
    }
  };

  const getPriorityColor = (priority: ActionableInsight['priority']) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getEffortColor = (effort: ActionableInsight['effort']) => {
    switch (effort) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  const getStatusIcon = (status: ActionableInsight['actions'][0]['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-gray-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const filteredInsights = displayInsights.filter(insight => {
    if (filter !== 'all' && insight.priority !== filter) return false;
    if (typeFilter !== 'all' && insight.type !== typeFilter) return false;
    return true;
  });

  const handleActionComplete = async (insightId: string, actionId: string) => {
    try {
      await markAsCompleted(insightId, actionId);
    } catch (error) {
      console.error('Failed to mark action as completed:', error);
    }
  };

  const handleDismiss = async (insightId: string) => {
    try {
      await dismissInsight(insightId);
    } catch (error) {
      console.error('Failed to dismiss insight:', error);
    }
  };

  const handlePriorityChange = async (insightId: string, priority: ActionableInsight['priority']) => {
    try {
      await prioritizeInsight(insightId, priority);
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  if (isLoading && displayInsights.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Actionable Insights</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {filteredInsights.length} insights requiring attention
          </p>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <div className="flex gap-1">
            {(['all', 'critical', 'high', 'medium', 'low'] as const).map(priority => (
              <Button
                key={priority}
                variant={filter === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(priority)}
              >
                {priority === 'all' ? 'All' : priority}
              </Button>
            ))}
          </div>
          <div className="flex gap-1">
            {(['all', 'opportunity', 'threat', 'improvement', 'amplification'] as const).map(type => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                onClick={() => setTypeFilter(type)}
              >
                {type === 'all' ? 'All Types' : type}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Insights List */}
      <ScrollArea className="h-[700px]">
        <div className="space-y-6">
          {filteredInsights.map((insight) => (
            <Card key={insight.id} className={`${getInsightColor(insight.type)} border-l-4`}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Insight Icon */}
                  <div className="flex-shrink-0">
                    {getInsightIcon(insight.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getPriorityColor(insight.priority)}>
                            {insight.priority}
                          </Badge>
                          <Badge variant="outline" className="capitalize">
                            {insight.type}
                          </Badge>
                          <Badge variant="outline" className={getEffortColor(insight.effort)}>
                            {insight.effort} effort
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                          {insight.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(insight.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Impact Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {insight.impact.revenue >= 0 ? '+' : ''}${Math.abs(insight.impact.revenue).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">Revenue Impact</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <Heart className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {insight.impact.satisfaction >= 0 ? '+' : ''}{(insight.impact.satisfaction * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Satisfaction</div>
                      </div>
                      <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border">
                        <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {insight.impact.reputation >= 0 ? '+' : ''}{(insight.impact.reputation * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">Reputation</div>
                      </div>
                    </div>

                    {/* Timeline and Departments */}
                    <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{insight.timeline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{insight.department.join(', ')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">Action Items</h4>
                      {insight.actions.map((action, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border">
                          <div className="flex items-center gap-3 flex-1">
                            {getStatusIcon(action.status)}
                            <div className="flex-1">
                              <div className="font-medium text-sm text-gray-900 dark:text-white">
                                {action.action}
                              </div>
                              <div className="text-xs text-gray-500">
                                {action.owner} • Due {new Date(action.deadline).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {action.status !== 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleActionComplete(insight.id, action.action)}
                            >
                              Mark Complete
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* KPIs */}
                    {insight.kpis.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="font-medium text-gray-900 dark:text-white">Key Metrics</h4>
                        {insight.kpis.map((kpi, index) => {
                          const progress = (kpi.currentValue / kpi.targetValue) * 100;
                          const isImproving = kpi.currentValue < kpi.targetValue;
                          
                          return (
                            <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {kpi.metric}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {kpi.currentValue}{kpi.unit} → {kpi.targetValue}{kpi.unit}
                                  </span>
                                  {isImproving ? (
                                    <ArrowUp className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <ArrowDown className="w-4 h-4 text-red-600" />
                                  )}
                                </div>
                              </div>
                              <Progress value={Math.min(progress, 100)} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Priority Actions */}
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Priority:</span>
                      <div className="flex gap-1">
                        {(['low', 'medium', 'high', 'critical'] as const).map(priority => (
                          <Button
                            key={priority}
                            variant={insight.priority === priority ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePriorityChange(insight.id, priority)}
                          >
                            {priority}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Empty State */}
          {filteredInsights.length === 0 && !isLoading && (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No insights found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {filter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters to see more insights.'
                    : 'Great! No critical issues require immediate attention.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default BrandlenzInsights;
