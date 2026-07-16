-- 00011: Remove admin users from customers table + harden handle_new_user trigger

-- 1. Remove any admin users that were accidentally inserted into customers
delete from public.customers
where id in (select auth_user_id from public.admin_users where auth_user_id is not null);

delete from public.customers
where email in (select email from public.admin_users)
  and id not in (select auth_user_id from public.admin_users where auth_user_id is not null);

-- 2. Harden handle_new_user() to also check by auth_user_id (not just email)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.admin_users
    where email = new.email
       or auth_user_id = new.id
  ) then
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
