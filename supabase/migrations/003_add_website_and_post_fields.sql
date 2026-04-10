-- Add website column to users table
alter table public.users add column if not exists website text;

-- Add topic column to posts table for domain categorization
alter table public.posts add column if not exists topic text;

-- Add status column to posts for draft/published/archived
alter table public.posts add column if not exists status text check (status in ('published', 'drafts', 'archived')) default 'published';
