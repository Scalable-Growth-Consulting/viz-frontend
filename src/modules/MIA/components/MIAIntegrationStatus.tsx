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
import { useMetaIntegration } from '../hooks/useMetaIntegration';
import { useGoogleIntegration } from '../hooks/useGoogleIntegration';
import { useWooCommerceIntegration } from '../hooks/useWooCommerceIntegration';
import { useGa4Integration } from '../hooks/useGa4Integration';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const MIAIntegrationStatus: React.FC = () => {
  const { 
    connectionStatus: metaStatus,
    connect: connectMeta,
    disconnect: disconnectMeta,
    sync: syncMeta,
    loading: metaLoading,
  } = useMetaIntegration();

  const {
    connectionStatus: googleStatus,
    connect: connectGoogle,
    disconnect: disconnectGoogle,
    sync: syncGoogle,
    loading: googleLoading,
  } = useGoogleIntegration();

  const {
    connectionStatus: woocommerceStatus,
    connect: connectWooCommerce,
    disconnect: disconnectWooCommerce,
    sync: syncWooCommerce,
    loading: woocommerceLoading,
  } = useWooCommerceIntegration();

  // GA4 hook (different shape) - keep as object and access safely
  const ga4 = useGa4Integration();
  const ga4Status = ga4.connectionStatus;
  const connectGa4 = ga4.connect;
  const disconnectGa4 = ga4.disconnect;
  const ga4Loading = ga4.loading;

  // Responsive slides to scroll (1/2/4) for the carousel arrows
  const [slidesToScroll, setSlidesToScroll] = React.useState(4);
  React.useEffect(() => {
    const compute = () => {
      const w = window.innerWidth;
      if (w < 640) setSlidesToScroll(1);
      else if (w < 1024) setSlidesToScroll(2);
      else setSlidesToScroll(4);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  // Create integrations array with real Meta data and mock data for others
  const integrations: IntegrationConfig[] = [
    {
      platform: 'meta',
      isConnected: metaStatus.isConnected,
      lastSync: metaStatus.lastSync,
      syncStatus: metaStatus.status === 'connected' ? 'success' : 
                  metaStatus.status === 'connecting' ? 'syncing' : 
                  metaStatus.status === 'error' ? 'error' : 'idle',
      accountId: metaStatus.accountId,
      errorMessage: metaStatus.errorMessage,
    },
    {
      platform: 'google',
      isConnected: !!googleStatus.connected,
      syncStatus: googleStatus.status === 'connected' ? 'success' : (googleStatus.status === 'error' ? 'error' : 'idle'),
      accountId: googleStatus.accountId,
    },
    { platform: 'linkedin', isConnected: false, syncStatus: 'idle' },
    { platform: 'tiktok', isConnected: false, syncStatus: 'idle' },
    { platform: 'shopify', isConnected: false, syncStatus: 'idle' },
    {
      platform: 'woocommerce',
      isConnected: woocommerceStatus.connected,
      lastSync: woocommerceStatus.connected ? new Date().toISOString() : undefined,
      syncStatus: woocommerceStatus.status === 'connected' ? 'success' : 
                  woocommerceStatus.status === 'error' ? 'error' : 'idle',
      accountId: woocommerceStatus.siteName || woocommerceStatus.siteUrl,
      errorMessage: woocommerceStatus.errorMessage,
    },
    { platform: 'x', isConnected: false, syncStatus: 'idle' },
    // GA4 entry (safe access because GA4 status shape differs)
    {
      platform: 'ga4',
      isConnected: !!(((ga4Status as any)?.authenticated) ?? ((ga4Status as any)?.connected) ?? ((ga4Status as any)?.isConnected)),
      lastSync: (ga4Status as any)?.lastSync ?? (ga4Status as any)?.syncedAt,
      syncStatus: (ga4Status as any)?.status === 'connected' || (ga4Status as any)?.authenticated ? 'success' : ((ga4Status as any)?.status === 'error' ? 'error' : 'idle'),
      accountId: (ga4Status as any)?.accountId ?? (ga4Status as any)?.propertyId ?? (ga4Status as any)?.user_id,
      errorMessage: (ga4Status as any)?.errorMessage ?? (ga4Status as any)?.error,
    },
  ];

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
      case 'shopify':
        return 'Shopify';
      case 'woocommerce':
        return 'WooCommerce';
      case 'ga4':
        return 'Google Analytics (GA4)';
      case 'x':
        return 'X (Twitter)';
      default:
        return platform.charAt(0).toUpperCase() + platform.slice(1);
    }
  };

  const connectedIntegrations = integrations.filter(i => i.isConnected);
  const hasErrors = integrations.some(i => i.syncStatus === 'error');

  // per-platform loading helper (used to disable/show loading on buttons)
  const isPlatformLoading = (platform: string) => {
    if (platform === 'meta') return metaLoading;
    if (platform === 'google') return googleLoading;
    if (platform === 'woocommerce') return woocommerceLoading;
    if (platform === 'ga4') return ga4Loading;
    return false;
  };

  const handleConnect = async (platform: string) => {
    if (platform === 'meta') return connectMeta();
    if (platform === 'google') return connectGoogle();
    if (platform === 'woocommerce') return connectWooCommerce();
    if (platform === 'ga4') return connectGa4();
    return Promise.resolve();
  };

  const handleSync = async (platform: string) => {
    if (platform === 'meta') return syncMeta();
    if (platform === 'google') return syncGoogle();
    if (platform === 'woocommerce') return syncWooCommerce();
    if (platform === 'ga4') {
      // GA4 hook may not expose a `sync` method — guard and call if present
      const maybeSync = (ga4 as any).sync;
      return typeof maybeSync === 'function' ? maybeSync() : Promise.resolve();
    }
    return Promise.resolve();
  };

  const handleDisconnect = async (platform: string) => {
    if (platform === 'meta') return disconnectMeta();
    if (platform === 'google') return disconnectGoogle();
    if (platform === 'woocommerce') return disconnectWooCommerce();
    if (platform === 'ga4') return disconnectGa4();
    return Promise.resolve();
  };

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
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Manage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Carousel
            opts={{ align: 'start', dragFree: false, containScroll: 'trimSnaps', slidesToScroll }}
            className="px-2"
          >
            <CarouselContent>
              {integrations.map((integration) => (
                <CarouselItem key={integration.platform} className="basis-full sm:basis-1/2 lg:basis-1/4">
                  <div className="h-full border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-white/85 dark:bg-viz-medium/80 hover:shadow-sm transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(integration)}
                        <span className="font-medium">{getPlatformName(integration.platform)}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {getStatusBadge(integration)}

                      {integration.isConnected ? (
                        <div className="space-y-2">
                          <div className="space-y-1 text-xs text-muted-foreground">
                            <div>Account: {integration.accountId || '—'}</div>
                            <div>Last sync: {formatLastSync(integration.lastSync)}</div>
                            {integration.errorMessage && (
                              <div className="text-red-600 dark:text-red-400">
                                Error: {integration.errorMessage}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleSync(integration.platform)}
                            >
                              <RefreshCw className="w-3.5 h-3.5 mr-1" />
                              Sync
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => handleDisconnect(integration.platform)}
                            >
                              Disconnect
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleConnect(integration.platform)}
                          size="sm"
                          className={`${integration.platform === 'meta' 
                            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                            : integration.platform === 'google' 
                              ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white'
                              : integration.platform === 'ga4'
                                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white'
                                : integration.platform === 'woocommerce'
                                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white'
                                  : 'opacity-60 cursor-not-allowed'} rounded-full px-4 min-w-[200px] justify-center w-full text-xs`}
                          disabled={
                            !(integration.platform === 'meta' || integration.platform === 'google' || integration.platform === 'woocommerce' || integration.platform === 'ga4')
                            || isPlatformLoading(integration.platform)
                          }
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {isPlatformLoading(integration.platform) ? 'Connecting...' : 'Connect'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-2 top-1/2 -translate-y-1/2" />
            <CarouselNext className="right-2 top-1/2 -translate-y-1/2" />
          </Carousel>
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