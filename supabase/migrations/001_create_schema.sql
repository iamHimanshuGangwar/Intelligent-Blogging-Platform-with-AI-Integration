-- Enable JWT auth
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  bio text,
  role text check (role in ('user', 'admin')) default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blog Posts table
create table if not exists public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  content text not null,
  excerpt text,
  image_url text,
  slug text unique not null,
  published boolean default false,
  ai_generated boolean default false,
  views integer default 0,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Blog Prompts table (for AI generation)
create table if not exists public.blog_prompts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  prompt text not null,
  topic text,
  tone text check (tone in ('professional', 'casual', 'academic', 'creative')) default 'professional',
  generated_content text,
  used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Community Posts table
create table if not exists public.community_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users on delete cascade not null,
  title text not null,
  content text not null,
  category text,
  likes integer default 0,
  comments_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments table
create table if not exists public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.community_posts on delete cascade not null,
  user_id uuid references public.users on delete cascade not null,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Admin Settings table
create table if not exists public.admin_settings (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  value text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index if not exists posts_user_id_idx on public.posts(user_id);
create index if not exists posts_slug_idx on public.posts(slug);
create index if not exists posts_published_idx on public.posts(published);
create index if not exists blog_prompts_user_id_idx on public.blog_prompts(user_id);
create index if not exists community_posts_user_id_idx on public.community_posts(user_id);
create index if not exists comments_post_id_idx on public.comments(post_id);
create index if not exists comments_user_id_idx on public.comments(user_id);

-- Enable Row Level Security (RLS)
alter table public.users enable row level security;
alter table public.posts enable row level security;
alter table public.blog_prompts enable row level security;
alter table public.community_posts enable row level security;
alter table public.comments enable row level security;

-- RLS Policies for users table
create policy "Users can read public profiles"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- RLS Policies for posts table
create policy "Anyone can read published posts"
  on public.posts for select
  using (published = true);

create policy "Users can read their own draft posts"
  on public.posts for select
  using (published = true or user_id = auth.uid());

create policy "Users can create posts"
  on public.posts for insert
  with check (user_id = auth.uid());

create policy "Users can update their own posts"
  on public.posts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users can delete their own posts"
  on public.posts for delete
  using (user_id = auth.uid());

-- RLS Policies for blog_prompts table
create policy "Users can create own prompts"
  on public.blog_prompts for insert
  with check (user_id = auth.uid());

create policy "Users can read own prompts"
  on public.blog_prompts for select
  using (user_id = auth.uid());

create policy "Users can update own prompts"
  on public.blog_prompts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policies for community_posts table
create policy "Anyone can read community posts"
  on public.community_posts for select
  using (true);

create policy "Users can create community posts"
  on public.community_posts for insert
  with check (user_id = auth.uid());

create policy "Users can update their own community posts"
  on public.community_posts for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- RLS Policies for comments table
create policy "Anyone can read comments"
  on public.comments for select
  using (true);

create policy "Users can create comments"
  on public.comments for insert
  with check (user_id = auth.uid());

create policy "Users can update their own comments"
  on public.comments for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
