-- Fix: Add UNIQUE constraint on otp_codes.email
-- Required for upsert (ON CONFLICT email) to work in the send OTP route.
-- This is idempotent: if the constraint already exists, the command is skipped.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'otp_codes_email_key'
      AND conrelid = 'public.otp_codes'::regclass
  ) THEN
    ALTER TABLE public.otp_codes ADD CONSTRAINT otp_codes_email_key UNIQUE (email);
  END IF;
END $$;
