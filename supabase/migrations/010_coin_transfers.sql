-- Create table for user-to-user coin transfers
CREATE TABLE IF NOT EXISTS public.coin_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Transfer requester (sender)
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  sender_avatar TEXT,
  
  -- Recipient user
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON Delete CASCADE,
  recipient_name TEXT NOT NULL,
  recipient_avatar TEXT,
  
  -- Currency details
  currency_type TEXT NOT NULL CHECK (currency_type IN ('stars', 'diamonds', 'gold', 'crowns', 'unicorns', 'chickens')),
  amount INTEGER NOT NULL,
  
  -- Status flow: pending_admin -> pending_recipient -> completed/rejected
  -- Admin approval: pending_admin (waiting) -> approved_admin (awaiting recipient) / rejected_admin
  -- Recipient response: approved_admin (waiting) -> completed / rejected_recipient
  status TEXT NOT NULL CHECK (status IN (
    'pending_admin',      -- Waiting admin approval
    'approved_admin',    -- Approved by admin, waiting recipient
    'rejected_admin',    -- Rejected by admin
    'pending_recipient', -- Waiting recipient acceptance (alias for approved_admin)
    'completed',         -- Transfer completed
    'rejected_recipient' -- Rejected by recipient
  )) DEFAULT 'pending_admin',
  
  -- Optional message
  message TEXT,
  
  -- Admin approval details
  admin_id UUID,
  admin_name TEXT,
  admin_notes TEXT,
  admin_approved_at TIMESTAMPTZ,
  
  -- Recipient response
  recipient_accepted_at TIMESTAMPTZ,
  recipient_rejected_at TIMESTAMPTZ,
  recipient_notes TEXT,
  
  -- Unique protocol
  protocol TEXT UNIQUE
);

-- Indexes
CREATE INDEX IF NOT EXISTS coin_transfers_sender_idx ON public.coin_transfers (sender_id);
CREATE INDEX IF NOT EXISTS coin_transfers_recipient_idx ON public.coin_transfers (recipient_id);
CREATE INDEX IF NOT EXISTS coin_transfers_status_idx ON public.coin_transfers (status);
CREATE INDEX IF NOT EXISTS coin_transfers_created_idx ON public.coin_transfers (created_at DESC);
CREATE INDEX IF NOT EXISTS coin_transfers_protocol_idx ON public.coin_transfers (protocol);

-- Enable RLS
ALTER TABLE public.coin_transfers ENABLE ROW LEVEL SECURITY;

-- Policy for admin: full access
DROP POLICY IF EXISTS admin_select_coin_transfers ON public.coin_transfers;
CREATE POLICY admin_select_coin_transfers ON public.coin_transfers FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS admin_insert_coin_transfers ON public.coin_transfers;
CREATE POLICY admin_insert_coin_transfers ON public.coin_transfers FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

DROP POLICY IF EXISTS admin_update_coin_transfers ON public.coin_transfers;
CREATE POLICY admin_update_coin_transfers ON public.coin_transfers FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policy for users: see own transfers
DROP POLICY IF EXISTS users_select_coin_transfers ON public.coin_transfers;
CREATE POLICY users_select_coin_transfers ON public.coin_transfers FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id OR auth.jwt() ->> 'role' = 'admin');

-- Update notifications table to include transfer type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type ENUM 
    WHERE typname = 'notification_type_enum'
  ) THEN
    -- Add transfer to notification types if needed
  END IF;
END $$;