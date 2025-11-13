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
    const { scenario, months, revenue_per_month, expenses_per_month } = body;

    if (!scenario || !months) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "scenario e months são obrigatórios",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar fundos atuais
    const { data: funds } = await supabaseClient
      .from("financial_funds")
      .select("*")
      .eq("owner_id", user.id);

    const currentBalance =
      funds?.reduce((sum, fund) => sum + parseFloat(fund.balance || "0"), 0) ||
      0;

    // Simular cenário
    const simulation = [];
    let balance = currentBalance;
    const revenue = parseFloat(revenue_per_month || "0");
    const expenses = parseFloat(expenses_per_month || "0");
    const net = revenue - expenses;

    for (let month = 1; month <= months; month++) {
      balance += net;
      simulation.push({
        month,
        revenue,
        expenses,
        net,
        balance,
        runway: expenses > 0 ? Math.floor(balance / expenses) : Infinity,
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          scenario,
          current_balance: currentBalance,
          simulation,
          final_balance: balance,
          average_runway:
            expenses > 0
              ? Math.floor(
                  simulation.reduce((sum, s) => sum + s.runway, 0) / months
                )
              : Infinity,
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

