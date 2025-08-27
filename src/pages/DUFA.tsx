import React, { useCallback, useRef, useMemo, Suspense, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { useDufaState } from '@/hooks/useDufaState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, ArrowLeft, ArrowRight, Database, Download, FileText, Loader2, Play, RotateCcw, Settings, Target, TrendingUp, Upload, X, Zap, Trash2, Clock, LineChart, BarChart3, Activity, Wand2, CalendarDays, MessageSquare, Share2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler } from 'chart.js';

import { datasetService, DatasetSummary } from '@/services/datasetService';
import DUFASettingsModal from '@/components/dufa/DUFASettingsModal';
import StageTabs from '@/components/dufa/StageTabs';

// Types
interface Dataset {
  id: string;
  name: string;
  size: number;
}

interface ForecastConfig {
  algorithms: string[];
  horizon: number;
  seasonality: 'auto' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  confidence_interval: number;
}

interface ForecastMetrics {
  mae: number;
  mse: number;
  rmse: number;
  mape: number;
}

interface ForecastResult {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  metrics?: ForecastMetrics;
  model?: string;
  forecast_data?: any[];
  insights?: string[];
}

interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: Date;
}

// Lazy-loaded components
const TopNav = React.lazy(() => import('@/components/TopNav'));

interface DUFAProps {
  showTopNav?: boolean;
}

const DUFA: React.FC<DUFAProps> = ({ showTopNav = true }) => {

  // Hooks
  const { toast } = useToast();
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const totalSteps = 7;
  const navigate = useNavigate();
  
  // State management with useDufaState
  const {
    state,
    updateState,
    handleFileUpload,
    toggleSection,
  } = useDufaState();
  
  // Destructure state
  const {
    currentStep = 1,
    completedSteps = [],
    uploadedDataset = null,
    selectedDatasets = [],
    forecastConfig = {
      algorithms: ['prophet'],
      horizon: 7,
      seasonality: 'auto',
      confidence_interval: 0.95
    },
    forecastResults = [],
    chatMessages = [],
    loading = {
      datasets: false,
      forecast: false,
      analysis: false,
      chat: false,
      pdfGeneration: false
    },
    progress = {
      upload: false,
      dataSelection: false,
      forecastConfiguration: false,
      forecastResults: false,
      chatInteraction: false,
      pdfDownload: false,
    },
    settingsOpen = false,
    dufaVisible = true,
    featureFlags = {},
    collapsedSections = {
      datasets: false,
    }
  } = state;

  // Local dataset list state (mocked via datasetService/localStorage)
  const [datasets, setDatasets] = useState<DatasetSummary[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState<boolean>(false);
  const [resultsTab, setResultsTab] = useState<'overview' | 'forecast' | 'components' | 'backtest'>('overview');

  const loadDatasets = useCallback(async () => {
    setDatasetsLoading(true);
    const list = await datasetService.list(user?.id || '');
    setDatasets(list);
    setDatasetsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);
  
  // Handle file upload
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      updateState({ progress: { ...progress, dataSelection: true } });
      // Save a summary entry to datasetService for selection in Step 2
      const name = file.name.replace(/\.[^/.]+$/, '');
      const summary: DatasetSummary = {
        id: `${Date.now()}`,
        name,
        tableName: name.toLowerCase().replace(/\s+/g, '_'),
        rows: 0,
        updatedAt: new Date().toISOString(),
        columns: [],
      };
      datasetService.add(user?.id || '', summary).then(loadDatasets);
    }
  }, [handleFileUpload, updateState, progress, user?.id, loadDatasets]);
  
  // Navigation functions
  const goToNextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const newCompletedSteps = completedSteps.includes(currentStep)
        ? [...completedSteps]
        : [...completedSteps, currentStep];
      
      updateState({
        currentStep: currentStep + 1,
        completedSteps: newCompletedSteps
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, totalSteps, completedSteps, updateState]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      updateState({ currentStep: currentStep - 1 });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, updateState]);

  // Sidebar NavButton
  const NavButton: React.FC<{
    step: number;
    label: string;
    icon: React.ElementType;
    subtitle?: string;
    gradient?: string;
  }> = ({ step, label, icon: Icon, subtitle, gradient = 'bg-gradient-to-r from-blue-600 to-indigo-600' }) => (
    <button
      onClick={() => updateState({ currentStep: step })}
      className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
        currentStep === step
          ? `${gradient} text-white shadow-md border-transparent`
          : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
      }`}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentStep === step ? 'bg-white/20' : 'bg-white/70 dark:bg-viz-dark/70'}`}>
        <Icon className={`w-5 h-5 ${currentStep === step ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{label}</div>
        {currentStep === step && subtitle && (
          <div className="text-sm text-white/85 line-clamp-2">{subtitle}</div>
        )}
      </div>
      {currentStep === step && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
    </button>
  );
  

  // Register chart.js
  ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, Filler);

  const buildForecastChart = useCallback(() => {
    const series = (forecastResults as any[])[0]?.forecast_data || [];
    const labels = series.map((d: any) => d.date);
    const forecast = series.map((d: any) => d.forecast);
    const lower = series.map((d: any) => d.lower_bound);
    const upper = series.map((d: any) => d.upper_bound);
    return {
      data: {
        labels,
        datasets: [
          {
            label: 'Prediction Interval',
            data: upper,
            borderColor: 'rgba(99,102,241,0)',
            backgroundColor: 'rgba(99,102,241,0.12)',
            fill: '+1',
            pointRadius: 0,
          },
          {
            label: 'Lower Bound',
            data: lower,
            borderColor: 'rgba(99,102,241,0)',
            backgroundColor: 'rgba(99,102,241,0.12)',
            fill: false,
            pointRadius: 0,
          },
          {
            label: 'Forecast',
            data: forecast,
            borderColor: '#6366f1',
            backgroundColor: '#6366f1',
            tension: 0.3,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: true } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: { color: 'rgba(0,0,0,0.06)' } },
        },
      },
    } as const;
  }, [forecastResults]);

  // Navigation state checks
  const canGoNext = useMemo((): boolean => {
    switch (currentStep) {
      case 1: return !!uploadedDataset; // Upload complete
      case 2: return selectedDatasets.length > 0; // Dataset selected
      case 3: return forecastConfig.algorithms.length > 0 && forecastConfig.horizon > 0; // Config
      case 4: return forecastResults.length > 0; // Results available
      case 5: return chatMessages.filter(m => m.type === 'user').length > 0; // Chat used
      default: return true;
    }
  }, [currentStep, uploadedDataset, selectedDatasets, forecastConfig, forecastResults, chatMessages]);
  
  const canGoPrevious = currentStep > 1;

  // Forecast function
  const handleRunForecast = useCallback(async () => {
    if (!uploadedDataset) {
      toast({
        title: 'No dataset uploaded',
        description: 'Please upload a dataset first',
        variant: 'destructive',
      });
      return;
    }

    try {
      updateState({ loading: { ...loading, forecast: true } });

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResults = [{
        model: 'prophet',
        metrics: {
          mape: 12.5,
          rmse: 150.2,
          mae: 120.8,
        },
        forecast_data: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() + i * 86400000).toISOString().split('T')[0],
          forecast: 1000 + Math.random() * 500,
          lower_bound: 800 + Math.random() * 200,
          upper_bound: 1200 + Math.random() * 300,
        })),
        insights: {
          trend: 'Strong upward trend detected',
          seasonality: 'Weekly seasonality pattern observed',
          anomalies: 3,
          growth_rate: 0.12,
        },
      }];

      updateState({
        forecastResults: mockResults,
        loading: { ...loading, forecast: false },
        progress: { ...progress, forecastResults: true }
      });

      toast({
        title: 'Forecast completed',
        description: 'Successfully generated forecast results',
      });
    } catch (error) {
      console.error('Forecast error:', error);
      updateState({ loading: { ...loading, forecast: false } });
      
      toast({
        title: 'Forecast failed',
        description: 'An error occurred while generating forecast',
        variant: 'destructive',
      });
    }
  }, [uploadedDataset, loading, progress, toast, updateState]);

  // PDF Export function
  const handleExportPDF = useCallback(async () => {
    if (forecastResults.length === 0) {
      toast({
        title: 'No results to export',
        description: 'Please generate forecast results first',
        variant: 'destructive',
      });
      return;
    }

    try {
      updateState({ loading: { ...loading, pdfGeneration: true } });
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // PDF generation simulation
      const pdfBlob = new Blob(['DUFA Forecast Report'], { type: 'application/pdf' });
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `forecast-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      updateState({
        loading: { ...loading, pdfGeneration: false },
        progress: { ...progress, pdfDownload: true }
      });
      
      toast({
        title: 'PDF Exported',
        description: 'Forecast report downloaded successfully',
      });
    } catch (error) {
      console.error('Export error:', error);
      updateState({ loading: { ...loading, pdfGeneration: false } });
      
      toast({
        title: 'Export Failed',
        description: 'Failed to generate PDF report',
        variant: 'destructive',
      });
    }
  }, [forecastResults, loading, progress, toast, updateState]);

  // Reset function
  const resetSession = useCallback(() => {
    updateState({
      currentStep: 1,
      completedSteps: [],
      uploadedDataset: null,
      selectedDatasets: [],
      forecastConfig: {
        algorithms: ['prophet'],
        horizon: 7,
        seasonality: 'auto',
        confidence_interval: 0.95
      },
      forecastResults: [],
      chatMessages: [],
      loading: {
        datasets: false,
        forecast: false,
        analysis: false,
        chat: false,
        pdfGeneration: false
      },
      progress: {
        upload: false,
        dataSelection: false,
        forecastConfiguration: false,
        forecastResults: false,
        chatInteraction: false,
        pdfDownload: false,
      }
    });
    toast({ description: 'Session has been reset' });
  }, [updateState, toast]);

  // Chat send handler for AI Copilot (mocked)
  const [chatInput, setChatInput] = useState<string>('');
  const handleSendMessage = useCallback(async (text?: string) => {
    const content = (text ?? chatInput).trim();
    if (!content) return;
    const msg = { id: `${Date.now()}`, content, type: 'user' as const, timestamp: new Date() };
    updateState({ chatMessages: [...chatMessages, msg], loading: { ...loading, chat: true } });
    setChatInput('');
    // Simulate assistant
    await new Promise(r => setTimeout(r, 800));
    const assistant = {
      id: `${Date.now()}-a`,
      content: `Here’s an analysis for: "${content}".\n\n• Drivers: promo and price elasticity indicate uplift in next 2 weeks.\n• Risk: stockouts detected in history; consider safety stock.\n• Scenario: +10% promo budget yields ~3.2% lift with 95% PI ±1.1%.`,
      type: 'assistant' as const,
      timestamp: new Date(),
    };
    updateState({ chatMessages: [...chatMessages, msg, assistant], loading: { ...loading, chat: false } });
  }, [chatInput, chatMessages, loading, updateState]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-950" ref={containerRef}>

      <DUFASettingsModal
        open={settingsOpen}
        onClose={() => updateState({ settingsOpen: false })}
        isAdmin={user?.email?.toLowerCase() === 'creatorvision03@gmail.com'}
        initialVisibility={dufaVisible}
        initialFeatureFlags={featureFlags}
        onSave={(vis, flags) => updateState({ 
          dufaVisible: vis, 
          featureFlags: flags 
        })}
      />

      {showTopNav && (
        <Suspense fallback={<div className="h-16 bg-white dark:bg-gray-800" />}>
          <TopNav zone="riz" showData={false} />
        </Suspense>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <div className="relative overflow-hidden rounded-2xl mb-8 border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-gray-900/60 backdrop-blur">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10" />
          <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm bg-blue-600/10 text-blue-700 dark:text-blue-300 border border-blue-600/20">World-class Retail Forecasting</div>
              <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-white/60 dark:bg-gray-800/60 rounded-xl shadow-sm">
                  <LineChart className="w-7 h-7 md:w-9 md:h-9 text-blue-600" />
                </div>
                DUFA — Demand Understanding & Forecasting Agent
              </h1>
              <p className="text-gray-600 dark:text-gray-300">Top 1% forecasting UX. Upload, assess, model, backtest, and deploy forecasts with AI assistance.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={resetSession} variant="outline" className="flex items-center gap-2"><RotateCcw className="w-4 h-4" />Reset</Button>
              <Button variant="outline" onClick={() => updateState({ settingsOpen: true })} className="flex items-center gap-2"><Settings className="w-4 h-4" />Settings</Button>
            </div>
          </div>
        </div>

        {/* Layout: Sidebar + Main */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-4 xl:col-span-3 hidden lg:block">
            <div className="sticky top-20 space-y-3">
              <NavButton step={1} label="Upload Data" icon={Upload} subtitle="CSV/Excel, schema detection, validation" />
              <NavButton step={2} label="Data Library" icon={Database} subtitle="Select datasets, columns, freshness" gradient="bg-gradient-to-r from-sky-600 to-cyan-600" />
              <NavButton step={3} label="Configure Model" icon={Settings} subtitle="Horizon, seasonality, algorithms" gradient="bg-gradient-to-r from-indigo-600 to-violet-600" />
              <NavButton step={4} label="Run Forecast" icon={Play} subtitle="Train, grid search, diagnostics" gradient="bg-gradient-to-r from-emerald-600 to-teal-600" />
              <NavButton step={5} label="Results & QA" icon={TrendingUp} subtitle="MAPE/WMAPE, bias, stability" gradient="bg-gradient-to-r from-purple-600 to-fuchsia-600" />
              <NavButton step={6} label="AI Copilot" icon={MessageSquare} subtitle="Ask questions, root-cause, drivers" gradient="bg-gradient-to-r from-rose-600 to-orange-600" />
              <NavButton step={7} label="Export & Share" icon={FileText} subtitle="PDF, CSV, schedules, webhooks" gradient="bg-gradient-to-r from-slate-600 to-gray-700" />
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8 xl:col-span-9">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Datasets</p>
                      <p className="text-2xl font-bold">{selectedDatasets.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-emerald-600 to-teal-600" />
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Zap className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Algorithms</p>
                      <p className="text-2xl font-bold">{forecastConfig.algorithms.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-purple-600 to-fuchsia-600" />
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Forecast Days</p>
                      <p className="text-2xl font-bold">{forecastConfig.horizon}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Stage Tabs retained for mobile/quick switching */}
            {(() => {
              const maxAllowed = Math.max(currentStep, ...(completedSteps.length ? completedSteps : [1])) + 1;
              const items = [
                { step: 1, label: 'Upload', icon: <Upload className="w-4 h-4" /> },
                { step: 2, label: 'Select Data', icon: <Database className="w-4 h-4" /> },
                { step: 3, label: 'Configure', icon: <Settings className="w-4 h-4" /> },
                { step: 4, label: 'Run', icon: <Play className="w-4 h-4" /> },
                { step: 5, label: 'Results', icon: <TrendingUp className="w-4 h-4" /> },
                { step: 6, label: 'AI Chat', icon: <MessageSquare className="w-4 h-4" /> },
                { step: 7, label: 'Export', icon: <FileText className="w-4 h-4" /> },
              ].map((it) => ({
                ...it,
                disabled: it.step > maxAllowed,
                completed: completedSteps.includes(it.step),
              }));
              return (
                <div className="mb-6 lg:hidden sticky top-16 z-30">
                  <StageTabs
                    items={items}
                    currentStep={currentStep}
                    onSelect={(step) => updateState({ currentStep: step })}
                    className="shadow-sm"
                  />
                </div>
              );
            })()}

            {/* Step Content */}
            <Card className="bg-white dark:bg-gray-800">
              {currentStep === 1 && (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold">Upload Data</h2>
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center cursor-pointer"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Drag & drop your CSV or Excel file, or click to browse
                    </p>
                    <Button>
                      Select File
                      <input 
                        id="file-upload"
                        type="file" 
                        className="hidden" 
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileChange}
                      />
                    </Button>
                    
                    {uploadedDataset && (
                      <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/10 rounded-md border border-green-200 dark:border-green-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-green-600" />
                            <span className="font-medium truncate max-w-xs">{uploadedDataset.name}</span>
                          </div>
                          <span className="text-sm text-green-700 dark:text-green-400">
                            {Math.round(uploadedDataset.size / 1024)} KB
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      onClick={goToNextStep}
                      disabled={!uploadedDataset}
                    >
                      Next: Select Dataset
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Step 2: Select Dataset(s) from library */}
              {currentStep === 2 && (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold">Select Dataset</h2>
                  <p className="text-gray-600 dark:text-gray-300">Choose one or more datasets for processing. You can also delete datasets from your library.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {datasetsLoading && (
                      <div className="col-span-full text-center text-gray-500">Loading datasets...</div>
                    )}
                    {!datasetsLoading && datasets.length === 0 && (
                      <div className="col-span-full text-center text-gray-500">No datasets yet. Upload a file to add one.</div>
                    )}
                    {datasets.map(ds => {
                      const selected = selectedDatasets.some(s => s.id === ds.id);
                      return (
                        <div key={ds.id} className="border rounded-xl p-4 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ds.name}</h3>
                              <div className="text-sm text-gray-500">{ds.tableName}</div>
                            </div>
                            <button
                              className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                              onClick={async () => { await datasetService.remove(user?.id || '', ds.id); await loadDatasets(); updateState({ selectedDatasets: selectedDatasets.filter(s => s.id !== ds.id) }); }}
                              aria-label="Delete dataset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex items-center gap-1"><Database className="w-4 h-4" /> {ds.rows.toLocaleString()} rows</div>
                            <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {new Date(ds.updatedAt).toLocaleDateString()}</div>
                          </div>
                          {ds.columns?.length > 0 && (
                            <div className="mt-3">
                              <div className="text-sm text-gray-500 mb-1">Columns ({ds.columns.length >= 4 ? 4 : ds.columns.length}):</div>
                              <div className="flex flex-wrap gap-2">
                                {ds.columns.slice(0,3).map(col => (
                                  <span key={col} className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300">{col}</span>
                                ))}
                                {ds.columns.length > 3 && (
                                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300">+{ds.columns.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="mt-4 flex items-center justify-between">
                            <label className="inline-flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={(e) => {
                                  const isChecked = e.target.checked;
                                  const next = isChecked
                                    ? [
                                        ...selectedDatasets,
                                        {
                                          id: ds.id,
                                          name: ds.name,
                                          table_name: ds.tableName,
                                          rows: ds.rows,
                                          columns: ds.columns || [],
                                          last_updated: ds.updatedAt,
                                        } as any,
                                      ]
                                    : selectedDatasets.filter(s => s.id !== ds.id);
                                  
                                  updateState({ selectedDatasets: next });
                                }}
                              />
                              Select for processing
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={goToPreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    <Button onClick={goToNextStep} disabled={selectedDatasets.length === 0}>
                      Next: Configure Forecast
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold">Configure Forecast</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">Core Settings</h3>
                      
                      <div>
                        <Label htmlFor="horizon">Forecast Horizon (days)</Label>
                        <Input
                          id="horizon"
                          type="number"
                          min="1"
                          max="365"
                          value={forecastConfig.horizon}
                          onChange={(e) => updateState({
                            forecastConfig: {
                              ...forecastConfig,
                              horizon: Math.min(365, Math.max(1, parseInt(e.target.value) || 7))
                            }
                          })}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="seasonality">Seasonality</Label>
                        <Select
                          value={forecastConfig.seasonality}
                          onValueChange={(value) => updateState({
                            forecastConfig: {
                              ...forecastConfig,
                              seasonality: value as typeof forecastConfig.seasonality
                            }
                          })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select seasonality" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto">Auto-detect</SelectItem>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="yearly">Yearly</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Advanced Settings</h3>
                      
                      <div>
                        <Label>Algorithms</Label>
                        <div className="mt-2 space-y-2">
                          {['prophet', 'arima', 'lstm', 'xgboost'].map((algo) => (
                            <div key={algo} className="flex items-center space-x-2">
                              <Checkbox
                                id={`algo-${algo}`}
                                checked={forecastConfig.algorithms.includes(algo)}
                                onCheckedChange={(checked) => {
                                  const algorithms = checked
                                    ? [...forecastConfig.algorithms, algo]
                                    : forecastConfig.algorithms.filter(a => a !== algo);
                                  
                                  updateState({
                                    forecastConfig: {
                                      ...forecastConfig,
                                      algorithms
                                    }
                                  });
                                }}
                              />
                              <Label htmlFor={`algo-${algo}`} className="capitalize">
                                {algo}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <Label>Confidence Level</Label>
                        <div className="flex items-center space-x-4 mt-2">
                          <Slider
                            value={[forecastConfig.confidence_interval * 100]}
                            onValueChange={([value]) => updateState({
                              forecastConfig: {
                                ...forecastConfig,
                                confidence_interval: (value || 95) / 100
                              }
                            })}
                            min={50}
                            max={99}
                            step={1}
                          />
                          <span className="text-sm font-medium w-12">
                            {Math.round(forecastConfig.confidence_interval * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button variant="outline" onClick={goToPreviousStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                    
                    <Button 
                      onClick={goToNextStep}
                      disabled={forecastConfig.algorithms.length === 0}
                    >
                      Next: Run Forecast
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {currentStep >= 4 && (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold">
                    {currentStep === 4 && 'Run Forecast'}
                    {currentStep === 5 && 'Results & QA'}
                    {currentStep === 6 && 'AI Copilot'}
                    {currentStep === 7 && 'Export Report'}
                  </h2>

                  {currentStep === 4 && (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Configure and run your forecast with the selected settings.</p>
                      <Button className="mt-6" onClick={handleRunForecast} disabled={loading.forecast}>
                        {loading.forecast ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Running Forecast...</>) : (<><Play className="mr-2 h-4 w-4" />Run Forecast</>)}
                      </Button>
                    </div>
                  )}

                  {currentStep === 5 && (
                    <div className="space-y-6">
                      {/* Results tabs */}
                      <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/40 p-1 rounded-lg w-full overflow-x-auto">
                        {[
                          { id: 'overview', label: 'Overview' },
                          { id: 'forecast', label: 'Forecast' },
                          { id: 'components', label: 'Components' },
                          { id: 'backtest', label: 'Backtest' },
                        ].map((t: any) => (
                          <button key={t.id} onClick={() => setResultsTab(t.id)} className={`px-3 py-2 rounded-md text-sm font-medium ${resultsTab === t.id ? 'bg-white dark:bg-gray-800 shadow text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'}`}>
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Overview metrics and QA checks */}
                      {resultsTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-7">
                            <div className="h-[320px]">
                              <Line {...buildForecastChart()} />
                            </div>
                          </div>
                          <div className="lg:col-span-5 space-y-4">
                            <Card className="overflow-hidden">
                              <div className="h-1 bg-gradient-to-r from-indigo-600 to-fuchsia-600" />
                              <CardContent className="p-4 grid grid-cols-2 gap-4">
                                <div>
                                  <div className="text-xs text-slate-500">MAPE</div>
                                  <div className="text-2xl font-semibold">{(forecastResults as any[])[0]?.metrics?.mape ?? 0}%</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">RMSE</div>
                                  <div className="text-2xl font-semibold">{(forecastResults as any[])[0]?.metrics?.rmse ?? 0}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">MAE</div>
                                  <div className="text-2xl font-semibold">{(forecastResults as any[])[0]?.metrics?.mae ?? 0}</div>
                                </div>
                                <div>
                                  <div className="text-xs text-slate-500">Bias</div>
                                  <div className="text-2xl font-semibold">Low</div>
                                </div>
                              </CardContent>
                            </Card>
                            <Card className="overflow-hidden">
                              <div className="h-1 bg-gradient-to-r from-emerald-600 to-teal-600" />
                              <CardContent className="p-4 space-y-2">
                                <div className="text-sm font-medium">QA Checks</div>
                                <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
                                  <li>• Residuals show no strong autocorrelation</li>
                                  <li>• Seasonality stable across folds</li>
                                  <li>• Outliers treated with winsorization</li>
                                  <li>• Coverage near target {Math.round((forecastConfig.confidence_interval || 0.95) * 100)}%</li>
                                </ul>
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      )}

                      {/* Forecast full chart */}
                      {resultsTab === 'forecast' && (
                        <div className="h-[420px]"><Line {...buildForecastChart()} /></div>
                      )}

                      {/* Components placeholders */}
                      {resultsTab === 'components' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Card className="overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />
                            <CardContent className="p-4">
                              <div className="text-sm font-medium mb-2">Trend</div>
                              <div className="h-[260px] flex items-center justify-center text-slate-500">Trend decomposition coming soon</div>
                            </CardContent>
                          </Card>
                          <Card className="overflow-hidden">
                            <div className="h-1 bg-gradient-to-r from-purple-600 to-fuchsia-600" />
                            <CardContent className="p-4">
                              <div className="text-sm font-medium mb-2">Seasonality</div>
                              <div className="h-[260px] flex items-center justify-center text-slate-500">Weekly/monthly patterns</div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Backtest table placeholder */}
                      {resultsTab === 'backtest' && (
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-sm">
                            <thead className="text-left text-slate-500">
                              <tr>
                                <th className="py-2 pr-4">Fold</th>
                                <th className="py-2 pr-4">Train</th>
                                <th className="py-2 pr-4">Test</th>
                                <th className="py-2 pr-4">MAPE</th>
                                <th className="py-2 pr-4">RMSE</th>
                                <th className="py-2 pr-4">Bias</th>
                              </tr>
                            </thead>
                            <tbody>
                              {[1,2,3,4].map(i => (
                                <tr key={i} className="border-t border-slate-200 dark:border-slate-800">
                                  <td className="py-2 pr-4">Fold {i}</td>
                                  <td className="py-2 pr-4">2024-01 to 2024-06</td>
                                  <td className="py-2 pr-4">2024-07</td>
                                  <td className="py-2 pr-4">{(12 + i/2).toFixed(1)}%</td>
                                  <td className="py-2 pr-4">{(150 + i*10).toFixed(0)}</td>
                                  <td className="py-2 pr-4">{i % 2 === 0 ? 'Slight Over' : 'Slight Under'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {currentStep === 6 && (
                    <div className="space-y-6">
                      {/* Preset prompts */}
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Why did error spike last week?',
                          'Impact of promo +10% and price -5%',
                          'Which SKUs drive most volatility?',
                          'What guardrails should I set?'
                        ].map((p) => (
                          <button key={p} onClick={() => handleSendMessage(p)} className="px-3 py-1.5 text-sm rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700">
                            {p}
                          </button>
                        ))}
                      </div>

                      {/* Messages */}
                      <div className="border rounded-xl p-4 bg-white dark:bg-gray-900 border-slate-200 dark:border-slate-800 max-h-[420px] overflow-y-auto space-y-3">
                        {chatMessages.length === 0 && (
                          <div className="text-sm text-slate-500">Ask anything about your forecast, drivers, anomalies, or scenarios.</div>
                        )}
                        {chatMessages.map((m) => (
                          <div key={m.id} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`px-3 py-2 rounded-lg max-w-[80%] text-sm ${m.type === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'}`}>
                              {m.content}
                            </div>
                          </div>
                        ))}
                        {loading.chat && (
                          <div className="text-xs text-slate-400">Assistant is thinking...</div>
                        )}
                      </div>

                      {/* Input */}
                      <div className="flex items-center gap-2">
                        <Input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a question..." />
                        <Button onClick={() => handleSendMessage()} disabled={loading.chat}>Send</Button>
                      </div>
                    </div>
                  )}

                  {currentStep === 7 && (
                    <div className="py-8 text-center">
                      <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Export your forecast report in PDF format.</p>
                      <Button className="mt-6" onClick={handleExportPDF} disabled={loading.pdfGeneration || forecastResults.length === 0}>
                        {loading.pdfGeneration ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generating Report...</>) : (<><Download className="mr-2 h-4 w-4" />Download PDF Report</>)}
                      </Button>
                    </div>
                  )}

                  {/* Footer navigation removed: StageTabs now controls navigation */}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
      {/* Floating navigation removed: Sidebar + StageTabs are primary navigators */}
    </div>
  );
};

export default DUFA;