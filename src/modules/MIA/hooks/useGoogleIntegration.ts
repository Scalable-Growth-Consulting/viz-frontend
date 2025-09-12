import { useState, useEffect } from 'react';
import { googleIntegrationService, GoogleConnectionStatus, GoogleAccount, GoogleCampaign, GoogleAd, GoogleMetrics } from '../services/googleIntegrationService.ts';
import { toast } from '@/hooks/use-toast';

export const useGoogleIntegration = () => {
  const [connectionStatus, setConnectionStatus] = useState<GoogleConnectionStatus>({
    connected: false,
    status: 'disconnected'
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Set toast for the service
  googleIntegrationService.setToast(toast);

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async (): Promise<GoogleConnectionStatus> => {
    try {
      setLoading(true);
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
      await googleIntegrationService.connectGoogle();
      
      toast({
        title: "Google Ads Connected",
        description: "Successfully connected to Google Ads account.",
      });

      // Refresh status after connection
      return await checkStatus();
    } catch (error) {
      console.error('Google connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to Google Ads. Please try again.",
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
      
      toast({
        title: "Google Ads Disconnected",
        description: "Successfully disconnected from Google Ads account.",
      });

      // Refresh status after disconnection
      return await checkStatus();
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