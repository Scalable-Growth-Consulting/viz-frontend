
import React from 'react';
import { BarChartIcon, LightbulbIcon, DatabaseIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-viz-dark text-white py-4 px-6 flex justify-between items-center shadow-md">
      <Link to="/" className="flex items-center space-x-3">
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
      </Link>
      <div className="flex items-center space-x-3">
        <Link to="/data-control" className="flex items-center space-x-1 bg-viz-medium hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all">
          <DatabaseIcon className="w-4 h-4 text-viz-accent" />
          <span className="text-sm font-medium">Data</span>
        </Link>
        <Link to="/tips" className="flex items-center space-x-1 bg-viz-medium hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all">
          <LightbulbIcon className="w-4 h-4 text-viz-accent" />
          <span className="text-sm font-medium">Tips</span>
        </Link>
        <Link to="/login" className="flex items-center space-x-1 bg-viz-medium hover:bg-viz-light px-2 py-1.5 rounded-lg transition-all">
          <UserIcon className="w-4 h-4 text-white" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
