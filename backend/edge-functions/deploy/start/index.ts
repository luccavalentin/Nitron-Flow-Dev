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
    const { projectId, snapshotId, environment } = body;

    if (!projectId || !environment) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "projectId e environment são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o projeto pertence ao usuário
    const { data: project, error: projectError } = await supabaseClient
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("owner_id", user.id)
      .single();

    if (projectError || !project) {
      return new Response(
        JSON.stringify({ ok: false, error: "Projeto não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar registro de deployment
    const { data: deployment, error: deploymentError } = await supabaseClient
      .from("deployments")
      .insert({
        project_id: projectId,
        snapshot_id: snapshotId || null,
        environment,
        status: "pending",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deploymentError) {
      return new Response(
        JSON.stringify({ ok: false, error: deploymentError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Em produção, aqui chamaria o runner/webhook para build
    // Por enquanto, simulamos um deploy
    const deployUrl = environment === "production"
      ? `https://${project.slug}.nitronflow.dev`
      : `https://${project.slug}-${environment}.nitronflow.dev`;

    // Atualizar deployment como sucesso (em produção, seria assíncrono)
    setTimeout(async () => {
      await supabaseClient
        .from("deployments")
        .update({
          status: "success",
          finished_at: new Date().toISOString(),
          logs: {
            url: deployUrl,
            message: "Deploy concluído com sucesso",
          },
        })
        .eq("id", deployment.id);
    }, 2000);

    // Registrar telemetria
    await supabaseClient.from("telemetry_events").insert({
      project_id: projectId,
      event_type: "deploy_started",
      payload: { deployment_id: deployment.id, environment },
    });

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          ...deployment,
          preview_url: deployUrl,
        },
      }),
      {
        status: 201,
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

