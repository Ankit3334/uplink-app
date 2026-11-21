-- Phase 1: Avatar storage bucket and policies
-- Run in Supabase SQL editor or as a migration.

-- Create public avatars bucket
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- Allow public read access to avatar objects
create policy "avatars_select_public"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar (avatars/<user_id>.jpg)
create policy "avatars_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and owner = auth.uid()
    and name = (auth.uid()::text || '.jpg')
  );

-- Allow authenticated users to update/overwrite their own avatar
create policy "avatars_update_own"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and owner = auth.uid()
    and name = (auth.uid()::text || '.jpg')
  )
  with check (
    bucket_id = 'avatars'
    and owner = auth.uid()
    and name = (auth.uid()::text || '.jpg')
  );
