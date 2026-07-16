-- YSI E-commerce: Rate Limiting Table
-- Provides DB-backed rate limiting that persists across server restarts.

create table if not exists public.rate_limits (
  id uuid primary key default gen_random_uuid(),
  key text not null,
  count integer not null default 1,
  window_start timestamptz not null default now(),
  created_at timestamptz default now()
);

create index if not exists idx_rate_limits_key_window on public.rate_limits(key, window_start desc);
create unique index if not exists idx_rate_limits_key_unique on public.rate_limits(key, window_start);

alter table public.rate_limits enable row level security;

-- Only service_role can access
create policy "Rate limits are service-only"
  on public.rate_limits for all
  using (false)
  with check (false);
