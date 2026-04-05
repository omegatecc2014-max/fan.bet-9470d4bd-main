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

    // Verify admin role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("role, name")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin access required" }), { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    const { transferId, action, adminNotes } = body;

    if (!transferId || !action) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: corsHeaders });
    }

    if (action !== "approve" && action !== "reject") {
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

    if (transfer.status !== "pending_admin") {
      return new Response(JSON.stringify({ error: "Transfer already processed" }), { status: 400, headers: corsHeaders });
    }

    // Update transfer
    const updateData: any = {
      admin_id: user.id,
      admin_name: profile.name || "Admin",
      admin_approved_at: action === "approve" ? new Date().toISOString() : null,
      admin_notes: adminNotes || null,
    };

    if (action === "approve") {
      updateData.status = "approved_admin";
    } else {
      updateData.status = "rejected_admin";
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

    // Send notification to recipient (approved) or sender (rejected)
    const notifTitle = action === "approve" 
      ? "Transferência aprovada! 🎉" 
      : "Transferência rejeitada";
    
    const notifMessage = action === "approve"
      ? `Sua transferência de ${transfer.amount} ${transfer.currency_type} foi aprovada pelo admin. Agora aguarde a confirmação do destinatário.`
      : `Sua transferência de ${transfer.amount} ${transfer.currency_type} foi rejeitada pelo admin. ${adminNotes ? 'Motivo: ' + adminNotes : ''}`;

    const targetId = action === "approve" ? transfer.recipient_id : transfer.sender_id;

    // Create notification
    await supabaseAdmin.from("notifications").insert({
      title: notifTitle,
      message: notifMessage,
      type: action === "approve" ? "success" : "warning",
      target_type: "specific_users",
      target_value: targetId,
      sent_by: "Admin",
      read_count: 0,
      total_recipients: 1,
      status: "sent"
    });

    return new Response(
      JSON.stringify({
        success: true,
        transferId: updated.id,
        status: updated.status,
        message: action === "approve" ? "Transferência aprovada!" : "Transferência rejeitada!"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }
});