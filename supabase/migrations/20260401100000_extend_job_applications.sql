-- Ensure job_listings table exists (dependency for job_applications)
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  description TEXT,
  salary_range TEXT,
  job_type TEXT CHECK (job_type IN ('full-time', 'part-time', 'contract', 'freelance', 'internship')) DEFAULT 'full-time',
  experience_level TEXT CHECK (experience_level IN ('entry', 'mid', 'senior', 'lead', 'executive')) DEFAULT 'mid',
  required_skills TEXT[] DEFAULT '{}',
  posted_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  posted_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  expires_at TIMESTAMPTZ,
  source TEXT DEFAULT 'platform'
);

-- Ensure job_applications table exists
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE,
  cover_letter TEXT,
  status TEXT CHECK (status IN ('applied', 'shortlisted', 'interviewed', 'rejected', 'offered', 'accepted')) DEFAULT 'applied',
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add missing columns to job_applications for external/mock job support
DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS external_job_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_name TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_email TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS applicant_phone TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS resume_url TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS external_job_title TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS external_company_name TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- Make job_id nullable so we can store external-only applications
DO $$ BEGIN
  ALTER TABLE public.job_applications ALTER COLUMN job_id DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Index for external job lookups
CREATE INDEX IF NOT EXISTS idx_job_applications_external_id ON public.job_applications(external_job_id) WHERE external_job_id IS NOT NULL;

-- Allow unique constraint on user + external_job_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_applications_user_external ON public.job_applications(user_id, external_job_id) WHERE external_job_id IS NOT NULL;
