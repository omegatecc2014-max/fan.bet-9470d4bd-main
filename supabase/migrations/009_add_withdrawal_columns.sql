-- Migration: Add withdrawal and PIX columns to existing transactions table
-- Run this in Supabase SQL Editor

-- Add columns for withdrawals and PIX data
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS profile_email TEXT,
ADD COLUMN IF NOT EXISTS profile_document TEXT,
ADD COLUMN IF NOT EXISTS pix_key TEXT,
ADD COLUMN IF NOT EXISTS pix_key_type TEXT,
ADD COLUMN IF NOT EXISTS pix_recipient_name TEXT,
ADD COLUMN IF NOT EXISTS pix_recipient_bank TEXT,
ADD COLUMN IF NOT EXISTS converted_currency TEXT,
ADD COLUMN IF NOT EXISTS converted_amount NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS conversion_rate NUMERIC(10, 4),
ADD COLUMN IF NOT EXISTS protocol TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS processed_by TEXT,
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMPTZ;

-- Add constraint for pix_key_type if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_pix_key_type_check'
    ) THEN
        ALTER TABLE public.transactions 
        ADD CONSTRAINT transactions_pix_key_type_check 
        CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random'));
    END IF;
END $$;

-- Add unique constraint for protocol if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'transactions_protocol_unique'
    ) THEN
        ALTER TABLE public.transactions 
        ADD CONSTRAINT transactions_protocol_unique UNIQUE (protocol);
    END IF;
END $$;

-- Add index for protocol
CREATE INDEX IF NOT EXISTS transactions_protocol_idx ON public.transactions (protocol);