import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Inference Function Started ===');
    console.log('Request method:', req.method);

    const { prompt } = await req.json()
    console.log('Processing query:', prompt);

    // Call the Text2SQL API
    console.log('Calling Text2SQL API...');
    const text2sqlResponse = await fetch('https://text-sql-v2-286070583332.us-central1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: prompt
      })
    })

    if (!text2sqlResponse.ok) {
      const errorText = await text2sqlResponse.text()
      console.error('Text2SQL API error:', text2sqlResponse.status, text2sqlResponse.statusText, errorText)
      throw new Error(`Failed to process query with Text2SQL API: ${text2sqlResponse.status} ${errorText}`)
    }

    const text2sqlResult = await text2sqlResponse.json()
    console.log('Text2SQL result:', text2sqlResult)

    console.log('=== Inference Function Completed Successfully ===');

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
    )

  } catch (error) {
    console.error('=== Inference Function Error ===')
    console.error('Error in inference function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
