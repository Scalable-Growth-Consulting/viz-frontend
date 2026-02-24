import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Target, Brain, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import MIADashboard from '@/modules/MIA/components/MIADashboard';
import CreativeLabs from '@/modules/MIA/components/CreativeLabs';
import MIAAccessGuard from '@/components/mia/MIAAccessGuard';
import BrandlenzDashboardSimple from '@/modules/Brandlenz/components/BrandlenzDashboardSimple';
import {
  MIACoreComingSoon,
  CreativeLabsComingSoon,
  BrandlenzComingSoon,
} from '@/modules/MIA/components/MIAComingSoonExperiences';

type ActiveTab = 'core' | 'brandlenz' | 'creative';

const MIAIndependent: React.FC = () => {
  const { user } = useAuth();
  const isPremium = hasPremiumAccess(user);
  const isRestrictedUser = !isPremium;
  const [activeTab, setActiveTab] = useState<ActiveTab>('core');
  const navigate = useNavigate();
  const location = useLocation();

  // Handle deep linking
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/mia/brandlenz')) {
      setActiveTab('brandlenz');
    } else if (path.includes('/mia/creative')) {
      setActiveTab('creative');
    } else if (path.includes('/mia')) {
      setActiveTab('core');
    } else {
      setActiveTab('core');
    }
  }, [location.pathname]);

  // Update URL when tab changes
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'brandlenz') {
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
                  {isRestrictedUser && (
                    <div
                      className={`mt-1 text-xs font-semibold ${
                        activeTab === 'core' ? 'text-white/85' : 'text-purple-500'
                      }`}
                    >
                      Coming Soon
                    </div>
                  )}
                </div>
                {activeTab === 'core' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
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
                  {isRestrictedUser && (
                    <div
                      className={`mt-1 text-xs font-semibold ${
                        activeTab === 'creative' ? 'text-white/85' : 'text-pink-500'
                      }`}
                    >
                      Coming Soon
                    </div>
                  )}
                </div>
                {activeTab === 'creative' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              {/* Brandlenz Tab */}
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
                  {isRestrictedUser && (
                    <div
                      className={`mt-1 text-xs font-semibold ${
                        activeTab === 'brandlenz' ? 'text-white/85' : 'text-indigo-500'
                      }`}
                    >
                      Coming Soon
                    </div>
                  )}
                </div>
                {activeTab === 'brandlenz' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </button>

              {/* Guidance to VEE */}
              <div className="space-y-3">
                <div className="px-4 py-3.5 rounded-xl border border-dashed border-slate-200/70 dark:border-viz-light/20 bg-white/60 dark:bg-viz-dark/40">
                  <div className="text-sm font-semibold text-slate-700 dark:text-white mb-1">Need SEO, Reddit or Trend Intelligence?</div>
                  <p className="text-xs text-slate-500 dark:text-viz-text-secondary">Explore the new Visibility Enhancement Engine (VEE) for SEO-GEO, Reddit CoPilot, and Keyword & Trend experiences.</p>
                  <button
                    onClick={() => navigate('/vee/seo-geo')}
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-500"
                  >
                    Go to VEE →
                  </button>
                </div>
              </div>
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
                  {isRestrictedUser ? (
                    <MIACoreComingSoon />
                  ) : (
                    <MIADashboard userId={user?.id || ''} />
                  )}
                </div>
              )}
              {activeTab === 'brandlenz' && (
                <div className="h-full w-full">
                  {isRestrictedUser ? <BrandlenzComingSoon /> : <BrandlenzDashboardSimple />}
                </div>
              )}
              {activeTab === 'creative' && (
                <div className="h-full w-full">
                  {isRestrictedUser ? <CreativeLabsComingSoon /> : <CreativeLabs userId={user?.id || ''} />}
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
