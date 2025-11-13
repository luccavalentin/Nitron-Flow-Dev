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

    // Buscar dados financeiros
    const { data: funds } = await supabaseClient
      .from("financial_funds")
      .select("*")
      .eq("owner_id", user.id);

    const { data: payments } = await supabaseClient
      .from("payments")
      .select("*, projects!inner(owner_id)")
      .eq("projects.owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(12);

    const { data: transactions } = await supabaseClient
      .from("financial_transactions")
      .select("*, financial_funds!inner(owner_id)")
      .eq("financial_funds.owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    const totalBalance =
      funds?.reduce((sum, fund) => sum + parseFloat(fund.balance || "0"), 0) ||
      0;

    const monthlyRevenue =
      payments?.reduce(
        (sum, payment) => sum + parseFloat(payment.amount || "0"),
        0
      ) || 0;

    // Gerar insights básicos
    const insights: Array<{
      type: string;
      title: string;
      message: string;
    }> = [];

    if (totalBalance < 1000) {
      insights.push({
        type: "warning",
        title: "Saldo Baixo",
        message: `Seu saldo atual é R$ ${totalBalance.toFixed(
          2
        )}. Considere aumentar suas receitas ou reduzir gastos.`,
      });
    }

    if (monthlyRevenue > 0) {
      const avgMonthly = monthlyRevenue / (payments?.length || 1);
      insights.push({
        type: "info",
        title: "Receita Mensal",
        message: `Sua receita média mensal é R$ ${avgMonthly.toFixed(2)}.`,
      });
    }

    if (funds && funds.length > 0) {
      const largestFund = funds.reduce((max, fund) =>
        parseFloat(fund.balance || "0") > parseFloat(max.balance || "0")
          ? fund
          : max
      );

      insights.push({
        type: "success",
        title: "Maior Fundo",
        message: `${largestFund.name} tem R$ ${parseFloat(
          largestFund.balance || "0"
        ).toFixed(2)}.`,
      });
    }

    // TODO: Integrar com DeepSeek para insights mais avançados
    // Por enquanto, retornar insights básicos

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          insights,
          summary: {
            total_balance: totalBalance,
            monthly_revenue: monthlyRevenue,
            funds_count: funds?.length || 0,
            transactions_count: transactions?.length || 0,
          },
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
