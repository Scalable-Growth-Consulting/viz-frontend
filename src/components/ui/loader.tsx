
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'md', text, className }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn(sizes[size], "text-viz-accent animate-spin")} />
      {text && <p className="mt-4 text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
};

export default Loader;
