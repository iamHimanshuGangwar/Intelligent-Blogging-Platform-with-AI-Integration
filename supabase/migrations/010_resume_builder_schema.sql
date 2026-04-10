-- ================================================================
-- RESUME BUILDER FEATURE
-- ================================================================

-- 1. Resumes table - stores user resumes
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  template_style TEXT DEFAULT 'modern', -- modern, classic, creative, minimal
  summary TEXT,
  
  -- Contact Info
  email TEXT,
  phone TEXT,
  location TEXT,
  website_url TEXT,
  linkedin_url TEXT,
  
  -- Metadata
  is_public BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(user_id, is_default) -- Only one default resume per user
);

-- 2. Resume experiences - work experience entries
CREATE TABLE IF NOT EXISTS public.resume_experiences (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_url TEXT,
  employment_type TEXT, -- full-time, part-time, contract, etc
  location TEXT,
  
  start_date DATE NOT NULL,
  end_date DATE,
  currently_working BOOLEAN DEFAULT false,
  
  description TEXT, -- Rich text description of responsibilities
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Resume education entries
CREATE TABLE IF NOT EXISTS public.resume_education (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  
  school_name TEXT NOT NULL,
  degree TEXT NOT NULL,
  field_of_study TEXT,
  
  start_date DATE,
  end_date DATE,
  
  grade TEXT,
  description TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Resume skills
CREATE TABLE IF NOT EXISTS public.resume_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  
  skill_name TEXT NOT NULL,
  proficiency_level TEXT CHECK (proficiency_level IN ('Beginner', 'Intermediate', 'Advanced', 'Expert')),
  endorsements_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Resume projects
CREATE TABLE IF NOT EXISTS public.resume_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  
  project_name TEXT NOT NULL,
  description TEXT,
  project_url TEXT,
  
  start_date DATE,
  end_date DATE,
  
  technologies TEXT[], -- Array of tech stack
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Resume certifications
CREATE TABLE IF NOT EXISTS public.resume_certifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  
  certification_name TEXT NOT NULL,
  issuing_organization TEXT NOT NULL,
  
  issue_date DATE,
  expiry_date DATE,
  credential_url TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Resume downloads/exports log
CREATE TABLE IF NOT EXISTS public.resume_downloads (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
  
  downloaded_by_user_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  format TEXT CHECK (format IN ('pdf', 'docx', 'json')),
  
  downloaded_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_public ON public.resumes(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_resume_exp_resume ON public.resume_experiences(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_edu_resume ON public.resume_education(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_skills_resume ON public.resume_skills(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_projects_resume ON public.resume_projects(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_certs_resume ON public.resume_certifications(resume_id);

-- 9. Enable RLS
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_downloads ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies - Allow users to view own resumes and public resumes
CREATE POLICY "Users can view own resumes" ON public.resumes
  FOR SELECT USING (user_id = current_user_id() OR is_public = true);

CREATE POLICY "Users can create resumes" ON public.resumes
  FOR INSERT WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can edit own resumes" ON public.resumes
  FOR UPDATE USING (user_id = current_user_id())
  WITH CHECK (user_id = current_user_id());

CREATE POLICY "Users can delete own resumes" ON public.resumes
  FOR DELETE USING (user_id = current_user_id());

-- Same policies for all resume sections
CREATE POLICY "Experiences access" ON public.resume_experiences
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE id = resume_id 
    AND (user_id = current_user_id() OR is_public = true)
  ));

CREATE POLICY "Education access" ON public.resume_education
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE id = resume_id 
    AND (user_id = current_user_id() OR is_public = true)
  ));

CREATE POLICY "Skills access" ON public.resume_skills
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE id = resume_id 
    AND (user_id = current_user_id() OR is_public = true)
  ));

CREATE POLICY "Projects access" ON public.resume_projects
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE id = resume_id 
    AND (user_id = current_user_id() OR is_public = true)
  ));

CREATE POLICY "Certifications access" ON public.resume_certifications
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.resumes 
    WHERE id = resume_id 
    AND (user_id = current_user_id() OR is_public = true)
  ));

-- Done
COMMENT ON TABLE public.resumes IS 'Stores AiBlog resume builder data';
