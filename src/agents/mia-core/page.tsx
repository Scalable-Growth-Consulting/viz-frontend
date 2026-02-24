import React, { useMemo, useState } from 'react';
import TopNav from '@/components/TopNav';
import { useAuth } from '@/contexts/AuthContext';
import { MIASidebar } from './components/MIASidebar';
import { MIAMainContent } from './components/MIAMainContent';
import { Activity, Brain, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const MIACoreAgentPage: React.FC = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('overview');
  const effectiveUserId = user?.id ?? 'demo-mia-user';
  const operatorName = user?.user_metadata?.full_name ?? 'Guest Analyst';
  const accessLabel = user ? 'Authorized Operator' : 'Preview Mode';

  const heroStats = useMemo(() => ([
    {
      label: 'Live Channels',
      value: '12',
      delta: '+3 vs last week',
      icon: Activity,
    },
    {
      label: 'Daily Spend',
      value: '$64.2K',
      delta: 'ROAS 4.9x',
      icon: TrendingUp,
    },
    {
      label: 'AI Alerts',
      value: '7 critical',
      delta: '2 auto-resolved',
      icon: ShieldCheck,
    },
    {
      label: 'Operator',
      value: operatorName,
      delta: accessLabel,
      icon: Brain,
    },
  ]), [operatorName, accessLabel]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col">
      <TopNav zone="mia" showData={false} />
      <section className="bg-gradient-to-r from-[#0f172a] via-[#111c3d] to-[#182b4c] text-white">
        <div className="container mx-auto px-4 md:px-8 py-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.2em]">
                <Sparkles className="w-4 h-4" /> Mission Control
              </span>
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">MIA Core Intelligence</h1>
                <p className="text-slate-200/90 text-lg mt-3 leading-relaxed">
                  Unified marketing intelligence across paid, organic, and experimental growth. Monitor signals, activate automations, and brief stakeholders from a single cockpit.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Systems nominal
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs tracking-wide">
                  Drift guard on
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs tracking-wide">
                  AI autopilot enabled
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4 w-full max-w-3xl">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl bg-white/5 backdrop-blur p-4 border border-white/10">
                  <div className="flex items-center gap-3 text-sm text-slate-100">
                    <stat.icon className="w-4 h-4 text-cyan-300" />
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold mt-2">{stat.value}</div>
                  <p className="text-xs text-slate-300 mt-1">{stat.delta}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout: Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden border-t border-slate-200/40">
        {/* Left Sidebar */}
        <MIASidebar
          activeView={activeView}
          onViewChange={setActiveView}
        />
        
        {/* Main Content Area */}
        <MIAMainContent activeView={activeView} userId={effectiveUserId} />
      </div>
    </div>
  );
};

export default MIACoreAgentPage;
