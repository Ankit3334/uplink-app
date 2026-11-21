-- Phase 5: Notifications and Search/Explore support
-- Ensure notifications table exists, add unread-count helper, and search indexes

create extension if not exists "pgcrypto";

-- Ensure notification type enum exists and includes needed values
do $$
begin
  create type public.notification_type as enum ('like', 'follow', 'thread', 'story_view', 'boost');
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  alter type public.notification_type add value if not exists 'boost';
exception
  when duplicate_object then null;
end
$$;

-- Ensure notifications table exists
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade, -- recipient
  actor_id uuid not null references public.profiles(id) on delete cascade, -- who performed the action
  type public.notification_type not null,
  post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- Indexes for fast querying
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_actor_id_idx on public.notifications(actor_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);
create index if not exists notifications_user_unread_idx on public.notifications(user_id, is_read) where is_read = false;

-- RLS (idempotent via DO blocks to avoid failures if policies already exist)
alter table public.notifications enable row level security;

do $$
begin
  create policy "notifications_select_public"
    on public.notifications for select
    using (true);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "notifications_insert_actor"
    on public.notifications for insert
    to authenticated
    with check (auth.uid() = actor_id);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "notifications_update_recipient"
    on public.notifications for update
    to authenticated
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);
exception
  when duplicate_object then null;
end
$$;

do $$
begin
  create policy "notifications_delete_recipient"
    on public.notifications for delete
    to authenticated
    using (auth.uid() = user_id);
exception
  when duplicate_object then null;
end
$$;

-- Helper function to count unread notifications for a user
create or replace function public.get_unread_notification_count(p_user_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(count(*)::integer, 0)
  from public.notifications
  where user_id = p_user_id
    and is_read = false;
$$;

grant execute on function public.get_unread_notification_count(uuid) to authenticated;

-- Optional search performance helpers for Explore/Search
create index if not exists profiles_username_lower_idx on public.profiles (lower(username));
create index if not exists profiles_display_name_lower_idx on public.profiles (lower(display_name));
create index if not exists posts_boost_count_desc_idx on public.posts (boost_count desc, created_at desc);
