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
    const { paymentId, allocationPlan, projectId } = body;

    if (!paymentId) {
      return new Response(
        JSON.stringify({ ok: false, error: "paymentId é obrigatório" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar pagamento
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .single();

    if (paymentError || !payment) {
      return new Response(
        JSON.stringify({ ok: false, error: "Pagamento não encontrado" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar regra de alocação padrão ou usar a fornecida
    let allocation = allocationPlan;

    if (!allocation) {
      const { data: rule } = await supabaseClient
        .from("fincore_rules")
        .select("allocation")
        .eq("project_id", projectId || payment.project_id)
        .eq("active", true)
        .single();

      if (rule) {
        allocation = rule.allocation;
      } else {
        // Alocação padrão
        allocation = {
          reinvestimento: 30,
          marketing: 20,
          reserva: 20,
          inovacao: 15,
          pro_labore: 10,
          investimentos: 5,
        };
      }
    }

    const amount = parseFloat(payment.amount || "0");
    const transactions = [];

    // Criar fundos se não existirem
    const fundCodes = Object.keys(allocation);
    const targetProjectId = projectId || payment.project_id;

    for (const code of fundCodes) {
      // Verificar se fundo existe
      const { data: existingFund } = await supabaseClient
        .from("financial_funds")
        .select("id")
        .eq("code", code)
        .eq("project_id", targetProjectId)
        .single();

      let fundId;

      if (!existingFund) {
        // Criar fundo
        const { data: newFund } = await supabaseClient
          .from("financial_funds")
          .insert({
            project_id: targetProjectId,
            name: code.charAt(0).toUpperCase() + code.slice(1),
            code,
            balance: 0,
          })
          .select()
          .single();

        fundId = newFund?.id;
      } else {
        fundId = existingFund.id;
      }

      if (fundId) {
        const allocationAmount = (amount * allocation[code]) / 100;

        // Criar transação
        const { data: transaction } = await supabaseClient
          .from("financial_transactions")
          .insert({
            fund_id: fundId,
            project_id: targetProjectId,
            payment_id: paymentId,
            type: "credit",
            amount: allocationAmount,
            currency: payment.currency || "BRL",
            reference: `Distribuição automática de ${payment.id}`,
          })
          .select()
          .single();

        // Atualizar saldo do fundo
        await supabaseClient.rpc("increment_fund_balance", {
          fund_id: fundId,
          amount: allocationAmount,
        });

        if (transaction) {
          transactions.push(transaction);
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          payment_id: paymentId,
          total_amount: amount,
          allocation,
          transactions,
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

