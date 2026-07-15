-- YSI E-commerce: Storage Bucket Setup
-- Run this in the Supabase SQL Editor.
-- Creates the product-images bucket for admin image uploads.
-- The corresponding RLS policies are already in migration 00001.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;
