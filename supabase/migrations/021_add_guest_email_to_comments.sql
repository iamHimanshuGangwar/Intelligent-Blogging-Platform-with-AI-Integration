-- ================================================================
-- 021: Add guest_email to comments table
-- ================================================================

-- Ensure guest_email column exists on comments table
ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS guest_email text;

-- Also ensure the column exists on blog_comments if it's used
ALTER TABLE public.blog_comments
ADD COLUMN IF NOT EXISTS guest_email text;

-- Create index for guest emails to enable searching
CREATE INDEX IF NOT EXISTS idx_comments_guest_email ON public.comments(guest_email);
CREATE INDEX IF NOT EXISTS idx_blog_comments_guest_email ON public.blog_comments(guest_email);

COMMENT ON COLUMN public.comments.guest_email IS 'Email address for guest comments';
COMMENT ON COLUMN public.blog_comments.guest_email IS 'Email address for guest comments';
