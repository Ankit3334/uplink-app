-- Text posts: allow image-less posts and add body content

alter table public.posts
  alter column image_url drop not null;

alter table public.posts
  add column if not exists body text;
