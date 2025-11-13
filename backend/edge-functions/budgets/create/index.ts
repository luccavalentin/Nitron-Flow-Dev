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
    const { project_id, client_id, title, items, total, validity_days } = body;

    if (!title || !items || !total) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "title, items e total são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o projeto pertence ao usuário (se fornecido)
    if (project_id) {
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
    }

    const { data: budget, error } = await supabaseClient
      .from("budgets")
      .insert({
        project_id: project_id || null,
        client_id: client_id || null,
        title,
        items,
        total: parseFloat(total),
        status: "draft",
        issued_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ ok: true, data: budget }), {
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

