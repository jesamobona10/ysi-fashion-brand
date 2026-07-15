-- Create admin user in admin_users table
-- Run AFTER creating the auth user in Supabase Auth UI
-- Replace the values below with your actual auth user details

insert into public.admin_users (auth_user_id, name, email, role)
values ('55e97b2a-3c45-4583-8cf8-9bf432cc08b6', 'Admin', 'admin@ysi.ng', 'super-admin')
on conflict (auth_user_id) do nothing;
