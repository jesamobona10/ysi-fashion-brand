-- YSI E-commerce: Module 2 — Helper Functions

-- Restore stock when an order is cancelled
create or replace function public.restore_stock(p_product_id uuid, p_quantity int)
returns void
language plpgsql
security definer
as $$
declare
  v_current int;
begin
  select stock_qty into v_current from public.products where id = p_product_id;
  if v_current is not null then
    update public.products set stock_qty = v_current + p_quantity where id = p_product_id;
  end if;
end;
$$;

revoke execute on function public.restore_stock from anon;
revoke execute on function public.restore_stock from authenticated;
grant execute on function public.restore_stock to service_role;

-- Monthly revenue report
create or replace function public.get_monthly_revenue()
returns table(month text, revenue numeric)
language plpgsql
security definer
as $$
begin
  return query
  select
    to_char(created_at, 'YYYY-MM') as month,
    sum(total)::numeric as revenue
  from public.orders
  where payment_status = 'paid'
    and created_at > now() - interval '12 months'
  group by to_char(created_at, 'YYYY-MM')
  order by month desc;
end;
$$;

revoke execute on function public.get_monthly_revenue from anon;
revoke execute on function public.get_monthly_revenue from authenticated;
grant execute on function public.get_monthly_revenue to service_role;

-- Low stock notification trigger
create or replace function public.notify_low_stock()
returns trigger
language plpgsql
security definer
as $$
begin
  if new.stock_qty <= new.low_stock_threshold and (old.stock_qty is null or old.stock_qty > new.low_stock_threshold) then
    insert into public.notifications (user_id, type, title, body, data)
    select
      a.auth_user_id,
      'low_stock',
      'Low Stock Alert',
      format('Product "%s" (SKU: %s) has only %s units remaining.', new.name, coalesce(new.sku, 'N/A'), new.stock_qty),
      jsonb_build_object('product_id', new.id, 'product_name', new.name, 'stock_qty', new.stock_qty)
    from public.admin_users a;
  end if;
  return new;
end;
$$;

drop trigger if exists trigger_notify_low_stock on public.products;
create trigger trigger_notify_low_stock
  after update of stock_qty on public.products
  for each row
  execute function public.notify_low_stock();
