-- Nested/threaded replies: threads can point to a parent thread in the same table.
-- Safe to re-run.

alter table public.threads
  add column if not exists parent_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'threads_parent_id_fkey'
      and conrelid = 'public.threads'::regclass
  ) then
    alter table public.threads
      add constraint threads_parent_id_fkey
      foreign key (parent_id) references public.threads(id) on delete cascade;
  end if;
end $$;

create index if not exists threads_parent_id_idx
  on public.threads (parent_id);
