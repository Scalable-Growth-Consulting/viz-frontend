import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PieController,
  BarController,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import type { ChartType, ChartData, ChartOptions } from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PieController,
  BarController,
  LineController,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

interface ChartComponentProps {
  chartData: any;
  onUpdate?: (data: any) => void;
  isChartLoading?: boolean;
  className?: string;
}

const ChartComponent: React.FC<ChartComponentProps> = ({
  chartData,
  onUpdate,
  isChartLoading = false,
  className = ''
}) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<ChartJS | null>(null);

  // Initialize or update chart when chartData changes
  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Destroy previous chart instance if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    try {
      // Parse the chart configuration from chartData
      let config;
      if (typeof chartData === 'string') {
        config = JSON.parse(chartData);
      } else if (typeof chartData === 'object') {
        config = chartData;
      } else {
        throw new Error('Invalid chart data format');
      }

      // Create new chart instance
      chartInstance.current = new ChartJS(ctx, {
        type: config.type || 'bar', // Default to bar chart if type not specified
        data: config.data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top' as const,
              labels: {
                color: 'rgba(156, 163, 175, 1)' // text-gray-400
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              backgroundColor: 'rgba(17, 24, 39, 0.9)', // bg-gray-900/90
              titleColor: 'rgba(255, 255, 255, 1)',
              bodyColor: 'rgba(209, 213, 219, 1)', // text-gray-300
              borderColor: 'rgba(55, 65, 81, 1)', // border-gray-700
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              usePointStyle: true
            }
          },
          scales: {
            x: {
              grid: {
                color: 'rgba(55, 65, 81, 0.3)' // border-gray-700/30
              },
              ticks: {
                color: 'rgba(156, 163, 175, 1)' // text-gray-400
              }
            },
            y: {
              grid: {
                color: 'rgba(55, 65, 81, 0.3)' // border-gray-700/30
              },
              ticks: {
                color: 'rgba(156, 163, 175, 1)' // text-gray-400
              }
            }
          },
          ...(config.options || {}) // Merge with any provided options
        }
      });
    } catch (error) {
      console.error('Error rendering chart:', error);
    }

    // Cleanup function to destroy chart on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [chartData]);

  // Handle loading state
  if (isChartLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-viz-accent mb-3"></div>
        <p className="text-slate-500 dark:text-viz-text-secondary text-sm mt-2">Generating chart...</p>
      </div>
    );
  }

  // Handle no data state
  if (!chartData) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
        <svg
          className="w-12 h-12 text-slate-400 dark:text-viz-text-secondary mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-slate-500 dark:text-viz-text-secondary">No chart data available</p>
        <p className="text-slate-400 dark:text-viz-text-secondary/70 text-sm mt-1">
          The AI response didn't include any chart data
        </p>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full min-h-[300px] ${className}`}>
      <canvas ref={chartRef} className="w-full h-full" />
    </div>
  );
};

export default ChartComponent;
