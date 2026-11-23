-- UPLINK Phase 1 schema
-- Requires pgcrypto for gen_random_uuid() (enabled by default in Supabase projects).

create extension if not exists "pgcrypto";

-- Profiles: mirrors authenticated users with public-facing identity fields.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  constraint profiles_username_length check (char_length(username) between 3 and 32)
);

-- Posts: image-based feed entries.
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  image_url text not null,
  caption text,
  boost_count integer not null default 0,
  thread_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Boosts: tracks who boosted what to prevent double-boosting.
create table if not exists public.boosts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint boosts_unique_user_post unique (user_id, post_id)
);

-- Threads: comment-style replies on posts.
create table if not exists public.threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  parent_id uuid references public.threads(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  constraint threads_content_not_empty check (char_length(trim(content)) > 0)
);

-- Helpful indexes for feed and relation lookups.
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists boosts_post_id_idx on public.boosts(post_id);
create index if not exists boosts_user_id_idx on public.boosts(user_id);
create index if not exists threads_post_id_idx on public.threads(post_id);
create index if not exists threads_user_id_idx on public.threads(user_id);
create index if not exists threads_parent_id_idx on public.threads(parent_id);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.boosts enable row level security;
alter table public.threads enable row level security;

-- Profiles policies
create policy "profiles_select_public"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Posts policies
create policy "posts_select_public"
  on public.posts for select
  using (true);

create policy "posts_insert_own"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "posts_update_own"
  on public.posts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "posts_delete_own"
  on public.posts for delete
  using (auth.uid() = user_id);

-- Boosts policies
create policy "boosts_select_public"
  on public.boosts for select
  using (true);

create policy "boosts_insert_own"
  on public.boosts for insert
  with check (auth.uid() = user_id);

create policy "boosts_delete_own"
  on public.boosts for delete
  using (auth.uid() = user_id);

-- Threads policies
create policy "threads_select_public"
  on public.threads for select
  using (true);

create policy "threads_insert_own"
  on public.threads for insert
  with check (auth.uid() = user_id);

create policy "threads_update_own"
  on public.threads for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "threads_delete_own"
  on public.threads for delete
  using (auth.uid() = user_id);

-- Phase 3: maintain denormalized post counts across users (RLS-safe via security definer)
create or replace function public.adjust_post_boost_count(p_post_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set boost_count = greatest(coalesce(boost_count, 0) + p_delta, 0)
  where id = p_post_id;
end;
$$;

grant execute on function public.adjust_post_boost_count(uuid, integer) to authenticated;

create or replace function public.adjust_post_thread_count(p_post_id uuid, p_delta integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.posts
  set thread_count = greatest(coalesce(thread_count, 0) + p_delta, 0)
  where id = p_post_id;
end;
$$;

grant execute on function public.adjust_post_thread_count(uuid, integer) to authenticated;

-- Polls on text posts.
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

create index if not exists poll_options_poll_id_idx on public.poll_options (poll_id);
create index if not exists poll_votes_poll_id_idx on public.poll_votes (poll_id);
create index if not exists poll_votes_user_id_idx on public.poll_votes (user_id);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;

create policy "polls_select_public" on public.polls for select using (true);
create policy "poll_options_select_public" on public.poll_options for select using (true);
create policy "poll_votes_select_public" on public.poll_votes for select using (true);

create policy "polls_insert_own_post"
  on public.polls for insert to authenticated
  with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

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

create policy "poll_votes_insert_own"
  on public.poll_votes for insert to authenticated
  with check (auth.uid() = user_id);

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
