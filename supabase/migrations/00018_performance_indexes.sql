-- Phase 1 performance indexes: foreign keys and hot query paths.
-- Safe to re-run in the Supabase SQL Editor.
--
-- Schema note: this project names the connection columns requester_id and
-- addressee_id, not follower_id/following_id. The requester/addressee indexes
-- below are the exact equivalents of the requested follower/following indexes.

-- Posts ---------------------------------------------------------------------
create index if not exists posts_user_id_idx
  on public.posts (user_id);

create index if not exists posts_created_at_idx
  on public.posts (created_at desc);

create index if not exists posts_category_created_at_idx
  on public.posts (category, created_at desc);

create index if not exists posts_user_created_at_idx
  on public.posts (user_id, created_at desc);

create index if not exists posts_boost_count_desc_idx
  on public.posts (boost_count desc, created_at desc);

-- Profiles ------------------------------------------------------------------
create index if not exists profiles_pinned_post_id_idx
  on public.profiles (pinned_post_id);

create index if not exists profiles_username_lower_idx
  on public.profiles (lower(username));

create index if not exists profiles_display_name_lower_idx
  on public.profiles (lower(display_name));

-- Connections / follows -----------------------------------------------------
-- Equivalent of idx_connections_follower and idx_connections_following.
create index if not exists connections_requester_id_idx
  on public.connections (requester_id);

create index if not exists connections_addressee_id_idx
  on public.connections (addressee_id);

create index if not exists connections_status_idx
  on public.connections (status);

create index if not exists connections_requester_status_idx
  on public.connections (requester_id, status);

create index if not exists connections_addressee_status_idx
  on public.connections (addressee_id, status);

create index if not exists follows_follower_id_idx
  on public.follows (follower_id);

create index if not exists follows_following_id_idx
  on public.follows (following_id);

-- Messages / DM rooms -------------------------------------------------------
create index if not exists messages_room_id_idx
  on public.messages (room_id);

-- A btree on (room_id, created_at) supports both ASC and DESC room timelines.
create index if not exists messages_room_id_created_at_idx
  on public.messages (room_id, created_at);

create index if not exists messages_sender_id_idx
  on public.messages (sender_id);

create index if not exists messages_created_at_idx
  on public.messages (created_at desc);

create index if not exists message_rooms_user_1_id_idx
  on public.message_rooms (user_1_id);

create index if not exists message_rooms_user_2_id_idx
  on public.message_rooms (user_2_id);

create index if not exists message_rooms_user_1_last_message_idx
  on public.message_rooms (user_1_id, last_message_at desc);

create index if not exists message_rooms_user_2_last_message_idx
  on public.message_rooms (user_2_id, last_message_at desc);

-- Notifications -------------------------------------------------------------
create index if not exists notifications_user_id_idx
  on public.notifications (user_id);

create index if not exists notifications_actor_id_idx
  on public.notifications (actor_id);

create index if not exists notifications_post_id_idx
  on public.notifications (post_id);

create index if not exists notifications_created_at_idx
  on public.notifications (created_at desc);

-- Equivalent of idx_notifications_is_read on (user_id, is_read).
create index if not exists notifications_user_read_idx
  on public.notifications (user_id, is_read);

create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read)
  where is_read = false;

create index if not exists notifications_user_created_at_idx
  on public.notifications (user_id, created_at desc);

-- Boosts / bookmarks --------------------------------------------------------
create index if not exists boosts_user_id_idx
  on public.boosts (user_id);

create index if not exists boosts_post_id_idx
  on public.boosts (post_id);

-- boosts_unique_user_post already covers (user_id, post_id).

create index if not exists bookmarks_user_id_idx
  on public.bookmarks (user_id);

create index if not exists bookmarks_post_id_idx
  on public.bookmarks (post_id);

create index if not exists bookmarks_created_at_idx
  on public.bookmarks (created_at desc);

create index if not exists bookmarks_user_created_at_idx
  on public.bookmarks (user_id, created_at desc);

-- Threads -------------------------------------------------------------------
create index if not exists threads_post_id_idx
  on public.threads (post_id);

create index if not exists threads_user_id_idx
  on public.threads (user_id);

create index if not exists threads_parent_id_idx
  on public.threads (parent_id);

create index if not exists threads_post_created_at_idx
  on public.threads (post_id, created_at desc);

create index if not exists threads_post_parent_idx
  on public.threads (post_id, parent_id);

-- Stories -------------------------------------------------------------------
create index if not exists stories_user_id_idx
  on public.stories (user_id);

create index if not exists stories_created_at_idx
  on public.stories (created_at desc);

create index if not exists stories_expires_at_idx
  on public.stories (expires_at);

create index if not exists stories_user_created_at_idx
  on public.stories (user_id, created_at desc);

-- Professional data ---------------------------------------------------------
create index if not exists experiences_user_id_idx
  on public.experiences (user_id);

create index if not exists experiences_current_idx
  on public.experiences (user_id, is_current)
  where is_current;

create index if not exists education_user_id_idx
  on public.education (user_id);

create index if not exists skills_user_id_idx
  on public.skills (user_id);

create index if not exists projects_user_id_idx
  on public.projects (user_id);

create index if not exists projects_user_created_at_idx
  on public.projects (user_id, created_at desc);

-- Polls ---------------------------------------------------------------------
-- polls_post_id_key already covers polls(post_id).
create index if not exists poll_options_poll_id_idx
  on public.poll_options (poll_id);

create index if not exists poll_votes_poll_id_idx
  on public.poll_votes (poll_id);

create index if not exists poll_votes_user_id_idx
  on public.poll_votes (user_id);

create index if not exists poll_votes_option_id_idx
  on public.poll_votes (option_id);
