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
import { AlertCircle, ArrowLeft, ArrowRight, Database, Download, FileText, Loader2, Play, RotateCcw, Settings, Target, TrendingUp, Upload, X, Zap, Trash2, Clock } from 'lucide-react';
import { datasetService, DatasetSummary } from '@/services/datasetService';
import DUFASettingsModal from '@/components/dufa/DUFASettingsModal';
import StageTabs from '@/components/dufa/StageTabs';
import * as XLSX from "xlsx";
import { sanitizeEmail, sanitizeName } from "@/utils/sanitize";
import { presignForUpload, putToPresignedUrl, triggerAthenaSync } from "@/services/dufa";
import { supabase } from "@/supabase";



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

  const loadDatasets = useCallback(async () => {
    setDatasetsLoading(true);
    const list = await datasetService.list(user?.id || '');
    setDatasets(list);
    setDatasetsLoading(false);
  }, [user?.id]);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);
  
  /* Handle file upload
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
  */
 
const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!user?.email) {
    toast({ title: "Not logged in", description: "Please sign in to upload", variant: "destructive" });
    return;
  }

  // UI state sync
  handleFileUpload(file);
  updateState({ progress: { ...progress, dataSelection: true } });

  // owner + dataset
  const owner = `dufa_${sanitizeEmail(user.email)}`;
  const defaultName = file.name.replace(/\.[^/.]+$/, "");
  const datasetSan = sanitizeName(defaultName);

  try {
    // 1) presign for the raw file
    const presign = await presignForUpload(file, user.email, datasetSan);

    // 2) upload raw file to S3
    await putToPresignedUrl(presign.uploadUrl, file);

    // 3) XLSX → each sheet as CSV
    if (/\.(xlsx|xlsm|xls)$/i.test(file.name)) {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf);

      for (const sheetName of wb.SheetNames) {
        const csv = XLSX.utils.sheet_to_csv(wb.Sheets[sheetName]);
        const blob = new Blob([csv], { type: "text/csv" });
        const sheetNameSan = sanitizeName(sheetName);

        // presign for this sheet csv
        const { data, error } = await supabase.functions.invoke<{ uploadUrl: string; key: string }>(
          "dufa-presign",
          {
            body: {
              filename: `${datasetSan}__${sheetNameSan}.csv`,
              ext: "csv",
              owner,
              dataset: datasetSan,
              kind: "sheet",
            },
          }
        );
        if (error || !data?.uploadUrl) throw new Error(error?.message || "Sheet presign failed");
        await putToPresignedUrl(data.uploadUrl, blob);
      }
    }

    // 4) dataset list me dikhane ke liye local entry
    const summary: DatasetSummary = {
      id: `${Date.now()}`,
      name: defaultName,
      tableName: datasetSan,
      rows: 0,
      updatedAt: new Date().toISOString(),
      columns: [],
    };
    await datasetService.add(user.id || "", summary);
    await loadDatasets();

    // 5) (optional) athena/glue sync
    triggerAthenaSync(owner, datasetSan, `${owner}/${datasetSan}/`).catch(() => {});

    toast({ title: "Upload complete", description: `Uploaded to s3 under ${owner}/${datasetSan}/` });
  } catch (err: any) {
    console.error("Upload error", err);
    toast({
      title: "Upload failed",
      description: err?.message || "Temporary issue. Please try again.",
      variant: "destructive",
    });
  }
}, [user?.email, user?.id, handleFileUpload, updateState, progress, loadDatasets, toast]);



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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900" ref={containerRef}>
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
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <TrendingUp className="w-7 h-7 md:w-9 md:h-9 text-blue-600 dark:text-blue-400" />
                </div>
                Demand Understanding & Forecasting Agent
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered demand forecasting and analytics platform
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={resetSession}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </Button>
              <Button 
                variant="outline"
                onClick={() => updateState({ settingsOpen: true })}
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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
          
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
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

        {/* Stage Tabs */}
        {(() => {
          const maxAllowed = Math.max(currentStep, ...(completedSteps.length ? completedSteps : [1])) + 1;
          const items = [
            { step: 1, label: 'Upload', icon: <Upload className="w-4 h-4" /> },
            { step: 2, label: 'Select Data', icon: <Database className="w-4 h-4" /> },
            { step: 3, label: 'Configure', icon: <Settings className="w-4 h-4" /> },
            { step: 4, label: 'Run', icon: <Play className="w-4 h-4" /> },
            { step: 5, label: 'Results', icon: <TrendingUp className="w-4 h-4" /> },
            { step: 6, label: 'AI Chat', icon: <Target className="w-4 h-4" /> },
            { step: 7, label: 'Export', icon: <FileText className="w-4 h-4" /> },
          ].map((it) => ({
            ...it,
            disabled: it.step > maxAllowed,
            completed: completedSteps.includes(it.step),
          }));
          return (
            <div className="mb-6 sticky top-16 z-30">
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
                {currentStep === 5 && 'Analyze Results'}
                {currentStep === 6 && 'Chat with Insights'}
                {currentStep === 7 && 'Export Report'}
              </h2>
              
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                  {currentStep === 4 && 'Configure and run your forecast with the selected settings.'}
                  {currentStep === 5 && 'View and analyze the forecast results and metrics.'}
                  {currentStep === 6 && 'Get insights and ask questions about your forecast.'}
                  {currentStep === 7 && 'Export your forecast report in PDF format.'}
                </p>
                
                {currentStep === 4 && (
                  <Button 
                    className="mt-6"
                    onClick={handleRunForecast}
                    disabled={loading.forecast}
                  >
                    {loading.forecast ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Running Forecast...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Run Forecast
                      </>
                    )}
                  </Button>
                )}
                
                {currentStep === 7 && (
                  <Button 
                    className="mt-6"
                    onClick={handleExportPDF}
                    disabled={loading.pdfGeneration || forecastResults.length === 0}
                  >
                    {loading.pdfGeneration ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Report...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF Report
                      </>
                    )}
                  </Button>
                )}
              </div>
              
              {/* Footer navigation removed: StageTabs now controls navigation */}
            </div>
          )}
        </Card>
      </div>
      
      {/* Floating navigation removed: StageTabs is the primary navigator */}
    </div>
  );
};

export default DUFA;