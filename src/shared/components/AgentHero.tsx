import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { DESIGN_TOKENS } from '@/shared/constants/designSystem';

interface AgentHeroProps {
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  tags?: string[];
  actions?: React.ReactNode;
}

export const AgentHero: React.FC<AgentHeroProps> = ({
  title,
  subtitle,
  description,
  icon: Icon,
  gradient,
  tags = [],
  actions,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      {/* Background Gradient Orb */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-40 -right-40 w-96 h-96 ${gradient} opacity-20 blur-3xl rounded-full`} />
        <div className={`absolute -bottom-40 -left-40 w-96 h-96 ${gradient} opacity-10 blur-3xl rounded-full`} />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            <div className={`p-4 ${gradient} rounded-3xl shadow-2xl ${DESIGN_TOKENS.shadows.glow}`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
          </motion.div>

          {/* Tags */}
          {tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-2"
            >
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-full border border-slate-200/50 dark:border-viz-light/20"
                >
                  {tag}
                </span>
              ))}
            </motion.div>
          )}

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h1 className={`${DESIGN_TOKENS.typography.hero} text-viz-dark dark:text-white`}>
              {title}
            </h1>
            <p className={`${DESIGN_TOKENS.typography.bodyLarge} text-slate-600 dark:text-viz-text-secondary font-medium`}>
              {subtitle}
            </p>
          </motion.div>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`${DESIGN_TOKENS.typography.body} text-slate-600 dark:text-viz-text-secondary max-w-2xl mx-auto`}
          >
            {description}
          </motion.p>

          {/* Actions */}
          {actions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4 pt-4"
            >
              {actions}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
