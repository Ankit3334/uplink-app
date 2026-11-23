-- Polls on text posts: 2-4 options, one vote per user.

create extension if not exists "pgcrypto";

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  ends_at timestamptz,
  constraint polls_post_id_key unique (post_id)
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_text text not null,
  vote_count integer not null default 0,
  constraint poll_options_text_not_empty check (char_length(trim(option_text)) > 0),
  constraint poll_options_id_poll_key unique (id, poll_id)
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null references public.poll_options(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint poll_votes_one_per_user unique (poll_id, user_id),
  constraint poll_votes_option_poll_fkey
    foreign key (option_id, poll_id) references public.poll_options(id, poll_id) on delete cascade
);

create index if not exists poll_options_poll_id_idx
  on public.poll_options (poll_id);
create index if not exists poll_votes_poll_id_idx
  on public.poll_votes (poll_id);
create index if not exists poll_votes_user_id_idx
  on public.poll_votes (user_id);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

-- Public read so poll cards render for any signed-in viewer.
drop policy if exists "polls_select_public" on public.polls;
create policy "polls_select_public"
  on public.polls for select using (true);

drop policy if exists "poll_options_select_public" on public.poll_options;
create policy "poll_options_select_public"
  on public.poll_options for select using (true);

drop policy if exists "poll_votes_select_public" on public.poll_votes;
create policy "poll_votes_select_public"
  on public.poll_votes for select using (true);

-- Only the post owner can attach a poll to their own post.
drop policy if exists "polls_insert_own_post" on public.polls;
create policy "polls_insert_own_post"
  on public.polls for insert to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

drop policy if exists "poll_options_insert_own_poll" on public.poll_options;
create policy "poll_options_insert_own_poll"
  on public.poll_options for insert to authenticated
  with check (
    exists (
      select 1
      from public.polls pl
      join public.posts p on p.id = pl.post_id
      where pl.id = poll_id and p.user_id = auth.uid()
    )
  );

-- A signed-in user may vote once; the unique constraint enforces one vote.
drop policy if exists "poll_votes_insert_own" on public.poll_votes;
create policy "poll_votes_insert_own"
  on public.poll_votes for insert to authenticated
  with check (auth.uid() = user_id);

-- Atomic vote: checks the deadline, enforces one vote, increments the option.
create or replace function public.cast_poll_vote(
  p_poll_id uuid,
  p_option_id uuid,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_poll public.polls%rowtype;
  v_vote public.poll_votes%rowtype;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Authentication required for poll vote';
  end if;

  select * into v_poll from public.polls where id = p_poll_id;
  if not found then
    raise exception 'Poll not found';
  end if;

  if v_poll.ends_at is not null and v_poll.ends_at <= now() then
    raise exception 'Poll has ended';
  end if;

  select * into v_vote
  from public.poll_votes
  where poll_id = p_poll_id and user_id = p_user_id;

  if found then
    return jsonb_build_object(
      'already_voted', true,
      'option_id', v_vote.option_id,
      'post_id', v_poll.post_id,
      'counts', coalesce((
        select jsonb_object_agg(id, vote_count)
        from public.poll_options
        where poll_id = p_poll_id
      ), '{}'::jsonb)
    );
  end if;

  if not exists (
    select 1 from public.poll_options
    where id = p_option_id and poll_id = p_poll_id
  ) then
    raise exception 'Invalid poll option';
  end if;

  insert into public.poll_votes (poll_id, option_id, user_id)
  values (p_poll_id, p_option_id, p_user_id);

  update public.poll_options
  set vote_count = vote_count + 1
  where id = p_option_id;

  return jsonb_build_object(
    'already_voted', false,
    'option_id', p_option_id,
    'post_id', v_poll.post_id,
    'counts', coalesce((
      select jsonb_object_agg(id, vote_count)
      from public.poll_options
      where poll_id = p_poll_id
    ), '{}'::jsonb)
  );
exception
  when unique_violation then
    select * into v_vote
    from public.poll_votes
    where poll_id = p_poll_id and user_id = p_user_id;

    return jsonb_build_object(
      'already_voted', true,
      'option_id', coalesce(v_vote.option_id, p_option_id),
      'post_id', v_poll.post_id,
      'counts', coalesce((
        select jsonb_object_agg(id, vote_count)
        from public.poll_options
        where poll_id = p_poll_id
      ), '{}'::jsonb)
    );
end;
$$;

grant execute on function public.cast_poll_vote(uuid, uuid, uuid) to authenticated;
