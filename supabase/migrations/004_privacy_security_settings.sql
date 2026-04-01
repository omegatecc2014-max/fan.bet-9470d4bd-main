-- ================================================================
-- Fan.bet Admin Schema — Migration 004
-- Privacy & Security Settings
-- ================================================================

-- ──────────────────────────────────────────────────────────
-- 1. USER_PRIVACY_SETTINGS
-- ──────────────────────────────────────────────────────────
create table if not exists public.user_privacy_settings (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references public.profiles (id) on delete cascade,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  
  -- Profile visibility
  profile_visibility       text not null default 'public' check (profile_visibility in ('public', 'followers', 'private')),
  
  -- Statistics visibility
  show_bet_statistics      boolean not null default true,
  show_win_rate            boolean not null default true,
  show_profit_loss         boolean not null default true,
  show_ranking             boolean not null default true,
  show_bet_history         boolean not null default true,
  show_followed_influencers boolean not null default true,
  
  -- Activity visibility
  show_last_active         boolean not null default true,
  show_location            boolean not null default false,
  
  -- Communication
  allow_dm_from_followers   boolean not null default true,
  allow_dm_from_anyone     boolean not null default false,
  show_online_status       boolean not null default false,
  
  -- Data control
  show_in_search_results   boolean not null default true,
  allow_data_export        boolean not null default true,
  
  -- Content settings
  show_predictions_feed    boolean not null default true,
  show_comments            boolean not null default true
);

create index if not exists user_privacy_settings_user_id_idx on public.user_privacy_settings (user_id);

alter table public.user_privacy_settings enable row level security;

drop policy if exists "user_manage_own_privacy_settings" on public.user_privacy_settings;
create policy "user_manage_own_privacy_settings"
  on public.user_privacy_settings for all
  using (auth.uid() = user_id);

drop policy if exists "admin_view_privacy_settings" on public.user_privacy_settings;
create policy "admin_view_privacy_settings"
  on public.user_privacy_settings for select
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 2. USER_SECURITY_SETTINGS
-- ──────────────────────────────────────────────────────────
create table if not exists public.user_security_settings (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null unique references public.profiles (id) on delete cascade,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  
  -- Two-factor authentication
  two_factor_enabled       boolean not null default false,
  two_factor_method        text check (two_factor_method in ('totp', 'sms', 'email')) default null,
  two_factor_phone         text,
  
  -- PIN protection
  pin_enabled              boolean not null default false,
  pin_hash                 text,
  pin_required_for_withdrawal boolean not null default true,
  pin_required_for_transfer  boolean not null default true,
  
  -- Login alerts
  alert_on_new_login       boolean not null default true,
  alert_on_password_change boolean not null default true,
  alert_on_2fa_change     boolean not null default true,
  alert_email             text,
  
  -- Session management
  allow_multiple_sessions  boolean not null default true,
  max_sessions            integer not null default 5,
  session_timeout_minutes  integer not null default 60,
  
  -- Password
  password_changed_at      timestamptz,
  require_password_for_withdrawal boolean not null default true,
  
  -- Account recovery
  recovery_email           text,
  recovery_phone           text,
  security_question_1       text,
  security_answer_1         text,
  security_question_2       text,
  security_answer_2         text
);

create index if not exists user_security_settings_user_id_idx on public.user_security_settings (user_id);

alter table public.user_security_settings enable row level security;

drop policy if exists "user_manage_own_security_settings" on public.user_security_settings;
create policy "user_manage_own_security_settings"
  on public.user_security_settings for all
  using (auth.uid() = user_id);

drop policy if exists "admin_view_security_settings" on public.user_security_settings;
create policy "admin_view_security_settings"
  on public.user_security_settings for select
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 3. USER_SESSIONS (Active sessions tracking)
-- ──────────────────────────────────────────────────────────
create table if not exists public.user_sessions (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,
  created_at               timestamptz not null default now(),
  last_active_at           timestamptz not null default now(),
  expires_at               timestamptz not null,
  
  device_type              text check (device_type in ('mobile', 'desktop', 'tablet', 'unknown')) default 'unknown',
  device_name              text,
  browser                  text,
  operating_system          text,
  ip_address               text,
  location                 text,
  is_current_session       boolean not null default false,
  is_active                boolean not null default true
);

create index if not exists user_sessions_user_id_idx on public.user_sessions (user_id);
create index if not exists user_sessions_is_active_idx on public.user_sessions (is_active);

alter table public.user_sessions enable row level security;

drop policy if exists "user_manage_own_sessions" on public.user_sessions;
create policy "user_manage_own_sessions"
  on public.user_sessions for all
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- 4. LOGIN_HISTORY
-- ──────────────────────────────────────────────────────────
create table if not exists public.login_history (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,
  created_at               timestamptz not null default now(),
  
  event_type               text not null check (event_type in ('login', 'logout', 'password_change', '2fa_enable', '2fa_disable', 'pin_set', 'pin_change', 'session_revoked')),
  device_type              text,
  device_name              text,
  ip_address               text,
  location                 text,
  user_agent               text,
  success                  boolean not null default true,
  metadata                 jsonb
);

create index if not exists login_history_user_id_idx on public.login_history (user_id);
create index if not exists login_history_created_at_idx on public.login_history (created_at desc);

alter table public.login_history enable row level security;

drop policy if exists "user_view_own_login_history" on public.login_history;
create policy "user_view_own_login_history"
  on public.login_history for select
  using (auth.uid() = user_id);

drop policy if exists "user_insert_own_login_history" on public.login_history;
create policy "user_insert_own_login_history"
  on public.login_history for insert
  with check (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- 5. BLOCKED_USERS
-- ──────────────────────────────────────────────────────────
create table if not exists public.blocked_users (
  id                       uuid primary key default gen_random_uuid(),
  user_id                  uuid not null references public.profiles (id) on delete cascade,
  blocked_user_id          uuid not null references public.profiles (id) on delete cascade,
  created_at               timestamptz not null default now(),
  reason                   text,
  
  unique(user_id, blocked_user_id)
);

create index if not exists blocked_users_user_id_idx on public.blocked_users (user_id);
create index if not exists blocked_users_blocked_user_id_idx on public.blocked_users (blocked_user_id);

alter table public.blocked_users enable row level security;

drop policy if exists "user_manage_own_blocks" on public.blocked_users;
create policy "user_manage_own_blocks"
  on public.blocked_users for all
  using (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────
-- 6. DATABASE FUNCTIONS
-- ──────────────────────────────────────────────────────────

-- fn_get_privacy_settings
create or replace function public.fn_get_privacy_settings(p_user_id uuid)
returns setof public.user_privacy_settings
language plpgsql
security definer
as $$
begin
  return query
  select * from public.user_privacy_settings
  where user_id = p_user_id;
end;
$$;

-- fn_update_privacy_settings
create or replace function public.fn_update_privacy_settings(
  p_user_id uuid,
  p_profile_visibility text default null,
  p_show_bet_statistics boolean default null,
  p_show_win_rate boolean default null,
  p_show_profit_loss boolean default null,
  p_show_ranking boolean default null,
  p_show_bet_history boolean default null,
  p_show_followed_influencers boolean default null,
  p_show_last_active boolean default null,
  p_show_location boolean default null,
  p_allow_dm_from_followers boolean default null,
  p_allow_dm_from_anyone boolean default null,
  p_show_online_status boolean default null,
  p_show_in_search_results boolean default null,
  p_allow_data_export boolean default null,
  p_show_predictions_feed boolean default null,
  p_show_comments boolean default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.user_privacy_settings (
    user_id, profile_visibility, show_bet_statistics, show_win_rate,
    show_profit_loss, show_ranking, show_bet_history, show_followed_influencers,
    show_last_active, show_location, allow_dm_from_followers, allow_dm_from_anyone,
    show_online_status, show_in_search_results, allow_data_export,
    show_predictions_feed, show_comments
  ) values (
    p_user_id, coalesce(p_profile_visibility, 'public'),
    coalesce(p_show_bet_statistics, true), coalesce(p_show_win_rate, true),
    coalesce(p_show_profit_loss, true), coalesce(p_show_ranking, true),
    coalesce(p_show_bet_history, true), coalesce(p_show_followed_influencers, true),
    coalesce(p_show_last_active, true), coalesce(p_show_location, false),
    coalesce(p_allow_dm_from_followers, true), coalesce(p_allow_dm_from_anyone, false),
    coalesce(p_show_online_status, false), coalesce(p_show_in_search_results, true),
    coalesce(p_allow_data_export, true), coalesce(p_show_predictions_feed, true),
    coalesce(p_show_comments, true)
  )
  on conflict (user_id) do update set
    profile_visibility = coalesce(p_profile_visibility, user_privacy_settings.profile_visibility),
    show_bet_statistics = coalesce(p_show_bet_statistics, user_privacy_settings.show_bet_statistics),
    show_win_rate = coalesce(p_show_win_rate, user_privacy_settings.show_win_rate),
    show_profit_loss = coalesce(p_show_profit_loss, user_privacy_settings.show_profit_loss),
    show_ranking = coalesce(p_show_ranking, user_privacy_settings.show_ranking),
    show_bet_history = coalesce(p_show_bet_history, user_privacy_settings.show_bet_history),
    show_followed_influencers = coalesce(p_show_followed_influencers, user_privacy_settings.show_followed_influencers),
    show_last_active = coalesce(p_show_last_active, user_privacy_settings.show_last_active),
    show_location = coalesce(p_show_location, user_privacy_settings.show_location),
    allow_dm_from_followers = coalesce(p_allow_dm_from_followers, user_privacy_settings.allow_dm_from_followers),
    allow_dm_from_anyone = coalesce(p_allow_dm_from_anyone, user_privacy_settings.allow_dm_from_anyone),
    show_online_status = coalesce(p_show_online_status, user_privacy_settings.show_online_status),
    show_in_search_results = coalesce(p_show_in_search_results, user_privacy_settings.show_in_search_results),
    allow_data_export = coalesce(p_allow_data_export, user_privacy_settings.allow_data_export),
    show_predictions_feed = coalesce(p_show_predictions_feed, user_privacy_settings.show_predictions_feed),
    show_comments = coalesce(p_show_comments, user_privacy_settings.show_comments),
    updated_at = now();
end;
$$;

-- fn_get_security_settings
create or replace function public.fn_get_security_settings(p_user_id uuid)
returns setof public.user_security_settings
language plpgsql
security definer
as $$
begin
  return query
  select * from public.user_security_settings
  where user_id = p_user_id;
end;
$$;

-- fn_update_security_settings
create or replace function public.fn_update_security_settings(
  p_user_id uuid,
  p_two_factor_enabled boolean default null,
  p_two_factor_method text default null,
  p_pin_enabled boolean default null,
  p_pin_required_for_withdrawal boolean default null,
  p_pin_required_for_transfer boolean default null,
  p_alert_on_new_login boolean default null,
  p_alert_on_password_change boolean default null,
  p_alert_on_2fa_change boolean default null,
  p_allow_multiple_sessions boolean default null,
  p_max_sessions integer default null,
  p_session_timeout_minutes integer default null,
  p_require_password_for_withdrawal boolean default null
)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.user_security_settings (
    user_id, two_factor_enabled, two_factor_method,
    pin_enabled, pin_required_for_withdrawal, pin_required_for_transfer,
    alert_on_new_login, alert_on_password_change, alert_on_2fa_change,
    allow_multiple_sessions, max_sessions, session_timeout_minutes,
    require_password_for_withdrawal
  ) values (
    p_user_id, coalesce(p_two_factor_enabled, false), p_two_factor_method,
    coalesce(p_pin_enabled, false), coalesce(p_pin_required_for_withdrawal, true),
    coalesce(p_pin_required_for_transfer, true),
    coalesce(p_alert_on_new_login, true), coalesce(p_alert_on_password_change, true),
    coalesce(p_alert_on_2fa_change, true),
    coalesce(p_allow_multiple_sessions, true), coalesce(p_max_sessions, 5),
    coalesce(p_session_timeout_minutes, 60),
    coalesce(p_require_password_for_withdrawal, true)
  )
  on conflict (user_id) do update set
    two_factor_enabled = coalesce(p_two_factor_enabled, user_security_settings.two_factor_enabled),
    two_factor_method = coalesce(p_two_factor_method, user_security_settings.two_factor_method),
    pin_enabled = coalesce(p_pin_enabled, user_security_settings.pin_enabled),
    pin_required_for_withdrawal = coalesce(p_pin_required_for_withdrawal, user_security_settings.pin_required_for_withdrawal),
    pin_required_for_transfer = coalesce(p_pin_required_for_transfer, user_security_settings.pin_required_for_transfer),
    alert_on_new_login = coalesce(p_alert_on_new_login, user_security_settings.alert_on_new_login),
    alert_on_password_change = coalesce(p_alert_on_password_change, user_security_settings.alert_on_password_change),
    alert_on_2fa_change = coalesce(p_alert_on_2fa_change, user_security_settings.alert_on_2fa_change),
    allow_multiple_sessions = coalesce(p_allow_multiple_sessions, user_security_settings.allow_multiple_sessions),
    max_sessions = coalesce(p_max_sessions, user_security_settings.max_sessions),
    session_timeout_minutes = coalesce(p_session_timeout_minutes, user_security_settings.session_timeout_minutes),
    require_password_for_withdrawal = coalesce(p_require_password_for_withdrawal, user_security_settings.require_password_for_withdrawal),
    updated_at = now();
end;
$$;

-- fn_get_user_sessions
create or replace function public.fn_get_user_sessions(p_user_id uuid)
returns setof public.user_sessions
language plpgsql
security definer
as $$
begin
  return query
  select * from public.user_sessions
  where user_id = p_user_id and is_active = true
  order by last_active_at desc;
end;
$$;

-- fn_terminate_session
create or replace function public.fn_terminate_session(p_session_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_sessions
  set is_active = false
  where id = p_session_id and user_id = p_user_id;
end;
$$;

-- fn_terminate_all_sessions
create or replace function public.fn_terminate_all_sessions(p_user_id uuid, p_keep_current boolean default true)
returns void
language plpgsql
security definer
as $$
begin
  if p_keep_current then
    update public.user_sessions
    set is_active = false
    where user_id = p_user_id and is_active = true and is_current_session = false;
  else
    update public.user_sessions
    set is_active = false
    where user_id = p_user_id and is_active = true;
  end if;
end;
$$;

-- fn_get_login_history
create or replace function public.fn_get_login_history(
  p_user_id uuid,
  p_limit integer default 20
)
returns setof public.login_history
language plpgsql
security definer
as $$
begin
  return query
  select * from public.login_history
  where user_id = p_user_id
  order by created_at desc
  limit p_limit;
end;
$$;

-- fn_block_user
create or replace function public.fn_block_user(p_user_id uuid, p_blocked_user_id uuid, p_reason text default null)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.blocked_users (user_id, blocked_user_id, reason)
  values (p_user_id, p_blocked_user_id, p_reason)
  on conflict (user_id, blocked_user_id) do nothing;
end;
$$;

-- fn_unblock_user
create or replace function public.fn_unblock_user(p_user_id uuid, p_blocked_user_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.blocked_users
  where user_id = p_user_id and blocked_user_id = p_blocked_user_id;
end;
$$;

-- fn_get_blocked_users
create or replace function public.fn_get_blocked_users(p_user_id uuid)
returns table (
  id              uuid,
  blocked_user_id uuid,
  user_name       text,
  user_email      text,
  user_avatar     text,
  created_at      timestamptz,
  reason          text
)
language plpgsql
security definer
as $$
begin
  return query
  select
    bu.id,
    bu.blocked_user_id,
    p.name,
    p.email,
    p.avatar_initials,
    bu.created_at,
    bu.reason
  from public.blocked_users bu
  join public.profiles p on p.id = bu.blocked_user_id
  where bu.user_id = p_user_id
  order by bu.created_at desc;
end;
$$;
