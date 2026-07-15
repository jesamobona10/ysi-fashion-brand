-- YSI E-commerce: Storage Bucket Setup
-- Run this in the Supabase SQL Editor.
-- Creates/updates the product-images bucket with public access.
-- Uses on conflict DO UPDATE so it also fixes an existing non-public bucket.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp'];
