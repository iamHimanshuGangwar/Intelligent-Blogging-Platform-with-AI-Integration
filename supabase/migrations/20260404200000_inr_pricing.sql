-- Convert subscription plan prices from USD to INR.
-- Uses UPSERT so plans are always seeded even on a fresh database.

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS currency TEXT NOT NULL DEFAULT 'INR';

INSERT INTO public.subscription_plans
  (name, description, price_monthly, price_annual, currency, features)
VALUES
  (
    'Contributor',
    'Perfect for starting the digital narrative',
    0, 0, 'INR',
    ARRAY['Basic AI assistance', '3 posts per month', 'Community access']
  ),
  (
    'Professional',
    'For serious writers building a lasting brand',
    299, 999, 'INR',
    ARRAY['Advanced AI editing tools', 'Unlimited monthly posts', 'Career tracking insights', 'Real-time analytics dashboard']
  ),
  (
    'Elite',
    'The ultimate ecosystem for industry authorities',
    699, 1599, 'INR',
    ARRAY['Priority AI generation queue', 'Custom SEO strategy engine', '1-1 mentor sessions', 'Full API developer access']
  )
ON CONFLICT (name) DO UPDATE SET
  price_monthly = EXCLUDED.price_monthly,
  price_annual  = EXCLUDED.price_annual,
  currency      = EXCLUDED.currency;
