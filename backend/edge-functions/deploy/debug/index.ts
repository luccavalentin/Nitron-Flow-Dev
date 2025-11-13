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
    const { project_id, snapshot_id } = body;

    if (!project_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "project_id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o projeto pertence ao usuário
    const { data: project } = await supabaseClient
      .from("projects")
      .select("owner_id")
      .eq("id", project_id)
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

    // Criar deployment de debug
    const { data: deployment, error: deployError } = await supabaseClient
      .from("deployments")
      .insert({
        project_id,
        snapshot_id: snapshot_id || null,
        environment: "debug",
        status: "starting",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deployError) {
      return new Response(
        JSON.stringify({ ok: false, error: deployError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Integrar com runner para criar container de debug
    // Por enquanto, retornar informações simuladas
    const debugInfo = {
      deployment_id: deployment.id,
      tunnel_url: `https://debug-${deployment.id}.tunnel.example.com`,
      vscode_attach_config: {
        type: "node",
        request: "attach",
        name: `Debug ${project_id}`,
        address: "localhost",
        port: 9229,
        localRoot: "${workspaceFolder}",
        remoteRoot: "/app",
      },
      status: "starting",
      message: "Container de debug sendo iniciado. Use a configuração VSCode acima para anexar o debugger.",
    };

    // Atualizar deployment com informações de debug
    await supabaseClient
      .from("deployments")
      .update({
        logs: debugInfo,
        status: "running",
      })
      .eq("id", deployment.id);

    return new Response(JSON.stringify({ ok: true, data: debugInfo }), {
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

