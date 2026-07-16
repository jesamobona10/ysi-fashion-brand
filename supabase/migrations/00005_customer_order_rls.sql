-- YSI E-commerce: Customer self-read RLS for orders
-- Run this in the Supabase SQL Editor.
-- Allows customers to read their own orders, items, and timeline.

-- 1. Customers can read their own orders
drop policy if exists "Customers can read own orders" on public.orders;
create policy "Customers can read own orders"
  on public.orders for select
  using (customer_id = auth.uid());

-- 2. Customers can read their own order items
drop policy if exists "Customers can read own order items" on public.order_items;
create policy "Customers can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = auth.uid()
    )
  );

-- 3. Customers can read their own order timeline
drop policy if exists "Customers can read own order timeline" on public.order_timeline;
create policy "Customers can read own order timeline"
  on public.order_timeline for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_timeline.order_id
        and orders.customer_id = auth.uid()
    )
  );
