import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { FileDown, Loader2 } from 'lucide-react';
import { Dataset, ForecastConfig, ForecastResult } from '@/pages/DUFA';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface DUFAPDFGeneratorProps {
  datasets: Dataset[];
  config: ForecastConfig;
  results: ForecastResult[];
  bestModel: ForecastResult | null;
  chatMessages: Message[];
  onDownloadComplete: () => void;
  isLoading?: boolean;
}

const DUFAPDFGenerator: React.FC<DUFAPDFGeneratorProps> = ({
  datasets,
  config,
  results,
  bestModel,
  chatMessages,
  onDownloadComplete,
  isLoading = false
}) => {
  const { toast } = useToast();

  const generatePDFReport = async () => {
    try {
      // Create comprehensive report content
      const reportData = {
        metadata: {
          title: 'DUFA - Demand Forecasting Analysis Report',
          generatedAt: new Date().toISOString(),
          user: 'Current User', // Would be replaced with actual user data
        },
        datasets: {
          count: datasets.length,
          details: datasets.map(d => ({
            name: d.name,
            table: d.table_name,
            rows: d.rows,
            columns: d.columns.length,
            lastUpdated: d.last_updated
          }))
        },
        configuration: {
          algorithms: config.algorithms,
          horizon: config.horizon,
          seasonality: config.seasonality,
          confidenceInterval: config.confidence_interval
        },
        results: {
          modelsAnalyzed: results.length,
          bestModel: bestModel ? {
            name: bestModel.model,
            mape: bestModel.metrics.mape,
            rmse: bestModel.metrics.rmse,
            mae: bestModel.metrics.mae,
            trend: bestModel.insights.trend,
            growthRate: bestModel.insights.growth_rate,
            anomalies: bestModel.insights.anomalies
          } : null,
          allModels: results.map(r => ({
            model: r.model,
            mape: r.metrics.mape,
            rmse: r.metrics.rmse,
            mae: r.metrics.mae
          }))
        },
        chatSummary: {
          totalMessages: chatMessages.length,
          userQuestions: chatMessages.filter(m => m.type === 'user').length,
          aiResponses: chatMessages.filter(m => m.type === 'bot').length,
          keyInteractions: chatMessages.slice(0, 10).map(m => ({
            type: m.type,
            content: m.content.substring(0, 200) + (m.content.length > 200 ? '...' : ''),
            timestamp: m.timestamp.toISOString()
          }))
        },
        recommendations: generateRecommendations(bestModel, results, config)
      };

      // Generate HTML content for PDF
      const htmlContent = generateHTMLReport(reportData);
      
      // Create and download PDF (using browser's print functionality)
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        // Wait for content to load, then trigger print
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 1000);
      }

      // Also create downloadable JSON report
      const jsonReport = JSON.stringify(reportData, null, 2);
      const blob = new Blob([jsonReport], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DUFA_Report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onDownloadComplete();
      
      toast({
        title: "Report Generated Successfully",
        description: "Your comprehensive DUFA report has been generated and downloaded.",
      });

    } catch (error) {
      console.error('Error generating PDF report:', error);
      toast({
        title: "Report Generation Failed",
        description: "There was an error generating your report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const generateRecommendations = (bestModel: ForecastResult | null, results: ForecastResult[], config: ForecastConfig) => {
    const recommendations: Array<{
      category: string;
      level: 'success' | 'warning' | 'error';
      message: string;
    }> = [];

    if (bestModel) {
      // Model performance recommendations
      if (bestModel.metrics.mape < 10) {
        recommendations.push({
          category: 'Model Performance',
          level: 'success',
          message: `Excellent accuracy achieved with ${bestModel.model} (${bestModel.metrics.mape.toFixed(2)}% MAPE). This model is suitable for production use.`
        });
      } else if (bestModel.metrics.mape < 20) {
        recommendations.push({
          category: 'Model Performance',
          level: 'warning',
          message: `Good accuracy with ${bestModel.model} (${bestModel.metrics.mape.toFixed(2)}% MAPE). Consider additional feature engineering for improvement.`
        });
      } else {
        recommendations.push({
          category: 'Model Performance',
          level: 'error',
          message: `Moderate accuracy with ${bestModel.model} (${bestModel.metrics.mape.toFixed(2)}% MAPE). Review data quality and consider alternative approaches.`
        });
      }

      // Trend recommendations
      if (bestModel.insights.growth_rate > 10) {
        recommendations.push({
          category: 'Business Impact',
          level: 'success',
          message: `Strong positive growth trend detected (${bestModel.insights.growth_rate.toFixed(1)}%). Consider scaling operations and inventory.`
        });
      } else if (bestModel.insights.growth_rate < -10) {
        recommendations.push({
          category: 'Business Impact',
          level: 'warning',
          message: `Declining trend detected (${bestModel.insights.growth_rate.toFixed(1)}%). Review market conditions and consider strategic adjustments.`
        });
      }

      // Anomaly recommendations
      if (bestModel.insights.anomalies > 5) {
        recommendations.push({
          category: 'Data Quality',
          level: 'warning',
          message: `${bestModel.insights.anomalies} anomalies detected. Review data sources and consider data cleaning procedures.`
        });
      }
    }

    // Forecast horizon recommendations
    if (config.horizon > 90) {
      recommendations.push({
        category: 'Forecast Horizon',
        level: 'warning',
        message: 'Long-term forecast selected. Consider shorter horizons for operational decisions and regular model retraining.'
      });
    }

    return recommendations;
  };

  const generateHTMLReport = (data: {
    metadata: {
      title: string;
      generatedAt: string;
      user: string;
    };
    datasets: {
      count: number;
      details: Array<{
        name: string;
        table: string;
        rows: number;
        columns: number;
        lastUpdated: string;
      }>;
    };
    configuration: {
      algorithms: string[];
      horizon: number;
      seasonality: string;
      confidenceInterval: number;
    };
    results: {
      modelsAnalyzed: number;
      bestModel: {
        name: string;
        mape: number;
        rmse: number;
        mae: number;
        trend: string;
        growthRate: number;
        anomalies: number;
      } | null;
      allModels: Array<{
        model: string;
        mape: number;
        rmse: number;
        mae: number;
      }>;
    };
    chatSummary: {
      totalMessages: number;
      userQuestions: number;
      aiResponses: number;
      keyInteractions: Array<{
        type: string;
        content: string;
        timestamp: string;
      }>;
    };
    recommendations: Array<{
      category: string;
      level: 'success' | 'warning' | 'error';
      message: string;
    }>;
  }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <title>${data.metadata.title}</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { color: #3b82f6; margin: 0; font-size: 28px; }
            .header p { color: #666; margin: 5px 0; }
            .section { margin: 30px 0; page-break-inside: avoid; }
            .section h2 { color: #1f2937; border-left: 4px solid #3b82f6; padding-left: 15px; font-size: 20px; }
            .section h3 { color: #374151; font-size: 16px; margin-top: 20px; }
            .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
            .card h4 { margin: 0 0 10px 0; color: #1f2937; }
            .metric { text-align: center; }
            .metric .value { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .metric .label { font-size: 14px; color: #666; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th, .table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            .table th { background: #f1f5f9; font-weight: bold; }
            .recommendation { margin: 10px 0; padding: 15px; border-radius: 6px; }
            .recommendation.success { background: #f0fdf4; border-left: 4px solid #22c55e; }
            .recommendation.warning { background: #fffbeb; border-left: 4px solid #f59e0b; }
            .recommendation.error { background: #fef2f2; border-left: 4px solid #ef4444; }
            .recommendation.info { background: #f0f9ff; border-left: 4px solid #3b82f6; }
            @media print { body { margin: 20px; } .section { page-break-inside: avoid; } }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>${data.metadata.title}</h1>
            <p>Generated on ${new Date(data.metadata.generatedAt).toLocaleString()}</p>
            <p>Comprehensive Demand Forecasting Analysis</p>
        </div>

        <div class="section">
            <h2>Executive Summary</h2>
            <div class="grid">
                <div class="card metric">
                    <div class="value">${data.datasets.count}</div>
                    <div class="label">Datasets Analyzed</div>
                </div>
                <div class="card metric">
                    <div class="value">${data.results.modelsAnalyzed}</div>
                    <div class="label">Models Tested</div>
                </div>
                <div class="card metric">
                    <div class="value">${data.results.bestModel?.mape.toFixed(2)}%</div>
                    <div class="label">Best Model MAPE</div>
                </div>
                <div class="card metric">
                    <div class="value">${data.configuration.horizon}</div>
                    <div class="label">Forecast Days</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Dataset Information</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Dataset Name</th>
                        <th>Table</th>
                        <th>Rows</th>
                        <th>Columns</th>
                        <th>Last Updated</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.datasets.details.map(d => `
                        <tr>
                            <td>${d.name}</td>
                            <td>${d.table}</td>
                            <td>${d.rows.toLocaleString()}</td>
                            <td>${d.columns}</td>
                            <td>${new Date(d.lastUpdated).toLocaleDateString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Model Performance Comparison</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>MAPE (%)</th>
                        <th>RMSE</th>
                        <th>MAE</th>
                        <th>Rank</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.results.allModels
                      .sort((a, b) => a.mape - b.mape)
                      .map((model, index) => `
                        <tr style="${model.model === data.results.bestModel?.name ? 'background: #f0fdf4; font-weight: bold;' : ''}">
                            <td>${model.model}</td>
                            <td>${model.mape.toFixed(2)}</td>
                            <td>${model.rmse.toFixed(2)}</td>
                            <td>${model.mae.toFixed(2)}</td>
                            <td>#${index + 1}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Key Insights</h2>
            ${data.results.bestModel ? `
                <div class="card">
                    <h4>Best Model: ${data.results.bestModel.name}</h4>
                    <p><strong>Accuracy:</strong> ${data.results.bestModel.mape.toFixed(2)}% MAPE</p>
                    <p><strong>Trend:</strong> ${data.results.bestModel.trend} (${data.results.bestModel.growthRate > 0 ? '+' : ''}${data.results.bestModel.growthRate.toFixed(1)}% growth rate)</p>
                    <p><strong>Anomalies:</strong> ${data.results.bestModel.anomalies} detected in forecast period</p>
                </div>
            ` : '<p>No model results available.</p>'}
        </div>

        <div class="section">
            <h2>Chat Analysis Summary</h2>
            <div class="grid">
                <div class="card metric">
                    <div class="value">${data.chatSummary.totalMessages}</div>
                    <div class="label">Total Messages</div>
                </div>
                <div class="card metric">
                    <div class="value">${data.chatSummary.userQuestions}</div>
                    <div class="label">User Questions</div>
                </div>
                <div class="card metric">
                    <div class="value">${data.chatSummary.aiResponses}</div>
                    <div class="label">AI Responses</div>
                </div>
            </div>
            
            <h3>Key Interactions</h3>
            ${data.chatSummary.keyInteractions.map(interaction => `
                <div class="card">
                    <p><strong>${interaction.type === 'user' ? 'Question' : 'AI Response'}:</strong></p>
                    <p>${interaction.content}</p>
                    <p style="font-size: 12px; color: #666;">${new Date(interaction.timestamp).toLocaleString()}</p>
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Recommendations</h2>
            ${data.recommendations.map(rec => `
                <div class="recommendation ${rec.level}">
                    <strong>${rec.category}:</strong> ${rec.message}
                </div>
            `).join('')}
        </div>

        <div class="section">
            <h2>Configuration Details</h2>
            <div class="card">
                <p><strong>Algorithms Used:</strong> ${data.configuration.algorithms.join(', ')}</p>
                <p><strong>Forecast Horizon:</strong> ${data.configuration.horizon} days</p>
                <p><strong>Seasonality:</strong> ${data.configuration.seasonality}</p>
                <p><strong>Confidence Interval:</strong> ${data.configuration.confidenceInterval}%</p>
            </div>
        </div>
    </body>
    </html>
    `;
  };

  return (
    <Button
      onClick={generatePDFReport}
      disabled={isLoading || !bestModel}
      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating Report...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Download PDF Report
        </>
      )}
    </Button>
  );
};

export default DUFAPDFGenerator;
