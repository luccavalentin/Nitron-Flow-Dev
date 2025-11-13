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
    const { budget_id, email } = body;

    if (!budget_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "budget_id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar orçamento
    const { data: budget } = await supabaseClient
      .from("budgets")
      .select("*, projects!inner(owner_id), clients(*)")
      .eq("id", budget_id)
      .single();

    if (!budget) {
      return new Response(
        JSON.stringify({ ok: false, error: "Orçamento não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar permissão
    const project = budget.projects as any;
    if (project.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sem permissão" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Gerar PDF do orçamento e salvar no bucket receipts
    // Por enquanto, simular envio de email
    const client = budget.clients as any;
    const recipientEmail = email || client?.contact?.email || null;

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "Email do destinatário não encontrado",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Integrar com serviço de email (Resend, SendGrid, etc.)
    // Por enquanto, retornar sucesso simulado
    const emailResult = {
      sent: true,
      recipient: recipientEmail,
      budget_id: budget_id,
      message: "Orçamento enviado com sucesso (simulado). Integre com serviço de email para envio real.",
    };

    // Atualizar status do orçamento
    await supabaseClient
      .from("budgets")
      .update({ status: "sent" })
      .eq("id", budget_id);

    return new Response(JSON.stringify({ ok: true, data: emailResult }), {
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

