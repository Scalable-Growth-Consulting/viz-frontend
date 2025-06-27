import React, { useEffect } from 'react';
import { FileTextIcon, DatabaseIcon, BarChartIcon } from 'lucide-react';
import { ChartData } from '../types/data';

interface TabContentProps {
  activeTab: 'answer' | 'sql' | 'charts';
  queryResult: string | null;
  chartData: ChartData | null;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab, queryResult, chartData }) => {

useEffect(() => {
  let isMounted = true;
  const container = document.getElementById('chart-container');

  if (activeTab === 'charts' && chartData?.chartScript && container) {
    container.innerHTML = '<canvas id="myChart" style="width:100%;height:100%"></canvas>';

    const injectScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = false;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
      });
    };

    const injectStyle = (href: string) => {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        document.head.appendChild(link);
      }
    };

    const chartJsLibs = [
      'https://cdn.jsdelivr.net/npm/chart.js',
      'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns',
      'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation',
      'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels',
      'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom',
      'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
    ];

    injectStyle('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

    const match = chartData.chartScript.match(/<script>([\s\S]*?)<\/script>/i);
    const jsCode = match ? match[1] : chartData.chartScript;

    (async () => {
      try {
        for (const lib of chartJsLibs) {
          await injectScript(lib);
        }

        // Only run script if component is still mounted and container is present
        if (!isMounted) return;

        const chartContainer = document.getElementById('chart-container');
        if (chartContainer) {
          const scriptElement = document.createElement('script');
          scriptElement.type = 'text/javascript';
          scriptElement.innerHTML = jsCode;
          chartContainer.appendChild(scriptElement);
        }
      } catch (err) {
        console.error('Error loading chart libraries or script:', err);
      }
    })();
  }

  return () => {
    isMounted = false;


  // Proper Chart.js cleanup (destroy chart instance if created)
 const canvas = document.getElementById('myChart') as HTMLCanvasElement | null;
    
    const cleanupContainer = document.getElementById('chart-container');
    if (cleanupContainer) {
      cleanupContainer.innerHTML = '';
      cleanupContainer.removeAttribute('style'); // prevents height overflow
    }

    // Optionally remove injected chart scripts
    const scriptSrcsToClean = [
      'chart.js',
      'chartjs-adapter-date-fns',
      'chartjs-plugin-annotation',
      'chartjs-plugin-datalabels',
      'chartjs-plugin-zoom',
      'axios.min.js',
    ];
    document.querySelectorAll('script').forEach((script) => {
      if (scriptSrcsToClean.some((part) => script.src.includes(part))) {
        script.remove();
      }
    });
  };
}, [activeTab, chartData]);



  const getContent = () => {
    if (!queryResult) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-viz-text-secondary">
          <div className="w-16 h-16 flex items-center justify-center bg-viz-medium/50 rounded-full mb-4">
            {activeTab === 'answer' && <FileTextIcon className="w-8 h-8" />}
            {activeTab === 'sql' && <DatabaseIcon className="w-8 h-8" />}
            {activeTab === 'charts' && <BarChartIcon className="w-8 h-8" />}
          </div>
          <p className="text-lg font-medium">No query submitted yet</p>
          <p className="text-sm mt-2">Submit a query to see {activeTab} results here</p>
        </div>
      );
    }

    // If we have a query result
    if (activeTab === 'answer') {
      return <div className="prose dark:prose-invert max-w-none">{queryResult}</div>;
    }
    
    if (activeTab === 'sql') {
      return (
        <div className="space-y-4">
          <div className="bg-viz-dark p-4 rounded-lg overflow-x-auto text-viz-text">
            <div className="flex items-center mb-2 text-viz-text-secondary text-sm">
              <DatabaseIcon className="w-4 h-4 mr-2" />
              <span>SQL Query</span>
            </div>
            <pre className="whitespace-pre-wrap">
              <code className="text-viz-accent">{queryResult}</code>
            </pre>
          </div>
          <div className="text-sm text-viz-text-secondary px-1">
            <p>This SQL query was generated based on your natural language request.</p>
          </div>
        </div>
      );
    }

    if (activeTab === 'charts') {
      if (chartData?.chartScript) {
        return (
          <div
            id="chart-container"
            className="w-full h-full flex items-center justify-center"
            style={{ minHeight: '350px', height: '60vh', maxHeight: '600px', padding: 0, margin: 0 }}
          >
            {/* Canvas will be injected here for the chart script to use */}
          </div>
        );
      } else {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <BarChartIcon className="w-6 h-6 text-viz-text-secondary mb-2" />
            <span className="text-viz-text-secondary mb-4">No chart available for this query yet.</span>
          </div>
        );
      }
    }

    return null;
  };

  return (
    <div className="animate-fade-in py-6">
      {getContent()}
    </div>
  );
};

export default TabContent;
