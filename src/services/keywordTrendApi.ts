import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

// Debug logging utility
const DEBUG = import.meta.env.DEV || localStorage.getItem('KEYWORD_TREND_DEBUG') === 'true';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const logger = {
  log: (level: LogLevel, message: string, data?: any) => {
    if (!DEBUG && level === 'debug') return;
    const timestamp = new Date().toISOString();
    const prefix = `[KeywordTrendAPI][${level.toUpperCase()}][${timestamp}]`;
    
    switch (level) {
      case 'error':
        console.error(prefix, message, data || '');
        break;
      case 'warn':
        console.warn(prefix, message, data || '');
        break;
      case 'debug':
        console.debug(prefix, message, data || '');
        break;
      default:
        console.log(prefix, message, data || '');
    }
  },
  info: (msg: string, data?: any) => logger.log('info', msg, data),
  warn: (msg: string, data?: any) => logger.log('warn', msg, data),
  error: (msg: string, data?: any) => logger.log('error', msg, data),
  debug: (msg: string, data?: any) => logger.log('debug', msg, data),
};

// Error types for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public endpoint?: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends APIError {
  constructor(message: string, endpoint?: string) {
    super(message, undefined, endpoint);
    this.name = 'NetworkError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required. Please sign in.') {
    super(message, 403);
    this.name = 'AuthenticationError';
  }
}

export class TimeoutError extends APIError {
  constructor(message: string = 'Request timed out', endpoint?: string) {
    super(message, 408, endpoint);
    this.name = 'TimeoutError';
  }
}

// Endpoints provided (use Vite proxy in dev to avoid CORS)
// Configure via env:
//   VITE_KEYWORD_TREND_ORCHESTRATE_URL=https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/orchestrate
//   VITE_KEYWORD_TREND_TRENDS_URL=https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/trends
//   VITE_KEYWORD_TREND_USE_DEV_PROXY=true|false (defaults to true when Vite dev server is running)
const IS_DEV = import.meta.env.DEV;
const USE_DEV_PROXY = IS_DEV && import.meta.env.VITE_KEYWORD_TREND_USE_DEV_PROXY !== 'false';

const ORCHESTRATE_URL = USE_DEV_PROXY
  ? '/dev/orchestrate'
  : import.meta.env.VITE_KEYWORD_TREND_ORCHESTRATE_URL || 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/orchestrate';

const TRENDS_URL = USE_DEV_PROXY
  ? '/dev/trends'
  : import.meta.env.VITE_KEYWORD_TREND_TRENDS_URL || 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/trends';

const ORCHESTRATE_TIMEOUT_MS = Number(import.meta.env.VITE_KEYWORD_TREND_ORCHESTRATE_TIMEOUT_MS ?? 50000);
const TRENDS_TIMEOUT_MS = Number(import.meta.env.VITE_KEYWORD_TREND_TRENDS_TIMEOUT_MS ?? 50000);

// Types
export type KeywordItem = { term: string; weight?: number; frequency?: number };
export type OrchestratePayload = { industry: string; usp: string };
export type TrendsStartPayload = { industry: string; keywords: string[]; job_id?: string; s3_key?: string };
export type TrendsPollPayload = { job_id: string };

export type OrchestrateResponse = {
  job_id?: string;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  keywords?: KeywordItem[] | string[];
  message?: string;
  s3_key?: string;
  query_id?: string;
  source?: string;
  results_count?: number;
  data?: any;
};

export type TrendPoint = { date: string; term: string; value: number };
export type TrendsResult = {
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  job_id?: string;
  keywords?: KeywordItem[] | string[];
  timeline?: TrendPoint[];
  insights?: {
    topEmerging?: string[];
    declining?: string[];
    momentumIndex?: number;
    notes?: string[];
  };
  message?: string;
};

// Simple schema guards to make responses robust
const orchestrateSchema = z.object({
  job_id: z.string().optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  keywords: z
    .array(
      z.union([
        z.string(),
        z.object({ term: z.string(), weight: z.number().optional(), frequency: z.number().optional() }),
      ])
    )
    .optional(),
  message: z.string().optional(),
  s3_key: z.string().optional(),
  query_id: z.string().optional(),
  source: z.string().optional(),
  results_count: z.number().optional(),
  data: z.any().optional(),
});

const trendsSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
  job_id: z.string().optional(),
  keywords: z
    .array(
      z.union([
        z.string(),
        z.object({
          term: z.string(),
          weight: z.number().optional(),
          frequency: z.number().optional(),
        }),
      ])
    )
    .optional(),
  timeline: z
    .array(
      z.object({
        date: z.string(),
        term: z.string(),
        value: z.number(),
      })
    )
    .optional(),
  insights: z
    .object({
      topEmerging: z.array(z.string()).optional(),
      declining: z.array(z.string()).optional(),
      momentumIndex: z.number().optional(),
      notes: z.array(z.string()).optional(),
    })
    .optional(),
  message: z.string().optional(),
});

async function getAuthToken(): Promise<string> {
  logger.debug('Retrieving authentication token');
  
  try {
    // Primary: Supabase session token (matches SEO-GEO pattern)
    const session = await supabase.auth.getSession();
    const supaToken = session?.data?.session?.access_token;
    if (supaToken) {
      logger.debug('Using Supabase session token');
      return supaToken;
    }

    // Fallbacks: legacy/local keys if any
    const ls = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
    if (ls && ls !== 'null' && ls !== 'undefined') {
      logger.debug('Using localStorage/sessionStorage token');
      return ls;
    }

    // Sometimes Supabase stores serialized session under this key in older flows
    const raw = localStorage.getItem('supabase.auth.token');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const token = parsed?.currentSession?.access_token || parsed?.access_token;
        if (token) {
          logger.debug('Using legacy Supabase token');
          return token;
        }
      } catch (e) {
        logger.warn('Failed to parse legacy Supabase token', e);
      }
    }

    throw new AuthenticationError();
  } catch (error) {
    logger.error('Failed to retrieve authentication token', error);
    throw error instanceof AuthenticationError ? error : new AuthenticationError();
  }
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

async function doPost<T>(
  url: string,
  body: unknown,
  opts?: { query?: Record<string, string | string[]>; extraHeaders?: Record<string, string>; signal?: AbortSignal; timeoutMs?: number }
): Promise<T> {
  const endpoint = url.split('?')[0];
  const requestId = Math.random().toString(36).substring(7);
  
  logger.debug(`[${requestId}] POST request to ${endpoint}`, { body, query: opts?.query });
  
  try {
    const headers = await getAuthHeaders();
    const queryStr = opts?.query
      ? '?' + new URLSearchParams(Object.entries(opts.query).flatMap(([k, v]) => (Array.isArray(v) ? v.map((vv) => [k, vv]) : [[k, v]])) as any).toString()
      : '';
    const controller = new AbortController();
    const timeoutMs = Math.max(10000, opts?.timeoutMs ?? 35000);
    const timer = setTimeout(() => {
      logger.warn(`[${requestId}] Request timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);
    
    const startTime = Date.now();
    const res = await fetch(url + queryStr, {
      method: 'POST',
      mode: 'cors',
      headers: { ...headers, ...(opts?.extraHeaders || {}) },
      body: JSON.stringify(body ?? {}),
      signal: opts?.signal ?? controller.signal,
    });
    clearTimeout(timer);
    
    const duration = Date.now() - startTime;
    logger.debug(`[${requestId}] Response received in ${duration}ms`, { status: res.status });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.error(`[${requestId}] Request failed`, { status: res.status, response: text });
      
      if (res.status === 403) {
        throw new AuthenticationError('Invalid or missing token. Please sign in again.');
      }
      if (res.status === 408 || res.status === 504) {
        throw new TimeoutError(`Request timed out (${res.status})`, endpoint);
      }
      throw new APIError(`Request failed: ${text || res.statusText}`, res.status, endpoint);
    }
    
    const data = await res.json() as T;
    logger.debug(`[${requestId}] Response parsed successfully`);
    return data;
  } catch (err: any) {
    logger.error(`[${requestId}] Request error`, err);
    
    if (err.name === 'AbortError') {
      throw new TimeoutError('Request was aborted', endpoint);
    }
    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new NetworkError('Network/CORS error: The request was blocked. Check your connection or API configuration.', endpoint);
    }
    if (err instanceof APIError) {
      throw err;
    }
    throw new APIError(err.message || 'Unknown error occurred', undefined, endpoint, err);
  }
}

export const keywordTrendApi = {
  // Ensure keywords shape is exactly KeywordItem[] or string[]
  _coerceKeywords(raw: any): KeywordItem[] | string[] | undefined {
    if (!Array.isArray(raw)) return undefined;
    if (raw.every((k: any) => typeof k === 'string')) return raw as string[];
    return (raw as any[]).map((k) => {
      if (typeof k === 'string') return { term: k } as KeywordItem;
      const term: string = typeof k?.term === 'string' ? k.term : String(k?.term ?? '');
      const weight = typeof k?.weight === 'number' ? k.weight : undefined;
      const frequency = typeof k?.frequency === 'number' ? k.frequency : undefined;
      return { term, weight, frequency } as KeywordItem;
    }) as KeywordItem[];
  },
  async orchestrate(payload: OrchestratePayload & { key_services?: string[] }): Promise<OrchestrateResponse> {
    logger.info('Starting orchestrate request', { industry: payload.industry, usp: payload.usp?.substring(0, 50) });
    
    try {
    // key_services support as required by orchestrator
    const ks = (payload.key_services || [])
      .map((s) => (typeof s === 'string' ? s.trim() : ''))
      .filter(Boolean);

    // Match backend contract exactly
    const body = {
      industry: payload.industry,
      usp: payload.usp,
      key_services: ks,
    };

    let raw: unknown;
    try {
      let lastErr: any;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          raw = await doPost<unknown>(ORCHESTRATE_URL, body, {
            timeoutMs: ORCHESTRATE_TIMEOUT_MS,
          });
          lastErr = null;
          break;
        } catch (err: any) {
          lastErr = err;
          const text = String(err?.bodyText || err?.message || '');
          const status = err?.status;
          // Retry only on timeouts / 5xx / 504
          const retryable = status === 504 || status === 502 || status === 500 || /timed out|timeout/i.test(text) || err?.name === 'AbortError';
          if (!retryable || attempt === 2) throw err;
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
        }
      }
    } catch (e: any) {
      logger.warn('Orchestrate request failed after retries', e);
      throw e;
    }

    // Handle API shape: { statusCode, body: stringified JSON }
    let normalized: any = raw;
    if (typeof (raw as any)?.statusCode === 'number' && typeof (raw as any)?.body === 'string') {
      try {
        const bodyObj = JSON.parse((raw as any).body);
        normalized = { statusCode: (raw as any).statusCode, ...bodyObj };
      } catch {
        normalized = raw;
      }
    }

    const parsed = orchestrateSchema.safeParse(normalized);
    if (!parsed.success) {
      // Try to coerce minimal shape
      const anyRaw = normalized as any;
      // Attempt to find keywords from known locations
      let kwSource: any = anyRaw?.keywords;
      if (!kwSource && anyRaw?.extract?.results) {
        const ind = (anyRaw?.extract?.industry || anyRaw?.industry) as string | undefined;
        if (ind && anyRaw.extract.results[ind]?.top_keywords) kwSource = anyRaw.extract.results[ind].top_keywords;
        else {
          // Fallback: first bucket's top_keywords
          const first = Object.values<any>(anyRaw.extract.results)[0] as any;
          if (first?.top_keywords) kwSource = first.top_keywords;
        }
      }
      const coercedKeywords = this._coerceKeywords(kwSource);
      const resp: OrchestrateResponse = {
        job_id: typeof anyRaw?.job_id === 'string' ? anyRaw.job_id : undefined,
        status: (anyRaw?.status as OrchestrateResponse['status']) ?? (typeof anyRaw?.statusCode === 'number' ? 'COMPLETED' : undefined),
        keywords: coercedKeywords as OrchestrateResponse['keywords'],
        message: typeof anyRaw?.message === 'string' ? anyRaw.message : undefined,
      };
      return resp;
    }
    // Also enhance parsed with top_keywords if present under extract
    const data = parsed.data as OrchestrateResponse;
    if (!data.keywords) {
      const extractResults = (normalized as any)?.extract?.results;
      if (extractResults) {
        const ind = (normalized as any)?.extract?.industry || (normalized as any)?.industry;
        const bucket = ind ? extractResults[ind] : undefined;
        const top = bucket?.top_keywords;
        const coerced = this._coerceKeywords(top);
        if (coerced) data.keywords = coerced as OrchestrateResponse['keywords'];
      }

      if (!data.keywords && (normalized as any)?.data?.top_keywords) {
        const topKeywords = (normalized as any).data.top_keywords as any[];
        const coerced = topKeywords
          .map((item) => {
            if (!item) return undefined;
            if (typeof item === 'string') return { term: item } as KeywordItem;
            const term = item.keyword || item.term || item.name;
            if (!term) return undefined;
            return {
              term: String(term),
              weight: typeof item.score === 'number' ? item.score : item.weight,
              frequency: typeof item.frequency === 'number' ? item.frequency : undefined,
            } as KeywordItem;
          })
          .filter((k): k is KeywordItem => Boolean(k?.term));
        if (coerced.length) data.keywords = coerced;
      }
    }

    const s3Key = (normalized as any)?.data?.s3_key || (normalized as any)?.s3_key;
    if (typeof s3Key === 'string') data.s3_key = s3Key;
    const queryId = (normalized as any)?.query_id || (normalized as any)?.data?.query_id;
    if (typeof queryId === 'string') data.query_id = queryId;
    if ((normalized as any)?.source) data.source = (normalized as any).source;
    if (typeof (normalized as any)?.results_count === 'number') data.results_count = (normalized as any).results_count;
    if ((normalized as any)?.data) data.data = (normalized as any).data;
    
    logger.info('Orchestrate request completed successfully', { 
      keywordCount: data.keywords?.length || 0,
      status: data.status,
      jobId: data.job_id 
    });
    
    return data;
    } catch (error) {
      logger.error('Orchestrate request failed completely', error);
      throw error;
    }
  },

  async trendsStart(payload: TrendsStartPayload): Promise<TrendsResult> {
    logger.info('Starting trends analysis', { industry: payload.industry, keywordCount: payload.keywords?.length, jobId: payload.job_id });
    
    try {
      // Send industry and keywords in body and as query params (keywords also as CSV) to be robust to API Gateway mappings
      const raw = await doPost<unknown>(TRENDS_URL, {
        industry: payload.industry,
        keywords: payload.keywords,
        job_id: payload.job_id,
        s3_key: payload.s3_key,
      }, {
        query: {
          industry: payload.industry,
          keywords: payload.keywords,
          keywords_csv: payload.keywords.join(','),
        },
        timeoutMs: TRENDS_TIMEOUT_MS,
      });
    const parsed = trendsSchema.safeParse(raw);
    if (!parsed.success) {
      const anyRaw = raw as any;
      const coercedKeywords = this._coerceKeywords(anyRaw?.keywords);
      const tl: TrendsResult['timeline'] = Array.isArray(anyRaw?.timeline)
        ? (anyRaw.timeline as any[]).map((p) => ({
            date: String(p?.date ?? ''),
            term: String(p?.term ?? ''),
            value: Number(p?.value ?? 0),
          }))
        : undefined;
      const fallback: TrendsResult = {
        status: (anyRaw?.status as TrendsResult['status']) ?? 'PENDING',
        job_id: typeof anyRaw?.job_id === 'string' ? anyRaw.job_id : undefined,
        keywords: coercedKeywords,
        timeline: tl,
        insights: anyRaw?.insights,
        message: typeof anyRaw?.message === 'string' ? anyRaw.message : undefined,
      };
      logger.warn('Trends response schema validation failed, using fallback parsing');
      return fallback;
    }
    
    const result = parsed.data as TrendsResult;
    logger.info('Trends start completed', { status: result.status, jobId: result.job_id });
    return result;
    } catch (error) {
      logger.error('Trends start request failed', error);
      throw error;
    }
  },

  async trendsPoll(job_id: string, opts?: { signal?: AbortSignal }): Promise<TrendsResult> {
    logger.debug('Polling trends job', { jobId: job_id });
    
    try {
      const raw = await doPost<unknown>(TRENDS_URL, { job_id } satisfies TrendsPollPayload, { signal: opts?.signal });
    const parsed = trendsSchema.safeParse(raw);
    if (!parsed.success) {
      const anyRaw = raw as any;
      const coercedKeywords = this._coerceKeywords(anyRaw?.keywords);
      const tl: TrendsResult['timeline'] = Array.isArray(anyRaw?.timeline)
        ? (anyRaw.timeline as any[]).map((p) => ({
            date: String(p?.date ?? ''),
            term: String(p?.term ?? ''),
            value: Number(p?.value ?? 0),
          }))
        : undefined;
      const fallback: TrendsResult = {
        status: (anyRaw?.status as TrendsResult['status']) ?? 'PENDING',
        job_id: typeof anyRaw?.job_id === 'string' ? anyRaw.job_id : undefined,
        keywords: coercedKeywords,
        timeline: tl,
        insights: anyRaw?.insights,
        message: typeof anyRaw?.message === 'string' ? anyRaw.message : undefined,
      };
      logger.debug('Trends poll response schema validation failed, using fallback parsing');
      return fallback;
    }
    
    const result = parsed.data as TrendsResult;
    logger.debug('Trends poll completed', { status: result.status, jobId: result.job_id });
    return result;
    } catch (error) {
      logger.error('Trends poll request failed', error);
      throw error;
    }
  },

  async pollUntilComplete(
    job_id: string,
    opts?: {
      intervalMs?: number;
      timeoutMs?: number;
      maxConsecutiveErrors?: number;
      onTick?: (attempt: number, elapsedMs: number) => void;
      onStatus?: (status: TrendsResult['status']) => void;
      signal?: AbortSignal;
      backoff?: { enabled?: boolean; factor?: number; maxIntervalMs?: number; jitter?: boolean };
    }
  ): Promise<TrendsResult> {
    const baseInterval = opts?.intervalMs ?? 10000; // 10s
    const timeout = opts?.timeoutMs ?? 200000; // ~3.3 minutes
    const maxConsecutiveErrors = Math.max(1, opts?.maxConsecutiveErrors ?? 5);
    const start = Date.now();
    let attempt = 0;
    let consecutiveErrors = 0;
    let nextInterval = baseInterval;

    const backoffCfg = {
      enabled: opts?.backoff?.enabled ?? true,
      factor: opts?.backoff?.factor ?? 1.5,
      maxIntervalMs: opts?.backoff?.maxIntervalMs ?? 30000,
      jitter: opts?.backoff?.jitter ?? true,
    };

    while (Date.now() - start < timeout) {
      if (opts?.signal?.aborted) throw new Error('Polling cancelled');
      attempt += 1;
      const elapsed = Date.now() - start;
      try {
        opts?.onTick?.(attempt, elapsed);
        const res = await this.trendsPoll(job_id, { signal: opts?.signal });
        opts?.onStatus?.(res.status);
        consecutiveErrors = 0;
        if (res.status === 'COMPLETED' || res.status === 'FAILED') return res;
      } catch (e) {
        consecutiveErrors += 1;
        if (consecutiveErrors >= maxConsecutiveErrors) {
          throw new Error(`Trend polling failed after ${consecutiveErrors} consecutive errors`);
        }
      }

      // Sleep with optional backoff + jitter
      let sleepMs = nextInterval;
      if (backoffCfg.enabled) {
        nextInterval = Math.min(backoffCfg.maxIntervalMs, Math.ceil(nextInterval * backoffCfg.factor));
        if (backoffCfg.jitter) {
          const delta = Math.floor(nextInterval * 0.15);
          sleepMs = nextInterval - Math.floor(Math.random() * delta);
        } else {
          sleepMs = nextInterval;
        }
      }
      await new Promise<void>((r, j) => {
        const id = setTimeout(() => r(), sleepMs);
        opts?.signal?.addEventListener('abort', () => {
          clearTimeout(id);
          j(new Error('Polling cancelled'));
        }, { once: true });
      });
    }
    throw new Error(`Trend polling timed out after ${Math.round((Date.now() - start) / 1000)}s`);
  },
};

export default keywordTrendApi;
