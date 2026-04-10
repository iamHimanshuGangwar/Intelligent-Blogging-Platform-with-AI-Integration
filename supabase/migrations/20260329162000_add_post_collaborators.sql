create table if not exists public.post_collaborators (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id text not null references public.profiles(id) on delete cascade,
  invited_by text not null references public.profiles(id) on delete cascade,
  permission text not null default 'editor' check (permission in ('editor', 'viewer')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create index if not exists idx_post_collaborators_post_id on public.post_collaborators(post_id);
create index if not exists idx_post_collaborators_user_id on public.post_collaborators(user_id);
create index if not exists idx_post_collaborators_status on public.post_collaborators(status);

create or replace function public.set_post_collaborators_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_post_collaborators_updated_at on public.post_collaborators;
create trigger trg_post_collaborators_updated_at
before update on public.post_collaborators
for each row execute function public.set_post_collaborators_updated_at();
