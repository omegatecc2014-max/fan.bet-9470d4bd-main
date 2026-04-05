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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { transactionId, action, adminNotes } = body;

    if (!transactionId || !action) {
      throw new Error("ID da transação e ação são obrigatórios");
    }

    let newStatus: string;
    if (action === "approve") {
      newStatus = "success";
    } else if (action === "reject") {
      newStatus = "failed";
    } else {
      throw new Error("Ação inválida. Use 'approve' ou 'reject'");
    }

    // Get current transaction to find user
    const { data: currentTx, error: fetchError } = await supabase
      .from("transactions")
      .select("profile_id, profile_name, amount, protocol, pix_recipient_name")
      .eq("id", transactionId)
      .single();

    if (fetchError) throw fetchError;

    // Update transaction status
    const { error: updateError } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        processed_at: new Date().toISOString(),
        processed_by: "Admin",
        admin_notes: adminNotes || null
      })
      .eq("id", transactionId);

    if (updateError) throw updateError;

    // Send notification to user
    let title = "";
    let message = "";
    let notifType = "info";

    if (action === "approve") {
      title = "Saque Aprovado! 🎉";
      message = `Seu saque de R$ ${currentTx.amount?.toFixed(2)} foi aprovado e o pagamento será processado em breve. Protocolo: ${currentTx.protocol || transactionId}`;
      notifType = "success";
    } else {
      title = "Saque Reprovado";
      message = `Seu saque de R$ ${currentTx.amount?.toFixed(2)} foi reprovado. ${adminNotes ? 'Motivo: ' + adminNotes : 'Entre em contato com o suporte.'}`;
      notifType = "error";
    }

    if (currentTx?.profile_id) {
      // Create notification record
      const { data: notif, error: notifError } = await supabase
        .from("notifications")
        .insert({
          title,
          message,
          type: notifType,
          target_type: "specific_users",
          target_value: currentTx.profile_id,
          sent_by: "Admin",
          read_count: 0,
          total_recipients: 1,
          status: "sent"
        })
        .select("id")
        .single();

      if (!notifError && notif) {
        // Create user notification delivery
        await supabase
          .from("user_notifications")
          .insert({
            notification_id: notif.id,
            user_id: currentTx.profile_id,
            user_email: "", // We could fetch this from profiles if needed
            user_name: currentTx.profile_name || "Usuário",
            delivered: true,
            delivered_at: new Date().toISOString(),
            read: false,
            read_at: null
          });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: action === "approve" ? "Saque aprovado com sucesso" : "Saque reprovado",
        newStatus
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});