-- YSI E-commerce: Module 3 — CMS, Security, Webhooks

-- ============================================================
-- HOMEPAGE SECTIONS
-- ============================================================
create table if not exists public.homepage_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text,
  subtitle text,
  description text,
  image_url text,
  link_url text,
  link_label text,
  sort_order int default 0,
  is_active boolean default true,
  settings jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.homepage_sections enable row level security;

drop policy if exists "Anyone can read active homepage sections" on public.homepage_sections;
create policy "Anyone can read active homepage sections"
  on public.homepage_sections for select
  using (is_active = true);

drop policy if exists "Admins can manage homepage sections" on public.homepage_sections;
create policy "Admins can manage homepage sections"
  on public.homepage_sections for all
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- Seed default homepage sections
insert into public.homepage_sections (section_key, title, subtitle, description, sort_order) values
  ('hero', 'Elevate Your Style', 'Discover the art of fine tailoring', 'Explore our latest collection of handcrafted pieces designed for the discerning gentleman.', 1),
  ('featured', 'Featured Collection', 'Curated for you', 'Each piece is a statement of elegance and sophistication.', 2),
  ('values', 'Why YSI', null, null, 3),
  ('cta', 'Bespoke Tailoring', 'Get in touch', null, 4)
on conflict (section_key) do nothing;

-- ============================================================
-- BANNERS / PROMOTIONS
-- ============================================================
create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  link_url text,
  link_label text default 'Shop Now',
  banner_type text default 'promo' check (banner_type in ('hero', 'promo', 'announcement')),
  background_color text default '#1a1a1a',
  text_color text default '#f5f0eb',
  sort_order int default 0,
  is_active boolean default true,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.banners enable row level security;

drop policy if exists "Anyone can read active banners" on public.banners;
create policy "Anyone can read active banners"
  on public.banners for select
  using (is_active = true and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()));

drop policy if exists "Admins can manage banners" on public.banners;
create policy "Admins can manage banners"
  on public.banners for all
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- ============================================================
-- JOURNAL/BLOG ADMIN (articles already exist, but add admin fields)
-- ============================================================
-- Articles table already exists from initial schema; add author & status columns
do $$ begin
  alter table public.articles add column if not exists author_id uuid references public.admin_users(id);
  alter table public.articles add column if not exists status text default 'published' check (status in ('draft', 'published', 'archived'));
  alter table public.articles add column if not exists featured_image text;
  alter table public.articles add column if not exists meta_description text;
  alter table public.articles add column if not exists tags text[] default '{}';
exception when undefined_table then
  null;
end $$;

-- Ensure articles has RLS
alter table public.articles enable row level security;

drop policy if exists "Anyone can read published articles" on public.articles;
create policy "Anyone can read published articles"
  on public.articles for select
  using (status = 'published');

drop policy if exists "Admins can manage articles" on public.articles;
create policy "Admins can manage articles"
  on public.articles for all
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- ============================================================
-- ACCOUNT LOCKOUT TRACKING
-- ============================================================
create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  ip_address text,
  attempted_at timestamptz default now(),
  success boolean default false
);

create index if not exists idx_login_attempts_email on public.login_attempts(email, attempted_at);

-- ============================================================
-- WEBHOOKS
-- ============================================================
create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  events text[] not null default '{}',
  secret text,
  is_active boolean default true,
  last_triggered_at timestamptz,
  last_error text,
  created_at timestamptz default now()
);

alter table public.webhooks enable row level security;

drop policy if exists "Admins can manage webhooks" on public.webhooks;
create policy "Admins can manage webhooks"
  on public.webhooks for all
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create table if not exists public.webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid references public.webhooks(id) on delete cascade,
  event text not null,
  payload jsonb,
  response_status int,
  response_body text,
  success boolean default false,
  delivered_at timestamptz default now()
);

alter table public.webhook_deliveries enable row level security;

drop policy if exists "Admins can view webhook deliveries" on public.webhook_deliveries;
create policy "Admins can view webhook deliveries"
  on public.webhook_deliveries for select
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- Webhook trigger: on order status change
create or replace function public.trigger_order_webhooks()
returns trigger
language plpgsql
security definer
as $$
declare
  v_webhook record;
  v_payload jsonb;
begin
  v_payload = jsonb_build_object(
    'event', 'order.' || new.status,
    'order_id', new.id,
    'order_number', new.order_number,
    'status', new.status,
    'total', new.total,
    'updated_at', now()
  );

  for v_webhook in
    select * from public.webhooks
    where is_active = true
      and (new.status = any(events) or 'order.*' = any(events) or 'order.' || new.status = any(events))
  loop
    begin
      perform net.http_post(
        url := v_webhook.url,
        body := v_payload::text,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'X-Webhook-Secret', coalesce(v_webhook.secret, ''),
          'X-Event', 'order.' || new.status
        )
      );
      update public.webhooks set last_triggered_at = now() where id = v_webhook.id;
    exception when others then
      update public.webhooks set last_error = SQLERRM where id = v_webhook.id;
    end;
  end loop;

  return new;
end;
$$;

drop trigger if exists trigger_order_webhooks on public.orders;
create trigger trigger_order_webhooks
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status)
  execute function public.trigger_order_webhooks();

-- ============================================================
-- SESSION TIMEOUT CONFIG
-- ============================================================
-- Store session timeout preference in admin_users
do $$ begin
  alter table public.admin_users add column if not exists session_timeout_minutes int default 60;
exception when others then null;
end $$;

-- ============================================================
-- CSRF TOKENS
-- ============================================================
create table if not exists public.csrf_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  expires_at timestamptz not null default now() + interval '1 hour',
  created_at timestamptz default now()
);

create index if not exists idx_csrf_tokens_user on public.csrf_tokens(user_id);

alter table public.csrf_tokens enable row level security;

drop policy if exists "Users can manage own CSRF tokens" on public.csrf_tokens;
create policy "Users can manage own CSRF tokens"
  on public.csrf_tokens for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
