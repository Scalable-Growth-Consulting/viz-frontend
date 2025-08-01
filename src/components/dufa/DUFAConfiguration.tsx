import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Brain, 
  Calendar, 
  TrendingUp, 
  BarChart3,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Dataset, ForecastConfig } from '@/pages/DUFA';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface DUFAConfigurationProps {
  config: ForecastConfig;
  onConfigChange: (config: ForecastConfig) => void;
  selectedDatasets: Dataset[];
}

const DUFAConfiguration: React.FC<DUFAConfigurationProps> = ({
  config,
  onConfigChange,
  selectedDatasets
}) => {
  const [activeTab, setActiveTab] = useState('algorithms');

  const algorithms = [
    {
      id: 'ARIMA',
      name: 'ARIMA',
      description: 'AutoRegressive Integrated Moving Average - Best for stationary time series',
      complexity: 'Medium',
      accuracy: 'High',
      speed: 'Fast',
      useCase: 'Stationary data with clear patterns'
    },
    {
      id: 'Prophet',
      name: 'Prophet',
      description: 'Facebook\'s forecasting tool - Handles seasonality and holidays well',
      complexity: 'Low',
      accuracy: 'High',
      speed: 'Medium',
      useCase: 'Data with strong seasonal patterns'
    },
    {
      id: 'XGBoost',
      name: 'XGBoost',
      description: 'Gradient boosting - Excellent for complex non-linear patterns',
      complexity: 'High',
      accuracy: 'Very High',
      speed: 'Medium',
      useCase: 'Complex patterns with multiple features'
    },
    {
      id: 'LSTM',
      name: 'LSTM',
      description: 'Long Short-Term Memory neural network - Best for complex sequences',
      complexity: 'Very High',
      accuracy: 'Very High',
      speed: 'Slow',
      useCase: 'Complex temporal dependencies'
    }
  ];

  const seasonalityOptions = [
    { value: 'auto', label: 'Auto-detect', description: 'Let the algorithm determine seasonality' },
    { value: 'daily', label: 'Daily', description: 'Daily seasonal patterns' },
    { value: 'weekly', label: 'Weekly', description: 'Weekly seasonal patterns' },
    { value: 'monthly', label: 'Monthly', description: 'Monthly seasonal patterns' },
    { value: 'yearly', label: 'Yearly', description: 'Yearly seasonal patterns' }
  ];

  const handleAlgorithmToggle = (algorithmId: string) => {
    const isSelected = config.algorithms.includes(algorithmId);
    
    if (isSelected) {
      onConfigChange({
        ...config,
        algorithms: config.algorithms.filter(id => id !== algorithmId)
      });
    } else {
      onConfigChange({
        ...config,
        algorithms: [...config.algorithms, algorithmId]
      });
    }
  };

  const handleHorizonChange = (value: number[]) => {
    onConfigChange({
      ...config,
      horizon: value[0]
    });
  };

  const handleConfidenceIntervalChange = (value: number[]) => {
    onConfigChange({
      ...config,
      confidence_interval: value[0]
    });
  };

  const handleSeasonalityChange = (value: string) => {
    onConfigChange({
      ...config,
      seasonality: value as ForecastConfig['seasonality']
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'High': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'Very High': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getAccuracyColor = (accuracy: string) => {
    switch (accuracy) {
      case 'High': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Very High': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getSpeedColor = (speed: string) => {
    switch (speed) {
      case 'Fast': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Slow': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-2">
          Configure Forecasting Parameters
        </h2>
        <p className="text-slate-600 dark:text-viz-text-secondary">
          Set up your forecasting algorithms, time horizon, and seasonality settings.
        </p>
      </div>

      {/* Selected Datasets Summary */}
      <Card className="bg-viz-accent/5 border-viz-accent/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="w-5 h-5 text-viz-accent" />
            <h3 className="font-semibold text-viz-dark dark:text-white">
              Selected Datasets ({selectedDatasets.length})
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedDatasets.map(dataset => (
              <Badge key={dataset.id} className="bg-viz-accent text-white">
                {dataset.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="algorithms" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Algorithms</span>
          </TabsTrigger>
          <TabsTrigger value="horizon" className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Time Horizon</span>
          </TabsTrigger>
          <TabsTrigger value="seasonality" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Seasonality</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="algorithms" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="w-5 h-5 text-viz-accent" />
                <span>Select Forecasting Algorithms</span>
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                Choose one or more algorithms to compare performance. We recommend selecting multiple algorithms for best results.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {algorithms.map(algorithm => {
                const isSelected = config.algorithms.includes(algorithm.id);
                
                return (
                  <Card 
                    key={algorithm.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'ring-2 ring-viz-accent bg-viz-accent/5' 
                        : 'hover:bg-slate-50 dark:hover:bg-viz-medium/50'
                    }`}
                    onClick={() => handleAlgorithmToggle(algorithm.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleAlgorithmToggle(algorithm.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-viz-dark dark:text-white">
                              {algorithm.name}
                            </h3>
                            <Badge className={getComplexityColor(algorithm.complexity)}>
                              {algorithm.complexity}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-viz-text-secondary mb-3">
                            {algorithm.description}
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Accuracy</Label>
                              <Badge className={getAccuracyColor(algorithm.accuracy)} variant="secondary">
                                {algorithm.accuracy}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Speed</Label>
                              <Badge className={getSpeedColor(algorithm.speed)} variant="secondary">
                                {algorithm.speed}
                              </Badge>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Best for</Label>
                              <p className="text-xs text-slate-600 dark:text-viz-text-secondary">
                                {algorithm.useCase}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              
              {config.algorithms.length === 0 && (
                <div className="flex items-center space-x-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    Please select at least one algorithm to proceed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horizon" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-viz-accent" />
                <span>Forecast Time Horizon</span>
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                Set how far into the future you want to forecast.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Forecast Horizon (Days)</Label>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {config.horizon} days
                  </Badge>
                </div>
                <Slider
                  value={[config.horizon]}
                  onValueChange={handleHorizonChange}
                  max={365}
                  min={7}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-viz-text-secondary mt-2">
                  <span>7 days</span>
                  <span>1 year (365 days)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-sm font-medium">Confidence Interval (%)</Label>
                  <Badge variant="outline" className="text-lg font-semibold">
                    {config.confidence_interval}%
                  </Badge>
                </div>
                <Slider
                  value={[config.confidence_interval]}
                  onValueChange={handleConfidenceIntervalChange}
                  max={99}
                  min={80}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-viz-text-secondary mt-2">
                  <span>80%</span>
                  <span>99%</span>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start space-x-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                      Forecasting Guidelines
                    </h4>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• Short-term (7-30 days): Higher accuracy, good for operational planning</li>
                      <li>• Medium-term (1-3 months): Balanced accuracy, suitable for tactical decisions</li>
                      <li>• Long-term (3+ months): Lower accuracy, useful for strategic planning</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seasonality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-viz-accent" />
                <span>Seasonality Settings</span>
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                Configure how the algorithm should handle seasonal patterns in your data.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Seasonality Pattern</Label>
                <Select value={config.seasonality} onValueChange={handleSeasonalityChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select seasonality pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {seasonalityOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-slate-500">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-800 dark:text-green-200 mb-1">
                      Seasonality Recommendations
                    </h4>
                    <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                      <li>• <strong>Auto-detect:</strong> Best for most use cases, lets algorithms find patterns</li>
                      <li>• <strong>Daily:</strong> For data with daily patterns (e.g., website traffic)</li>
                      <li>• <strong>Weekly:</strong> For business data with weekly cycles</li>
                      <li>• <strong>Monthly:</strong> For data with monthly patterns (e.g., sales)</li>
                      <li>• <strong>Yearly:</strong> For data with annual seasonality (e.g., retail)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Configuration Summary */}
      <Card className="bg-slate-50 dark:bg-viz-medium/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-viz-accent" />
            <span>Configuration Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Algorithms</Label>
              <p className="font-semibold text-viz-dark dark:text-white">
                {config.algorithms.length} selected
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {config.algorithms.map(alg => (
                  <Badge key={alg} variant="secondary" className="text-xs">
                    {alg}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Forecast Horizon</Label>
              <p className="font-semibold text-viz-dark dark:text-white">
                {config.horizon} days
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Seasonality</Label>
              <p className="font-semibold text-viz-dark dark:text-white">
                {seasonalityOptions.find(opt => opt.value === config.seasonality)?.label}
              </p>
            </div>
            <div>
              <Label className="text-xs text-slate-500 dark:text-viz-text-secondary">Confidence</Label>
              <p className="font-semibold text-viz-dark dark:text-white">
                {config.confidence_interval}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DUFAConfiguration;
