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
    const { name, client_id, description, createWorkspace, createSupabase } = body

    if (!name) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Nome do projeto é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Criar slug único
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Criar projeto
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        name,
        slug,
        description,
        client_id: client_id || null,
        owner_id: user.id,
        status: 'draft',
      })
      .select()
      .single()

    if (projectError) {
      return new Response(
        JSON.stringify({ ok: false, error: projectError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Criar workspace se solicitado
    if (createWorkspace && project) {
      const { error: workspaceError } = await supabaseClient
        .from('workspaces')
        .insert({
          project_id: project.id,
          path: `workspaces/${project.id}`,
          created_by: user.id,
          metadata: {},
        })

      if (workspaceError) {
        console.error('Erro ao criar workspace:', workspaceError)
      }
    }

    return new Response(
      JSON.stringify({ ok: true, data: project }),
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

