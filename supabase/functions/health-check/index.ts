import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Allowed origins: localhost:8080 and any subdomain/apex of sgconsultingtech.com
const ALLOWED_ORIGINS = new Set<string>([
  'http://localhost:8080',
]);
const ALLOWED_DOMAIN_REGEX = /^https?:\/\/([a-z0-9-]+\.)*sgconsultingtech\.com$/i;

function isOriginAllowed(origin: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.has(origin)) return true;
  return ALLOWED_DOMAIN_REGEX.test(origin);
}

function buildCorsHeaders(origin: string) {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    // Ensure caches/proxies vary on Origin
    'Vary': 'Origin',
  } as Record<string, string>;
}

serve(async (req) => {
  const origin = req.headers.get('origin');

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return new Response('origin not allowed', { status: 403 });
    }
    return new Response('ok', { headers: buildCorsHeaders(origin!) });
  }

  try {
    if (!isOriginAllowed(origin)) {
      return new Response('origin not allowed', { status: 403 });
    }
    return new Response(
      JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }),
      { headers: { ...buildCorsHeaders(origin!), 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const originForError = isOriginAllowed(origin) ? origin! : '';
    const headers = originForError
      ? { ...buildCorsHeaders(originForError), 'Content-Type': 'application/json' }
      : { 'Content-Type': 'application/json' };
    return new Response(
      JSON.stringify({ status: 'error', message: (error as Error).message }),
      { headers, status: 500 }
    );
  }
});
