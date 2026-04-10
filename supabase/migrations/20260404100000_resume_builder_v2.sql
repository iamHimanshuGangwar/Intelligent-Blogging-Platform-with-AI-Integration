-- Resume Builder V2 - Professional ATS-friendly resume system
-- Adds resume_files table for storing exported files, 
-- adds template/theme/ats_score columns to user_resumes,
-- adds admin visibility policies

-- 1) Add template, color theme, ATS score, and visibility columns to user_resumes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_resumes' AND column_name='template') THEN
    ALTER TABLE public.user_resumes ADD COLUMN template TEXT DEFAULT 'classic';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_resumes' AND column_name='color_theme') THEN
    ALTER TABLE public.user_resumes ADD COLUMN color_theme TEXT DEFAULT 'slate';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_resumes' AND column_name='ats_score') THEN
    ALTER TABLE public.user_resumes ADD COLUMN ats_score INTEGER DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_resumes' AND column_name='full_name') THEN
    ALTER TABLE public.user_resumes ADD COLUMN full_name TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_resumes' AND column_name='target_role') THEN
    ALTER TABLE public.user_resumes ADD COLUMN target_role TEXT;
  END IF;
END $$;

-- 2) Resume files table - stores exported PDF/DOC/PNG files
CREATE TABLE IF NOT EXISTS public.resume_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_id UUID REFERENCES public.user_resumes(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'doc', 'png', 'jpg', 'html', 'txt', 'json')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_resume_files_user_id ON public.resume_files(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_files_resume_id ON public.resume_files(resume_id);

-- 3) RLS for resume_files
ALTER TABLE public.resume_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own resume files' AND tablename = 'resume_files') THEN
    CREATE POLICY "Users can view their own resume files" ON public.resume_files
      FOR SELECT USING (auth.uid()::text = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own resume files' AND tablename = 'resume_files') THEN
    CREATE POLICY "Users can insert their own resume files" ON public.resume_files
      FOR INSERT WITH CHECK (auth.uid()::text = user_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own resume files' AND tablename = 'resume_files') THEN
    CREATE POLICY "Users can delete their own resume files" ON public.resume_files
      FOR DELETE USING (auth.uid()::text = user_id);
  END IF;
END $$;

-- 4) Admin policies - allow admins to view all resumes and files
-- Using a function to check admin role from profiles
CREATE OR REPLACE FUNCTION public.is_admin_user(check_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = check_user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin can view all resumes
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all resumes' AND tablename = 'user_resumes') THEN
    CREATE POLICY "Admins can view all resumes" ON public.user_resumes
      FOR SELECT USING (public.is_admin_user(auth.uid()::text));
  END IF;
END $$;

-- Admin can view all resume files
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all resume files' AND tablename = 'resume_files') THEN
    CREATE POLICY "Admins can view all resume files" ON public.resume_files
      FOR SELECT USING (public.is_admin_user(auth.uid()::text));
  END IF;
END $$;
