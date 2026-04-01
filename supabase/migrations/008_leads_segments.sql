-- Migration 008: Leads Segmentation & Marketing Fields
-- Adds segment, marketing_opt_in, and last_active to profiles
-- Creates admin_leads_view for rich lead data

-- Add marketing fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS segment TEXT DEFAULT 'new_user',
  ADD COLUMN IF NOT EXISTS marketing_opt_in BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS total_bets INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_spent NUMERIC(12,2) DEFAULT 0;

-- Segment check constraint
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_segment_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_segment_check
  CHECK (segment IN ('new_user','active_fan','high_value','influencer','inactive','buyer','vip'));

-- Function to auto-update segment based on behavior
CREATE OR REPLACE FUNCTION public.update_user_segment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF NEW.role = 'influencer' THEN
    NEW.segment := 'influencer';
  ELSIF NEW.total_spent > 500 THEN
    NEW.segment := 'vip';
  ELSIF NEW.total_spent > 100 THEN
    NEW.segment := 'buyer';
  ELSIF NEW.total_bets > 50 THEN
    NEW.segment := 'high_value';
  ELSIF NEW.total_bets > 5 THEN
    NEW.segment := 'active_fan';
  ELSIF NEW.last_active_at < now() - INTERVAL '30 days' THEN
    NEW.segment := 'inactive';
  ELSE
    NEW.segment := 'new_user';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_update_segment
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_user_segment();

-- Admin leads view (requires service_role or admin policy)
CREATE OR REPLACE VIEW public.admin_leads_view AS
SELECT
  p.id,
  COALESCE(p.full_name, p.name) AS full_name,
  p.email,
  p.role,
  p.status,
  p.segment,
  p.marketing_opt_in,
  p.last_active_at,
  p.total_bets,
  p.total_spent,
  p.created_at,
  p.avatar_initials,
  CASE
    WHEN p.created_at > now() - INTERVAL '7 days' THEN true
    ELSE false
  END AS is_new
FROM public.profiles p
ORDER BY p.created_at DESC;

-- Grant access to admin_leads_view
GRANT SELECT ON public.admin_leads_view TO authenticated;

-- RLS for profiles: allow admin to read all leads data
DROP POLICY IF EXISTS "admin_can_read_all_profiles" ON public.profiles;
CREATE POLICY "admin_can_read_all_profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR id = auth.uid()
  );
