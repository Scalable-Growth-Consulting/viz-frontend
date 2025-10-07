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
  Twitter,
  Star,
  ShoppingBag,
  Globe,
  MessageSquare,
  Camera,
  Briefcase,
  Youtube,
  Users,
} from 'lucide-react';
import { Platform, IntegrationStatus } from '../types';
import { useBrandlenz } from '../hooks/useBrandlenz';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const BrandlenzIntegrationStatus: React.FC = () => {
  const { 
    integrationStatuses,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
    loading,
  } = useBrandlenz();

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

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case 'twitter':
        return <Twitter className="w-5 h-5" />;
      case 'google_reviews':
        return <Star className="w-5 h-5" />;
      case 'trustpilot':
        return <Star className="w-5 h-5" />;
      case 'amazon':
        return <ShoppingBag className="w-5 h-5" />;
      case 'shopify':
        return <ShoppingBag className="w-5 h-5" />;
      case 'wordpress':
        return <Globe className="w-5 h-5" />;
      case 'facebook':
        return <MessageSquare className="w-5 h-5" />;
      case 'instagram':
        return <Camera className="w-5 h-5" />;
      case 'linkedin':
        return <Briefcase className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'reddit':
        return <Users className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: Platform) => {
    switch (platform) {
      case 'twitter':
        return 'from-blue-400 to-blue-600';
      case 'google_reviews':
        return 'from-red-400 to-red-600';
      case 'trustpilot':
        return 'from-green-400 to-green-600';
      case 'amazon':
        return 'from-orange-400 to-orange-600';
      case 'shopify':
        return 'from-green-400 to-emerald-600';
      case 'wordpress':
        return 'from-blue-600 to-indigo-600';
      case 'facebook':
        return 'from-blue-500 to-blue-700';
      case 'instagram':
        return 'from-pink-400 to-purple-600';
      case 'linkedin':
        return 'from-blue-600 to-blue-800';
      case 'youtube':
        return 'from-red-500 to-red-700';
      case 'reddit':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  const getPlatformName = (platform: Platform) => {
    switch (platform) {
      case 'twitter':
        return 'X (Twitter)';
      case 'google_reviews':
        return 'Google Reviews';
      case 'trustpilot':
        return 'Trustpilot';
      case 'amazon':
        return 'Amazon';
      case 'shopify':
        return 'Shopify';
      case 'wordpress':
        return 'WordPress';
      case 'facebook':
        return 'Facebook';
      case 'instagram':
        return 'Instagram';
      case 'linkedin':
        return 'LinkedIn';
      case 'youtube':
        return 'YouTube';
      case 'reddit':
        return 'Reddit';
      default:
        // Convert platform names like 'google_reviews' to 'Google Reviews'
        return platform
          .split('_')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
    }
  };

  const getStatusIcon = (status: IntegrationStatus) => {
    if (status.connected) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status.error) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: IntegrationStatus) => {
    if (status.connected) {
      return <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Connected</Badge>;
    } else if (status.error) {
      return <Badge variant="destructive">Error</Badge>;
    } else {
      return <Badge variant="secondary">Not Connected</Badge>;
    }
  };

  const handleConnect = async (platform: Platform) => {
    try {
      await connectPlatform(platform);
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      await disconnectPlatform(platform);
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    }
  };

  const handleSync = async (platform: Platform) => {
    try {
      await syncPlatform(platform);
    } catch (error) {
      console.error(`Failed to sync ${platform}:`, error);
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Globe className="w-5 h-5 text-white" />
          </div>
          Platform Integrations
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your brand monitoring sources to gather comprehensive insights
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Integration Carousel */}
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: false,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {integrationStatuses.map((status) => (
                <CarouselItem key={status.platform} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Card className="h-full bg-white dark:bg-viz-dark border border-slate-200/50 dark:border-viz-light/20 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 space-y-3">
                      {/* Platform Header */}
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${getPlatformColor(status.platform)} text-white`}>
                          {getPlatformIcon(status.platform)}
                        </div>
                        {getStatusIcon(status)}
                      </div>

                      {/* Platform Name */}
                      <div>
                        <h3 className="font-medium text-sm">{getPlatformName(status.platform)}</h3>
                        <div className="mt-1">
                          {getStatusBadge(status)}
                        </div>
                      </div>

                      {/* Connection Info */}
                      {status.connected && status.accountInfo && (
                        <div className="text-xs text-muted-foreground">
                          <p className="truncate">{status.accountInfo.name || status.accountInfo.username}</p>
                          {status.lastSync && (
                            <p>Last sync: {new Date(status.lastSync).toLocaleDateString()}</p>
                          )}
                        </div>
                      )}

                      {/* Error Message */}
                      {status.error && (
                        <Alert className="py-2">
                          <AlertDescription className="text-xs">
                            {status.error}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {status.connected ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSync(status.platform)}
                              disabled={loading[status.platform]}
                              className="flex-1 text-xs"
                            >
                              {loading[status.platform] ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <RefreshCw className="w-3 h-3" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDisconnect(status.platform)}
                              disabled={loading[status.platform]}
                              className="flex-1 text-xs"
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleConnect(status.platform)}
                            disabled={loading[status.platform]}
                            className={`w-full text-xs bg-gradient-to-r ${getPlatformColor(status.platform)} hover:opacity-90 text-white border-0`}
                          >
                            {loading[status.platform] ? (
                              <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                            ) : (
                              <Plus className="w-3 h-3 mr-1" />
                            )}
                            Connect
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/50 dark:border-viz-light/20">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {integrationStatuses.filter(s => s.connected).length}
            </div>
            <div className="text-xs text-muted-foreground">Connected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {integrationStatuses.filter(s => !s.connected && !s.error).length}
            </div>
            <div className="text-xs text-muted-foreground">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {integrationStatuses.filter(s => s.error).length}
            </div>
            <div className="text-xs text-muted-foreground">Errors</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BrandlenzIntegrationStatus;
