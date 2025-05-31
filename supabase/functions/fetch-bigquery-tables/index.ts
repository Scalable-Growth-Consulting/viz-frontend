
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

    // Get OAuth credentials
    const { data: credentials, error: credError } = await supabase
      .from('user_oauth_credentials')
      .select('*')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .single()

    if (credError || !credentials) {
      throw new Error('No OAuth credentials found')
    }

    // Use Google BigQuery API to fetch datasets and tables
    const projectsResponse = await fetch('https://bigquery.googleapis.com/bigquery/v2/projects', {
      headers: {
        'Authorization': `Bearer ${credentials.access_token_encrypted}`,
        'Content-Type': 'application/json',
      },
    })

    if (!projectsResponse.ok) {
      throw new Error('Failed to fetch BigQuery projects')
    }

    const projectsData = await projectsResponse.json()
    const projects = projectsData.projects || []

    const allTables = []

    // Fetch datasets and tables for each project
    for (const project of projects.slice(0, 3)) { // Limit to first 3 projects
      const projectId = project.id

      // Fetch datasets
      const datasetsResponse = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets`, {
        headers: {
          'Authorization': `Bearer ${credentials.access_token_encrypted}`,
          'Content-Type': 'application/json',
        },
      })

      if (datasetsResponse.ok) {
        const datasetsData = await datasetsResponse.json()
        const datasets = datasetsData.datasets || []

        // Fetch tables for each dataset
        for (const dataset of datasets.slice(0, 5)) { // Limit to first 5 datasets per project
          const datasetId = dataset.datasetReference.datasetId

          const tablesResponse = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets/${datasetId}/tables`, {
            headers: {
              'Authorization': `Bearer ${credentials.access_token_encrypted}`,
              'Content-Type': 'application/json',
            },
          })

          if (tablesResponse.ok) {
            const tablesData = await tablesResponse.json()
            const tables = tablesData.tables || []

            for (const table of tables.slice(0, 10)) { // Limit to first 10 tables per dataset
              // Fetch table schema
              const tableId = table.tableReference.tableId
              const schemaResponse = await fetch(`https://bigquery.googleapis.com/bigquery/v2/projects/${projectId}/datasets/${datasetId}/tables/${tableId}`, {
                headers: {
                  'Authorization': `Bearer ${credentials.access_token_encrypted}`,
                  'Content-Type': 'application/json',
                },
              })

              if (schemaResponse.ok) {
                const schemaData = await schemaResponse.json()
                allTables.push({
                  project_id: projectId,
                  dataset_id: datasetId,
                  table_id: tableId,
                  full_table_name: `${projectId}.${datasetId}.${tableId}`,
                  schema: schemaData.schema?.fields || [],
                  description: schemaData.description || null
                })
              }
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        tables: allTables,
        total_tables: allTables.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error fetching BigQuery tables:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
