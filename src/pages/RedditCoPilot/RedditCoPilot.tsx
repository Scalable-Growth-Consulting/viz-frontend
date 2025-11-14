import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Settings as SettingsIcon, Play, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Footer from '@/components/GlobalFooter';

const RedditCoPilot: React.FC = () => {
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [redditHandle, setRedditHandle] = useState('');

  const handleConnectReddit = () => {
    // In a real app, this would redirect to Reddit OAuth
    window.location.href = '/api/reddit/auth/init';
  };

  const handleRunAgent = () => {
    // Navigate to agent control panel
    window.location.href = '/mia/reddit-copilot/agent-control';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-viz-dark dark:to-black flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mr-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-viz-dark dark:text-white">
                Reddit <span className="text-orange-500">CoPilot</span>
              </h1>
            </div>
            <p className="text-xl text-slate-600 dark:text-viz-text-secondary max-w-3xl mx-auto leading-relaxed">
              Automate authentic Reddit engagement with your brand voice.
            </p>
          </motion.div>

          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-md mx-auto mb-8"
          >
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20">
              <CardContent className="p-6">
                {!isRedditConnected ? (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-viz-dark dark:text-white mb-2">
                      Connect Your Reddit Account
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary mb-4">
                      Link your Reddit account to start automating engagement with GEO-optimized responses.
                    </p>
                    <Button
                      onClick={handleConnectReddit}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    >
                      Connect Reddit
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-viz-dark dark:text-white mb-2">
                      Reddit Connected
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary mb-2">
                      Connected as <span className="font-medium text-viz-accent">u/{redditHandle}</span>
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={handleRunAgent}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run Agent
                      </Button>
                      <Link to="/mia/reddit-copilot/settings">
                        <Button variant="outline" size="sm">
                          <SettingsIcon className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          >
            <Card className="bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">Smart Detection</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  AI identifies relevant Reddit posts based on your industry and keywords
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">GEO Optimized</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  Responses crafted using Generative Engine Optimization best practices
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10">
              <CardContent className="p-6 text-center">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <SettingsIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">Brand Voice</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  Maintains your unique brand voice and USP across all engagements
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          {isRedditConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-4">
                <Link to="/mia/reddit-copilot/client-setup">
                  <Button variant="outline" className="mr-4">
                    Setup Profile
                  </Button>
                </Link>
                <Button
                  onClick={handleRunAgent}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Reddit Agent
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default RedditCoPilot;
