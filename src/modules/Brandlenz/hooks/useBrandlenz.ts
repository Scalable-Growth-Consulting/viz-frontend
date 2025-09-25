import { useState, useEffect, useCallback } from 'react';
import { 
  BrandlenzDashboardData, 
  BrandlenzConfig, 
  Platform, 
  IntegrationStatus,
  UseBrandlenzReturn 
} from '../types';
import { brandlenzAnalyticsService } from '../services/analyticsService';
import { brandlenzIntegrationService } from '../services/integrationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useBrandlenz = (): UseBrandlenzReturn => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<BrandlenzDashboardData | null>(null);
  const [integrationStatuses, setIntegrationStatuses] = useState<IntegrationStatus[]>([]);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  // Set user context for services
  useEffect(() => {
    if (user?.id) {
      brandlenzAnalyticsService.setAppUserId(user.id);
      brandlenzIntegrationService.setAppUserId(user.id);
      brandlenzIntegrationService.setToast(toast);
    }
  }, [user?.id]);

  // Load dashboard data and integration statuses on mount
  useEffect(() => {
    if (user?.id) {
      refreshData();
      loadIntegrationStatuses();
    }
  }, [user?.id]);

  const refreshData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(prev => ({ ...prev, dashboard: true }));
      setError(null);
      
      const data = await brandlenzAnalyticsService.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setError(errorMessage);
      toast({
        title: "Data Load Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, dashboard: false }));
    }
  }, [user?.id]);

  const loadIntegrationStatuses = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(prev => ({ ...prev, integrations: true }));
      const statuses = await brandlenzIntegrationService.getIntegrationStatuses();
      setIntegrationStatuses(statuses);
    } catch (err) {
      console.error('Failed to load integration statuses:', err);
    } finally {
      setLoading(prev => ({ ...prev, integrations: false }));
    }
  }, [user?.id]);

  const updateConfig = useCallback(async (config: Partial<BrandlenzConfig>) => {
    try {
      setLoading(prev => ({ ...prev, config: true }));
      
      // Update configuration via API
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/brandlenz/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`Failed to update configuration: ${response.status}`);
      }

      toast({
        title: "Configuration Updated",
        description: "Your Brandlenz settings have been updated successfully.",
      });

      // Refresh dashboard data to reflect changes
      await refreshData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update configuration';
      setError(errorMessage);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  }, [user?.id, refreshData]);

  const connectPlatform = useCallback(async (platform: Platform) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      await brandlenzIntegrationService.connectPlatform(platform);
      
      toast({
        title: "Platform Connected",
        description: `Successfully connected to ${platform}. Data sync will begin shortly.`,
      });

      // Refresh integration statuses
      await loadIntegrationStatuses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to connect to ${platform}`;
      setError(errorMessage);
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  }, [loadIntegrationStatuses]);

  const disconnectPlatform = useCallback(async (platform: Platform) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      await brandlenzIntegrationService.disconnectPlatform(platform);
      
      toast({
        title: "Platform Disconnected",
        description: `Successfully disconnected from ${platform}.`,
      });

      // Refresh integration statuses
      await loadIntegrationStatuses();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to disconnect from ${platform}`;
      setError(errorMessage);
      toast({
        title: "Disconnection Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  }, [loadIntegrationStatuses]);

  const syncPlatform = useCallback(async (platform: Platform) => {
    try {
      setLoading(prev => ({ ...prev, [platform]: true }));
      
      await brandlenzIntegrationService.syncPlatform(platform);
      
      toast({
        title: "Sync Complete",
        description: `Successfully synced data from ${platform}.`,
      });

      // Refresh integration statuses and dashboard data
      await Promise.all([loadIntegrationStatuses(), refreshData()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to sync ${platform}`;
      setError(errorMessage);
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, [platform]: false }));
    }
  }, [loadIntegrationStatuses, refreshData]);

  return {
    dashboardData,
    integrationStatuses,
    loading,
    error,
    refreshData,
    updateConfig,
    connectPlatform,
    disconnectPlatform,
    syncPlatform,
  };
};
