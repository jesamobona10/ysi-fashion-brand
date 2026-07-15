-- YSI E-commerce RLS and Schema Fixes
-- Run this in the Supabase SQL Editor (copy-paste the whole thing)

-- 1. Add shipping_address column if missing (exists in planned schema but not in actual DB)
alter table public.orders add column if not exists shipping_address jsonb;

-- 3. Make customer_id nullable for guest checkout
alter table public.orders alter column customer_id drop not null;

-- 4. Drop ALL existing policies before recreating
-- Products
drop policy if exists "Products are publicly readable" on public.products;
drop policy if exists "Products are admin writable" on public.products;
drop policy if exists "Products are admin insertable" on public.products;
drop policy if exists "Products are admin updatable" on public.products;
drop policy if exists "Products are admin deletable" on public.products;

-- Customers
drop policy if exists "Customers are admin readable" on public.customers;
drop policy if exists "Customers are admin writable" on public.customers;
drop policy if exists "Customers are admin insertable" on public.customers;
drop policy if exists "Customers are admin updatable" on public.customers;
drop policy if exists "Customers are admin deletable" on public.customers;

-- Orders
drop policy if exists "Orders are admin readable" on public.orders;
drop policy if exists "Orders are admin writable" on public.orders;
drop policy if exists "Orders are admin insertable" on public.orders;
drop policy if exists "Orders are admin updatable" on public.orders;
drop policy if exists "Orders are admin deletable" on public.orders;

-- Order items
drop policy if exists "Order items are admin readable" on public.order_items;
drop policy if exists "Order items are admin writable" on public.order_items;
drop policy if exists "Order items are admin insertable" on public.order_items;
drop policy if exists "Order items are admin updatable" on public.order_items;
drop policy if exists "Order items are admin deletable" on public.order_items;

-- Order timeline
drop policy if exists "Order timeline is admin readable" on public.order_timeline;
drop policy if exists "Order timeline is admin writable" on public.order_timeline;
drop policy if exists "Order timeline is admin insertable" on public.order_timeline;
drop policy if exists "Order timeline is admin updatable" on public.order_timeline;
drop policy if exists "Order timeline is admin deletable" on public.order_timeline;

-- Inventory logs
drop policy if exists "Inventory logs are admin readable" on public.inventory_logs;
drop policy if exists "Inventory logs are admin writable" on public.inventory_logs;
drop policy if exists "Inventory logs are admin insertable" on public.inventory_logs;
drop policy if exists "Inventory logs are admin updatable" on public.inventory_logs;
drop policy if exists "Inventory logs are admin deletable" on public.inventory_logs;

-- Admin users
drop policy if exists "Admin users can read own record" on public.admin_users;
drop policy if exists "Admin users are insertable by super-admin" on public.admin_users;
drop policy if exists "Admin users are updatable by super-admin" on public.admin_users;

-- Storage
drop policy if exists "Product images are publicly readable" on storage.objects;
drop policy if exists "Product images are admin insertable" on storage.objects;
drop policy if exists "Product images are admin updatable" on storage.objects;
drop policy if exists "Product images are admin deletable" on storage.objects;

-- 5. Recreate all policies

-- Products: public read, admin write
create policy "Products are publicly readable"
  on public.products for select using (true);

create policy "Products are admin insertable"
  on public.products for insert
  with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Products are admin updatable"
  on public.products for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create policy "Products are admin deletable"
  on public.products for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Customers: admin only
create policy "Customers are admin readable"
  on public.customers for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Customers are admin insertable"
  on public.customers for insert
  with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Customers are admin updatable"
  on public.customers for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create policy "Customers are admin deletable"
  on public.customers for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Orders: admin only
create policy "Orders are admin readable"
  on public.orders for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Orders are admin insertable"
  on public.orders for insert
  with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Orders are admin updatable"
  on public.orders for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create policy "Orders are admin deletable"
  on public.orders for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Order items: admin only
create policy "Order items are admin readable"
  on public.order_items for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Order items are admin insertable"
  on public.order_items for insert
  with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Order items are admin updatable"
  on public.order_items for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create policy "Order items are admin deletable"
  on public.order_items for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Order timeline: admin only
create policy "Order timeline is admin readable"
  on public.order_timeline for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Order timeline is admin insertable"
  on public.order_timeline for insert
  with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Order timeline is admin updatable"
  on public.order_timeline for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create policy "Order timeline is admin deletable"
  on public.order_timeline for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Inventory logs: admin only
create policy "Inventory logs are admin readable"
  on public.inventory_logs for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Inventory logs are admin insertable"
  on public.inventory_logs for insert
  with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Inventory logs are admin updatable"
  on public.inventory_logs for update
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

create policy "Inventory logs are admin deletable"
  on public.inventory_logs for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Admin users: self-read, super-admin manages
create policy "Admin users can read own record"
  on public.admin_users for select using (
    auth_user_id = auth.uid()
  );

create policy "Admin users are insertable by super-admin"
  on public.admin_users for insert with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid() and role = 'super-admin')
  );

create policy "Admin users are updatable by super-admin"
  on public.admin_users for update using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid() and role = 'super-admin')
  );

-- Storage: public read, admin write
create policy "Product images are publicly readable"
  on storage.objects for select using (bucket_id = 'product-images');

create policy "Product images are admin insertable"
  on storage.objects for insert with check (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Product images are admin updatable"
  on storage.objects for update using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

create policy "Product images are admin deletable"
  on storage.objects for delete using (
    bucket_id = 'product-images'
    and exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- HELPER: get admin by auth user id (bypasses RLS via SECURITY DEFINER)
create or replace function public.get_admin_by_auth_id(auth_id uuid)
returns setof public.admin_users
language sql
stable
security definer
as $$
  select * from public.admin_users where auth_user_id = auth_id;
$$;

-- 6. Auto-sync registered users to public.customers
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.customers (id, name, email, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.email,
    'active'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 7. Backfill existing auth users into public.customers
insert into public.customers (id, name, email, status)
select
  id,
  coalesce(raw_user_meta_data ->> 'name', split_part(email, '@', 1)),
  email,
  'active'
from auth.users
where id not in (select id from public.customers)
on conflict (id) do nothing;