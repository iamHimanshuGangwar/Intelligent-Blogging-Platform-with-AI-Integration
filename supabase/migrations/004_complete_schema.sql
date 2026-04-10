-- ================================================================
-- AiBlog Complete Database Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ================================================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- ================================================================
-- 1. PROFILES TABLE (synced from auth.users via trigger)
-- ================================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null default '',
  avatar_url text,
  bio text,
  website text,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Trigger: auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', ''),
    case
      when new.email = current_setting('app.admin_email', true) then 'admin'
      else 'user'
    end
  )
  on conflict (id) do update set
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    updated_at = now();
  return new;
end;
$$;

-- Drop old trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ================================================================
-- 2. POSTS TABLE
-- ================================================================
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  excerpt text,
  cover_image_url text,
  slug text unique not null,
  status text check (status in ('draft', 'published', 'archived')) default 'draft',
  ai_generated boolean default false,
  topic text,
  views integer default 0,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.update_updated_at();

-- ================================================================
-- 3. BLOG PROMPTS TABLE (AI generation history)
-- ================================================================
create table if not exists public.blog_prompts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  prompt text not null,
  topic text,
  tone text check (tone in ('professional', 'casual', 'academic', 'creative')) default 'professional',
  generated_content text,
  used boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ================================================================
-- 4. COMMUNITY POSTS TABLE
-- ================================================================
create table if not exists public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  category text,
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ================================================================
-- 5. COMMENTS TABLE
-- ================================================================
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade,
  community_post_id uuid references public.community_posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  likes_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  constraint comments_single_parent check (
    (post_id is not null and community_post_id is null) or
    (post_id is null and community_post_id is not null)
  )
);

-- ================================================================
-- 6. LIKES TABLE
-- ================================================================
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade,
  community_post_id uuid references public.community_posts(id) on delete cascade,
  comment_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now() not null,
  constraint likes_single_target check (
    (post_id is not null)::int + (community_post_id is not null)::int + (comment_id is not null)::int = 1
  ),
  constraint likes_unique_post unique (user_id, post_id),
  constraint likes_unique_community unique (user_id, community_post_id),
  constraint likes_unique_comment unique (user_id, comment_id)
);

-- ================================================================
-- 7. FOLLOWERS TABLE
-- ================================================================
create table if not exists public.followers (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now() not null,
  unique(follower_id, following_id),
  constraint no_self_follow check (follower_id != following_id)
);

-- ================================================================
-- 8. CAREER TRACKS TABLE
-- ================================================================
create table if not exists public.career_tracks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  creator_count integer default 0,
  growth_rate integer default 0,
  is_active boolean default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ================================================================
-- 9. CAREER LEVELS TABLE
-- ================================================================
create table if not exists public.career_levels (
  id uuid default uuid_generate_v4() primary key,
  career_track_id uuid references public.career_tracks(id) on delete cascade not null,
  level integer not null,
  name text not null,
  description text,
  perks text[] default array[]::text[],
  icon text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ================================================================
-- 10. USER CAREER PROGRESS
-- ================================================================
create table if not exists public.user_career_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  career_track_id uuid references public.career_tracks(id) on delete cascade not null,
  current_level integer default 1,
  posts_count integer default 0,
  followers_count integer default 0,
  engagements_count integer default 0,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,
  unique(user_id, career_track_id)
);

-- ================================================================
-- 11. NOTIFICATIONS TABLE
-- ================================================================
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text check (type in ('like', 'comment', 'follow', 'mention', 'career_milestone', 'system')) not null,
  title text not null,
  message text,
  related_user_id uuid references public.profiles(id) on delete set null,
  related_post_id uuid references public.posts(id) on delete set null,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

-- ================================================================
-- 12. ADMIN SETTINGS TABLE
-- ================================================================
create table if not exists public.admin_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- ================================================================
-- INDEXES
-- ================================================================
create index if not exists idx_posts_author on public.posts(author_id);
create index if not exists idx_posts_slug on public.posts(slug);
create index if not exists idx_posts_status on public.posts(status);
create index if not exists idx_posts_created on public.posts(created_at desc);
create index if not exists idx_blog_prompts_user on public.blog_prompts(user_id);
create index if not exists idx_community_posts_user on public.community_posts(user_id);
create index if not exists idx_comments_post on public.comments(post_id);
create index if not exists idx_comments_community on public.comments(community_post_id);
create index if not exists idx_comments_user on public.comments(user_id);
create index if not exists idx_likes_user on public.likes(user_id);
create index if not exists idx_likes_post on public.likes(post_id);
create index if not exists idx_followers_follower on public.followers(follower_id);
create index if not exists idx_followers_following on public.followers(following_id);
create index if not exists idx_career_tracks_active on public.career_tracks(is_active);
create index if not exists idx_career_levels_track on public.career_levels(career_track_id);
create index if not exists idx_user_career_user on public.user_career_progress(user_id);
create index if not exists idx_notifications_user on public.notifications(user_id);
create index if not exists idx_notifications_unread on public.notifications(user_id, is_read) where is_read = false;

-- ================================================================
-- ENABLE RLS ON ALL TABLES
-- ================================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.blog_prompts enable row level security;
alter table public.community_posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.followers enable row level security;
alter table public.career_tracks enable row level security;
alter table public.career_levels enable row level security;
alter table public.user_career_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.admin_settings enable row level security;

-- ================================================================
-- RLS POLICIES: PROFILES
-- ================================================================
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ================================================================
-- RLS POLICIES: POSTS
-- ================================================================
create policy "Published posts are publicly readable"
  on public.posts for select
  using (status = 'published' or author_id = auth.uid());

create policy "Authenticated users can create posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update
  using (author_id = auth.uid())
  with check (author_id = auth.uid());

create policy "Users can delete own posts"
  on public.posts for delete
  using (author_id = auth.uid());

-- Admin override: admins can read/update/delete all posts
create policy "Admins can read all posts"
  on public.posts for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can update all posts"
  on public.posts for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can delete all posts"
  on public.posts for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ================================================================
-- RLS POLICIES: BLOG PROMPTS
-- ================================================================
create policy "Users can manage own prompts"
  on public.blog_prompts for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ================================================================
-- RLS POLICIES: COMMUNITY POSTS
-- ================================================================
create policy "Community posts are publicly readable"
  on public.community_posts for select using (true);

create policy "Authenticated users can create community posts"
  on public.community_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own community posts"
  on public.community_posts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own community posts"
  on public.community_posts for delete
  using (user_id = auth.uid());

-- ================================================================
-- RLS POLICIES: COMMENTS
-- ================================================================
create policy "Comments are publicly readable"
  on public.comments for select using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.uid() = user_id);

create policy "Users can update own comments"
  on public.comments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete own comments"
  on public.comments for delete
  using (user_id = auth.uid());

-- ================================================================
-- RLS POLICIES: LIKES
-- ================================================================
create policy "Likes are publicly readable"
  on public.likes for select using (true);

create policy "Authenticated users can like"
  on public.likes for insert
  with check (auth.uid() = user_id);

create policy "Users can unlike own likes"
  on public.likes for delete
  using (user_id = auth.uid());

-- ================================================================
-- RLS POLICIES: FOLLOWERS
-- ================================================================
create policy "Followers are publicly readable"
  on public.followers for select using (true);

create policy "Users can follow"
  on public.followers for insert
  with check (auth.uid() = follower_id);

create policy "Users can unfollow"
  on public.followers for delete
  using (follower_id = auth.uid());

-- ================================================================
-- RLS POLICIES: CAREER TRACKS (read-only for users, full for admins)
-- ================================================================
create policy "Career tracks are publicly readable"
  on public.career_tracks for select using (true);

create policy "Admins can manage career tracks"
  on public.career_tracks for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ================================================================
-- RLS POLICIES: CAREER LEVELS (read-only for users, full for admins)
-- ================================================================
create policy "Career levels are publicly readable"
  on public.career_levels for select using (true);

create policy "Admins can manage career levels"
  on public.career_levels for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ================================================================
-- RLS POLICIES: USER CAREER PROGRESS
-- ================================================================
create policy "Users can read own career progress"
  on public.user_career_progress for select
  using (user_id = auth.uid());

create policy "Users can manage own career progress"
  on public.user_career_progress for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Admins can read all career progress"
  on public.user_career_progress for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ================================================================
-- RLS POLICIES: NOTIFICATIONS
-- ================================================================
create policy "Users can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update own notifications (mark read)"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

-- ================================================================
-- RLS POLICIES: ADMIN SETTINGS (admin only)
-- ================================================================
create policy "Admins can read settings"
  on public.admin_settings for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admins can manage settings"
  on public.admin_settings for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- ================================================================
-- STORAGE: blog-images bucket
-- ================================================================
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do nothing;

-- Storage RLS policies
create policy "Anyone can view blog images"
  on storage.objects for select
  using (bucket_id = 'blog-images');

create policy "Authenticated users can upload blog images"
  on storage.objects for insert
  with check (
    bucket_id = 'blog-images'
    and auth.role() = 'authenticated'
  );

create policy "Users can update own blog images"
  on storage.objects for update
  using (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own blog images"
  on storage.objects for delete
  using (
    bucket_id = 'blog-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ================================================================
-- UTILITY: Function to increment views (callable via RPC)
-- ================================================================
create or replace function public.increment_post_views(post_id uuid)
returns void
language plpgsql
security definer
as $$
begin
  update public.posts set views = views + 1 where id = post_id;
end;
$$;

-- ================================================================
-- UTILITY: Function to toggle like with counter update
-- ================================================================
create or replace function public.toggle_post_like(p_post_id uuid)
returns boolean
language plpgsql
security definer
as $$
declare
  already_liked boolean;
begin
  select exists(
    select 1 from public.likes where user_id = auth.uid() and post_id = p_post_id
  ) into already_liked;

  if already_liked then
    delete from public.likes where user_id = auth.uid() and post_id = p_post_id;
    update public.posts set likes_count = greatest(likes_count - 1, 0) where id = p_post_id;
    return false;
  else
    insert into public.likes (user_id, post_id) values (auth.uid(), p_post_id);
    update public.posts set likes_count = likes_count + 1 where id = p_post_id;
    return true;
  end if;
end;
$$;
