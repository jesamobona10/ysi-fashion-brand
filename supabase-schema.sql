-- YSI E-commerce Database Schema for Supabase
-- Run this in the Supabase SQL Editor

-- 1. PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  category text not null,
  subcategory text,
  price numeric(12,2) not null,
  original_price numeric(12,2),
  compare_at_price numeric(12,2),
  images text[] default '{}',
  fabric text,
  sizes text[] default '{}',
  colors text[] default '{}',
  tags text[] default '{}',
  featured boolean default false,
  in_stock boolean default true,
  stock_qty integer default 0,
  low_stock_threshold integer default 5,
  is_new boolean default false,
  is_bestseller boolean default false,
  season text,
  occasion text,
  style text,
  tailoring_notes text,
  delivery_estimate text,
  last_restocked timestamptz,
  rating numeric(3,1) default 0,
  review_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. CUSTOMERS
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text unique not null,
  phone text,
  avatar_url text,
  total_orders integer default 0,
  total_spent numeric(12,2) default 0,
  status text default 'active' check (status in ('active', 'inactive', 'vip')),
  notes text,
  address jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. ORDERS
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  customer_id uuid not null references public.customers(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'tailoring', 'quality-check', 'shipped', 'delivered', 'cancelled')),
  subtotal numeric(12,2) not null,
  shipping numeric(12,2) default 0,
  total numeric(12,2) not null,
  payment_method text check (payment_method in ('paystack', 'flutterwave', 'stripe', 'bank-transfer', 'cash-on-delivery')),
  payment_status text default 'pending' check (payment_status in ('paid', 'pending', 'refunded')),
  shipping_address jsonb,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. ORDER ITEMS
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name text not null,
  quantity integer not null,
  price numeric(12,2) not null,
  size text,
  color text,
  created_at timestamptz default now()
);

-- 5. ORDER TIMELINE
create table if not exists public.order_timeline (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz default now()
);

-- 6. INVENTORY LOGS
create table if not exists public.inventory_logs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  type text not null check (type in ('restock', 'adjustment', 'return', 'sale')),
  quantity integer not null,
  previous_stock integer not null,
  new_stock integer not null,
  note text,
  performed_by text,
  created_at timestamptz default now()
);

-- 7. ADMIN USERS
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null,
  name text not null,
  email text not null,
  avatar_url text,
  role text not null default 'admin' check (role in ('super-admin', 'admin', 'manager')),
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index if not exists idx_admin_users_auth_id on public.admin_users(auth_user_id);

-- INDEXES
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_featured on public.products(featured);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_timeline_order on public.order_timeline(order_id);
create index if not exists idx_inventory_logs_product on public.inventory_logs(product_id);
create index if not exists idx_customers_email on public.customers(email);

-- UPDATED_AT TRIGGERS
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at_products before update on public.products
  for each row execute function public.update_updated_at();
create trigger set_updated_at_orders before update on public.orders
  for each row execute function public.update_updated_at();
create trigger set_updated_at_customers before update on public.customers
  for each row execute function public.update_updated_at();
create trigger set_updated_at_admin_users before update on public.admin_users
  for each row execute function public.update_updated_at();

-- RLS POLICIES
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_timeline enable row level security;
alter table public.inventory_logs enable row level security;
alter table public.admin_users enable row level security;

-- Products: public can read, only admins can modify
create policy "Products are publicly readable"
  on public.products for select using (true);
create policy "Products are admin writable"
  on public.products for insert with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Products are admin updatable"
  on public.products for update using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Products are admin deletable"
  on public.products for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Customers: admin only
create policy "Customers are admin readable"
  on public.customers for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Customers are admin writable"
  on public.customers for all using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Orders: admin only
create policy "Orders are admin readable"
  on public.orders for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Orders are admin writable"
  on public.orders for all using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Order items: admin only
create policy "Order items are admin readable"
  on public.order_items for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Order items are admin writable"
  on public.order_items for all using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Order timeline: admin only
create policy "Order timeline is admin readable"
  on public.order_timeline for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Order timeline is admin writable"
  on public.order_timeline for all using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

-- Inventory logs: admin only
create policy "Inventory logs are admin readable"
  on public.inventory_logs for select using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );
create policy "Inventory logs are admin writable"
  on public.inventory_logs for all using (
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

-- HELPER: get admin by auth user id (bypasses RLS via SECURITY DEFINER)
create or replace function public.get_admin_by_auth_id(auth_id uuid)
returns setof public.admin_users
language sql
stable
security definer
as $$
  select * from public.admin_users where auth_user_id = auth_id;
$$;

-- STORAGE: product-images bucket RLS policies
-- Bucket was created via API: name='product-images', public=true
-- Run these in the Supabase SQL Editor after creating the bucket

create policy "Product images are publicly readable"
  on storage.objects for select using (
    bucket_id = 'product-images'
  );

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
