
import React from 'react';
import { FileTextIcon, DatabaseIcon, ChartBarIcon } from 'lucide-react';
import TabContent from './TabContent';
import Loader from './ui/loader';

interface ResultsAreaProps {
  queryResult: string | null;
  activeTab: 'answer' | 'sql' | 'charts';
  onTabChange: (tab: 'answer' | 'sql' | 'charts') => void;
  isLoading?: boolean;
  isChartLoading?: boolean;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ 
  queryResult, 
  activeTab, 
  onTabChange, 
  isLoading = false,
  isChartLoading = false
}) => {
  // Determine if we should show a loader based on the current tab
  const showLoader = isLoading || (activeTab === 'charts' && isChartLoading);
  
  return (
    <div className="viz-card h-full flex flex-col bg-white/80 dark:bg-viz-medium/90 backdrop-blur-sm shadow-lg border border-slate-100 dark:border-viz-light/20 rounded-2xl overflow-hidden animate-fade-in">
      <div className="border-b border-slate-100 dark:border-viz-light/20">
        <div className="flex">
          <button
            className={activeTab === 'answer' ? 'viz-tab-active' : 'viz-tab'}
            onClick={() => onTabChange('answer')}
            disabled={isLoading}
          >
            <span className="flex items-center">
              <FileTextIcon className="w-4 h-4 mr-2" />
              Answer
            </span>
          </button>
          <button
            className={activeTab === 'sql' ? 'viz-tab-active' : 'viz-tab'}
            onClick={() => onTabChange('sql')}
            disabled={isLoading}
          >
            <span className="flex items-center">
              <DatabaseIcon className="w-4 h-4 mr-2" />
              SQL
            </span>
          </button>
          <button
            className={activeTab === 'charts' ? 'viz-tab-active' : 'viz-tab'}
            onClick={() => onTabChange('charts')}
            disabled={isLoading}
          >
            <span className="flex items-center">
              <ChartBarIcon className="w-4 h-4 mr-2" />
              Charts
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5 md:p-6">
        {showLoader ? (
          <div className="flex items-center justify-center h-full">
            <Loader 
              size="md" 
              text={activeTab === 'charts' && isChartLoading ? "Generating charts..." : "Analyzing your data..."}
            />
          </div>
        ) : (
          <TabContent activeTab={activeTab} queryResult={queryResult} />
        )}
      </div>
    </div>
  );
};

export default ResultsArea;
