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

    // Buscar projetos do usuário
    const { data: projects } = await supabaseClient
      .from("projects")
      .select("id, name")
      .eq("owner_id", user.id);

    if (!projects || projects.length === 0) {
      return new Response(JSON.stringify({ ok: true, data: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar licenças e pagamentos por projeto
    const { data: licenses } = await supabaseClient
      .from("licenses")
      .select("*, payments(amount), projects(name)")
      .in(
        "project_id",
        projects.map((p) => p.id)
      );

    // Agrupar por projeto
    const productsMap = new Map();

    licenses?.forEach((license) => {
      const projectId = license.project_id;
      const projectName = license.projects?.name || "Sem nome";

      if (!productsMap.has(projectId)) {
        productsMap.set(projectId, {
          id: projectId,
          name: projectName,
          version: "1.0.0",
          licenses_sold: 0,
          licenses_active: 0,
          unit_price: 0,
          total_revenue: 0,
        });
      }

      const product = productsMap.get(projectId);
      product.licenses_sold += 1;

      if (license.status === "active") {
        product.licenses_active += 1;
      }

      if (license.price) {
        product.unit_price = license.price;
        product.total_revenue += parseFloat(license.price || "0");
      }

      if (license.payments && license.payments.length > 0) {
        license.payments.forEach((payment: any) => {
          product.total_revenue += parseFloat(payment.amount || "0");
        });
      }
    });

    const products = Array.from(productsMap.values());

    return new Response(JSON.stringify({ ok: true, data: products }), {
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

