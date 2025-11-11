import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import HealthOverview from './HealthOverview';
import MetricCard from './MetricCard';
import DetailViewPanel from './DetailViewPanel';
import QuickActionsPanel from './QuickActionsPanel';
import { 
  Search, 
  Bell, 
  Settings,
  BarChart2,
  Smartphone,
  Link2,
  Users,
  FileText,
  Zap,
  Globe,
  X
} from 'lucide-react';

// Sample data structure
const sampleMetrics = [
  {
    id: 'seo-score',
    title: 'SEO Score',
    value: 78,
    trend: 'up' as const,
    status: 'good' as const,
    icon: BarChart2,
    description: 'Overall search engine optimization performance',
  },
  {
    id: 'mobile-usability',
    title: 'Mobile Friendly',
    value: 92,
    trend: 'up' as const,
    status: 'good' as const,
    icon: Smartphone,
    description: 'Mobile device compatibility and responsiveness',
  },
  {
    id: 'page-speed',
    title: 'Page Speed',
    value: 65,
    trend: 'down' as const,
    status: 'warning' as const,
    icon: Zap,
    description: 'Website loading time and performance metrics',
  },
  {
    id: 'backlinks',
    title: 'Backlinks',
    value: 42,
    trend: 'up' as const,
    status: 'warning' as const,
    icon: Link2,
    description: 'Quality and quantity of inbound links',
  },
  {
    id: 'content-quality',
    title: 'Content Quality',
    value: 88,
    trend: 'up' as const,
    status: 'good' as const,
    icon: FileText,
    description: 'Content relevance, depth, and optimization',
  },
  {
    id: 'social-signals',
    title: 'Social Signals',
    value: 35,
    trend: 'down' as const,
    status: 'critical' as const,
    icon: Users,
    description: 'Social media engagement and sharing metrics',
  },
];

const SimpleDashboard: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter metrics based on search query
  const filteredMetrics = sampleMetrics.filter(metric =>
    metric.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get the selected metric details
  const selectedMetricDetails = selectedMetric
    ? (() => {
        const metric = sampleMetrics.find(m => m.id === selectedMetric)!;
        return {
          id: metric.id,
          name: metric.title,
          description: metric.description,
          score: metric.value,
          icon: metric.icon,
          trendData: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            values: Array.from({ length: 12 }, (_, i) => 
              Math.min(100, Math.max(30, 50 + Math.random() * 40 + i * 2))
            ),
          },
          recommendations: [
          {
            id: 'rec-1',
            title: 'Optimize Images',
            description: 'Compress and properly size images to improve loading times and reduce bandwidth usage.',
            priority: 'high' as const,
            action: {
              label: 'View Image Report',
              onClick: () => console.log('View Images')
            }
          },
          {
            id: 'rec-2',
            title: 'Improve Meta Descriptions',
            description: 'Create compelling meta descriptions with target keywords to improve click-through rates.',
            priority: 'medium' as const,
            action: {
              label: 'Edit Meta Tags',
              onClick: () => console.log('Edit Meta')
            }
          },
          {
            id: 'rec-3',
            title: 'Add Schema Markup',
            description: 'Implement structured data to help search engines understand your content better.',
            priority: 'low' as const,
            action: {
              label: 'Learn More',
              onClick: () => console.log('Learn More')
            }
          }
        ],
      };
    })()
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-white">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                SEO Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Monitor and improve your website's performance
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:w-80">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search metrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" />
                  </button>
                )}
              </div>
              
              {/* Notifications */}
              <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
              </button>
              
              {/* Settings */}
              <button className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-8">
          {/* Health Overview */}
          <HealthOverview 
            score={78} 
            trend="up" 
            change={12} 
            status="good" 
          />

          {/* Three Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left Column - Quick Actions (3 cols) */}
            <div className="lg:col-span-3">
              <QuickActionsPanel 
                onRunAnalysis={() => console.log('Run analysis')}
                onRescan={() => console.log('Rescan')}
                onExport={() => console.log('Export')}
              />
            </div>

            {/* Middle Column - Key Metrics (4 cols) */}
            <div className="lg:col-span-4">
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Key Metrics
                  </h2>
                  <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-medium">
                    {filteredMetrics.length} metrics
                  </span>
                </div>
                
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {filteredMetrics.length > 0 ? (
                      filteredMetrics.map((metric, index) => (
                        <motion.div
                          key={metric.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <MetricCard
                            title={metric.title}
                            value={metric.value}
                            trend={metric.trend}
                            status={metric.status}
                            icon={metric.icon}
                            onClick={() => setSelectedMetric(metric.id)}
                            className={selectedMetric === metric.id ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''}
                          />
                        </motion.div>
                      ))
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-12 text-center"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400">
                          No metrics found matching "<strong>{searchQuery}</strong>"
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed View (5 cols) */}
            <div className="lg:col-span-5">
              <DetailViewPanel metric={selectedMetricDetails} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleDashboard;
