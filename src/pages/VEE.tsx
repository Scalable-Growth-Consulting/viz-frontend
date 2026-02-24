import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Search, Target, TrendingUp } from 'lucide-react';

import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import { SEOGeoChecker } from '@/modules/SEO/components/SEOGeoChecker';
import KeywordDiscoveryAgent from '@/pages/KeywordTrend/KeywordDiscoveryAgent';
import TrendAnalysisAgent from '@/pages/KeywordTrend/TrendAnalysisAgent';
import {
  KeywordTrendComingSoon,
} from '@/modules/MIA/components/MIAComingSoonExperiences';


type ActiveTab = 'seo-geo' | 'keyword-agent' | 'trend-agent';

const VEE: React.FC = () => {
  const { user } = useAuth();
  const isPremium = hasPremiumAccess(user);
  const isRestrictedUser = !isPremium;

  const [activeTab, setActiveTab] = useState<ActiveTab>('seo-geo');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path.includes('/vee/keyword-agent')) {
      setActiveTab('keyword-agent');
    } else if (path.includes('/vee/trend-agent')) {
      setActiveTab('trend-agent');
    } else {
      setActiveTab('seo-geo');
    }
  }, [location.pathname]);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'keyword-agent') {
      navigate('/vee/keyword-agent', { replace: true });
    } else if (tab === 'trend-agent') {
      navigate('/vee/trend-agent', { replace: true });
    } else {
      navigate('/vee/seo-geo', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      <TopNav zone="vee" showData={false} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden md:flex w-72 bg-white/85 dark:bg-viz-medium/85 backdrop-blur-sm border-r border-slate-200/50 dark:border-viz-light/20 flex-col">
          <div className="p-5 border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-viz-dark dark:text-white">Visibility Enhancement Engine</h2>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">Own every signal that shapes discovery</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-5 space-y-3">
            <button
              onClick={() => handleTabChange('seo-geo')}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                activeTab === 'seo-geo'
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md border-transparent'
                  : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === 'seo-geo' ? 'bg-white/20' : 'bg-blue-500/10'
                }`}
              >
                <Search className={`w-5 h-5 ${activeTab === 'seo-geo' ? 'text-white' : 'text-blue-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">SEO-GEO Engine</div>
                {activeTab === 'seo-geo' && (
                  <div className="text-sm text-white/85 line-clamp-2">Advanced SEO & GEO optimization</div>
                )}
              </div>
              {activeTab === 'seo-geo' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            <button
              onClick={() => handleTabChange('keyword-agent')}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                activeTab === 'keyword-agent'
                  ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md border-transparent'
                  : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === 'keyword-agent' ? 'bg-white/20' : 'bg-indigo-500/10'
                }`}
              >
                <Target className={`w-5 h-5 ${activeTab === 'keyword-agent' ? 'text-white' : 'text-indigo-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Keyword Agent</div>
                {activeTab === 'keyword-agent' && (
                  <div className="text-sm text-white/85 line-clamp-2">AI-powered keyword discovery</div>
                )}
                {isRestrictedUser && (
                  <div className={`mt-1 text-xs font-semibold ${activeTab === 'keyword-agent' ? 'text-white/85' : 'text-indigo-500'}`}>
                    Premium Preview
                  </div>
                )}
              </div>
              {activeTab === 'keyword-agent' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>

            <button
              onClick={() => handleTabChange('trend-agent')}
              className={`w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all duration-200 text-left ${
                activeTab === 'trend-agent'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md border-transparent'
                  : 'bg-white/60 dark:bg-viz-dark/50 text-slate-700 dark:text-viz-text-secondary hover:bg-white border border-slate-200/60 dark:border-viz-light/20'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  activeTab === 'trend-agent' ? 'bg-white/20' : 'bg-purple-500/10'
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${activeTab === 'trend-agent' ? 'text-white' : 'text-purple-500'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium">Trend Agent</div>
                {activeTab === 'trend-agent' && (
                  <div className="text-sm text-white/85 line-clamp-2">Market momentum & trend analysis</div>
                )}
                {isRestrictedUser && (
                  <div className={`mt-1 text-xs font-semibold ${activeTab === 'trend-agent' ? 'text-white/85' : 'text-purple-500'}`}>
                    Premium Preview
                  </div>
                )}
              </div>
              {activeTab === 'trend-agent' && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-auto bg-white/50 dark:bg-viz-dark/50">
          {/* Mobile Tabs */}
          <div className="md:hidden sticky top-0 z-10 bg-white/80 dark:bg-viz-medium/80 backdrop-blur border-b border-slate-200/50 dark:border-viz-light/20">
            <div className="flex gap-2 p-2 overflow-x-auto">
              <button
                onClick={() => handleTabChange('seo-geo')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'seo-geo'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow'
                    : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                SEO-GEO
              </button>
              <button
                onClick={() => handleTabChange('keyword-agent')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'keyword-agent'
                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow'
                    : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                Keyword Agent
              </button>
              <button
                onClick={() => handleTabChange('trend-agent')}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeTab === 'trend-agent'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow'
                    : 'bg-white dark:bg-viz-dark text-slate-700 dark:text-viz-text-secondary border border-slate-200/60 dark:border-viz-light/20'
                }`}
              >
                Trend Agent
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {activeTab === 'seo-geo' && (
              <div className="min-h-full p-4 sm:p-6 lg:p-8">
                <div className="max-w-6xl mx-auto space-y-8">
                  <div className="text-center space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 backdrop-blur-sm border border-blue-200/20 dark:border-blue-400/20 rounded-full">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                        Visibility Enhancement Engine
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent tracking-tight leading-tight sm:leading-snug py-1">
                      Master SEO, GEO & Generative Signals
                    </h1>
                    <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
                      Unify keyword orchestration, GEO intelligence, and real-time visibility insights inside one command center.
                    </p>
                  </div>
                  <div className="w-full">
                    <SEOGeoChecker />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keyword-agent' && (
              <div className="h-full w-full">
                {isRestrictedUser ? <KeywordTrendComingSoon /> : <KeywordDiscoveryAgent />}
              </div>
            )}

            {activeTab === 'trend-agent' && (
              <div className="h-full w-full">
                {isRestrictedUser ? <KeywordTrendComingSoon /> : <TrendAnalysisAgent />}
              </div>
            )}
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default VEE;
