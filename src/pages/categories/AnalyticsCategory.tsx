import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BarChartIcon, Crown, Sparkles } from 'lucide-react';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { AGENT_LIST, type AgentItem } from '@/data/agents';
import { useAuth } from '@/contexts/AuthContext';
import { hasPremiumAccess } from '@/utils/adminAccess';

const AnalyticsCategory: React.FC = () => {
  const { user } = useAuth();
  const isPrivileged = hasPremiumAccess(user);

  const analyticsAgents = useMemo(() => {
    const visibleAgents = AGENT_LIST.filter(
      (agent) => agent.access === 'public' || isPrivileged
    );
    return visibleAgents.filter(
      (agent) =>
        agent.tags.some((tag) => ['BIZ', 'analytics'].includes(tag)) ||
        ['bi-agent', 'mia-core', 'dufa'].includes(agent.id)
    );
  }, [isPrivileged]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-viz-dark dark:to-black">
      <TopNav zone="home" showData={false} />

      <main className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl space-y-12">
        <div className="space-y-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-viz-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-sm shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-viz-accent/10 via-blue-100/20 to-purple-100/30" />
            <div className="relative z-10 px-8 sm:px-12 py-12 md:py-16 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-viz-accent to-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                <BarChartIcon className="w-4 h-4" /> Analytics
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-viz-dark leading-tight">
                Analytics Intelligence Agents
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed max-w-4xl">
                Intelligence agents that transform data into actionable insights—BIZ for business intelligence, MIA for marketing analytics, and DUFA for demand forecasting.
              </p>
            </div>
          </div>
        </div>

        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl md:text-3xl font-bold text-viz-dark dark:text-white">
              All Analytics Agents ({analyticsAgents.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsAgents.map((agent, index) => (
              <motion.div
                key={agent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link to={agent.route} className="group block h-full">
                  <div className="relative h-full rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur p-6 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
                    <div
                      className={`w-16 h-16 rounded-xl mb-5 flex items-center justify-center bg-gradient-to-br ${agent.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      {agent.icon}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {agent.subtitle}
                      </p>
                      <h3 className="text-2xl font-bold text-viz-dark group-hover:text-viz-accent transition-colors">
                        {agent.name}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                      {agent.description}
                    </p>
                    {agent.access === 'premium' && (
                      <div className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700">
                        <Crown className="w-3.5 h-3.5" /> Premium Access
                      </div>
                    )}
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-viz-accent">
                      Explore Agent →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {analyticsAgents.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 px-8 py-12 text-center">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-slate-400" />
              <p className="text-lg text-slate-600 font-medium">
                No analytics agents available yet.
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Check back soon for new intelligence agents.
              </p>
            </div>
          )}
        </section>
      </main>

      <GlobalFooter />
    </div>
  );
};

export default AnalyticsCategory;
