import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Search, Brain, MessageCircle, Loader2 } from 'lucide-react';

export interface LogEntry {
  id: string;
  type: 'search' | 'generate' | 'post' | 'error';
  message: string;
  timestamp: Date;
}

interface StatusLogProps {
  logs: LogEntry[];
  isRunning?: boolean;
}

const StatusLog: React.FC<StatusLogProps> = ({ logs, isRunning = false }) => {
  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'search':
        return <Search className="w-4 h-4 text-blue-500" />;
      case 'generate':
        return <Brain className="w-4 h-4 text-purple-500" />;
      case 'post':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <MessageCircle className="w-4 h-4 text-red-500" />;
      default:
        return <MessageCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'search':
        return 'border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800';
      case 'generate':
        return 'border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800';
      case 'post':
        return 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800';
      default:
        return 'border-slate-200 bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border border-slate-200/50 dark:border-viz-light/20 rounded-lg p-4 max-h-96 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-viz-dark dark:text-white">Agent Activity</h3>
        {isRunning && (
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-viz-text-secondary">
            <Loader2 className="w-4 h-4 animate-spin" />
            Running...
          </div>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`p-3 rounded-lg border ${getLogColor(log.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getLogIcon(log.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {log.message}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {log.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {logs.length === 0 && !isRunning && (
          <div className="text-center py-8 text-slate-500 dark:text-viz-text-secondary">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No activity yet</p>
            <p className="text-sm">Start the agent to see live updates</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusLog;
