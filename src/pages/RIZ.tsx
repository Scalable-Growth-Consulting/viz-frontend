import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TrendingUp, BarChart as BarChartIcon, Target, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';
import DUFA from './DUFA';
import DUFAAccessGuard from '@/components/dufa/DUFAAccessGuard';
import InventorySuite from './InventorySuite';
import InventoryAccessGuard from '@/components/inventory/InventoryAccessGuard';
import Brandlenz from './Brandlenz';

type ActiveTab = 'dufa' | 'inventory' | 'brandlenz';

const RIZ: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dufa');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Don't show data section in RIZ zone
  const showDataSection = false;

  // Handle deep linking
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/riz/inventory')) {
      setActiveTab('inventory');
    } else if (path.includes('/riz/dufa')) {
      setActiveTab('dufa');
    } else if (path.includes('/riz/brandlenz')) {
      setActiveTab('brandlenz');
    }
  }, [location.pathname]);

  // Update URL when tab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    navigate(`/riz/${tab}`, { replace: true });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <TopNav zone="riz" showData={false} />
      <div className="flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Left Sidebar - Vertical Tabs */}
        <div className="hidden md:flex w-72 bg-white/85 dark:bg-viz-medium/85 backdrop-blur-sm border-r border-slate-200/50 dark:border-viz-light/20 flex-col flex-shrink-0">
          <div className="p-5 border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-viz-dark dark:text-white">Retail Intelligence</h2>
              <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Specialized AI Agents</p>
            </div>
          </div>
          
          <nav className="flex-1 p-5 space-y-3">
            {/* DUFA Tab (first) */}
            <button
              onClick={() => handleTabChange('dufa')}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                activeTab === 'dufa'
                  ? 'bg-gradient-to-r from-viz-accent to-blue-600 text-white shadow-md border-transparent'
                  : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'dufa' 
                  ? 'bg-white/20' 
                  : 'bg-viz-accent/10'
              }`}>
                <TrendingUp className={`w-5 h-5 ${
                  activeTab === 'dufa' ? 'text-white' : 'text-viz-accent'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">DUFA</div>
                {activeTab === 'dufa' && (
                  <div className="text-sm text-white/85 line-clamp-2">
                    Demand Understanding & Forecasting Agent
                  </div>
                )}
              </div>
              {activeTab === 'dufa' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            {/* Inventory Tab (third, label as IIA) */}
            <button
              onClick={() => handleTabChange('inventory')}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md border-transparent'
                  : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'inventory' 
                  ? 'bg-white/20' 
                  : 'bg-emerald-500/10'
              }`}>
                <BarChartIcon className={`w-5 h-5 ${
                  activeTab === 'inventory' ? 'text-white' : 'text-emerald-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">IIA</div>
                {activeTab === 'inventory' && (
                  <div className="text-sm text-white/85 line-clamp-2">
                    Inventory Insight Agent
                  </div>
                )}
              </div>
              {activeTab === 'inventory' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            {/* Brandlenz Tab (fourth) */}
            <button
              onClick={() => handleTabChange('brandlenz')}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                activeTab === 'brandlenz'
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md border-transparent'
                  : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'brandlenz' 
                  ? 'bg-white/20' 
                  : 'bg-violet-600/10'
              }`}>
                <Zap className={`w-5 h-5 ${
                  activeTab === 'brandlenz' ? 'text-white' : 'text-violet-600'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Brandlenz</div>
                {activeTab === 'brandlenz' && (
                  <div className="text-sm text-white/85 line-clamp-2">
                    AI Brand Intelligence & Social Listening
                  </div>
                )}
              </div>
              {activeTab === 'brandlenz' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/50 dark:border-viz-light/20">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-sm text-slate-600 dark:text-viz-text-secondary hover:text-viz-accent transition-colors"
            >
              <span>← Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white/50 dark:bg-viz-dark/50">
          {/* Mobile Tabs (DUFA, IIA, Brandlenz) */}
          <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="px-4 py-2 grid grid-cols-3 gap-2">
              <button
                onClick={() => handleTabChange('dufa')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'dufa'
                    ? 'bg-gradient-to-r from-viz-accent to-blue-600 text-white shadow'
                    : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                DUFA
              </button>
              <button
                onClick={() => handleTabChange('inventory')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow'
                    : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                IIA
              </button>
              <button
                onClick={() => handleTabChange('brandlenz')}
                className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'brandlenz'
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow'
                    : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                Brandlenz
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 md:p-6">
            {activeTab === 'dufa' && (
              <DUFAAccessGuard>
                <div className="h-full w-full">
                  <DUFA showTopNav={false} />
                </div>
              </DUFAAccessGuard>
            )}
            {activeTab === 'inventory' && (
              <InventoryAccessGuard>
                <div className="h-full w-full">
                  <InventorySuite showHeader={false} />
                </div>
              </InventoryAccessGuard>
            )}
            {activeTab === 'brandlenz' && (
              <div className="h-full w-full">
                <Brandlenz showHeader={false} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RIZ;
