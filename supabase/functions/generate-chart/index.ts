import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Timeout duration in milliseconds (120 seconds)
const TIMEOUT_DURATION = 120000;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { sessionId } = body as { sessionId?: string }

    // Two modes:
    // 1) Session mode: when sessionId is provided (existing behavior)
    // 2) Direct mode: when sql/inference/data are provided directly (new fallback)

    let sql: string | undefined
    let inference: string | undefined
    let dataPayload: unknown
    let userQuery: string | undefined

    if (sessionId) {
      // Get auth header
      const authHeader = req.headers.get('Authorization')!
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      )

      // Get user from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('Unauthorized')
      }

      console.log('Generating chart for session:', sessionId)

      // Get the session data
      const { data: session, error: sessionError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError || !session) {
        console.error('Session error:', sessionError)
        throw new Error('Session not found')
      }

      // Check if we have the required data from the inference call
      if (!session.metadata?.data || !session.sql_query) {
        throw new Error('No data available for chart generation. Please run a query first.')
      }

      sql = session.sql_query
      inference = session.answer
      dataPayload = session.metadata.data
      userQuery = session.metadata.user_query || session.prompt
    } else {
      // Direct mode
      sql = body.sql
      inference = body.inference
      dataPayload = body.data
      userQuery = body.user_query || body.User_query
      if (!sql || !inference) {
        console.error('Direct mode missing fields', {
          hasSql: !!sql,
          hasInference: !!inference,
          hasData: !!dataPayload,
          hasUserQuery: !!userQuery,
        })
        throw new Error('Missing sql or inference in request body')
      }
    }

    const payloadForAgent = {
      sql,
      data: dataPayload,
      sql_response: dataPayload, // some handlers expect this key
      inference,
      User_query: userQuery
    }

    // Create AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_DURATION);

    try {
      // Call the BIAgent API
      console.log('Calling BI Agent with presence flags', {
        hasSql: !!sql,
        hasInference: !!inference,
        hasData: !!dataPayload,
        hasUserQuery: !!userQuery,
      })
      const biAgentResponse = await fetch('https://bi-agent-286070583332.us-central1.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadForAgent),
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

      if (sessionId) {
        // Session mode: update DB and return code
        const authHeader = req.headers.get('Authorization')!
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )

        const { data: session, error: sessionError } = await supabase
          .from('chat_sessions')
          .select('*')
          .eq('id', sessionId)
          .single()

        if (!sessionError && session) {
          const { error: updateError } = await supabase
            .from('chat_sessions')
            .update({
              chart_code: chartScript,
              metadata: { 
                ...session.metadata, 
                chart_generated: true,
                chart_generated_at: new Date().toISOString()
              },
              updated_at: new Date().toISOString()
            })
            .eq('id', sessionId)
          if (updateError) {
            console.error('Database update error:', updateError)
          }
        }

        console.log('Returning chart code (session mode)')
        return new Response(
          JSON.stringify({ success: true, chart_code: chartScript }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      } else {
        // Direct mode: just return code
        console.log('Returning chart code (direct mode)')
        return new Response(
          JSON.stringify({ success: true, chart_code: chartScript }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
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
})
