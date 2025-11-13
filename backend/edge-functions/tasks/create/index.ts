import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Não autenticado' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const body = await req.json()
    const { project_id, title, description, status, priority, sprint_id, tags, estimate_hours } = body

    if (!project_id || !title) {
      return new Response(
        JSON.stringify({ ok: false, error: 'project_id e title são obrigatórios' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verificar se o projeto pertence ao usuário
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('owner_id')
      .eq('id', project_id)
      .eq('owner_id', user.id)
      .single()

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Projeto não encontrado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const { data: task, error } = await supabaseClient
      .from('tasks')
      .insert({
        project_id,
        title,
        description: description || null,
        status: status || 'backlog',
        priority: priority || 'medium',
        sprint_id: sprint_id || null,
        tags: tags || [],
        estimate_hours: estimate_hours || null,
        assignee_id: null,
      })
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ ok: true, data: task }),
      {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

