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
    const projectRef = url.searchParams.get("projectRef");

    if (!projectRef) {
      return new Response(
        JSON.stringify({ ok: false, error: "projectRef é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar integração Supabase
    const { data: integration } = await supabaseClient
      .from("integrations")
      .select("*, projects!inner(owner_id)")
      .eq("provider", "supabase")
      .eq("config->>project_ref", projectRef)
      .single();

    if (!integration) {
      return new Response(
        JSON.stringify({ ok: false, error: "Conexão Supabase não encontrada" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar permissão
    const project = integration.projects as any;
    if (project.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sem permissão" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Se for child project criado via Management API, deletar via API
    // Por enquanto, apenas remover integração local
    const { error: deleteError } = await supabaseClient
      .from("integrations")
      .delete()
      .eq("id", integration.id);

    if (deleteError) {
      return new Response(
        JSON.stringify({ ok: false, error: deleteError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Limpar referências nos projetos
    await supabaseClient
      .from("projects")
      .update({
        supabase_project_ref: null,
        supabase_db_url: null,
      })
      .eq("supabase_project_ref", projectRef);

    return new Response(JSON.stringify({ ok: true }), {
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

