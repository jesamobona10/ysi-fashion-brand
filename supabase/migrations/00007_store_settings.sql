-- YSI E-commerce: Store Settings table
-- Single-row table for global store configuration

create table if not exists public.store_settings (
  id bigint primary key default 1,
  name text not null default 'YSI (YUTY_STYLEDIT)',
  email text not null default 'hello@ysi.ng',
  phone text not null default '+234 800 YSI',
  address text not null default 'Lagos, Nigeria',
  free_shipping_threshold numeric(12,2) not null default 150000,
  flat_shipping_rate numeric(12,2) not null default 5000,
  updated_at timestamptz default now(),
  updated_by uuid references public.admin_users(id),
  constraint single_row check (id = 1)
);

alter table public.store_settings enable row level security;

-- Admin read
create policy "Store settings are admin readable"
  on public.store_settings for select
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- Admin update
create policy "Store settings are admin updatable"
  on public.store_settings for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- Admin insert (for super-admin bootstrap)
create policy "Store settings are admin insertable"
  on public.store_settings for insert
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- Seed default row
insert into public.store_settings (id, name, email, phone, address, free_shipping_threshold, flat_shipping_rate)
values (1, 'YSI (YUTY_STYLEDIT)', 'hello@ysi.ng', '+234 800 YSI', 'Lagos, Nigeria', 150000, 5000)
on conflict (id) do nothing;

-- Updated-at trigger
drop trigger if exists set_updated_at_store_settings on public.store_settings;
create trigger set_updated_at_store_settings before update on public.store_settings
  for each row execute function public.update_updated_at();
