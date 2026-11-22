-- Phase 6: Bookmarks / Save feature

create extension if not exists "pgcrypto";

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_user_post_unique unique (user_id, post_id)
);

create index if not exists bookmarks_user_id_idx on public.bookmarks(user_id);
create index if not exists bookmarks_post_id_idx on public.bookmarks(post_id);
create index if not exists bookmarks_created_at_idx on public.bookmarks(created_at desc);

alter table public.bookmarks enable row level security;

do $$
begin
  create policy "bookmarks_select_own"
    on public.bookmarks for select
    to authenticated
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "bookmarks_insert_own"
    on public.bookmarks for insert
    to authenticated
    with check (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;

do $$
begin
  create policy "bookmarks_delete_own"
    on public.bookmarks for delete
    to authenticated
    using (auth.uid() = user_id);
exception when duplicate_object then null;
end $$;
