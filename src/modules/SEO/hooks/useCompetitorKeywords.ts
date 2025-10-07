import { useEffect, useMemo, useRef, useState } from 'react';
import { awsLambdaService } from '../services/awsLambdaService';

// Simple in-memory caches to avoid repeat network calls per job
const cache = new Map<string, any>();
const submittedCompetitorsSig = new Map<string, string>(); // jobId -> normalized JSON signature

export interface UseCompetitorKeywordsOptions {
  // When false, the hook will not trigger fetch
  enabled?: boolean;
  // Custom timeout/retries override
  timeoutMs?: number;
  retries?: number;
  // Optional delay before first attempt to avoid hitting backend while it is still persisting
  delayMsBeforeFirstTry?: number;
  // Provide competitor URLs to submit before GET
  competitors?: string[];
  // Whether to POST the competitors before fetching keywords
  submitBeforeFetch?: boolean;
  // If true, do not call GET after POST; treat POST response as authoritative
  postOnly?: boolean;
}

export function useCompetitorKeywords(jobId?: string | null, options: UseCompetitorKeywordsOptions = {}) {
  const { enabled = true, timeoutMs = 15000, retries = 2, delayMsBeforeFirstTry = 0, competitors = [], submitBeforeFetch = true, postOnly = false } = options;

  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const key = useMemo(() => (jobId ? String(jobId) : ''), [jobId]);
  const normalizedCompetitors = useMemo(() => {
    const norm = (competitors || [])
      .map((c) => (c || '').trim())
      .filter(Boolean)
      .map((u) => {
        // Normalize minor variants for dedupe
        let s = u.toLowerCase();
        if (!/^https?:\/\//.test(s)) s = `https://${s}`;
        try {
          const url = new URL(s);
          let host = url.hostname.replace(/^www\./, '');
          let path = url.pathname.replace(/\/$/, '');
          return `${host}${path}`;
        } catch {
          return s.replace(/\/$/, '');
        }
      });
    // Unique
    return Array.from(new Set(norm));
  }, [competitors]);

  const fetchOnce = async () => {
    if (!key || !enabled) return;

    // Memoized result
    if (cache.has(key)) {
      setData(cache.get(key));
      setLoading(false);
      setError(null);
      return;
    }

    // Cancel any in-flight request
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    // Optional initial delay
    if (delayMsBeforeFirstTry > 0) {
      await new Promise(r => setTimeout(r, delayMsBeforeFirstTry));
    }

    // Submit competitors first (idempotent per job & list signature)
    let postSucceeded = false;
    let postPayload: any = null;
    if (submitBeforeFetch && normalizedCompetitors.length > 0) {
      try {
        const sig = JSON.stringify(normalizedCompetitors);
        // If we've already submitted this exact set previously, consider POST successful
        if (submittedCompetitorsSig.get(key) === sig) {
          postSucceeded = true;
        } else {
          const resp = await awsLambdaService.submitCompetitors(key, normalizedCompetitors, {
            signal: abortRef.current.signal,
            timeoutMs,
            retries,
          });
          submittedCompetitorsSig.set(key, sig);
          postSucceeded = true;
          postPayload = resp;
          // slight buffer to allow backend to enqueue process
          await new Promise((r) => setTimeout(r, 500));
        }
      } catch (e: any) {
        // On POST failure, surface error and stop to avoid misleading UI
        setError(e?.message || 'Failed to submit competitor URLs');
        setLoading(false);
        return;
      }
    }

    // If postOnly, return POST payload (if any). If it contains keywords array, use it.
    if (postOnly) {
      const keywords = Array.isArray(postPayload?.keywords) ? postPayload.keywords : [];
      const value = keywords.length > 0 ? { keywords } : (postPayload || {});
      cache.set(key, value);
      setData(value);
      setLoading(false);
      setError(null);
      return;
    }

    // Exponential backoff wrapper in hook (service also retries)
    let lastErr: any = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await awsLambdaService.triggerCompetitorKeywords(key, {
          signal: abortRef.current.signal,
          timeoutMs,
          retries,
        });
        cache.set(key, result);
        setData(result);
        setLoading(false);
        setError(null);
        return;
      } catch (e: any) {
        lastErr = e;
        const msg = e?.message || '';
        // Auth errors on GET after a successful POST: do not mislead the user
        if ((msg.includes('401') || msg.includes('403')) && postSucceeded) {
          // Treat as pending fetch; no error surface, allow UI fallback
          cache.set(key, postPayload || {});
          setData(postPayload || {});
          setLoading(false);
          setError(null);
          return;
        }
        // Auth errors before POST success: bubble up for re-login
        if (msg.includes('401') || msg.includes('403')) {
          setError('Authentication required. Please sign in again.');
          setLoading(false);
          return;
        }
        // Retry only if not final attempt
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 400 * Math.pow(2, attempt)));
          continue;
        }
      }
    }

    setError(typeof lastErr?.message === 'string' ? lastErr.message : 'Failed to fetch competitor keywords');
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
