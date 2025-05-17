
import React from 'react';
import { FileTextIcon, DatabaseIcon, BarChartIcon } from 'lucide-react';

interface TabContentProps {
  activeTab: 'answer' | 'sql' | 'charts';
  queryResult: string | null;
}

const TabContent: React.FC<TabContentProps> = ({ activeTab, queryResult }) => {
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
        <pre className="bg-viz-dark p-4 rounded-lg overflow-x-auto text-viz-text whitespace-pre-wrap">
          <code>{queryResult}</code>
        </pre>
      );
    }

    if (activeTab === 'charts') {
      return (
        <div className="p-4">
          <p className="text-center text-viz-text-secondary mb-4">Charts visualization would appear here</p>
          <div className="aspect-video bg-viz-medium/50 rounded-lg flex items-center justify-center">
            <BarChartIcon className="w-16 h-16 text-viz-accent/50" />
          </div>
        </div>
      );
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
