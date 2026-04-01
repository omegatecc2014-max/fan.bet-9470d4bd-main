import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  const { resource, topic, action } = await req.json()
  
  if (topic === 'payment' || action === 'payment.updated') {
    const paymentId = resource.id || (typeof resource === 'string' ? resource.split('/').pop() : null)
    
    // 1. Fetch Payment from Mercado Pago
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
    })
    const payment = await mpResponse.json()
    
    if (payment.status === 'approved') {
      const transactionId = payment.external_reference
      const amount = payment.transaction_amount
      
      const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
      
      // 2. Find Transaction
      const { data: tx, error: txError } = await supabase.from('transactions').select('*').eq('id', transactionId).single()
      
      if (tx && tx.status !== 'success') {
        // 3. Update Transaction Status
        await supabase.from('transactions').update({ status: 'success' }).eq('id', transactionId)
        
        // 4. Update Profile Balance
        const { data: profile } = await supabase.from('profiles').select('balance').eq('id', tx.profile_id).single()
        const newBalance = Number(profile.balance) + Number(amount)
        await supabase.from('profiles').update({ balance: newBalance }).eq('id', tx.profile_id)
      }
    }
  }

  return new Response('OK', { status: 200 })
})
