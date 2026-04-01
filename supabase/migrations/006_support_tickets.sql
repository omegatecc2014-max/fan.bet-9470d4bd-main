-- Drop first to fix bad schema from previous iterations
DROP TABLE IF EXISTS support_tickets CASCADE;

-- Create support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    protocol TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('assistance', 'complaint')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can create their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users can view their own tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets;

-- Users can create their own tickets
CREATE POLICY "Users can create their own tickets"
    ON support_tickets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
    ON support_tickets FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can view all tickets
CREATE POLICY "Admins can view all tickets"
    ON support_tickets FOR SELECT
    USING (auth.jwt() ->> 'role' = 'admin');

-- Admins can update tickets
CREATE POLICY "Admins can update tickets"
    ON support_tickets FOR UPDATE
    USING (auth.jwt() ->> 'role' = 'admin');
