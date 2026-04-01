-- ================================================================
-- Fan.bet Admin Schema — Migration 007
-- Trigger to sync auth.users with public.profiles
-- ================================================================

-- 1. Cria a função que automatiza a criação do perfil
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, role, status, verified, avatar_initials)
  values (
    new.id, 
    new.email, 
    split_part(new.email, '@', 1), -- Usa o começo do email como nome padrão
    'fan', 
    'active', 
    false, 
    upper(substring(split_part(new.email, '@', 1) from 1 for 2))
  )
  on conflict (email) do nothing;
  
  return new;
end;
$$ language plpgsql security definer;

-- 2. Conecta a função ao evento de criação de usuário do Supabase
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Conserto Retroativo: Cria perfis para usuários que você já tinha criado nos seus testes
insert into public.profiles (id, email, name, role, status, verified, avatar_initials)
select 
  id, 
  email, 
  split_part(email, '@', 1), 
  'fan', 
  'active', 
  false, 
  upper(substring(split_part(email, '@', 1) from 1 for 2))
from auth.users
where id not in (select id from public.profiles)
on conflict (email) do nothing;
