-- Phase 1: Instagram features schema and storage expansion
-- UPLINK upgrade: stories, reels, DMs, notifications

create extension if not exists "pgcrypto";

-- Notification type enum
do $$
begin
  create type public.notification_type as enum ('like', 'follow', 'thread', 'story_view');
exception
  when duplicate_object then null;
end
$$;

-- Stories: 24-hour ephemeral image/video uploads
create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  media_type text not null check (media_type in ('image', 'video')),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);

-- Reels: short-form vertical videos
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  video_url text not null,
  caption text,
  audio_url text,
  boost_count integer not null default 0,
  comment_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Message rooms: 1:1 DM rooms
create table if not exists public.message_rooms (
  id uuid primary key default gen_random_uuid(),
  user_1_id uuid not null references public.profiles(id) on delete cascade,
  user_2_id uuid not null references public.profiles(id) on delete cascade,
  last_message_at timestamptz,
  constraint message_rooms_distinct_users check (user_1_id <> user_2_id)
);

-- Prevent duplicate rooms for the same user pair (order-independent)
create unique index if not exists message_rooms_user_pair_uidx
  on public.message_rooms (least(user_1_id, user_2_id), greatest(user_1_id, user_2_id));

-- Messages: private chat messages
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.message_rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  media_url text,
  created_at timestamptz not null default now()
);

-- Notifications: activity feed
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade, -- recipient
  actor_id uuid not null references public.profiles(id) on delete cascade, -- who performed the action
  type public.notification_type not null,
  post_id uuid references public.posts(id) on delete set null,
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- Indexes for fast querying (created_at, user/participant/sender/room ids)
create index if not exists stories_user_id_idx on public.stories(user_id);
create index if not exists stories_created_at_idx on public.stories(created_at desc);

create index if not exists reels_user_id_idx on public.reels(user_id);
create index if not exists reels_created_at_idx on public.reels(created_at desc);

create index if not exists message_rooms_user_1_id_idx on public.message_rooms(user_1_id);
create index if not exists message_rooms_user_2_id_idx on public.message_rooms(user_2_id);
create index if not exists message_rooms_last_message_at_idx on public.message_rooms(last_message_at desc);

create index if not exists messages_room_id_idx on public.messages(room_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);
create index if not exists messages_created_at_idx on public.messages(created_at desc);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_actor_id_idx on public.notifications(actor_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

-- Row Level Security
alter table public.stories enable row level security;
alter table public.reels enable row level security;
alter table public.message_rooms enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- Stories policies (public read, owner write)
create policy "stories_select_public"
  on public.stories for select
  using (true);

create policy "stories_insert_own"
  on public.stories for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "stories_update_own"
  on public.stories for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "stories_delete_own"
  on public.stories for delete
  to authenticated
  using (auth.uid() = user_id);

-- Reels policies (public read, owner write)
create policy "reels_select_public"
  on public.reels for select
  using (true);

create policy "reels_insert_own"
  on public.reels for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "reels_update_own"
  on public.reels for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reels_delete_own"
  on public.reels for delete
  to authenticated
  using (auth.uid() = user_id);

-- Message rooms policies (public read, participant write)
create policy "message_rooms_select_public"
  on public.message_rooms for select
  using (true);

create policy "message_rooms_insert_participant"
  on public.message_rooms for insert
  to authenticated
  with check (auth.uid() = user_1_id or auth.uid() = user_2_id);

create policy "message_rooms_update_participant"
  on public.message_rooms for update
  to authenticated
  using (auth.uid() = user_1_id or auth.uid() = user_2_id)
  with check (auth.uid() = user_1_id or auth.uid() = user_2_id);

create policy "message_rooms_delete_participant"
  on public.message_rooms for delete
  to authenticated
  using (auth.uid() = user_1_id or auth.uid() = user_2_id);

-- Messages policies (public read, sender/owner write)
create policy "messages_select_public"
  on public.messages for select
  using (true);

create policy "messages_insert_own"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = sender_id);

create policy "messages_update_own"
  on public.messages for update
  to authenticated
  using (auth.uid() = sender_id)
  with check (auth.uid() = sender_id);

create policy "messages_delete_own"
  on public.messages for delete
  to authenticated
  using (auth.uid() = sender_id);

-- Notifications policies (public read; actor inserts; recipient manages)
create policy "notifications_select_public"
  on public.notifications for select
  using (true);

create policy "notifications_insert_actor"
  on public.notifications for insert
  to authenticated
  with check (auth.uid() = actor_id);

create policy "notifications_update_recipient"
  on public.notifications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "notifications_delete_recipient"
  on public.notifications for delete
  to authenticated
  using (auth.uid() = user_id);

-- Storage buckets (public)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('story-media', 'story-media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']),
  ('reel-videos', 'reel-videos', true, 104857600, array['video/mp4', 'video/webm', 'video/quicktime']),
  ('message-media', 'message-media', true, 52428800, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Storage policies: story-media (public read, authenticated upload to own folders)
create policy "story_media_select_public"
  on storage.objects for select
  using (bucket_id = 'story-media');

create policy "story_media_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'story-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "story_media_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'story-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'story-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "story_media_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'story-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies: reel-videos (public read, authenticated upload to own folders)
create policy "reel_videos_select_public"
  on storage.objects for select
  using (bucket_id = 'reel-videos');

create policy "reel_videos_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'reel-videos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reel_videos_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'reel-videos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'reel-videos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "reel_videos_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'reel-videos'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage policies: message-media (public read, authenticated upload to own folders)
create policy "message_media_select_public"
  on storage.objects for select
  using (bucket_id = 'message-media');

create policy "message_media_insert_own_folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "message_media_update_own_folder"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "message_media_delete_own_folder"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'message-media'
    and owner = auth.uid()
    and (storage.foldername(name))[1] = auth.uid()::text
  );
