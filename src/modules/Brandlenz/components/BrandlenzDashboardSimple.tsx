import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  AlertTriangle, 
  Target,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Settings,
  Sparkles,
  Award
} from 'lucide-react';
import BrandlenzIntegrationStatus from './BrandlenzIntegrationStatus';

const BrandlenzDashboardSimple: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 dark:from-viz-dark dark:via-slate-900 dark:to-indigo-950">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 bg-clip-text text-transparent">
                  Brandlenz
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-300 font-medium">
                  Social Listening & Brand Intelligence
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live monitoring across 11 platforms</span>
              <span>â€¢</span>
              <span>Last updated 2 minutes ago</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-1">
              {['24h', '7d', '30d', '90d'].map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedTimeframe(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTimeframe === period
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            
            <Button variant="outline" className="border-slate-200 dark:border-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Brand Health Score */}
        <Card className="bg-gradient-to-br from-white via-indigo-50/50 to-purple-50/50 dark:from-slate-800 dark:via-indigo-900/20 dark:to-purple-900/20 border-0 shadow-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Brand Health Score</h2>
                  <p className="text-slate-600 dark:text-slate-300">Overall brand performance</p>
                </div>
              </div>
              <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                Excellent
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative">
                  <div className="flex items-center justify-center w-32 h-32 mx-auto">
                    <div className="text-center">
                      <div className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        87
                      </div>
                      <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        out of 100
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-lg font-semibold text-green-600">+12.5%</span>
                    <span className="text-slate-600 dark:text-slate-300">vs last week</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Your brand health is performing excellently across all metrics
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sentiment Score</span>
                    <span className="text-sm font-bold text-green-600">92/100</span>
                  </div>
                  <Progress value={92} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Brand Awareness</span>
                    <span className="text-sm font-bold text-blue-600">85/100</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Customer Satisfaction</span>
                    <span className="text-sm font-bold text-purple-600">89/100</span>
                  </div>
                  <Progress value={89} className="h-2" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Competitive Position</span>
                    <span className="text-sm font-bold text-indigo-600">83/100</span>
                  </div>
                  <Progress value={83} className="h-2" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Real-time Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-800 dark:to-blue-900/20 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Mentions Today</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">247</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-green-600">+12.5%</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-green-50/50 dark:from-slate-800 dark:to-green-900/20 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Positive Sentiment</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">78%</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-green-600">+5.2%</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-red-50/50 dark:from-slate-800 dark:to-red-900/20 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Critical Issues</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">3</p>
                  <div className="flex items-center mt-2">
                    <ArrowDown className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-green-600">-2 resolved</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-white to-purple-50/50 dark:from-slate-800 dark:to-purple-900/20 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Opportunities</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-white">8</p>
                  <div className="flex items-center mt-2">
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-semibold text-green-600">+3 new</span>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                  <Target className="w-8 h-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Integration Status Carousel */}
        <BrandlenzIntegrationStatus />
      </div>
    </div>
  );
};

export default BrandlenzDashboardSimple;
