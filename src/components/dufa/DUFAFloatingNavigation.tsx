import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Keyboard,
  CheckCircle,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DUFAFloatingNavigationProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  onPrevious: () => void;
  onNext: () => void;
  onScrollToTop: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  className?: string;
}

const DUFAFloatingNavigation: React.FC<DUFAFloatingNavigationProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  onPrevious,
  onNext,
  onScrollToTop,
  canGoPrevious,
  canGoNext,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Show/hide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsVisible(scrollTop > 200);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show keyboard hint on first load
  useEffect(() => {
    const hasSeenHint = localStorage.getItem('dufa-keyboard-hint-seen');
    if (!hasSeenHint) {
      setShowKeyboardHint(true);
      setTimeout(() => {
        setShowKeyboardHint(false);
        localStorage.setItem('dufa-keyboard-hint-seen', 'true');
      }, 5000);
    }
  }, []);

  const stepNames = [
    'Data Selection',
    'Configuration',
    'Analysis',
    'Chat Interaction',
    'PDF Download'
  ];

  if (!isVisible && !collapsed) return null;

  // Minimal floating toggle button
  if (collapsed && !hovered) {
    return (
      <div
        className="fixed bottom-6 right-6 z-50"
        onMouseEnter={() => setHovered(true)}
      >
        <Button
          variant="default"
          size="icon"
          className="rounded-full shadow-xl bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:bg-viz-accent hover:text-white transition-all duration-300"
          onClick={() => setCollapsed(false)}
          aria-label="Expand navigation"
        >
          <span className="sr-only">Expand Navigation</span>
          <ChevronRight className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 space-y-3 transition-all duration-300",
        collapsed ? "opacity-100" : "",
        className
      )}
      onMouseLeave={() => setHovered(false)}
      onMouseEnter={() => setHovered(true)}
    >
      {/* Collapse Toggle Button */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-gray-500 hover:text-viz-accent"
          onClick={() => setCollapsed(true)}
          aria-label="Collapse navigation"
        >
          <span className="sr-only">Collapse Navigation</span>
          <ChevronRight className="w-5 h-5 rotate-180" />
        </Button>
      </div>
      {/* Keyboard Shortcut Hint */}
      {showKeyboardHint && (
        <Card className="p-3 bg-viz-accent text-white shadow-lg animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 text-sm">
            <Keyboard className="w-4 h-4" />
            <span>Use ← → arrow keys to navigate</span>
          </div>
        </Card>
      )}

      {/* Progress Indicator */}
      <Card className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border-0">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Step {currentStep} of {totalSteps}
          </span>
          <Badge variant="outline" className="text-xs">
            {stepNames[currentStep - 1]}
          </Badge>
        </div>
        
        {/* Mini Progress Bar */}
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: totalSteps }, (_, i) => {
            const stepNumber = i + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            
            return (
              <div
                key={stepNumber}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  isCompleted
                    ? "bg-green-500"
                    : isCurrent
                    ? "bg-viz-accent animate-pulse"
                    : "bg-gray-300 dark:bg-gray-600"
                )}
              />
            );
          })}
        </div>
      </Card>

      {/* Simplified Navigation Controls */}
      <div className="p-4 rounded-xl bg-white dark:bg-gray-900 shadow-xl flex items-center gap-4 border border-gray-200 dark:border-gray-700">
        <Button
          variant="default"
          size="lg"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={cn(
            "flex items-center gap-2 px-6 py-2 font-semibold text-base rounded-lg",
            canGoPrevious ? "bg-gray-100 dark:bg-gray-800 hover:bg-viz-accent hover:text-white" : "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </Button>
        <Button
          variant="default"
          size="lg"
          onClick={onNext}
          disabled={!canGoNext}
          className={cn(
            "flex items-center gap-2 px-6 py-2 font-semibold text-base rounded-lg",
            canGoNext ? "bg-viz-accent text-white hover:bg-viz-accent-dark" : "opacity-50 cursor-not-allowed"
          )}
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Step Completion Status */}
      <Card className="p-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm shadow-lg border-0">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Progress Overview
          </div>
          <div className="space-y-1">
            {stepNames.map((name, index) => {
              const stepNumber = index + 1;
              const isCompleted = completedSteps.includes(stepNumber);
              const isCurrent = stepNumber === currentStep;
              
              return (
                <div
                  key={stepNumber}
                  className={cn(
                    "flex items-center gap-2 text-xs transition-all duration-200",
                    isCurrent && "font-medium text-viz-accent"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : (
                    <Circle className={cn(
                      "w-3 h-3",
                      isCurrent ? "text-viz-accent" : "text-gray-400"
                    )} />
                  )}
                  <span className={cn(
                    "truncate",
                    isCompleted && "text-green-600 dark:text-green-400",
                    isCurrent && "text-viz-accent"
                  )}>
                    {name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DUFAFloatingNavigation;
