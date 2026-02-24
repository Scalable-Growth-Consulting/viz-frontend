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
const TREND_API_KEY = import.meta.env.VITE_KEYWORD_TREND_API_KEY?.trim();
type AuthMode = 'supabase' | 'none';

const ORCHESTRATE_URL =
  import.meta.env.VITE_KEYWORD_TREND_ORCHESTRATE_URL?.trim() ||
  (USE_DEV_PROXY ? '/dev/orchestrate' : 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/orchestrate');

// Start Lambda - triggers analysis and returns job_id immediately
const TRENDS_START_URL =
  import.meta.env.VITE_KEYWORD_TREND_TRENDS_URL?.trim() ||
  (USE_DEV_PROXY ? '/dev/trends' : 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/trends');

// Status Lambda - polls for job status and results
const TRENDS_STATUS_URL =
  import.meta.env.VITE_KEYWORD_TREND_STATUS_URL?.trim() ||
  (USE_DEV_PROXY ? '/dev/trend-status' : 'https://nhqln6zib4.execute-api.ap-south-1.amazonaws.com/dev/trend-status');

const TRENDS_START_AUTH_MODE = (import.meta.env.VITE_KEYWORD_TREND_START_AUTH_MODE as AuthMode) ?? 'supabase';
const TRENDS_STATUS_AUTH_MODE = (import.meta.env.VITE_KEYWORD_TREND_STATUS_AUTH_MODE as AuthMode) ?? 'supabase';

// Timeouts optimized for async job architecture
const ORCHESTRATE_TIMEOUT_MS = Number(import.meta.env.VITE_KEYWORD_TREND_ORCHESTRATE_TIMEOUT_MS ?? 300000); // 5 minutes
const TRENDS_START_TIMEOUT_MS = Number(import.meta.env.VITE_KEYWORD_TREND_START_TIMEOUT_MS ?? 30000); // 30s - just to get job_id
const TRENDS_STATUS_TIMEOUT_MS = Number(import.meta.env.VITE_KEYWORD_TREND_STATUS_TIMEOUT_MS ?? 30000); // 30s per status poll
const TRENDS_MAX_POLL_DURATION_MS = Number(import.meta.env.VITE_KEYWORD_TREND_MAX_POLL_DURATION_MS ?? 1200000); // 20 minutes default
const RECOVERABLE_ERROR_CODES = new Set([502, 503, 504]);

function looksLikePayload(payload: any): payload is Record<string, any> {
  if (!payload || typeof payload !== 'object') return false;
  return Boolean(
    payload.status ||
    payload.job_id ||
    payload.data ||
    payload.timeline ||
    payload.top_sources ||
    payload.top_trends
  );
}

// Types
export type KeywordItem = { term: string; weight?: number; frequency?: number };
export type TrendSource = {
  title?: string;
  url?: string;
  domain?: string;
  source?: string;
  published_ts?: string | number | null;
  matched_keywords?: string[];
  relevance?: number;
  domain_weight?: number;
  recency_boost?: number;
  final_score?: number;
};

export type TrendItem = {
  phrase: string;
  count?: number;
  correlation?: number;
  sources?: TrendSource[];
};

export type OrchestratePayload = { industry: string; usp: string };
export type OrchestratePollPayload = { job_id: string };
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
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  job_id?: string;
  industry?: string;
  keywords?: KeywordItem[] | string[];
  timeline?: TrendPoint[];
  top_trends?: string[];
  trend_items?: TrendItem[];
  top_sources?: TrendSource[];
  insights?: {
    topEmerging?: string[];
    declining?: string[];
    momentumIndex?: number;
    notes?: string[];
  } | string;
  message?: string;
  timestamp?: string;
  execution_time?: number;
  s3_key?: string;
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

const trendSourceSchema = z.object({
  title: z.string().optional(),
  url: z.string().optional(),
  domain: z.string().optional(),
  source: z.string().optional(),
  published_ts: z.union([z.string(), z.number()]).optional(),
  matched_keywords: z.array(z.string()).optional(),
  relevance: z.number().optional(),
  domain_weight: z.number().optional(),
  recency_boost: z.number().optional(),
  final_score: z.number().optional(),
});

const trendItemSchema = z.object({
  phrase: z.string(),
  count: z.number().optional(),
  correlation: z.number().optional(),
  sources: z.array(trendSourceSchema).optional(),
});

const trendsSchema = z.object({
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).optional(),
  job_id: z.string().optional(),
  industry: z.string().optional(),
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
  top_trends: z.array(z.string()).optional(),
  trend_items: z.array(trendItemSchema).optional(),
  top_sources: z.array(trendSourceSchema).optional(),
  insights: z
    .union([
      z.string(),
      z.object({
        topEmerging: z.array(z.string()).optional(),
        declining: z.array(z.string()).optional(),
        momentumIndex: z.number().optional(),
        notes: z.array(z.string()).optional(),
      }),
    ])
    .optional(),
  message: z.string().optional(),
  timestamp: z.string().optional(),
  execution_time: z.number().optional(),
  s3_key: z.string().optional(),
});

function normalizeTrendSource(raw: any): TrendSource {
  if (!raw || typeof raw !== 'object') return {};
  return {
    title: typeof raw.title === 'string' ? raw.title : undefined,
    url: typeof raw.url === 'string' ? raw.url : undefined,
    domain: typeof raw.domain === 'string' ? raw.domain : undefined,
    source: typeof raw.source === 'string' ? raw.source : undefined,
    published_ts:
      typeof raw.published_ts === 'string' || typeof raw.published_ts === 'number'
        ? raw.published_ts
        : undefined,
    matched_keywords: Array.isArray(raw.matched_keywords)
      ? raw.matched_keywords.map((kw: any) => String(kw)).filter(Boolean)
      : undefined,
    relevance: typeof raw.relevance === 'number' ? raw.relevance : undefined,
    domain_weight: typeof raw.domain_weight === 'number' ? raw.domain_weight : undefined,
    recency_boost: typeof raw.recency_boost === 'number' ? raw.recency_boost : undefined,
    final_score: typeof raw.final_score === 'number' ? raw.final_score : undefined,
  };
}

function normalizeTrendItem(raw: any): TrendItem | undefined {
  if (!raw || typeof raw !== 'object' || typeof raw.phrase !== 'string') return undefined;
  return {
    phrase: raw.phrase,
    count: typeof raw.count === 'number' ? raw.count : undefined,
    correlation: typeof raw.correlation === 'number' ? raw.correlation : undefined,
    sources: Array.isArray(raw.sources)
      ? raw.sources.map((src: any) => normalizeTrendSource(src)).filter((s) => Object.keys(s).length)
      : undefined,
  };
}

function normalizeTrendsResult(
  raw: any,
  coerceKeywords: (input: any) => KeywordItem[] | string[] | undefined
): TrendsResult {
  const anyRaw = raw as any;
  
  // Handle new Lambda response format:
  // START Lambda: { job_id, status: 'PENDING', message, created_at }
  // STATUS Lambda (COMPLETED): { job_id, status: 'COMPLETED', progress: 100, execution_time, result: {...} }
  // STATUS Lambda (PROCESSING): { job_id, status: 'PROCESSING', progress, created_at, updated_at }
  // STATUS Lambda (FAILED): { job_id, status: 'FAILED', error }
  
  // If status is COMPLETED and result exists, extract the actual trend data from result field
  const actualData = (anyRaw?.status === 'COMPLETED' && anyRaw?.result) ? anyRaw.result : anyRaw;
  
  const keywords =
    coerceKeywords(actualData?.keywords) ||
    (Array.isArray(actualData?.top_trends) ? actualData.top_trends : undefined);

  const timeline = Array.isArray(actualData?.timeline)
    ? actualData.timeline.map((point: any) => ({
        date: String(point?.date ?? ''),
        term: String(point?.term ?? ''),
        value: Number(point?.value ?? 0),
      }))
    : undefined;

  const topTrends = Array.isArray(actualData?.top_trends)
    ? actualData.top_trends.map((t: any) => String(t)).filter(Boolean)
    : undefined;

  const trendItems = Array.isArray(actualData?.trend_items)
    ? actualData.trend_items
        .map((item: any) => normalizeTrendItem(item))
        .filter((item): item is TrendItem => Boolean(item))
    : undefined;

  const topSources = Array.isArray(actualData?.top_sources)
    ? actualData.top_sources
        .map((src: any) => normalizeTrendSource(src))
        .filter((src) => Object.keys(src).length)
    : undefined;

  const insights = typeof actualData?.insights === 'string' || typeof actualData?.insights === 'object'
    ? actualData.insights
    : undefined;

  return {
    status: (anyRaw?.status as TrendsResult['status']) ?? (anyRaw?.job_id ? 'PENDING' : 'COMPLETED'),
    job_id: typeof anyRaw?.job_id === 'string' ? anyRaw.job_id : undefined,
    industry: typeof actualData?.industry === 'string' ? actualData.industry : undefined,
    keywords,
    timeline,
    top_trends: topTrends,
    trend_items: trendItems,
    top_sources: topSources,
    insights,
    message: typeof anyRaw?.message === 'string' ? anyRaw.message : undefined,
    timestamp: typeof actualData?.timestamp === 'string' ? actualData.timestamp : undefined,
    execution_time: typeof anyRaw?.execution_time === 'number' ? anyRaw.execution_time : undefined,
    s3_key: typeof actualData?.s3_key === 'string' ? actualData.s3_key : undefined,
  };
}

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

async function getAuthHeaders(authMode: AuthMode = 'supabase', extra?: Record<string, string>) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (TREND_API_KEY) {
    headers['x-api-key'] = TREND_API_KEY;
  }

  if (authMode !== 'none') {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  return {
    ...headers,
    ...(extra || {}),
  };
}

async function doGet<T>(
  url: string,
  opts?: {
    query?: Record<string, string | string[]>;
    extraHeaders?: Record<string, string>;
    signal?: AbortSignal;
    timeoutMs?: number;
    authMode?: AuthMode;
  }
): Promise<T> {
  const endpoint = url.split('?')[0];
  const requestId = Math.random().toString(36).substring(7);
  
  logger.debug(`[${requestId}] GET request to ${endpoint}`, { query: opts?.query });
  
  try {
    const headers = await getAuthHeaders(opts?.authMode, opts?.extraHeaders);
    const queryStr = opts?.query
      ? '?' + new URLSearchParams(Object.entries(opts.query).flatMap(([k, v]) => (Array.isArray(v) ? v.map((vv) => [k, vv]) : [[k, v]])) as any).toString()
      : '';
    const controller = new AbortController();
    const timeoutMs = Math.max(10000, opts?.timeoutMs ?? 35000);
    const timer = setTimeout(() => {
      logger.warn(`[${requestId}] Request timeout after ${timeoutMs}ms`);
      controller.abort();
    }, timeoutMs);
    
    const fullUrl = url + queryStr;
    
    logger.debug(`[${requestId}] Full request details:`, {
      url: fullUrl,
      method: 'GET',
      headers
    });
    
    const startTime = Date.now();
    const res = await fetch(fullUrl, {
      method: 'GET',
      mode: 'cors',
      headers,
      signal: opts?.signal ?? controller.signal,
    });
    clearTimeout(timer);
    
    const duration = Date.now() - startTime;
    logger.debug(`[${requestId}] Response received in ${duration}ms`, { status: res.status });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.error(`[${requestId}] Request failed`, { status: res.status, response: text });

      let fallbackPayload: any = null;
      if (text) {
        try {
          fallbackPayload = JSON.parse(text);
        } catch (parseError) {
          logger.debug(`[${requestId}] Failed to parse error body as JSON`, parseError);
        }
      }

      if (RECOVERABLE_ERROR_CODES.has(res.status) && looksLikePayload(fallbackPayload)) {
        logger.warn(`[${requestId}] Non-2xx response ${res.status} returned structured payload. Using fallback body.`);
        return fallbackPayload as T;
      }

      if (res.status === 403) {
        throw new AuthenticationError('Invalid or missing token. Please sign in again.');
      }
      if (res.status === 404) {
        throw new APIError('Job not found', res.status, endpoint);
      }
      if (res.status === 408 || res.status === 504) {
        throw new TimeoutError(
          res.status === 504 
            ? 'Gateway timeout. Please try again.'
            : 'Request timed out',
          endpoint
        );
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

async function doPost<T>(
  url: string,
  body: unknown,
  opts?: {
    query?: Record<string, string | string[]>;
    extraHeaders?: Record<string, string>;
    signal?: AbortSignal;
    timeoutMs?: number;
    authMode?: AuthMode;
  }
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
    
    const bodyString = JSON.stringify(body ?? {});
    const fullUrl = url + queryStr;
    
    // Enhanced logging for debugging AWS Lambda event reception
    logger.debug(`[${requestId}] Full request details:`, {
      url: fullUrl,
      method: 'POST',
      bodyString: bodyString,
      headers: { ...headers, ...(opts?.extraHeaders || {}) }
    });
    
    const startTime = Date.now();
    const res = await fetch(fullUrl, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: bodyString,
      signal: opts?.signal ?? controller.signal,
    });
    clearTimeout(timer);
    
    const duration = Date.now() - startTime;
    logger.debug(`[${requestId}] Response received in ${duration}ms`, { status: res.status });
    
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      logger.error(`[${requestId}] Request failed`, { status: res.status, response: text });

      let fallbackPayload: any = null;
      if (text) {
        try {
          fallbackPayload = JSON.parse(text);
        } catch (parseError) {
          logger.debug(`[${requestId}] Failed to parse error body as JSON`, parseError);
        }
      }

      if (RECOVERABLE_ERROR_CODES.has(res.status) && looksLikePayload(fallbackPayload)) {
        logger.warn(`[${requestId}] Non-2xx response ${res.status} returned structured payload. Using fallback body.`);
        return fallbackPayload as T;
      }

      if (res.status === 403) {
        throw new AuthenticationError('Invalid or missing token. Please sign in again.');
      }
      if (res.status === 408 || res.status === 504) {
        throw new TimeoutError(
          res.status === 504 
            ? 'Gateway timeout. Please try again.'
            : 'Request timed out',
          endpoint
        );
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
    
    // Enhanced logging to debug AWS Lambda event reception
    logger.debug('Orchestrate request body being sent:', JSON.stringify(body, null, 2));

    let raw: unknown;
    try {
      let lastErr: any;
      // Retry up to 3 times with exponential backoff for timeouts and server errors
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          logger.debug(`Orchestrate attempt ${attempt + 1}/3`);
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
          
          if (!retryable || attempt === 2) {
            logger.error(`Orchestrate failed on attempt ${attempt + 1}`, { status, error: text });
            throw err;
          }
          
          // Exponential backoff: 2s, 4s, 8s
          const backoffMs = 2000 * Math.pow(2, attempt);
          logger.warn(`Orchestrate attempt ${attempt + 1} failed, retrying in ${backoffMs}ms`, { status, error: text });
          await new Promise((r) => setTimeout(r, backoffMs));
        }
      }
    } catch (e: any) {
      logger.warn('Orchestrate request failed after all retries', e);
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

  async orchestratePoll(job_id: string, opts?: { signal?: AbortSignal }): Promise<OrchestrateResponse> {
    logger.debug('Polling orchestrate job', { jobId: job_id });
    
    try {
      const raw = await doPost<unknown>(ORCHESTRATE_URL, { job_id } satisfies OrchestratePollPayload, { 
        signal: opts?.signal,
        timeoutMs: 30000 // Shorter timeout for polling
      });
      
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
        // Fallback parsing
        const anyRaw = normalized as any;
        const coercedKeywords = this._coerceKeywords(anyRaw?.keywords);
        const resp: OrchestrateResponse = {
          job_id: typeof anyRaw?.job_id === 'string' ? anyRaw.job_id : job_id,
          status: (anyRaw?.status as OrchestrateResponse['status']) ?? 'PENDING',
          keywords: coercedKeywords as OrchestrateResponse['keywords'],
          message: typeof anyRaw?.message === 'string' ? anyRaw.message : undefined,
        };
        logger.debug('Orchestrate poll response schema validation failed, using fallback parsing');
        return resp;
      }
      
      const data = parsed.data as OrchestrateResponse;
      logger.debug('Orchestrate poll completed', { status: data.status, jobId: data.job_id });
      return data;
    } catch (error) {
      logger.error('Orchestrate poll request failed', error);
      throw error;
    }
  },

  async pollOrchestrateUntilComplete(
    job_id: string,
    opts?: {
      intervalMs?: number;
      timeoutMs?: number;
      maxConsecutiveErrors?: number;
      onTick?: (attempt: number, elapsedMs: number) => void;
      onStatus?: (status: OrchestrateResponse['status']) => void;
      signal?: AbortSignal;
      backoff?: { enabled?: boolean; factor?: number; maxIntervalMs?: number; jitter?: boolean };
    }
  ): Promise<OrchestrateResponse> {
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

    logger.info('Starting orchestrate polling', { jobId: job_id, timeout, baseInterval });

    while (Date.now() - start < timeout) {
      if (opts?.signal?.aborted) throw new Error('Polling cancelled');
      attempt += 1;
      const elapsed = Date.now() - start;
      try {
        opts?.onTick?.(attempt, elapsed);
        const res = await this.orchestratePoll(job_id, { signal: opts?.signal });
        opts?.onStatus?.(res.status);
        consecutiveErrors = 0;
        if (res.status === 'COMPLETED' || res.status === 'FAILED') {
          logger.info('Orchestrate polling completed', { status: res.status, attempts: attempt });
          return res;
        }
      } catch (e) {
        consecutiveErrors += 1;
        logger.warn(`Orchestrate poll attempt ${attempt} failed`, { consecutiveErrors, error: e });
        if (consecutiveErrors >= maxConsecutiveErrors) {
          throw new Error(`Orchestrate polling failed after ${consecutiveErrors} consecutive errors`);
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
    throw new Error(`Orchestrate polling timed out after ${Math.round((Date.now() - start) / 1000)}s`);
  },

  async trendsStart(payload: TrendsStartPayload): Promise<TrendsResult> {
    logger.info('Starting trends analysis', { industry: payload.industry, keywordCount: payload.keywords?.length });
    
    let lastError: Error | undefined;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.debug(`Trends start attempt ${attempt}/${maxRetries}`);
        // Call START Lambda - returns job_id immediately (< 1 second)
        const raw = await doPost<unknown>(TRENDS_START_URL, {
          industry: payload.industry,
          keywords: payload.keywords,
        }, {
          timeoutMs: TRENDS_START_TIMEOUT_MS, // 30s timeout - should respond in < 1s
          authMode: TRENDS_START_AUTH_MODE,
        });
        
        logger.info('Trends start response received', { raw });
        
        // Response format: { job_id, status: 'PENDING', message, created_at }
        const result = normalizeTrendsResult(raw, (input) => this._coerceKeywords(input));
        logger.info('Trends job created', { status: result.status, jobId: result.job_id });
        
        return result;
        
      } catch (error: any) {
        lastError = error;
        const errorStatus = error?.status;
        const isRecoverable =
          (error instanceof APIError && errorStatus && RECOVERABLE_ERROR_CODES.has(errorStatus)) ||
          error?.name === 'TimeoutError' ||
          error?.name === 'NetworkError';

        if (isRecoverable && attempt < maxRetries) {
          const backoffMs = 1500 * Math.pow(2, attempt - 1); // 1.5s, 3s
          logger.warn(
            `Trends start attempt ${attempt} failed with recoverable error (${errorStatus ?? error?.name}). ` +
            `Retrying in ${backoffMs}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
          continue;
        }

        logger.error(`Trends start request failed on attempt ${attempt}`, error);
        throw error;
      }
    }

    logger.error('Trends start failed after all retries', lastError);
    throw lastError ?? new Error('Unknown error starting trends analysis');
  },

  async trendsPoll(job_id: string, opts?: { signal?: AbortSignal }): Promise<TrendsResult> {
    logger.debug('Polling trends job status', { jobId: job_id });
    
    try {
      // Call STATUS Lambda - GET /trend-status/{job_id}
      // Response format:
      // PENDING/PROCESSING: { job_id, status, progress, created_at, updated_at }
      // COMPLETED: { job_id, status: 'COMPLETED', progress: 100, execution_time, result: {...} }
      // FAILED: { job_id, status: 'FAILED', error }
      
      const url = `${TRENDS_STATUS_URL.replace(/\/$/, '')}`;
      const raw = await doPost<unknown>(url, {}, {
        query: { job_id },
        signal: opts?.signal,
        timeoutMs: TRENDS_STATUS_TIMEOUT_MS,
        authMode: TRENDS_STATUS_AUTH_MODE,
      });
      
      logger.debug('Status poll response', { raw });
      
      // Normalize the response
      const result = normalizeTrendsResult(raw, (input) => this._coerceKeywords(input));
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
    const baseInterval = opts?.intervalMs ?? 15000; // 15s between polls
    const timeout = opts?.timeoutMs ?? TRENDS_MAX_POLL_DURATION_MS; // Configurable total duration
    const maxConsecutiveErrors = Math.max(1, opts?.maxConsecutiveErrors ?? 10); // More tolerant of errors
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
    const elapsedMinutes = Math.round((Date.now() - start) / 60000);
    logger.warn(`Trend polling timed out after ${elapsedMinutes} minutes`);
    throw new TimeoutError(
      `Analysis is taking longer than expected (${elapsedMinutes} minutes). The system may still be processing your request. Please try again in a few moments or contact support if this persists.`,
      TRENDS_STATUS_URL
    );
  },
};

export default keywordTrendApi;
