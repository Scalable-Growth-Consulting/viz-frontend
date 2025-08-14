import React from 'react';
import { Link } from 'react-router-dom';
import { BarChartIcon, TrendingUp, Database, MessageSquare, ShoppingCart, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import TopNav from '@/components/TopNav';

const Home: React.FC = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black">
      <TopNav zone="home" showData={false} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
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
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* BIZ - Business Intelligence Zone */}
          <Link to="/biz" className="group">
            <Card className="h-full bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20 hover:border-viz-accent/50 dark:hover:border-viz-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-viz-accent/10 group-hover:scale-[1.02]">
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-viz-accent to-blue-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  BIZ
                </h2>
                <p className="text-sm text-viz-accent font-medium mb-4">Business Intelligence Zone</p>
                
                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  Engage with our intelligent chatbot to analyze your data, generate insights, and create visualizations through natural language conversations.
                </p>
                
                <div className="space-y-2">
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
                
                <div className="mt-6 flex items-center text-viz-accent font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>Enter BIZ</span>
                  <span className="ml-2">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* RIZ - Retail Intelligence Zone */}
          <Link to="/riz" className="group">
            <Card className="h-full bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20 hover:border-pink-500/50 dark:hover:border-pink-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/10 group-hover:scale-[1.02]">
              <CardContent className="p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-viz-accent rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-bold text-viz-dark dark:text-white mb-3">
                  RIZ
                </h2>
                <p className="text-sm text-pink-500 font-medium mb-4">Retail Intelligence Zone</p>
                
                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 leading-relaxed">
                  Access specialized AI agents for demand forecasting and marketing intelligence to optimize your retail operations.
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <TrendingUp className="w-4 h-4 mr-2 text-pink-500" />
                    DUFA - Demand Forecasting
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Target className="w-4 h-4 mr-2 text-pink-500" />
                    MIA - Marketing Intelligence
                  </div>
                  <div className="flex items-center text-sm text-slate-500 dark:text-viz-text-secondary">
                    <Database className="w-4 h-4 mr-2 text-pink-500" />
                    Specialized Data Connectors
                  </div>
                </div>
                
                <div className="mt-6 flex items-center text-pink-500 font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>Enter RIZ</span>
                  <span className="ml-2">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Footer Info */}
        <div className="text-center mt-16">
          <p className="text-sm text-slate-500 dark:text-viz-text-secondary">
            Powered by advanced AI • Secure • Enterprise-ready
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
