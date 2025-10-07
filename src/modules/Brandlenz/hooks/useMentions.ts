import { useState, useEffect, useCallback } from 'react';
import { BrandMention, Platform, SentimentScore, UseMentionsReturn } from '../types';
import { brandlenzIntegrationService } from '../services/integrationService';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useMentions = (): UseMentionsReturn => {
  const { user } = useAuth();
  const [mentions, setMentions] = useState<BrandMention[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const [filters, setFilters] = useState<UseMentionsReturn['filters']>({
    platforms: [],
    sentiment: [],
    dateRange: [
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      new Date().toISOString().split('T')[0] // today
    ],
    keywords: [],
  });

  // Set user context for service
  useEffect(() => {
    if (user?.id) {
      brandlenzIntegrationService.setAppUserId(user.id);
      brandlenzIntegrationService.setToast(toast);
    }
  }, [user?.id]);

  // Load mentions when filters change or on mount
  useEffect(() => {
    if (user?.id) {
      loadMentions(true); // Reset mentions when filters change
    }
  }, [user?.id, filters]);

  const loadMentions = useCallback(async (reset = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const currentOffset = reset ? 0 : offset;
      const limit = 20;
      
      // If specific platforms are selected, load from each platform
      if (filters.platforms.length > 0) {
        const allMentions: BrandMention[] = [];
        let totalHasMore = false;
        
        for (const platform of filters.platforms) {
          try {
            const result = await brandlenzIntegrationService.getPlatformMentions(platform, {
              limit: Math.ceil(limit / filters.platforms.length),
              offset: currentOffset,
              dateFrom: filters.dateRange[0],
              dateTo: filters.dateRange[1],
              sentiment: filters.sentiment.length > 0 ? filters.sentiment : undefined,
              keywords: filters.keywords.length > 0 ? filters.keywords : undefined,
            });
            
            allMentions.push(...result.mentions);
            if (result.hasMore) totalHasMore = true;
          } catch (platformError) {
            console.warn(`Failed to load mentions from ${platform}:`, platformError);
          }
        }
        
        // Sort by timestamp (newest first)
        allMentions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        if (reset) {
          setMentions(allMentions);
        } else {
          setMentions(prev => [...prev, ...allMentions]);
        }
        
        setHasMore(totalHasMore);
        setOffset(currentOffset + allMentions.length);
      } else {
        // Load from all platforms via general endpoint
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000'}/api/brandlenz/mentions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(user?.id ? { 'x-user-id': user.id } : {}),
          },
          body: JSON.stringify({
            limit,
            offset: currentOffset,
            dateFrom: filters.dateRange[0],
            dateTo: filters.dateRange[1],
            sentiment: filters.sentiment.length > 0 ? filters.sentiment : undefined,
            keywords: filters.keywords.length > 0 ? filters.keywords : undefined,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to load mentions: ${response.status}`);
        }

        const data = await response.json();
        const newMentions = data.data?.mentions || [];
        
        if (reset) {
          setMentions(newMentions);
        } else {
          setMentions(prev => [...prev, ...newMentions]);
        }
        
        setHasMore(data.data?.hasMore || false);
        setOffset(currentOffset + newMentions.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load mentions';
      setError(errorMessage);
      
      // Only show toast for initial load errors, not pagination errors
      if (reset) {
        toast({
          title: "Failed to Load Mentions",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id, filters, offset]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadMentions(false);
  }, [hasMore, loading, loadMentions]);

  const updateFilters = useCallback((newFilters: Partial<UseMentionsReturn['filters']>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setOffset(0); // Reset pagination when filters change
  }, []);

  // Real-time mention updates (optional - for WebSocket integration)
  useEffect(() => {
    if (!user?.id) return;

    // WebSocket connection for real-time mentions
    const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:4000'}/brandlenz/mentions`;
    let ws: WebSocket;

    try {
      ws = new WebSocket(`${wsUrl}?userId=${user.id}`);
      
      ws.onmessage = (event) => {
        try {
          const newMention: BrandMention = JSON.parse(event.data);
          
          // Check if mention matches current filters
          const matchesFilters = (
            (filters.platforms.length === 0 || filters.platforms.includes(newMention.platform)) &&
            (filters.sentiment.length === 0 || filters.sentiment.includes(newMention.sentiment.score)) &&
            (filters.keywords.length === 0 || filters.keywords.some(keyword => 
              newMention.content.toLowerCase().includes(keyword.toLowerCase())
            ))
          );
          
          if (matchesFilters) {
            setMentions(prev => [newMention, ...prev]);
            
            // Show notification for critical mentions
            if (newMention.sentiment.score === 'very_negative' || 
                newMention.author.followerCount && newMention.author.followerCount > 10000) {
              toast({
                title: "New Critical Mention",
                description: `${newMention.sentiment.score === 'very_negative' ? 'Negative' : 'High-influence'} mention detected on ${newMention.platform}`,
              });
            }
          }
        } catch (parseError) {
          console.warn('Failed to parse WebSocket message:', parseError);
        }
      };

      ws.onerror = (error) => {
        console.warn('WebSocket error:', error);
      };
    } catch (wsError) {
      console.warn('Failed to establish WebSocket connection:', wsError);
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [user?.id, filters]);

  return {
    mentions,
    loading,
    error,
    hasMore,
    loadMore,
    filters,
    updateFilters,
  };
};
