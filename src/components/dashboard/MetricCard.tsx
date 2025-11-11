import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend: 'up' | 'down';
  status: 'good' | 'warning' | 'critical';
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  status,
  icon: Icon,
  onClick,
  className = '',
}) => {
  const getStatusColors = () => {
    switch (status) {
      case 'good':
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
          iconText: 'text-emerald-600 dark:text-emerald-400',
          border: 'border-emerald-100 dark:border-emerald-800/30',
          hover: 'hover:border-emerald-200 dark:hover:border-emerald-700/50',
          trendBg: 'bg-emerald-50 dark:bg-emerald-900/30',
          trendText: 'text-emerald-700 dark:text-emerald-300'
        };
      case 'warning':
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-amber-50 dark:bg-amber-900/20',
          iconText: 'text-amber-600 dark:text-amber-400',
          border: 'border-amber-100 dark:border-amber-800/30',
          hover: 'hover:border-amber-200 dark:hover:border-amber-700/50',
          trendBg: 'bg-amber-50 dark:bg-amber-900/30',
          trendText: 'text-amber-700 dark:text-amber-300'
        };
      case 'critical':
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-rose-50 dark:bg-rose-900/20',
          iconText: 'text-rose-600 dark:text-rose-400',
          border: 'border-rose-100 dark:border-rose-800/30',
          hover: 'hover:border-rose-200 dark:hover:border-rose-700/50',
          trendBg: 'bg-rose-50 dark:bg-rose-900/30',
          trendText: 'text-rose-700 dark:text-rose-300'
        };
      default:
        return {
          bg: 'bg-white dark:bg-slate-800',
          iconBg: 'bg-slate-50 dark:bg-slate-700',
          iconText: 'text-slate-600 dark:text-slate-400',
          border: 'border-slate-200 dark:border-slate-700',
          hover: 'hover:border-slate-300 dark:hover:border-slate-600',
          trendBg: 'bg-slate-50 dark:bg-slate-700',
          trendText: 'text-slate-700 dark:text-slate-300'
        };
    }
  };

  const colors = getStatusColors();

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full p-5 rounded-2xl border-2 transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover} shadow-sm hover:shadow-md ${className}`}
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
          <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {value}
          </div>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colors.trendBg} ${colors.trendText}`}>
            {trend === 'up' ? (
              <ArrowUp className="w-3.5 h-3.5" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5" />
            )}
            {trend === 'up' ? 'Improving' : 'Declining'}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default MetricCard;
