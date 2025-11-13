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
    const projectId = url.searchParams.get("projectId");

    // Buscar fundos financeiros
    let fundsQuery = supabaseClient
      .from("financial_funds")
      .select("*");

    if (projectId) {
      fundsQuery = fundsQuery.eq("project_id", projectId);
    } else {
      // Buscar fundos de todos os projetos do usuário
      const { data: projects } = await supabaseClient
        .from("projects")
        .select("id")
        .eq("owner_id", user.id);

      if (projects && projects.length > 0) {
        fundsQuery = fundsQuery.in(
          "project_id",
          projects.map((p) => p.id)
        );
      }
    }

    const { data: funds, error: fundsError } = await fundsQuery;

    if (fundsError) {
      return new Response(
        JSON.stringify({ ok: false, error: fundsError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Calcular totais
    const totalBalance = funds?.reduce((sum, fund) => sum + parseFloat(fund.balance || "0"), 0) || 0;

    // Buscar transações recentes
    const { data: recentTransactions } = await supabaseClient
      .from("financial_transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    // Calcular KPIs básicos (simplificado)
    const { data: allPayments } = await supabaseClient
      .from("payments")
      .select("amount")
      .eq("currency", "BRL");

    const totalRevenue = allPayments?.reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0) || 0;
    const activeLicenses = await supabaseClient
      .from("licenses")
      .select("id", { count: "exact" })
      .eq("status", "active");

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          funds: funds || [],
          total_balance: totalBalance,
          recent_transactions: recentTransactions || [],
          kpis: {
            total_revenue: totalRevenue,
            active_licenses: activeLicenses.count || 0,
            roi: 0, // TODO: Calcular ROI
            ltv: 0, // TODO: Calcular LTV
            cac: 0, // TODO: Calcular CAC
            runway: 0, // TODO: Calcular Runway
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

