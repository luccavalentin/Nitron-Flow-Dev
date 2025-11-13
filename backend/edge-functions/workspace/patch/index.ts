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
    const { workspaceId, path, content, commitOnSave } = body;

    if (!workspaceId) {
      return new Response(
        JSON.stringify({ ok: false, error: "workspaceId é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!path || content === undefined) {
      return new Response(
        JSON.stringify({ ok: false, error: "path e content são obrigatórios" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o workspace pertence a um projeto do usuário
    const { data: workspace, error: workspaceError } = await supabaseClient
      .from("workspaces")
      .select("*, projects!inner(owner_id)")
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

    // Salvar arquivo no bucket
    const filePath = `workspaces/${workspaceId}/${path}`;
    const { error: storageError } = await supabaseClient.storage
      .from("workspaces")
      .upload(filePath, new TextEncoder().encode(content), {
        upsert: true,
        contentType: "text/plain",
      });

    if (storageError) {
      return new Response(
        JSON.stringify({ ok: false, error: storageError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Registrar telemetria
    await supabaseClient.from("telemetry_events").insert({
      project_id: workspace.project_id,
      event_type: "workspace_file_saved",
      payload: { path, workspace_id: workspaceId },
    });

    return new Response(
      JSON.stringify({ ok: true, data: { path: filePath } }),
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

