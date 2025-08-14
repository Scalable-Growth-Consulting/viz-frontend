import React from 'react';
import { BarChart2 as BarChartIcon, DatabaseIcon, LightbulbIcon, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

type ZoneType = 'home' | 'biz' | 'riz';

interface TopNavProps {
  zone: ZoneType;
  showData?: boolean;
}

const TopNav: React.FC<TopNavProps> = ({ zone, showData = true }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <header className="bg-white/10 dark:bg-viz-dark/70 backdrop-blur-lg border-b border-slate-200/20 dark:border-viz-light/10 py-3 px-4 md:px-6 flex items-center shadow-sm">
      {/* Left Section - Logo */}
      <div className="flex-1">
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
            <p className="text-xs text-slate-500 dark:text-viz-text-secondary">virtual intelligence zone</p>
          </div>
        </Link>
      </div>
      
      {/* Center Section - Zone Navigation */}
      <div className="flex-1 flex justify-center space-x-3">
        {zone === 'biz' && (
          <Link 
            to="/riz/dufa" 
            className="flex items-center space-x-2 bg-gradient-to-r from-viz-accent to-blue-600 hover:from-viz-accent/90 hover:to-blue-600/90 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
          >
            <DatabaseIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Switch to RIZ</span>
          </Link>
        )}
        {zone === 'riz' && (
          <Link 
            to="/biz" 
            className="flex items-center space-x-2 bg-gradient-to-r from-viz-accent to-blue-600 hover:from-viz-accent/90 hover:to-blue-600/90 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
          >
            <BarChartIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Switch to BIZ</span>
          </Link>
        )}
        {zone === 'home' && (
          <div className="flex items-center space-x-3">
            <Link 
              to="/biz" 
              className="flex items-center space-x-2 bg-gradient-to-r from-viz-accent to-blue-600 hover:from-viz-accent/90 hover:to-blue-600/90 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
            >
              <BarChartIcon className="w-5 h-5" />
              <span>Business Zone</span>
            </Link>
            <Link 
              to="/riz/dufa" 
              className="flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-viz-accent hover:from-pink-400 hover:to-viz-accent/90 text-white px-4 py-2 rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 font-medium"
            >
              <DatabaseIcon className="w-5 h-5" />
              <span>Retail Zone</span>
            </Link>
          </div>
        )}
      </div>
      
      {/* Right Section - Navigation & User */}
      <div className="flex-1 flex justify-end">
        <div className="flex items-center space-x-2 md:space-x-3">
          {showData && (
            <Link 
              to={zone === 'biz' ? "/data-control" : "#"}
              className={`flex items-center space-x-1 ${
                zone === 'riz' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/30 dark:hover:bg-viz-light'
              } bg-white/20 dark:bg-viz-medium px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105`}
              title={zone === 'riz' ? 'Data management not available in RIZ' : 'Manage Data'}
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
        
          {user && (
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
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="bg-white/20 dark:bg-viz-medium hover:bg-white/30 dark:hover:bg-viz-light"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline ml-2">Sign out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
