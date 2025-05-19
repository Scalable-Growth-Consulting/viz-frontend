
import React from 'react';
import { BarChartIcon, LightbulbIcon, DatabaseIcon, UserIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white/10 dark:bg-viz-dark/70 backdrop-blur-lg border-b border-slate-200/20 dark:border-viz-light/10 py-3 px-4 md:px-6 flex justify-between items-center shadow-sm">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="bg-black p-2 rounded-lg shadow-md group-hover:shadow-viz-accent/20 transition-all duration-300 group-hover:scale-105">
          <div className="relative">
            <span className="text-2xl font-bold tracking-tight text-white">V</span>
            <BarChartIcon className="absolute -bottom-1 -right-1 text-viz-accent-light w-4 h-4" />
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-viz-dark dark:text-white">Viz</h1>
          <p className="text-xs text-slate-500 dark:text-viz-text-secondary">Business Intelligence AI</p>
        </div>
      </Link>
      <div className="flex items-center space-x-2 md:space-x-3">
        <Link to="/data-control" className="flex items-center space-x-1 bg-white/20 dark:bg-viz-medium hover:bg-white/30 dark:hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105">
          <DatabaseIcon className="w-4 h-4 text-viz-accent" />
          <span className="text-sm font-medium hidden md:inline text-slate-700 dark:text-white">Data</span>
        </Link>
        <Link to="/tips" className="flex items-center space-x-1 bg-white/20 dark:bg-viz-medium hover:bg-white/30 dark:hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105">
          <LightbulbIcon className="w-4 h-4 text-viz-accent" />
          <span className="text-sm font-medium hidden md:inline text-slate-700 dark:text-white">Tips</span>
        </Link>
        <Link to="/login" className="flex items-center space-x-1 bg-white/20 dark:bg-viz-medium hover:bg-white/30 dark:hover:bg-viz-light px-2 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105">
          <UserIcon className="w-4 h-4 text-slate-700 dark:text-white" />
        </Link>
      </div>
    </header>
  );
};

export default Header;
