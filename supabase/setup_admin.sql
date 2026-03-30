-- ================================================================
-- Setup Admin Account: omegatecc2014@gmail.com
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
-- ================================================================

-- 1. Update auth.users metadata to include the admin role
-- This is required for the adminGuard.ts check (app_metadata.role)
-- In SQL, Supabase uses the column name 'raw_app_meta_data'
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'::jsonb), 
  '{role}', 
  '"admin"'
)
WHERE email = 'omegatecc2014@gmail.com';

-- 2. Synchronize with the public.profiles table
-- This ensures the application logic recognizes the user as an admin
INSERT INTO public.profiles (id, email, name, role, status, verified, avatar_initials)
SELECT id, email, 'Super Admin', 'admin', 'active', true, 'SA'
FROM auth.users
WHERE email = 'omegatecc2014@gmail.com'
ON CONFLICT (email) DO UPDATE 
SET 
  role = 'admin', 
  status = 'active',
  name = 'Super Admin',
  verified = true;

-- 3. (Optional) If the user is also an influencer, ensure they have a profile
-- This part is optional but helpful if you want to test influencer features with this account
INSERT INTO public.influencer_profiles (profile_id, handle, followers, subscribers, accuracy_pct, tier)
SELECT p.id, '@admin_fanbet', 1000, 50, 99.0, 'gold'
FROM public.profiles p
WHERE p.email = 'omegatecc2014@gmail.com'
ON CONFLICT (handle) DO NOTHING;
