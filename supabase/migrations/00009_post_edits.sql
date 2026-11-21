-- Post editing metadata

alter table public.posts
  add column if not exists updated_at timestamptz not null default now();

alter table public.posts
  add column if not exists is_edited boolean not null default false;
