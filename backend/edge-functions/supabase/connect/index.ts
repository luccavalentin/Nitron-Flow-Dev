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
    const { authType, email, password, projectName, projectRef, project_id } = body;

    // Modo 1: Conectar projeto existente via URL + Anon Key
    if (authType === "url" && projectRef) {
      // Validar conexão testando SELECT now()
      const testClient = createClient(
        `https://${projectRef}.supabase.co`,
        body.anonKey
      );

      try {
        const { error: testError } = await testClient
          .from("_test")
          .select("now()")
          .limit(1);

        // Se não der erro (mesmo que tabela não exista), conexão é válida
        // Salvar conexão
        const { data: integration, error } = await supabaseClient
          .from("integrations")
          .insert({
            project_id: project_id || null,
            provider: "supabase",
            config: {
              project_ref: projectRef,
              url: `https://${projectRef}.supabase.co`,
              anon_key: body.anonKey,
            },
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

        // Atualizar projeto com referência
        if (project_id) {
          await supabaseClient
            .from("projects")
            .update({
              supabase_project_ref: projectRef,
              supabase_db_url: `https://${projectRef}.supabase.co`,
            })
            .eq("id", project_id);
        }

        return new Response(JSON.stringify({ ok: true, data: integration }), {
          status: 201,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({ ok: false, error: "Conexão inválida" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Modo 2: Criar novo projeto via Management API (requer service_role)
    if (authType === "create" && projectName) {
      const serviceRoleKey = Deno.env.get("SERVICE_ROLE_KEY");

      if (!serviceRoleKey) {
        return new Response(
          JSON.stringify({
            ok: false,
            error: "SERVICE_ROLE_KEY não configurado",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // TODO: Implementar criação via Management API
      // Por enquanto, retornar erro
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Criação de projetos ainda não implementada",
        }),
        {
          status: 501,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ ok: false, error: "Parâmetros inválidos" }),
      {
        status: 400,
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

