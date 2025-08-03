import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/components/ui/use-toast";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
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
import DUFAFloatingNavigation from '@/components/dufa/DUFAFloatingNavigation';

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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const totalSteps = 5;
  
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
    chat: false,
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

  // Navigation functions
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToStep = (step: number) => {
    const stepElement = document.getElementById(`dufa-step-${step}`);
    if (stepElement) {
      stepElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Auto-expand the next section
      const sectionKeys = ['datasets', 'configuration', 'results', 'chat', 'pdf'] as const;
      const nextSectionKey = sectionKeys[nextStep - 1];
      if (nextSectionKey && collapsedSections[nextSectionKey]) {
        setCollapsedSections(prev => ({ ...prev, [nextSectionKey]: false }));
      }
      
      // Auto-scroll to the next step
      setTimeout(() => scrollToStep(nextStep), 100);
      
      toast({
        title: `Step ${nextStep}`,
        description: `Moved to ${['Data Selection', 'Configuration', 'Analysis', 'Chat Interaction', 'PDF Download'][nextStep - 1]}`,
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Auto-expand the previous section
      const sectionKeys = ['datasets', 'configuration', 'results', 'chat', 'pdf'] as const;
      const prevSectionKey = sectionKeys[prevStep - 1];
      if (prevSectionKey && collapsedSections[prevSectionKey]) {
        setCollapsedSections(prev => ({ ...prev, [prevSectionKey]: false }));
      }
      
      // Auto-scroll to the previous step
      setTimeout(() => scrollToStep(prevStep), 100);
      
      toast({
        title: `Step ${prevStep}`,
        description: `Moved to ${['Data Selection', 'Configuration', 'Analysis', 'Chat Interaction', 'PDF Download'][prevStep - 1]}`,
      });
    }
  };

  // Determine navigation availability
  const canGoNext = () => {
    switch (currentStep) {
      case 1: return selectedDatasets.length > 0;
      case 2: return progress.forecastConfiguration;
      case 3: return progress.forecastResults;
      case 4: return progress.chatInteraction;
      case 5: return false; // Last step
      default: return false;
    }
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  // Additional handler functions
  const handleRunForecast = async () => {
    setLoading(prev => ({ ...prev, forecast: true }));
    try {
      // Forecast logic would go here
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setProgress(prev => ({ ...prev, forecastResults: true }));
    } catch (error) {
      console.error('Forecast error:', error);
    } finally {
      setLoading(prev => ({ ...prev, forecast: false }));
    }
  };

  const handleSendMessage = async (message: string) => {
    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const newMessage = { id: Date.now(), content: message, sender: 'user', timestamp: new Date() };
      setChatMessages(prev => [...prev, newMessage]);
      
      // Simulate AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      const aiResponse = { id: Date.now() + 1, content: 'AI response to: ' + message, sender: 'ai', timestamp: new Date() };
      setChatMessages(prev => [...prev, aiResponse]);
      
      setProgress(prev => ({ ...prev, chatInteraction: true }));
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(prev => ({ ...prev, chat: false }));
    }
  };



  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNext: canGoNext() ? goToNextStep : undefined,
    onPrevious: canGoPrevious() ? goToPreviousStep : undefined,
    onEscape: scrollToTop,
  });

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <Header />
      
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-viz-dark dark:text-white flex items-center gap-3">
                <div className="p-2 bg-viz-accent/10 rounded-xl">
                  <TrendingUp className="w-9 h-9 text-viz-accent" />
                </div>
                Demand Understanding & Forecasting Agent
              </h1>
              <p className="text-lg text-slate-600 dark:text-viz-text-secondary">
                Advanced AI-powered demand forecasting and analytics platform for data-driven business insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-viz-dark dark:text-white">{selectedDatasets.length}</div>
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Active Datasets</h3>
              <p className="text-sm text-slate-500 dark:text-viz-text-secondary">Connected data sources</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
          </Card>
          
          <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                  <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-3xl font-bold text-viz-dark dark:text-white">{forecastConfig.algorithms.length}</div>
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">AI Algorithms</h3>
              <p className="text-sm text-slate-500 dark:text-viz-text-secondary">Forecasting models</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-green-600" />
          </Card>
          
          <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                  <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-viz-dark dark:text-white">{forecastConfig.horizon}</div>
              </div>
              <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Forecast Horizon</h3>
              <p className="text-sm text-slate-500 dark:text-viz-text-secondary">Days ahead</p>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-purple-600" />
          </Card>
        </div>
        
        {/* Enhanced Progress Tracker */}
        <div className="mb-8">
          <DUFAProgressTracker 
            progress={progress}
            currentStep={currentStep}
            className=""
          />
        </div>

        {/* Main Dashboard Tabs */}
        <div className="space-y-8">
          <div className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 rounded-2xl p-1 shadow-sm">
            <div className="grid grid-cols-5 bg-slate-50 dark:bg-viz-dark/50 rounded-xl p-1 h-auto">
              <button 
                onClick={() => setCurrentStep(1)}
                className={`flex items-center justify-center gap-2 text-sm font-semibold py-4 px-4 rounded-xl transition-all duration-200 hover:text-viz-accent ${
                  currentStep === 1 
                    ? 'bg-white text-viz-accent shadow-sm dark:bg-viz-medium dark:text-viz-accent' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Data</span>
              </button>
              <button 
                onClick={() => setCurrentStep(2)}
                disabled={!progress.dataSelection}
                className={`flex items-center justify-center gap-2 text-sm font-semibold py-4 px-4 rounded-xl transition-all duration-200 hover:text-viz-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStep === 2 
                    ? 'bg-white text-viz-accent shadow-sm dark:bg-viz-medium dark:text-viz-accent' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Config</span>
              </button>
              <button 
                onClick={() => setCurrentStep(3)}
                disabled={!progress.forecastConfiguration}
                className={`flex items-center justify-center gap-2 text-sm font-semibold py-4 px-4 rounded-xl transition-all duration-200 hover:text-viz-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStep === 3 
                    ? 'bg-white text-viz-accent shadow-sm dark:bg-viz-medium dark:text-viz-accent' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Results</span>
              </button>
              <button 
                onClick={() => setCurrentStep(4)}
                disabled={!progress.forecastResults}
                className={`flex items-center justify-center gap-2 text-sm font-semibold py-4 px-4 rounded-xl transition-all duration-200 hover:text-viz-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStep === 4 
                    ? 'bg-white text-viz-accent shadow-sm dark:bg-viz-medium dark:text-viz-accent' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Chat</span>
              </button>
              <button 
                onClick={() => setCurrentStep(5)}
                disabled={!progress.chatInteraction}
                className={`flex items-center justify-center gap-2 text-sm font-semibold py-4 px-4 rounded-xl transition-all duration-200 hover:text-viz-accent disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStep === 5 
                    ? 'bg-white text-viz-accent shadow-sm dark:bg-viz-medium dark:text-viz-accent' 
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-8 mt-8">
            {currentStep === 1 && (
              <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                        Dataset Selection
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-viz-text-secondary font-normal">
                        Choose your data sources for forecasting analysis
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DUFADatasetSelection
                    selectedDatasets={selectedDatasets}
                    onDatasetsChange={setSelectedDatasets}
                    loading={loading.datasets}
                    onLoadingChange={(isLoading) => setLoading(prev => ({ ...prev, datasets: isLoading }))}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <Settings className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                        Forecast Configuration
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-viz-text-secondary font-normal">
                        Configure algorithms and parameters for forecasting
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DUFAConfiguration
                    config={forecastConfig}
                    onConfigChange={setForecastConfig}
                    selectedDatasets={selectedDatasets}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                        Forecast Analysis
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-viz-text-secondary font-normal">
                        View results and model performance metrics
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DUFAAnalysis
                    results={forecastResults}
                    bestModel={bestModel}
                    loading={loading.forecast}
                    config={forecastConfig}
                    onResultsChange={setForecastResults}
                    onBestModelChange={setBestModel}
                    datasets={selectedDatasets}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 4 && (
              <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                        AI Chat Analysis
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-viz-text-secondary font-normal">
                        Interactive insights and scenario analysis
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DUFAChatbot
                    forecastResults={forecastResults}
                    bestModel={bestModel}
                    datasets={selectedDatasets}
                    config={forecastConfig}
                    onMessagesUpdate={handleChatMessagesUpdate}
                  />
                </CardContent>
              </Card>
            )}

            {currentStep === 5 && (
              <Card className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                      <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-viz-dark dark:text-white">
                        Export & Download
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-viz-text-secondary font-normal">
                        Generate and download comprehensive reports
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DUFAPDFGenerator
                    datasets={selectedDatasets}
                    config={forecastConfig}
                    results={forecastResults}
                    bestModel={bestModel}
                    chatMessages={chatMessages}
                    onDownloadComplete={handlePDFDownloadComplete}
                    isLoading={loading.pdfGeneration}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating Navigation */}
      <DUFAFloatingNavigation
        currentStep={currentStep}
        totalSteps={5}
        completedSteps={completedSteps}
        onPrevious={goToPreviousStep}
        onNext={goToNextStep}
        onScrollToTop={scrollToTop}
        canGoPrevious={canGoPrevious()}
        canGoNext={canGoNext()}
      />
    </div>
  );
};

export default DUFA;
