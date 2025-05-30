import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DatabaseIcon, 
  CheckCircleIcon, 
  AlertCircleIcon, 
  ExternalLinkIcon,
  ClockIcon,
  PlayIcon
} from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  provider: string;
  connectedAt?: string;
  scopes?: string[];
}

const BigQueryConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  const checkConnectionStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('user_oauth_credentials')
        .select('*')
        .eq('user_id', user?.id)
        .eq('provider', 'google')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConnectionStatus({
          isConnected: data.is_bigquery_connected || false,
          provider: data.provider,
          connectedAt: data.created_at,
          scopes: data.scopes || []
        });
      } else {
        setConnectionStatus({
          isConnected: false,
          provider: 'google'
        });
      }
    } catch (error) {
      console.error('Error checking connection status:', error);
      toast({
        title: "Error",
        description: "Failed to check connection status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleConnect = async () => {
    setIsConnecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'openid email profile https://www.googleapis.com/auth/bigquery',
          redirectTo: `${window.location.origin}/data-control`
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Connecting to Google",
        description: "Please complete the authentication in the popup window",
      });
    } catch (error) {
      console.error('Error connecting to Google:', error);
      toast({
        title: "Connection failed",
        description: "Failed to initiate Google connection",
        variant: "destructive",
      });
      setIsConnecting(false);
    }
  };

  const OtherConnectionCard = ({ title, icon: Icon, status }: { 
    title: string; 
    icon: React.ComponentType<any>; 
    status: string;
  }) => (
    <Card className="border-dashed border-2 border-slate-200 dark:border-viz-light/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-100 dark:bg-viz-light/10 rounded-lg">
              <Icon className="w-6 h-6 text-slate-500" />
            </div>
            <div>
              <h3 className="font-medium text-viz-dark dark:text-white">{title}</h3>
              <p className="text-sm text-viz-text-secondary">{status}</p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-slate-200 dark:bg-viz-light/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BigQuery Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <DatabaseIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Google BigQuery</CardTitle>
                <p className="text-sm text-viz-text-secondary">
                  Connect your BigQuery datasets for advanced analytics
                </p>
              </div>
            </div>
            {connectionStatus?.isConnected && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {connectionStatus?.isConnected ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <CheckCircleIcon className="w-4 h-4" />
                <span>Successfully connected to Google BigQuery</span>
              </div>
              
              {connectionStatus.connectedAt && (
                <div className="flex items-center space-x-2 text-sm text-viz-text-secondary">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    Connected on {new Date(connectionStatus.connectedAt).toLocaleDateString()}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <p className="text-sm text-viz-text-secondary mb-2">Available actions:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <PlayIcon className="w-3 h-3 mr-1" />
                    Test Connection
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLinkIcon className="w-3 h-3 mr-1" />
                    View Tables
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
                <AlertCircleIcon className="w-4 h-4" />
                <span>BigQuery connection required for advanced features</span>
              </div>
              
              <div className="text-sm text-viz-text-secondary">
                <p className="mb-2">To enable BigQuery features, you need to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Connect your Google account</li>
                  <li>Grant BigQuery access permissions</li>
                  <li>Select your BigQuery projects</li>
                </ul>
              </div>

              <Button 
                onClick={handleGoogleConnect}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                    Connect Google BigQuery
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Other Connections */}
      <div>
        <h3 className="text-lg font-medium text-viz-dark dark:text-white mb-4">Other Data Sources</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <OtherConnectionCard
            title="Amazon Redshift"
            icon={DatabaseIcon}
            status="Coming Soon"
          />
          <OtherConnectionCard
            title="Snowflake"
            icon={DatabaseIcon}
            status="Work in Progress"
          />
          <OtherConnectionCard
            title="PostgreSQL"
            icon={DatabaseIcon}
            status="Coming Soon"
          />
          <OtherConnectionCard
            title="MySQL"
            icon={DatabaseIcon}
            status="Work in Progress"
          />
          <OtherConnectionCard
            title="MongoDB"
            icon={DatabaseIcon}
            status="Coming Soon"
          />
          <OtherConnectionCard
            title="Microsoft SQL Server"
            icon={DatabaseIcon}
            status="Work in Progress"
          />
        </div>
      </div>
    </div>
  );
};

export default BigQueryConnection;
