import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, Info, ArrowUpRight, TrendingUp, LucideIcon } from 'lucide-react';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface MetricDetail {
  id: string;
  name: string;
  description: string;
  score: number;
  trendData: {
    labels: string[];
    values: number[];
  };
  recommendations: Recommendation[];
  icon: LucideIcon;
}

interface DetailViewPanelProps {
  metric: MetricDetail | null;
}

const DetailViewPanel: React.FC<DetailViewPanelProps> = ({ metric }) => {
  if (!metric) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-full flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center mb-4">
          <Info className="w-10 h-10 text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Select a Metric
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          Click on any metric card to see detailed insights, trends, and personalized recommendations.
        </p>
      </motion.div>
    );
  }

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'high':
        return {
          icon: AlertTriangle,
          bg: 'bg-rose-50 dark:bg-rose-900/20',
          border: 'border-rose-200 dark:border-rose-800/50',
          iconBg: 'bg-rose-100 dark:bg-rose-900/30',
          iconColor: 'text-rose-600 dark:text-rose-400',
          badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
        };
      case 'medium':
        return {
          icon: Info,
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          border: 'border-amber-200 dark:border-amber-800/50',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
          badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
        };
      default:
        return {
          icon: CheckCircle,
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          border: 'border-emerald-200 dark:border-emerald-800/50',
          iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
          iconColor: 'text-emerald-600 dark:text-emerald-400',
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-600';
    if (score >= 60) return 'from-blue-500 to-indigo-600';
    if (score >= 40) return 'from-amber-400 to-orange-500';
    return 'from-rose-500 to-pink-600';
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={metric.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 h-full"
      >
        {/* Header Card */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${getScoreGradient(metric.score)}`}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {metric.name}
                </h3>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {metric.description}
              </p>
            </div>
          </div>
          
          {/* Score Display */}
          <div className={`relative overflow-hidden p-6 rounded-xl bg-gradient-to-br ${getScoreGradient(metric.score)}`}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/20 to-transparent" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-white/90 mb-1">Current Score</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">{metric.score}</span>
                  <span className="text-xl text-white/80">/ 100</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                <TrendingUp className="w-4 h-4 text-white" />
                <span className="text-sm font-semibold text-white">Improving</span>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Visualization - Simple bars */}
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            12-Month Trend
          </h4>
          <div className="flex items-end justify-between gap-2 h-32">
            {metric.trendData.values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ height: 0 }}
                animate={{ height: `${value}%` }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className="flex-1 relative group"
              >
                <div 
                  className={`w-full rounded-t-lg ${getScoreColor(value)} opacity-80 group-hover:opacity-100 transition-opacity`}
                  style={{ height: '100%' }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap">
                    {metric.trendData.labels[index]}: {value}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-400">
            <span>{metric.trendData.labels[0]}</span>
            <span>{metric.trendData.labels[metric.trendData.labels.length - 1]}</span>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Recommendations
            </h4>
            <span className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full font-medium">
              {metric.recommendations.length} suggestions
            </span>
          </div>
          <div className="space-y-3">
            {metric.recommendations.map((rec, index) => {
              const config = getPriorityConfig(rec.priority);
              const PriorityIcon = config.icon;
              
              return (
                <motion.div 
                  key={rec.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border ${config.bg} ${config.border}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`mt-0.5 p-2 rounded-lg ${config.iconBg}`}>
                      <PriorityIcon className={`w-4 h-4 ${config.iconColor}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h5 className="font-semibold text-slate-900 dark:text-white">
                          {rec.title}
                        </h5>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                          {rec.priority}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                        {rec.description}
                      </p>
                      {rec.action && (
                        <button 
                          onClick={rec.action.onClick}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                        >
                          {rec.action.label}
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DetailViewPanel;
