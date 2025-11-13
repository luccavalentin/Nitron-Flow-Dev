import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ ok: false, error: "Não autenticado" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");

    // Se não tem projectId, listar todos os roadmaps do usuário
    if (!projectId) {
      // Buscar todos os roadmaps que pertencem a projetos do usuário ou que não têm projeto
      const { data: roadmap, error } = await supabaseClient
        .from("roadmap_items")
        .select(`
          *,
          projects!left(owner_id, name)
        `)
        .or(`projects.owner_id.eq.${user.id},project_id.is.null`)
        .order("created_at", { ascending: false });

      if (error) {
        return new Response(
          JSON.stringify({ ok: false, error: error.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Filtrar apenas os que pertencem ao usuário ou não têm projeto
      const filteredRoadmap = (roadmap || []).filter((item: any) => {
        if (!item.project_id) return true; // Roadmaps sem projeto são permitidos
        return item.projects?.owner_id === user.id;
      });

      return new Response(JSON.stringify({ ok: true, data: filteredRoadmap }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Se tem projectId, verificar se o projeto pertence ao usuário
    const { data: project } = await supabaseClient
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .eq("owner_id", user.id)
      .single();

    if (!project) {
      return new Response(
        JSON.stringify({ ok: false, error: "Projeto não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar roadmap items do projeto
    const { data: roadmap, error } = await supabaseClient
      .from("roadmap_items")
      .select(`
        *,
        projects!left(name)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true, data: roadmap || [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

