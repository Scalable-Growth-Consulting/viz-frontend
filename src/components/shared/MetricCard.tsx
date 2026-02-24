import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = 'text-viz-accent',
  trend,
  loading = false,
  className,
  onClick,
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return TrendingUp;
    if (trend === 'down') return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    if (trend === 'down') return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    return 'text-slate-600 bg-slate-50 dark:bg-slate-800';
  };

  const TrendIcon = getTrendIcon();

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-lg hover:scale-[1.02]',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            {loading ? (
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {value}
              </p>
            )}
            {change !== undefined && !loading && (
              <div className="flex items-center gap-2 mt-2">
                <div className={cn('flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold', getTrendColor())}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{Math.abs(change)}%</span>
                </div>
                {changeLabel && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          {Icon && (
            <div className={cn('p-3 rounded-xl bg-slate-100 dark:bg-slate-800', iconColor)}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
      {/* Accent bar at bottom */}
      <div className="h-1 bg-gradient-to-r from-viz-accent to-blue-600" />
    </Card>
  );
};

export default MetricCard;
