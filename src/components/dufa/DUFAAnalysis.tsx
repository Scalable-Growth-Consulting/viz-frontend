import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  Download,
  Loader2,
  Award,
  Target,
  Activity,
  Calendar
} from 'lucide-react';
import { Dataset, ForecastConfig, ForecastResult } from '@/pages/DUFA';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

interface DUFAAnalysisProps {
  results: ForecastResult[];
  bestModel: ForecastResult | null;
  loading: boolean;
  onResultsChange: (results: ForecastResult[]) => void;
  onBestModelChange: (model: ForecastResult | null) => void;
  config: ForecastConfig;
  datasets: Dataset[];
}

const DUFAAnalysis: React.FC<DUFAAnalysisProps> = ({
  results,
  bestModel,
  loading,
  onResultsChange,
  onBestModelChange,
  config,
  datasets
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (results.length === 0 && datasets.length > 0 && config.algorithms.length > 0) {
      runForecasting();
    }
  }, [datasets, config]); // eslint-disable-line react-hooks/exhaustive-deps

  const runForecasting = async () => {
    setIsRunning(true);
    try {
      // Mock forecasting results - in real implementation, this would call the backend
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing time

      const mockResults: ForecastResult[] = config.algorithms.map((algorithm, index) => {
        const baseAccuracy = Math.random() * 0.3 + 0.7; // 70-100% accuracy
        const mape = (1 - baseAccuracy) * 100;
        const rmse = Math.random() * 50 + 10;
        const mae = Math.random() * 30 + 5;

        // Generate mock forecast data
        const forecastData = Array.from({ length: config.horizon }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i + 1);
          
          const trend = 100 + i * 0.5;
          const seasonality = Math.sin((i / 7) * 2 * Math.PI) * 10;
          const noise = (Math.random() - 0.5) * 20;
          const forecast = trend + seasonality + noise;
          
          return {
            date: date.toISOString().split('T')[0],
            forecast: Math.max(0, forecast),
            lower_bound: Math.max(0, forecast - 15),
            upper_bound: forecast + 15,
            anomaly: Math.random() < 0.05 // 5% chance of anomaly
          };
        });

        // Add some historical data points
        const historicalData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (30 - i));
          
          const trend = 100 - (30 - i) * 0.5;
          const seasonality = Math.sin(((30 - i) / 7) * 2 * Math.PI) * 10;
          const noise = (Math.random() - 0.5) * 15;
          const actual = trend + seasonality + noise;
          
          return {
            date: date.toISOString().split('T')[0],
            actual: Math.max(0, actual),
            forecast: Math.max(0, actual),
            lower_bound: Math.max(0, actual - 10),
            upper_bound: actual + 10
          };
        });

        return {
          model: algorithm,
          metrics: { mape, rmse, mae },
          forecast_data: [...historicalData, ...forecastData],
          insights: {
            trend: Math.random() > 0.5 ? 'increasing' : 'decreasing',
            seasonality: 'weekly',
            anomalies: Math.floor(Math.random() * 5),
            growth_rate: (Math.random() - 0.5) * 20
          }
        };
      });

      // Find best model (lowest MAPE)
      const best = mockResults.reduce((prev, current) => 
        prev.metrics.mape < current.metrics.mape ? prev : current
      );

      onResultsChange(mockResults);
      onBestModelChange(best);

      toast({
        title: "Forecasting Complete",
        description: `Generated forecasts using ${config.algorithms.length} algorithms. Best model: ${best.model}`,
      });
    } catch (error) {
      console.error('Error running forecasting:', error);
      toast({
        title: "Forecasting Failed",
        description: "Failed to generate forecasts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const downloadForecastData = () => {
    if (!bestModel) return;

    const csvContent = [
      ['Date', 'Forecast', 'Lower Bound', 'Upper Bound', 'Actual', 'Anomaly'].join(','),
      ...bestModel.forecast_data.map(row => [
        row.date,
        row.forecast.toFixed(2),
        row.lower_bound.toFixed(2),
        row.upper_bound.toFixed(2),
        row.actual?.toFixed(2) || '',
        row.anomaly ? 'Yes' : 'No'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `forecast_${bestModel.model}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Forecast data has been downloaded as CSV file.",
    });
  };

  const formatMetric = (value: number, decimals: number = 2) => {
    return value.toFixed(decimals);
  };

  const getModelColor = (model: string) => {
    const colors = {
      'ARIMA': '#3b82f6',
      'Prophet': '#10b981',
      'XGBoost': '#f59e0b',
      'LSTM': '#8b5cf6'
    };
    return colors[model as keyof typeof colors] || '#6b7280';
  };

  if (isRunning || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-viz-accent mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-viz-dark dark:text-white mb-2">
            Running Forecasting Models
          </h3>
          <p className="text-slate-600 dark:text-viz-text-secondary">
            This may take a few minutes depending on your data size and selected algorithms...
          </p>
          <div className="mt-4 space-y-2">
            {config.algorithms.map((algorithm, index) => (
              <div key={algorithm} className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-viz-accent rounded-full animate-pulse" />
                <span className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  Processing {algorithm}...
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-white mb-2">
          Ready to Generate Forecasts
        </h3>
        <p className="text-slate-500 dark:text-viz-text-secondary mb-4">
          Click the button below to start forecasting with your selected algorithms.
        </p>
        <Button onClick={runForecasting} className="bg-viz-accent hover:bg-viz-accent/90">
          <TrendingUp className="w-4 h-4 mr-2" />
          Run Forecasting
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-2">
            Forecast Analysis Results
          </h2>
          <p className="text-slate-600 dark:text-viz-text-secondary">
            Compare model performance and explore forecast insights.
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={downloadForecastData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Data
          </Button>
          <Button onClick={runForecasting} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Re-run Analysis
          </Button>
        </div>
      </div>

      {/* Best Model Card */}
      {bestModel && (
        <Card className="bg-gradient-to-r from-viz-accent/10 to-viz-accent/5 border-viz-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Award className="w-6 h-6 text-viz-accent" />
              <h3 className="text-xl font-bold text-viz-dark dark:text-white">
                Best Performing Model: {bestModel.model}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-viz-accent">
                  {formatMetric(bestModel.metrics.mape)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">MAPE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-viz-dark dark:text-white">
                  {formatMetric(bestModel.metrics.rmse)}
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">RMSE</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-viz-dark dark:text-white">
                  {formatMetric(bestModel.metrics.mae)}
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">MAE</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${
                  bestModel.insights.growth_rate > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {bestModel.insights.growth_rate > 0 ? '+' : ''}{formatMetric(bestModel.insights.growth_rate)}%
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">Growth Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="comparison">Model Comparison</TabsTrigger>
          <TabsTrigger value="forecast">Forecast Chart</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-viz-accent" />
                  <h3 className="font-semibold text-viz-dark dark:text-white">Models Tested</h3>
                </div>
                <div className="text-2xl font-bold text-viz-dark dark:text-white">
                  {results.length}
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {results.map(result => (
                    <Badge key={result.model} variant="secondary" className="text-xs">
                      {result.model}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="w-5 h-5 text-viz-accent" />
                  <h3 className="font-semibold text-viz-dark dark:text-white">Forecast Horizon</h3>
                </div>
                <div className="text-2xl font-bold text-viz-dark dark:text-white">
                  {config.horizon}
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  days ahead
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-viz-dark dark:text-white">Anomalies</h3>
                </div>
                <div className="text-2xl font-bold text-viz-dark dark:text-white">
                  {bestModel?.insights.anomalies || 0}
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  detected
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-2">
                  {bestModel?.insights.growth_rate && bestModel.insights.growth_rate > 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-500" />
                  )}
                  <h3 className="font-semibold text-viz-dark dark:text-white">Trend</h3>
                </div>
                <div className={`text-2xl font-bold ${
                  bestModel?.insights.growth_rate && bestModel.insights.growth_rate > 0 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {bestModel?.insights.trend === 'increasing' ? '↗' : '↘'}
                </div>
                <div className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  {bestModel?.insights.trend}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-viz-light">
                      <th className="text-left py-3 px-4 font-semibold text-viz-dark dark:text-white">Model</th>
                      <th className="text-center py-3 px-4 font-semibold text-viz-dark dark:text-white">MAPE (%)</th>
                      <th className="text-center py-3 px-4 font-semibold text-viz-dark dark:text-white">RMSE</th>
                      <th className="text-center py-3 px-4 font-semibold text-viz-dark dark:text-white">MAE</th>
                      <th className="text-center py-3 px-4 font-semibold text-viz-dark dark:text-white">Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results
                      .sort((a, b) => a.metrics.mape - b.metrics.mape)
                      .map((result, index) => (
                        <tr 
                          key={result.model} 
                          className={`border-b border-slate-100 dark:border-viz-light/50 ${
                            result.model === bestModel?.model ? 'bg-viz-accent/5' : ''
                          }`}
                        >
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: getModelColor(result.model) }}
                              />
                              <span className="font-medium text-viz-dark dark:text-white">
                                {result.model}
                              </span>
                              {result.model === bestModel?.model && (
                                <Award className="w-4 h-4 text-viz-accent" />
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4 text-viz-dark dark:text-white">
                            {formatMetric(result.metrics.mape)}%
                          </td>
                          <td className="text-center py-3 px-4 text-viz-dark dark:text-white">
                            {formatMetric(result.metrics.rmse)}
                          </td>
                          <td className="text-center py-3 px-4 text-viz-dark dark:text-white">
                            {formatMetric(result.metrics.mae)}
                          </td>
                          <td className="text-center py-3 px-4">
                            <Badge 
                              className={index === 0 ? 'bg-viz-accent' : 'bg-slate-200 text-slate-700'}
                            >
                              #{index + 1}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Forecast Visualization - {bestModel?.model}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={bestModel?.forecast_data || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      formatter={(value: number, name: string) => [
                        formatMetric(value), 
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      name="Actual"
                      connectNulls={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="upper_bound" 
                      stroke="#f59e0b" 
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      name="Upper Bound"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="lower_bound" 
                      stroke="#f59e0b" 
                      strokeWidth={1}
                      strokeDasharray="2 2"
                      name="Lower Bound"
                    />
                    <ReferenceLine x={new Date().toISOString().split('T')[0]} stroke="#ef4444" strokeDasharray="3 3" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-viz-accent mt-1" />
                  <div>
                    <h4 className="font-semibold text-viz-dark dark:text-white">Trend Analysis</h4>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                      The data shows a {bestModel?.insights.trend} trend with a growth rate of{' '}
                      {bestModel?.insights.growth_rate && bestModel.insights.growth_rate > 0 ? '+' : ''}
                      {formatMetric(bestModel?.insights.growth_rate || 0)}% over the forecast period.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-viz-accent mt-1" />
                  <div>
                    <h4 className="font-semibold text-viz-dark dark:text-white">Seasonality</h4>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                      {bestModel?.insights.seasonality} seasonal patterns detected in the data,
                      which helps improve forecast accuracy.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 mt-1" />
                  <div>
                    <h4 className="font-semibold text-viz-dark dark:text-white">Anomalies</h4>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                      {bestModel?.insights.anomalies || 0} anomalies detected in the forecast period.
                      These may indicate unusual events or data quality issues.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-1">
                    Model Selection
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {bestModel?.model} performed best with {formatMetric(bestModel?.metrics.mape || 0)}% MAPE.
                    Consider using this model for production forecasting.
                  </p>
                </div>
                
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-1">
                    Data Quality
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Monitor the {bestModel?.insights.anomalies || 0} detected anomalies.
                    Consider data cleaning if anomalies are due to errors.
                  </p>
                </div>
                
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                    Forecast Horizon
                  </h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Current {config.horizon}-day forecast. Consider shorter horizons for higher accuracy
                    or longer horizons for strategic planning.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DUFAAnalysis;
