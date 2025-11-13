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
    const { name } = body;

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

    // Listar todos os arquivos do workspace
    const { data: files, error: listError } = await supabaseClient.storage
      .from("workspaces")
      .list(`workspaces/${workspaceId}`, {
        limit: 1000,
        offset: 0,
        sortBy: { column: "name", order: "asc" },
      });

    if (listError) {
      return new Response(
        JSON.stringify({ ok: false, error: listError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar snapshot (simplificado - em produção, criar ZIP)
    const snapshotName = name || `snapshot-${Date.now()}`;
    const snapshotPath = `snapshots/${workspaceId}/${snapshotName}.json`;

    const snapshotData = {
      workspace_id: workspaceId,
      files: files || [],
      created_at: new Date().toISOString(),
    };

    const { error: snapshotError } = await supabaseClient.storage
      .from("snapshots")
      .upload(snapshotPath, JSON.stringify(snapshotData), {
        contentType: "application/json",
      });

    if (snapshotError) {
      return new Response(
        JSON.stringify({ ok: false, error: snapshotError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Criar registro no banco
    const { data: snapshot, error: dbError } = await supabaseClient
      .from("snapshots")
      .insert({
        workspace_id: workspaceId,
        name: snapshotName,
        storage_path: snapshotPath,
        created_by: user.id,
      })
      .select()
      .single();

    if (dbError) {
      return new Response(
        JSON.stringify({ ok: false, error: dbError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true, data: snapshot }), {
      status: 201,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

