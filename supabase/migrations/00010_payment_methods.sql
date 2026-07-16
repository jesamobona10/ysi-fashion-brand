-- YSI E-commerce: Payment Methods for Store Settings
-- Adds payment_methods column to store_settings for persisting enabled payment methods.

alter table public.store_settings add column if not exists payment_methods jsonb not null default '["cash-on-delivery"]'::jsonb;
