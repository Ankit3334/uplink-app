-- UPLINK Phase 1 schema
-- Requires pgcrypto for gen_random_uuid() (enabled by default in Supabase projects).

create extension if not exists "pgcrypto";

-- Profiles: mirrors authenticated users with public-facing identity fields.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  constraint profiles_username_length check (char_length(username) between 3 and 32)
);

-- Posts: image-based feed entries.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  boost_count integer not null default 0,
  thread_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Boosts: tracks who boosted what to prevent double-boosting.
create table if not exists public.boosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint boosts_unique_user_post unique (user_id, post_id)
);

-- Threads: comment-style replies on posts.
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint threads_content_not_empty check (char_length(trim(content)) > 0)
);

-- Helpful indexes for feed and relation lookups.
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists boosts_post_id_idx on public.boosts(post_id);
create index if not exists boosts_user_id_idx on public.boosts(user_id);
create index if not exists threads_post_id_idx on public.threads(post_id);
create index if not exists threads_user_id_idx on public.threads(user_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.boosts enable row level security;
alter table public.threads enable row level security;

-- Profiles policies
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Posts policies
create policy "posts_select_public"
  on public.posts for select
  using (true);

create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Boosts policies
create policy "boosts_select_public"
  on public.boosts for select
  using (true);

create policy "boosts_insert_own"
  on public.boosts for insert
  with check (auth.uid() = user_id);

create policy "boosts_delete_own"
  on public.boosts for delete
  using (auth.uid() = user_id);

-- Threads policies
create policy "threads_select_public"
  on public.threads for select
  using (true);

create policy "threads_insert_own"
  on public.threads for insert
  with check (auth.uid() = user_id);

create policy "threads_update_own"
  on public.threads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "threads_delete_own"
  on public.threads for delete
  using (auth.uid() = user_id);

-- Phase 3: maintain denormalized post counts across users (RLS-safe via security definer)
create or replace function public.adjust_post_boost_count(p_post_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set boost_count = greatest(coalesce(boost_count, 0) + p_delta, 0)
  where id = p_post_id;
end;
$$;

grant execute on function public.adjust_post_boost_count(uuid, integer) to authenticated;

create or replace function public.adjust_post_thread_count(p_post_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set thread_count = greatest(coalesce(thread_count, 0) + p_delta, 0)
  where id = p_post_id;
end;
$$;

grant execute on function public.adjust_post_thread_count(uuid, integer) to authenticated;
