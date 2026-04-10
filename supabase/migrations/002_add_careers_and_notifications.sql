-- Career Tracks table
create table if not exists public.career_tracks (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  icon text,
  creator_count integer default 0,
  growth_rate integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Career Levels table  
create table if not exists public.career_levels (
  id uuid default uuid_generate_v4() primary key,
  career_track_id uuid references public.career_tracks on delete cascade not null,
  level integer not null,
  name text not null,
  description text,
  perks text[] default array[]::text[],
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- User Career Progress table
create table if not exists public.user_career_progress (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  career_track_id uuid references public.career_tracks on delete cascade not null,
  current_level integer default 1,
  posts_count integer default 0,
  followers_count integer default 0,
  engagements_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, career_track_id)
);

-- Notifications table
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  type text check (type in ('like', 'comment', 'follow', 'mention', 'career_milestone', 'system')) not null,
  title text not null,
  message text,
  related_user_id uuid references public.users on delete set null,
  related_post_id uuid references public.posts on delete set null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Followers table
create table if not exists public.followers (
  id uuid default uuid_generate_v4() primary key,
  follower_id uuid references public.users on delete cascade not null,
  following_id uuid references public.users on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(follower_id, following_id)
);

-- Likes table
create table if not exists public.likes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  post_id uuid references public.posts on delete cascade,
  community_post_id uuid references public.community_posts on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes
create index if not exists career_tracks_is_active_idx on public.career_tracks(is_active);
create index if not exists career_levels_track_id_idx on public.career_levels(career_track_id);
create index if not exists user_career_progress_user_id_idx on public.user_career_progress(user_id);
create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_is_read_idx on public.notifications(is_read);
create index if not exists followers_follower_id_idx on public.followers(follower_id);
create index if not exists followers_following_id_idx on public.followers(following_id);
create index if not exists likes_user_id_idx on public.likes(user_id);

-- Enable RLS
alter table public.career_tracks enable row level security;
alter table public.career_levels enable row level security;
alter table public.user_career_progress enable row level security;
alter table public.notifications enable row level security;
alter table public.followers enable row level security;
alter table public.likes enable row level security;

-- Career Tracks RLS Policies
create policy "Anyone can read active career tracks"
  on public.career_tracks for select
  using (is_active = true);

create policy "Admins can read all career tracks"
  on public.career_tracks for select
  using (true);

create policy "Admins can create career tracks"
  on public.career_tracks for insert
  with check (true);

create policy "Admins can update career tracks"
  on public.career_tracks for update
  using (true)
  with check (true);

-- Career Levels RLS Policies
create policy "Anyone can read career levels"
  on public.career_levels for select
  using (true);

create policy "Admins can manage career levels"
  on public.career_levels for insert
  with check (true);

-- User Career Progress RLS Policies
create policy "Users can read own progress"
  on public.user_career_progress for select
  using (user_id = auth.uid() or true);

create policy "Users can create own progress"
  on public.user_career_progress for insert
  with check (user_id = auth.uid());

create policy "Users can update own progress"
  on public.user_career_progress for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Notifications RLS Policies
create policy "Users can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "System can create notifications"
  on public.notifications for insert
  with check (true);

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Followers RLS Policies
create policy "Anyone can read followers"
  on public.followers for select
  using (true);

create policy "Users can add followers"
  on public.followers for insert
  with check (follower_id = auth.uid());

-- Likes RLS Policies
create policy "Anyone can read likes"
  on public.likes for select
  using (true);

create policy "Users can like posts"
  on public.likes for insert
  with check (user_id = auth.uid());

-- Insert default career tracks
insert into public.career_tracks (name, description, icon, creator_count, growth_rate, is_active) values
  ('Technical Writer', 'Code-driven narratives and API documentation specialists.', 'terminal', 1200, 12, true),
  ('Creative Storyteller', 'Narrative fiction and long-form immersive digital experiences.', 'auto_stories', 4800, 5, true),
  ('Industry Analyst', 'Data-backed reporting and market trend forecasting.', 'query_stats', 850, 22, true)
on conflict do nothing;

-- Insert default career levels
insert into public.career_levels (career_track_id, level, name, description, perks, icon) 
select id, 1, 'Contributor', 'Getting started on your journey', array['Early access to features', 'Community badge'], 'fiber_new'
from public.career_tracks where name = 'Technical Writer'
on conflict do nothing;

insert into public.career_levels (career_track_id, level, name, description, perks, icon) 
select id, 2, 'Expert', 'Recognized authority in your field', array['Premium analytics', 'Verified badge', 'Featured content'], 'verified_user'
from public.career_tracks where name = 'Technical Writer'
on conflict do nothing;

insert into public.career_levels (career_track_id, level, name, description, perks, icon) 
select id, 3, 'Authority', 'Leading voice and mentor', array['All Expert perks', 'Mentorship program', 'Speaking opportunities'], 'public'
from public.career_tracks where name = 'Technical Writer'
on conflict do nothing;
