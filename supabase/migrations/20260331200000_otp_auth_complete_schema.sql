-- ============================================================
-- OTP-Based User Authentication — Full Schema
-- Run this once to ensure all auth tables exist.
-- All statements are idempotent (IF NOT EXISTS).
-- ============================================================

-- Required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES (base table referenced by all auth tables)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id           TEXT PRIMARY KEY,
  email        TEXT UNIQUE NOT NULL,
  name         TEXT,
  avatar_url   TEXT,
  bio          TEXT,
  website      TEXT,
  role         TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at   TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON public.profiles(role);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_profiles" ON public.profiles;
CREATE POLICY "service_role_all_profiles"
  ON public.profiles FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. OTP CODES  (one-time passwords sent via email)
-- ============================================================
-- Each sign-up/login request generates a fresh 6-digit code.
-- Unique constraint on email so we upsert on conflict.
CREATE TABLE IF NOT EXISTS public.otp_codes (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  email      TEXT        UNIQUE NOT NULL,
  code       TEXT        NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified   BOOLEAN     DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_codes_email   ON public.otp_codes(email);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires ON public.otp_codes(expires_at);

ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_otp_codes" ON public.otp_codes;
CREATE POLICY "service_role_all_otp_codes"
  ON public.otp_codes FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. OTP SESSIONS  (persistent server-side sessions after OTP verify)
-- ============================================================
-- session_token is stored as an httpOnly cookie on the client.
CREATE TABLE IF NOT EXISTS public.otp_sessions (
  id               UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          TEXT        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email            TEXT        NOT NULL,
  session_token    TEXT        UNIQUE NOT NULL,
  device_info      TEXT,
  ip_address       TEXT,
  is_active        BOOLEAN     DEFAULT true,
  created_at       TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  last_accessed_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_sessions_user   ON public.otp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_token  ON public.otp_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_email  ON public.otp_sessions(email);
CREATE INDEX IF NOT EXISTS idx_otp_sessions_active ON public.otp_sessions(is_active) WHERE is_active = true;

ALTER TABLE public.otp_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_otp_sessions" ON public.otp_sessions;
CREATE POLICY "service_role_all_otp_sessions"
  ON public.otp_sessions FOR ALL USING (true) WITH CHECK (true);

-- Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_otp_sessions()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  DELETE FROM public.otp_sessions
  WHERE expires_at < now() OR is_active = false;
END;
$$;

-- ============================================================
-- 4. OTP LOGIN AUDIT  (track all login attempts for security)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.otp_login_audit (
  id           UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  email        TEXT        NOT NULL,
  user_id      TEXT        REFERENCES public.profiles(id) ON DELETE SET NULL,
  status       TEXT        NOT NULL CHECK (status IN ('success', 'failed', 'code_expired', 'wrong_code')),
  attempted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ip_address   TEXT,
  device_info  TEXT
);

CREATE INDEX IF NOT EXISTS idx_otp_audit_email  ON public.otp_login_audit(email);
CREATE INDEX IF NOT EXISTS idx_otp_audit_user   ON public.otp_login_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_otp_audit_date   ON public.otp_login_audit(attempted_at DESC);

ALTER TABLE public.otp_login_audit ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_audit" ON public.otp_login_audit;
CREATE POLICY "service_role_all_audit"
  ON public.otp_login_audit FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. USER PASSWORD CREDENTIALS  (hashed password for password login)
-- ============================================================
-- Password is hashed using scrypt (see lib/password.ts).
-- Supports account lockout after failed_attempts threshold.
CREATE TABLE IF NOT EXISTS public.user_password_credentials (
  user_id       TEXT        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  password_hash TEXT        NOT NULL,
  password_salt TEXT        NOT NULL,
  password_set_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  last_login_at TIMESTAMPTZ,
  failed_attempts INTEGER   DEFAULT 0 NOT NULL,
  locked_until  TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_pwd_locked
  ON public.user_password_credentials(locked_until);

ALTER TABLE public.user_password_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_passwords" ON public.user_password_credentials;
CREATE POLICY "service_role_all_passwords"
  ON public.user_password_credentials FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. PASSWORD RESET TOKENS  (emailed one-time reset links)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL UNIQUE,   -- SHA-256 of the token sent in email
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_user
  ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_expires
  ON public.password_reset_tokens(expires_at);

ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "service_role_all_pwd_reset" ON public.password_reset_tokens;
CREATE POLICY "service_role_all_pwd_reset"
  ON public.password_reset_tokens FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- SUMMARY OF AUTH FLOW
-- ============================================================
-- Sign-Up (new user):
--   1. POST /api/auth/otp/send        → insert row in otp_codes (expires 10 min)
--   2. POST /api/auth/otp/verify      → validate otp_codes row; upsert profiles;
--                                       insert otp_sessions; set otp_session_token cookie
--   3. POST /api/auth/otp/password/set → insert user_password_credentials
--
-- Login (existing user):
--   POST /api/auth/otp/password/login → lookup profiles by email;
--                                       verify password against user_password_credentials;
--                                       insert otp_sessions; set otp_session_token cookie
--
-- Session check:
--   GET  /api/auth/otp/session        → validate otp_session_token cookie against otp_sessions
--
-- Logout:
--   DELETE /api/auth/otp/session      → mark otp_sessions.is_active = false
--
-- Forgot password:
--   POST /api/auth/otp/password/reset/request  → insert password_reset_tokens; email token
--   POST /api/auth/otp/password/reset/confirm  → validate token; update user_password_credentials
--
-- Admin login (separate from user OTP):
--   POST /api/admin/login  → validate env ADMIN_EMAIL/ADMIN_PASSWORD;
--                            set admin_session_token cookie (base64 encoded, 8h TTL)
--   GET  /api/admin/me     → validate admin_session_token; return admin profile
--   POST /api/admin/logout → clear admin_session_token cookie
-- ============================================================
