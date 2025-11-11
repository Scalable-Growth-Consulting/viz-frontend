import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  description: string;
  onClick: () => void;
  className?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  description,
  onClick,
  className = '',
}) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full flex items-center gap-4 p-4 text-left rounded-xl transition-all duration-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 group ${className}`}
    >
      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 group-hover:from-blue-100 group-hover:to-indigo-100 dark:group-hover:from-blue-900/30 dark:group-hover:to-indigo-900/30 transition-all duration-200">
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-slate-900 dark:text-white mb-0.5">{label}</div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{description}</div>
      </div>
    </motion.button>
  );
};

export default ActionButton;
