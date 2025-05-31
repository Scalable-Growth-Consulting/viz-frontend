
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { sessionId } = await req.json()

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

    // Get the session data
    const { data: session, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      throw new Error('Session not found')
    }

    // Check if we have the required data from the inference call
    if (!session.metadata?.data || !session.sql_query) {
      throw new Error('No data available for chart generation')
    }

    console.log('Generating chart for session:', sessionId)

    // Call the correct BIAgent API
    const biAgentResponse = await fetch('https://bi-agent-286070583332.us-central1.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: session.sql_query,
        data: session.metadata.data,
        inference: session.answer,
        User_query: session.metadata.user_query || session.prompt
      })
    })

    if (!biAgentResponse.ok) {
      const errorText = await biAgentResponse.text()
      console.error('BIAgent API error:', biAgentResponse.status, biAgentResponse.statusText, errorText)
      throw new Error(`Failed to generate chart with BIAgent API: ${biAgentResponse.status} ${errorText}`)
    }

    const chartScript = await biAgentResponse.text()
    console.log('Generated chart script')

    // Update the chat session with the chart code
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
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, chart_code: chartScript }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error in chart generation function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
