-- 00018: Make handle_new_user resilient — catch exceptions so signup never fails
-- When the customer insert fails (e.g. schema mismatch, constraint), the auth
-- transaction should NOT be rolled back. The client-side register function will
-- create the customer record as a fallback.

-- 1. Allow users to insert/update their own customer record (needed for the
--    client-side upsert fallback when the trigger silently swallows the error)
drop policy if exists "Users can insert own customer record" on public.customers;
create policy "Users can insert own customer record"
  on public.customers for insert
  with check (auth.uid() = id);

drop policy if exists "Users can update own customer record" on public.customers;
create policy "Users can update own customer record"
  on public.customers for update
  using (auth.uid() = id);

drop policy if exists "Users can read own customer record" on public.customers;
create policy "Users can read own customer record"
  on public.customers for select
  using (auth.uid() = id);

-- 2. Resilient trigger — never let a customer insert roll back signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  begin
    if not exists (
      select 1
      from public.admin_users
      where email = new.email
         or auth_user_id = new.id
    ) then
      insert into public.customers (id, name, email, avatar_url, status)
      values (
        new.id,
        coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          split_part(new.email, '@', 1)
        ),
        new.email,
        coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
        'active'
      )
      on conflict (id) do update set
        name = coalesce(
          new.raw_user_meta_data ->> 'full_name',
          new.raw_user_meta_data ->> 'name',
          split_part(new.email, '@', 1)
        ),
        avatar_url = coalesce(
          new.raw_user_meta_data ->> 'avatar_url',
          new.raw_user_meta_data ->> 'picture',
          customers.avatar_url
        )
      where customers.name is null or customers.avatar_url is null;
    end if;
  exception when others then
    null;
  end;
  return new;
end;
$$;
