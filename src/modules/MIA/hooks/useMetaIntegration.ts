import { useState, useEffect, useCallback } from 'react';
import { MetaConnectionStatus, metaIntegrationService } from '../services/metaIntegrationService';

export const useMetaIntegration = () => {
  const [connectionStatus, setConnectionStatus] = useState<MetaConnectionStatus>({
    isConnected: false,
    status: 'idle',
  });
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const status = await metaIntegrationService.checkConnectionStatus();
      setConnectionStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking Meta status:', error);
      setConnectionStatus({
        isConnected: false,
        status: 'error',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    try {
      await metaIntegrationService.connectMeta();
      const status = await checkStatus();
      return status;
    } catch (error) {
      console.error('Meta connection error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkStatus]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      await metaIntegrationService.disconnectMeta();
      await checkStatus();
    } catch (error) {
      console.error('Meta disconnection error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [checkStatus]);

  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      await metaIntegrationService.syncMetaData();
      await checkStatus();
    } catch (error) {
      console.error('Meta sync error:', error);
      throw error;
    } finally {
      setSyncing(false);
    }
  }, [checkStatus]);

  const getCampaigns = useCallback(async () => {
    try {
      return await metaIntegrationService.getMetaCampaigns();
    } catch (error) {
      console.error('Error fetching Meta campaigns:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    connectionStatus,
    loading,
    syncing,
    connect,
    disconnect,
    sync,
    getCampaigns,
    checkStatus,
  };
};