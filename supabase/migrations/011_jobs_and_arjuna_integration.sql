-- ================================================================
-- JOBS AND ARJUNA INTEGRATION
-- ================================================================

-- 1. Job Listings Table (from Arjuna API or manual entry)
CREATE TABLE IF NOT EXISTS public.job_listings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  external_id TEXT UNIQUE, -- ID from Arjuna API
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  job_type TEXT, -- 'full-time', 'part-time', 'contract', 'remote'
  salary_min INTEGER,
  salary_max INTEGER,
  currency TEXT DEFAULT 'USD',
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_level TEXT, -- 'entry', 'mid', 'senior', 'lead'
  posted_at TIMESTAMPTZ,
  application_deadline TIMESTAMPTZ,
  status TEXT CHECK (status IN ('open', 'filled', 'closed')) DEFAULT 'open',
  arjuna_url TEXT, -- Direct link to job posting
  company_logo_url TEXT,
  source TEXT DEFAULT 'arjuna', -- 'arjuna', 'manual', etc
  days_open INTEGER, -- Calculated field: days since posted
  applications_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Indexes for job listings
CREATE INDEX IF NOT EXISTS idx_job_listings_company ON public.job_listings(company_name);
CREATE INDEX IF NOT EXISTS idx_job_listings_status ON public.job_listings(status);
CREATE INDEX IF NOT EXISTS idx_job_listings_location ON public.job_listings(location);
CREATE INDEX IF NOT EXISTS idx_job_listings_posted ON public.job_listings(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_listings_skills ON public.job_listings USING GIN (required_skills);

-- 3. User Job Applications
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES public.job_listings(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  cover_letter TEXT,
  status TEXT CHECK (status IN ('applied', 'shortlisted', 'interviewed', 'rejected', 'offered', 'accepted')) DEFAULT 'applied',
  applied_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, job_id)
);

-- 4. Indexes for applications
CREATE INDEX IF NOT EXISTS idx_job_applications_user ON public.job_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_job ON public.job_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON public.job_applications(status);

-- 5. Subscription Plans & User Subscriptions
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL, -- 'Contributor', 'Professional', 'Elite'
  description TEXT,
  price_monthly DECIMAL(10, 2),
  price_annual DECIMAL(10, 2),
  features TEXT[] DEFAULT ARRAY[]::TEXT[],
  max_posts INTEGER, -- null for unlimited
  max_job_applications INTEGER,
  resume_limit INTEGER,
  ai_credits_monthly INTEGER,
  priority_support BOOLEAN DEFAULT false,
  analytics BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE RESTRICT NOT NULL,
  status TEXT CHECK (status IN ('active', 'cancelled', 'expired')) DEFAULT 'active',
  payment_method TEXT, -- 'stripe', 'paypal', etc
  stripe_subscription_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  ends_at TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id)
);

-- 7. Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan ON public.user_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);

-- 8. Analytics Events (views, clicks, likes, subscriptions)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'blog_view', 'job_click', 'job_apply', 'subscribe', 'resume_view'
  event_data JSONB, -- Flexible data storage
  source TEXT, -- 'web', 'mobile', 'email', 'api'
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 9. Indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at DESC);

-- 10. Function to calculate days_open for jobs
CREATE OR REPLACE FUNCTION public.calculate_job_days_open()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.posted_at IS NOT NULL THEN
    NEW.days_open = EXTRACT(DAY FROM now() - NEW.posted_at)::INTEGER;
  END IF;
  RETURN NEW;
END;
$$;

-- 11. Trigger to calculate days_open
DROP TRIGGER IF EXISTS trigger_calculate_job_days_open ON public.job_listings;
CREATE TRIGGER trigger_calculate_job_days_open
BEFORE INSERT OR UPDATE ON public.job_listings
FOR EACH ROW EXECUTE FUNCTION public.calculate_job_days_open();

-- 12. Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_monthly, price_annual, features, max_posts, max_job_applications, resume_limit, ai_credits_monthly, priority_support, analytics) VALUES
('Contributor', 'Perfect for starting the digital narrative', 0, 0, ARRAY['Basic AI assistance', '3 posts per month', 'Community access'], 3, 10, 1, 5, false, false),
('Professional', 'For serious writers building a lasting brand', 29.00, 261.00, ARRAY['Advanced AI editing tools', 'Unlimited monthly posts', 'Career tracking insights', 'Real-time analytics dashboard'], NULL, 50, 5, 100, true, true),
('Elite', 'The ultimate ecosystem for industry authorities', 89.00, 801.00, ARRAY['Priority AI generation queue', 'Custom SEO strategy engine', '1-1 mentor sessions', 'Full API developer access'], NULL, NULL, NULL, 500, true, true)
ON CONFLICT DO NOTHING;

-- 13. RLS Policies
ALTER TABLE public.job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can view open job listings
CREATE POLICY "Anyone can view open jobs" 
  ON public.job_listings 
  FOR SELECT 
  USING (status = 'open');

-- Users can view their own applications
CREATE POLICY "Users can view their own applications"
  ON public.job_applications
  FOR SELECT
  USING (user_id = current_user_id() OR current_setting('role') = 'admin');

-- Users can create job applications
CREATE POLICY "Users can create applications"
  ON public.job_applications
  FOR INSERT
  WITH CHECK (true);

-- Anyone can view subscription plans
CREATE POLICY "Anyone can view plans"
  ON public.subscription_plans
  FOR SELECT
  USING (true);

-- Users can view their own subscription
CREATE POLICY "Users can view their subscription"
  ON public.user_subscriptions
  FOR SELECT
  USING (user_id = current_user_id() OR current_setting('role') = 'admin');

-- Admin can manage subscriptions
CREATE POLICY "Admin can manage subscriptions"
  ON public.user_subscriptions
  FOR ALL
  USING (current_setting('role') = 'admin');

-- Users can log analytics events
CREATE POLICY "Users can log events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Users can view their own analytics
CREATE POLICY "Users can view their analytics"
  ON public.analytics_events
  FOR SELECT
  USING (user_id = current_user_id() OR current_setting('role') = 'admin');

-- Done
COMMENT ON TABLE public.job_listings IS 'Job listings from Arjuna API or manual entry';
COMMENT ON TABLE public.job_applications IS 'User applications to job listings';
COMMENT ON TABLE public.subscription_plans IS 'Available subscription tiers';
COMMENT ON TABLE public.user_subscriptions IS 'User subscription records';
COMMENT ON TABLE public.analytics_events IS 'System-wide analytics and tracking';
