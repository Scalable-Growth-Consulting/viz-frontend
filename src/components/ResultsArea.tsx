import React from 'react';
import { FileText, Database, BarChart2, Loader2, Copy } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { toast } from './ui/use-toast';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type TabType = 'answer' | 'sql' | 'chart';

interface ResultsAreaProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  answer: string;
  sql: string;
  chartData: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor?: string;
      borderWidth?: number;
    }>;
  } | null;
  isLoading: boolean;
  isChartLoading: boolean;
  onChartUpdate?: (data: any) => void;
  className?: string;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({
  activeTab,
  onTabChange,
  answer,
  sql,
  chartData,
  isLoading,
  isChartLoading,
  onChartUpdate,
  className,
}) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Processing your request...</p>
        </div>
      );
    }

    if (isChartLoading && activeTab === 'chart') {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Generating chart...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'answer':
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium">Analysis Results</h3>
              <p className="text-xs text-muted-foreground">Generated response based on your query</p>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="prose dark:prose-invert max-w-none">
                {answer || (
                  <div className="text-center text-muted-foreground py-8">
                    <p>Ask a question or use one of the example queries to get started.</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      case 'sql':
        return (
          <div className="h-full flex flex-col">
            <div className="flex justify-end p-2 border-b">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(sql);
                  toast({
                    title: 'Copied to clipboard',
                    description: 'SQL query has been copied to your clipboard.',
                  });
                }}
                className="text-xs gap-1"
              >
                <Copy className="h-3.5 w-3.5" />
                Copy SQL
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <pre className="p-4 text-sm bg-muted/5 dark:bg-muted/10 font-mono overflow-auto">
                <code>{sql || '-- SQL will appear here --'}</code>
              </pre>
            </ScrollArea>
          </div>
        );
      case 'chart':
        return (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium">Chart Visualization</h3>
              <p className="text-xs text-muted-foreground">Interactive data visualization</p>
            </div>
            <div className="flex-1 p-4">
              {chartData ? (
                <div className="h-full w-full">
                  <Bar
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top' as const,
                        },
                        title: {
                          display: true,
                          text: 'Data Visualization',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(0, 0, 0, 0.05)',
                          },
                        },
                        x: {
                          grid: {
                            display: false,
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                  <BarChart2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h4 className="font-medium">No chart data available</h4>
                  <p className="text-sm mt-1">Ask a question to generate a chart visualization</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-card rounded-lg border", className)}>
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => onTabChange(value as TabType)}
        className="flex flex-col h-full"
      >
        <div className="px-4 pt-3">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="answer" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Answer</span>
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span>SQL</span>
            </TabsTrigger>
            <TabsTrigger value="chart" className="flex items-center gap-2">
              <BarChart2 className="h-4 w-4" />
              <span>Chart</span>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </Tabs>
    </div>
  );
};

export default ResultsArea;
