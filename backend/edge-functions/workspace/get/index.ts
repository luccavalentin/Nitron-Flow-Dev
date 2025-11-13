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
    const workspaceId = url.searchParams.get("id");
    const projectId = url.searchParams.get("projectId");

    // Se não tem id, listar todos os workspaces do usuário
    if (!workspaceId && !projectId) {
      const { data: workspaces, error: workspacesError } = await supabaseClient
        .from("workspaces")
        .select("*, projects!inner(owner_id, name)")
        .eq("projects.owner_id", user.id)
        .order("created_at", { ascending: false });

      if (workspacesError) {
        return new Response(
          JSON.stringify({ ok: false, error: workspacesError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          data: workspaces || [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Se tem projectId, listar workspaces do projeto
    if (projectId && !workspaceId) {
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

      const { data: workspaces, error: workspacesError } = await supabaseClient
        .from("workspaces")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (workspacesError) {
        return new Response(
          JSON.stringify({ ok: false, error: workspacesError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          ok: true,
          data: workspaces || [],
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Se tem workspaceId, buscar workspace específico
    if (!workspaceId) {
      return new Response(
        JSON.stringify({ ok: false, error: "id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar workspace com relacionamentos
    const { data: workspace, error } = await supabaseClient
      .from("workspaces")
      .select(`
        *,
        projects!inner(owner_id, name, github_repo)
      `)
      .eq("id", workspaceId)
      .eq("projects.owner_id", user.id)
      .single();

    if (error || !workspace) {
      return new Response(
        JSON.stringify({ ok: false, error: "Workspace não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true, data: workspace }), {
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

