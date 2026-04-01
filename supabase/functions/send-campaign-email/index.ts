import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("RESEND_FROM_EMAIL") || "noreply@fan.bet";
const FROM_NAME = Deno.env.get("RESEND_FROM_NAME") || "Fan.bet";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Lead {
  id: string;
  name: string;
  email: string;
  segment: string;
}

interface RequestBody {
  subject: string;
  body: string;
  leads: Lead[];
  campaign_name?: string;
}

// Renders plain HTML email template with personalization
function buildHtml(body: string, recipientName: string): string {
  const personalizedBody = body
    .replace(/\{nome\}/gi, recipientName || "Amigo(a)")
    .replace(/\n/g, "<br>");

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fan.bet</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #080a14; font-family: 'Inter', Arial, sans-serif; color: #ffffff; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 24px 16px; }
    .header { background: linear-gradient(135deg, #1a1d2e, #0d0f1a); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 28px 32px; margin-bottom: 20px; text-align: center; }
    .logo { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #facc15, #f59e0b); border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 900; color: #080a14; }
    .logo-text { font-size: 22px; font-weight: 800; color: #ffffff; }
    .content { background: #0d0f1a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 32px; margin-bottom: 20px; }
    .greeting { font-size: 20px; font-weight: 700; color: #ffffff; margin-bottom: 12px; }
    .body-text { font-size: 15px; color: rgba(255,255,255,0.75); line-height: 1.7; }
    .cta { display: inline-block; margin-top: 24px; padding: 14px 32px; background: linear-gradient(135deg, #facc15, #f59e0b); color: #080a14; font-weight: 800; font-size: 15px; border-radius: 50px; text-decoration: none; }
    .footer { text-align: center; color: rgba(255,255,255,0.25); font-size: 12px; padding: 16px; }
    .badge { display: inline-block; padding: 4px 12px; background: rgba(250,204,21,0.15); color: #facc15; border: 1px solid rgba(250,204,21,0.3); border-radius: 50px; font-size: 11px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <div class="logo">
        <div class="logo-icon">F</div>
        <span class="logo-text">Fan.bet</span>
      </div>
      <p style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">A plataforma de previsões dos fãs</p>
    </div>
    <div class="content">
      <div class="badge">⭐ Mensagem Especial</div>
      <p class="greeting">Olá, ${recipientName || "Amigo(a)"}! 👋</p>
      <div class="body-text">${personalizedBody}</div>
      <a href="https://fan.bet" class="cta">🎯 Acessar Fan.bet</a>
    </div>
    <div class="footer">
      <p>Você está recebendo este e-mail pois faz parte da plataforma Fan.bet.</p>
      <p style="margin-top:6px">© ${new Date().getFullYear()} Fan.bet — Todos os direitos reservados</p>
      <p style="margin-top:6px"><a href="#" style="color:rgba(255,255,255,0.3)">Cancelar inscrição</a></p>
    </div>
  </div>
</body>
</html>`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY não configurada nas variáveis de ambiente do Supabase");
    }

    const { subject, body, leads, campaign_name }: RequestBody = await req.json();

    if (!subject || !body || !leads?.length) {
      return new Response(
        JSON.stringify({ error: "subject, body e leads são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send emails in batches of 10 (Resend rate limit friendly)
    const results: { email: string; success: boolean; id?: string; error?: string }[] = [];
    const batchSize = 10;

    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      const batchPromises = batch.map(async (lead) => {
        try {
          const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${RESEND_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: `${FROM_NAME} <${FROM_EMAIL}>`,
              to: [lead.email],
              subject: subject,
              html: buildHtml(body, lead.name?.split(" ")[0] || ""),
              tags: [
                { name: "campaign", value: campaign_name || "manual" },
                { name: "segment", value: lead.segment || "all" },
              ],
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            return { email: lead.email, success: false, error: data.message || "Erro ao enviar" };
          }
          return { email: lead.email, success: true, id: data.id };
        } catch (err) {
          return { email: lead.email, success: false, error: String(err) };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + batchSize < leads.length) {
        await new Promise(r => setTimeout(r, 300));
      }
    }

    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        sent,
        failed,
        total: leads.length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
