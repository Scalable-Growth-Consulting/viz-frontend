import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  RefreshCw, 
  Download, 
  MessageSquareText,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Video,
  Code
} from 'lucide-react';
import ActionButton from './ActionButton';

interface QuickActionsPanelProps {
  onRunAnalysis?: () => void;
  onRescan?: () => void;
  onExport?: () => void;
}

const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  onRunAnalysis,
  onRescan,
  onExport
}) => {
  const quickActions = [
    {
      id: 'run-analysis',
      icon: Zap,
      label: 'Run New Analysis',
      description: 'Start a full SEO audit',
      onClick: onRunAnalysis || (() => console.log('Run analysis')),
    },
    {
      id: 'rescan',
      icon: RefreshCw,
      label: 'Refresh Data',
      description: 'Update current metrics',
      onClick: onRescan || (() => console.log('Rescan')),
    },
    {
      id: 'export',
      icon: Download,
      label: 'Export Report',
      description: 'Download as PDF',
      onClick: onExport || (() => console.log('Export')),
    },
  ];

  const quickLinks = [
    { label: 'Documentation', href: '#', icon: BookOpen },
    { label: 'Help Center', href: '#', icon: HelpCircle },
    { label: 'Video Tutorials', href: '#', icon: Video },
    { label: 'API Reference', href: '#', icon: Code },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ActionButton
                icon={action.icon}
                label={action.label}
                description={action.description}
                onClick={action.onClick}
              />
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* AI Assistant */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative overflow-hidden p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white/10 to-transparent" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <MessageSquareText className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-semibold text-white">AI Assistant</h4>
          </div>
          <p className="text-sm text-blue-50 mb-4">
            Get personalized recommendations and insights powered by AI.
          </p>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-blue-50 rounded-xl text-blue-600 font-semibold transition-all duration-200 shadow-sm">
            <MessageSquareText className="w-4 h-4" />
            Start Chat
          </button>
        </div>
      </motion.div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
          Resources
        </h4>
        <div className="space-y-1">
          {quickLinks.map((link, index) => (
            <motion.a
              key={link.label}
              href={link.href}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ x: 4 }}
              className="flex items-center justify-between p-3 -mx-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <link.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                  {link.label}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </motion.a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsPanel;
