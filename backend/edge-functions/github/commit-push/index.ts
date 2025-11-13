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

    const body = await req.json();
    const { workspace_id, repo, branch, message, files } = body;

    if (!workspace_id || !repo || !message) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "workspace_id, repo e message são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar token GitHub do usuário
    const { data: integration } = await supabaseClient
      .from("integrations")
      .select("config")
      .eq("provider", "github")
      .eq("project_id", workspace_id)
      .single();

    if (!integration || !integration.config?.access_token) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "GitHub não conectado. Conecte primeiro via /github/connect",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const githubToken = integration.config.access_token;
    const targetBranch = branch || "main";

    // TODO: Implementar commit e push usando GitHub API
    // Por enquanto, simular processo
    const commitResult = {
      commit_sha: `abc123${Date.now()}`,
      branch: targetBranch,
      repo: repo,
      message: message,
      files_changed: files?.length || 0,
      status: "success",
    };

    // Em produção, usar GitHub API:
    // 1. Criar tree com arquivos
    // 2. Criar commit
    // 3. Atualizar branch reference
    // 4. Push para remote

    // Registrar telemetria
    await supabaseClient.from("telemetry_events").insert({
      project_id: workspace_id,
      event_type: "github_commit_push",
      payload: commitResult,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          ...commitResult,
          message:
            "Commit e push simulados. Integre com GitHub API para funcionalidade real.",
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

