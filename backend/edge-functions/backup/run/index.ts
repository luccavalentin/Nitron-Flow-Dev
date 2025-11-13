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

    const body = await req.json().catch(() => ({}));
    const { project_id, include_snapshots } = body;

    // Se project_id fornecido, fazer backup apenas desse projeto
    // Caso contrário, backup completo do usuário
    let projectsToBackup = [];

    if (project_id) {
      // Verificar se o projeto pertence ao usuário
      const { data: project } = await supabaseClient
        .from("projects")
        .select("id, name")
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

      projectsToBackup = [project];
    } else {
      // Buscar todos os projetos do usuário
      const { data: projects } = await supabaseClient
        .from("projects")
        .select("id, name")
        .eq("owner_id", user.id);

      projectsToBackup = projects || [];
    }

    // TODO: Gerar backup completo
    // 1. Exportar schema SQL (apenas estrutura, não dados sensíveis)
    // 2. Exportar snapshots selecionados
    // 3. Criar arquivo ZIP
    // 4. Upload para bucket backups

    const backupId = `backup-${Date.now()}-${user.id.substring(0, 8)}`;
    const backupPath = `${user.id}/${backupId}.zip`;

    // Estrutura do backup (simulado)
    const backupManifest = {
      backup_id: backupId,
      user_id: user.id,
      created_at: new Date().toISOString(),
      projects: projectsToBackup.map((p) => p.id),
      include_snapshots: include_snapshots || false,
      schema_version: "1.0",
    };

    // TODO: Implementar geração real do ZIP com:
    // - Schema SQL
    // - Dados das tabelas (sem dados sensíveis)
    // - Snapshots (se solicitado)
    // - Metadados

    // Por enquanto, criar registro do backup
    const backupData = {
      path: backupPath,
      manifest: backupManifest,
      size: 0, // Será calculado quando ZIP for gerado
      status: "completed",
    };

    // TODO: Upload do ZIP para bucket backups
    // await supabaseClient.storage
    //   .from("backups")
    //   .upload(backupPath, zipBuffer, {
    //     contentType: "application/zip",
    //   });

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          ...backupData,
          message:
            "Backup criado. Implemente geração de ZIP e upload para bucket para funcionalidade completa.",
          download_url: `backups/${backupPath}`, // URL simulada
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

