import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  MessageSquare, 
  Heart, 
  ThumbsDown,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  Award,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Share2,
  Bell
} from 'lucide-react';
import { useBrandlenz } from '../hooks/useBrandlenz';
import { useMentions } from '../hooks/useMentions';
import { useInsights } from '../hooks/useInsights';
import { BrandHealthScore, Platform, SentimentScore } from '../types';
import BrandlenzIntegrations from './BrandlenzIntegrations';
import BrandlenzMentions from './BrandlenzMentions';
import BrandlenzInsights from './BrandlenzInsights';

interface BrandlenzDashboardProps {
  loading?: boolean;
}

const BrandlenzDashboard: React.FC<BrandlenzDashboardProps> = ({ loading = false }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { dashboardData, loading: dashboardLoading, refreshData } = useBrandlenz();
  const { mentions, loading: mentionsLoading } = useMentions();
  const { insights, loading: insightsLoading } = useInsights();

  const isLoading = loading || dashboardLoading;

  // Real-time metrics
  const realtimeMetrics = dashboardData?.realtimeMetrics || {
    mentionsLast24h: 0,
    sentimentTrend: 0,
    criticalIssues: 0,
    newOpportunities: 0,
  };

  // Brand health score
  const brandHealth = dashboardData?.brandHealthScore || {
    overall: 0,
    sentiment: 0,
    claimAlignment: 0,
    issueResolution: 0,
    customerObsession: 0,
    trend: 'stable' as const,
  };

  // Sentiment distribution
  const sentimentData = dashboardData?.platformAnalysis?.reduce((acc, platform) => {
    Object.entries(platform.sentimentDistribution).forEach(([sentiment, count]) => {
      acc[sentiment as SentimentScore] = (acc[sentiment as SentimentScore] || 0) + count;
    });
    return acc;
  }, {} as Record<SentimentScore, number>) || {};

  const totalMentions = Object.values(sentimentData).reduce((sum, count) => sum + count, 0);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Activity className="w-4 h-4 text-gray-600" />;
  };

  const getSentimentColor = (sentiment: SentimentScore) => {
    switch (sentiment) {
      case 'very_positive': return 'text-green-700 bg-green-100 dark:bg-green-900/20';
      case 'positive': return 'text-green-600 bg-green-50 dark:bg-green-900/10';
      case 'neutral': return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
      case 'negative': return 'text-red-600 bg-red-50 dark:bg-red-900/10';
      case 'very_negative': return 'text-red-700 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
          <div className="flex gap-2">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
        </div>

        {/* Metrics Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Brand Intelligence</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Monitor, analyze, and optimize your brand's online presence
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mentions (24h)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {realtimeMetrics.mentionsLast24h.toLocaleString()}
                </p>
                <div className="flex items-center mt-1">
                  {getTrendIcon(realtimeMetrics.sentimentTrend)}
                  <span className={`text-sm ml-1 ${realtimeMetrics.sentimentTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {realtimeMetrics.sentimentTrend >= 0 ? '+' : ''}{(realtimeMetrics.sentimentTrend * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Brand Health</p>
                <p className={`text-2xl font-bold ${getHealthScoreColor(brandHealth.overall)}`}>
                  {brandHealth.overall}/100
                </p>
                <div className="flex items-center mt-1">
                  {brandHealth.trend === 'improving' ? (
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  ) : brandHealth.trend === 'declining' ? (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="text-sm ml-1 text-gray-600 dark:text-gray-400 capitalize">
                    {brandHealth.trend}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-full ${getHealthScoreBg(brandHealth.overall)}`}>
                <Heart className={`w-6 h-6 ${getHealthScoreColor(brandHealth.overall)}`} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {realtimeMetrics.criticalIssues}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Require attention
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Opportunities</p>
                <p className="text-2xl font-bold text-green-600">
                  {realtimeMetrics.newOpportunities}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  New this week
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Brand Health Breakdown */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Brand Health Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(brandHealth.breakdown).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                        <span className={`text-sm font-semibold ${getHealthScoreColor(value)}`}>
                          {value}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Sentiment Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5" />
                  Sentiment Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(sentimentData).map(([sentiment, count]) => {
                    const percentage = totalMentions > 0 ? (count / totalMentions) * 100 : 0;
                    return (
                      <div key={sentiment} className="flex items-center justify-between">
                        <Badge variant="outline" className={getSentimentColor(sentiment as SentimentScore)}>
                          {sentiment.replace('_', ' ')}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {percentage.toFixed(1)}%
                          </span>
                          <span className="text-sm font-semibold">
                            {count.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Issues and Positives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                  Top Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {dashboardData?.topIssues?.slice(0, 5).map((issue) => (
                      <div key={issue.id} className="p-3 border border-red-200 dark:border-red-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{issue.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {issue.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={issue.severity === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                {issue.severity}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {issue.frequency} mentions
                              </span>
                            </div>
                          </div>
                          {issue.trend === 'increasing' && (
                            <ArrowUpRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Award className="w-5 h-5" />
                  Top Positives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {dashboardData?.topPositives?.slice(0, 5).map((positive) => (
                      <div key={positive.id} className="p-3 border border-green-200 dark:border-green-800 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{positive.title}</h4>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {positive.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                opportunity
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {positive.frequency} mentions
                              </span>
                            </div>
                          </div>
                          {positive.trend === 'increasing' && (
                            <ArrowUpRight className="w-4 h-4 text-green-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mentions">
          <BrandlenzMentions mentions={mentions} loading={mentionsLoading} />
        </TabsContent>

        <TabsContent value="insights">
          <BrandlenzInsights insights={insights} loading={insightsLoading} />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.platformAnalysis?.map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium capitalize">{platform.platform.replace('_', ' ')}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {platform.totalMentions.toLocaleString()} mentions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {platform.engagement.totalReach.toLocaleString()} reach
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg {platform.engagement.averageLikes} likes
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Competitor Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData?.competitorAnalysis?.map((competitor) => (
                    <div key={competitor.competitorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{competitor.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {competitor.mentionVolume.toLocaleString()} mentions
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${getHealthScoreColor(competitor.sentimentScore)}`}>
                          {competitor.sentimentScore}/100
                        </div>
                        <div className="text-xs text-gray-500">
                          {(competitor.marketShare * 100).toFixed(1)}% share
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integrations">
          <BrandlenzIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandlenzDashboard;
