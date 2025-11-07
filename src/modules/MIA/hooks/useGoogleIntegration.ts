
import { useState, useEffect } from 'react';
import { googleIntegrationService, GoogleConnectionStatus, GoogleAccount, GoogleCampaign, GoogleAd, GoogleMetrics } from '../services/googleIntegrationService.ts';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useGoogleIntegration = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<GoogleConnectionStatus>({
    connected: false,
    status: 'disconnected'
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Set toast for the service
  googleIntegrationService.setToast(toast);
  // Always provide app user id (for x-user-id header)
  useEffect(() => {
    googleIntegrationService.setAppUserId(user?.id);
  }, [user?.id]);

  // Check connection status on mount and when user changes
  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

 
  const checkStatus = async (): Promise<GoogleConnectionStatus> => {
    try {
      setLoading(true);

      // If client has no stored googleUserId, consider disconnected immediately
      const localGoogleUserId = localStorage.getItem('googleUserId');
      if (!localGoogleUserId) {
        const localDisconnected: GoogleConnectionStatus = { connected: false, status: 'disconnected' };
        setConnectionStatus(localDisconnected);
        return localDisconnected;
      }

      // Otherwise ask backend for authoritative status
      const status = await googleIntegrationService.checkConnectionStatus();
      setConnectionStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check Google connection status:', error);
      const errorStatus = { connected: false, status: 'error' as const };
      setConnectionStatus(errorStatus);
      return errorStatus;
    } finally {
      setLoading(false);
    }
  };


  const connect = async (): Promise<GoogleConnectionStatus> => {
    try {
      setLoading(true);
      if (!user?.id) {
        toast({
          title: 'Sign-in required',
          description: 'Please sign in to connect Google Ads.',
          variant: 'destructive',
        });
        throw new Error('Missing authenticated user id');
      }
      await googleIntegrationService.connectGoogle();
      
      toast({
        title: "Google Ads Connected",
        description: "Successfully connected to Google Ads account.",
      });

      // Refresh status after connection
      return await checkStatus();
    } catch (error) {
      console.error('Google connection failed:', error);
      const baseDesc = error instanceof Error ? error.message : "Failed to connect to Google Ads. Please try again.";
      const hint = baseDesc.includes('404')
        ? " • Backend route missing: ensure your API exposes POST /auth/google/start (see Backend_routes.md)."
        : '';
      toast({
        title: "Connection Failed",
        description: `${baseDesc}${hint}`,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  
  const disconnect = async (): Promise<GoogleConnectionStatus> => {
    try {
      setLoading(true);
      await googleIntegrationService.disconnectGoogle();

      // Immediately update UI to disconnected so it doesn't wait for server
      const localDisconnected: GoogleConnectionStatus = { connected: false, status: 'disconnected' };
      setConnectionStatus(localDisconnected);

      toast({
        title: "Google Ads Disconnected",
        description: "Successfully disconnected from Google Ads account.",
      });

      // Re-check server in background to reconcile state (non-blocking)
      checkStatus().catch(() => {
        // ignore background errors
      });

      return localDisconnected;
    } catch (error) {
      console.error('Google disconnection failed:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect from Google Ads.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };
// ...existing code...
  const sync = async (): Promise<void> => {
    try {
      setSyncing(true);
      await googleIntegrationService.syncData();
      
      toast({
        title: "Sync Complete",
        description: "Google Ads data has been synchronized successfully.",
      });
    } catch (error) {
      console.error('Google sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync Google Ads data.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  };

  const getAccounts = async (): Promise<GoogleAccount[]> => {
    try {
      return await googleIntegrationService.getAccounts();
    } catch (error) {
      console.error('Failed to get Google accounts:', error);
      toast({
        title: "Failed to Load Accounts",
        description: "Could not retrieve Google Ads accounts.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getCampaigns = async (customerId: string): Promise<GoogleCampaign[]> => {
    try {
      return await googleIntegrationService.getCampaigns(customerId);
    } catch (error) {
      console.error('Failed to get Google campaigns:', error);
      toast({
        title: "Failed to Load Campaigns",
        description: "Could not retrieve Google Ads campaigns.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getAds = async (customerId: string, campaignId?: string): Promise<GoogleAd[]> => {
    try {
      return await googleIntegrationService.getAds(customerId, campaignId);
    } catch (error) {
      console.error('Failed to get Google ads:', error);
      toast({
        title: "Failed to Load Ads",
        description: "Could not retrieve Google ads.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getMetrics = async (customerId: string, dateRange?: string): Promise<GoogleMetrics> => {
    try {
      return await googleIntegrationService.getMetricsOverview(customerId, dateRange);
    } catch (error) {
      console.error('Failed to get Google metrics:', error);
      toast({
        title: "Failed to Load Metrics",
        description: "Could not retrieve Google Ads metrics.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await googleIntegrationService.refreshToken();
      toast({
        title: "Token Refreshed",
        description: "Google Ads access token has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Failed to refresh Google token:', error);
      toast({
        title: "Token Refresh Failed", 
        description: "Could not refresh Google Ads access token.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    connectionStatus,
    loading,
    syncing,
    connect,
    disconnect,
    sync,
    getAccounts,
    getCampaigns,
    getAds,
    getMetrics,
    refreshToken,
    checkStatus
  };
};
