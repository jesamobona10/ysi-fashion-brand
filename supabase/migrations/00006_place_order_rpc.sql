-- YSI E-commerce: Place Order RPC (atomic transaction)
-- Run this in the Supabase SQL Editor.
-- Wraps the entire order creation in a single DB transaction.
-- If any step fails, everything rolls back.

create or replace function public.place_order(
  p_order_number text,
  p_customer_id uuid,
  p_subtotal numeric(12,2),
  p_shipping numeric(12,2),
  p_total numeric(12,2),
  p_payment_method text,
  p_shipping_address jsonb,
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
    payment_method, payment_status, shipping_address, notes,
    created_at, updated_at
  ) values (
    p_order_number, p_customer_id, 'pending', p_subtotal, p_shipping, p_total,
    p_payment_method, 'pending', p_shipping_address, p_notes,
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

-- Revoke execute from anon and authenticated, only service_role can call
revoke execute on function public.place_order from anon;
revoke execute on function public.place_order from authenticated;
grant execute on function public.place_order to service_role;
