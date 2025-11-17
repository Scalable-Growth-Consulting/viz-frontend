import { useState, useEffect, useCallback } from 'react';
import { ga4Service, GA4ConnectionStatus, GA4Account, GA4Property, GA4Metrics } from '../services/ga4IntegrationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useGa4Integration = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<GA4ConnectionStatus>({ authenticated: false });
  const [loading, setLoading] = useState(false);

  // provide toast & user id to service
  useEffect(() => {
    ga4Service.setToast(toast);
    ga4Service.setAppUserId(user?.id);
  }, [user?.id]);

  const checkStatus = useCallback(async (): Promise<GA4ConnectionStatus> => {
    try {
      setLoading(true);
      const status = await ga4Service.checkConnectionStatus();
      setConnectionStatus(status);
      return status;
    } catch (err) {
      console.error('GA4 status check failed', err);
      const s = { authenticated: false };
      setConnectionStatus(s);
      return s;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const connect = async (): Promise<GA4ConnectionStatus> => {
    try {
      setLoading(true);
      const status = await ga4Service.connectGA4();
      setConnectionStatus(status);
      // keep a client marker so UI can show immediate state if needed
      if (status.authenticated) localStorage.setItem('ga4Authenticated', '1');
      return status;
    } catch (err) {
      console.error('GA4 connect failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      setLoading(true);
      await ga4Service.disconnectGA4();
      const localDisconnected: GA4ConnectionStatus = { authenticated: false };
      setConnectionStatus(localDisconnected);
      localStorage.removeItem('ga4Authenticated');
    } catch (err) {
      console.error('GA4 disconnect failed', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAccounts = async (): Promise<GA4Account[]> => ga4Service.getAccounts();
  const getProperties = async (accountId: string): Promise<GA4Property[]> => ga4Service.getProperties(accountId);
  const getMetrics = async (propertyId: string, startDate?: string, endDate?: string): Promise<GA4Metrics> =>
    ga4Service.getMetrics(propertyId, startDate, endDate);
  const refreshToken = async (): Promise<void> => {
    await ga4Service.refreshToken();
  };

  return {
    connectionStatus,
    loading,
    connect,
    disconnect,
    checkStatus,
    getAccounts,
    getProperties,
    getMetrics,
    refreshToken
  };
};