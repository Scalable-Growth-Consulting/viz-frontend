import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Timeout duration in milliseconds (120 seconds)
const TIMEOUT_DURATION = 1200000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Inference Function Started ===');
    const { prompt, email } = await req.json();
    console.log('Prompt:', prompt);
    console.log('Email:', email);

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
        console.error('GCP API failed with status:', text2sqlResponse.status);
        throw new Error(`GCP API error: ${text2sqlResponse.statusText}`);
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        error: error.message,
        errorType: error.name === 'AbortError' ? 'timeout' : 'general'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.name === 'AbortError' ? 504 : 400 // Use 504 Gateway Timeout for timeout errors
      }
    );
  }
});
