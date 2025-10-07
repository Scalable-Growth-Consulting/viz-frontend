import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, TrendingDown, MessageSquare, Heart, AlertTriangle, 
  Eye, Users, BarChart3, Download, Search, Filter, Bell,
  Twitter, Linkedin, Instagram, Facebook, Youtube, Star,
  ArrowUp, ArrowDown, Minus, Zap, Target, Globe
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
}

interface PlatformMetrics {
  platform: string;
  icon: React.ElementType;
  mentions: number;
  sentiment: SentimentData;
  engagement: number;
  reach: number;
  trending: 'up' | 'down' | 'stable';
}

interface CompetitorData {
  name: string;
  sentiment: number;
  mentions: number;
  share: number;
}

const BrandlenzDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - in real implementation, this would come from APIs
  const platformMetrics: PlatformMetrics[] = [
    {
      platform: 'Twitter',
      icon: Twitter,
      mentions: 2847,
      sentiment: { positive: 45, negative: 15, neutral: 35, mixed: 5 },
      engagement: 12.4,
      reach: 145000,
      trending: 'up'
    },
    {
      platform: 'LinkedIn',
      icon: Linkedin,
      mentions: 1234,
      sentiment: { positive: 62, negative: 8, neutral: 28, mixed: 2 },
      engagement: 8.7,
      reach: 89000,
      trending: 'up'
    },
    {
      platform: 'Instagram',
      icon: Instagram,
      mentions: 3456,
      sentiment: { positive: 58, negative: 12, neutral: 27, mixed: 3 },
      engagement: 15.2,
      reach: 234000,
      trending: 'stable'
    },
    {
      platform: 'Facebook',
      icon: Facebook,
      mentions: 1876,
      sentiment: { positive: 41, negative: 18, neutral: 38, mixed: 3 },
      engagement: 6.8,
      reach: 167000,
      trending: 'down'
    }
  ];

  const overallSentiment = useMemo(() => {
    const total = platformMetrics.reduce((acc, platform) => ({
      positive: acc.positive + platform.sentiment.positive * platform.mentions,
      negative: acc.negative + platform.sentiment.negative * platform.mentions,
      neutral: acc.neutral + platform.sentiment.neutral * platform.mentions,
      mixed: acc.mixed + platform.sentiment.mixed * platform.mentions
    }), { positive: 0, negative: 0, neutral: 0, mixed: 0 });

    const totalMentions = platformMetrics.reduce((acc, p) => acc + p.mentions, 0);
    
    return {
      positive: Math.round((total.positive / totalMentions) * 100) / 100,
      negative: Math.round((total.negative / totalMentions) * 100) / 100,
      neutral: Math.round((total.neutral / totalMentions) * 100) / 100,
      mixed: Math.round((total.mixed / totalMentions) * 100) / 100
    };
  }, [platformMetrics]);

  const competitorData: CompetitorData[] = [
    { name: 'Competitor A', sentiment: 72, mentions: 1234, share: 28 },
    { name: 'Competitor B', sentiment: 68, mentions: 987, share: 22 },
    { name: 'Your Brand', sentiment: 78, mentions: 1567, share: 35 },
    { name: 'Competitor C', sentiment: 65, mentions: 678, share: 15 }
  ];

  const sentimentChartData = {
    labels: ['Positive', 'Neutral', 'Negative', 'Mixed'],
    datasets: [{
      data: [overallSentiment.positive, overallSentiment.neutral, overallSentiment.negative, overallSentiment.mixed],
      backgroundColor: ['#10b981', '#6b7280', '#ef4444', '#f59e0b'],
      borderWidth: 0
    }]
  };

  const trendData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Sentiment Score',
        data: [72, 75, 68, 82, 78, 85, 79],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Mentions',
        data: [120, 135, 98, 156, 142, 178, 165],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        fill: true,
        tension: 0.4,
        yAxisID: 'y1'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-violet-900/20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                    Brandlenz
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">AI-Powered Brand Intelligence</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search mentions, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 Hours</SelectItem>
                  <SelectItem value="7d">7 Days</SelectItem>
                  <SelectItem value="30d">30 Days</SelectItem>
                  <SelectItem value="90d">90 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              <Button size="sm" className="bg-gradient-to-r from-violet-600 to-purple-600">
                <Bell className="w-4 h-4 mr-2" />
                Alerts
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Mentions</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {platformMetrics.reduce((acc, p) => acc + p.mentions, 0).toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">+12.5%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sentiment Score</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">78.2</p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">+3.2</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Reach</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(platformMetrics.reduce((acc, p) => acc + p.reach, 0) / 1000000).toFixed(1)}M
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600 dark:text-green-400">+8.7%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 flex items-center justify-center">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Engagement Rate</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {(platformMetrics.reduce((acc, p) => acc + p.engagement * p.mentions, 0) / 
                      platformMetrics.reduce((acc, p) => acc + p.mentions, 0)).toFixed(1)}%
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDown className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">-1.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sentiment Analysis */}
          <Card className="lg:col-span-2 bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-violet-600" />
                Sentiment Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line 
                  data={trendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const }
                    },
                    scales: {
                      y: { beginAtZero: true },
                      y1: {
                        type: 'linear' as const,
                        display: true,
                        position: 'right' as const,
                        grid: { drawOnChartArea: false }
                      }
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Breakdown */}
          <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-violet-600" />
                Sentiment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center">
                <Doughnut 
                  data={sentimentChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom' as const }
                    }
                  }}
                />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Positive</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {overallSentiment.positive}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Neutral</span>
                  <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400">
                    {overallSentiment.neutral}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Negative</span>
                  <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                    {overallSentiment.negative}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Platform Performance */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-600" />
              Platform Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {platformMetrics.map((platform) => {
                const Icon = platform.icon;
                const TrendIcon = platform.trending === 'up' ? TrendingUp : 
                                platform.trending === 'down' ? TrendingDown : Minus;
                const trendColor = platform.trending === 'up' ? 'text-green-500' : 
                                 platform.trending === 'down' ? 'text-red-500' : 'text-gray-500';
                
                return (
                  <div key={platform.platform} className="p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        <span className="font-medium text-slate-900 dark:text-white">{platform.platform}</span>
                      </div>
                      <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Mentions</span>
                        <span className="font-medium">{platform.mentions.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Positive</span>
                        <span className="font-medium text-green-600">{platform.sentiment.positive}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Engagement</span>
                        <span className="font-medium">{platform.engagement}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Reach</span>
                        <span className="font-medium">{(platform.reach / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Competitor Analysis */}
        <Card className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border-slate-200/60 dark:border-slate-700/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-violet-600" />
              Competitor Benchmark
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {competitorData.map((competitor, index) => (
                <div key={competitor.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-200/60 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      competitor.name === 'Your Brand' ? 'bg-gradient-to-r from-violet-600 to-purple-600' : 'bg-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{competitor.name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{competitor.mentions} mentions</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Sentiment</p>
                      <p className="font-bold text-slate-900 dark:text-white">{competitor.sentiment}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">Market Share</p>
                      <p className="font-bold text-slate-900 dark:text-white">{competitor.share}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandlenzDashboard;
