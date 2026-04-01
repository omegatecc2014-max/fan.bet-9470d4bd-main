import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore: Deno is defined in the Supabase Edge Function environment
declare const Deno: any;

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req: any) => {
  const { amount, currency_id, description, payer_email, payer_name, payer_cpf, method } = await req.json()

  // 1. Create Internal Transaction
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
  const { data: profile } = await supabase.from('profiles').select('id, name, avatar_initials').eq('email', payer_email).single()

  const { data: transaction, error: txError } = await supabase.from('transactions').insert({
    profile_id: profile.id,
    profile_name: profile.name,
    profile_avatar: profile.avatar_initials,
    type: 'deposit',
    method: method === 'pix' ? 'PIX' : 'Cartão',
    amount: amount,
    status: 'pending'
  }).select().single()

  if (txError) return new Response(JSON.stringify({ error: txError.message }), { status: 400 })

  // 2. Mercado Pago Integration
  let mpResponse;
  if (method === 'pix') {
    mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': transaction.id
      },
      body: JSON.stringify({
        transaction_amount: amount,
        description: description,
        payment_method_id: 'pix',
        payer: {
          email: payer_email,
          first_name: payer_name.split(' ')[0],
          last_name: payer_name.split(' ').slice(1).join(' '),
          identification: {
            type: 'CPF',
            number: payer_cpf
          }
        },
        external_reference: transaction.id,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
      })
    })
  } else {
    // Credit Card (using preference for redirection)
    mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'BRL'
        }],
        payer: {
          email: payer_email,
          name: payer_name
        },
        external_reference: transaction.id,
        back_urls: {
          success: `${req.headers.get('origin')}/wallet?status=success`,
          failure: `${req.headers.get('origin')}/wallet?status=failure`,
          pending: `${req.headers.get('origin')}/wallet?status=pending`
        },
        auto_return: 'approved'
      })
    })
  }

  const mpData = await mpResponse.json()
  return new Response(JSON.stringify(mpData), {
    headers: { 'Content-Type': 'application/json' },
  })
})
