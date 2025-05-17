
import React from 'react';
import { BarChartIcon, LightbulbIcon } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-viz-dark text-white py-4 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-3">
        <div className="bg-black p-2 rounded-lg">
          <div className="relative">
            <span className="text-2xl font-bold tracking-tight">V</span>
            <BarChartIcon className="absolute -bottom-1 -right-1 text-viz-accent w-4 h-4" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Viz</h1>
          <p className="text-xs text-viz-text-secondary">Business Intelligence AI</p>
        </div>
      </div>
      <div className="flex items-center">
        <button className="flex items-center space-x-1 bg-viz-medium hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all">
          <LightbulbIcon className="w-4 h-4 text-viz-accent" />
          <span className="text-sm font-medium">Tips</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
