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
    const { sessionId, message, projectId } = body;

    if (!message) {
      return new Response(
        JSON.stringify({ ok: false, error: "message é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");

    if (!deepseekApiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "DEEPSEEK_API_KEY não configurado" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar histórico da sessão se existir
    let conversationHistory = [];
    let currentSessionId = sessionId;

    if (sessionId) {
      const { data: existingMessages } = await supabaseClient
        .from("ai_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (existingMessages) {
        conversationHistory = existingMessages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
      }
    } else {
      // Criar nova sessão
      const { data: newSession } = await supabaseClient
        .from("creative_sessions")
        .insert({
          project_id: projectId || null,
          title: message.substring(0, 50),
          created_by: user.id,
        })
        .select()
        .single();

      if (newSession) {
        currentSessionId = newSession.id;
      }
    }

    // Adicionar mensagem do usuário ao histórico
    conversationHistory.push({ role: "user", content: message });

    // Chamar DeepSeek API
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${deepseekApiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "Você é um assistente criativo que ajuda desenvolvedores a transformar ideias em projetos. Responda em português brasileiro.",
          },
          ...conversationHistory,
        ],
        temperature: 0.7,
      }),
    });

    if (!deepseekResponse.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: "Erro ao chamar DeepSeek" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const deepseekData = await deepseekResponse.json();
    const assistantMessage = deepseekData.choices[0]?.message?.content || "Erro ao gerar resposta";

    // Salvar mensagens no banco
    if (currentSessionId) {
      await supabaseClient.from("ai_messages").insert([
        {
          session_id: currentSessionId,
          role: "user",
          content: message,
        },
        {
          session_id: currentSessionId,
          role: "assistant",
          content: assistantMessage,
        },
      ]);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          role: "assistant",
          content: assistantMessage,
          session_id: currentSessionId,
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

