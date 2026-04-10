-- Ensure review feature table exists for community review submission.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.post_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_reviews_post_id ON public.post_reviews(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_user_id ON public.post_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_post_reviews_created_at ON public.post_reviews(created_at DESC);
