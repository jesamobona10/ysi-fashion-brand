-- YSI E-commerce: Storage Bucket + Customer Self-Read RLS
-- Run this in the Supabase SQL Editor.
-- Creates the product-images bucket and adds customer self-read policy.

-- 1. Create product-images storage bucket (idempotent)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- 2. Allow customers to read their own record (needed for auth crossover fix)
drop policy if exists "Customers can read own record" on public.customers;
create policy "Customers can read own record"
  on public.customers for select
  using (id = auth.uid());
