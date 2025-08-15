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
  chartHtml?: string | null;
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
  chartHtml,
}) => {
  const reactChartWrapperRef = React.useRef<HTMLDivElement | null>(null);

  // Prebuild iframe document when BI Agent returns HTML/JS
  const iframeDoc = React.useMemo(() => {
    if (!chartHtml) return null;
    try {
      const hasScript = new RegExp('<script[\\s\\S]*?>[\\s\\S]*<\\/script>', 'i').test(chartHtml);
      const safeSnippet = hasScript
        ? chartHtml
        : `<script>(function(){
  var code = function(){ ${chartHtml.replace(/<\/(script)>/gi, '<\\/$1>')} };
  function ready(){
    try {
      if (!window.Chart) return false;
      var el = document.getElementById('myChart');
      if (!el) return false;
      var ctx = el.getContext && el.getContext('2d');
      if (!ctx) return false;
      return true;
    } catch(e){ return false; }
  }
  function run(){
    try { code(); } catch(e){ console.error('Chart snippet error:', e); }
  }
  function startWhenReady(timeoutMs){
    var start = Date.now();
    (function tick(){
      if (ready()) { run(); return; }
      if (Date.now() - start > timeoutMs) { console.warn('Chart snippet timeout'); return; }
      setTimeout(tick, 50);
    })();
  }
  if (document.readyState === 'complete') startWhenReady(5000);
  else window.addEventListener('load', function(){ startWhenReady(5000); });
})();<\/script>`;
      const doc = `<!doctype html><html><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>html,body{margin:0;padding:0;height:100%;}#wrap{height:100%;display:flex;flex-direction:column;}#canvas-wrap{flex:1;}</style>
</head><body>
<div id="wrap"><div id="canvas-wrap"><canvas id="myChart"></canvas></div></div>
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3"></script>
${safeSnippet}
</body></html>`;
      return doc;
    } catch (e) {
      console.error('Error preparing chart iframe document:', e);
      return null;
    }
  }, [chartHtml]);

  React.useEffect(() => {
    // If we're rendering via react-chartjs-2, ensure the canvas has id="myChart"
    if (chartData && !chartHtml && reactChartWrapperRef.current) {
      const canvas = reactChartWrapperRef.current.querySelector('canvas');
      if (canvas && !canvas.id) {
        canvas.id = 'myChart';
      }
    }
  }, [chartData, chartHtml]);
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
            <div className="flex justify-between items-center p-2 border-b">
              <div className="px-2 text-xs text-muted-foreground">SQL Query</div>
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
              {(() => {
                const src = sql && sql.trim().length > 0 ? sql : '-- SQL will appear here --';
                const lines = src.split('\n');
                return (
                  <div className="p-0">
                    <div className="rounded-lg border bg-slate-950 text-slate-100">
                      <div className="flex text-sm font-mono leading-6">
                        {/* Line numbers */}
                        <div className="select-none bg-slate-900/70 text-slate-500 px-3 py-3 text-right">
                          {lines.map((_, i) => (
                            <div key={i}>{i + 1}</div>
                          ))}
                        </div>
                        {/* Code content */}
                        <pre className="flex-1 overflow-auto p-3 whitespace-pre">
                          <code>{src}</code>
                        </pre>
                      </div>
                    </div>
                  </div>
                );
              })()}
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
              {chartHtml ? (
                <iframe
                  title="BI Agent Chart"
                  className="w-full h-[520px] border rounded-md bg-white"
                  sandbox="allow-scripts allow-same-origin"
                  srcDoc={iframeDoc || undefined}
                />
              ) : chartData ? (
                <div className="h-full w-full" ref={reactChartWrapperRef}>
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
