import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { saveDUFASession, loadDUFASession } from '@/lib/dufaSession';

type Dataset = {
  id: string;
  name: string;
  table_name: string;
  rows: number;
  columns: string[];
  last_updated: string;
};

type ForecastConfig = {
  algorithms: string[];
  horizon: number;
  seasonality: 'auto' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  confidence_interval: number;
};

type ForecastResult = {
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
};

type ProgressState = {
  upload: boolean;
  dataSelection: boolean;
  forecastConfiguration: boolean;
  forecastResults: boolean;
  chatInteraction: boolean;
  pdfDownload: boolean;
};

type DufaState = {
  // Navigation
  currentStep: number;
  completedSteps: number[];
  
  // Data
  uploadedDataset: File | null;
  selectedDatasets: Dataset[];
  
  // Forecast
  forecastConfig: ForecastConfig;
  forecastResults: ForecastResult[];
  bestModel: ForecastResult | null;
  
  // UI State
  loading: {
    datasets: boolean;
    forecast: boolean;
    analysis: boolean;
    chat: boolean;
    pdfGeneration: boolean;
  };
  
  // Progress
  progress: ProgressState;
  
  // Chat
  chatMessages: any[];
  
  // Settings
  settingsOpen: boolean;
  dufaVisible: boolean;
  featureFlags: {
    [key: string]: boolean;
  };
  
  // UI
  collapsedSections: {
    datasets: boolean;
    configuration: boolean;
    results: boolean;
    chat: boolean;
  };
};

const initialState: DufaState = {
  // Navigation
  currentStep: 1,
  completedSteps: [],
  
  // Data
  uploadedDataset: null,
  selectedDatasets: [],
  
  // Forecast
  forecastConfig: {
    algorithms: ['ARIMA'],
    horizon: 30,
    seasonality: 'auto',
    confidence_interval: 95,
  },
  forecastResults: [],
  bestModel: null,
  
  // Loading states
  loading: {
    datasets: false,
    forecast: false,
    analysis: false,
    chat: false,
    pdfGeneration: false,
  },
  
  // Progress
  progress: {
    upload: false,
    dataSelection: false,
    forecastConfiguration: false,
    forecastResults: false,
    chatInteraction: false,
    pdfDownload: false,
  },
  
  // Chat
  chatMessages: [],
  
  // Settings
  settingsOpen: false,
  dufaVisible: true,
  featureFlags: {
    'Beta Chatbot': false,
    'Advanced Charts': false,
  },
  
  // UI
  collapsedSections: {
    datasets: false,
    configuration: true,
    results: true,
    chat: true,
  },
};

export const useDufaState = () => {
  const [state, setState] = useState<DufaState>(() => {
    const session = loadDUFASession();
    return session ? {
      ...initialState,
      currentStep: session.currentStep || initialState.currentStep,
      uploadedDataset: session.uploadedDatasetName ? { name: session.uploadedDatasetName } as File : null,
      selectedDatasets: session.selectedDatasets || initialState.selectedDatasets,
      forecastConfig: session.forecastConfig || initialState.forecastConfig,
      forecastResults: session.forecastResults || initialState.forecastResults,
      bestModel: session.bestModel || initialState.bestModel,
      chatMessages: session.chatMessages || initialState.chatMessages,
      progress: session.progress || initialState.progress,
    } : initialState;
  });
  
  const { toast } = useToast();
  
  // Save session whenever relevant state changes
  useEffect(() => {
    saveDUFASession({
      currentStep: state.currentStep,
      uploadedDatasetName: state.uploadedDataset?.name,
      selectedDatasets: state.selectedDatasets,
      forecastConfig: state.forecastConfig,
      forecastResults: state.forecastResults,
      bestModel: state.bestModel,
      chatMessages: state.chatMessages,
      progress: state.progress,
    });
  }, [state]);
  
  // State updaters
  const updateState = useCallback((updates: Partial<DufaState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);
  
  // Derived state
  const hasUploadedFile = useMemo(() => Boolean(state.uploadedDataset), [state.uploadedDataset]);
  
  // Action handlers
  const handleFileUpload = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      uploadedDataset: file,
      progress: { ...prev.progress, upload: true },
    }));
    
    toast({
      title: "File Uploaded",
      description: `${file.name} has been uploaded successfully.`,
    });
  }, [toast]);
  
  const handleUploadError = useCallback((error: Error) => {
    console.error('Upload error:', error);
    toast({
      title: "Upload Failed",
      description: error.message || "Failed to upload file. Please try again.",
      variant: "destructive"
    });
  }, [toast]);
  
  const toggleSection = useCallback((section: keyof DufaState['collapsedSections']) => {
    setState(prev => ({
      ...prev,
      collapsedSections: {
        ...prev.collapsedSections,
        [section]: !prev.collapsedSections[section],
      },
    }));
  }, []);
  
  const updateChatMessages = useCallback((messages: any[]) => {
    setState(prev => ({
      ...prev,
      chatMessages: messages,
    }));
  }, []);
  
  return {
    state,
    updateState,
    hasUploadedFile,
    // Actions
    handleFileUpload,
    handleUploadError,
    toggleSection,
    updateChatMessages,
  };
};
