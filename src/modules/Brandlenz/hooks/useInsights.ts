import { useState, useEffect, useCallback } from 'react';
import { ActionableInsight, UseInsightsReturn } from '../types';
import { brandlenzAnalyticsService } from '../services/analyticsService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useInsights = (): UseInsightsReturn => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<ActionableInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set user context for service
  useEffect(() => {
    if (user?.id) {
      brandlenzAnalyticsService.setAppUserId(user.id);
    }
  }, [user?.id]);

  // Load insights on mount
  useEffect(() => {
    if (user?.id) {
      loadInsights();
    }
  }, [user?.id]);

  const loadInsights = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const data = await brandlenzAnalyticsService.generateInsights();
      setInsights(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load insights';
      setError(errorMessage);
      toast({
        title: "Failed to Load Insights",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsCompleted = useCallback(async (insightId: string, actionId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/brandlenz/insights/${insightId}/actions/${actionId}/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to mark action as completed: ${response.status}`);
      }

      // Update local state
      setInsights(prev => prev.map(insight => {
        if (insight.id === insightId) {
          return {
            ...insight,
            actions: insight.actions.map(action => 
              action.action === actionId 
                ? { ...action, status: 'completed' }
                : action
            )
          };
        }
        return insight;
      }));

      toast({
        title: "Action Completed",
        description: "The action has been marked as completed successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update action status';
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [user?.id]);

  const dismissInsight = useCallback(async (insightId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/brandlenz/insights/${insightId}/dismiss`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to dismiss insight: ${response.status}`);
      }

      // Remove from local state
      setInsights(prev => prev.filter(insight => insight.id !== insightId));

      toast({
        title: "Insight Dismissed",
        description: "The insight has been dismissed successfully.",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to dismiss insight';
      toast({
        title: "Dismiss Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [user?.id]);

  const prioritizeInsight = useCallback(async (insightId: string, priority: ActionableInsight['priority']) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/brandlenz/insights/${insightId}/priority`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(user?.id ? { 'x-user-id': user.id } : {}),
        },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update insight priority: ${response.status}`);
      }

      // Update local state
      setInsights(prev => prev.map(insight => 
        insight.id === insightId 
          ? { ...insight, priority }
          : insight
      ));

      toast({
        title: "Priority Updated",
        description: `Insight priority has been updated to ${priority}.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update priority';
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    }
  }, [user?.id]);

  return {
    insights,
    loading,
    error,
    markAsCompleted,
    dismissInsight,
    prioritizeInsight,
  };
};
