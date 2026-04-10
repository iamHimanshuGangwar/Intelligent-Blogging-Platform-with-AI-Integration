-- ================================================================
-- 023: Admin Features - Moderation, Career Paths, Settings
-- ================================================================

-- Moderation Queue Table
CREATE TABLE IF NOT EXISTS public.moderation_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'comment', 'profile')),
  content_id TEXT NOT NULL,
  author_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  content_preview TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'flagged', 'removed')),
  reason TEXT,
  flagged_by TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for moderation queue
CREATE INDEX IF NOT EXISTS idx_moderation_status ON public.moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_moderation_type ON public.moderation_queue(content_type);
CREATE INDEX IF NOT EXISTS idx_moderation_created ON public.moderation_queue(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_author ON public.moderation_queue(author_id);

-- Enable RLS
ALTER TABLE public.moderation_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view moderation queue"
  ON public.moderation_queue FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update moderation"
  ON public.moderation_queue FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Career Paths Table
CREATE TABLE IF NOT EXISTS public.career_paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  level TEXT NOT NULL CHECK (level IN ('entry', 'intermediate', 'advanced')),
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Career Path Skills (Many-to-Many)
CREATE TABLE IF NOT EXISTS public.career_path_skills (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  career_path_id UUID NOT NULL REFERENCES public.career_paths(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'beginner' CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for career paths
CREATE INDEX IF NOT EXISTS idx_career_paths_level ON public.career_paths(level);
CREATE INDEX IF NOT EXISTS idx_career_path_skills_path ON public.career_path_skills(career_path_id);

-- Enable RLS
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_path_skills ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view career paths"
  ON public.career_paths FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage career paths"
  ON public.career_paths FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update career paths"
  ON public.career_paths FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete career paths"
  ON public.career_paths FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Same for career_path_skills
CREATE POLICY "Anyone can view career path skills"
  ON public.career_path_skills FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage career path skills"
  ON public.career_path_skills FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB,
  description TEXT,
  updated_by TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON public.admin_settings(setting_key);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy - Only admins can access
CREATE POLICY "Admins can view settings"
  ON public.admin_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update settings"
  ON public.admin_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

-- Comments & Moderation Log
CREATE TABLE IF NOT EXISTS public.moderation_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  reason TEXT,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_moderation_log_admin ON public.moderation_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_moderation_log_created ON public.moderation_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_moderation_log_target ON public.moderation_log(target_type, target_id);

-- Enable RLS
ALTER TABLE public.moderation_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy
CREATE POLICY "Admins can view moderation logs"
  ON public.moderation_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()::text AND role = 'admin'
    )
  );

COMMENT ON TABLE public.moderation_queue IS 'Queue for admin moderation of user-generated content';
COMMENT ON TABLE public.career_paths IS 'Career progression paths available on the platform';
COMMENT ON TABLE public.career_path_skills IS 'Skills associated with career paths';
COMMENT ON TABLE public.admin_settings IS 'Global admin settings and configuration';
COMMENT ON TABLE public.moderation_log IS 'Audit log of moderation actions';
