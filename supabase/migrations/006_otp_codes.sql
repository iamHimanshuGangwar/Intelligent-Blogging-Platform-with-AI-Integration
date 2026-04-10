-- OTP codes table for email-based OTP login
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_otp_codes_email ON otp_codes(email);

-- RLS policies
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Allow API routes to manage OTP codes (using service role)
CREATE POLICY "Allow all operations on otp_codes" ON otp_codes
  FOR ALL USING (true) WITH CHECK (true);

-- Auto-cleanup expired OTPs (optional - run periodically)
-- DELETE FROM otp_codes WHERE expires_at < now();
