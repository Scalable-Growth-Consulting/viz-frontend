import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Settings as SettingsIcon, Play, CheckCircle, ArrowRight, User, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const RedditCoPilotMIA: React.FC = () => {
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [redditHandle, setRedditHandle] = useState('');

  const handleConnectReddit = () => {
    // In a real app, this would redirect to Reddit OAuth
    window.location.href = '/api/reddit/auth/init';
  };

  const handleRunAgent = () => {
    // Navigate to agent control panel
    window.location.href = '/reddit-geo-agent';
  };

  return (
    <div className="h-full w-full overflow-auto">
      <div className="min-h-full p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 bg-clip-text text-transparent tracking-tight">
              Reddit CoPilot
            </h1>

            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-sm border border-orange-200/20 dark:border-red-400/20 rounded-full">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm sm:text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Reddit Engagement Automation
              </span>
            </div>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed px-4">
              Automate authentic Reddit engagement with AI-powered GEO-optimized responses.
              <span className="font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {' '}Scale your brand presence across Reddit communities.
              </span>
            </p>
          </div>

          {/* Connection Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="bg-white/80 dark:bg-viz-medium/80 backdrop-blur-sm border-slate-200/50 dark:border-viz-light/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-viz-dark dark:text-white">
                  <MessageCircle className="w-5 h-5 text-orange-500" />
                  Reddit Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!isRedditConnected ? (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-viz-dark dark:text-white mb-2">
                      Connect Your Reddit Account
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary mb-6">
                      Link your Reddit account to start automating engagement with GEO-optimized responses.
                    </p>
                    <Button
                      onClick={handleConnectReddit}
                      className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Connect Reddit
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-viz-dark dark:text-white mb-2">
                      Reddit Connected
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-viz-text-secondary mb-6">
                      Connected as <span className="font-medium text-viz-accent">u/{redditHandle}</span>
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={handleRunAgent}
                        className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Run Agent
                      </Button>
                      <Link to="/reddit-geo-agent">
                        <Button variant="outline">
                          <SettingsIcon className="w-4 h-4 mr-2" />
                          Settings
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">Smart Detection</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  AI identifies relevant Reddit posts based on your industry and keywords
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">GEO Optimized</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  Responses crafted using Generative Engine Optimization best practices
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/60 dark:bg-viz-medium/60 backdrop-blur-sm border-slate-200/40 dark:border-viz-light/10">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-viz-dark dark:text-white mb-2">Brand Voice</h3>
                <p className="text-sm text-slate-600 dark:text-viz-text-secondary">
                  Maintains your unique brand voice and USP across all engagements
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-center"
          >
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200/50 dark:border-orange-800/50">
              <CardContent className="p-8">
                <h3 className="text-xl font-semibold text-viz-dark dark:text-white mb-4">
                  Get Started with Reddit CoPilot
                </h3>
                <p className="text-slate-600 dark:text-viz-text-secondary mb-6 max-w-2xl mx-auto">
                  Set up your client profile, connect your Reddit account, and start automating authentic engagement across Reddit communities.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/reddit-geo-agent">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <User className="w-4 h-4 mr-2" />
                      Setup Profile
                    </Button>
                  </Link>
                  <Link to="/reddit-geo-agent">
                    <Button className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white w-full sm:w-auto">
                      <Zap className="w-4 h-4 mr-2" />
                      Agent Control
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RedditCoPilotMIA;
