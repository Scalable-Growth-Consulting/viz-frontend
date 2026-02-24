import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Home, LogOut, Activity, LogIn, UserPlus } from 'lucide-react';
import { AGENT_LIST } from '@/data/agents';
import { cn } from '@/lib/utils';

export const CommandMenu: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate('/');
  };

  const handleNavigate = (route: string) => {
    navigate(route);
    setOpen(false);
  };

  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'SG';

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'SHIVANG GUPTA';

  const liveAgents = AGENT_LIST.filter(agent => agent.access === 'public').length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-pressed={open}
          className={cn(
            'shrink-0 transition-all duration-300',
            open
              ? 'bg-slate-800/70 text-white shadow-[0_0_20px_rgba(56,189,248,0.5)]'
              : 'hover:bg-slate-800/40'
          )}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[390px] p-0 bg-[#0F1419] border-r border-slate-800">
        <div className="flex flex-col h-full">
          {/* Header Section */}
          <div className="px-6 py-4 border-b border-slate-800">
            <div className="space-y-1 mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">COMMAND MENU</p>
              <h2 className="text-xl font-bold text-white">Venture Intelligence Zone</h2>
              <p className="text-xs text-slate-400">Hop between agents or return home in a single gesture.</p>
            </div>

            {/* Quick Actions - Icon Only 1x3 Row */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleNavigate('/')}
                className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                title="Home"
              >
                <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                  <Home className="w-5 h-5 text-slate-300" />
                </div>
                <span className="text-xs text-slate-400">Home</span>
              </button>

              {user ? (
                <button
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  title={userName}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                    {userInitials}
                  </div>
                  <span className="text-xs text-slate-400">Profile</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate('/auth')}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  title="Sign in"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    <LogIn className="w-5 h-5 text-slate-300" />
                  </div>
                  <span className="text-xs text-slate-400">Sign in</span>
                </button>
              )}

              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  title="Sign out"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-slate-300" />
                  </div>
                  <span className="text-xs text-slate-400">Sign out</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavigate('/auth?mode=signup')}
                  className="flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors"
                  title="Register"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-slate-300" />
                  </div>
                  <span className="text-xs text-slate-400">Register</span>
                </button>
              )}
            </div>
          </div>

          {/* All Agents Section */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">ALL AGENTS</h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Activity className="w-3 h-3 text-green-500" />
                <span>{liveAgents} live</span>
              </div>
            </div>

            <div className="space-y-2">
              {AGENT_LIST.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleNavigate(agent.route)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-left group"
                >
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg',
                    agent.gradient
                  )}>
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {agent.name}
                    </div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide">
                      {agent.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CommandMenu;
