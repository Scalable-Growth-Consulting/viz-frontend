import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  TrendingUp, 
  Database, 
  Settings, 
  BarChart3, 
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Download,
  Loader2,
  Sparkles,
  Target,
  Zap
} from 'lucide-react';
import DUFADatasetSelection from '@/components/dufa/DUFADatasetSelection';
import DUFAConfiguration from '@/components/dufa/DUFAConfiguration';
import DUFAAnalysis from '@/components/dufa/DUFAAnalysis';
import DUFAChatbot from '@/components/dufa/DUFAChatbot';
import DUFAProgressTracker from '@/components/dufa/DUFAProgressTracker';
import DUFAPDFGenerator from '@/components/dufa/DUFAPDFGenerator';

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

export interface ProgressState {
  dataSelection: boolean;
  forecastConfiguration: boolean;
  forecastResults: boolean;
  chatInteraction: boolean;
  pdfDownload: boolean;
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
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  
  // Loading states
  const [loading, setLoading] = useState({
    datasets: false,
    forecast: false,
    analysis: false,
    pdfGeneration: false
  });
  
  // Progress tracking
  const [progress, setProgress] = useState<ProgressState>({
    dataSelection: false,
    forecastConfiguration: false,
    forecastResults: false,
    chatInteraction: false,
    pdfDownload: false
  });

  const [collapsedSections, setCollapsedSections] = useState({
    datasets: false,
    configuration: true,
    results: true,
    chat: true
  });

  // Handler functions
  const handleSectionToggle = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChatMessagesUpdate = (messages: any[]) => {
    setChatMessages(messages);
  };

  const handlePDFDownloadComplete = () => {
    setProgress(prev => ({ ...prev, pdfDownload: true }));
    toast({
      title: "PDF Downloaded",
      description: "Your DUFA report has been generated and downloaded successfully.",
    });
  };

  // Enhanced progress tracking
  useEffect(() => {
    const newProgress = {
      dataSelection: selectedDatasets.length > 0,
      forecastConfiguration: forecastConfig.algorithms.length > 0 && forecastConfig.horizon > 0,
      forecastResults: forecastResults.length > 0 && bestModel !== null,
      chatInteraction: chatMessages.length > 0,
      pdfDownload: progress.pdfDownload
    };
    
    setProgress(newProgress);
  }, [selectedDatasets, forecastConfig, forecastResults, bestModel, chatMessages, progress.pdfDownload]);

  const handleStepComplete = (stepId: number) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < 5) {
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
      case 4:
        return chatMessages.filter(m => m.type === 'user').length > 0;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/50 dark:from-viz-dark dark:via-slate-900 dark:to-black">
      <Header />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-br from-viz-accent to-blue-600 p-4 rounded-xl shadow-lg">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-viz-accent to-blue-600 bg-clip-text text-transparent">
                  DUFA
                </h1>
                <p className="text-lg text-slate-600 dark:text-viz-text-secondary">
                  Demand Understanding & Forecasting Agent
                </p>
                <p className="text-sm text-slate-500 dark:text-viz-text-secondary flex items-center space-x-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI-powered demand forecasting with advanced analytics</span>
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden lg:flex space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-viz-accent">{selectedDatasets.length}</div>
                <div className="text-xs text-slate-500 dark:text-viz-text-secondary">Datasets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-viz-accent">{forecastConfig.algorithms.length}</div>
                <div className="text-xs text-slate-500 dark:text-viz-text-secondary">Algorithms</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-viz-accent">{forecastConfig.horizon}</div>
                <div className="text-xs text-slate-500 dark:text-viz-text-secondary">Days</div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Tracker */}
          <DUFAProgressTracker 
            progress={progress}
            currentStep={currentStep}
            className="mb-6"
          />

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">Smart Analysis</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Advanced AI models for accurate demand forecasting</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">Real-time Insights</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Interactive dashboards with anomaly detection</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">AI Assistant</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Chat-based insights and scenario analysis</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content - Enhanced Dashboard Layout */}
        <div className="space-y-6">
          {/* Dataset Selection Section */}
          <Collapsible 
            open={!collapsedSections.datasets || currentStep === 1}
            onOpenChange={() => handleSectionToggle('datasets')}
          >
            <Card className="bg-white/90 dark:bg-viz-medium/90 backdrop-blur-sm border-0 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-viz-medium/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        progress.dataSelection 
                          ? 'bg-green-500 text-white' 
                          : currentStep === 1 
                            ? 'bg-viz-accent text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-viz-light text-slate-600 dark:text-viz-text-secondary'
                      }`}>
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                          Step 1: Dataset Selection
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                          Choose datasets from your BigQuery tables
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {progress.dataSelection && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Complete
                        </Badge>
                      )}
                      {collapsedSections.datasets && currentStep !== 1 ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <DUFADatasetSelection
                    selectedDatasets={selectedDatasets}
                    onDatasetsChange={setSelectedDatasets}
                    loading={loading.datasets}
                    onLoadingChange={(isLoading) => setLoading(prev => ({ ...prev, datasets: isLoading }))}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Configuration Section */}
          <Collapsible 
            open={!collapsedSections.configuration || currentStep === 2}
            onOpenChange={() => handleSectionToggle('configuration')}
          >
            <Card className="bg-white/90 dark:bg-viz-medium/90 backdrop-blur-sm border-0 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-viz-medium/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        progress.forecastConfiguration 
                          ? 'bg-green-500 text-white' 
                          : currentStep === 2 
                            ? 'bg-viz-accent text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-viz-light text-slate-600 dark:text-viz-text-secondary'
                      }`}>
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                          Step 2: Forecast Configuration
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                          Configure algorithms and parameters
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {progress.forecastConfiguration && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Complete
                        </Badge>
                      )}
                      {collapsedSections.configuration && currentStep !== 2 ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <DUFAConfiguration
                    config={forecastConfig}
                    onConfigChange={setForecastConfig}
                    selectedDatasets={selectedDatasets}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Analysis Results Section */}
          <Collapsible 
            open={!collapsedSections.results || currentStep === 3}
            onOpenChange={() => handleSectionToggle('results')}
          >
            <Card className="bg-white/90 dark:bg-viz-medium/90 backdrop-blur-sm border-0 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-viz-medium/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        progress.forecastResults 
                          ? 'bg-green-500 text-white' 
                          : currentStep === 3 
                            ? 'bg-viz-accent text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-viz-light text-slate-600 dark:text-viz-text-secondary'
                      }`}>
                        <BarChart3 className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                          Step 3: Forecast Analysis
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                          View results, metrics, and insights
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {progress.forecastResults && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Complete
                        </Badge>
                      )}
                      {collapsedSections.results && currentStep !== 3 ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <DUFAAnalysis
                    results={forecastResults}
                    bestModel={bestModel}
                    loading={loading.analysis}
                    onResultsChange={setForecastResults}
                    onBestModelChange={setBestModel}
                    config={forecastConfig}
                    datasets={selectedDatasets}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* AI Chat Section */}
          <Collapsible 
            open={!collapsedSections.chat || currentStep === 4}
            onOpenChange={() => handleSectionToggle('chat')}
          >
            <Card className="bg-white/90 dark:bg-viz-medium/90 backdrop-blur-sm border-0 shadow-lg">
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-viz-medium/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        progress.chatInteraction 
                          ? 'bg-green-500 text-white' 
                          : currentStep === 4 
                            ? 'bg-viz-accent text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-viz-light text-slate-600 dark:text-viz-text-secondary'
                      }`}>
                        <MessageSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                          Step 4: AI Chat Analysis
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                          Get AI-powered insights and explanations
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {progress.chatInteraction && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Complete
                        </Badge>
                      )}
                      <DUFAPDFGenerator
                        datasets={selectedDatasets}
                        config={forecastConfig}
                        results={forecastResults}
                        bestModel={bestModel}
                        chatMessages={chatMessages}
                        onDownloadComplete={handlePDFDownloadComplete}
                        isLoading={loading.pdfGeneration}
                      />
                      {collapsedSections.chat && currentStep !== 4 ? (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <DUFAChatbot
                    forecastResults={forecastResults}
                    bestModel={bestModel}
                    datasets={selectedDatasets}
                    config={forecastConfig}
                    onMessagesUpdate={handleChatMessagesUpdate}
                  />
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

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
