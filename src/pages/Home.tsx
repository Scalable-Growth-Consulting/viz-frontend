import React from 'react';
import { Link } from 'react-router-dom';
import { BarChartIcon, TrendingUp, Database, MessageSquare, ShoppingCart, Target, HeartPulse, Brain } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
