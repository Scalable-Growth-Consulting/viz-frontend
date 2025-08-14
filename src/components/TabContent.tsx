import React, { useEffect } from 'react';
import { FileTextIcon, DatabaseIcon, BarChartIcon } from 'lucide-react';
import { ChartData } from '../types/data';

interface TabContentProps {
  activeTab: 'answer' | 'sql' | 'charts';
  queryResult: string | null;
  sqlQuery: string | null;
  chartData: ChartData | null;
}

const CHART_LIB_SRCS = [
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-annotation',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels',
  'https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom',
  'https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js',
];

const hardCleanupAllCharts = () => {
  // 1) Destroy Chart.js instances (if present)
  try {
    const w = window as unknown as { Chart?: any };
    if (w.Chart?.instances) {
      const instances = Array.isArray(w.Chart.instances)
        ? w.Chart.instances
        : Object.values(w.Chart.instances);
      instances.forEach((inst: any) => inst?.destroy?.());
    }
  } catch {
    /* ignore */
  }

  // 2) Remove any canvas#myChart ANYWHERE in the document
  document.querySelectorAll('#myChart, canvas#myChart').forEach((el) => {
    // remove inline sizing first (prevents layout jumps)
    (el as HTMLElement).style.removeProperty('height');
    (el as HTMLElement).style.removeProperty('width');
    el.remove();
  });

  // 3) Remove helper nodes that Chart.js injects
  document.querySelectorAll('.chartjs-size-monitor, .chartjs-render-monitor').forEach((el) => el.remove());

  // 4) Remove any stray containers we might have marked
  document.querySelectorAll('[data-dufa="chart-root"]').forEach((el) => el.remove());

  // 5) Remove any generated scripts we injected inside the container
  document.querySelectorAll('script[data-dufa="chart-generated"]').forEach((s) => s.remove());

  // 6) Optional: strip styles that explicitly target our ids
  document.querySelectorAll('style').forEach((styleEl) => {
    const text = styleEl.textContent || '';
    if (/#chart-container|#myChart/.test(text)) {
      styleEl.remove();
    }
  });
};

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  queryResult,
  sqlQuery,
  chartData,
}) => {
  useEffect(() => {
    const container = document.getElementById('chart-container');

    // ---------- RENDER only when Charts tab is active ----------
    if (activeTab === 'charts' && chartData?.chartScript && container) {
      // Make sure container is visible and clean
      container.style.display = 'block';
      container.style.removeProperty('height');
      container.style.removeProperty('min-height');
      container.style.removeProperty('max-height');
      container.style.removeProperty('margin');
      container.style.removeProperty('padding');
      container.textContent = '';

      // Create a local root inside the container to keep everything scoped
      const root = document.createElement('div');
      root.setAttribute('data-dufa', 'chart-root');
      root.style.width = '100%';
      container.appendChild(root);

      // Create canvas WITHOUT setting height so it won't reserve space later
      const canvas = document.createElement('canvas');
      canvas.id = 'myChart';
      canvas.style.width = '100%';
      root.appendChild(canvas);

      const injectScript = (src: string) =>
        new Promise<void>((resolve, reject) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
          }
          const s = document.createElement('script');
          s.src = src;
          s.async = false;
          s.setAttribute('data-dufa', 'chart-lib');
          s.onload = () => resolve();
          s.onerror = () => reject(new Error(`Failed to load ${src}`));
          document.head.appendChild(s);
        });

      const injectStyle = (href: string) => {
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = href;
          link.setAttribute('data-dufa', 'chart-style');
          document.head.appendChild(link);
        }
      };

      injectStyle('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&display=swap');

      const match = chartData.chartScript.match(/<script>([\s\S]*?)<\/script>/i);
      const jsCode = match ? match[1] : chartData.chartScript;

      (async () => {
        try {
          for (const lib of CHART_LIB_SRCS) {
            await injectScript(lib);
          }
          const scriptElement = document.createElement('script');
          scriptElement.type = 'text/javascript';
          scriptElement.innerHTML = jsCode;
          scriptElement.setAttribute('data-dufa', 'chart-generated');
          root.appendChild(scriptElement);
        } catch (err) {
          console.error('Error loading chart libraries or script:', err);
        }
      })();
    }

    // ---------- CLEANUP on any tab change ----------
    return () => {
      // First, collapse and clear the known container (if it exists)
      const cleanupContainer = document.getElementById('chart-container');
      if (cleanupContainer) {
        cleanupContainer.innerHTML = '';
        cleanupContainer.style.display = 'none';
        cleanupContainer.style.height = '0';
        cleanupContainer.style.minHeight = '0';
        cleanupContainer.style.maxHeight = '0';
        cleanupContainer.style.margin = '0';
        cleanupContainer.style.padding = '0';
      }

      // Then do a HARD cleanup across the whole document
      hardCleanupAllCharts();

      // Optional: remove globally injected chart libs (keeps DOM clean)
      document
        .querySelectorAll('script[data-dufa="chart-lib"]')
        .forEach((s) => s.parentElement?.removeChild(s));
    };
  }, [activeTab, chartData]);

  const getContent = () => {
    // Empty state
    if (!queryResult && !sqlQuery) {
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

    // Answer
    if (activeTab === 'answer') {
      return <div className="prose dark:prose-invert max-w-none">{queryResult}</div>;
    }

    // SQL
    if (activeTab === 'sql') {
      if (!sqlQuery) {
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <DatabaseIcon className="w-6 h-6 text-viz-text-secondary mb-2" />
            <span className="text-viz-text-secondary mb-4">No SQL query available yet.</span>
          </div>
        );
      }

      return (
        <div className="space-y-4">
          <div className="bg-viz-dark p-4 rounded-lg overflow-x-auto text-viz-text">
            <div className="flex items-center mb-2 text-viz-text-secondary text-sm">
              <DatabaseIcon className="w-4 h-4 mr-2" />
              <span>SQL Query</span>
            </div>
            <pre className="whitespace-pre-wrap">
              <code className="text-viz-accent">{sqlQuery}</code>
            </pre>
          </div>
          <div className="text-sm text-viz-text-secondary px-1">
            <p>This SQL query was generated based on your natural language request.</p>
          </div>
        </div>
      );
    }

    // Charts
    if (activeTab === 'charts') {
      if (chartData?.chartScript) {
        return (
          <div
            id="chart-container"
            className="w-full"
            // no fixed heights — we keep it flexible
          />
        );
      }
      return (
        <div className="flex flex-col items-center justify-center py-8">
          <BarChartIcon className="w-6 h-6 text-viz-text-secondary mb-2" />
          <span className="text-viz-text-secondary mb-4">No chart available for this query yet.</span>
        </div>
      );
    }

    return null;
  };

  return <div className="animate-fade-in py-6">{getContent()}</div>;
};

export default TabContent;
