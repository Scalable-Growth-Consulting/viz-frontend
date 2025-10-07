import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Loader from '@/components/ui/loader';
import { toast } from '@/hooks/use-toast';
import { useMetaIntegration } from '@/modules/MIA/hooks/useMetaIntegration';
import { CheckCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';

const MIARegularUser: React.FC = () => {
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleSyncLoading, setGoogleSyncLoading] = useState(false);

  const {
    connectionStatus,
    loading: metaLoading,
    syncing: metaSyncLoading,
    connect: connectMeta,
    disconnect: disconnectMeta,
    sync: syncMeta
  } = useMetaIntegration();

  const isMetaConnected = connectionStatus.isConnected;

  // Google Integration Functions (placeholder - implement based on your backend)
  const connectGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      // TODO: Implement Google OAuth flow similar to Meta
      // const response = await fetch(`${baseUrl}/auth/google/start`, { method: 'POST' });
      // Handle Google OAuth popup flow
      toast({
        title: "Google Ads Connected",
        description: "Successfully connected to Google Ads account.",
      });
      setIsGoogleConnected(true);
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to Google Ads. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      // TODO: Implement Google disconnect
      toast({
        title: "Google Ads Disconnected",
        description: "Successfully disconnected from Google Ads account.",
      });
      setIsGoogleConnected(false);
    } catch (error) {
      toast({
        title: "Disconnect Failed",
        description: "Failed to disconnect from Google Ads.",
        variant: "destructive",
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const syncGoogle = async () => {
    setGoogleSyncLoading(true);
    try {
      // TODO: Implement Google data sync
      toast({
        title: "Sync Complete",
        description: "Google Ads data has been synchronized successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync Google Ads data.",
        variant: "destructive",
      });
    } finally {
      setGoogleSyncLoading(false);
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

      {/* Integration Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Meta Ads Integration */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-lg">M</span>
                </div>
                <div>
                  <CardTitle className="text-xl">Meta Ads</CardTitle>
                  <CardDescription>Facebook & Instagram advertising platform</CardDescription>
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
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Connect your Meta Ads account to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Import campaign performance data</li>
                <li>Analyze ad spending and ROI</li>
                <li>Track audience insights</li>
                <li>Monitor campaign metrics</li>
              </ul>
            </div>

            <div className="flex gap-2">
              {isMetaConnected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectMeta}
                    disabled={metaLoading}
                  >
                    {metaLoading ? <Loader className="w-4 h-4 mr-2" /> : null}
                    Disconnect
                  </Button>
                  <Button
                    size="sm"
                    onClick={syncMeta}
                    disabled={metaSyncLoading}
                  >
                    {metaSyncLoading ? <Loader className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Data
                  </Button>
                </>
              ) : (
                <Button
                  onClick={connectMeta}
                  disabled={metaLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {metaLoading ? <Loader className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Connect Meta Ads
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Google Ads Integration */}
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
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p>Connect your Google Ads account to:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Import search campaign data</li>
                <li>Analyze keyword performance</li>
                <li>Track conversion metrics</li>
                <li>Monitor ad spend efficiency</li>
              </ul>
            </div>

            <div className="flex gap-2">
              {isGoogleConnected ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectGoogle}
                    disabled={isGoogleLoading}
                  >
                    {isGoogleLoading ? <Loader className="w-4 h-4 mr-2" /> : null}
                    Disconnect
                  </Button>
                  <Button
                    size="sm"
                    onClick={syncGoogle}
                    disabled={googleSyncLoading}
                  >
                    {googleSyncLoading ? <Loader className="w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                    Sync Data
                  </Button>
                </>
              ) : (
                <Button
                  onClick={connectGoogle}
                  disabled={isGoogleLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isGoogleLoading ? <Loader className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                  Connect Google Ads
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Benefits Section */}
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
                <ExternalLink className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Optimize ROI</h3>
              <p className="text-sm text-muted-foreground">
                Make data-driven decisions to improve your advertising ROI
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MIARegularUser;