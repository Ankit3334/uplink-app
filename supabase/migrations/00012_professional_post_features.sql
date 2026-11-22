-- Professional post categories and the Open to Work profile flag.
-- Both statements are idempotent so they can be run alongside 00011.

-- Post categories -----------------------------------------------------------
alter table public.posts
  add column if not exists category text not null default 'general';

-- Keep the four composer options valid, including rows inserted before this
-- migration existed.
alter table public.posts
  drop constraint if exists posts_category_valid;
alter table public.posts
  add constraint posts_category_valid
  check (category in ('general', 'question', 'hiring', 'showdev'));

create index if not exists posts_category_created_at_idx
  on public.posts (category, created_at desc);

comment on column public.posts.category is
  'Composer-selected post tag: general, question, hiring or showdev';

-- Open to Work --------------------------------------------------------------
-- 00011 already adds this column; repeated here so this migration can be
-- applied on its own.
alter table public.profiles
  add column if not exists open_to_work boolean not null default false;

comment on column public.profiles.open_to_work is
  'Whether the member displays the professional Open to Work badge';
