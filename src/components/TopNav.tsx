import React, { useMemo } from 'react';
import { ArrowLeft, ChevronRight, DatabaseIcon, Home, LightbulbIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CommandMenu } from './CommandMenu';
import { AGENT_LIST } from '@/data/agents';

type ZoneType = 'home' | 'biz' | 'riz' | 'mia' | 'vee' | 'fiz' | 'hiz';

interface TopNavProps {
  zone: ZoneType;
  showData?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ zone, showData = true }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const breadcrumbLabel = useMemo(() => {
    if (location.pathname === '/') return null;
    const exactMatch = AGENT_LIST.find((agent) => agent.route === location.pathname);
    if (exactMatch) return exactMatch.name;
    const segments = location.pathname.split('/').filter(Boolean);
    if (!segments.length) return null;
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [location.pathname]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="sticky top-0 z-50">
      <header className="bg-white/10 dark:bg-viz-dark/70 backdrop-blur-lg border-b border-slate-200/20 dark:border-viz-light/10 py-3 px-4 md:px-6 flex items-center shadow-sm">
      {/* Left Section - Hamburger + Logo */}
      <div className="flex-1 flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <CommandMenu />
        </div>
        <Link to="/" className="flex items-center space-x-3 group w-fit">
          <div className="bg-black p-2 rounded-lg shadow-md group-hover:shadow-viz-accent/20 transition-all duration-300 group-hover:scale-105">
            <div className="relative">
              <span className="text-2xl font-bold tracking-tight text-white">V</span>
              <svg
                className="absolute -bottom-1 -right-1 w-4 h-4 text-viz-accent-light"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <rect x="1" y="11" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.6" />
                <rect x="6" y="8" width="3" height="6" rx="0.5" fill="currentColor" opacity="0.8" />
                <rect x="11" y="4" width="3" height="10" rx="0.5" fill="currentColor" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-viz-dark dark:text-white">Viz</h1>
            <p className="hidden sm:block text-xs text-slate-500 dark:text-viz-text-secondary">venture intelligence zone</p>
          </div>
        </Link>
      </div>
      
      {/* Center Section - kept intentionally clean */}
      <div className="flex-1" />
      
      {/* Right Section - Navigation & User */}
      <div className="flex-1 flex justify-end items-center gap-2">
        <div className="hidden lg:flex items-center space-x-2 md:space-x-3">
          {showData && (
            <Link 
              to={zone === 'biz' ? "/data-control" : "#"}
              className={`flex items-center space-x-1 ${
                zone === 'riz' || zone === 'mia' || zone === 'vee' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30 dark:hover:bg-viz-light'
              } bg-white/20 dark:bg-viz-medium px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105`}
              title={zone === 'riz' || zone === 'mia' || zone === 'vee' ? 'Data management not available in this zone' : 'Manage Data'}
            >
              <DatabaseIcon className="w-4 h-4 text-viz-accent" />
              <span className="text-sm font-medium hidden lg:inline text-slate-700 dark:text-white">Data</span>
            </Link>
          )}
          
          <Link 
            to="/tips" 
            className="flex items-center space-x-1 bg-white/20 dark:bg-viz-medium hover:bg-white/30 dark:hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105"
          >
            <LightbulbIcon className="w-4 h-4 text-viz-accent" />
            <span className="text-sm font-medium hidden lg:inline text-slate-700 dark:text-white">Tips</span>
          </Link>
        
          {user ? (
            <div className="flex items-center space-x-2">
              <Link 
                to="/profile" 
                className="flex items-center space-x-2 bg-white/20 dark:bg-viz-medium px-3 py-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-viz-light transition-all shadow-sm hover:shadow md:hover:scale-105"
              >
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-viz-accent text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-slate-700 dark:text-white hidden md:inline">
                  {user.user_metadata?.full_name || user.email}
                </span>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="px-3 py-1.5 rounded-lg border border-white/40 bg-white/30 text-xs font-semibold uppercase tracking-wide text-slate-700 dark:text-white hover:bg-white/60 transition"
              >
                Sign in
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-3 py-1.5 rounded-lg bg-viz-accent text-white text-xs font-semibold uppercase tracking-wide hover:bg-viz-accent-light transition"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
      </header>
      <div className="bg-white/85 dark:bg-viz-dark/90 backdrop-blur border-b border-slate-200/30 dark:border-white/5 px-4 md:px-6 py-2 shadow-sm">
        <nav className="flex items-center justify-between gap-3 text-[11px] sm:text-xs font-semibold text-slate-600 dark:text-slate-200" aria-label="Breadcrumb">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1 rounded-full bg-white border border-slate-200/70 dark:bg-white/5 dark:border-white/10 px-3 py-1 shadow-sm hover:bg-white/90 transition"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            {breadcrumbLabel && breadcrumbLabel !== 'Home' && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 rounded-full bg-white/90 dark:bg-white/10 border border-slate-200/60 dark:border-white/10 px-3 py-1 text-slate-600 dark:text-white shadow-sm hover:bg-white"
                >
                  {breadcrumbLabel}
                </button>
              </>
            )}
          </div>
          {breadcrumbLabel && breadcrumbLabel !== 'Home' && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-viz-accent hover:text-viz-accent-light"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          )}
        </nav>
      </div>
    </div>
  );
};

export default TopNav;
