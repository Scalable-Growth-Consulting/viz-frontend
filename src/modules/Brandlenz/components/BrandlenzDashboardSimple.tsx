import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  MessageSquare, 
  Heart, 
  AlertTriangle, 
  Target
} from 'lucide-react';

const BrandlenzDashboardSimple: React.FC = () => {
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
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mentions (24h)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">247</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm ml-1 text-green-600">+12.5%</span>
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
                <p className="text-2xl font-bold text-green-600">78/100</p>
                <div className="flex items-center mt-1">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm ml-1 text-gray-600 dark:text-gray-400">Improving</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Heart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">3</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Require attention</p>
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
                <p className="text-2xl font-bold text-green-600">8</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">New this week</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                <Target className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  T
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">@user123</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Positive</Badge>
                    <span className="text-sm text-gray-500">2h ago</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Great experience with your customer service team! Quick response and helpful.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  G
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">John D.</span>
                    <Badge className="bg-red-100 text-red-800 text-xs">Negative</Badge>
                    <span className="text-sm text-gray-500">4h ago</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Delivery was delayed and no communication about the delay.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  A
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">Sarah M.</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">Positive</Badge>
                    <span className="text-sm text-gray-500">6h ago</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Love the new product features! Exactly what I was looking for.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">X</span>
                  </div>
                  <div>
                    <h4 className="font-medium">X (Twitter)</h4>
                    <p className="text-sm text-gray-500">142 mentions</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">G</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Google Reviews</h4>
                    <p className="text-sm text-gray-500">67 reviews</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">T</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Trustpilot</h4>
                    <p className="text-sm text-gray-500">23 reviews</p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-bold">A</span>
                  </div>
                  <div>
                    <h4 className="font-medium">Amazon</h4>
                    <p className="text-sm text-gray-500">15 reviews</p>
                  </div>
                </div>
                <Badge className="bg-gray-100 text-gray-800">Not Connected</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BrandlenzDashboardSimple;
