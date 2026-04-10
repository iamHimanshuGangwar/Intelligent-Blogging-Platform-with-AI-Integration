-- ================================================================
-- OTP SESSIONS - Persistent User Sessions
-- ================================================================
-- This migration adds persistent OTP session storage
-- instead of relying on localStorage

-- 1. Create OTP sessions table
CREATE TABLE IF NOT EXISTS public.otp_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_sessions_user ON public.otp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_token ON public.otp_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_email ON public.otp_sessions(email);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_active ON public.otp_sessions(is_active) WHERE is_active = true;

-- 3. Enable RLS
ALTER TABLE public.otp_sessions ENABLE ROW LEVEL SECURITY;

-- 4. Create permissive policies (allow server-side operations)
CREATE POLICY "Allow service role to manage otp sessions" 
  ON public.otp_sessions 
  FOR ALL 
  USING (true)
  WITH CHECK (true);

-- 5. Function to clean up expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_sessions()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.otp_sessions
  WHERE expires_at < now() OR is_active = false;
END;
$$;

-- 6. Create audit table for OTP logins
CREATE TABLE IF NOT EXISTS public.otp_login_audit (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT NOT NULL,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT CHECK (status IN ('success', 'failed', 'code_expired', 'wrong_code')) NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address TEXT,
  device_info TEXT
);

-- 7. Index for audit
CREATE INDEX IF NOT EXISTS idx_otp_audit_email ON public.otp_login_audit(email);
CREATE INDEX IF NOT EXISTS idx_otp_audit_user ON public.otp_login_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_audit_date ON public.otp_login_audit(attempted_at DESC);

-- 8. Add profile_image_url to profiles if not exists
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Done
COMMENT ON TABLE public.otp_sessions IS 'Stores persistent OTP user sessions';
COMMENT ON TABLE public.otp_login_audit IS 'Audit log for OTP login attempts';
