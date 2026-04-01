-- ================================================================
-- Fan.bet Admin Schema — Migration 003
-- User Notifications Access Policies
-- ================================================================

-- Drop existing user policies before recreating
drop policy if exists "user_select_own_notifications" on public.user_notifications;
drop policy if exists "user_update_own_notifications" on public.user_notifications;
drop policy if exists "user_select_notifications" on public.notifications;

-- User can select their own notifications
create policy "user_select_own_notifications"
  on public.user_notifications for select
  using (auth.uid() = user_id);

-- User can update their own notifications (mark as read)
create policy "user_update_own_notifications"
  on public.user_notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- User can select sent notifications
create policy "user_select_notifications"
  on public.notifications for select
  using (status = 'sent');
