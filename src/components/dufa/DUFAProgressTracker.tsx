import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Database, 
  Settings, 
  BarChart3, 
  MessageSquare, 
  FileDown,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export interface ProgressState {
  dataSelection: boolean;
  forecastConfiguration: boolean;
  forecastResults: boolean;
  chatInteraction: boolean;
  pdfDownload: boolean;
}

interface DUFAProgressTrackerProps {
  progress: ProgressState;
  currentStep: number;
  className?: string;
}

const DUFAProgressTracker: React.FC<DUFAProgressTrackerProps> = ({
  progress,
  currentStep,
  className = ''
}) => {
  const steps = [
    {
      id: 1,
      title: 'Data Selection',
      icon: Database,
      description: 'Choose datasets for forecasting',
      completed: progress.dataSelection,
      weight: 20
    },
    {
      id: 2,
      title: 'Forecast Settings',
      icon: Settings,
      description: 'Configure algorithms and parameters',
      completed: progress.forecastConfiguration,
      weight: 10
    },
    {
      id: 3,
      title: 'Forecast Results',
      icon: BarChart3,
      description: 'Generate and analyze forecasts',
      completed: progress.forecastResults,
      weight: 20
    },
    {
      id: 4,
      title: 'Chat Analysis',
      icon: MessageSquare,
      description: 'Interact with AI assistant',
      completed: progress.chatInteraction,
      weight: 25
    },
    {
      id: 5,
      title: 'PDF Download',
      icon: FileDown,
      description: 'Download comprehensive report',
      completed: progress.pdfDownload,
      weight: 25
    }
  ];

  const calculateProgress = () => {
    let totalProgress = 0;
    
    if (progress.dataSelection && progress.forecastConfiguration && progress.forecastResults) {
      totalProgress = 50; // Data selection and forecast model run completion
    }
    
    if (progress.chatInteraction) {
      totalProgress = 75; // At least one question asked in chatbot
    }
    
    if (progress.pdfDownload) {
      totalProgress = 100; // PDF downloaded
    }
    
    return totalProgress;
  };

  const getProgressTooltip = () => {
    const progressValue = calculateProgress();
    
    if (progressValue === 0) {
      return "Start by selecting datasets and configuring your forecast";
    } else if (progressValue === 50) {
      return "Great! Now interact with the AI chatbot to get insights";
    } else if (progressValue === 75) {
      return "Almost done! Download your PDF report to complete the workflow";
    } else if (progressValue === 100) {
      return "Workflow complete! You can start a new analysis or explore more insights";
    }
    
    return "Continue with the next step";
  };

  const getStepStatus = (step: typeof steps[0]) => {
    if (step.completed) {
      return { status: 'completed', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' };
    } else if (step.id === currentStep) {
      return { status: 'current', color: 'text-viz-accent', bgColor: 'bg-viz-accent/10' };
    } else if (step.id < currentStep) {
      return { status: 'available', color: 'text-slate-600 dark:text-viz-text-secondary', bgColor: 'bg-slate-100 dark:bg-viz-medium/50' };
    } else {
      return { status: 'pending', color: 'text-slate-400', bgColor: 'bg-slate-50 dark:bg-viz-medium/30' };
    }
  };

  const progressValue = calculateProgress();

  return (
    <Card className={`bg-white/90 dark:bg-viz-medium/90 backdrop-blur-sm border-0 shadow-lg ${className}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Progress Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-viz-dark dark:text-white">
              Workflow Progress
            </h3>
            <Badge variant="outline" className="text-sm">
              {calculateProgress()}% Complete
            </Badge>
          </div>

          {/* Enhanced Progress Bar with Tooltip */}
          <div className="space-y-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Progress value={calculateProgress()} className="h-3 transition-all duration-300" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-2">
                    <p className="font-medium">{getProgressTooltip()}</p>
                    <div className="text-xs space-y-1">
                      <div>• 0-50%: Complete data selection and forecast model run</div>
                      <div>• 50-75%: Ask at least one question in the AI chatbot</div>
                      <div>• 75-100%: Download your comprehensive PDF report</div>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
              {getProgressTooltip()}
            </p>
          </div>

          {/* Step Indicators */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const status = getStepStatus(step);
              
              return (
                <div key={step.id} className={`p-3 rounded-lg border transition-all duration-200 ${status.bgColor}`}>
                  <div className="flex items-center space-x-2">
                    <div className={`p-1.5 rounded-md ${step.completed ? 'bg-green-500' : status.status === 'current' ? 'bg-viz-accent' : 'bg-slate-300 dark:bg-viz-light'}`}>
                      <Icon className={`w-3 h-3 ${step.completed || status.status === 'current' ? 'text-white' : 'text-slate-600 dark:text-viz-text-secondary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-medium truncate ${status.color}`}>
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-viz-text-secondary truncate">
                        {step.description}
                      </p>
                    </div>
                    {step.completed && (
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                    {status.status === 'current' && (
                      <Clock className="w-4 h-4 text-viz-accent flex-shrink-0 animate-pulse" />
                    )}
                    {status.status === 'pending' && (
                      <Badge variant="outline" className="text-xs">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Completion Celebration */}
          {progressValue === 100 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">
                    Workflow Complete! 🎉
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    You've successfully completed the entire DUFA workflow. Your comprehensive forecast report is ready.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DUFAProgressTracker;
