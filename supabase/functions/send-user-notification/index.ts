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
    const { userId, title, message, type, transactionId } = body;

    if (!userId || !title || !message) {
      throw new Error("userId, title e message são obrigatórios");
    }

    // Get user profile for email and name
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    // Create notification in database
    const { data: notification, error: notifError } = await supabase
      .from("notifications")
      .insert({
        title,
        message,
        type: type || "info",
        target_type: "specific_users",
        target_value: userId,
        sent_by: "Admin",
        read_count: 0,
        total_recipients: 1,
        status: "sent"
      })
      .select("id")
      .single();

    if (notifError) throw notifError;

    // Create user notification delivery
    if (notification) {
      const { error: deliveryError } = await supabase
        .from("user_notifications")
        .insert({
          notification_id: notification.id,
          user_id: userId,
          user_email: profile?.email || "",
          user_name: profile?.name || "Usuário",
          delivered: true,
          delivered_at: new Date().toISOString(),
          read: false,
          read_at: null,
          created_at: new Date().toISOString()
        });

      if (deliveryError) {
        console.error("Delivery error:", deliveryError);
      }
    }

    // Log the action in transaction if provided
    if (transactionId) {
      await supabase
        .from("transactions")
        .update({
          admin_notes: `Notificação enviada: ${title} - ${message.substring(0, 100)}...`
        })
        .eq("id", transactionId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Notificação enviada com sucesso",
        notificationId: notification?.id
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