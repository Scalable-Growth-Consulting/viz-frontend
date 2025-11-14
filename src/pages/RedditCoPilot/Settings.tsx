import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings as SettingsIcon, Shield, Trash2, RefreshCw, Key, Clock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import redditCopilotAPI, { RedditToken } from '@/services/redditCopilotApi';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [redditToken, setRedditToken] = useState<RedditToken | null>(null);

  useEffect(() => {
    loadUserTokens();
  }, []);

  const loadUserTokens = async () => {
    try {
      setIsLoading(true);
      
      // Load Reddit tokens from Lambda API
      const tokens = await redditCopilotAPI.getUserTokens();
      setRedditToken(tokens);
    } catch (error) {
      console.error('Failed to load user tokens:', error);
      // Don't show error toast - user might not have tokens yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectReddit = async () => {
    setIsActionLoading(true);

    try {
      // Call Lambda API to revoke Reddit tokens
      await redditCopilotAPI.revokeRedditAuth();
      setRedditToken(null);

      toast({
        title: "Reddit Disconnected",
        description: "Your Reddit account has been disconnected successfully.",
      });
    } catch (error) {
      console.error('Failed to disconnect Reddit:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Reddit account. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRefreshToken = async () => {
    if (!redditToken) return;

    setIsActionLoading(true);

    try {
      // Call Lambda API to refresh the token
      const updatedToken = await redditCopilotAPI.refreshRedditToken();
      setRedditToken(updatedToken);

      toast({
        title: "Token Refreshed",
        description: "Your Reddit access token has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Failed to refresh token:', error);
      toast({
        title: "Error",
        description: "Failed to refresh token. Please try reconnecting.",
        variant: "destructive"
      });
    } finally {
      setIsActionLoading(false);
    }
  };

  const maskToken = (token: string) => {
    if (token.length <= 8) return token;
    return token.substring(0, 4) + '••••••••' + token.substring(token.length - 4);
  };

  const isTokenExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const formatExpiryTime = (expiresAt: string) => {
    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const diffMs = expiryDate.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffMs < 0) return 'Expired';
    if (diffHours > 0) return `${diffHours}h ${diffMinutes}m remaining`;
    return `${diffMinutes}m remaining`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-viz-dark">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-viz-dark/80 backdrop-blur-md border-b border-slate-200/50 dark:border-viz-light/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/mia/reddit-copilot')}
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Settings
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Account Settings
            </h2>
            <p className="text-slate-600 dark:text-slate-300">
              Manage your Reddit integration and security settings
            </p>
          </div>

          {/* Reddit Integration */}
          <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Reddit Token Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Loading token information...
                  </p>
                </div>
              ) : !redditToken ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    No Reddit Connection
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                    Connect your Reddit account from the main dashboard to manage tokens here.
                  </p>
                  <Button
                    onClick={() => navigate('/mia/reddit-copilot')}
                    variant="outline"
                  >
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Connection Status */}
                  <div className={`p-4 rounded-lg border-2 ${
                    isTokenExpired(redditToken.expires_at)
                      ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                      : 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-3 h-3 rounded-full ${
                            isTokenExpired(redditToken.expires_at) ? 'bg-red-500' : 'bg-green-500'
                          }`} />
                          <span className={`font-medium ${
                            isTokenExpired(redditToken.expires_at)
                              ? 'text-red-800 dark:text-red-200'
                              : 'text-green-800 dark:text-green-200'
                          }`}>
                            {isTokenExpired(redditToken.expires_at) ? 'Token Expired' : 'Connected'}
                          </span>
                        </div>
                        <p className={`text-sm ${
                          isTokenExpired(redditToken.expires_at)
                            ? 'text-red-700 dark:text-red-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}>
                          Reddit account: <span className="font-medium">u/{redditToken.reddit_username}</span>
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDisconnectReddit}
                        disabled={isActionLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        {isActionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Disconnecting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Disconnect
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Token Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-slate-200 dark:border-viz-light/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Key className="w-4 h-4 text-blue-500" />
                          Access Token
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-sm font-mono text-slate-600 dark:text-slate-400 break-all">
                              {maskToken(redditToken.access_token)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-600 dark:text-slate-300">
                              {formatExpiryTime(redditToken.expires_at)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 dark:border-viz-light/20">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <RefreshCw className="w-4 h-4 text-green-500" />
                          Refresh Token
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <p className="text-sm font-mono text-slate-600 dark:text-slate-400 break-all">
                              {maskToken(redditToken.refresh_token)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefreshToken}
                            disabled={isActionLoading}
                            className="w-full"
                          >
                            {isActionLoading ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Refreshing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh Token
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Security Notice */}
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                          Security & Encryption
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Your tokens are securely encrypted in AWS DynamoDB (KMS-enabled). 
                          We use industry-standard encryption to protect your Reddit credentials.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Profile Management */}
          <Card className="border-slate-200 dark:border-viz-light/20 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-purple-500" />
                Profile Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-viz-light/20 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Client Profile
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Manage your USP, industry, and target keywords
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/mia/reddit-copilot/client-setup')}
                  >
                    Edit Profile
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
