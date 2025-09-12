import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  BarChart3,
  Eye,
  TrendingUp,
  DollarSign,
  MousePointer,
  Target,
  Users,
  Loader2,
  Settings,
  Zap
} from 'lucide-react';
import { useGoogleIntegration } from '../hooks/useGoogleIntegration';

interface MIAGoogleIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
}

const MIAGoogleIntegration: React.FC<MIAGoogleIntegrationProps> = ({ onConnectionChange }) => {
  const [googleData, setGoogleData] = useState<any>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const { toast } = useToast();

  const {
    connectionStatus,
    loading,
    syncing,
    connect: connectGoogle,
    disconnect: disconnectGoogle,
    sync: syncGoogle,
    getAccounts,
    getCampaigns,
    getMetrics,
    refreshToken,
    checkStatus
  } = useGoogleIntegration();

  const isConnected = connectionStatus.connected;

  useEffect(() => {
    onConnectionChange?.(isConnected);
  }, [isConnected, onConnectionChange]);

  useEffect(() => {
    if (isConnected && connectionStatus.accountId) {
      loadGoogleData();
    }
  }, [isConnected, connectionStatus.accountId]);

  const loadGoogleData = async () => {
    try {
      if (connectionStatus.accountId) {
        const [accounts, campaigns, metrics] = await Promise.all([
          getAccounts(),
          getCampaigns(connectionStatus.accountId),
          getMetrics(connectionStatus.accountId)
        ]);
        
        setGoogleData({ accounts, campaigns, metrics });
        if (accounts.length > 0 && !selectedAccount) {
          setSelectedAccount(accounts[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load Google data:', error);
      toast({
        title: "Data Load Failed",
        description: "Failed to load Google Ads data. Please try refreshing.",
        variant: "destructive",
      });
    }
  };

  const handleConnect = async () => {
    try {
      await connectGoogle();
      await loadGoogleData();
      toast({
        title: "Google Ads Connected! 🎉",
        description: "Successfully connected to your Google Ads account.",
      });
    } catch (error) {
      console.error('Google connection failed:', error);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogle();
      setGoogleData(null);
      setSelectedAccount('');
      toast({
        title: "Google Ads Disconnected",
        description: "Successfully disconnected from Google Ads.",
      });
    } catch (error) {
      console.error('Google disconnection failed:', error);
    }
  };

  const handleSync = async () => {
    try {
      await syncGoogle();
      await loadGoogleData();
    } catch (error) {
      console.error('Google sync failed:', error);
    }
  };

  const handleRefreshToken = async () => {
    try {
      await refreshToken();
      await checkStatus();
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(2)}%`;
  };

  return (
    <Card className="bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">G</span>
            </div>
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                Google Ads Integration
                {isConnected && (
                  <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isConnected 
                  ? `Connected to ${connectionStatus.accountName || 'Google Ads'}`
                  : 'Connect your Google Ads account to access campaign data and insights'
                }
              </CardDescription>
            </div>
          </div>
          
          {isConnected && (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshToken}
                disabled={loading}
                className="text-xs"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Refresh Token
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={loading}
                className="text-xs"
              >
                <Settings className="w-3 h-3 mr-1" />
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isConnected ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/20 dark:to-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 dark:text-red-400 font-bold text-2xl">G</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">Connect Google Ads</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Unlock powerful insights by connecting your Google Ads account. Get detailed campaign analytics, 
              performance metrics, and AI-powered optimization recommendations.
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-6 max-w-md mx-auto">
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                <BarChart3 className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Campaign Analytics</div>
                <div className="text-xs text-muted-foreground">Real-time performance</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                <Zap className="w-6 h-6 mx-auto mb-2 text-yellow-600" />
                <div className="text-sm font-medium">AI Optimization</div>
                <div className="text-xs text-muted-foreground">Smart recommendations</div>
              </div>
            </div>

            <Button
              onClick={handleConnect}
              disabled={loading}
              size="lg"
              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Connect Google Ads
                </>
              )}
            </Button>
            
            <div className="mt-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <strong>Note:</strong> You'll be redirected to Google for secure authentication. 
                  We only access campaign data with your permission.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <div className="font-medium text-green-900 dark:text-green-100">
                    Google Ads Connected
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">
                    Account: {connectionStatus.accountName || connectionStatus.accountId}
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSync}
                disabled={syncing}
                size="sm"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-300"
              >
                {syncing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Data
                  </>
                )}
              </Button>
            </div>

            {/* Performance Metrics */}
            {googleData?.metrics && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  Performance Overview
                </h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-viz-light/20 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      {formatNumber(googleData.metrics.impressions)}
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">Impressions</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-viz-light/20 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                    <MousePointer className="w-5 h-5 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {formatNumber(googleData.metrics.clicks)}
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300">Clicks</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-viz-light/20 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                    <DollarSign className="w-5 h-5 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                      {formatCurrency(googleData.metrics.cost)}
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300">Spend</div>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-viz-light/20 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20">
                    <Target className="w-5 h-5 mx-auto mb-2 text-orange-600" />
                    <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                      {formatNumber(googleData.metrics.conversions)}
                    </div>
                    <div className="text-sm text-orange-700 dark:text-orange-300">Conversions</div>
                  </div>
                </div>
                
                {/* Key Ratios */}
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                    <div className="text-lg font-bold">{formatPercentage(googleData.metrics.ctr)}</div>
                    <div className="text-xs text-muted-foreground">CTR</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                    <div className="text-lg font-bold">{formatCurrency(googleData.metrics.cpc)}</div>
                    <div className="text-xs text-muted-foreground">CPC</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                    <div className="text-lg font-bold">{formatPercentage(googleData.metrics.conversionRate)}</div>
                    <div className="text-xs text-muted-foreground">Conv. Rate</div>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Account Summary */}
            {googleData?.accounts && googleData.accounts.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-red-600" />
                  Google Ads Accounts ({googleData.accounts.length})
                </h4>
                <div className="space-y-2">
                  {googleData.accounts.slice(0, 3).map((account: any) => (
                    <div key={account.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-viz-light/20 bg-white dark:bg-viz-dark/40">
                      <div>
                        <div className="font-medium">{account.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {account.id} • {account.currency} • {account.timezone}
                        </div>
                      </div>
                      <Badge variant={account.status === 'ENABLED' ? 'default' : 'secondary'}>
                        {account.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Campaign Summary */}
            {googleData?.campaigns && googleData.campaigns.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-600" />
                  Recent Campaigns ({googleData.campaigns.length})
                </h4>
                <div className="space-y-2">
                  {googleData.campaigns.slice(0, 3).map((campaign: any) => (
                    <div key={campaign.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-viz-light/20 bg-white dark:bg-viz-dark/40">
                      <div>
                        <div className="font-medium">{campaign.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {campaign.type} • Budget: {formatCurrency(campaign.budget)} • {campaign.biddingStrategy}
                        </div>
                      </div>
                      <Badge variant={campaign.status === 'ENABLED' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MIAGoogleIntegration;