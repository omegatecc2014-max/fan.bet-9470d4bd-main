import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-ignore: Deno is defined in the Supabase Edge Function environment
declare const Deno: any;

const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req: any) => {
  try {
    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body))
    
    const { resource, topic, action } = body
    
    if (topic === 'payment' || action === 'payment.updated' || action === 'payment.created') {
      const paymentId = resource?.id || (typeof resource === 'string' ? resource.split('/').pop() : null)
      
      if (!paymentId) {
        console.error('No payment ID found in resource:', resource)
        return new Response('No payment ID', { status: 400 })
      }

      // 1. Fetch Payment from Mercado Pago
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` }
      })
      
      if (!mpResponse.ok) {
        console.error('Failed to fetch payment from MP:', await mpResponse.text())
        return new Response('MP fetch failed', { status: 502 })
      }

      const payment = await mpResponse.json()
      console.log(`Payment ${paymentId} status: ${payment.status}`)
      
      if (payment.status === 'approved') {
        const transactionId = payment.external_reference
        const amount = payment.transaction_amount
        
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)
        
        // 2. Find Transaction
        const { data: tx, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('id', transactionId)
          .single()
        
        if (tx && tx.status !== 'success') {
          console.log(`Updating transaction ${transactionId} to success`)
          
          // 3. Update Transaction Status
          const { error: updateError } = await supabase
            .from('transactions')
            .update({ status: 'success' })
            .eq('id', transactionId)
          
          if (updateError) {
            console.error('Error updating transaction:', updateError)
            return new Response('Update failed', { status: 500 })
          }
          
          // 4. Update Profile Balance
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('balance')
            .eq('id', tx.profile_id)
            .single()
          
          if (profileError) {
            console.error('Error fetching profile:', profileError)
            return new Response('Profile fetch failed', { status: 500 })
          }

          const newBalance = Number(profile.balance) + Number(amount)
          console.log(`Updating balance for profile ${tx.profile_id}: ${profile.balance} -> ${newBalance}`)
          
          const { error: balanceError } = await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('id', tx.profile_id)

          if (balanceError) {
            console.error('Error updating balance:', balanceError)
            return new Response('Balance update failed', { status: 500 })
          }
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Internal Server Error', { status: 500 })
  }
})
