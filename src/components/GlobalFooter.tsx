import React from 'react';
import { Link } from 'react-router-dom';

interface GlobalFooterProps {
  className?: string;
  variant?: 'default' | 'mia' | 'transparent';
}

const GlobalFooter: React.FC<GlobalFooterProps> = ({ 
  className = '', 
  variant = 'default' 
}) => {
  const getFooterStyles = () => {
    switch (variant) {
      case 'mia':
        return 'w-full mt-auto border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur';
      case 'transparent':
        return 'w-full mt-auto border-t border-black/5 dark:border-white/10 bg-transparent';
      default:
        return 'w-full mt-auto border-t border-slate-200/50 dark:border-viz-light/20 bg-white/80 dark:bg-viz-dark/80 backdrop-blur-sm';
    }
  };

  const getLinkStyles = () => {
    switch (variant) {
      case 'mia':
        return 'hover:text-purple-500 transition-colors';
      default:
        return 'hover:text-viz-accent transition-colors';
    }
  };

  return (
    <footer className={`${getFooterStyles()} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm flex items-center justify-center gap-4 sm:gap-6 text-slate-600 dark:text-slate-300">
        <Link 
          to="/mia/privacy" 
          className={`${getLinkStyles()} text-center`}
        >
          Privacy Policy
        </Link>
        <span className="text-slate-400 hidden sm:inline">•</span>
        <Link 
          to="/mia/terms" 
          className={`${getLinkStyles()} text-center`}
        >
          Terms of Service
        </Link>
        <span className="text-slate-400 hidden sm:inline">•</span>
        <Link 
          to="/mia/data-deletion" 
          className={`${getLinkStyles()} text-center`}
        >
          Data Deletion Policy
        </Link>
      </div>
    </footer>
  );
};

export default GlobalFooter;
