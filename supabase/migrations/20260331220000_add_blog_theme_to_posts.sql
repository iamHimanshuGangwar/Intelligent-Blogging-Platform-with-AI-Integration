-- Add blog_theme column to posts table
-- Stores the selected visual theme ID for post display
ALTER TABLE posts ADD COLUMN IF NOT EXISTS blog_theme TEXT DEFAULT 'default';
