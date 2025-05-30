
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseIcon, CheckCircleIcon, AlertCircleIcon, RefreshCwIcon } from 'lucide-react';

interface OAuthCredentials {
  id: string;
  provider: string;
  is_bigquery_connected: boolean;
  scopes: string[];
  token_expires_at: string;
  created_at: string;
}

const BigQueryConnection: React.FC = () => {
  const [credentials, setCredentials] = useState<OAuthCredentials | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadCredentials();
    }
  }, [user]);

  const loadCredentials = async () => {
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

      setCredentials(data);
    } catch (error) {
      console.error('Error loading credentials:', error);
      toast({
        title: "Error loading credentials",
        description: "Failed to load BigQuery connection status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConnectToBigQuery = async () => {
    setConnecting(true);
    try {
      // Enhanced Google OAuth with BigQuery scopes
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/bigquery.readonly https://www.googleapis.com/auth/userinfo.email',
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
        title: "Redirecting to Google",
        description: "Please authorize BigQuery access in the popup window",
      });
    } catch (error) {
      console.error('Error connecting to BigQuery:', error);
      toast({
        title: "Connection failed",
        description: "Failed to initiate BigQuery connection",
        variant: "destructive",
      });
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const { error } = await supabase
        .from('user_oauth_credentials')
        .delete()
        .eq('user_id', user?.id)
        .eq('provider', 'google');

      if (error) throw error;

      setCredentials(null);
      toast({
        title: "Disconnected",
        description: "BigQuery connection has been removed",
      });
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from BigQuery",
        variant: "destructive",
      });
    }
  };

  const isTokenExpired = () => {
    if (!credentials?.token_expires_at) return false;
    return new Date(credentials.token_expires_at) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-viz-accent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-viz-dark dark:text-white">BigQuery Connection</h2>
        <p className="text-viz-text-secondary">Connect your Google BigQuery to query your data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DatabaseIcon className="w-5 h-5" />
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {credentials?.is_bigquery_connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span className="font-medium text-green-700 dark:text-green-400">Connected to BigQuery</span>
                {isTokenExpired() && (
                  <Badge variant="destructive" className="ml-2">Token Expired</Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-viz-text-secondary">
                <p><strong>Provider:</strong> {credentials.provider}</p>
                <p><strong>Scopes:</strong> {credentials.scopes?.join(', ')}</p>
                <p><strong>Connected:</strong> {new Date(credentials.created_at).toLocaleDateString()}</p>
                {credentials.token_expires_at && (
                  <p><strong>Token Expires:</strong> {new Date(credentials.token_expires_at).toLocaleDateString()}</p>
                )}
              </div>

              <div className="flex gap-2">
                {isTokenExpired() && (
                  <Button onClick={handleConnectToBigQuery} disabled={connecting} className="bg-yellow-600 hover:bg-yellow-700">
                    <RefreshCwIcon className="w-4 h-4 mr-2" />
                    Refresh Connection
                  </Button>
                )}
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5 text-yellow-500" />
                <span className="font-medium text-yellow-700 dark:text-yellow-400">Not Connected</span>
              </div>
              
              <p className="text-sm text-viz-text-secondary">
                Connect your Google account with BigQuery access to enable data querying capabilities.
              </p>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Required Permissions:</h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• BigQuery read access</li>
                  <li>• User profile information</li>
                </ul>
              </div>

              <Button 
                onClick={handleConnectToBigQuery} 
                disabled={connecting}
                className="bg-viz-accent hover:bg-viz-accent-light"
              >
                {connecting ? (
                  <>
                    <RefreshCwIcon className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <DatabaseIcon className="w-4 h-4 mr-2" />
                    Connect to BigQuery
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BigQueryConnection;
