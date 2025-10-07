import { useState, useEffect, useCallback } from 'react';
import { 
  woocommerceIntegrationService, 
  WooCommerceConnectionStatus, 
  WooCommerceStore, 
  WooCommerceProduct, 
  WooCommerceOrder, 
  WooCommerceMetrics 
} from '../services/woocommerceIntegrationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useWooCommerceIntegration = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<WooCommerceConnectionStatus>({
    connected: false,
    status: 'disconnected'
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Set toast for the service
  woocommerceIntegrationService.setToast(toast);
  
  // Always provide app user id (for x-user-id header)
  useEffect(() => {
    woocommerceIntegrationService.setAppUserId(user?.id);
  }, [user?.id]);

  // Check connection status on mount and when user changes
  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const checkStatus = useCallback(async (): Promise<WooCommerceConnectionStatus> => {
    try {
      setLoading(true);
      const status = await woocommerceIntegrationService.checkConnectionStatus();
      setConnectionStatus(status);
      return status;
    } catch (error) {
      console.error('Failed to check WooCommerce connection status:', error);
      const errorStatus = { 
        connected: false, 
        status: 'error' as const,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };
      setConnectionStatus(errorStatus);
      return errorStatus;
    } finally {
      setLoading(false);
    }
  }, []);

  const connect = useCallback(async (): Promise<WooCommerceConnectionStatus> => {
    try {
      setLoading(true);
      if (!user?.id) {
        toast({
          title: 'Sign-in required',
          description: 'Please sign in to connect WooCommerce.',
          variant: 'destructive',
        });
        throw new Error('Missing authenticated user id');
      }
      
      await woocommerceIntegrationService.connectWooCommerce();
      
      toast({
        title: "WooCommerce Connected",
        description: "Successfully connected to your WordPress/WooCommerce site.",
      });

      // Refresh status after connection
      return await checkStatus();
    } catch (error) {
      console.error('WooCommerce connection failed:', error);
      const baseDesc = error instanceof Error ? error.message : "Failed to connect to WooCommerce. Please try again.";
      const hint = baseDesc.includes('404')
        ? " • Backend route missing: ensure your API exposes POST /auth/wordpress/start."
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
  }, [user?.id, checkStatus]);

  const disconnect = useCallback(async (): Promise<WooCommerceConnectionStatus> => {
    try {
      setLoading(true);
      await woocommerceIntegrationService.disconnectWooCommerce();
      
      toast({
        title: "WooCommerce Disconnected",
        description: "Successfully disconnected from your WooCommerce site.",
      });

      // Refresh status after disconnection
      return await checkStatus();
    } catch (error) {
      console.error('WooCommerce disconnection failed:', error);
      toast({
        title: "Disconnect Failed",
        description: error instanceof Error ? error.message : "Failed to disconnect from WooCommerce.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkStatus]);

  const sync = useCallback(async (): Promise<void> => {
    try {
      setSyncing(true);
      await woocommerceIntegrationService.syncData();
      
      toast({
        title: "Sync Complete",
        description: "WooCommerce data has been synchronized successfully.",
      });
    } catch (error) {
      console.error('WooCommerce sync failed:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync WooCommerce data.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setSyncing(false);
    }
  }, []);

  const getStores = useCallback(async (): Promise<WooCommerceStore[]> => {
    try {
      return await woocommerceIntegrationService.getStores();
    } catch (error) {
      console.error('Failed to get WooCommerce stores:', error);
      toast({
        title: "Failed to Load Stores",
        description: "Could not retrieve WooCommerce stores.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const getProducts = useCallback(async (storeId?: string): Promise<WooCommerceProduct[]> => {
    try {
      return await woocommerceIntegrationService.getProducts(storeId);
    } catch (error) {
      console.error('Failed to get WooCommerce products:', error);
      toast({
        title: "Failed to Load Products",
        description: "Could not retrieve WooCommerce products.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const getOrders = useCallback(async (storeId?: string, dateRange?: string): Promise<WooCommerceOrder[]> => {
    try {
      return await woocommerceIntegrationService.getOrders(storeId, dateRange);
    } catch (error) {
      console.error('Failed to get WooCommerce orders:', error);
      toast({
        title: "Failed to Load Orders",
        description: "Could not retrieve WooCommerce orders.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const getMetrics = useCallback(async (storeId?: string, dateRange?: string): Promise<WooCommerceMetrics> => {
    try {
      return await woocommerceIntegrationService.getMetricsOverview(storeId, dateRange);
    } catch (error) {
      console.error('Failed to get WooCommerce metrics:', error);
      toast({
        title: "Failed to Load Metrics",
        description: "Could not retrieve WooCommerce metrics.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      await woocommerceIntegrationService.refreshToken();
      toast({
        title: "Token Refreshed",
        description: "WordPress access token has been refreshed successfully.",
      });
    } catch (error) {
      console.error('Failed to refresh WordPress token:', error);
      toast({
        title: "Token Refresh Failed", 
        description: "Could not refresh WordPress access token.",
        variant: "destructive",
      });
      throw error;
    }
  }, []);

  return {
    connectionStatus,
    loading,
    syncing,
    connect,
    disconnect,
    sync,
    getStores,
    getProducts,
    getOrders,
    getMetrics,
    refreshToken,
    checkStatus
  };
};
