-- YSI E-commerce: Granular Role-Based Permissions

-- Available permissions
create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  description text,
  group_name text not null,
  created_at timestamptz default now()
);

alter table public.permissions enable row level security;

drop policy if exists "Admins can read permissions" on public.permissions;
create policy "Admins can read permissions"
  on public.permissions for select
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

-- Role-permission mapping
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  permission_code text not null references public.permissions(code) on delete cascade,
  created_at timestamptz default now(),
  unique (role, permission_code)
);

alter table public.role_permissions enable row level security;

drop policy if exists "Admins can read role permissions" on public.role_permissions;
create policy "Admins can read role permissions"
  on public.role_permissions for select
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid()));

drop policy if exists "Super admins can manage role permissions" on public.role_permissions;
create policy "Super admins can manage role permissions"
  on public.role_permissions for all
  using (exists (select 1 from public.admin_users where auth_user_id = auth.uid() and role = 'super-admin'))
  with check (exists (select 1 from public.admin_users where auth_user_id = auth.uid() and role = 'super-admin'));

-- Seed permissions
insert into public.permissions (code, name, description, group_name) values
  ('dashboard.view', 'View Dashboard', 'Access the admin dashboard', 'Dashboard'),
  ('products.view', 'View Products', 'View product list', 'Products'),
  ('products.create', 'Create Products', 'Add new products', 'Products'),
  ('products.edit', 'Edit Products', 'Modify existing products', 'Products'),
  ('products.delete', 'Delete Products', 'Remove products', 'Products'),
  ('categories.view', 'View Categories', 'View category list', 'Categories'),
  ('categories.create', 'Create Categories', 'Add new categories', 'Categories'),
  ('categories.edit', 'Edit Categories', 'Modify categories', 'Categories'),
  ('categories.delete', 'Delete Categories', 'Remove categories', 'Categories'),
  ('orders.view', 'View Orders', 'View order list and details', 'Orders'),
  ('orders.edit', 'Edit Orders', 'Modify order status', 'Orders'),
  ('orders.cancel', 'Cancel Orders', 'Cancel customer orders', 'Orders'),
  ('customers.view', 'View Customers', 'View customer list', 'Customers'),
  ('customers.edit', 'Edit Customers', 'Modify customer data', 'Customers'),
  ('reviews.moderate', 'Moderate Reviews', 'Approve or reject reviews', 'Reviews'),
  ('reviews.view', 'View Reviews', 'Read customer reviews', 'Reviews'),
  ('inventory.view', 'View Inventory', 'View inventory levels', 'Inventory'),
  ('inventory.edit', 'Edit Inventory', 'Adjust stock levels', 'Inventory'),
  ('reports.view', 'View Reports', 'Access reports and analytics', 'Reports'),
  ('users.view', 'View Users', 'View admin user list', 'Users'),
  ('users.edit', 'Edit Users', 'Modify admin user roles', 'Users'),
  ('settings.view', 'View Settings', 'View store settings', 'Settings'),
  ('settings.edit', 'Edit Settings', 'Modify store settings', 'Settings')
on conflict (code) do nothing;

-- Seed role-permissions for each role
-- Super-admin: all permissions
insert into public.role_permissions (role, permission_code)
  select 'super-admin', code from public.permissions
on conflict do nothing;

-- Admin: most permissions except deleting products/users
insert into public.role_permissions (role, permission_code)
  select 'admin', code from public.permissions
  where code not in ('products.delete', 'categories.delete', 'users.edit', 'settings.edit')
on conflict do nothing;

-- Manager: view-only + inventory edit
insert into public.role_permissions (role, permission_code)
  select 'manager', code from public.permissions
  where code in (
    'dashboard.view',
    'products.view', 'products.edit',
    'categories.view',
    'orders.view', 'orders.edit',
    'customers.view',
    'reviews.view', 'reviews.moderate',
    'inventory.view', 'inventory.edit',
    'reports.view'
  )
on conflict do nothing;

-- Helper function: check if admin has a permission
create or replace function public.has_permission(p_permission_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  v_role text;
begin
  select role into v_role from public.admin_users where auth_user_id = auth.uid();
  if v_role = 'super-admin' then
    return true;
  end if;
  return exists (
    select 1 from public.role_permissions
    where role = v_role and permission_code = p_permission_code
  );
end;
$$;

revoke execute on function public.has_permission from anon;
revoke execute on function public.has_permission from authenticated;
grant execute on function public.has_permission to service_role;

-- Update admin_users role check to include all current roles
alter table public.admin_users drop constraint if exists admins_role_check;
alter table public.admin_users add constraint admins_role_check
  check (role in ('super-admin', 'admin', 'manager'));
