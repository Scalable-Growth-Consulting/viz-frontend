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
    <Card className={`bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-viz-dark dark:text-white">
            DUFA Workflow Progress
          </h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge 
                  variant={progressValue === 100 ? "default" : "secondary"}
                  className={progressValue === 100 ? "bg-green-600" : ""}
                >
                  {progressValue}% Complete
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{getProgressTooltip()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress 
            value={progressValue} 
            className="h-3"
          />
          <div className="flex justify-between text-xs text-slate-500 dark:text-viz-text-secondary mt-2">
            <span>0%</span>
            <span>50% (Models Complete)</span>
            <span>75% (Chat Complete)</span>
            <span>100% (PDF Downloaded)</span>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const status = getStepStatus(step);
            
            return (
              <TooltipProvider key={step.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`relative p-3 rounded-lg border transition-all duration-200 cursor-pointer ${status.bgColor} ${
                        status.status === 'current' ? 'ring-2 ring-viz-accent shadow-lg' : ''
                      } ${
                        status.status === 'completed' ? 'border-green-200 dark:border-green-800' : 'border-slate-200 dark:border-viz-light'
                      }`}
                    >
                      {/* Step Number/Icon */}
                      <div className="flex items-center justify-center mb-2">
                        {status.status === 'completed' ? (
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                        ) : status.status === 'current' ? (
                          <div className="w-8 h-8 bg-viz-accent rounded-full flex items-center justify-center animate-pulse">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                        ) : (
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                            status.status === 'available' 
                              ? 'border-slate-300 dark:border-viz-light bg-white dark:bg-viz-medium' 
                              : 'border-slate-200 dark:border-viz-light/50 bg-slate-50 dark:bg-viz-medium/30'
                          }`}>
                            <Icon className={`w-4 h-4 ${status.color}`} />
                          </div>
                        )}
                      </div>

                      {/* Step Title */}
                      <h4 className={`text-sm font-medium text-center mb-1 ${
                        status.status === 'completed' ? 'text-green-700 dark:text-green-300' :
                        status.status === 'current' ? 'text-viz-accent' :
                        status.color
                      }`}>
                        {step.title}
                      </h4>

                      {/* Step Status Badge */}
                      <div className="flex justify-center">
                        {status.status === 'completed' && (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs">
                            Done
                          </Badge>
                        )}
                        {status.status === 'current' && (
                          <Badge className="bg-viz-accent text-white text-xs animate-pulse">
                            Active
                          </Badge>
                        )}
                        {status.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            Pending
                          </Badge>
                        )}
                      </div>

                      {/* Connection Line */}
                      {index < steps.length - 1 && (
                        <div className="hidden sm:block absolute top-1/2 -right-6 w-12 h-0.5 bg-slate-200 dark:bg-viz-light transform -translate-y-1/2">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              steps[index + 1].completed || currentStep > step.id 
                                ? 'bg-green-500 w-full' 
                                : currentStep === step.id 
                                  ? 'bg-viz-accent w-1/2' 
                                  : 'w-0'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-medium">{step.title}</p>
                      <p className="text-xs text-slate-400">{step.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Next Steps Hint */}
        {progressValue < 100 && (
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                  Next Steps
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {getProgressTooltip()}
                </p>
              </div>
            </div>
          </div>
        )}

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
      </CardContent>
    </Card>
  );
};

export default DUFAProgressTracker;
