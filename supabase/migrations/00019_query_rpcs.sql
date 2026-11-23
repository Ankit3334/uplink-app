-- Small, read-only RPCs used by Phase 1 query optimizations.

-- Profile post count and total boosts in one aggregate query. This replaces
-- reducing a limited (60-row) post list on the server.
create or replace function public.get_profile_post_stats(p_user_id uuid)
returns table (post_count bigint, total_boosts bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)::bigint as post_count,
    coalesce(sum(boost_count), 0)::bigint as total_boosts
  from public.posts
  where user_id = p_user_id;
$$;

grant execute on function public.get_profile_post_stats(uuid) to authenticated, anon;

-- Latest message preview per room. Avoids fetching every message in every DM
-- room just to display one preview per conversation.
create or replace function public.get_latest_messages_for_rooms(p_room_ids uuid[])
returns table (room_id uuid, content text)
language sql
stable
security definer
set search_path = public
as $$
  select distinct on (m.room_id)
    m.room_id,
    m.content
  from public.messages m
  where m.room_id = any(p_room_ids)
  order by m.room_id, m.created_at desc;
$$;

grant execute on function public.get_latest_messages_for_rooms(uuid[]) to authenticated;
