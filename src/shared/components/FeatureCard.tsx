import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { COMPONENT_STYLES } from '@/shared/constants/designSystem';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient?: string;
  delay?: number;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  gradient = 'from-blue-500 to-cyan-600',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`${COMPONENT_STYLES.card.elevated} p-6 group cursor-pointer`}
    >
      <div className="space-y-4">
        {/* Icon */}
        <div className={`w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-viz-dark dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-viz-text-secondary leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
