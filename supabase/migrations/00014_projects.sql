-- Project showcase: linked portfolio projects on member profiles.
-- Safe to re-run.

create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  link text,
  tech_stack text[] not null default '{}',
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx
  on public.projects (user_id);

create index if not exists projects_user_created_at_idx
  on public.projects (user_id, created_at desc);

alter table public.projects enable row level security;

-- Public read so project cards render on any profile.
drop policy if exists "projects_select_public" on public.projects;
create policy "projects_select_public"
  on public.projects for select
  using (true);

-- Only the owner can add, change or remove their own projects.
drop policy if exists "projects_insert_own" on public.projects;
create policy "projects_insert_own"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "projects_update_own" on public.projects;
create policy "projects_update_own"
  on public.projects for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "projects_delete_own" on public.projects;
create policy "projects_delete_own"
  on public.projects for delete
  to authenticated
  using (auth.uid() = user_id);
