import React, { useEffect } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Facebook,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Unlink,
  Calendar,
  BarChart3,
} from 'lucide-react';
import { useMetaIntegration } from '../hooks/useMetaIntegration';

interface MIAMetaIntegrationProps {
  onConnectionChange?: (connected: boolean) => void;
  variant?: 'full' | 'compact' | 'tile';
}

const MIAMetaIntegration: React.FC<MIAMetaIntegrationProps> = ({ onConnectionChange, variant = 'full' }) => {
  const {
    connectionStatus,
    loading,
    syncing,
    connect,
    disconnect,
    sync,
  } = useMetaIntegration();
  
  const { toast } = useToast();
  const isCompact = variant === 'compact';
  const isTile = variant === 'tile';

  useEffect(() => {
    onConnectionChange?.(connectionStatus.isConnected);
  }, [connectionStatus.isConnected, onConnectionChange]);

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: 'Meta Connected',
        description: 'Successfully connected to your Meta Ads account.',
      });
    } catch (error) {
      console.error('Meta connection error:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect to Meta. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: 'Meta Disconnected',
        description: 'Successfully disconnected from Meta Ads account.',
      });
    } catch (error) {
      console.error('Meta disconnection error:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect from Meta. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSync = async () => {
    try {
      await sync();
      toast({
        title: 'Sync Complete',
        description: 'Meta campaign data has been synchronized.',
      });
    } catch (error) {
      console.error('Meta sync error:', error);
      toast({
        title: 'Sync Failed',
        description: 'Failed to sync Meta data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Tile variant: minimal uniform card for 2x2 grid
  if (isTile) {
    return (
      <Card className="h-full min-h-[190px] bg-white/85 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 rounded-xl shadow-sm transition hover:shadow-md hover:-translate-y-0.5">
        <CardHeader className="py-3">
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
                <Facebook className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="font-semibold">Meta Ads</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-300">{connectionStatus.isConnected ? 'Connected' : 'Not Connected'}</div>
              </div>
            </div>
            <Badge variant={connectionStatus.isConnected ? 'default' : 'outline'} className={connectionStatus.isConnected ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' : ''}>
              {connectionStatus.isConnected ? 'Connected' : 'Not Connected'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[110px] flex items-center justify-center">
          {!connectionStatus.isConnected ? (
            <Button
              onClick={handleConnect}
              disabled={loading}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSync}
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <RefreshCw className="w-3 h-3 mr-1" /> Sync
              </Button>
              <Button
                onClick={handleDisconnect}
                size="sm"
                variant="outline"
                className="rounded-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Unlink className="w-3 h-3 mr-1" /> Disconnect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Connecting
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            Not Connected
          </Badge>
        );
    }
  };

  return (
    <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 rounded-xl shadow transition hover:shadow-lg">
      <CardHeader className="py-4">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
              <Facebook className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-semibold">Meta Ads</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Facebook & Instagram advertising platform
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {connectionStatus.isConnected ? (
          <>
            {/* Connected State */}
            <div className="space-y-2">
              {!isCompact && connectionStatus.accountName && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                  <div>
                    <div className="font-medium text-xs">Account</div>
                    <div className="text-slate-600 dark:text-slate-300 text-xs">
                      {connectionStatus.accountName}
                    </div>
                  </div>
                  <BarChart3 className="w-3.5 h-3.5 text-viz-accent" />
                </div>
              )}

              {!isCompact && connectionStatus.lastSync && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                  <div>
                    <div className="font-medium text-xs">Last Sync</div>
                    <div className="text-slate-600 dark:text-slate-300 text-xs">
                      {new Date(connectionStatus.lastSync).toLocaleString()}
                    </div>
                  </div>
                  <Calendar className="w-3.5 h-3.5 text-viz-accent" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1"
                  variant="outline"
                  size="sm"
                >
                  {syncing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-2" />
                      Sync Data
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDisconnect}
                  disabled={loading}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Unlink className="w-3.5 h-3.5 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <div className="text-center py-4 flex flex-col items-center min-h-[160px]">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium mb-1 text-sm">Connect Meta Ads</h4>
              {!isCompact && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mb-3 max-w-sm mx-auto">
                  Securely connect to import campaign data and power AI insights.
                </p>
              )}
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 min-w-[200px] justify-center"
                size="sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook className="w-3.5 h-3.5 mr-2" />
                    Connect Meta Ads
                  </>
                )}
              </Button>
            </div>
            {/* Benefits row hidden in compact mode */}
            {!isCompact && (
              <div className="border-t border-slate-200 dark:border-viz-light/20 pt-3">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-slate-600 dark:text-slate-300">
                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Metrics</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> ROAS</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Insights</span>
                  <span className="inline-flex items-center gap-1"><CheckCircle className="w-3 h-3 text-emerald-500" /> Alerts</span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MIAMetaIntegration;