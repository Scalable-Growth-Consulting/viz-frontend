import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Target, TrendingUp, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import TopNav from '@/components/TopNav';
import GlobalFooter from '@/components/GlobalFooter';
import { Button } from '@/components/ui/button';
import { AGENT_LIST } from '@/data/agents';

const VEECategory: React.FC = () => {
  const navigate = useNavigate();

  const veeAgents = AGENT_LIST.filter(agent => 
    agent.id === 'seo-geo' || 
    agent.id === 'reddit-geo' || 
    agent.id === 'keyword-discovery' || 
    agent.id === 'trend-analysis'
  );

  const iconMap: Record<string, any> = {
    'seo-geo': Search,
    'reddit-geo': MessageCircle,
    'keyword-discovery': Target,
    'trend-analysis': TrendingUp,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-viz-dark dark:via-black dark:to-viz-dark flex flex-col">
      <TopNav zone="vee" showData={false} />
      
      <main className="flex-1">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-20 blur-3xl rounded-full" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-r from-blue-500 to-cyan-600 opacity-10 blur-3xl rounded-full" />
          </div>

          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="flex justify-center"
              >
                <div className="p-4 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-3xl shadow-2xl">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
              >
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-viz-dark dark:text-white">
                  Visibility Enhancement Engine
                </h1>
                <p className="text-lg leading-relaxed text-slate-600 dark:text-viz-text-secondary font-medium">
                  Own every signal that shapes discovery
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-base leading-relaxed text-slate-600 dark:text-viz-text-secondary max-w-2xl mx-auto"
              >
                Master SEO, GEO, Reddit marketing, keyword research, and trend analysis with our suite of AI-powered visibility agents.
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Agents Grid */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {veeAgents.map((agent, index) => {
                const Icon = iconMap[agent.id] || Search;
                return (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    onClick={() => navigate(agent.route)}
                    className="bg-white dark:bg-viz-medium border border-slate-200 dark:border-viz-light/20 rounded-2xl p-8 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                  >
                    <div className="space-y-4">
                      <div className={`w-14 h-14 ${agent.gradient} rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow duration-300`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-2xl font-semibold text-viz-dark dark:text-white">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary font-medium">
                          {agent.subtitle}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-viz-text-secondary leading-relaxed">
                          {agent.description}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {agent.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <Button
                        className={`w-full ${agent.gradient} text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200`}
                      >
                        Launch Agent
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      
      <GlobalFooter />
    </div>
  );
};

export default VEECategory;
