// Supabase Edge Function: log_page_view
// Uses service role key to insert into page_views and capture IP from headers.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  let payload: {
    user_id?: string;
    page_key?: string;
    url_path?: string;
    user_agent?: string;
  };

  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400, headers: corsHeaders });
  }

  const userId = payload.user_id?.trim();
  const pageKey = payload.page_key?.trim();
  const urlPath = payload.url_path?.trim();

  if (!userId || !pageKey || !urlPath) {
    return new Response("Missing required fields", { status: 400, headers: corsHeaders });
  }

  const forwarded = req.headers.get("x-forwarded-for") || "";
  const ipAddress = forwarded.split(",")[0].trim() || null;

  const { error } = await supabase.from("page_views").insert({
    user_id: userId,
    page_key: pageKey,
    url_path: urlPath,
    user_agent: payload.user_agent ?? req.headers.get("user-agent") ?? null,
    ip_address: ipAddress
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
