-- ================================================================
-- Fan.bet Mock Data — Migration 002
-- Inserts realistic seed data for local development & demos.
-- ================================================================

-- ──────────────────────────────────────────────────────────
-- PROFILES
-- ──────────────────────────────────────────────────────────
insert into public.profiles (name, email, role, status, balance, bet_count, verified, avatar_initials) values
  ('Lucas Ferreira',    'lucas@email.com',   'fan',        'active',    240.00,   48,  true,  'LF'),
  ('Ana Souza',         'ana@email.com',     'influencer', 'active',    12400.00, 0,   true,  'AS'),
  ('João Pedro',        'joao@email.com',    'fan',        'suspended', 0.00,     120, false, 'JP'),
  ('Mariana Castro',    'mari@email.com',    'fan',        'active',    850.00,   23,  true,  'MC'),
  ('Rafael Oliveira',   'rafael@email.com',  'influencer', 'pending',   3200.00,  0,   false, 'RO'),
  ('Fernanda Lima',     'fern@email.com',    'fan',        'active',    95.00,    7,   true,  'FL'),
  ('Bruno Teixeira',    'bruno@email.com',   'fan',        'banned',    0.00,     312, false, 'BT'),
  ('Carla Mendes',      'carla@email.com',   'fan',        'active',    430.00,   61,  true,  'CM'),
  ('FlaBR Admin',       'flabr@influencer.com','influencer','active',   18900.00, 0,   true,  'FB'),
  ('CruzeiroBR',        'cbr@influencer.com','influencer', 'active',    12400.00, 0,   true,  'CB'),
  ('PalmeirasTV',       'ptv@influencer.com','influencer', 'active',    9200.00,  0,   true,  'PT'),
  ('GremioFan',         'gf@influencer.com', 'influencer', 'active',    6800.00,  0,   false, 'GF'),
  ('SaoPauloFC Dicas',  'spfc@influencer.com','influencer','pending',   3100.00,  0,   false, 'SP'),
  ('AtleticoFan',       'atl@influencer.com','influencer', 'suspended', 1200.00,  0,   false, 'AF'),
  ('Rodrigo Costa',     'rodrigo@email.com', 'fan',        'active',    320.00,   18,  true,  'RC'),
  ('Patricia Alves',    'pat@email.com',     'fan',        'active',    1200.00,  55,  true,  'PA'),
  ('Diego Santos',      'diego@email.com',   'fan',        'active',    75.00,    3,   false, 'DS'),
  ('Camila Rocha',      'cami@email.com',    'fan',        'active',    640.00,   31,  true,  'CR')
on conflict (email) do nothing;

-- ──────────────────────────────────────────────────────────
-- INFLUENCER_PROFILES
-- ──────────────────────────────────────────────────────────
insert into public.influencer_profiles
  (profile_id, handle, followers, subscribers, accuracy_pct, hints_count, pending_hints, revenue_total, tier, bio)
select
  p.id, vals.handle, vals.followers, vals.subscribers, vals.accuracy_pct,
  vals.hints_count, vals.pending_hints, vals.revenue_total, vals.tier, vals.bio
from (values
  ('ana@email.com',     '@ana_tips',     95000,  2100,  62.0, 45,  1, 8200.00, 'bronze', 'Dicas de futebol desde 2021'),
  ('flabr@influencer.com','@flabr',     318000,  8400,  71.0, 142, 2, 18900.00,'gold',  'O maior canal de dicas do Flamengo'),
  ('cbr@influencer.com','@cruzeirobr', 245000,  5200,  68.0, 98,  0, 12400.00,'silver','Análises do Cruzeiro toda semana'),
  ('ptv@influencer.com','@palmtwitch', 198000,  4100,  65.0, 76,  1, 9200.00, 'silver','PalmeirasTV — estatísticas e palpites'),
  ('gf@influencer.com', '@gremiofan', 142000,  2800,  59.0, 54,  0, 6800.00, 'bronze','Gremio ao vivo e ao cubo'),
  ('spfc@influencer.com','@spfc_dicas', 87000,  0,     55.0, 31,  5, 3100.00, null,    'Novo canal São Paulo FC'),
  ('rafael@email.com',  '@rafatips',  24000,   0,      0.0,  0,   0, 0.00,    null,    'Usuário aguardando aprovação'),
  ('atl@influencer.com','@galofan',   64000,   890,   48.0, 22,  0, 1200.00, 'bronze','Atlético MG')
) as vals(email, handle, followers, subscribers, accuracy_pct, hints_count, pending_hints, revenue_total, tier, bio)
join public.profiles p on p.email = vals.email
on conflict (handle) do nothing;

-- ──────────────────────────────────────────────────────────
-- TRANSACTIONS
-- ──────────────────────────────────────────────────────────
insert into public.transactions
  (profile_id, profile_name, profile_avatar, type, method, amount, status, created_at)
select
  p.id, p.name, p.avatar_initials, vals.type, vals.method, vals.amount, vals.status,
  now() - (vals.mins_ago || ' minutes')::interval
from (values
  ('lucas@email.com',  'deposit',    'PIX',    250.00,   'success',    2),
  ('ana@email.com',    'withdrawal', 'PIX',    1200.00,  'pending',    8),
  ('joao@email.com',   'deposit',    'Cartão', 100.00,   'failed',     15),
  ('mari@email.com',   'deposit',    'PIX',    500.00,   'success',    22),
  ('rafael@email.com', 'withdrawal', 'TED',    3200.00,  'success',    38),
  ('fern@email.com',   'deposit',    'PIX',    75.00,    'success',    60),
  ('bruno@email.com',  'deposit',    'Cartão', 200.00,   'chargeback', 120),
  ('carla@email.com',  'withdrawal', 'PIX',    430.00,   'pending',    180),
  ('rodrigo@email.com','deposit',    'PIX',    320.00,   'success',    240),
  ('pat@email.com',    'deposit',    'PIX',    1200.00,  'success',    300),
  ('diego@email.com',  'deposit',    'Cartão', 75.00,    'failed',     360),
  ('cami@email.com',   'deposit',    'PIX',    640.00,   'success',    420),
  ('lucas@email.com',  'withdrawal', 'PIX',    150.00,   'success',    480),
  ('mari@email.com',   'withdrawal', 'TED',    350.00,   'success',    540),
  ('pat@email.com',    'deposit',    'PIX',    800.00,   'success',    600)
) as vals(email, type, method, amount, status, mins_ago)
join public.profiles p on p.email = vals.email;

-- ──────────────────────────────────────────────────────────
-- CONTENT_REPORTS
-- ──────────────────────────────────────────────────────────
insert into public.content_reports
  (author_name, author_avatar, content_type, content_text, report_count, status, created_at)
values
  ('FlaBR',        'FB', 'hint', 'Flamengo vai ganhar por 2x1 no jogo de amanhã — análise dos últimos 5 jogos e histórico do confronto.', 0, 'pending', now() - interval '5 minutes'),
  ('AnonUser92',   'AU', 'chat', 'esse influencer é golpista não acreditem nele', 3, 'pending', now() - interval '12 minutes'),
  ('PalmeirasTV',  'PT', 'hint', 'Palmeiras x São Paulo — meu palpite: empate no tempo normal. Odds excelentes no mercado de BTTS.', 0, 'pending', now() - interval '18 minutes'),
  ('CruzeiroFan',  'CF', 'image','[Imagem anexada] — print de resultado antecipado suspeito', 5, 'pending', now() - interval '25 minutes'),
  ('Marquinhos99', 'MQ', 'chat', 'quem quiser dicas pagas entra no meu telegram @marquinhos_tips', 8, 'pending', now() - interval '60 minutes'),
  ('SpamBot01',    'SB', 'chat', 'Ganhe dinheiro fácil clicando aqui...', 12, 'removed', now() - interval '2 hours'),
  ('CruzeiroBR',   'CB', 'hint', 'Análise do jogo: Cruzeiro vai empatar.', 0, 'approved', now() - interval '3 hours'),
  ('GremioTV',     'GT', 'image','[Imagem removida] conteúdo adulto', 15, 'removed', now() - interval '4 hours');

-- ──────────────────────────────────────────────────────────
-- PAGE_EVENTS (sample for flow analytics)
-- ──────────────────────────────────────────────────────────
insert into public.page_events (page, device, session_duration_s, country, created_at)
select
  vals.page, vals.device, vals.duration, vals.country,
  now() - (random() * interval '7 days')
from (
  select
    unnest(array['feed','rankings','wallet','profile','influencer','influencer/post-hint']) as page,
    unnest(array['mobile','mobile','mobile','desktop','desktop','tablet']) as device,
    (random() * 600 + 30)::int as duration,
    (array['Brasil','Brasil','Brasil','Brasil','Portugal','Argentina'])[floor(random()*6+1)::int] as country
  from generate_series(1, 200)
) as vals;
