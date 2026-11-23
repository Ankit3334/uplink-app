-- Pin one of a member's own posts to the top of their profile.

alter table public.profiles
  add column if not exists pinned_post_id uuid references public.posts(id) on delete set null;

comment on column public.profiles.pinned_post_id is
  'Single post featured at the top of the member profile';
