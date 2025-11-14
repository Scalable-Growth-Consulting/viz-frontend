import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase as baseSupabase } from '@/integrations/supabase/client';

// Export the shared Supabase client instance from integrations
export const supabase: SupabaseClient = baseSupabase;

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
