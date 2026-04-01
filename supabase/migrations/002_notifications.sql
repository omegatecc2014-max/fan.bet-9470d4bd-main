-- ================================================================
-- Fan.bet Admin Schema — Migration 002
-- Notifications System
-- ================================================================

-- ──────────────────────────────────────────────────────────
-- 1. NOTIFICATIONS TABLE
-- ──────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  title            text not null,
  message          text not null,
  type             text not null check (type in ('info', 'warning', 'success', 'error', 'system')),
  target_type      text not null check (target_type in ('all', 'role', 'specific_users', 'influencers', 'fans')),
  target_value     text,
  sent_by          text not null default 'Admin',
  read_count       integer not null default 0,
  total_recipients integer not null default 0,
  status           text not null check (status in ('draft', 'sent', 'cancelled')) default 'draft'
);

create index if not exists notifications_status_idx      on public.notifications (status);
create index if not exists notifications_target_type_idx on public.notifications (target_type);
create index if not exists notifications_created_at_idx  on public.notifications (created_at desc);

alter table public.notifications enable row level security;

drop policy if exists "admin_select_notifications" on public.notifications;
create policy "admin_select_notifications"
  on public.notifications for select
  using (auth.jwt() ->> 'role' = 'admin');

drop policy if exists "admin_insert_notifications" on public.notifications;
create policy "admin_insert_notifications"
  on public.notifications for insert
  with check (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 2. USER_NOTIFICATIONS (Delivery tracking)
-- ──────────────────────────────────────────────────────────
create table if not exists public.user_notifications (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  notification_id   uuid not null references public.notifications (id) on delete cascade,
  user_id           uuid references public.profiles (id) on delete cascade,
  user_email        text not null,
  user_name         text not null,
  delivered         boolean not null default false,
  delivered_at      timestamptz,
  read              boolean not null default false,
  read_at           timestamptz
);

create index if not exists user_notifications_notification_id_idx on public.user_notifications (notification_id);
create index if not exists user_notifications_user_id_idx          on public.user_notifications (user_id);
create index if not exists user_notifications_read_idx              on public.user_notifications (read);
create index if not exists user_notifications_created_at_idx        on public.user_notifications (created_at desc);

alter table public.user_notifications enable row level security;

drop policy if exists "admin_select_user_notifications" on public.user_notifications;
create policy "admin_select_user_notifications"
  on public.user_notifications for select
  using (auth.jwt() ->> 'role' = 'admin');

drop policy if exists "admin_insert_user_notifications" on public.user_notifications;
create policy "admin_insert_user_notifications"
  on public.user_notifications for insert
  with check (auth.jwt() ->> 'role' = 'admin');

drop policy if exists "admin_update_user_notifications" on public.user_notifications;
create policy "admin_update_user_notifications"
  on public.user_notifications for update
  using (auth.jwt() ->> 'role' = 'admin');

-- ──────────────────────────────────────────────────────────
-- 3. DATABASE FUNCTIONS
-- ──────────────────────────────────────────────────────────

-- fn_list_notifications: list all notifications
create or replace function public.fn_list_notifications(
  p_status text default null,
  p_target_type text default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id                uuid,
  created_at       timestamptz,
  title             text,
  message           text,
  type              text,
  target_type       text,
  target_value      text,
  sent_by           text,
  read_count        integer,
  total_recipients  integer,
  status            text
)
language plpgsql
security definer
as $$
begin
  return query
  select
    n.id,
    n.created_at,
    n.title,
    n.message,
    n.type,
    n.target_type,
    n.target_value,
    n.sent_by,
    n.read_count,
    n.total_recipients,
    n.status
  from public.notifications n
  where (p_status is null or n.status = p_status)
    and (p_target_type is null or n.target_type = p_target_type)
  order by n.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;

-- fn_create_notification: create and optionally send notification
create or replace function public.fn_create_notification(
  p_title          text default null,
  p_message        text default null,
  p_type           text default 'info',
  p_target_type    text default 'all',
  p_target_value   text default null,
  p_sent_by        text default 'Admin',
  p_send_now       boolean default false
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_notification_id uuid;
  v_recipients integer := 0;
begin
  insert into public.notifications (
    title,
    message,
    type,
    target_type,
    target_value,
    sent_by,
    status,
    total_recipients
  ) values (
    p_title,
    p_message,
    p_type,
    p_target_type,
    p_target_value,
    p_sent_by,
    case when p_send_now then 'sent' else 'draft' end,
    case
      when p_target_type = 'all' then (select count(*) from public.profiles where status = 'active')
      when p_target_type = 'influencers' then (select count(*) from public.profiles where role = 'influencer' and status = 'active')
      when p_target_type = 'fans' then (select count(*) from public.profiles where role = 'fan' and status = 'active')
      else 0
    end
  )
  returning id into v_notification_id;

  if p_send_now then
    if p_target_type = 'specific_users' and p_target_value is not null then
      insert into public.user_notifications (notification_id, user_id, user_email, user_name, delivered, delivered_at)
      select
        v_notification_id,
        p.id,
        p.email,
        p.name,
        true,
        now()
      from public.profiles p
      where p.id = any(string_to_array(replace(p_target_value, ' ', ''), ',')::uuid[])
        and p.status = 'active';
    else
      insert into public.user_notifications (notification_id, user_id, user_email, user_name, delivered, delivered_at)
      select
        v_notification_id,
        p.id,
        p.email,
        p.name,
        true,
        now()
      from public.profiles p
      where p.status = 'active'
        and (
          p_target_type = 'all'
          or (p_target_type = 'role' and p.role = p_target_value)
          or (p_target_type = 'influencers' and p.role = 'influencer')
          or (p_target_type = 'fans' and p.role = 'fan')
        );
    end if;

    get diagnostics v_recipients = row_count;
    update public.notifications set read_count = 0, total_recipients = v_recipients where id = v_notification_id;
  end if;

  return v_notification_id;
end;
$$;

-- fn_send_notification: send a draft notification
create or replace function public.fn_send_notification(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_notif record;
  v_recipients integer;
begin
  select * into v_notif from public.notifications where id = p_notification_id;

  if not found or v_notif.status != 'draft' then
    raise exception 'Notification not found or already sent';
  end if;

  if v_notif.target_type = 'specific_users' and v_notif.target_value is not null then
    insert into public.user_notifications (notification_id, user_id, user_email, user_name, delivered, delivered_at)
    select
      p_notification_id,
      p.id,
      p.email,
      p.name,
      true,
      now()
    from public.profiles p
    where p.id = any(string_to_array(replace(v_notif.target_value, ' ', ''), ',')::uuid[])
      and p.status = 'active';
  else
    insert into public.user_notifications (notification_id, user_id, user_email, user_name, delivered, delivered_at)
    select
      p_notification_id,
      p.id,
      p.email,
      p.name,
      true,
      now()
    from public.profiles p
    where p.status = 'active'
      and (
        v_notif.target_type = 'all'
        or (v_notif.target_type = 'role' and p.role = v_notif.target_value)
        or (v_notif.target_type = 'influencers' and p.role = 'influencer')
        or (v_notif.target_type = 'fans' and p.role = 'fan')
      );
  end if;

  get diagnostics v_recipients = row_count;
  update public.notifications set status = 'sent', total_recipients = v_recipients where id = p_notification_id;
end;
$$;

-- fn_cancel_notification: cancel a draft notification
create or replace function public.fn_cancel_notification(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.notifications set status = 'cancelled' where id = p_notification_id and status = 'draft';
end;
$$;

-- fn_delete_notification: delete a notification
create or replace function public.fn_delete_notification(p_notification_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  delete from public.notifications where id = p_notification_id;
end;
$$;

-- fn_get_notification_delivery: get delivery status for a notification
create or replace function public.fn_get_notification_delivery(p_notification_id uuid)
returns table (
  id              uuid,
  user_email      text,
  user_name       text,
  delivered       boolean,
  delivered_at    timestamptz,
  read            boolean,
  read_at         timestamptz,
  created_at      timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    un.id,
    un.user_email,
    un.user_name,
    un.delivered,
    un.delivered_at,
    un.read,
    un.read_at,
    un.created_at
  from public.user_notifications un
  where un.notification_id = p_notification_id
  order by un.created_at desc;
end;
$$;

-- fn_get_notification_stats: get delivery statistics for a notification
create or replace function public.fn_get_notification_stats(p_notification_id uuid)
returns table (
  total_recipients   integer,
  delivered_count   bigint,
  read_count        bigint,
  delivery_rate     numeric(5,2),
  read_rate         numeric(5,2)
)
language plpgsql
security definer
as $$
begin
  return query
  select
    n.total_recipients,
    coalesce(count(un.id) filter (where un.delivered = true), 0)::integer as delivered_count,
    coalesce(count(un.id) filter (where un.read = true), 0)::bigint as read_count,
    case
      when n.total_recipients > 0
      then round((count(un.id) filter (where un.delivered = true)::numeric / n.total_recipients * 100), 2)
      else 0
    end as delivery_rate,
    case
      when n.total_recipients > 0
      then round((count(un.id) filter (where un.read = true)::numeric / n.total_recipients * 100), 2)
      else 0
    end as read_rate
  from public.notifications n
  left join public.user_notifications un on un.notification_id = n.id
  where n.id = p_notification_id
  group by n.id, n.total_recipients;
end;
$$;

-- fn_mark_notification_read: mark notification as read for a user (called from client app)
create or replace function public.fn_mark_notification_read(
  p_notification_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
as $$
begin
  update public.user_notifications
  set read = true, read_at = now()
  where notification_id = p_notification_id and user_id = p_user_id and read = false;

  update public.notifications n
  set read_count = (
    select count(*) from public.user_notifications
    where notification_id = p_notification_id and read = true
  )
  where n.id = p_notification_id;
end;
$$;

-- fn_get_user_notifications: get notifications for a specific user
create or replace function public.fn_get_user_notifications(
  p_user_id uuid,
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  id              uuid,
  title           text,
  message         text,
  type            text,
  created_at      timestamptz,
  delivered_at    timestamptz,
  read            boolean,
  read_at         timestamptz
)
language plpgsql
security definer
as $$
begin
  return query
  select
    un.notification_id,
    n.title,
    n.message,
    n.type,
    un.created_at,
    un.delivered_at,
    un.read,
    un.read_at
  from public.user_notifications un
  join public.notifications n on n.id = un.notification_id
  where un.user_id = p_user_id
  order by un.created_at desc
  limit p_limit
  offset p_offset;
end;
$$;
