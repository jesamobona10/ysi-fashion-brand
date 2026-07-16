-- YSI E-commerce: Cart Sync Tables + RLS
-- Enables cross-device cart persistence for logged-in users.

create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now(),
  constraint unique_user_cart unique (user_id)
);

create index if not exists idx_carts_user on public.carts(user_id);

alter table public.carts enable row level security;

-- Users can read/manage their own cart
drop policy if exists "Users can manage own cart" on public.carts;
create policy "Users can manage own cart"
  on public.carts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Updated-at trigger
drop trigger if exists set_updated_at_carts on public.carts;
create trigger set_updated_at_carts before update on public.carts
  for each row execute function public.update_updated_at();
