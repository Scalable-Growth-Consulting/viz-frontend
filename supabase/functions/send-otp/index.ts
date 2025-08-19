import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SmtpClient } from 'https://deno.land/x/smtp/mod.ts';

// Environment variables (set in Supabase secrets)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const SMTP_HOST = Deno.env.get('SMTP_HOST')!;
const SMTP_PORT = Number(Deno.env.get('SMTP_PORT') || '587');
const SMTP_USER = Deno.env.get('SMTP_USER')!; // sender/login email
const SMTP_PASS = Deno.env.get('SMTP_PASS')!;
const SMTP_FROM_NAME = Deno.env.get('SMTP_FROM_NAME') || 'No Reply';
const OTP_EXPIRY_MINUTES = Number(Deno.env.get('OTP_EXPIRY_MINUTES') || '10');

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function getCorsHeaders(origin: string | null) {
  const allowed = [
    /^http:\/\/localhost(:\d+)?$/,
    /^https?:\/\/(.+\.)?viz\.sgconsultingtech\.com$/,
  ];
  const isAllowed = origin && allowed.some((r) => r.test(origin));
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin! : '',
    Vary: 'Origin',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
}

serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const email: string | undefined = body?.email;
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

    // upsert into user_otps
    const { error: dbError } = await supabase.from('user_otps').upsert({ email, otp, expires_at }, { onConflict: 'email' });
    if (dbError) {
      console.error('DB upsert error:', dbError);
      return new Response(JSON.stringify({ error: 'DB error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // send email via SMTP
    const client = new SmtpClient();
    try {
      await client.connect({
        hostname: SMTP_HOST,
        port: SMTP_PORT,
        username: SMTP_USER,
        password: SMTP_PASS,
        // port 587 uses STARTTLS
        secure: SMTP_PORT === 465,
      });

      const from = `${SMTP_FROM_NAME} <${SMTP_USER}>`;
      const subject = 'Your one-time OTP';
      const html = `<p>Your one-time password is: <strong>${otp}</strong></p><p>This code expires in aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa ${OTP_EXPIRY_MINUTES} minutes.</p>`;
      const text = `Your one-time password is: ${otp}\nThis code expires in ${OTP_EXPIRY_MINUTES} minutes.`;

      await client.send({ from, to: email, subject, content: text, html });
      await client.close();
    } catch (mailErr) {
      try { await client.close(); } catch (_) {}
      console.error('SMTP send error:', mailErr);
      return new Response(JSON.stringify({ error: 'Failed to send email' }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Success
    return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Function error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});