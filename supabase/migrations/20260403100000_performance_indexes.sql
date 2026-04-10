-- Performance indexes for 10K+ daily users
-- Safe to run multiple times (IF NOT EXISTS)

-- Posts: most common query patterns
CREATE INDEX IF NOT EXISTS idx_posts_status_published ON public.posts(status, created_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_posts_author_status ON public.posts(author_id, status);
CREATE INDEX IF NOT EXISTS idx_posts_approval_status ON public.posts(approval_status) WHERE approval_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_topic ON public.posts(topic) WHERE topic IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- Comments: post lookups
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);

-- Likes: count lookups
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_post ON public.post_likes(user_id, post_id);

-- Profiles: email lookups for auth
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;

-- Notifications: user inbox
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read, created_at DESC);

-- Follows: lookup patterns
CREATE INDEX IF NOT EXISTS idx_user_follows_pair ON public.user_follows(follower_id, following_id);

-- Subscriptions: user tier lookups
CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.user_subscriptions(user_id, status);

-- Post collaborators: invite lookups
CREATE INDEX IF NOT EXISTS idx_post_collab_user ON public.post_collaborators(user_id, status);
CREATE INDEX IF NOT EXISTS idx_post_collab_post ON public.post_collaborators(post_id);

-- Post reviews: public reviews
CREATE INDEX IF NOT EXISTS idx_post_reviews_approved ON public.post_reviews(is_approved, created_at DESC) WHERE is_approved = true;
