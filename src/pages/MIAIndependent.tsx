import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Target, Brain, Zap, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';
import MIADashboard from '@/modules/MIA/components/MIADashboard';
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';
import MIAAccessGuard from '@/components/mia/MIAAccessGuard';

type ActiveTab = 'core' | 'seo-geo';

const MIAIndependent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('core');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle deep linking
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/mia/seo-geo') || path.includes('/seo-geo-ai-tool')) {
      setActiveTab('seo-geo');
    } else {
      setActiveTab('core');
    }
  }, [location.pathname]);

  // Update URL when tab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'seo-geo') {
      navigate('/mia/seo-geo', { replace: true });
    } else {
      navigate('/mia', { replace: true });
    }
  };

  return (
    <MIAAccessGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
        <TopNav zone="mia" showData={false} />
        <div className="flex h-[calc(100vh-73px)] overflow-hidden">
          {/* Left Sidebar - Vertical Tabs */}
          <div className="hidden md:flex w-72 bg-white/85 dark:bg-viz-medium/85 backdrop-blur-sm border-r border-slate-200/50 dark:border-viz-light/20 flex-col flex-shrink-0">
            <div className="p-5 border-b border-slate-200/50 dark:border-viz-light/20">
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-lg font-semibold text-viz-dark dark:text-white">Marketing Intelligence</h2>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">AI-Powered Marketing Suite</p>
              </div>
            </div>
            
            <nav className="flex-1 p-5 space-y-3">
              {/* MIA Core Tab */}
              <button
                onClick={() => handleTabChange('core')}
                className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                  activeTab === 'core'
                    ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md border-transparent'
                    : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === 'core' 
                    ? 'bg-white/20' 
                    : 'bg-purple-500/10'
                }`}>
                  <Target className={`w-5 h-5 ${
                    activeTab === 'core' ? 'text-white' : 'text-purple-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">MIA Core</div>
                  {activeTab === 'core' && (
                    <div className="text-sm text-white/85 line-clamp-2">
                      Marketing Dashboard & Analytics
                    </div>
                  )}
                </div>
                {activeTab === 'core' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              {/* SEO-GEO Tool Tab */}
              <button
                onClick={() => handleTabChange('seo-geo')}
                className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                  activeTab === 'seo-geo'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-md border-transparent'
                    : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === 'seo-geo' 
                    ? 'bg-white/20' 
                    : 'bg-violet-500/10'
                }`}>
                  <Search className={`w-5 h-5 ${
                    activeTab === 'seo-geo' ? 'text-white' : 'text-violet-500'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">SEO-GEO Tool</div>
                  {activeTab === 'seo-geo' && (
                    <div className="text-sm text-white/85 line-clamp-2">
                      Advanced SEO & GEO Optimization
                    </div>
                  )}
                </div>
                {activeTab === 'seo-geo' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200/50 dark:border-viz-light/20">
              <Link 
                to="/" 
                className="flex items-center space-x-2 text-sm text-slate-600 dark:text-viz-text-secondary hover:text-purple-500 transition-colors"
              >
                <span>← Back to Home</span>
              </Link>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white/50 dark:bg-viz-dark/50">
            {/* Mobile Tabs */}
            <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/50 dark:border-viz-light/20">
              <div className="px-4 py-2 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleTabChange('core')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'core'
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  MIA Core
                </button>
                <button
                  onClick={() => handleTabChange('seo-geo')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'seo-geo'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  SEO-GEO Tool
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
              {activeTab === 'core' && (
                <div className="h-full w-full">
                  <MIADashboard userId={user?.id || ''} />
                </div>
              )}
              {activeTab === 'seo-geo' && (
                <div className="h-full w-full p-4 md:p-6">
                  <div className="max-w-7xl mx-auto">
                    <div className="mb-8 text-center">
                      <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                          <Brain className="w-8 h-8 text-white" />
                        </div>
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                          <Zap className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 tracking-tight">
                        Master SEO and GEO
                      </h1>
                      
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-sm border border-violet-200/20 dark:border-purple-400/20 rounded-full mb-4">
                        <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                        <span className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          Generative Engine Optimization
                        </span>
                      </div>
                      
                      <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Master-level SEO analysis with cutting-edge generative engine optimization. 
                        <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                          Dominate search rankings with precision insights.
                        </span>
                      </p>
                    </div>
                    
                    <SEOGeoChecker />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="w-full border-t border-black/5 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 text-sm flex items-center justify-center gap-6 text-slate-600 dark:text-slate-300">
                <Link to="/mia/privacy" className="hover:text-purple-500 transition-colors">Privacy Policy</Link>
                <span className="text-slate-400">•</span>
                <Link to="/mia/terms" className="hover:text-purple-500 transition-colors">Terms of Service</Link>
                <span className="text-slate-400">•</span>
                <Link to="/mia/data-deletion" className="hover:text-purple-500 transition-colors">Data Deletion Policy</Link>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </MIAAccessGuard>
  );
};

export default MIAIndependent;
