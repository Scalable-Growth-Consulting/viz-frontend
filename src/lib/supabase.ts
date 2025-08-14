import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Validate environment variables
const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Sanitize misconfigured dashboard URL to proper project URL
const supabaseUrl = (() => {
  if (!rawSupabaseUrl) return rawSupabaseUrl as string | undefined;
  if (rawSupabaseUrl.includes('supabase.com/dashboard')) {
    // Try to extract the project ref from the dashboard URL and build the correct base
    const match = rawSupabaseUrl.match(/project\/([a-z0-9]+)/i);
    const projectRef = match?.[1];
    if (projectRef) {
      const fixed = `https://${projectRef}.supabase.co`;
      console.warn('[Supabase] Corrected dashboard URL to project URL:', fixed);
      return fixed;
    }
  }
  return rawSupabaseUrl;
})() as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Configure Supabase client
declare global {
  interface Window { __vizSupabase?: SupabaseClient }
}

const createNewClient = () => createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'viz-bi-agent-session',
  },
  global: {
    headers: {
      'X-Client-Info': 'viz-bi-agent/1.0.0'
    }
  }
});

export const supabase: SupabaseClient = ((): SupabaseClient => {
  if (typeof window !== 'undefined') {
    if (!window.__vizSupabase) {
      window.__vizSupabase = createNewClient();
    }
    return window.__vizSupabase;
  }
  return createNewClient();
})();

// Helper function for API calls with retry logic
export const fetchWithRetry = async <T>(
  fn: () => Promise<{ data: T | null; error: any }>,
  options: { retries?: number; delay?: number } = {}
): Promise<{ data: T | null; error: any }> => {
  const { retries = 2, delay = 1000 } = options;
  let lastError: any = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await fn();
      if (!result.error) return result;
      lastError = result.error;
    } catch (error) {
      lastError = error;
    }

    if (i < retries) {
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }

  return { data: null, error: lastError };
};

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight requests
export const handleCors = (request: Request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
};
