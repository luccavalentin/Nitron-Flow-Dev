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
    const { id, title, description, phase, target_date, status } = body;

    if (!id) {
      return new Response(
        JSON.stringify({ ok: false, error: "id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar roadmap item e verificar permissão
    const { data: roadmapItem } = await supabaseClient
      .from("roadmap_items")
      .select("project_id, projects!inner(owner_id)")
      .eq("id", id)
      .single();

    if (!roadmapItem) {
      return new Response(
        JSON.stringify({ ok: false, error: "Roadmap item não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar se o projeto pertence ao usuário
    const project = roadmapItem.projects as any;
    if (project.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sem permissão" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Atualizar roadmap item
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (phase !== undefined) updateData.phase = phase;
    if (target_date !== undefined) updateData.target_date = target_date;
    if (status !== undefined) updateData.status = status;

    const { data: updatedItem, error } = await supabaseClient
      .from("roadmap_items")
      .update(updateData)
      .eq("id", id)
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

    return new Response(JSON.stringify({ ok: true, data: updatedItem }), {
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

