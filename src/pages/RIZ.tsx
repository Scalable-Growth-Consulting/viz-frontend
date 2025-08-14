import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { TrendingUp, BarChart as BarChartIcon, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';
import DUFA from './DUFA';
import MIA from './MIA';
import DUFAAccessGuard from '@/components/dufa/DUFAAccessGuard';
import MIAAccessGuard from '@/components/mia/MIAAccessGuard';

type ActiveTab = 'dufa' | 'mia';

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
    if (path.includes('/riz/mia')) {
      setActiveTab('mia');
    } else if (path.includes('/riz/dufa')) {
      setActiveTab('dufa');
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
        <div className="w-64 bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-r border-slate-200/50 dark:border-viz-light/20 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-viz-dark dark:text-white">Retail Intelligence</h2>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Specialized AI Agents</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {/* DUFA Tab */}
            <button
              onClick={() => handleTabChange('dufa')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                activeTab === 'dufa'
                  ? 'bg-gradient-to-r from-viz-accent to-blue-600 text-white shadow-lg'
                  : 'bg-white/50 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white/70 dark:hover:bg-viz-dark/70 hover:text-viz-dark dark:hover:text-white'
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
                <div className={`text-sm ${
                  activeTab === 'dufa' ? 'text-white/80' : 'text-slate-500 dark:text-viz-text-secondary'
                }`}>
                  Demand Understanding & Forecasting Agent
                </div>
              </div>
              {activeTab === 'dufa' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>

            {/* MIA Tab */}
            <button
              onClick={() => handleTabChange('mia')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                activeTab === 'mia'
                  ? 'bg-gradient-to-r from-pink-500 to-viz-accent text-white shadow-lg'
                  : 'bg-white/50 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white/70 dark:hover:bg-viz-dark/70 hover:text-viz-dark dark:hover:text-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                activeTab === 'mia' 
                  ? 'bg-white/20' 
                  : 'bg-pink-500/10'
              }`}>
                <Target className={`w-5 h-5 ${
                  activeTab === 'mia' ? 'text-white' : 'text-pink-500'
                }`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">MIA</div>
                <div className={`text-sm ${
                  activeTab === 'mia' ? 'text-white/80' : 'text-slate-500 dark:text-viz-text-secondary'
                }`}>
                  Marketing Intelligence Agent
                </div>
              </div>
              {activeTab === 'mia' && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
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
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'dufa' && (
              <DUFAAccessGuard>
                <div className="h-full w-full">
                  <DUFA showTopNav={false} />
                </div>
              </DUFAAccessGuard>
            )}
            {activeTab === 'mia' && (
              <MIAAccessGuard>
                <div className="h-full w-full">
                  <MIA showHeader={false} />
                </div>
              </MIAAccessGuard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RIZ;
