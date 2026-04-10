-- ================================================================
-- 005: Newsletter Subscribers & Guest Comments
-- ================================================================

-- Newsletter subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  name text,
  subscribed boolean default true,
  created_at timestamptz default now() not null
);

alter table public.newsletter_subscribers enable row level security;

create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);

create policy "Newsletter is admin-readable"
  on public.newsletter_subscribers for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- Allow guest comments (make user_id nullable, add guest fields)
alter table public.comments
  alter column user_id drop not null;

alter table public.comments
  add column if not exists guest_name text,
  add column if not exists guest_email text;

-- Drop old constraint so posts OR community posts OR neither (for flexibility)
alter table public.comments
  drop constraint if exists comments_single_parent;

-- Allow comments without a parent (standalone) or with a single parent
alter table public.comments
  add constraint comments_parent_check check (
    num_nonnulls(post_id, community_post_id) <= 1
  );

-- Update comments policy to allow public inserts (guest comments)
drop policy if exists "Authenticated users can create comments" on public.comments;
create policy "Anyone can create comments"
  on public.comments for insert
  with check (true);
