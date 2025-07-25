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
        
        // Check if response is HTML (server error page)
        if (rawText.includes('<!doctype html>') || rawText.includes('<html')) {
          console.error('Received HTML error page from GCP');
          return new Response(
            JSON.stringify({ 
              error: 'The AI service is temporarily unavailable. Please try again in a few moments.',
              errorType: 'service_unavailable',
              retryable: true
            }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 503 // Service Unavailable
            }
          );
        }
        
        return new Response(
          JSON.stringify({ 
            error: `AI service error: ${text2sqlResponse.statusText || 'Unknown error'}`,
            errorType: 'api_error',
            retryable: text2sqlResponse.status >= 500
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: text2sqlResponse.status
          }
        );
      }

      let text2sqlResult;
      try {
        text2sqlResult = JSON.parse(rawText);
      } catch (parseError) {
        console.error('Failed to parse GCP response:', parseError);
        return new Response(
          JSON.stringify({ 
            error: 'Invalid response from AI service. Please try again.',
            errorType: 'parse_error',
            retryable: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502 // Bad Gateway
          }
        );
      }

      console.log('Parsed result:', text2sqlResult);

      // Validate required fields
      if (!text2sqlResult.inference && !text2sqlResult.sql) {
        console.error('Missing required fields in GCP response');
        return new Response(
          JSON.stringify({ 
            error: 'Incomplete response from AI service. Please try again.',
            errorType: 'incomplete_response',
            retryable: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 502
          }
        );
      }

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
        return new Response(
          JSON.stringify({ 
            error: 'Request timed out. The AI service is taking longer than expected to respond.',
            errorType: 'timeout',
            retryable: true
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 504 // Gateway Timeout
          }
        );
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
