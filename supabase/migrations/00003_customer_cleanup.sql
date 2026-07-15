-- YSI E-commerce: Customer Cleanup + Safeguards
-- Run after 00002_admin_audit_log.sql
-- WARNING: Review and adjust the DELETE filter before running in production.

-- 0. Add missing updated_at column if the table was created before the migration
alter table public.customers add column if not exists updated_at timestamptz default now();

-- 1. Delete records tied to customers being removed (orders, order_items, timeline)
--    so the foreign key doesn't block the customer deletion.
delete from public.order_timeline
where order_id in (
  select id from public.orders
  where customer_id in (
    select id from public.customers
    where email not in ('jesamobona10@gmail.com')
  )
);

delete from public.order_items
where order_id in (
  select id from public.orders
  where customer_id in (
    select id from public.customers
    where email not in ('jesamobona10@gmail.com')
  )
);

delete from public.orders
where customer_id in (
  select id from public.customers
  where email not in ('jesamobona10@gmail.com')
);

-- 2. Delete stale customer records (admin, test accounts).
--    Replace 'jesamobona10@gmail.com' with the real customer emails to keep.
delete from public.customers
where email not in ('jesamobona10@gmail.com');

-- 3. Add UNIQUE constraint on email to prevent future duplicates
alter table public.customers
add constraint customers_email_unique
unique (email);

-- 4. Update the handle_new_user() trigger to skip admin emails
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.admin_users where email = new.email) then
    insert into public.customers (id, name, email, status)
    values (
      new.id,
      coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
      new.email,
      'active'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;
