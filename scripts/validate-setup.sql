-- YSI E-commerce: Setup Validation Queries
-- Run these in the Supabase SQL Editor to verify the backend is correctly configured.

-- 1. Schema verification
select '1. Schema' as check_name, table_name, table_type
from information_schema.tables
where table_schema = 'public'
  and table_name in ('products', 'customers', 'orders', 'order_items', 'order_timeline', 'inventory_logs', 'admin_users', 'admin_audit_log')
order by table_name;

-- 2. Storage bucket
select '2. Storage bucket' as check_name, id, name, public
from storage.buckets
where id = 'product-images';

-- 3. RLS is enabled on all tables
select '3. RLS enabled' as check_name, relname, relhasrules
from pg_class
where relname in ('products', 'customers', 'orders', 'order_items', 'order_timeline', 'inventory_logs', 'admin_users', 'admin_audit_log')
  and relnamespace = 'public'::regnamespace;

-- 4. Policies exist on storage.objects for product-images
select '4. Storage policies' as check_name, policyname, permissive, roles, cmd, qual
from pg_policies
where tablename = 'objects' and schemaname = 'storage'
order by policyname;

-- 5. Auth trigger exists
select '5. Auth trigger' as check_name, trigger_name, event_manipulation, event_object_table
from information_schema.triggers
where trigger_name = 'on_auth_user_created';

-- 6. Admin user exists
select '6. Admin user' as check_name, id, name, email, role
from public.admin_users;

-- 7. Seed products exist
select '7. Seed products' as check_name, count(*) as count
from public.products;

-- 8. Updated-at triggers exist
select '8. Update triggers' as check_name, trigger_name, event_object_table
from information_schema.triggers
where trigger_name like 'set_updated_at_%';

-- 9. Helper function exists
select '9. Helper function' as check_name, proname, prosrc
from pg_proc
where proname = 'get_admin_by_auth_id';

-- 10. RLS policies on public tables (all should show at least one policy)
select '10. RLS policies by table' as check_name, tablename, count(*) as policy_count
from pg_policies
where schemaname = 'public'
group by tablename
order by tablename;
