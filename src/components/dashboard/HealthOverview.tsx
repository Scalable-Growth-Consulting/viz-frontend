import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, TrendingUp, TrendingDown } from 'lucide-react';

interface HealthOverviewProps {
  score: number;
  trend: 'up' | 'down';
  change: number;
  status: 'good' | 'warning' | 'critical';
}

const HealthOverview: React.FC<HealthOverviewProps> = ({ 
  score, 
  trend, 
  change, 
  status 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good': return 'from-emerald-500 to-teal-600';
      case 'warning': return 'from-amber-400 to-orange-500';
      case 'critical': return 'from-rose-500 to-pink-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'good': return 'Excellent';
      case 'warning': return 'Good';
      case 'critical': return 'Needs Attention';
      default: return 'Average';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative rounded-3xl p-8 md:p-12 text-white overflow-hidden bg-gradient-to-br ${getStatusColor()}`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_var(--tw-gradient-stops))] from-white to-transparent" />
      </div>
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          {/* Left side - Score */}
          <div className="flex-1">
            <span className="text-sm font-medium text-white/80 mb-2 block uppercase tracking-wide">
              Overall Health Score
            </span>
            
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-7xl md:text-8xl font-bold">{score}</span>
              <span className="text-2xl text-white/80">/ 100</span>
            </div>
            
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              {trend === 'up' ? (
                <TrendingUp className="w-5 h-5" />
              ) : (
                <TrendingDown className="w-5 h-5" />
              )}
              <span className="text-sm font-semibold">
                {change}% {trend === 'up' ? 'improvement' : 'decrease'}
              </span>
              <span className="text-sm text-white/80">vs last month</span>
            </div>
          </div>

          {/* Right side - Visual indicator */}
          <div className="flex flex-col items-center md:items-end">
            <div className="relative w-40 h-40 md:w-48 md:h-48">
              <svg 
                className="w-full h-full transform -rotate-90" 
                viewBox="0 0 100 100"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="6"
                />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="white"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - score / 100) }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-medium text-white/90">{getStatusText()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HealthOverview;
