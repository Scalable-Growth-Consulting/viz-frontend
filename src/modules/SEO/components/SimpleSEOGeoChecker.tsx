import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeSEOGeo } from '../services/seoAnalyzer';
import { useAWSLambdaAnalysis } from '../hooks/useAWSLambdaAnalysis';
import type { AnalysisInput, AnalysisResult } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  Globe,
  Target,
  Brain,
  Eye,
  Star,
  BarChart2,
  FileText,
  Image as ImageIcon,
  Link2,
  Smartphone,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
  Download,
  RefreshCw,
  X,
  Search
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Health Overview Component
const HealthOverview: React.FC<{
  score: number;
  seoScore: number;
  geoScore: number;
  status: 'good' | 'warning' | 'critical';
}> = ({ score, seoScore, geoScore, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'from-emerald-500 to-teal-600';
      case 'warning': return 'from-amber-400 to-orange-500';
      case 'critical': return 'from-rose-500 to-pink-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };


  const getStatusText = () => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Needs Work';
    return 'Critical';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-3xl p-8 md:p-12 text-white overflow-hidden bg-gradient-to-br ${getStatusColor()}`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-white to-transparent" />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left - Overall Score */}
          <div className="flex-1">
            <span className="text-sm font-medium text-white/80 mb-2 block uppercase tracking-wide">
              Overall Health Score
            </span>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-7xl md:text-8xl font-bold">{score}</span>
              <span className="text-2xl text-white/80">/ 100</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <span className="text-sm font-semibold">{getStatusText()}</span>
            </div>
          </div>

          {/* Right - SEO & GEO Breakdown */}
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-sm font-medium text-white/80 mb-2">SEO</div>
              <div className="text-4xl font-bold">{seoScore}</div>
            </div>
            <div className="w-px bg-white/20" />
            <div className="text-center">
              <div className="text-sm font-medium text-white/80 mb-2">GEO</div>
              <div className="text-4xl font-bold">{geoScore}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Metric Card Component
const MetricCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  status: 'good' | 'warning' | 'critical';
  onClick: () => void;
  selected?: boolean;
}> = ({ title, value, icon: Icon, status, onClick, selected }) => {
  const getStatusColors = () => {
    switch (status) {
      case 'good':
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
          iconText: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-100 dark:border-emerald-800/30',
        };
      case 'warning':
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-amber-50 dark:bg-amber-900/20',
          iconText: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-100 dark:border-amber-800/30',
        };
      case 'critical':
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-rose-50 dark:bg-rose-900/20',
          iconText: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-100 dark:border-rose-800/30',
        };
    }
  };

  const colors = getStatusColors();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 ${colors.bg} ${colors.border} shadow-sm hover:shadow-md ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 text-left">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${colors.iconBg}`}>
              <Icon className={`w-5 h-5 ${colors.iconText}`} />
            </div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              {title}
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

// Quick Actions Panel
const QuickActionsPanel: React.FC<{
  onAnalyze: () => void;
  onExport: () => void;
  onReset: () => void;
  analyzing: boolean;
}> = ({ onAnalyze, onExport, onReset, analyzing }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Quick Actions
      </h3>

      <motion.button
        onClick={onAnalyze}
        disabled={analyzing}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-4 p-4 text-left rounded-xl transition-all duration-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
          {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900 dark:text-white mb-0.5">
            {analyzing ? 'Analyzing...' : 'Run Analysis'}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Start SEO & GEO audit
          </div>
        </div>
      </motion.button>

      <motion.button
        onClick={onExport}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-4 p-4 text-left rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Download className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Export Report</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Download as PDF</div>
        </div>
      </motion.button>

      <motion.button
        onClick={onReset}
        whileHover={{ x: 4 }}
        whileTap={{ scale: 0.98 }}
        className="w-full flex items-center gap-4 p-4 text-left rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <RefreshCw className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-900 dark:text-white mb-0.5">Reset</div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Clear all data</div>
        </div>
      </motion.button>
    </div>
  );
};

// Main Component
const SimpleSEOGeoChecker: React.FC = () => {
  const [input, setInput] = useState<AnalysisInput>({ url: '', rawHtml: '', competitors: [] });
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const { toast } = useToast();

  const {
    analyzing: awsAnalyzing,
    progress: awsProgress,
    error: awsError,
    currentJob,
    startAnalysis: startAWSAnalysis,
    cancelAnalysis: cancelAWSAnalysis,
    result: awsResult,
  } = useAWSLambdaAnalysis();

  const useCloudAnalysis = true;

  const handleAnalyze = async () => {
    if (!input.url && !input.rawHtml) {
      toast({
        title: 'Input Required',
        description: 'Please provide a URL or HTML content',
        variant: 'destructive',
      });
      return;
    }

    if (useCloudAnalysis) {
      await startAWSAnalysis(input, () => {});
    } else {
      setLoading(true);
      try {
        const res = await analyzeSEOGeo(input);
        setResult(res);
        toast({
          title: 'Analysis Complete',
          description: 'Your SEO & GEO report is ready',
        });
      } catch (error) {
        toast({
          title: 'Analysis Failed',
          description: 'Please try again',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleExport = () => {
    toast({
      title: 'Exporting Report',
      description: 'Your PDF will download shortly',
    });
  };

  const handleReset = () => {
    setInput({ url: '', rawHtml: '', competitors: [] });
    setResult(null);
    setSelectedMetric(null);
  };

  const analyzing = useCloudAnalysis ? awsAnalyzing : loading;
  const progress = useCloudAnalysis ? awsProgress : 0;

  // Calculate metrics
  const metrics = result
    ? [
        {
          id: 'seo',
          title: 'SEO Score',
          value: Math.round((result.seoScoreOutOf10 || 0) * 10),
          icon: BarChart2,
          status: (result.seoScoreOutOf10 || 0) * 10 >= 70 ? 'good' : (result.seoScoreOutOf10 || 0) * 10 >= 50 ? 'warning' : 'critical',
        },
        {
          id: 'geo',
          title: 'GEO Score',
          value: result.geoScoreOutOf100 || 0,
          icon: Brain,
          status: (result.geoScoreOutOf100 || 0) >= 70 ? 'good' : (result.geoScoreOutOf100 || 0) >= 50 ? 'warning' : 'critical',
        },
        {
          id: 'mobile',
          title: 'Mobile Friendly',
          value: result.onPage.pageSpeed?.performance || 'N/A',
          icon: Smartphone,
          status: 'good',
        },
        {
          id: 'content',
          title: 'Content Quality',
          value: result.onPage.wordCount,
          icon: FileText,
          status: result.onPage.wordCount >= 1000 ? 'good' : result.onPage.wordCount >= 500 ? 'warning' : 'critical',
        },
        {
          id: 'images',
          title: 'Images',
          value: result.onPage.imageCount,
          icon: ImageIcon,
          status: result.onPage.imageCount > 0 ? 'good' : 'warning',
        },
        {
          id: 'links',
          title: 'Internal Links',
          value: result.onPage.internalLinks || 0,
          icon: Link2,
          status: (result.onPage.internalLinks || 0) >= 10 ? 'good' : 'warning',
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-1">
                SEO & GEO Dashboard
              </h1>
              <p className="text-slate-500 dark:text-slate-400">
                Analyze and optimize your website's performance
              </p>
            </div>
          </div>
        </header>

        {/* Input Section */}
        {!result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
              <CardContent className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Website URL
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={input.url}
                    onChange={(e) => setInput({ ...input, url: e.target.value })}
                    className="text-lg"
                  />
                </div>

                <div className="text-center text-sm text-slate-500 dark:text-slate-400">or</div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    HTML Content
                  </label>
                  <Textarea
                    placeholder="Paste your HTML here..."
                    value={input.rawHtml}
                    onChange={(e) => setInput({ ...input, rawHtml: e.target.value })}
                    rows={6}
                  />
                </div>

                {analyzing && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {currentJob?.status === 'processing' ? 'Analyzing...' : 'Preparing...'}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {awsError && (
                  <Alert className="bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-500" />
                    <AlertDescription className="text-rose-700 dark:text-rose-300">
                      {awsError}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || (!input.url && !input.rawHtml)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-6 text-lg font-semibold"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Start Analysis
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-8">
            {/* Health Overview */}
            <HealthOverview
              score={result.overallScore}
              seoScore={Math.round((result.seoScoreOutOf10 || 0) * 10)}
              geoScore={result.geoScoreOutOf100 || 0}
              status={
                result.overallScore >= 70 ? 'good' : result.overallScore >= 50 ? 'warning' : 'critical'
              }
            />

            {/* Three Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              {/* Left - Quick Actions */}
              <div className="lg:col-span-3">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
                  <QuickActionsPanel
                    onAnalyze={handleAnalyze}
                    onExport={handleExport}
                    onReset={handleReset}
                    analyzing={analyzing}
                  />
                </Card>
              </div>

              {/* Middle - Metrics */}
              <div className="lg:col-span-4">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Key Metrics</h2>
                    <span className="text-sm px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full font-medium">
                      {metrics.length} metrics
                    </span>
                  </div>

                  <div className="space-y-3">
                    {metrics.map((metric, index) => (
                      <motion.div
                        key={metric.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <MetricCard
                          title={metric.title}
                          value={metric.value}
                          icon={metric.icon}
                          status={metric.status as any}
                          onClick={() => setSelectedMetric(metric.id)}
                          selected={selectedMetric === metric.id}
                        />
                      </motion.div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right - Details */}
              <div className="lg:col-span-5">
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 p-6">
                  {!selectedMetric ? (
                    <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                      <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-4">
                        <Info className="w-10 h-10 text-slate-300 dark:text-slate-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                        Select a Metric
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
                        Click on any metric card to see detailed insights and recommendations.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                          {metrics.find((m) => m.id === selectedMetric)?.title}
                        </h3>
                        <p className="text-slate-500 dark:text-slate-400">
                          Detailed analysis and recommendations
                        </p>
                      </div>

                      {/* Add detailed content based on selected metric */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Recommendations
                        </h4>
                        <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Optimize your content for better performance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Improve meta descriptions and titles</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Add more internal links</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleSEOGeoChecker;
