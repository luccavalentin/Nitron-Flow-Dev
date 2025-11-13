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
    const { since } = body;

    const kiwifyApiKey = Deno.env.get("KIWIFY_API_KEY");

    if (!kiwifyApiKey) {
      return new Response(
        JSON.stringify({ ok: false, error: "KIWIFY_API_KEY não configurado" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Buscar vendas do Kiwify
    const url = since
      ? `https://api.kiwify.com.br/v1/sales?since=${since}`
      : "https://api.kiwify.com.br/v1/sales";

    const kiwifyResponse = await fetch(url, {
      headers: {
        Authorization: `Bearer ${kiwifyApiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!kiwifyResponse.ok) {
      return new Response(
        JSON.stringify({ ok: false, error: "Erro ao buscar vendas do Kiwify" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sales = await kiwifyResponse.json();

    // Mapear vendas para payments e licenses
    const payments = [];
    const licenses = [];

    for (const sale of sales.data || []) {
      // Criar payment
      const { data: payment, error: paymentError } = await supabaseClient
        .from("payments")
        .insert({
          provider: "kiwify",
          provider_reference: sale.id,
          amount: parseFloat(sale.total || "0"),
          currency: "BRL",
          paid_at: sale.created_at,
        })
        .select()
        .single();

      if (!paymentError && payment) {
        payments.push(payment);

        // Criar license se houver produto
        if (sale.product_id) {
          const { data: license } = await supabaseClient
            .from("licenses")
            .insert({
              payment_id: payment.id,
              license_key: `KIW-${sale.id}-${Date.now()}`,
              status: "active",
              price: parseFloat(sale.total || "0"),
              issued_at: sale.created_at,
            })
            .select()
            .single();

          if (license) {
            licenses.push(license);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        data: {
          payments_created: payments.length,
          licenses_created: licenses.length,
          payments,
          licenses,
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

