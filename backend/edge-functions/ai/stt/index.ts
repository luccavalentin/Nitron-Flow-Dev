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

    // Receber arquivo de áudio (multipart/form-data ou base64)
    const formData = await req.formData();
    const audioFile = formData.get("audio");
    const projectId = formData.get("project_id")?.toString();
    const sessionId = formData.get("session_id")?.toString();

    if (!audioFile) {
      return new Response(
        JSON.stringify({ ok: false, error: "Arquivo de áudio é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Converter File para ArrayBuffer
    const audioBuffer = await (audioFile as File).arrayBuffer();
    const audioBytes = new Uint8Array(audioBuffer);

    // Upload do arquivo para o bucket ai-uploads
    const fileName = `stt-${Date.now()}-${user.id}.${(audioFile as File).name.split('.').pop() || 'webm'}`;
    const filePath = projectId ? `${projectId}/${fileName}` : fileName;

    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from("ai-uploads")
      .upload(filePath, audioBytes, {
        contentType: (audioFile as File).type || "audio/webm",
        upsert: false,
      });

    if (uploadError) {
      return new Response(
        JSON.stringify({ ok: false, error: uploadError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Integrar com Whisper (OpenAI) ou Deepgram para STT
    // Por enquanto, retornar transcrição simulada
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    const useWhisper = Deno.env.get("USE_WHISPER") === "true";

    let transcript = "";
    let error = null;

    if (useWhisper && deepseekApiKey) {
      // Integração com Whisper API (OpenAI)
      try {
        const whisperResponse = await fetch(
          "https://api.openai.com/v1/audio/transcriptions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${deepseekApiKey}`,
            },
            body: formData,
          }
        );

        if (whisperResponse.ok) {
          const whisperData = await whisperResponse.json();
          transcript = whisperData.text;
        } else {
          error = "Erro ao transcrever com Whisper";
        }
      } catch (err) {
        error = err.message;
      }
    } else {
      // Transcrição simulada (para desenvolvimento)
      transcript =
        "[Transcrição simulada] Integre com Whisper ou Deepgram para transcrição real de áudio.";
    }

    if (error) {
      return new Response(
        JSON.stringify({ ok: false, error }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Salvar transcrição em ai_messages se session_id fornecido
    if (sessionId && transcript) {
      await supabaseClient.from("ai_messages").insert({
        session_id: sessionId,
        role: "user",
        content: transcript,
        content_meta: {
          type: "audio",
          file_path: uploadData.path,
          source: useWhisper ? "whisper" : "simulated",
        },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          transcript,
          file_path: uploadData.path,
          file_url: uploadData.path, // URL pública do arquivo
          session_id: sessionId || null,
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

