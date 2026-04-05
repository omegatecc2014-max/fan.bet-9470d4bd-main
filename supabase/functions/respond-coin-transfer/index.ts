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
    const { transferId, action, recipientNotes } = body;

    if (!transferId || !action) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    if (action !== "accept" && action !== "reject") {
      return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: corsHeaders });
    }

    // Get current transfer
    const { data: transfer, error: fetchError } = await supabaseAdmin
      .from("coin_transfers")
      .select("*")
      .eq("id", transferId)
      .single();

    if (fetchError || !transfer) {
      return new Response(JSON.stringify({ error: "Transfer not found" }), { status: 404, headers: corsHeaders });
    }

    // Verify user is the recipient
    if (transfer.recipient_id !== user.id) {
      return new Response(JSON.stringify({ error: "You are not the recipient of this transfer" }), { status: 403, headers: corsHeaders });
    }

    // Check current status
    if (transfer.status !== "approved_admin" && transfer.status !== "pending_recipient") {
      return new Response(JSON.stringify({ error: "Transfer cannot be processed in current status" }), { status: 400, headers: corsHeaders });
    }

    // Update transfer
    const updateData: any = {
      recipient_notes: recipientNotes || null,
    };

    if (action === "accept") {
      updateData.status = "completed";
      updateData.recipient_accepted_at = new Date().toISOString();
    } else {
      updateData.status = "rejected_recipient";
      updateData.recipient_rejected_at = new Date().toISOString();
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("coin_transfers")
      .update(updateData)
      .eq("id", transferId)
      .select("id, status, protocol")
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(JSON.stringify({ error: "Failed to update transfer" }), { status: 500, headers: corsHeaders });
    }

    // If accepted, add coins to recipient wallet
    if (action === "accept") {
      // Update recipient wallet balance
      const { error: walletError } = await supabaseAdmin
        .from("profiles")
        .update({
          balance: transfer.amount
        })
        .eq("id", transfer.recipient_id);
    }

    // Notify sender
    const notifTitle = action === "accept" 
      ? "Transferência aceita! 🎊" 
      : "Transferência rejeitada";
    
    const notifMessage = action === "accept"
      ? `${transfer.recipient_name} aceitou sua transferência de ${transfer.amount} ${transfer.currency_type}!`
      : `${transfer.recipient_name} rejeitou sua transferência de ${transfer.amount} ${transfer.currency_type}. ${recipientNotes ? 'Motivo: ' + recipientNotes : ''}`;

    await supabaseAdmin.from("notifications").insert({
      title: notifTitle,
      message: notifMessage,
      type: action === "accept" ? "success" : "warning",
      target_type: "specific_users",
      target_value: transfer.sender_id,
      sent_by: "System",
      read_count: 0,
      total_recipients: 1,
      status: "sent"
    });

    return new Response(
      JSON.stringify({
        success: true,
        transferId: updated.id,
        status: updated.status,
        message: action === "accept" ? "Transferência aceita! Moedas adicionadas à sua carteira." : "Transferência rejeitada."
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});