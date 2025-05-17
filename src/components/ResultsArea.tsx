
import React from 'react';
import { FileTextIcon, DatabaseIcon, BarChartIcon } from 'lucide-react';
import TabContent from './TabContent';

interface ResultsAreaProps {
  queryResult: string | null;
  activeTab: 'answer' | 'sql' | 'charts';
  onTabChange: (tab: 'answer' | 'sql' | 'charts') => void;
}

const ResultsArea: React.FC<ResultsAreaProps> = ({ queryResult, activeTab, onTabChange }) => {
  return (
    <div className="viz-card h-full flex flex-col">
      <div className="border-b border-slate-200 dark:border-viz-light">
        <div className="flex">
          <button
            className={activeTab === 'answer' ? 'viz-tab-active' : 'viz-tab'}
            onClick={() => onTabChange('answer')}
          >
            <span className="flex items-center">
              <FileTextIcon className="w-4 h-4 mr-2" />
              Answer
            </span>
          </button>
          <button
            className={activeTab === 'sql' ? 'viz-tab-active' : 'viz-tab'}
            onClick={() => onTabChange('sql')}
          >
            <span className="flex items-center">
              <DatabaseIcon className="w-4 h-4 mr-2" />
              SQL
            </span>
          </button>
          <button
            className={activeTab === 'charts' ? 'viz-tab-active' : 'viz-tab'}
            onClick={() => onTabChange('charts')}
          >
            <span className="flex items-center">
              <BarChartIcon className="w-4 h-4 mr-2" />
              Charts
            </span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <TabContent activeTab={activeTab} queryResult={queryResult} />
      </div>
    </div>
  );
};

export default ResultsArea;
