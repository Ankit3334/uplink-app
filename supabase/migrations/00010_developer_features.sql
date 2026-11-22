-- Developer-centric profile fields and code-post metadata
-- Apply this migration before deploying the updated feed/composer queries.

alter table public.profiles
  add column if not exists currently_building text,
  add column if not exists tech_stack text[] not null default '{}'::text[];

alter table public.posts
  add column if not exists is_code_block boolean not null default false,
  add column if not exists language text;

comment on column public.profiles.currently_building is
  'Active project the builder is currently shipping';

comment on column public.profiles.tech_stack is
  'Short list of technologies the builder works with';

comment on column public.posts.is_code_block is
  'When true, the feed renders body as a styled code block';

comment on column public.posts.language is
  'Optional language label shown on code blocks';
