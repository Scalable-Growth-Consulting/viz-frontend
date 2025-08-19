import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

// Hardened CORS: allow localhost:8080 and any subdomain/apex of sgconsultingtech.com
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
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Vary': 'Origin',
  } as Record<string, string>;
}

// Timeout duration in milliseconds (120 seconds)
const TIMEOUT_DURATION = 120000;

serve(async (req) => {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    if (!isOriginAllowed(origin)) {
      return new Response('origin not allowed', { status: 403 });
    }
    return new Response('ok', { headers: buildCorsHeaders(origin!) })
  }

  try {
    console.log('=== Inference Function Started ===');
    const { prompt, email } = await req.json();
    console.log('Prompt:', prompt);
    console.log('Email:', email);

    // Initialize Supabase client (service role) and authenticate user from bearer token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return new Response(
        JSON.stringify({ success: false, error: 'Server misconfiguration' }),
        { headers: { ...(isOriginAllowed(origin) ? buildCorsHeaders(origin!) : {}), 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
    const adminClient = createClient(supabaseUrl, serviceKey);

    let userId: string | null = null;
    if (token) {
      const { data: userData, error: userErr } = await adminClient.auth.getUser(token);
      if (userErr) {
        console.warn('Failed to get user from token:', userErr);
      } else {
        userId = userData.user?.id ?? null;
      }
    }

    // Enforce rate limit only for authenticated users
    if (userId) {
      // Ensure row exists for this user
      const { data: usageRow, error: usageErr } = await adminClient
        .from('chat_usage')
        .select('id, used_count, last_reset')
        .eq('user_id', userId)
        .single();

      if (usageErr && usageErr.code !== 'PGRST116') { // not found code
        console.warn('Error fetching usage row:', usageErr);
      }

      let used_count = 0;
      let last_reset: string | null = null;
      let usage_id: string | null = null;

      if (!usageRow) {
        const { data: inserted, error: insertErr } = await adminClient
          .from('chat_usage')
          .insert({ user_id: userId, used_count: 0 })
          .select('id, used_count, last_reset')
          .single();
        if (insertErr) {
          console.error('Error inserting usage row:', insertErr);
        } else {
          used_count = inserted.used_count ?? 0;
          last_reset = inserted.last_reset ?? null;
          usage_id = inserted.id;
        }
      } else {
        used_count = usageRow.used_count ?? 0;
        last_reset = usageRow.last_reset ?? null;
        usage_id = usageRow.id;
      }

      // Reset if last_reset older than 24 hours
      let needsReset = false;
      if (last_reset) {
        const last = new Date(last_reset);
        const ageMs = Date.now() - last.getTime();
        if (ageMs > 24 * 60 * 60 * 1000) needsReset = true;
      } else {
        needsReset = true;
      }

      if (needsReset && usage_id) {
        const { error: resetErr } = await adminClient
          .from('chat_usage')
          .update({ used_count: 0, last_reset: new Date().toISOString() })
          .eq('id', usage_id);
        if (resetErr) console.warn('Failed to reset usage:', resetErr);
        used_count = 0;
      }

      if (used_count >= 5) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded' }),
          { headers: { ...(isOriginAllowed(origin) ? buildCorsHeaders(origin!) : {}), 'Content-Type': 'application/json' }, status: 429 }
        );
      }

      // Increment usage
      if (usage_id) {
        const { error: incErr } = await adminClient
          .from('chat_usage')
          .update({ used_count: used_count + 1 })
          .eq('id', usage_id);
        if (incErr) console.warn('Failed to increment usage:', incErr);
      }
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      const text2sqlResponse = await fetch('https://text2sql-agent-dynamic-286070583332.us-central1.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt, email }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear timeout if request completes

      const rawText = await text2sqlResponse.text();
      console.log('Raw response from GCP:', rawText);

      if (!text2sqlResponse.ok) {
        console.error('GCP API failed with status:', text2sqlResponse.status, 'body:', rawText);
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Upstream error',
            details: rawText,
            status: text2sqlResponse.status
          }),
          { headers: { ...(isOriginAllowed(origin) ? buildCorsHeaders(origin!) : {}), 'Content-Type': 'application/json' }, status: 502 }
        );
      }

      const text2sqlResult = JSON.parse(rawText);
      console.log('Parsed result:', text2sqlResult);

      return new Response(
        JSON.stringify({ 
          success: true,
          data: {
            answer: text2sqlResult.inference,
            sql: text2sqlResult.sql,
            queryData: text2sqlResult.data
          }
        }),
        {
          headers: { ...(isOriginAllowed(origin) ? buildCorsHeaders(origin!) : {}), 'Content-Type': 'application/json' },
          status: 200
        }
      );
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clear timeout on error
      
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timed out after 60 seconds. The GCP function is taking longer than expected to respond.');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Inference Function Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message,
        errorType: (error as any).name === 'AbortError' ? 'timeout' : 'general'
      }),
      {
        headers: { ...(isOriginAllowed(origin) ? buildCorsHeaders(origin!) : {}), 'Content-Type': 'application/json' },
        status: (error as any).name === 'AbortError' ? 504 : 400 // Use 504 Gateway Timeout for timeout errors
      }
    );
  }
});
