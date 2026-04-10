-- Migration: 014_services_pricing_subscriptions.sql
-- Description: Create schema for services, pricing plans, and user subscriptions

-- ============================================================================
-- SERVICES TABLE - Define all available services/features
-- ============================================================================
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT CHECK (category IN ('ai', 'analytics', 'collaboration', 'community', 'content', 'admin')),
  is_active BOOLEAN DEFAULT true,
  order_index INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes on services
CREATE INDEX idx_services_slug ON services(slug);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);

-- ============================================================================
-- PRICING PLANS TABLE - Define subscription tiers
-- ============================================================================
CREATE TABLE pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')) DEFAULT 'monthly',
  order_index INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

-- Indexes on pricing plans
CREATE INDEX idx_pricing_plans_slug ON pricing_plans(slug);
CREATE INDEX idx_pricing_plans_is_active ON pricing_plans(is_active);

-- ============================================================================
-- PLAN FEATURES JUNCTION TABLE - Services included in each plan
-- ============================================================================
CREATE TABLE plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  included BOOLEAN DEFAULT true,
  limit_value INT,
  limit_unit TEXT CHECK (limit_unit IN ('daily', 'monthly', 'yearly', 'unlimited')),
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(plan_id, service_id)
);

-- Indexes on plan features
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_service_id ON plan_features(service_id);

-- ============================================================================
-- USER SUBSCRIPTIONS TABLE - Track what plan each user has
-- ============================================================================
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'paused')) DEFAULT 'pending',
  billing_cycle_start_date DATE,
  billing_cycle_end_date DATE,
  payment_method TEXT CHECK (payment_method IN ('credit_card', 'paypal', 'stripe', 'free')) DEFAULT 'free',
  stripe_subscription_id TEXT UNIQUE,
  auto_renew BOOLEAN DEFAULT true,
  renewal_date DATE,
  cancellation_date TIMESTAMP,
  cancellation_reason TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(user_id, plan_id)
);

-- Indexes on user subscriptions
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_user_subscriptions_renewal_date ON user_subscriptions(renewal_date);

-- ============================================================================
-- USAGE TRACKING TABLE - Track consumption of limited features
-- ============================================================================
CREATE TABLE feature_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  usage_count INT DEFAULT 0,
  reset_date DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, service_id, reset_date)
);

-- Indexes on feature usage
CREATE INDEX idx_feature_usage_subscription_id ON feature_usage(subscription_id);
CREATE INDEX idx_feature_usage_service_id ON feature_usage(service_id);
CREATE INDEX idx_feature_usage_reset_date ON feature_usage(reset_date);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Services: Everyone can read active services
CREATE POLICY "Anyone can read active services" ON services
  FOR SELECT USING (is_active = true);

-- Admins can manage all services
CREATE POLICY "Admins can manage all services" ON services
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Pricing Plans: Everyone can read active plans
CREATE POLICY "Anyone can read active pricing plans" ON pricing_plans
  FOR SELECT USING (is_active = true);

-- Admins can manage pricing plans
CREATE POLICY "Admins can manage pricing plans" ON pricing_plans
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- Plan Features: Everyone can read
CREATE POLICY "Anyone can read plan features" ON plan_features
  FOR SELECT USING (true);

-- Admins can manage plan features
CREATE POLICY "Admins can manage plan features" ON plan_features
  FOR ALL USING (
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- User Subscriptions: Users can see their own, admins can see all
CREATE POLICY "Users can see their own subscriptions" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can update their own subscriptions" ON user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id OR (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin');

-- Feature Usage: Users can see their own, admins can see all
CREATE POLICY "Users can see their own feature usage" ON feature_usage
  FOR SELECT USING (
    (SELECT user_id FROM user_subscriptions WHERE id = subscription_id) = auth.uid() OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'
  );

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert Services
INSERT INTO services (name, slug, description, category, icon, order_index) VALUES
  ('Blog Generation', 'blog-generation', 'Generate blog posts using AI', 'ai', 'feather', 1),
  ('Content Summarization', 'content-summarization', 'Summarize blog posts and content', 'ai', 'type', 2),
  ('Social Analytics', 'social-analytics', 'Track views, likes, and shares', 'analytics', 'bar-chart-2', 3),
  ('Comments & Discussion', 'comments', 'Community discussion boards', 'community', 'message-circle', 4),
  ('Team Collaboration', 'collaboration', 'Work with team members', 'collaboration', 'users', 5),
  ('Advanced Admin Tools', 'admin-tools', 'Full system management', 'admin', 'settings', 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert Pricing Plans
INSERT INTO pricing_plans (name, slug, description, price_monthly, currency, is_popular, billing_period, order_index) VALUES
  ('Free', 'free', 'Get started with AI-powered blogging', 0, 'USD', false, 'monthly', 1),
  ('Pro', 'pro', 'For serious bloggers and content creators', 29, 'USD', true, 'monthly', 2),
  ('Enterprise', 'enterprise', 'Full power for teams and organizations', 89, 'USD', false, 'monthly', 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert Plan Features (Free Plan)
INSERT INTO plan_features (plan_id, service_id, included, limit_value, limit_unit) 
SELECT p.id, s.id, 
  CASE 
    WHEN s.slug IN ('blog-generation', 'comments') THEN true
    ELSE false
  END,
  CASE 
    WHEN s.slug = 'blog-generation' THEN 5
    WHEN s.slug = 'comments' THEN 50
    ELSE NULL
  END,
  CASE 
    WHEN s.slug IN ('blog-generation', 'comments') THEN 'monthly'
    ELSE NULL
  END
FROM pricing_plans p, services s
WHERE p.slug = 'free' AND s.is_active = true
ON CONFLICT (plan_id, service_id) DO NOTHING;

-- Insert Plan Features (Pro Plan)
INSERT INTO plan_features (plan_id, service_id, included, limit_value, limit_unit) 
SELECT p.id, s.id, 
  CASE 
    WHEN s.slug NOT IN ('admin-tools') THEN true
    ELSE false
  END,
  CASE 
    WHEN s.slug = 'blog-generation' THEN 100
    WHEN s.slug = 'content-summarization' THEN 200
    WHEN s.slug = 'comments' THEN 1000
    ELSE NULL
  END,
  CASE 
    WHEN s.slug IN ('blog-generation', 'content-summarization', 'comments') THEN 'monthly'
    ELSE NULL
  END
FROM pricing_plans p, services s
WHERE p.slug = 'pro' AND s.is_active = true
ON CONFLICT (plan_id, service_id) DO NOTHING;

-- Insert Plan Features (Enterprise Plan)
INSERT INTO plan_features (plan_id, service_id, included, limit_value, limit_unit) 
SELECT p.id, s.id, true, NULL, 'unlimited'
FROM pricing_plans p, services s
WHERE p.slug = 'enterprise' AND s.is_active = true
ON CONFLICT (plan_id, service_id) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to check if user has access to a service
CREATE OR REPLACE FUNCTION check_service_access(
  p_user_id UUID,
  p_service_slug TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_has_access BOOLEAN;
BEGIN
  SELECT COALESCE(pf.included, false) INTO v_has_access
  FROM user_subscriptions us
  JOIN pricing_plans pp ON us.plan_id = pp.id
  JOIN plan_features pf ON pp.id = pf.plan_id
  JOIN services s ON pf.service_id = s.id
  WHERE us.user_id = p_user_id
    AND s.slug = p_service_slug
    AND us.status = 'active'
    AND (us.billing_cycle_end_date IS NULL OR us.billing_cycle_end_date >= CURRENT_DATE)
  LIMIT 1;
  
  RETURN COALESCE(v_has_access, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get remaining usage for a service
CREATE OR REPLACE FUNCTION get_remaining_usage(
  p_user_id UUID,
  p_service_slug TEXT
) RETURNS INT AS $$
DECLARE
  v_remaining INT;
  v_limit INT;
BEGIN
  SELECT pf.limit_value INTO v_limit
  FROM user_subscriptions us
  JOIN pricing_plans pp ON us.plan_id = pp.id
  JOIN plan_features pf ON pp.id = pf.plan_id
  JOIN services s ON pf.service_id = s.id
  WHERE us.user_id = p_user_id
    AND s.slug = p_service_slug
    AND us.status = 'active'
  LIMIT 1;
  
  IF v_limit IS NULL THEN
    RETURN 999999; -- Unlimited
  END IF;
  
  SELECT COALESCE(fu.usage_count, 0) INTO v_limit
  FROM feature_usage fu
  JOIN services s ON fu.service_id = s.id
  WHERE s.slug = p_service_slug
    AND fu.reset_date = CURRENT_DATE;
  
  RETURN GREATEST(0, v_limit - COALESCE(v_limit, 0));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
