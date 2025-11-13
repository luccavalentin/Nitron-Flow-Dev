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
    const { payment_id } = body;

    if (!payment_id) {
      return new Response(
        JSON.stringify({ ok: false, error: "payment_id é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar pagamento e dados relacionados
    const { data: payment } = await supabaseClient
      .from("payments")
      .select("*, projects!inner(owner_id, name), clients(*), licenses(*)")
      .eq("id", payment_id)
      .single();

    if (!payment) {
      return new Response(
        JSON.stringify({ ok: false, error: "Pagamento não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verificar permissão
    const project = payment.projects as any;
    if (project.owner_id !== user.id) {
      return new Response(
        JSON.stringify({ ok: false, error: "Sem permissão" }),
        {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Gerar PDF do recibo usando biblioteca de PDF (ex: pdfkit, jsPDF)
    // Por enquanto, criar estrutura HTML que pode ser convertida para PDF
    const receiptData = {
      receipt_number: `REC-${payment_id.substring(0, 8).toUpperCase()}`,
      payment_date: payment.paid_at,
      client: payment.clients,
      project: project.name,
      amount: payment.amount,
      currency: payment.currency || "BRL",
      description: `Pagamento referente ao projeto ${project.name}`,
    };

    // TODO: Gerar PDF real e salvar no bucket receipts
    // Por enquanto, criar registro de recibo com path simulado
    const receiptPath = `receipts/${payment_id}/${receiptData.receipt_number}.pdf`;

    const { data: receipt, error: receiptError } = await supabaseClient
      .from("receipts")
      .insert({
        payment_id,
        project_id: payment.project_id,
        client_id: payment.client_id,
        receipt_path: receiptPath,
      })
      .select()
      .single();

    if (receiptError) {
      return new Response(
        JSON.stringify({ ok: false, error: receiptError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // TODO: Upload do PDF para o bucket receipts
    // Por enquanto, retornar dados do recibo
    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          ...receipt,
          receipt_data: receiptData,
          pdf_path: receiptPath,
          message:
            "Recibo gerado. Integre com biblioteca de PDF para gerar arquivo real.",
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

