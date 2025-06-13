import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Timeout duration in milliseconds (120 seconds)
const TIMEOUT_DURATION = 120000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Directly extract inputs from the request body
    const { sql, data, inference, User_query } = await req.json();

    console.log('Generating chart with received data:', { sql, data, inference, User_query });

    // Check if we have the required data
    if (!data || !sql || !inference || !User_query) {
      throw new Error('Missing required data for chart generation.');
    }

    console.log('Data received, calling BIAgent API')

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      // Call the BIAgent API
      const biAgentResponse = await fetch('https://bi-agent-286070583332.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sql,
          data,
          inference,
          User_query
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId); // Clear timeout if request completes

      if (!biAgentResponse.ok) {
        const errorText = await biAgentResponse.text()
        console.error('BIAgent API error:', biAgentResponse.status, biAgentResponse.statusText, errorText)
        throw new Error(`Failed to generate chart with BIAgent API: ${biAgentResponse.status} ${errorText}`)
      }

      const chartScript = await biAgentResponse.text()
      console.log('Generated chart script successfully')

      return new Response(
        JSON.stringify({ success: true, chart_code: chartScript }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch (fetchError) {
      clearTimeout(timeoutId); // Clear timeout on error

      if (fetchError.name === 'AbortError') {
        throw new Error('Chart generation request timed out after 120 seconds. The BI agent is taking longer than expected to respond.');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Error in chart generation function:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
        errorType: error.name === 'AbortError' ? 'timeout' : 'general'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.name === 'AbortError' ? 504 : 400 
      }
    )
  }
});
