import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Loader from '@/components/ui/loader';
import { toast } from '@/hooks/use-toast';
import { useMetaIntegration } from '../hooks/useMetaIntegration';
import { useGoogleIntegration } from '../hooks/useGoogleIntegration.ts';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw, BarChart3, Eye, TrendingUp } from 'lucide-react';

const MIARegularUser: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'meta' | 'google'>('overview');
  const [metaData, setMetaData] = useState<any>(null);
  const [googleData, setGoogleData] = useState<any>(null);

  // Meta Integration
  const {
    connectionStatus: metaConnectionStatus,
    loading: metaLoading,
    syncing: metaSyncLoading,
    connect: connectMeta,
    disconnect: disconnectMeta,
    sync: syncMeta,
    getCampaigns: getMetaCampaigns,
    checkStatus: checkMetaStatus
  } = useMetaIntegration();

  // Google Integration
  const {
    connectionStatus: googleConnectionStatus,
    loading: googleLoading,
    syncing: googleSyncLoading,
    connect: connectGoogle,
    disconnect: disconnectGoogle,
    sync: syncGoogle,
    getAccounts: getGoogleAccounts,
    getCampaigns: getGoogleCampaigns,
    getMetrics: getGoogleMetrics,
    checkStatus: checkGoogleStatus
  } = useGoogleIntegration();

  const isMetaConnected = metaConnectionStatus.isConnected;
  const isGoogleConnected = googleConnectionStatus.connected;

  // Load data when connections are established
  useEffect(() => {
    if (isMetaConnected && metaConnectionStatus.accountId) {
      loadMetaData();
    }
  }, [isMetaConnected, metaConnectionStatus.accountId]);

  useEffect(() => {
    if (isGoogleConnected && googleConnectionStatus.accountId) {
      loadGoogleData();
    }
  }, [isGoogleConnected, googleConnectionStatus.accountId]);

  const loadMetaData = async () => {
    try {
      if (metaConnectionStatus.accountId) {
        const campaigns = await getMetaCampaigns();
        setMetaData({ campaigns });
      }
    } catch (error) {
      console.error('Failed to load Meta data:', error);
    }
  };

  const loadGoogleData = async () => {
    try {
      if (googleConnectionStatus.accountId) {
        const [accounts, campaigns, metrics] = await Promise.all([
          getGoogleAccounts(),
          getGoogleCampaigns(googleConnectionStatus.accountId),
          getGoogleMetrics(googleConnectionStatus.accountId)
        ]);
        setGoogleData({ accounts, campaigns, metrics });
      }
    } catch (error) {
      console.error('Failed to load Google data:', error);
    }
  };

  const handleMetaSync = async () => {
    try {
      await syncMeta();
      await loadMetaData();
    } catch (error) {
      console.error('Meta sync failed:', error);
    }
  };

  const handleGoogleSync = async () => {
    try {
      await syncGoogle();
      await loadGoogleData();
    } catch (error) {
      console.error('Google sync failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Marketing Integration Agent
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Connect your advertising platforms to analyze and optimize your marketing campaigns
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('overview')}
          className="flex items-center space-x-2"
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </Button>
        <Button
          variant={selectedTab === 'meta' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('meta')}
          className="flex items-center space-x-2"
        >
          <span className="w-4 h-4 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">M</span>
          <span>Meta Ads</span>
        </Button>
        <Button
          variant={selectedTab === 'google' ? 'default' : 'outline'}
          onClick={() => setSelectedTab('google')}
          className="flex items-center space-x-2"
        >
          <span className="w-4 h-4 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">G</span>
          <span>Google Ads</span>
        </Button>
      </div>

      {/* Content Based on Selected Tab */}
      {selectedTab === 'overview' && (
        <>
          {/* Connection Status Overview */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">M</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Meta Ads</CardTitle>
                      <CardDescription>Facebook & Instagram platform</CardDescription>
                    </div>
                  </div>
                  {isMetaConnected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isMetaConnected ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Account ID: {metaConnectionStatus.accountId}
                    </p>
                    {metaData?.campaigns && (
                      <p className="text-sm text-muted-foreground">
                        Campaigns: {metaData.campaigns.length}
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={handleMetaSync}
                      disabled={metaSyncLoading}
                      className="w-full"
                    >
                      {metaSyncLoading ? <Loader className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Sync Data
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={connectMeta}
                    disabled={metaLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {metaLoading ? <Loader className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                    Connect Meta Ads
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">G</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">Google Ads</CardTitle>
                      <CardDescription>Google's advertising platform</CardDescription>
                    </div>
                  </div>
                  {isGoogleConnected ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Connected
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Connected
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isGoogleConnected ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Account: {googleConnectionStatus.accountName || 'Connected'}
                    </p>
                    {googleData?.campaigns && (
                      <p className="text-sm text-muted-foreground">
                        Campaigns: {googleData.campaigns.length}
                      </p>
                    )}
                    <Button
                      size="sm"
                      onClick={handleGoogleSync}
                      disabled={googleSyncLoading}
                      className="w-full"
                    >
                      {googleSyncLoading ? <Loader className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      Sync Data
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={connectGoogle}
                    disabled={googleLoading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    {googleLoading ? <Loader className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                    Connect Google Ads
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Metrics Overview */}
          {(isMetaConnected || isGoogleConnected) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Performance Overview</span>
                </CardTitle>
                <CardDescription>
                  Combined metrics from your connected advertising platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {googleData?.metrics && (
                    <>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {googleData.metrics.impressions.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {googleData.metrics.clicks.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">
                          ${googleData.metrics.cost.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Spend</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-orange-600">
                          {googleData.metrics.conversions}
                        </p>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {selectedTab === 'meta' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">M</span>
                  </div>
                  <span>Meta Ads Management</span>
                </CardTitle>
                <CardDescription>Manage your Facebook and Instagram advertising</CardDescription>
              </div>
              {isMetaConnected && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectMeta}
                    disabled={metaLoading}
                  >
                    Disconnect
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleMetaSync}
                    disabled={metaSyncLoading}
                  >
                    {metaSyncLoading ? <Loader className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Data
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isMetaConnected ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Account Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Account ID: {metaConnectionStatus.accountId}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Campaign Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Total Campaigns: {metaData?.campaigns?.length || 0}
                    </p>
                  </div>
                </div>

                {metaData?.campaigns && metaData.campaigns.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Campaigns</h3>
                    <div className="space-y-2">
                      {metaData.campaigns.slice(0, 5).map((campaign: any) => (
                        <div key={campaign.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">Status: {campaign.status}</p>
                          </div>
                          <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-blue-600 font-bold text-2xl">M</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Connect Meta Ads</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your Meta Ads account to start managing your Facebook and Instagram campaigns.
                </p>
                <Button
                  onClick={connectMeta}
                  disabled={metaLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {metaLoading ? <Loader className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Connect Meta Ads
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedTab === 'google' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-red-100 rounded flex items-center justify-center">
                    <span className="text-red-600 font-bold text-sm">G</span>
                  </div>
                  <span>Google Ads Management</span>
                </CardTitle>
                <CardDescription>Manage your Google advertising campaigns</CardDescription>
              </div>
              {isGoogleConnected && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectGoogle}
                    disabled={googleLoading}
                  >
                    Disconnect
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleGoogleSync}
                    disabled={googleSyncLoading}
                  >
                    {googleSyncLoading ? <Loader className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Data
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isGoogleConnected ? (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Account Information</h3>
                    <p className="text-sm text-muted-foreground">
                      Account: {googleConnectionStatus.accountName || 'Connected'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Campaign Summary</h3>
                    <p className="text-sm text-muted-foreground">
                      Total Campaigns: {googleData?.campaigns?.length || 0}
                    </p>
                  </div>
                </div>

                {googleData?.metrics && (
                  <div>
                    <h3 className="font-semibold mb-2">Performance Metrics</h3>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center p-4 border rounded">
                        <p className="text-2xl font-bold text-blue-600">
                          {googleData.metrics.impressions.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Impressions</p>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <p className="text-2xl font-bold text-green-600">
                          {googleData.metrics.clicks.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">Clicks</p>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <p className="text-2xl font-bold text-purple-600">
                          ${googleData.metrics.cost.toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground">Cost</p>
                      </div>
                      <div className="text-center p-4 border rounded">
                        <p className="text-2xl font-bold text-orange-600">
                          {googleData.metrics.conversions}
                        </p>
                        <p className="text-sm text-muted-foreground">Conversions</p>
                      </div>
                    </div>
                  </div>
                )}

                {googleData?.campaigns && googleData.campaigns.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Recent Campaigns</h3>
                    <div className="space-y-2">
                      {googleData.campaigns.slice(0, 5).map((campaign: any) => (
                        <div key={campaign.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Type: {campaign.type} | Budget: ${campaign.budget}
                            </p>
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
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 font-bold text-2xl">G</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Connect Google Ads</h3>
                <p className="text-muted-foreground mb-4">
                  Connect your Google Ads account to start managing your search and display campaigns.
                </p>
                <Button
                  onClick={connectGoogle}
                  disabled={googleLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {googleLoading ? <Loader className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Connect Google Ads
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benefits Section (only show on overview) */}
      {selectedTab === 'overview' && (
        <Card>
          <CardHeader>
            <CardTitle>Why Connect Your Advertising Platforms?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <RefreshCw className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Unified Data</h3>
                <p className="text-sm text-muted-foreground">
                  View all your advertising data in one centralized dashboard
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Better Insights</h3>
                <p className="text-sm text-muted-foreground">
                  Compare performance across platforms and identify opportunities
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Optimize ROI</h3>
                <p className="text-sm text-muted-foreground">
                  Make data-driven decisions to improve your advertising ROI
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MIARegularUser;