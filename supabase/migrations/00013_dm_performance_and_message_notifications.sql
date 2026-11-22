-- DM query performance and message notifications.
-- Safe to re-run: every statement is idempotent.

-- Fetching the latest messages for one room (room_id + ordered created_at).
create index if not exists messages_room_id_created_at_idx
  on public.messages (room_id, created_at);

-- Room lookups by participant. These names match 00005, so this is a no-op
-- on databases that already have them.
create index if not exists message_rooms_user_1_id_idx
  on public.message_rooms (user_1_id);

create index if not exists message_rooms_user_2_id_idx
  on public.message_rooms (user_2_id);

-- Sorted inbox lookups (the /messages list orders by last_message_at).
create index if not exists message_rooms_user_1_last_message_idx
  on public.message_rooms (user_1_id, last_message_at desc);

create index if not exists message_rooms_user_2_last_message_idx
  on public.message_rooms (user_2_id, last_message_at desc);

-- Allow DMs to appear in the Activity / Notifications feed.
do $$
begin
  alter type public.notification_type add value if not exists 'message';
exception
  when duplicate_object then null;
end $$;
