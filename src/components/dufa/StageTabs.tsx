import React from 'react';
import { cn } from '@/lib/utils';

export type StageItem = {
  step: number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  completed?: boolean;
};

interface StageTabsProps {
  items: StageItem[];
  currentStep: number;
  onSelect: (step: number) => void;
  className?: string;
}

const StageTabs: React.FC<StageTabsProps> = ({ items, currentStep, onSelect, className }) => {
  return (
    <div
      className={cn(
        'w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-800/70 backdrop-blur p-2 min-h-[56px]',
        className,
      )}
      role="tablist"
      aria-label="DUFA stages"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
        {items.map((it) => {
          const isActive = currentStep === it.step;
          const isDisabled = !!it.disabled;
          return (
            <button
              key={it.step}
              role="tab"
              aria-selected={isActive}
              aria-disabled={isDisabled}
              onClick={() => !isDisabled && onSelect(it.step)}
              className={cn(
                'h-11 w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 text-sm transition outline-none',
                isActive
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow ring-1 ring-gray-200 dark:ring-gray-700'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-gray-900/60',
                isDisabled && 'opacity-50 cursor-not-allowed',
                'focus-visible:ring-2 focus-visible:ring-blue-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-800',
              )}
            >
              {it.icon}
              <span className="truncate">{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
;

export default StageTabs;
