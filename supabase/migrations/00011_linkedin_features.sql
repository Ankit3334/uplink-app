-- Phase 1: Professional profiles and the Connections system
-- Adds professional profile data plus a first-class connection graph.

create extension if not exists "pgcrypto";

-- Connection request lifecycle.
do $$
begin
  create type public.connection_status as enum ('pending', 'accepted', 'ignored');
exception
  when duplicate_object then null;
end $$;

-- Notification kinds used by the connection flow.
do $$
begin
  alter type public.notification_type add value if not exists 'connection_request';
  alter type public.notification_type add value if not exists 'connection_accepted';
exception
  when duplicate_object then null;
end $$;

-- Extra public profile fields used by the professional header.
alter table public.profiles
  add column if not exists location text,
  add column if not exists open_to_work boolean not null default false;

-- Connections ---------------------------------------------------------------
create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  addressee_id uuid not null references public.profiles(id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint connections_distinct_people check (requester_id <> addressee_id),
  constraint connections_unique_pair unique (requester_id, addressee_id)
);

-- Prevent both A -> B and B -> A from coexisting.
create unique index if not exists connections_unique_unordered_pair
  on public.connections (least(requester_id, addressee_id), greatest(requester_id, addressee_id));

create index if not exists connections_requester_id_idx on public.connections(requester_id);
create index if not exists connections_addressee_id_idx on public.connections(addressee_id);
create index if not exists connections_status_idx on public.connections(status);

alter table public.connections enable row level security;

drop policy if exists "connections_select_own" on public.connections;
create policy "connections_select_own"
  on public.connections for select
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "connections_insert_own" on public.connections;
create policy "connections_insert_own"
  on public.connections for insert
  to authenticated
  with check (auth.uid() = requester_id);

drop policy if exists "connections_update_own" on public.connections;
create policy "connections_update_own"
  on public.connections for update
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id)
  with check (auth.uid() = requester_id or auth.uid() = addressee_id);

drop policy if exists "connections_delete_own" on public.connections;
create policy "connections_delete_own"
  on public.connections for delete
  to authenticated
  using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- Experience ----------------------------------------------------------------
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  company text not null,
  start_date date,
  end_date date,
  description text,
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  constraint experiences_title_not_empty check (char_length(trim(title)) > 0),
  constraint experiences_company_not_empty check (char_length(trim(company)) > 0),
  constraint experiences_date_order check (end_date is null or start_date is null or end_date >= start_date)
);

create index if not exists experiences_user_id_idx on public.experiences(user_id);
create index if not exists experiences_current_idx on public.experiences(user_id, is_current) where is_current;

alter table public.experiences enable row level security;

drop policy if exists "experiences_select_public" on public.experiences;
create policy "experiences_select_public"
  on public.experiences for select
  using (true);

drop policy if exists "experiences_insert_own" on public.experiences;
create policy "experiences_insert_own"
  on public.experiences for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "experiences_update_own" on public.experiences;
create policy "experiences_update_own"
  on public.experiences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "experiences_delete_own" on public.experiences;
create policy "experiences_delete_own"
  on public.experiences for delete
  to authenticated
  using (auth.uid() = user_id);

-- Education -----------------------------------------------------------------
create table if not exists public.education (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  school text not null,
  degree text,
  field_of_study text,
  start_year integer,
  end_year integer,
  created_at timestamptz not null default now(),
  constraint education_school_not_empty check (char_length(trim(school)) > 0),
  constraint education_start_year_range check (start_year is null or start_year between 1900 and 2200),
  constraint education_end_year_range check (end_year is null or end_year between 1900 and 2200),
  constraint education_year_order check (end_year is null or start_year is null or end_year >= start_year)
);

create index if not exists education_user_id_idx on public.education(user_id);

alter table public.education enable row level security;

drop policy if exists "education_select_public" on public.education;
create policy "education_select_public"
  on public.education for select
  using (true);

drop policy if exists "education_insert_own" on public.education;
create policy "education_insert_own"
  on public.education for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "education_update_own" on public.education;
create policy "education_update_own"
  on public.education for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "education_delete_own" on public.education;
create policy "education_delete_own"
  on public.education for delete
  to authenticated
  using (auth.uid() = user_id);

-- Skills --------------------------------------------------------------------
create table if not exists public.skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  constraint skills_name_not_empty check (char_length(trim(name)) > 0)
);

create unique index if not exists skills_user_name_unique
  on public.skills (user_id, lower(name));

create index if not exists skills_user_id_idx on public.skills(user_id);

alter table public.skills enable row level security;

drop policy if exists "skills_select_public" on public.skills;
create policy "skills_select_public"
  on public.skills for select
  using (true);

drop policy if exists "skills_insert_own" on public.skills;
create policy "skills_insert_own"
  on public.skills for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "skills_update_own" on public.skills;
create policy "skills_update_own"
  on public.skills for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "skills_delete_own" on public.skills;
create policy "skills_delete_own"
  on public.skills for delete
  to authenticated
  using (auth.uid() = user_id);
