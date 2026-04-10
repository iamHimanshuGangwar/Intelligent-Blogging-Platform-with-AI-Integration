-- ================================================================
-- 022: Post Reviews for Inner Circle
-- ================================================================

-- Post Reviews Table
CREATE TABLE IF NOT EXISTS public.post_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Indexes for reviews
CREATE INDEX IF NOT EXISTS idx_post_reviews_post ON public.post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_user ON public.post_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_rating ON public.post_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created ON public.post_reviews(created_at DESC);

-- Enable RLS
ALTER TABLE public.post_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view reviews"
  ON public.post_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews"
  ON public.post_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid()::text OR auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own reviews"
  ON public.post_reviews FOR UPDATE
  USING (user_id = auth.uid()::text);

CREATE POLICY "Users can delete their own reviews"
  ON public.post_reviews FOR DELETE
  USING (user_id = auth.uid()::text);

COMMENT ON TABLE public.post_reviews IS 'Community reviews for blog posts in Inner Circle';
