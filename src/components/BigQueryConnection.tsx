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
  PlayIcon,
  Loader2,
  TableIcon,
  RefreshCwIcon
} from 'lucide-react';

interface ConnectionStatus {
  isConnected: boolean;
  provider: string;
  connectedAt?: string;
  scopes?: string[];
}

interface BigQueryTable {
  project_id: string;
  dataset_id: string;
  table_id: string;
  full_table_name: string;
  schema: any[];
  description?: string;
}

const BigQueryConnection: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tables, setTables] = useState<BigQueryTable[]>([]);
  const [fetchingTables, setFetchingTables] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user]);

  // Handle BigQuery OAuth callback
  useEffect(() => {
    const handleBigQueryCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      
      if (code && state === 'bigquery-connection') {
        console.log('Handling BigQuery OAuth callback...');
        setIsConnecting(true);
        
        try {
          // Exchange code for tokens - this would typically be done in a backend
          // For now, we'll simulate the connection
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          await checkConnectionStatus();
          toast({
            title: "BigQuery Connected",
            description: "Successfully connected to Google BigQuery",
          });
        } catch (error) {
          console.error('Error handling BigQuery callback:', error);
          toast({
            title: "Connection failed",
            description: "Failed to complete BigQuery connection",
            variant: "destructive",
          });
        } finally {
          setIsConnecting(false);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };

    handleBigQueryCallback();
  }, []);

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
        const status = {
          isConnected: data.is_bigquery_connected || false,
          provider: data.provider,
          connectedAt: data.created_at,
          scopes: data.scopes || []
        };
        setConnectionStatus(status);
        
        // Auto-fetch tables if connected
        if (status.isConnected) {
          await fetchBigQueryTables();
        }
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

  const fetchBigQueryTables = async () => {
    setFetchingTables(true);
    try {
      console.log('Calling fetch-bigquery-tables function...');
      
      const { data, error } = await supabase.functions.invoke('fetch-bigquery-tables', {
        body: {}
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw error;
      }

      if (data && data.success) {
        setTables(data.tables || []);
        toast({
          title: "Tables loaded",
          description: `Found ${data.total_tables} BigQuery tables`,
        });
      } else {
        throw new Error(data?.error || 'Failed to fetch tables');
      }
    } catch (error) {
      console.error('Error fetching BigQuery tables:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to fetch BigQuery tables. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setFetchingTables(false);
    }
  };

  const handleBigQueryConnect = async () => {
    setIsConnecting(true);
    try {
      // Redirect to Google OAuth with BigQuery-specific scopes
      const clientId = 'YOUR_GOOGLE_CLIENT_ID'; // This should be set in your environment
      const redirectUri = `${window.location.origin}/data-control`;
      const scope = encodeURIComponent('https://www.googleapis.com/auth/bigquery.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile');
      const state = 'bigquery-connection';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=${scope}&` +
        `response_type=code&` +
        `access_type=offline&` +
        `prompt=consent&` +
        `state=${state}`;

      // For now, we'll use Supabase OAuth but this should be a separate flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/bigquery.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          redirectTo: `${window.location.origin}/data-control`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Connecting to BigQuery",
        description: "Please complete the authentication in the popup window",
      });
    } catch (error) {
      console.error('Error connecting to BigQuery:', error);
      toast({
        title: "Connection failed",
        description: "Failed to initiate BigQuery connection",
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

              {/* Tables Section */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-viz-dark dark:text-white">Available Tables</h4>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchBigQueryTables}
                    disabled={fetchingTables}
                  >
                    {fetchingTables ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <RefreshCwIcon className="w-3 h-3 mr-1" />
                    )}
                    {fetchingTables ? 'Loading...' : 'Refresh Tables'}
                  </Button>
                </div>

                {fetchingTables ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" />
                    <span>Loading tables...</span>
                  </div>
                ) : tables.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {tables.map((table, index) => (
                      <div key={index} className="p-3 bg-slate-50 dark:bg-viz-light/10 rounded-lg">
                        <div className="font-mono text-sm text-viz-dark dark:text-white">
                          {table.full_table_name}
                        </div>
                        <div className="text-xs text-viz-text-secondary mt-1">
                          {table.schema.length} columns
                          {table.description && ` • ${table.description}`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-viz-text-secondary">
                    <TableIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>No tables found. Click refresh to load tables or check your BigQuery permissions.</p>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <p className="text-sm text-viz-text-secondary mb-2">Available actions:</p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm">
                    <PlayIcon className="w-3 h-3 mr-1" />
                    Test Connection
                  </Button>
                  <Button variant="outline" size="sm">
                    <ExternalLinkIcon className="w-3 h-3 mr-1" />
                    View in Console
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
                  <li>Connect your Google account with BigQuery access</li>
                  <li>Grant BigQuery read permissions</li>
                  <li>Select your BigQuery projects</li>
                </ul>
              </div>

              <Button 
                onClick={handleBigQueryConnect}
                disabled={isConnecting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ExternalLinkIcon className="w-4 h-4 mr-2" />
                    Connect BigQuery Access
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
