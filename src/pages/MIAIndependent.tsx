import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, Brain, Zap, Search, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import MIADashboard from '@/modules/MIA/components/MIADashboard';
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';
import CreativeLabs from '@/modules/MIA/components/CreativeLabs';
import MIAAccessGuard from '@/components/mia/MIAAccessGuard';
import BrandlenzDashboardSimple from '@/modules/Brandlenz/components/BrandlenzDashboardSimple';

type ActiveTab = 'core' | 'seo-geo' | 'brandlenz' | 'creative';

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
    } else if (path.includes('/mia/brandlenz')) {
      setActiveTab('brandlenz');
    } else if (path.includes('/mia/creative')) {
      setActiveTab('creative');
    } else {
      setActiveTab('core');
    }
  }, [location.pathname]);

  // Update URL when tab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'seo-geo') {
      navigate('/mia/seo-geo', { replace: true });
    } else if (tab === 'brandlenz') {
      navigate('/mia/brandlenz', { replace: true });
    } else if (tab === 'creative') {
      navigate('/mia/creative', { replace: true });
    } else {
      navigate('/mia', { replace: true });
    }
  };

  return (
    <MIAAccessGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
        <TopNav zone="mia" showData={false} />

        <div className="flex flex-1 overflow-hidden">
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
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'core' ? 'bg-white/20' : 'bg-purple-500/10'
                  }`}
                >
                  <Target
                    className={`w-5 h-5 ${activeTab === 'core' ? 'text-white' : 'text-purple-500'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">MIA Core</div>
                  {activeTab === 'core' && (
                    <div className="text-sm text-white/85 line-clamp-2">Marketing Dashboard & Analytics</div>
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
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'seo-geo' ? 'bg-white/20' : 'bg-violet-500/10'
                  }`}
                >
                  <Search
                    className={`w-5 h-5 ${activeTab === 'seo-geo' ? 'text-white' : 'text-violet-500'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">SEO-GEO Tool</div>
                  {activeTab === 'seo-geo' && (
                    <div className="text-sm text-white/85 line-clamp-2">Advanced SEO & GEO Optimization</div>
                  )}
                </div>
                {activeTab === 'seo-geo' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              {/* Creative Labs Tab */}
              <button
                onClick={() => handleTabChange('creative')}
                className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                  activeTab === 'creative'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-md border-transparent'
                    : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'creative' ? 'bg-white/20' : 'bg-pink-500/10'
                  }`}
                >
                  <Zap className={`w-5 h-5 ${activeTab === 'creative' ? 'text-white' : 'text-pink-500'}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Creative Labs</div>
                </div>
                {activeTab === 'creative' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              {/* Brandlenz Tab - FIXED */}
              <button
                onClick={() => handleTabChange('brandlenz')}
                className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                  activeTab === 'brandlenz'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md border-transparent'
                    : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'brandlenz' ? 'bg-white/20' : 'bg-indigo-500/10'
                  }`}
                >
                  <Sparkles
                    className={`w-5 h-5 ${activeTab === 'brandlenz' ? 'text-white' : 'text-indigo-500'}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">Brandlenz</div>
                  {activeTab === 'brandlenz' && (
                    <div className="text-sm text-white/85 line-clamp-2">Social Listening & Brand Intelligence</div>
                  )}
                </div>
                {activeTab === 'brandlenz' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white/50 dark:bg-viz-dark/50">
            {/* Mobile Tabs */}
            <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200/50 dark:border-viz-light/20">
              <div className="flex gap-2 p-2 overflow-x-auto">
                <button
                  onClick={() => handleTabChange('core')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'core'
                      ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  MIA Core
                </button>
                <button
                  onClick={() => handleTabChange('seo-geo')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'seo-geo'
                      ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  SEO-GEO
                </button>
                <button
                  onClick={() => handleTabChange('creative')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'creative'
                      ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  Creative
                </button>
                <button
                  onClick={() => handleTabChange('brandlenz')}
                  className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'brandlenz'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow'
                      : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                  }`}
                >
                  Brandlenz
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
                <div className="h-full w-full overflow-auto">
                  <div className="min-h-full p-4 sm:p-6 lg:p-8">
                    <div className="max-w-6xl mx-auto space-y-8">
                      <div className="text-center space-y-6">
                        <div className="flex items-center justify-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg">
                            <Brain className="w-8 h-8 text-white" />
                          </div>
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                            <Zap className="w-8 h-8 text-white" />
                          </div>
                        </div>

                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                          Master SEO and GEO
                        </h1>

                        <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-violet-500/10 to-purple-500/10 backdrop-blur-sm border border-violet-200/20 dark:border-purple-400/20 rounded-full">
                          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-violet-400" />
                          <span className="text-sm sm:text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                            Generative Engine Optimization
                          </span>
                        </div>

                        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                          Master-level SEO analysis with cutting-edge generative engine optimization.
                          <span className="font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                            {' '}Dominate search rankings with precision insights.
                          </span>
                        </p>
                      </div>

                      <div className="w-full">
                        <SEOGeoChecker />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'brandlenz' && (
                <div className="h-full w-full">
                  <BrandlenzDashboardSimple />
                </div>
              )}
              {activeTab === 'creative' && (
                <div className="h-full w-full">
                  <CreativeLabs userId={user?.id || ''} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <GlobalFooter variant="mia" />
    </MIAAccessGuard>
  );
};

export default MIAIndependent;
