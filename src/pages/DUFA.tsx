import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Database, 
  Settings, 
  BarChart3, 
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  Download,
  Loader2
} from 'lucide-react';
import DUFADatasetSelection from '@/components/dufa/DUFADatasetSelection';
import DUFAConfiguration from '@/components/dufa/DUFAConfiguration';
import DUFAAnalysis from '@/components/dufa/DUFAAnalysis';
import DUFAChatbot from '@/components/dufa/DUFAChatbot';

export interface Dataset {
  id: string;
  name: string;
  table_name: string;
  rows: number;
  columns: string[];
  last_updated: string;
}

export interface ForecastConfig {
  algorithms: string[];
  horizon: number;
  seasonality: 'auto' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  confidence_interval: number;
}

export interface ForecastResult {
  model: string;
  metrics: {
    mape: number;
    rmse: number;
    mae: number;
  };
  forecast_data: Array<{
    date: string;
    actual?: number;
    forecast: number;
    lower_bound: number;
    upper_bound: number;
    anomaly?: boolean;
  }>;
  insights: {
    trend: string;
    seasonality: string;
    anomalies: number;
    growth_rate: number;
  };
}

const DUFA: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Data states
  const [selectedDatasets, setSelectedDatasets] = useState<Dataset[]>([]);
  const [forecastConfig, setForecastConfig] = useState<ForecastConfig>({
    algorithms: ['ARIMA'],
    horizon: 30,
    seasonality: 'auto',
    confidence_interval: 95
  });
  const [forecastResults, setForecastResults] = useState<ForecastResult[]>([]);
  const [bestModel, setBestModel] = useState<ForecastResult | null>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    datasets: false,
    forecast: false,
    analysis: false
  });

  const steps = [
    { id: 1, title: 'Dataset Selection', icon: Database, description: 'Choose datasets for forecasting' },
    { id: 2, title: 'Configuration', icon: Settings, description: 'Configure forecasting parameters' },
    { id: 3, title: 'Analysis', icon: BarChart3, description: 'View forecast results and insights' },
    { id: 4, title: 'AI Insights', icon: MessageSquare, description: 'Get AI-powered explanations' }
  ];

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 4) {
      handleStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 1:
        return selectedDatasets.length > 0;
      case 2:
        return forecastConfig.algorithms.length > 0 && forecastConfig.horizon > 0;
      case 3:
        return forecastResults.length > 0;
      default:
        return true;
    }
  };

  const getStepProgress = () => {
    return (completedSteps.length / 4) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-viz-accent p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-viz-dark dark:text-white">
                DUFA - Demand Understanding & Forecasting Agent
              </h1>
              <p className="text-slate-600 dark:text-viz-text-secondary">
                AI-powered demand forecasting with advanced analytics and insights
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="bg-white/50 dark:bg-viz-medium/50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-viz-dark dark:text-white">
                Progress: Step {currentStep} of 4
              </span>
              <span className="text-sm text-slate-600 dark:text-viz-text-secondary">
                {Math.round(getStepProgress())}% Complete
              </span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
          </div>

          {/* Step Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = completedSteps.includes(step.id);
              
              return (
                <Card 
                  key={step.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'ring-2 ring-viz-accent bg-viz-accent/5' 
                      : isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : 'hover:bg-slate-50 dark:hover:bg-viz-medium/50'
                  }`}
                  onClick={() => {
                    if (isCompleted || step.id <= currentStep) {
                      setCurrentStep(step.id);
                    }
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        isActive 
                          ? 'bg-viz-accent text-white' 
                          : isCompleted 
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-200 dark:bg-viz-light text-slate-600 dark:text-viz-text-secondary'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm text-viz-dark dark:text-white truncate">
                          {step.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-viz-text-secondary truncate">
                          {step.description}
                        </p>
                      </div>
                      {isCompleted && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Panel */}
          <div className="lg:col-span-3">
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm">
              <CardContent className="p-6">
                {currentStep === 1 && (
                  <DUFADatasetSelection
                    selectedDatasets={selectedDatasets}
                    onDatasetsChange={setSelectedDatasets}
                    loading={loading.datasets}
                    onLoadingChange={(isLoading) => setLoading(prev => ({ ...prev, datasets: isLoading }))}
                  />
                )}
                
                {currentStep === 2 && (
                  <DUFAConfiguration
                    config={forecastConfig}
                    onConfigChange={setForecastConfig}
                    selectedDatasets={selectedDatasets}
                  />
                )}
                
                {currentStep === 3 && (
                  <DUFAAnalysis
                    results={forecastResults}
                    bestModel={bestModel}
                    loading={loading.analysis}
                    onResultsChange={setForecastResults}
                    onBestModelChange={setBestModel}
                    config={forecastConfig}
                    datasets={selectedDatasets}
                  />
                )}
                
                {currentStep === 4 && (
                  <DUFAChatbot
                    forecastResults={forecastResults}
                    bestModel={bestModel}
                    datasets={selectedDatasets}
                    config={forecastConfig}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Quick Stats */}
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-viz-text-secondary">Selected Datasets</span>
                  <Badge variant="outline">{selectedDatasets.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-viz-text-secondary">Algorithms</span>
                  <Badge variant="outline">{forecastConfig.algorithms.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-viz-text-secondary">Forecast Horizon</span>
                  <Badge variant="outline">{forecastConfig.horizon} days</Badge>
                </div>
                {bestModel && (
                  <div className="pt-2 border-t border-slate-200 dark:border-viz-light">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600 dark:text-viz-text-secondary">Best Model</span>
                      <Badge className="bg-viz-accent">{bestModel.model}</Badge>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-slate-600 dark:text-viz-text-secondary">MAPE</span>
                      <span className="text-sm font-medium">{bestModel.metrics.mape.toFixed(2)}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex flex-col space-y-2">
                  <Button
                    onClick={handleNextStep}
                    disabled={!canProceedToNextStep() || currentStep === 4}
                    className="w-full"
                  >
                    {currentStep === 4 ? 'Complete' : 'Next Step'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  {currentStep > 1 && (
                    <Button
                      onClick={handlePreviousStep}
                      variant="outline"
                      className="w-full"
                    >
                      Previous Step
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DUFA;
