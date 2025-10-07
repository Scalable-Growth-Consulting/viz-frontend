import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Plus, 
  Settings, 
  ExternalLink,
  Twitter,
  Star,
  ShoppingBag,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  MessageCircle
} from 'lucide-react';
import { Platform, IntegrationStatus } from '../types';
import { brandlenzIntegrationService } from '../services/integrationService';
import { useBrandlenz } from '../hooks/useBrandlenz';
import { toast } from '@/hooks/use-toast';

const BrandlenzIntegrations: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [configuring, setConfiguring] = useState<Platform | null>(null);
  const { connectPlatform, disconnectPlatform } = useBrandlenz();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await brandlenzIntegrationService.getIntegrationStatuses();
      setIntegrations(data);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: Platform) => {
    try {
      await connectPlatform(platform);
      await loadIntegrations(); // Refresh after connection
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
    }
  };

  const handleDisconnect = async (platform: Platform) => {
    try {
      await disconnectPlatform(platform);
      await loadIntegrations(); // Refresh after disconnection
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    }
  };

  const handleSync = async (platform: Platform) => {
    try {
      await brandlenzIntegrationService.syncPlatform(platform);
      await loadIntegrations(); // Refresh after sync
    } catch (error) {
      console.error(`Failed to sync ${platform}:`, error);
    }
  };

  const handleConfigUpdate = async (platform: Platform, config: Partial<IntegrationStatus['configuration']>) => {
    try {
      await brandlenzIntegrationService.updatePlatformConfig(platform, config);
      await loadIntegrations(); // Refresh after config update
      setConfiguring(null);
    } catch (error) {
      console.error(`Failed to update ${platform} config:`, error);
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (platform) {
      case 'twitter': return <Twitter {...iconProps} />;
      case 'google_reviews': return <Star {...iconProps} />;
      case 'trustpilot': return <Star {...iconProps} />;
      case 'amazon': return <ShoppingBag {...iconProps} />;
      case 'shopify': return <ShoppingBag {...iconProps} />;
      case 'wordpress': return <Globe {...iconProps} />;
      case 'facebook': return <Facebook {...iconProps} />;
      case 'instagram': return <Instagram {...iconProps} />;
      case 'linkedin': return <Linkedin {...iconProps} />;
      case 'youtube': return <Youtube {...iconProps} />;
      case 'reddit': return <MessageCircle {...iconProps} />;
      default: return <ExternalLink {...iconProps} />;
    }
  };

  const getPlatformDisplayName = (platform: Platform) => {
    const names: Record<Platform, string> = {
      twitter: 'X (Twitter)',
      google_reviews: 'Google Reviews',
      trustpilot: 'Trustpilot',
      amazon: 'Amazon Reviews',
      shopify: 'Shopify Reviews',
      wordpress: 'WordPress',
      facebook: 'Facebook',
      instagram: 'Instagram',
      linkedin: 'LinkedIn',
      youtube: 'YouTube',
      reddit: 'Reddit',
    };
    return names[platform] || platform;
  };

  const getPlatformColor = (platform: Platform) => {
    const colors: Record<Platform, string> = {
      twitter: 'bg-blue-600 hover:bg-blue-700',
      google_reviews: 'bg-red-600 hover:bg-red-700',
      trustpilot: 'bg-green-600 hover:bg-green-700',
      amazon: 'bg-orange-600 hover:bg-orange-700',
      shopify: 'bg-green-700 hover:bg-green-800',
      wordpress: 'bg-blue-800 hover:bg-blue-900',
      facebook: 'bg-blue-700 hover:bg-blue-800',
      instagram: 'bg-pink-600 hover:bg-pink-700',
      linkedin: 'bg-blue-800 hover:bg-blue-900',
      youtube: 'bg-red-700 hover:bg-red-800',
      reddit: 'bg-orange-700 hover:bg-orange-800',
    };
    return colors[platform] || 'bg-gray-600 hover:bg-gray-700';
  };

  const getStatusIcon = (integration: IntegrationStatus) => {
    if (!integration.connected) {
      return <XCircle className="w-4 h-4 text-gray-400" />;
    }
    
    switch (integration.status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (integration: IntegrationStatus) => {
    if (!integration.connected) {
      return <Badge variant="secondary">Not Connected</Badge>;
    }
    
    switch (integration.status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>;
      case 'syncing':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Syncing</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'paused':
        return <Badge variant="outline">Paused</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatLastSync = (lastSync: string) => {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="mt-4 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Integrations</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Connect your social media and review platforms to monitor brand mentions
          </p>
        </div>
        <Button onClick={loadIntegrations} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh All
        </Button>
      </div>

      {/* Integration Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.platform} className="relative">
            <CardContent className="p-6">
              {/* Platform Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg text-white ${getPlatformColor(integration.platform)}`}>
                  {getPlatformIcon(integration.platform)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {getPlatformDisplayName(integration.platform)}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(integration)}
                    {getStatusBadge(integration)}
                  </div>
                </div>
              </div>

              {/* Connection Details */}
              {integration.connected ? (
                <div className="space-y-3">
                  <div className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Total Mentions:</span>
                      <span className="font-medium">{integration.dataPoints.totalMentions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Daily Average:</span>
                      <span className="font-medium">{integration.dataPoints.avgDailyMentions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Last Sync:</span>
                      <span className="font-medium">{formatLastSync(integration.lastSync)}</span>
                    </div>
                  </div>

                  {integration.errorMessage && (
                    <div className="p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
                      {integration.errorMessage}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSync(integration.platform)}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfiguring(integration.platform)}
                    >
                      <Settings className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.platform)}
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Connect to monitor mentions, reviews, and conversations about your brand.
                  </p>
                  <Button
                    onClick={() => handleConnect(integration.platform)}
                    className={`w-full text-white ${getPlatformColor(integration.platform)}`}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect {getPlatformDisplayName(integration.platform)}
                  </Button>
                </div>
              )}
            </CardContent>

            {/* Configuration Modal */}
            {configuring === integration.platform && (
              <div className="absolute inset-0 bg-white dark:bg-gray-900 rounded-lg border shadow-lg p-6 z-10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Configure {getPlatformDisplayName(integration.platform)}</h4>
                  <Button variant="ghost" size="sm" onClick={() => setConfiguring(null)}>
                    ×
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keywords">Keywords to Monitor</Label>
                    <Input
                      id="keywords"
                      placeholder="brand, product, company"
                      defaultValue={integration.configuration.keywords.join(', ')}
                    />
                  </div>

                  <div>
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      placeholder="en, es, fr"
                      defaultValue={integration.configuration.languages.join(', ')}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="replies">Include Replies</Label>
                    <Switch
                      id="replies"
                      defaultChecked={integration.configuration.includeReplies}
                    />
                  </div>

                  <div>
                    <Label htmlFor="engagement">Minimum Engagement</Label>
                    <Input
                      id="engagement"
                      type="number"
                      placeholder="0"
                      defaultValue={integration.configuration.minimumEngagement}
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        // Get form values and update config
                        const keywords = (document.getElementById('keywords') as HTMLInputElement)?.value.split(',').map(k => k.trim()).filter(Boolean) || [];
                        const languages = (document.getElementById('languages') as HTMLInputElement)?.value.split(',').map(l => l.trim()).filter(Boolean) || [];
                        const includeReplies = (document.getElementById('replies') as HTMLInputElement)?.checked || false;
                        const minimumEngagement = parseInt((document.getElementById('engagement') as HTMLInputElement)?.value || '0');

                        handleConfigUpdate(integration.platform, {
                          keywords,
                          languages,
                          includeReplies,
                          minimumEngagement,
                        });
                      }}
                    >
                      Save Changes
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setConfiguring(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Integration Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {integrations.filter(i => i.connected).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Connected</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {integrations.reduce((sum, i) => sum + i.dataPoints.totalMentions, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {integrations.reduce((sum, i) => sum + i.dataPoints.avgDailyMentions, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Daily Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {integrations.filter(i => i.status === 'error').length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandlenzIntegrations;
