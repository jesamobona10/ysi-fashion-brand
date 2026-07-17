-- YSI E-commerce: Module 2 — Enhanced Checkout & Orders
-- Adds billing address, delivery methods, gift notes, cancel/track support

-- Delivery methods lookup table
create table if not exists public.delivery_methods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  price numeric(12,2) not null default 0,
  estimated_days text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.delivery_methods enable row level security;

drop policy if exists "Anyone can read active delivery methods" on public.delivery_methods;
create policy "Anyone can read active delivery methods"
  on public.delivery_methods for select
  using (is_active = true);

-- Insert default delivery methods
insert into public.delivery_methods (name, slug, description, price, estimated_days, sort_order) values
  ('Standard Delivery', 'standard', '5–7 business days', 0, '5–7 days', 1),
  ('Express Delivery', 'express', '2–3 business days', 5000, '2–3 days', 2),
  ('Next Day Delivery', 'next-day', 'Order before 2PM for next-day delivery', 12000, '1 day', 3),
  ('Click & Collect', 'click-collect', 'Free pickup at our Lagos showroom', 0, 'Ready in 24h', 4)
on conflict (slug) do nothing;

-- Add billing address, delivery method, gift note to orders
alter table public.orders add column if not exists billing_address jsonb;
alter table public.orders add column if not exists delivery_method text;
alter table public.orders add column if not exists delivery_fee numeric(12,2) default 0;
alter table public.orders add column if not exists gift_note text;
alter table public.orders add column if not exists cancelled_at timestamptz;
alter table public.orders add column if not exists cancelled_reason text;

-- Update order status check constraint to include 'returned' and 'refunded'
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pending', 'confirmed', 'processing', 'tailoring', 'quality-check', 'shipped', 'delivered', 'cancelled', 'returned', 'refunded'));

-- Allow customer to cancel their own order
drop policy if exists "Customers can cancel own pending orders" on public.orders;
create policy "Customers can cancel own pending orders"
  on public.orders for update
  using (
    customer_id in (select id from public.customers where auth_user_id = auth.uid())
    and status = 'pending'
  )
  with check (
    status = 'cancelled'
    and customer_id in (select id from public.customers where auth_user_id = auth.uid())
  );

-- Reviews table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  rating int not null check (rating >= 1 and rating <= 5),
  title text,
  body text,
  images jsonb default '[]'::jsonb,
  is_verified_purchase boolean default false,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  helpful_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_reviews_product on public.reviews(product_id);
create index if not exists idx_reviews_status on public.reviews(status);

alter table public.reviews enable row level security;

-- Anyone can read approved reviews
drop policy if exists "Anyone can read approved reviews" on public.reviews;
create policy "Anyone can read approved reviews"
  on public.reviews for select
  using (status = 'approved');

-- Customers can create their own reviews
drop policy if exists "Customers can create reviews" on public.reviews;
create policy "Customers can create reviews"
  on public.reviews for insert
  with check (auth_user_id = auth.uid());

-- Notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('order_update', 'low_stock', 'inventory_alert', 'review_moderation', 'marketing')),
  title text not null,
  body text,
  data jsonb,
  is_read boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_notifications_user on public.notifications(user_id, is_read);

alter table public.notifications enable row level security;

drop policy if exists "Users can manage own notifications" on public.notifications;
create policy "Users can manage own notifications"
  on public.notifications for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Search history table
create table if not exists public.search_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  query text not null,
  results_count int default 0,
  created_at timestamptz default now()
);

create index if not exists idx_search_history_user on public.search_history(user_id);
create index if not exists idx_search_history_query on public.search_history(query);

alter table public.search_history enable row level security;

drop policy if exists "Users can manage own search history" on public.search_history;
create policy "Users can manage own search history"
  on public.search_history for all
  using (user_id = auth.uid() or user_id is null)
  with check (user_id = auth.uid());

-- Popular searches materialized view
create or replace view public.popular_searches as
select
  query,
  count(*) as search_count,
  max(created_at) as last_searched
from public.search_history
where created_at > now() - interval '30 days'
group by query
order by count(*) desc;

-- Abandoned carts view (for admin reports)
create or replace view public.abandoned_carts as
select
  c.user_id,
  u.email,
  c.items,
  c.updated_at as last_active,
  (now() - c.updated_at) as hours_abandoned
from public.carts c
left join auth.users u on u.id = c.user_id
where c.updated_at < now() - interval '2 hours'
  and c.items != '[]'::jsonb;

-- Low stock products view
create or replace view public.low_stock_products as
select
  id, name, sku, stock_qty, low_stock_threshold,
  (stock_qty <= low_stock_threshold) as is_low_stock
from public.products
where stock_qty <= low_stock_threshold
order by stock_qty asc;

-- Updated place_order function with delivery method and gift note
create or replace function public.place_order(
  p_order_number text,
  p_customer_id uuid,
  p_subtotal numeric(12,2),
  p_shipping numeric(12,2),
  p_total numeric(12,2),
  p_payment_method text,
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_delivery_method text,
  p_delivery_fee numeric(12,2),
  p_gift_note text,
  p_notes text,
  p_items jsonb,
  p_now timestamptz
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item jsonb;
begin
  insert into public.orders (
    order_number, customer_id, status, subtotal, shipping, total,
    payment_method, payment_status, shipping_address, billing_address,
    delivery_method, delivery_fee, gift_note, notes,
    created_at, updated_at
  ) values (
    p_order_number, p_customer_id, 'pending', p_subtotal, p_shipping, p_total,
    p_payment_method, 'pending', p_shipping_address, p_billing_address,
    p_delivery_method, p_delivery_fee, nullif(trim(p_gift_note), ''), p_notes,
    p_now, p_now
  )
  returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into public.order_items (
      order_id, product_id, name, quantity, price, size, color
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_item->>'name',
      (v_item->>'quantity')::int,
      (v_item->>'price')::numeric,
      nullif(v_item->>'size', ''),
      nullif(v_item->>'color', '')
    );
  end loop;

  insert into public.order_timeline (order_id, status, note, created_at)
  values (v_order_id, 'pending', 'Order created', p_now);

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', p_order_number
  );
exception when others then
  return jsonb_build_object('error', SQLERRM);
end;
$$;

revoke execute on function public.place_order from anon;
revoke execute on function public.place_order from authenticated;
grant execute on function public.place_order to service_role;
