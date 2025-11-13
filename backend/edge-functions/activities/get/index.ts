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
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const projectId = url.searchParams.get("projectId");

    let query = supabaseClient
      .from("telemetry_events")
      .select("*, projects!inner(owner_id, name)")
      .eq("projects.owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (projectId) {
      query = query.eq("project_id", projectId);
    }

    const { data: events, error } = await query;

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error: error.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Também buscar atividades de outras tabelas (tasks, projects, etc)
    const recentTasks = await supabaseClient
      .from("tasks")
      .select("*, projects!inner(owner_id, name)")
      .eq("projects.owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5);

    const recentProjects = await supabaseClient
      .from("projects")
      .select("*")
      .eq("owner_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(5);

    const activities = [
      ...(events || []).map((e: any) => ({
        id: e.id,
        type: "telemetry",
        event_type: e.event_type,
        project_name: e.projects?.name,
        payload: e.payload,
        created_at: e.created_at,
      })),
      ...(recentTasks.data || []).map((t: any) => ({
        id: t.id,
        type: "task",
        event_type: t.status === "done" ? "task_completed" : "task_updated",
        project_name: t.projects?.name,
        payload: { task_title: t.title, status: t.status },
        created_at: t.updated_at,
      })),
      ...(recentProjects.data || []).map((p: any) => ({
        id: p.id,
        type: "project",
        event_type: "project_updated",
        project_name: p.name,
        payload: { project_name: p.name, status: p.status },
        created_at: p.updated_at,
      })),
    ]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);

    return new Response(JSON.stringify({ ok: true, data: activities }), {
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

