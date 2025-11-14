import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageCircle, Settings as SettingsIcon, CheckCircle, ArrowRight, User, Sparkles, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import redditCopilotAPI, { RedditToken, ClientProfile } from '@/services/redditCopilotApi';

const RedditCoPilotDashboard: React.FC = () => {
  const [isRedditConnected, setIsRedditConnected] = useState(false);
  const [redditToken, setRedditToken] = useState<RedditToken | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load data from API on mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      // Load user profile data from Lambda API
      const userProfile = await redditCopilotAPI.getUserProfile();
      
      if (userProfile.reddit_token) {
        setRedditToken(userProfile.reddit_token);
        setIsRedditConnected(true);
      }
      
      if (userProfile.client_profile) {
        setClientProfile(userProfile.client_profile);
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
      // Don't show error toast on initial load - user might not be set up yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectReddit = async () => {
    try {
      setIsConnecting(true);
      
      // Call Lambda API to initiate Reddit OAuth
      const { auth_url } = await redditCopilotAPI.initiateRedditAuth();
      
      // Redirect to Reddit OAuth
      window.location.href = auth_url;
    } catch (error) {
      console.error('Reddit connection failed:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Reddit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectReddit = async () => {
    try {
      setIsConnecting(true);
      
      // Call Lambda API to revoke Reddit tokens
      await redditCopilotAPI.revokeRedditAuth();
      
      setRedditToken(null);
      setIsRedditConnected(false);
      
      toast({
        title: "Reddit Disconnected",
        description: "Your Reddit account has been disconnected.",
      });
    } catch (error) {
      console.error('Reddit disconnection failed:', error);
      toast({
        title: "Disconnection Failed",
        description: "Failed to disconnect Reddit. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const isProfileComplete = clientProfile && 
    clientProfile.usp.trim() && 
    clientProfile.industry && 
    clientProfile.keywords.length > 0;

  return (
    <div className="h-full w-full overflow-auto bg-white dark:bg-viz-dark">
      <div className="min-h-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-viz-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-viz-light/20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Reddit CoPilot
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {isLoading ? (
                <Button disabled className="bg-slate-400">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </Button>
              ) : !isRedditConnected ? (
                <Button
                  onClick={handleConnectReddit}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Connect Reddit
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Connected ✅
                  </div>
                  <Link to="/mia/reddit-copilot/settings">
                    <Button variant="ghost" size="sm">
                      <SettingsIcon className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                <MessageCircle className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Automate authentic Reddit engagement with your brand voice.
            </h2>
            
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Connect your Reddit account, set up your brand profile, and let AI handle intelligent engagement across relevant communities.
            </p>
          </motion.div>

          {/* Connection Status */}
          {!isRedditConnected ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    Connect Your Reddit Account
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 mb-6">
                    Link your Reddit account to start automating engagement with GEO-optimized responses.
                  </p>
                  <Button
                    onClick={handleConnectReddit}
                    disabled={isConnecting}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Connecting to Reddit...
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-5 h-5 mr-2" />
                        Connect Reddit Account
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="max-w-2xl mx-auto mb-8"
            >
              <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    Reddit Connected
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Connected as <span className="font-medium text-green-600 dark:text-green-400">u/{redditToken?.reddit_username}</span>
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Setup Flow */}
          {isRedditConnected && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              {/* Step 1: Client Setup */}
              <Card className={`border-2 transition-all ${
                !isProfileComplete 
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' 
                  : 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      !isProfileComplete 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {!isProfileComplete ? '1' : '✓'}
                    </div>
                    <CardTitle className="text-lg">Client Setup</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Configure your USP, industry, and target keywords for personalized engagement.
                  </p>
                  <Link to="/mia/reddit-copilot/client-setup">
                    <Button 
                      variant={!isProfileComplete ? "default" : "outline"} 
                      className="w-full"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {!isProfileComplete ? 'Setup Profile' : 'Edit Profile'}
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Step 2: Agent Control */}
              <Card className={`border-2 transition-all ${
                !isProfileComplete 
                  ? 'border-slate-200 dark:border-slate-700 opacity-60' 
                  : 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10'
              }`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      !isProfileComplete 
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-600 dark:text-slate-300' 
                        : 'bg-blue-500 text-white'
                    }`}>
                      2
                    </div>
                    <CardTitle className="text-lg">Agent Control</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Run the Reddit commenting agent and monitor live engagement activity.
                  </p>
                  <Link to="/mia/reddit-copilot/agent-control">
                    <Button 
                      variant="default" 
                      className="w-full"
                      disabled={!isProfileComplete}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Agent Control
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Step 3: Settings */}
              <Card className="border-slate-200 dark:border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">
                      3
                    </div>
                    <CardTitle className="text-lg">Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    Manage your Reddit tokens and account settings securely.
                  </p>
                  <Link to="/mia/reddit-copilot/settings">
                    <Button variant="outline" className="w-full">
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Features Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <Card className="border-slate-200 dark:border-viz-light/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Smart Detection</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  AI identifies relevant Reddit posts based on your industry and keywords
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-viz-light/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">GEO Optimized</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Responses crafted using Generative Engine Optimization best practices
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-viz-light/20">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Brand Voice</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Maintains your unique brand voice and USP across all engagements
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RedditCoPilotDashboard;
