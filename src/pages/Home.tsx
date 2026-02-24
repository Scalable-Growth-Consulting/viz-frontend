import React, { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BarChartIcon, TrendingUp, Database, MessageSquare, ShoppingCart, Target, HeartPulse, Brain, Search, Sparkles, ArrowRight, MessageCircle, Globe, ChevronLeft, ChevronRight, Package, Crown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';
import { AGENT_LIST, type AgentItem } from '@/data/agents';

const CategoryCarousel = ({ 
  categoryName, 
  categoryDescription, 
  agents, 
  gradient 
}: { 
  categoryName: string; 
  categoryDescription: string; 
  agents: AgentItem[]; 
  gradient: string;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleCount = 3;
  const maxIndex = Math.max(0, agents.length - visibleCount);

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const visibleAgents = agents.slice(currentIndex, currentIndex + visibleCount);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <div className="relative z-10 p-8 md:p-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="lg:w-1/4 space-y-4">
            <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${gradient} px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-lg`}>
              {categoryName}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-viz-dark leading-tight">
              {categoryName}
            </h2>
            <p className="text-slate-600 leading-relaxed">
              {categoryDescription}
            </p>
            <Link 
              to="/agents"
              className="inline-flex items-center gap-2 text-sm font-semibold text-viz-accent hover:gap-3 transition-all duration-300"
            >
              View all agents <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="lg:w-3/4 relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {visibleAgents.map((agent, index) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link to={agent.route} className="group block h-full">
                      <div className="relative h-full rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${agent.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {agent.icon}
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {agent.subtitle}
                          </p>
                          <h3 className="text-xl font-bold text-viz-dark group-hover:text-viz-accent transition-colors">
                            {agent.name}
                          </h3>
                        </div>
                        <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">
                          {agent.description}
                        </p>
                        {agent.access === 'premium' && (
                          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                            <Crown className="w-3 h-3" /> Premium
                          </div>
                        )}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {agents.length > visibleCount && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <Button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-md hover:shadow-lg disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.ceil(agents.length / visibleCount) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx * visibleCount)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        Math.floor(currentIndex / visibleCount) === idx
                          ? 'bg-viz-accent w-8'
                          : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  onClick={handleNext}
                  disabled={currentIndex >= maxIndex}
                  variant="outline"
                  size="icon"
                  className="rounded-full shadow-md hover:shadow-lg disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroMarketplace = ({ isPrivileged }: { isPrivileged: boolean }) => {
  const [query, setQuery] = useState('');

  const visibleAgents = useMemo(
    () => AGENT_LIST.filter((agent) => agent.access === 'public' || isPrivileged),
    [isPrivileged]
  );

  const sortedAgents = useMemo(
    () => [...visibleAgents].sort((a, b) => a.featuredPriority - b.featuredPriority),
    [visibleAgents]
  );

  const normalizedQuery = query.trim().toLowerCase();

  const filteredAgents = useMemo(() => {
    if (!normalizedQuery) return sortedAgents;
    return sortedAgents.filter((agent) => {
      const haystack = [agent.name, agent.subtitle, agent.description, ...agent.tags]
        .join(' ')
        .toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, sortedAgents]);

  const displayAgents = filteredAgents.slice(0, 9);

  const heroLabel = normalizedQuery
    ? `${filteredAgents.length} matching agents across the Venture Intelligence Zone`
    : 'Explore all agents across Analytics, Growth, and Operations';

  const emptyState = normalizedQuery && filteredAgents.length === 0;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-viz-accent/10 via-cyan-100/20 to-purple-100/30" />
      <div className="relative z-10 px-6 sm:px-10 py-10 md:py-12 space-y-8">
        <div className="max-w-4xl space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-viz-accent/30 bg-white/90 px-5 py-2 text-xs font-bold uppercase tracking-wider text-viz-accent shadow-lg">
            <Sparkles className="w-4 h-4" /> VIZ Marketplace
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-viz-dark leading-tight">
            Where AI Agents Turn Into Revenue Engines
          </h1>
          <p className="text-xl text-slate-600 leading-relaxed">
            Discover autonomous intelligence agents organized by Analytics, Growth, and Operations. Each agent is a standalone micro-SaaS ready to transform your business.
          </p>
        </div>

        <div className="space-y-3 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search agents (SEO, Reddit, dashboard, creative, etc.)"
              className="h-13 rounded-2xl border-slate-200 bg-white pl-10 pr-4 text-base"
            />
          </div>
          <p className="text-sm text-slate-500">{heroLabel}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
          {displayAgents.map((agent, index) => (
            <Link key={agent.id} to={agent.route} className="group" aria-label={`Open ${agent.name}`}>
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ y: -6 }}
                className="h-full"
              >
                <div className="relative h-full rounded-2xl border border-white/40 bg-white/90 backdrop-blur p-5 shadow-sm">
                  <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${agent.gradient} shadow-md`}> 
                    {agent.icon}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{agent.subtitle}</p>
                    <h3 className="text-xl font-semibold text-viz-dark">{agent.name}</h3>
                  </div>
                  <p className="text-sm text-slate-600 mt-3 flex-1 leading-relaxed">
                    {agent.description}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-viz-accent">
                    Explore <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {emptyState && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-8 text-center text-sm text-slate-500">
            No agents match "{query}" yet. Try another capability or browse the categories below.
          </div>
        )}
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  const { user } = useAuth();
  const isPrivileged = hasPremiumAccess(user);

  const visibleAgents = useMemo(
    () => AGENT_LIST.filter((agent) => agent.access === 'public' || isPrivileged),
    [isPrivileged]
  );

  const analyticsAgents = useMemo(
    () => visibleAgents.filter((agent) => 
      agent.tags.some(tag => ['BIZ', 'analytics'].includes(tag)) || 
      ['bi-agent', 'mia-core', 'dufa'].includes(agent.id)
    ),
    [visibleAgents]
  );

  const growthAgents = useMemo(
    () => visibleAgents.filter((agent) => 
      agent.tags.some(tag => ['VEE', 'growth', 'seo', 'reddit'].includes(tag)) || 
      ['seo-geo-agent', 'reddit-geo-agent', 'keyword-trend', 'trend-analysis'].includes(agent.id)
    ),
    [visibleAgents]
  );

  const operationsAgents = useMemo(
    () => visibleAgents.filter((agent) => 
      agent.tags.some(tag => ['operations', 'inventory'].includes(tag)) || 
      ['inventory-insight', 'dufa'].includes(agent.id)
    ),
    [visibleAgents]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-viz-dark dark:to-black">
      <TopNav zone="home" showData={false} />

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl space-y-20">
        <HeroMarketplace isPrivileged={isPrivileged} />

        <section id="categories" className="space-y-12">
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-viz-accent to-purple-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Agent Categories
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold text-viz-dark dark:text-white leading-tight">
              Explore by Intelligence Category
            </h2>
            <p className="text-lg text-slate-600 dark:text-viz-text-secondary leading-relaxed">
              Our agents are organized into three core categories: Analytics for insights, Growth for expansion, and Operations for efficiency. Browse by category to find the perfect agent for your needs.
            </p>
          </div>

          <div className="space-y-10">
            <CategoryCarousel
              categoryName="Analytics"
              categoryDescription="Intelligence agents that transform data into actionable insights—BIZ, MIA, and DUFA."
              agents={analyticsAgents}
              gradient="from-viz-accent to-blue-600"
            />

            <CategoryCarousel
              categoryName="Growth"
              categoryDescription="Visibility and expansion agents—Reddit GEO, SEO-GEO, and Keyword & Trend intelligence."
              agents={growthAgents}
              gradient="from-emerald-500 to-cyan-600"
            />

            <CategoryCarousel
              categoryName="Operations"
              categoryDescription="Operational efficiency agents—IIA and DUFA for inventory and demand optimization."
              agents={operationsAgents}
              gradient="from-purple-500 to-pink-600"
            />
          </div>
        </section>

        <div className="text-center">
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
