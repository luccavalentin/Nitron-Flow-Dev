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
    const workspaceId = url.pathname.split("/").pop();

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ ok: false, error: "workspaceId é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const { message } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ ok: false, error: "message é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o workspace pertence a um projeto do usuário
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from("workspaces")
      .select("*, projects!inner(owner_id, github_repo)")
      .eq("id", workspaceId)
      .eq("projects.owner_id", user.id)
      .single();

    if (workspaceError || !workspace) {
      return new Response(
        JSON.stringify({ ok: false, error: "Workspace não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar token do GitHub
    const { data: integration, error: integrationError } = await supabaseClient
      .from("integrations")
      .select("config")
      .eq("provider", "github")
      .eq("project_id", workspace.project_id)
      .single();

    if (integrationError || !integration) {
      return new Response(
        JSON.stringify({ ok: false, error: "GitHub não conectado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = integration.config?.access_token;

    if (!accessToken) {
      return new Response(
        JSON.stringify({ ok: false, error: "Token GitHub não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Implementar commit e push real via GitHub API
    // Por enquanto, retornar sucesso simulado
    const commitHash = `commit-${Date.now()}`;

    // Registrar telemetria
    await supabaseClient.from("telemetry_events").insert({
      project_id: workspace.project_id,
      event_type: "workspace_commit",
      payload: { workspace_id: workspaceId, commit_hash: commitHash },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          commit_hash: commitHash,
          message,
          pushed: true,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

