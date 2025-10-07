import { useEffect, useMemo, useRef, useState } from 'react';
import { awsLambdaService } from '../services/awsLambdaService';

// Lightweight cache to avoid duplicate calls per job
const cache = new Map<string, any>();

export interface UseRecommendationsOptions {
  enabled?: boolean;
  timeoutMs?: number;
  retries?: number;
  delayMsBeforeFirstTry?: number;
  method?: 'POST' | 'GET';
}

export function useRecommendations(jobId?: string | null, options: UseRecommendationsOptions = {}) {
  const { enabled = true, timeoutMs = 15000, retries = 2, delayMsBeforeFirstTry = 0, method = 'POST' } = options;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const key = useMemo(() => (jobId ? String(jobId) : ''), [jobId]);

  const fetchOnce = async () => {
    if (!key || !enabled) return;

    if (cache.has(key)) {
      setData(cache.get(key));
      setLoading(false);
      setError(null);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    if (delayMsBeforeFirstTry > 0) {
      await new Promise((r) => setTimeout(r, delayMsBeforeFirstTry));
    }

    // Try with small retries; the service itself also retries
    let lastErr: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await awsLambdaService.getRecommendations(key, {
          signal: abortRef.current.signal,
          timeoutMs,
          retries,
          method,
        });
        cache.set(key, res);
        setData(res);
        setLoading(false);
        setError(null);
        return;
      } catch (e: any) {
        lastErr = e;
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 400 * Math.pow(2, attempt)));
          continue;
        }
      }
    }

    setError(typeof lastErr?.message === 'string' ? lastErr.message : 'Failed to fetch recommendations');
    setLoading(false);
  };

  useEffect(() => {
    if (!key || !enabled) return;

    fetchOnce();

    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  const refetch = async () => {
    if (!key) return;
    cache.delete(key);
    await fetchOnce();
  };

  return { data, loading, error, refetch } as const;
}
