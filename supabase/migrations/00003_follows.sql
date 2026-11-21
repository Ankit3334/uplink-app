-- Phase 1: Social graph (follows)
-- Run in Supabase SQL editor or as a migration.

create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint follows_unique_pair unique (follower_id, following_id)
);

create index if not exists follows_follower_id_idx on public.follows(follower_id);
create index if not exists follows_following_id_idx on public.follows(following_id);

alter table public.follows enable row level security;

create policy "follows_select_public"
  on public.follows for select
  using (true);

create policy "follows_insert_own"
  on public.follows for insert
  with check (auth.uid() = follower_id);

create policy "follows_delete_own"
  on public.follows for delete
  using (auth.uid() = follower_id);

create or replace function public.get_following_count(user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.follows
  where follower_id = user_id;
$$;

grant execute on function public.get_following_count(uuid) to anon, authenticated;

create or replace function public.get_followers_count(user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.follows
  where following_id = user_id;
$$;

grant execute on function public.get_followers_count(uuid) to anon, authenticated;
