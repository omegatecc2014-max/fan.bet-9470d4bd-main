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

    // Admin client for database operations (bypasses RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get("Authorization");
    
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header missing" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // User client with Authorization header for auth checks
    const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authenticated user:", user.id);

    // Parse request body
    const body = await req.json();
    const { amount, pixKey, pixKeyType, recipientName, recipientBank, convertedCurrency, convertedAmount, conversionRate } = body;

    if (!amount) {
      return new Response(
        JSON.stringify({ error: "Amount is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user profile
    let profileName = user.user_metadata?.full_name || "Usuário";
    let profileEmail = user.email || "";
    let profileDocument = "";
    let profileAvatar = "US";
    let profileId = user.id;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("name, email, cpf, avatar_initials, id")
      .eq("id", user.id)
      .single();

    if (!profileError && profile) {
      profileName = profile.name || profileName;
      profileEmail = profile.email || profileEmail;
      profileDocument = profile.cpf || "";
      profileAvatar = profile.avatar_initials || profileAvatar;
      profileId = profile.id;
    }

    // Generate protocol
    const protocol = "SQT-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Create transaction record using admin client
    const insertData = {
      profile_id: profileId,
      profile_name: profileName,
      profile_avatar: profileAvatar,
      profile_email: profileEmail,
      profile_document: profileDocument || null,
      type: "withdrawal",
      method: "PIX",
      amount: amount,
      status: "pending",
      pix_key: pixKey || null,
      pix_key_type: pixKeyType || "cpf",
      pix_recipient_name: recipientName || profileName,
      pix_recipient_bank: recipientBank || null,
      converted_currency: convertedCurrency || null,
      converted_amount: convertedAmount || null,
      conversion_rate: conversionRate || null,
      protocol: protocol
    };

    const { data: transaction, error: txError } = await supabaseAdmin
      .from("transactions")
      .insert(insertData)
      .select("id, protocol")
      .single();

    if (txError) {
      console.error("Database error:", txError);
      return new Response(
        JSON.stringify({ error: "Database error: " + txError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Transaction created:", transaction.id);

    return new Response(
      JSON.stringify({
        success: true,
        protocol: transaction.protocol,
        transactionId: transaction.id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error: " + error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});