import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    const body = await req.json();
    const { recipientId, recipientName, recipientAvatar, currencyType, amount, message } = body;

    if (!recipientId || !currencyType || !amount) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    // Get sender profile
    let senderName = user.user_metadata?.full_name || "Usuário";
    let senderAvatar = "US";
    let senderId = user.id;

    const { data: senderProfile } = await supabaseAdmin
      .from("profiles")
      .select("name, avatar_initials, id")
      .eq("id", user.id)
      .single();

    if (senderProfile) {
      senderName = senderProfile.name || senderName;
      senderAvatar = senderProfile.avatar_initials || senderAvatar;
      senderId = senderProfile.id;
    }

    // Verify recipient exists
    const { data: recipientProfile } = await supabaseAdmin
      .from("profiles")
      .select("id, name, avatar_initials")
      .eq("id", recipientId)
      .single();

    if (!recipientProfile) {
      return new Response(JSON.stringify({ error: "Recipient not found" }), { status: 400, headers: corsHeaders });
    }

    // Generate protocol
    const protocol = "TRF-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create transfer request
    const { data: transfer, error: transferError } = await supabaseAdmin
      .from("coin_transfers")
      .insert({
        sender_id: senderId,
        sender_name: senderName,
        sender_avatar: senderAvatar,
        recipient_id: recipientId,
        recipient_name: recipientProfile.name || recipientName,
        recipient_avatar: recipientProfile.avatar_initials || recipientAvatar,
        currency_type: currencyType,
        amount: amount,
        status: "pending_admin",
        message: message || null,
        protocol: protocol
      })
      .select("id, protocol, status")
      .single();

    if (transferError) {
      console.error("Transfer error:", transferError);
      return new Response(JSON.stringify({ error: "Failed to create transfer: " + transferError.message }), { status: 500, headers: corsHeaders });
    }

    // Create notification for admin (optional)
    console.log("Transfer created:", transfer.id);

    return new Response(
      JSON.stringify({
        success: true,
        transferId: transfer.id,
        protocol: transfer.protocol,
        status: transfer.status,
        message: "Transferência solicitada! Aguarde aprovação do admin."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});