-- 00012: Module 1 — Categories, Wishlist, SKU, Status, Recently Viewed

-- 1. Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  parent_id uuid references public.categories(id) on delete set null,
  image_url text,
  description text,
  meta_title text,
  meta_description text,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_slug on public.categories(slug);

alter table public.categories enable row level security;

drop policy if exists "Categories are publicly readable" on public.categories;
create policy "Categories are publicly readable"
  on public.categories for select using (true);

drop policy if exists "Categories are admin insertable" on public.categories;
create policy "Categories are admin insertable"
  on public.categories for insert with check (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

drop policy if exists "Categories are admin updatable" on public.categories;
create policy "Categories are admin updatable"
  on public.categories for update using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

drop policy if exists "Categories are admin deletable" on public.categories;
create policy "Categories are admin deletable"
  on public.categories for delete using (
    exists (select 1 from public.admin_users where auth_user_id = auth.uid())
  );

drop trigger if exists set_updated_at_categories on public.categories;
create trigger set_updated_at_categories before update on public.categories
  for each row execute function public.update_updated_at();

-- 2. Add columns to products
do $$ begin
  alter table public.products add column if not exists sku text;
  alter table public.products add column if not exists status text default 'active' check (status in ('active', 'draft', 'archived'));
  alter table public.products add column if not exists category_id uuid references public.categories(id);
  alter table public.products add column if not exists view_count integer default 0;
  alter table public.products add column if not exists sales_count integer default 0;
exception when others then null;
end $$;

create index if not exists idx_products_sku on public.products(sku);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_category_id on public.products(category_id);

-- 3. Wishlist table
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_wishlists_user on public.wishlists(user_id);
create index if not exists idx_wishlists_product on public.wishlists(product_id);

alter table public.wishlists enable row level security;

drop policy if exists "Users can read own wishlist" on public.wishlists;
create policy "Users can read own wishlist"
  on public.wishlists for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own wishlist" on public.wishlists;
create policy "Users can insert own wishlist"
  on public.wishlists for insert with check (auth.uid() = user_id);

drop policy if exists "Users can delete own wishlist" on public.wishlists;
create policy "Users can delete own wishlist"
  on public.wishlists for delete using (auth.uid() = user_id);

-- 4. Recently viewed table
create table if not exists public.recently_viewed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  viewed_at timestamptz default now(),
  unique(user_id, product_id)
);

create index if not exists idx_recently_viewed_user on public.recently_viewed(user_id);
create index if not exists idx_recently_viewed_time on public.recently_viewed(viewed_at);

alter table public.recently_viewed enable row level security;

drop policy if exists "Users can read own recently viewed" on public.recently_viewed;
create policy "Users can read own recently viewed"
  on public.recently_viewed for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own recently viewed" on public.recently_viewed;
create policy "Users can insert own recently viewed"
  on public.recently_viewed for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own recently viewed" on public.recently_viewed;
create policy "Users can update own recently viewed"
  on public.recently_viewed for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own recently viewed" on public.recently_viewed;
create policy "Users can delete own recently viewed"
  on public.recently_viewed for delete using (auth.uid() = user_id);

-- 5. Avatar storage bucket policy (avatars bucket must be created manually: name='avatars', public=true)
drop policy if exists "Avatars are publicly readable" on storage.objects;
create policy "Avatars are publicly readable"
  on storage.objects for select using (bucket_id = 'avatars');

drop policy if exists "Avatars are user insertable" on storage.objects;
create policy "Avatars are user insertable"
  on storage.objects for insert with check (
    bucket_id = 'avatars'
    and (auth.uid() = (storage.foldername(name))[1]::uuid)
  );

drop policy if exists "Avatars are user updatable" on storage.objects;
create policy "Avatars are user updatable"
  on storage.objects for update using (
    bucket_id = 'avatars'
    and (auth.uid() = (storage.foldername(name))[1]::uuid)
  );

drop policy if exists "Avatars are user deletable" on storage.objects;
create policy "Avatars are user deletable"
  on storage.objects for delete using (
    bucket_id = 'avatars'
    and (auth.uid() = (storage.foldername(name))[1]::uuid)
  );

-- 6. Update handle_new_user to also handle OAuth (Google) users
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
  return new;
end;
$$;

-- 7. Seed default categories from existing product categories
insert into public.categories (name, slug, sort_order)
select distinct category, lower(regexp_replace(category, '[^a-zA-Z0-9]+', '-', 'g')), 0
from public.products
where category is not null
  and category not in (select name from public.categories)
on conflict (slug) do nothing;
