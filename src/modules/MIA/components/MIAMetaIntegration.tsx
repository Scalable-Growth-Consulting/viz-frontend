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
}

const MIAMetaIntegration: React.FC<MIAMetaIntegrationProps> = ({ onConnectionChange }) => {
  const {
    connectionStatus,
    loading,
    syncing,
    connect,
    disconnect,
    sync,
  } = useMetaIntegration();
  
  const { toast } = useToast();

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
    <Card className="bg-white/90 dark:bg-viz-medium/80 border border-slate-200/60 dark:border-viz-light/20 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center">
              <Facebook className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Meta Ads</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Facebook & Instagram advertising platform
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {connectionStatus.isConnected ? (
          <>
            {/* Connected State */}
            <div className="space-y-3">
              {connectionStatus.accountName && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                  <div>
                    <div className="font-medium text-sm">Account</div>
                    <div className="text-slate-600 dark:text-slate-300 text-sm">
                      {connectionStatus.accountName}
                    </div>
                  </div>
                  <BarChart3 className="w-4 h-4 text-viz-accent" />
                </div>
              )}

              {connectionStatus.lastSync && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-viz-dark/40">
                  <div>
                    <div className="font-medium text-sm">Last Sync</div>
                    <div className="text-slate-600 dark:text-slate-300 text-sm">
                      {new Date(connectionStatus.lastSync).toLocaleString()}
                    </div>
                  </div>
                  <Calendar className="w-4 h-4 text-viz-accent" />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex-1"
                  variant="outline"
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
                <Button
                  onClick={handleDisconnect}
                  disabled={loading}
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Unlink className="w-4 h-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Facebook className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-medium mb-2">Connect Your Meta Ads Account</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 max-w-sm mx-auto">
                Import your Facebook and Instagram campaign data to get comprehensive marketing insights.
              </p>
              <Button
                onClick={handleConnect}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Facebook className="w-4 h-4 mr-2" />
                    Connect Meta Ads
                  </>
                )}
              </Button>
            </div>
            {/* Benefits */}
            <div className="border-t border-slate-200 dark:border-viz-light/20 pt-4">
              <h5 className="font-medium text-sm mb-3">What you'll get:</h5>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Campaign performance metrics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Ad spend and ROAS tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Audience insights and optimization
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  Automated reporting and alerts
                </li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default MIAMetaIntegration;