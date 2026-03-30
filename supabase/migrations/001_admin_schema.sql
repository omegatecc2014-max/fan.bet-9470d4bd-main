-- ================================================================
-- Fan.bet Admin Schema — Migration 001
-- Run this in your Supabase SQL Editor to create all tables.
-- ================================================================

-- ──────────────────────────────────────────────────────────
-- 1. PROFILES
-- ──────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  name             text not null,
  email            text not null unique,
  role             text not null check (role in ('fan', 'influencer', 'admin')) default 'fan',
  status           text not null check (status in ('active', 'suspended', 'banned', 'pending')) default 'active',
  balance          numeric(12, 2) not null default 0,
  bet_count        integer not null default 0,
  verified         boolean not null default false,
  avatar_initials  text not null default 'U'
);

create index if not exists profiles_role_idx    on public.profiles (role);
create index if not exists profiles_status_idx  on public.profiles (status);
create index if not exists profiles_email_idx   on public.profiles (email);

-- Row Level Security
alter table public.profiles enable row level security;

create policy "admin_select_profiles"
  on public.profiles for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_update_profiles"
  on public.profiles for update
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 2. INFLUENCER_PROFILES
-- ──────────────────────────────────────────────────────────
create table if not exists public.influencer_profiles (
  id               uuid primary key default gen_random_uuid(),
  profile_id       uuid not null references public.profiles (id) on delete cascade,
  created_at       timestamptz not null default now(),
  handle           text not null unique,
  followers        integer not null default 0,
  subscribers      integer not null default 0,
  accuracy_pct     numeric(5, 2) not null default 0,
  hints_count      integer not null default 0,
  pending_hints    integer not null default 0,
  revenue_total    numeric(12, 2) not null default 0,
  tier             text check (tier in ('gold', 'silver', 'bronze')),
  bio              text
);

create index if not exists influencer_profiles_profile_id_idx on public.influencer_profiles (profile_id);
create index if not exists influencer_profiles_tier_idx       on public.influencer_profiles (tier);

alter table public.influencer_profiles enable row level security;

create policy "admin_select_influencer_profiles"
  on public.influencer_profiles for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_update_influencer_profiles"
  on public.influencer_profiles for update
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 3. TRANSACTIONS
-- ──────────────────────────────────────────────────────────
create table if not exists public.transactions (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  profile_id       uuid not null references public.profiles (id) on delete cascade,
  profile_name     text not null,
  profile_avatar   text not null,
  type             text not null check (type in ('deposit', 'withdrawal')),
  method           text not null check (method in ('PIX', 'Cartão', 'TED')),
  amount           numeric(12, 2) not null,
  status           text not null check (status in ('success', 'pending', 'failed', 'chargeback')) default 'pending'
);

create index if not exists transactions_status_idx     on public.transactions (status);
create index if not exists transactions_profile_id_idx on public.transactions (profile_id);
create index if not exists transactions_created_at_idx on public.transactions (created_at desc);

alter table public.transactions enable row level security;

create policy "admin_select_transactions"
  on public.transactions for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_update_transactions"
  on public.transactions for update
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 4. CONTENT_REPORTS
-- ──────────────────────────────────────────────────────────
create table if not exists public.content_reports (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  author_name      text not null,
  author_avatar    text not null,
  content_type     text not null check (content_type in ('hint', 'chat', 'image')),
  content_text     text not null,
  report_count     integer not null default 0,
  status           text not null check (status in ('pending', 'approved', 'removed')) default 'pending',
  resolved_by      text,
  resolved_at      timestamptz
);

create index if not exists content_reports_status_idx     on public.content_reports (status);
create index if not exists content_reports_created_at_idx on public.content_reports (created_at desc);

alter table public.content_reports enable row level security;

create policy "admin_select_content_reports"
  on public.content_reports for select
  using (auth.jwt() ->> 'role' = 'admin');

create policy "admin_update_content_reports"
  on public.content_reports for update
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 5. PAGE_EVENTS
-- ──────────────────────────────────────────────────────────
create table if not exists public.page_events (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  page                text not null,
  device              text not null check (device in ('mobile', 'desktop', 'tablet')),
  session_duration_s  integer not null default 0,
  country             text not null default 'Brasil'
);

create index if not exists page_events_page_idx        on public.page_events (page);
create index if not exists page_events_created_at_idx  on public.page_events (created_at desc);

alter table public.page_events enable row level security;

create policy "admin_select_page_events"
  on public.page_events for select
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 6. ADMIN HELPER FUNCTIONS (Postgres RPC)
-- ──────────────────────────────────────────────────────────

-- fn_admin_stats: returns aggregate KPIs for the dashboard
create or replace function public.fn_admin_stats()
returns json
language sql
security definer
as $$
  select json_build_object(
    'total_users',        (select count(*) from public.profiles),
    'active_users',       (select count(*) from public.profiles where status = 'active'),
    'new_users_7d',       (select count(*) from public.profiles where created_at >= now() - interval '7 days'),
    'total_influencers',  (select count(*) from public.influencer_profiles),
    'pending_moderation', (select count(*) from public.content_reports where status = 'pending'),
    'revenue_7d',         (select coalesce(sum(amount), 0) from public.transactions where type = 'deposit' and status = 'success' and created_at >= now() - interval '7 days'),
    'chargebacks',        (select count(*) from public.transactions where status = 'chargeback')
  );
$$;
