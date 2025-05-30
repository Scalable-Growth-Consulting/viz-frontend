
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
    const { sessionId, prompt, metadata } = await req.json()

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

    // Get user's BigQuery credentials
    const { data: credentials, error: credError } = await supabase
      .from('user_oauth_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (credError || !credentials?.is_bigquery_connected) {
      throw new Error('BigQuery not connected')
    }

    // TODO: Replace with your actual Cloud Run URL
    const cloudRunUrl = 'https://your-cloud-run-url/generate-sql-answer'
    
    // Call Cloud Run service
    const cloudRunResponse = await fetch(cloudRunUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${credentials.access_token_encrypted}` // You'll need to decrypt this
      },
      body: JSON.stringify({
        prompt,
        metadata,
        user_id: user.id
      })
    })

    if (!cloudRunResponse.ok) {
      throw new Error('Cloud Run request failed')
    }

    const result = await cloudRunResponse.json()

    // Update the chat session with the response
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        answer: result.answer,
        sql_query: result.sql,
        metadata: { ...metadata, ...result.metadata },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
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
