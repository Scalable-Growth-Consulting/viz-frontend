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
  pollIntervalMs?: number;
  maxAttempts?: number;
  validateResponse?: (payload: any) => boolean;
}

const GENERIC_PLACEHOLDER_PHRASES = new Set([
  'actionable improvement',
  'strategic improvement',
  'see steps',
  'plan and execute',
  'derived from input',
]);

const hasMeaningfulText = (value: unknown): boolean => {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return !GENERIC_PLACEHOLDER_PHRASES.has(trimmed.toLowerCase());
};

const defaultValidateResponse = (payload: any): boolean => {
  const recommendations = payload?.recommendations;
  if (!recommendations || typeof recommendations !== 'object') return false;

  const quickWins = Array.isArray(recommendations.priority_quick_wins)
    ? recommendations.priority_quick_wins
    : [];
  const growthOpps = Array.isArray(recommendations.growth_opportunities)
    ? recommendations.growth_opportunities
    : [];

  const hasMeaningfulItem = (item: any) => {
    if (!item || typeof item !== 'object') return false;

    const candidateFields = [
      item.description,
      item.detail,
      item.details,
      item.summary,
      item.implementation,
      item.implementation_steps,
      item.strategy,
      item.notes,
      item.recommendation,
      item.outcome,
    ];

    return candidateFields.some(hasMeaningfulText);
  };

  return quickWins.some(hasMeaningfulItem) || growthOpps.some(hasMeaningfulItem);
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useRecommendations(jobId?: string | null, options: UseRecommendationsOptions = {}) {
  const {
    enabled = true,
    timeoutMs = 20000,
    retries = 3,
    delayMsBeforeFirstTry = 0,
    method = 'POST',
    pollIntervalMs = 1500,
    maxAttempts = 5,
    validateResponse = defaultValidateResponse,
  } = options;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const key = useMemo(() => (jobId ? String(jobId) : ''), [jobId]);

  const fetchOnce = async () => {
    if (!key || !enabled) return;

    if (cache.has(key)) {
      const cachedValue = cache.get(key);
      if (validateResponse(cachedValue)) {
        setData(cachedValue);
        setLoading(false);
        setError(null);
        return;
      }
      cache.delete(key);
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    if (delayMsBeforeFirstTry > 0) {
      await wait(delayMsBeforeFirstTry);
    }

    let lastErr: any = null;
    let lastPayload: any = null;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const res = await awsLambdaService.getRecommendations(key, {
          signal: abortRef.current.signal,
          timeoutMs,
          retries,
          method,
        });

        lastPayload = res;

        if (validateResponse(res)) {
          cache.set(key, res);
          setData(res);
          setLoading(false);
          setError(null);
          return;
        }

        if (attempt < maxAttempts - 1) {
          await wait(pollIntervalMs * (attempt + 1));
        }
      } catch (e: any) {
        lastErr = e;
        if (attempt < maxAttempts - 1) {
          await wait(400 * Math.pow(2, attempt));
          continue;
        }
        break;
      }
    }

    if (lastErr) {
      setError(typeof lastErr?.message === 'string' ? lastErr.message : 'Failed to fetch recommendations');
    } else {
      console.warn('Recommendations returned without meaningful content. Falling back to default messaging.', lastPayload);
      setData(validateResponse(lastPayload) ? lastPayload : null);
      setError(null);
    }

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
