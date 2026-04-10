-- Add email_verified tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ DEFAULT NULL;

-- Mark existing OTP-verified users as email_verified
-- (anyone who has a verified OTP code is verified)
UPDATE public.profiles p
SET email_verified = TRUE,
    email_verified_at = NOW()
WHERE EXISTS (
  SELECT 1 FROM public.otp_codes o
  WHERE o.email = p.email
    AND o.verified = TRUE
)
AND (p.email_verified IS NULL OR p.email_verified = FALSE);

-- Clerk users are verified at provider level; mark them as verified too
-- (profiles with a Clerk user_id - which starts with 'user_')
UPDATE public.profiles
SET email_verified = TRUE,
    email_verified_at = NOW()
WHERE id LIKE 'user_%'
  AND (email_verified IS NULL OR email_verified = FALSE);

-- Index for quick lookups of unverified users
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified
  ON public.profiles(email_verified, created_at DESC)
  WHERE email_verified = FALSE OR email_verified IS NULL;
