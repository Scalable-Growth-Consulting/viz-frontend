import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BarChartIcon, TrendingUp, Database, MessageSquare, ShoppingCart, Target, HeartPulse, Brain, Search, Sparkles, ArrowRight, MessageCircle, Crown, Globe } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';

const Home: React.FC = () => {
  const { user } = useAuth();
  const isPrivileged = hasPremiumAccess(user);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <TopNav zone="home" showData={false} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-viz-dark dark:text-white mb-4">
            Welcome to <span className="text-viz-accent">Viz</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-viz-text-secondary max-w-2xl mx-auto">
            Choose your intelligence zone to unlock powerful AI-driven insights for your business
          </p>
        </div>

        {/* Zone Selection Cards */}
        <div className="flex flex-wrap justify-center gap-8 max-w-7xl mx-auto">
          {/* Cards will automatically wrap to next row when exceeding 4 per row on larger screens */}
          {/* BIZ - Business Intelligence Zone */}
          <Link to="/biz" className="group w-full sm:w-80 lg:w-72 xl:w-80 order-1">
            <Card className="h-full bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20 hover:border-viz-accent/50 dark:hover:border-viz-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-viz-accent/10 group-hover:scale-[1.02]">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-viz-accent to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  BIZ
                </h2>
                <p className="text-sm text-viz-accent font-medium mb-4">Business Intelligence Zone</p>
                
                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  Chat with your data to analyze, generate insights, and build visualizations instantly.
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Database className="w-4 h-4 mr-2 text-viz-accent" />
                    Data Upload & Management
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <MessageSquare className="w-4 h-4 mr-2 text-viz-accent" />
                    AI-Powered Chat Interface
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <BarChartIcon className="w-4 h-4 mr-2 text-viz-accent" />
                    Instant Visualizations
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <div className="flex items-center text-viz-accent font-medium group-hover:translate-x-1 transition-transform duration-300">
                    <span>Enter BIZ</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* MIZ - Marketing Intelligence Zone */}
          <Link to="/mia" aria-label="Open Marketing Intelligence Zone" className="group w-full sm:w-80 lg:w-72 xl:w-80 order-2">
            <Card className="h-full bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 group-hover:scale-[1.02] focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  MIZ
                </h2>
                <p className="text-sm text-purple-500 font-medium mb-4">Marketing Intelligence Zone</p>
                
                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  Advanced AI-powered marketing intelligence with comprehensive analytics and SEO optimization tools.
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Target className="w-4 h-4 mr-2 text-purple-500" />
                    Marketing Dashboard & Analytics
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Brain className="w-4 h-4 mr-2 text-purple-500" />
                    SEO & GEO Optimization Tool
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Database className="w-4 h-4 mr-2 text-purple-500" />
                    Campaign Intelligence
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <div className="inline-flex items-center text-purple-600 font-medium group-hover:translate-x-1 transition-transform duration-300">
                    <span>Enter MIZ</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* RIZ - Retail Intelligence Zone */}
          {isPrivileged && (
          <Link to="/riz" className="group w-full sm:w-80 lg:w-72 xl:w-80 order-3">
            <Card className="h-full bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20 hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 group-hover:scale-[1.02]">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-viz-accent rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  RIZ
                </h2>
                <p className="text-sm text-pink-500 font-medium mb-4">Retail Intelligence Zone</p>
                
                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  Use AI agents for demand forecasting and inventory optimization to enhance retail performance.
                </p>
                
                <div className="space-y-2 text-left">
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <TrendingUp className="w-4 h-4 mr-2 text-pink-500" />
                    DUFA - Demand Forecasting
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <BarChartIcon className="w-4 h-4 mr-2 text-pink-500" />
                    IIA - Inventory Intelligence
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Database className="w-4 h-4 mr-2 text-pink-500" />
                    Specialized Data Connectors
                  </div>
                </div>
                
                <div className="mt-auto pt-6">
                  <div className="flex items-center text-pink-500 font-medium group-hover:translate-x-1 transition-transform duration-300">
                    <span>Enter RIZ</span>
                    <span className="ml-2">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          )}

          

          {/* FIZ - Financial Intelligence Zone (Coming Soon) */}
          {isPrivileged && (
          <div className="group w-full sm:w-80 lg:w-72 xl:w-80 order-4">
            <Card className="h-full bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 group-hover:scale-[1.02] opacity-80">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <BarChartIcon className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  FIZ
                </h2>
                <p className="text-sm text-emerald-600 font-medium mb-4">Financial Intelligence Zone</p>

                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  Advanced financial analytics and forecasting tools to power your fiscal decisions.
                </p>

                <div className="mt-auto pt-6">
                  <div className="inline-flex items-center text-emerald-600 font-medium bg-emerald-600/10 px-3 py-1.5 rounded-full">
                    <span>Coming Soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* HIZ - Healthcare Intelligence Zone (Coming Soon) */}
          {isPrivileged && (
          <div className="group w-full sm:w-80 lg:w-72 xl:w-80 order-5">
            <Card className="h-full bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10 hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 group-hover:scale-[1.02] opacity-80">
              <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <HeartPulse className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  HIZ
                </h2>
                <p className="text-sm text-indigo-600 font-medium mb-4">Healthcare Intelligence Zone</p>

                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  AI-driven insights and analytics tailored for healthcare operations and outcomes.
                </p>

                <div className="mt-auto pt-6">
                  <div className="inline-flex items-center text-indigo-600 font-medium bg-indigo-600/10 px-3 py-1.5 rounded-full">
                    <span>Coming Soon</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </div>

        {/* Agents Section */}
        <section className="mt-16 max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-viz-dark dark:text-white mb-2">Agents</h2>
            <p className="text-slate-600 dark:text-viz-text-secondary">Discover individual agents across zones</p>
          </div>

          <AgentsExplorer isPrivileged={isPrivileged} />
        </section>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <p className="text-sm text-slate-500 dark:text-viz-text-secondary">
            Powered by advanced AI • Secure • Enterprise-ready
          </p>
        </div>
      </main>
      
      {/* Global Footer */}
      <GlobalFooter />
    </div>
  );
};

export default Home;

// Types
type AgentItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  tags: string[];
  route: string;
  gradient: string; // tailwind gradient classes
  icon: React.ReactNode;
  access: 'public' | 'premium';
};

// Agents Explorer: search + animated cards
function AgentsExplorer({ isPrivileged }: { isPrivileged: boolean }) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<'all' | 'analytics' | 'marketing' | 'seo' | 'dashboard'>('all');
  const searchRef = useRef<HTMLInputElement>(null);

  const agents = useMemo<AgentItem[]>(() => [
    {
      id: 'bi-agent',
      name: 'BI Agent',
      subtitle: 'Business Intelligence',
      description: 'Chat with your data, build dashboards, and generate insights instantly.',
      tags: ['BIZ', 'analytics', 'dashboard', 'data', 'chat'],
      route: '/biz',
      gradient: 'from-viz-accent to-blue-600',
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      access: 'public',
    },
    {
      id: 'seo-geo-agent',
      name: 'SEO & GEO Agent',
      subtitle: 'Search + Generative Engine Optimization',
      description: 'Master-level SEO with AI-driven GEO signals, quick wins, and growth strategies.',
      tags: ['MIZ', 'seo', 'geo', 'marketing', 'optimizer'],
      route: '/mia/seo-geo',
      gradient: 'from-purple-500 to-violet-600',
      icon: <Brain className="w-6 h-6 text-white" />,
      access: 'public', // explicitly public per access guard
    },
    {
      id: 'reddit-copilot',
      name: 'Reddit CoPilot',
      subtitle: 'Marketing Intelligence Zone',
      description: 'Automate authentic Reddit engagement with AI-powered GEO-optimized responses.',
      tags: ['MIZ', 'reddit', 'marketing', 'automation', 'geo'],
      route: '/mia/reddit-copilot',
      gradient: 'from-orange-500 to-red-600',
      icon: <MessageCircle className="w-6 h-6 text-white" />,
      access: 'public',
    },
    {
      id: 'mia-core',
      name: 'MIA Core Intelligence',
      subtitle: 'Admin Exclusive Suite',
      description: 'Unified command center for elite growth teams with AI-orchestrated dashboards and intelligence.',
      tags: ['MIZ', 'core', 'analytics', 'leadership', 'marketing'],
      route: '/mia',
      gradient: 'from-[#2E026D] via-[#6E21C8] to-[#9333EA]',
      icon: <Crown className="w-6 h-6 text-white" />,
      access: 'public',
    },
    {
      id: 'keyword-trend',
      name: 'Keyword & Trend Constellation',
      subtitle: 'Intelligence in Alpha',
      description: 'Predict cultural waves before they crest with trend intelligence and demand modeling.',
      tags: ['MIZ', 'marketing', 'seo', 'insights', 'analytics'],
      route: '/mia/keyword-trend',
      gradient: 'from-[#1D2671] via-[#5C3BE8] to-[#A855F7]',
      icon: <Target className="w-6 h-6 text-white" />,
      access: 'public',
    },
    {
      id: 'creative-labs',
      name: 'Creative Labs',
      subtitle: 'Design Intelligence',
      description: 'Automated creative prototyping that blends generative artistry with performance insights.',
      tags: ['MIZ', 'creative', 'marketing', 'automation', 'design'],
      route: '/mia/creative',
      gradient: 'from-[#3E1E68] via-[#9B287B] to-[#F06199]',
      icon: <Sparkles className="w-6 h-6 text-white" />,
      access: 'public',
    },
    {
      id: 'brandlenz',
      name: 'Brandlenz Sentinel',
      subtitle: 'Visibility Intelligence',
      description: 'Continuously sense brand health, competitive signals, and market bias across channels.',
      tags: ['MIZ', 'brand', 'analytics', 'marketing', 'insights'],
      route: '/mia/brandlenz',
      gradient: 'from-[#0F3D5F] via-[#256D85] to-[#3BA39C]',
      icon: <Globe className="w-6 h-6 text-white" />,
      access: 'public',
    },
  ], []);

  const visibleAgents = useMemo(() => agents.filter(a => a.access === 'public' || isPrivileged), [agents, isPrivileged]);

  const filtered = useMemo(() => {
    let base = visibleAgents;
    if (activeTag !== 'all') base = base.filter(a => a.tags.includes(activeTag));
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter(a => {
      const hay = [a.name, a.subtitle, a.description, ...a.tags].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [query, visibleAgents, activeTag]);

  return (
    <div className="space-y-8">
      {/* Glassy search with accent */}
      <div className="relative max-w-2xl mx-auto">
        <div className="pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-viz-accent/20 via-purple-500/10 to-indigo-500/20 blur opacity-60" />
        <div className="relative rounded-2xl border border-slate-200/60 dark:border-viz-light/20 bg-white/80 dark:bg-viz-medium/70 backdrop-blur-sm">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 flex items-center gap-1">
            <Search className="w-4 h-4" />
            <Sparkles className="w-4 h-4 text-viz-accent" />
          </div>
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search agents (e.g., SEO, dashboard, marketing)"
            className="h-12 pl-12 pr-4 bg-transparent border-0 focus-visible:ring-0"
            aria-label="Search agents"
          />
        </div>
        {/* Quick filters */}
        <div className="mt-3 flex flex-wrap gap-2 justify-center">
          {(['all','analytics','marketing','seo','dashboard'] as const).map(tag => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                activeTag === tag
                  ? 'bg-gradient-to-r from-viz-accent to-blue-600 text-white border-transparent shadow'
                  : 'bg-white/80 dark:bg-viz-medium/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-viz-light/20 hover:bg-white'
              }`}
            >
              {tag === 'all' ? 'All' : tag.charAt(0).toUpperCase() + tag.slice(1)}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-500 dark:text-viz-text-secondary text-center">{filtered.length} results</div>
      </div>

      {/* Agents grid - centered with flexible layout */}
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl">
          {filtered.map((a, i) => (
            <Link key={a.id} to={a.route} className="group" aria-label={`Open ${a.name}`}>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
                whileHover={{ y: -6 }}
                className="relative h-full rounded-2xl"
              >
                {/* gradient glow border */}
                <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-br from-viz-accent via-purple-500 to-indigo-600 opacity-60 blur-sm group-hover:opacity-90 transition-opacity" />
                <Card className="relative h-full rounded-2xl bg-white/90 dark:bg-viz-medium/90 backdrop-blur border border-white/30 dark:border-white/10 overflow-hidden focus-within:ring-2 focus-within:ring-viz-accent">
                  {/* subtle corner orb */}
                  <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 rounded-full bg-gradient-to-br from-viz-accent/15 to-purple-500/15 blur-2xl" />
                  <CardContent className="relative p-6 flex flex-col h-full">
                    <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${a.gradient} shadow-md group-hover:scale-110 transition-transform`}>
                      {a.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold text-viz-dark dark:text-white tracking-tight">{a.name}</h3>
                      <div className="text-sm text-slate-600 dark:text-viz-text-secondary">{a.subtitle}</div>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary mt-3 flex-1 leading-relaxed">{a.description}</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {a.tags.slice(0, 4).map(t => (
                        <span key={t} className="text-[11px] px-2 py-0.5 rounded-full border bg-slate-50/80 dark:bg-slate-800/60 border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300">{t}</span>
                      ))}
                    </div>
                    <div className="mt-5 inline-flex items-center self-start rounded-full px-3 py-2 text-sm font-semibold bg-gradient-to-r from-viz-accent to-blue-600 text-white shadow hover:shadow-lg transition-shadow">
                      Explore <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-sm text-slate-500 dark:text-viz-text-secondary">No agents match your search.</div>
      )}
    </div>
  );
}
