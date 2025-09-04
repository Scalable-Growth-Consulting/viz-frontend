import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  RefreshCw,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { IntegrationConfig } from '../types';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fetchIntegrationStatuses, connectPlatform } from '../services/integrationStatusService';

const MIAIntegrationStatus: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [integrations, setIntegrations] = useState<IntegrationConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingPlatform, setConnectingPlatform] = useState<IntegrationConfig['platform'] | null>(null);

  const loadStatuses = async () => {
    try {
      const data = await fetchIntegrationStatuses(user?.id);
      setIntegrations(data);
    } catch (err) {
      console.error('Failed to load integration statuses:', err);
      toast({
        title: 'Error loading integration statuses',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleConnect = async (platform: IntegrationConfig['platform']) => {
    try {
      setConnectingPlatform(platform);
      await connectPlatform(platform);
      toast({
        title: 'Continue in popup',
        description: 'Complete the provider sign-in to connect.',
      });
    } catch (err: any) {
      console.error('Connect error:', err);
      toast({
        title: 'Unable to connect',
        description: err?.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setConnectingPlatform(null);
      // Refresh after the OAuth attempt
      loadStatuses();
    }
  };

  const handleManageClick = () => {
    toast({ title: 'Manage integrations', description: 'Management UI coming soon.' });
  };

  const getStatusIcon = (config: IntegrationConfig) => {
    if (!config.isConnected) {
      return <XCircle className="w-4 h-4 text-gray-400" />;
    }
    
    switch (config.syncStatus) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (config: IntegrationConfig) => {
    if (!config.isConnected) {
      return <Badge variant="secondary">Not Connected</Badge>;
    }
    
    switch (config.syncStatus) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Idle</Badge>;
    }
  };

  const formatLastSync = (lastSync?: string) => {
    if (!lastSync) return 'Never';
    
    const date = new Date(lastSync);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getPlatformName = (platform: string) => {
    switch (platform) {
      case 'meta':
        return 'Meta (Facebook)';
      case 'google':
        return 'Google Ads';
      case 'linkedin':
        return 'LinkedIn Ads';
      case 'tiktok':
        return 'TikTok Ads';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const connectedIntegrations = integrations.filter(i => i.isConnected);
  const hasErrors = integrations.some(i => i.syncStatus === 'error');

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Integration Status</CardTitle>
            <div className="h-8 w-24 bg-slate-200 dark:bg-viz-light/10 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0,1,2,3].map((i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-slate-200 dark:bg-viz-light/10 rounded" />
                      <div className="h-4 w-32 bg-slate-200 dark:bg-viz-light/10 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-6 w-24 bg-slate-200 dark:bg-viz-light/10 rounded" />
                    <div className="space-y-1 text-xs">
                      <div className="h-3 w-40 bg-slate-200 dark:bg-viz-light/10 rounded" />
                      <div className="h-3 w-32 bg-slate-200 dark:bg-viz-light/10 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Integration Status</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {connectedIntegrations.length} of {integrations.length} connected
            </Badge>
            <Button variant="outline" size="sm" onClick={handleManageClick} className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {integrations.map((integration) => (
              <div
                key={integration.platform}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(integration)}
                    <span className="font-medium">{getPlatformName(integration.platform)}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {getStatusBadge(integration)}
                  
                  {integration.isConnected ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {integration.accountId && (
                        <div>Account: {integration.accountId}</div>
                      )}
                      <div>Last sync: {formatLastSync(integration.lastSync)}</div>
                      {integration.errorMessage && (
                        <div className="text-red-600 dark:text-red-400">
                          Error: {integration.errorMessage}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full text-xs"
                      onClick={() => handleConnect(integration.platform)}
                      disabled={connectingPlatform === integration.platform}
                    >
                      {connectingPlatform === integration.platform ? (
                        <>
                          <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3 mr-1" />
                          Connect
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some integrations have sync errors. Check the integration settings and try reconnecting.
          </AlertDescription>
        </Alert>
      )}

      {connectedIntegrations.length === 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              No ad platforms connected. Connect your first platform to start analyzing marketing performance.
            </span>
            <Button variant="outline" size="sm" className="ml-4">
              <ExternalLink className="w-4 h-4 mr-2" />
              Setup Guide
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MIAIntegrationStatus;
