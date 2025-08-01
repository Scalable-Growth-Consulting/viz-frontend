import React from 'react';
import { BarChartIcon, LightbulbIcon, DatabaseIcon, UserIcon, LogOut, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

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
        <Link to="/dufa" className="flex items-center space-x-1 bg-white/20 dark:bg-viz-medium hover:bg-white/30 dark:hover:bg-viz-light px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow md:hover:scale-105">
          <TrendingUp className="w-4 h-4 text-viz-accent" />
          <span className="text-sm font-medium hidden md:inline text-slate-700 dark:text-white">DUFA</span>
        </Link>
        
        {user && (
          <div className="flex items-center space-x-2">
            <Link to="/profile" className="flex items-center space-x-2 bg-white/20 dark:bg-viz-medium px-3 py-1.5 rounded-lg hover:bg-white/30 dark:hover:bg-viz-light transition-all shadow-sm hover:shadow md:hover:scale-105">
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
    </header>
  );
};

export default Header;
