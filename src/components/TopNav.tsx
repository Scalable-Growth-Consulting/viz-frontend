import React from 'react';
import { BarChart2 as BarChartIcon, DatabaseIcon, LightbulbIcon, LogOut, Menu, HeartPulse } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from './ui/sheet';

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
      {/* Left Section - Hamburger + Logo */}
      <div className="flex-1 flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 sm:w-96">
            <SheetHeader>
              <SheetTitle className="text-left">Navigation</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              {/* Zones */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Zones</h3>
                <div className="grid grid-cols-1 gap-3">
                  <SheetClose asChild>
                    <Link 
                      to="/biz" 
                      className="flex items-center justify-between bg-gradient-to-r from-viz-accent to-blue-600 text-white px-4 py-3 rounded-lg shadow hover:opacity-90 transition"
                    >
                      <div className="flex items-center gap-2">
                        <BarChartIcon className="w-5 h-5" />
                        <span className="font-medium">BI Zone</span>
                      </div>
                      <span className="opacity-80">→</span>
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link 
                      to="/riz/dufa" 
                      className="flex items-center justify-between bg-gradient-to-r from-pink-500 to-viz-accent text-white px-4 py-3 rounded-lg shadow hover:opacity-90 transition"
                    >
                      <div className="flex items-center gap-2">
                        <DatabaseIcon className="w-5 h-5" />
                        <span className="font-medium">Retail Zone</span>
                      </div>
                      <span className="opacity-80">→</span>
                    </Link>
                  </SheetClose>
                  <div className="flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 text-white px-4 py-3 rounded-lg shadow opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-2">
                      <BarChartIcon className="w-5 h-5" />
                      <span className="font-medium">FIZ</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                  <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-3 rounded-lg shadow opacity-60 cursor-not-allowed">
                    <div className="flex items-center gap-2">
                      <HeartPulse className="w-5 h-5" />
                      <span className="font-medium">HIZ</span>
                    </div>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Coming Soon</span>
                  </div>
                </div>
              </div>

              {/* Menu */}
              <div>
                <h3 className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Menu</h3>
                <div className="space-y-2">
                  {showData && zone !== 'riz' && (
                    <SheetClose asChild>
                      <Link to="/data-control" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/20 dark:hover:bg-viz-light">
                        <DatabaseIcon className="w-4 h-4 text-viz-accent" />
                        <span className="text-sm">Data</span>
                      </Link>
                    </SheetClose>
                  )}
                  <SheetClose asChild>
                    <Link to="/tips" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/20 dark:hover:bg-viz-light">
                      <LightbulbIcon className="w-4 h-4 text-viz-accent" />
                      <span className="text-sm">Tips</span>
                    </Link>
                  </SheetClose>
                  {user && (
                    <>
                      <SheetClose asChild>
                        <Link to="/profile" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/20 dark:hover:bg-viz-light">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-viz-accent text-white">{userInitials}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{user.user_metadata?.full_name || user.email}</span>
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button onClick={handleSignOut} variant="ghost" size="sm" className="w-full justify-start">
                          <LogOut className="w-4 h-4 mr-2" /> Sign out
                        </Button>
                      </SheetClose>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
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
      
      {/* Center Section - kept intentionally clean */}
      <div className="flex-1" />
      
      {/* Right Section - Navigation & User */}
      <div className="flex-1 flex justify-end">
        <div className="hidden lg:flex items-center space-x-2 md:space-x-3">
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
