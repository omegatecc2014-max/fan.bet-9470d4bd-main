-- Migration to add CPF and Full Name to profiles for Mercado Pago PIX payments
alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists full_name text;

-- Update RLS policies to allow users to update their own CPF and Full Name
drop policy if exists "users_update_own_profile_fields" on public.profiles;
create policy "users_update_own_profile_fields" 
  on public.profiles for update 
  using (auth.uid() = id)
  with check (auth.uid() = id);
