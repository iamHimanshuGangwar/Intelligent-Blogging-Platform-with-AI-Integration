alter table if exists public.post_collaborators enable row level security;

-- Owners and collaborators can read collaboration rows for their posts.
drop policy if exists "Post collaborators can read access rows" on public.post_collaborators;
create policy "Post collaborators can read access rows"
on public.post_collaborators
for select
using (
  user_id = auth.uid()::text
  or invited_by = auth.uid()::text
  or exists (
    select 1
    from public.posts p
    where p.id = post_collaborators.post_id
      and p.author_id = auth.uid()::text
  )
);

-- Only post owners can create invites.
drop policy if exists "Post owners can invite collaborators" on public.post_collaborators;
create policy "Post owners can invite collaborators"
on public.post_collaborators
for insert
with check (
  invited_by = auth.uid()::text
  and exists (
    select 1
    from public.posts p
    where p.id = post_collaborators.post_id
      and p.author_id = auth.uid()::text
  )
);

-- Post owners can update all collaboration rows; invitees can only respond to their own invite.
drop policy if exists "Owners and invitees can update collaborator rows" on public.post_collaborators;
create policy "Owners and invitees can update collaborator rows"
on public.post_collaborators
for update
using (
  user_id = auth.uid()::text
  or exists (
    select 1
    from public.posts p
    where p.id = post_collaborators.post_id
      and p.author_id = auth.uid()::text
  )
)
with check (
  user_id = auth.uid()::text
  or exists (
    select 1
    from public.posts p
    where p.id = post_collaborators.post_id
      and p.author_id = auth.uid()::text
  )
);

-- Only post owners can remove collaborators.
drop policy if exists "Post owners can delete collaborator rows" on public.post_collaborators;
create policy "Post owners can delete collaborator rows"
on public.post_collaborators
for delete
using (
  exists (
    select 1
    from public.posts p
    where p.id = post_collaborators.post_id
      and p.author_id = auth.uid()::text
  )
);
