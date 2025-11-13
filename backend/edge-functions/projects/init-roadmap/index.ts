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

    const { projectId } = await req.json()

    if (!projectId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'projectId é obrigatório' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Verificar se o projeto pertence ao usuário
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .select('*')
      .eq('id', projectId)
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

    // Criar sprints padrão
    const sprints = [
      { name: 'Sprint 1 - Setup', status: 'planned' },
      { name: 'Sprint 2 - Core', status: 'planned' },
      { name: 'Sprint 3 - QA', status: 'planned' },
      { name: 'Sprint 4 - Release', status: 'planned' },
    ]

    const { data: createdSprints, error: sprintsError } = await supabaseClient
      .from('sprints')
      .insert(
        sprints.map((sprint) => ({
          project_id: projectId,
          ...sprint,
        }))
      )
      .select()

    if (sprintsError) {
      return new Response(
        JSON.stringify({ ok: false, error: sprintsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Criar roadmap items padrão
    const roadmapItems = [
      { title: 'Configuração Inicial', phase: 'setup', status: 'pending' },
      { title: 'Desenvolvimento Core', phase: 'development', status: 'pending' },
      { title: 'Testes e QA', phase: 'testing', status: 'pending' },
      { title: 'Deploy e Release', phase: 'release', status: 'pending' },
    ]

    const { data: createdRoadmap, error: roadmapError } = await supabaseClient
      .from('roadmap_items')
      .insert(
        roadmapItems.map((item) => ({
          project_id: projectId,
          ...item,
        }))
      )
      .select()

    if (roadmapError) {
      return new Response(
        JSON.stringify({ ok: false, error: roadmapError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          sprints: createdSprints,
          roadmap_items: createdRoadmap,
        },
      }),
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

