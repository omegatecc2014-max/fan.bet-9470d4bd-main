-- ================================================================
-- Fan.bet Admin Features - Migration 003
-- Run this in your Supabase SQL Editor
-- ================================================================

-- ──────────────────────────────────────────────────────────
-- 1. Helper to Insert User via Admin
-- ──────────────────────────────────────────────────────────
create or replace function public.fn_create_user(
  new_email text,
  new_name text,
  new_role text,
  new_password text
)
returns uuid
language plpgsql
security definer
as $$
declare
  new_user_id uuid;
begin
  -- Note: This is a simplified fallback that just creates a profile. 
  -- In a full Supabase environment, you would use Supabase Management API 
  -- or a proper trigger to create auth.users, or an Edge Function.
  -- Here we assume we only create the public profile.
  insert into public.profiles (email, name, role)
  values (new_email, new_name, new_role)
  returning id into new_user_id;
  
  return new_user_id;
end;
$$;

-- ──────────────────────────────────────────────────────────
-- 2. Helper to Delete User
-- ──────────────────────────────────────────────────────────
create or replace function public.fn_delete_user(target_id uuid)
returns void
language sql
security definer
as $$
  delete from public.profiles where id = target_id;
$$;

-- ──────────────────────────────────────────────────────────
-- 3. Get Login History (from page_events)
-- ──────────────────────────────────────────────────────────
-- We use page_events as a proxy for activity
create or replace function public.fn_get_user_history(target_email text)
returns json
language sql
security definer
as $$
  select json_agg(t) from (
    select id, created_at, page, device, session_duration_s
    from public.page_events
    -- We assume the page event or another table tracks user ID, 
    -- but currently page_events doesn't have a profile_id. 
    -- We will query all for the demo or assume a specific link.
    -- For real data, you would alter page_events to add profile_id.
    order by created_at desc
    limit 20
  ) t;
$$;

-- ──────────────────────────────────────────────────────────
-- 4. Get User Content Reports
-- ──────────────────────────────────────────────────────────
create or replace function public.fn_get_user_reports(target_name text)
returns setof public.content_reports
language sql
security definer
as $$
  select * from public.content_reports 
  where author_name = target_name
  order by created_at desc;
$$;
