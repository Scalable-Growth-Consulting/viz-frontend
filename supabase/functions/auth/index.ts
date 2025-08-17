// Supabase Edge Function for custom auth logic (OTP, password reset, etc.)
import { serve } from 'std/server';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Environment variables (set in Supabase dashboard or CLI)
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OTP_EXPIRY_MINUTES = 10;

// Initialize Supabase client with service role key
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
// Example: POST /auth/send-otp { email }
// Example: POST /auth/verify-otp { email, otp }
// Example: POST /auth/reset-password { email, otp, newPassword }

serve(async (req) => {
  const { pathname } = new URL(req.url);
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    if (pathname.endsWith('/send-otp')) {
      const { email } = await req.json();
      if (!email) return new Response(JSON.stringify({ error: 'Email required' }), { status: 400 });
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires_at = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();
      // Store OTP in DB (upsert)
      await supabase.from('user_otps').upsert({ email, otp, expires_at });
      // TODO: Send OTP via email (for demo, just log it)
      console.log(`OTP for ${email}: ${otp}`);
      // You can integrate with an email API here
      return new Response(JSON.stringify({ success: true, message: 'OTP sent' }), { status: 200 });
    }
    if (pathname.endsWith('/verify-otp')) {
      const { email, otp } = await req.json();
      if (!email || !otp) return new Response(JSON.stringify({ error: 'Email and OTP required' }), { status: 400 });
      // Check OTP in DB
      const { data, error } = await supabase.from('user_otps').select('*').eq('email', email).eq('otp', otp).single();
      if (error || !data) return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 400 });
      if (new Date(data.expires_at) < new Date()) return new Response(JSON.stringify({ error: 'OTP expired' }), { status: 400 });
      return new Response(JSON.stringify({ success: true, message: 'OTP verified' }), { status: 200 });
    }
    if (pathname.endsWith('/reset-password')) {
      const { email, otp, newPassword } = await req.json();
      if (!email || !otp || !newPassword) return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400 });
      // Check OTP in DB
      const { data, error } = await supabase.from('user_otps').select('*').eq('email', email).eq('otp', otp).single();
      if (error || !data) return new Response(JSON.stringify({ error: 'Invalid OTP' }), { status: 400 });
      if (new Date(data.expires_at) < new Date()) return new Response(JSON.stringify({ error: 'OTP expired' }), { status: 400 });
      // Update password using Admin API
      const { error: updateError } = await supabase.auth.admin.updateUserByEmail(email, { password: newPassword });
      if (updateError) return new Response(JSON.stringify({ error: updateError.message }), { status: 400 });
      // Optionally, delete OTP after use
      await supabase.from('user_otps').delete().eq('email', email);
      return new Response(JSON.stringify({ success: true, message: 'Password reset successful' }), { status: 200 });
    }
    return new Response('Not Found', { status: 404 });
  } catch (e) {
    return new Response('Internal Server Error', { status: 500 });
  }
});
