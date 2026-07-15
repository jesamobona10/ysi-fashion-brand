-- YSI E-commerce: Admin Audit Log Table + RLS
-- Run this after 00001_initial_schema.sql

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  admin_email text not null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

create index if not exists idx_admin_audit_log_admin on public.admin_audit_log(admin_id);
create index if not exists idx_admin_audit_log_action on public.admin_audit_log(action);
create index if not exists idx_admin_audit_log_created on public.admin_audit_log(created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admin audit log readable by admins" on public.admin_audit_log;
create policy "Admin audit log readable by admins"
  on public.admin_audit_log for select
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

drop policy if exists "Admin audit log insertable by service" on public.admin_audit_log;
create policy "Admin audit log insertable by service"
  on public.admin_audit_log for insert
  with check (true);
