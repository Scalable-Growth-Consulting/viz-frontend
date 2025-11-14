import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, Info } from 'lucide-react';

interface TreeNode {
  id: string;
  label: string;
  value: number;
  weight?: number;
  color: string;
  description?: string;
  children?: TreeNode[];
}

interface ScoreTreeProps {
  title: string;
  rootScore: number;
  tree: TreeNode[];
  accentColor: string;
}

const TreeNodeComponent: React.FC<{ 
  node: TreeNode; 
  depth: number; 
  isLast: boolean;
  parentExpanded: boolean;
  forceExpand?: boolean | null;
}> = ({ node, depth, isLast, parentExpanded, forceExpand }) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2);
  React.useEffect(() => {
    if (typeof forceExpand === 'boolean') {
      setIsExpanded(forceExpand);
    }
  }, [forceExpand]);
  const [showTooltip, setShowTooltip] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const getScoreColor = (value: number) => {
    if (value >= 80) return 'from-emerald-500 to-green-600';
    if (value >= 60) return 'from-blue-500 to-cyan-600';
    if (value >= 40) return 'from-yellow-500 to-orange-600';
    return 'from-red-500 to-rose-600';
  };

  const getScoreBg = (value: number) => {
    if (value >= 80) return 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800';
    if (value >= 60) return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
    if (value >= 40) return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800';
    return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: parentExpanded ? 1 : 0, x: parentExpanded ? 0 : -20 }}
      transition={{ duration: 0.3, delay: depth * 0.05 }}
      className="relative"
    >
      {/* Connection Line */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-slate-300 via-slate-200 to-transparent dark:from-slate-600 dark:via-slate-700" 
          style={{ left: `${(depth - 1) * 24}px`, height: isLast ? '50%' : '100%' }} 
        />
      )}
      
      {/* Horizontal Connection */}
      {depth > 0 && (
        <div className="absolute top-6 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-600 h-px" 
          style={{ left: `${(depth - 1) * 24}px`, width: '24px' }} 
        />
      )}

      <div className="flex items-start gap-3 mb-3" style={{ marginLeft: `${depth * 24}px` }}>
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-3 h-3 text-slate-600 dark:text-slate-400" />
            </motion.div>
          </motion.button>
        )}

        {/* Node Card */}
        <motion.div
          className={`flex-1 relative overflow-hidden rounded-xl border ${getScoreBg(node.value)} backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300`}
          whileHover={{ scale: 1.02, y: -2 }}
          onHoverStart={() => setShowTooltip(true)}
          onHoverEnd={() => setShowTooltip(false)}
        >
          {/* Shimmer Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
          
          <div className="relative p-3 flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                  {node.label}
                </h4>
                {node.description && (
                  <Info className="w-3 h-3 text-slate-400 flex-shrink-0" />
                )}
              </div>
              
              {/* Weight Indicator (minimal chip) */}
              {typeof node.weight === 'number' && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Weight {Math.round(node.weight * 100)}%
                  </span>
                </div>
              )}
            </div>

            {/* Score Display */}
            <div className="flex-shrink-0">
              <motion.div
                className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${getScoreColor(node.value)} shadow-lg flex items-center justify-center`}
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <span className="text-xl font-black text-white drop-shadow-md">
                  {node.value}
                </span>
              </motion.div>
            </div>
          </div>

          {/* Tooltip */}
          <AnimatePresence>
            {showTooltip && node.description && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 bottom-full mb-2 p-3 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-lg shadow-xl z-10"
              >
                {node.description}
                <div className="absolute top-full left-6 w-2 h-2 bg-slate-900 dark:bg-slate-100 transform rotate-45 -mt-1" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Children */}
      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {node.children!.map((child, index) => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                depth={depth + 1}
                isLast={index === node.children!.length - 1}
                parentExpanded={isExpanded}
                forceExpand={forceExpand}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const ScoreTree: React.FC<ScoreTreeProps> = ({ title, rootScore, tree, accentColor }) => {
  const [expandAll, setExpandAll] = useState<boolean>(false);

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <motion.div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${accentColor} shadow-xl flex items-center justify-center`}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <span className="text-3xl font-black text-white drop-shadow-lg">
              {rootScore}
            </span>
          </motion.div>
          <div>
            <h3 className="text-xl font-black bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
              {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Component breakdown & impact
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setExpandAll(!expandAll)}
          className="px-4 py-2 text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {expandAll ? 'Collapse All' : 'Expand All'}
        </motion.button>
      </div>

      {/* Tree */}
      <div className="space-y-2">
        {tree.map((node, index) => (
          <TreeNodeComponent
            key={node.id}
            node={node}
            depth={0}
            isLast={index === tree.length - 1}
            parentExpanded={true}
            forceExpand={expandAll}
          />
        ))}
      </div>
    </div>
  );
};
