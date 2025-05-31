
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

    console.log('Processing query:', prompt)

    // Call the correct Text2SQL API
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

    // Update the chat session with the response
    const { error: updateError } = await supabase
      .from('chat_sessions')
      .update({
        answer: text2sqlResult.inference,
        sql_query: text2sqlResult.sql,
        metadata: { 
          ...metadata, 
          data: text2sqlResult.data,
          user_query: text2sqlResult.User_query,
          processed_at: new Date().toISOString()
        },
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)

    if (updateError) {
      console.error('Database update error:', updateError)
      throw updateError
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
