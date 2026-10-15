-- ==============================================================================
-- CodeHelio Templates Database Schema & Supabase Configuration
-- File: codehelio-templates.sql
-- Description:
--   - User Profiles & Roles (admin, creator, ch_user, user)
--   - Row Level Security (RLS) on all tables
--   - Automated trigger for auth.users -> public.profiles
--   - Templates Catalog (Price USD & LKR, Hotel, Hospital, Ecommerce, Supermarket, etc.)
--   - Template Applications with OTP verification tracking
--   - Membership payments (LKR 600 / USD 1.82 for CH_USER upgrade)
--   - Built-in Inbuilt Admin / Creator initialization & seeding
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. User Profiles Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'creator', 'ch_user', 'user')),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  paid_amount NUMERIC(10, 2) DEFAULT 0.00,
  paid_currency TEXT DEFAULT 'LKR',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. Templates Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'Hotel',
    'Hospital',
    'Ecommerce',
    'Supermarket',
    'Restaurant',
    'Salon & spa',
    'Real estate',
    'Portfolio'
  )),
  blurb TEXT NOT NULL,
  pages TEXT NOT NULL,
  accent TEXT NOT NULL DEFAULT '#027cc7',
  layout TEXT NOT NULL DEFAULT 'split' CHECK (layout IN ('split', 'center', 'grid')),
  demo_url TEXT NOT NULL,
  price_usd NUMERIC(10, 2) NOT NULL DEFAULT 89.00,
  price_lkr NUMERIC(10, 2) NOT NULL DEFAULT 29370.00,
  image_url TEXT,
  badge TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. Template Applications Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.template_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_code TEXT UNIQUE NOT NULL,
  template_slug TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  domain TEXT,
  notes TEXT,
  otp_verified BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. Membership Payments Table (LKR 600 / USD 1.82)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.membership_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL DEFAULT 600.00,
  currency TEXT NOT NULL DEFAULT 'LKR',
  payment_method TEXT DEFAULT 'Card/PayHere',
  transaction_ref TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. OTP Verifications Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_used BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for high-performance lookup
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates(slug);
CREATE INDEX IF NOT EXISTS idx_applications_client_code ON public.template_applications(client_code);
CREATE INDEX IF NOT EXISTS idx_otp_email_code ON public.otp_verifications(email, code);

-- ==============================================================================
-- 7. Automated Updated At Trigger Function
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_current_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

DROP TRIGGER IF EXISTS trigger_set_templates_updated_at ON public.templates;
CREATE TRIGGER trigger_set_templates_updated_at
BEFORE UPDATE ON public.templates
FOR EACH ROW EXECUTE FUNCTION public.set_current_timestamp_updated_at();

-- ==============================================================================
-- 8. Automated Trigger: auth.users -> public.profiles
-- When a user signs up via Supabase Auth, automatically create their profile row!
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role TEXT := 'user';
BEGIN
  -- If email matches the in-built admin or creator, assign appropriate role
  IF NEW.email = 'admin@codehelio.com' THEN
    default_role := 'admin';
  ELSIF NEW.email = 'creator@codehelio.com' THEN
    default_role := 'creator';
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    is_paid
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    default_role,
    (default_role IN ('admin', 'creator'))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 9. Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;

-- Security Helper Functions
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin_or_creator()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'creator')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_ch_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('ch_user', 'admin', 'creator')
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 9.1 Profiles Policies
-- ------------------------------------------------------------------------------
-- Anyone authenticated can read their own profile; Admins can read all profiles.
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- Users can update their own details (name, phone); Admins can update any profile (including role).
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (
  -- Normal users cannot escalate their own role directly via client update
  (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()))
  OR public.is_admin()
);

-- ------------------------------------------------------------------------------
-- 9.2 Templates Policies
-- ------------------------------------------------------------------------------
-- Anyone (including unauthenticated visitors) can view active templates
DROP POLICY IF EXISTS "Public can view active templates" ON public.templates;
CREATE POLICY "Public can view active templates"
ON public.templates FOR SELECT
USING (is_active = TRUE OR public.is_admin_or_creator());

-- Only Admin and Creator can INSERT templates
DROP POLICY IF EXISTS "Admin and Creator can insert templates" ON public.templates;
CREATE POLICY "Admin and Creator can insert templates"
ON public.templates FOR INSERT
WITH CHECK (public.is_admin_or_creator());

-- Only Admin and Creator can UPDATE templates
DROP POLICY IF EXISTS "Admin and Creator can update templates" ON public.templates;
CREATE POLICY "Admin and Creator can update templates"
ON public.templates FOR UPDATE
USING (public.is_admin_or_creator())
WITH CHECK (public.is_admin_or_creator());

-- Only Admin can DELETE templates
DROP POLICY IF EXISTS "Only admin can delete templates" ON public.templates;
CREATE POLICY "Only admin can delete templates"
ON public.templates FOR DELETE
USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9.3 Template Applications Policies
-- ------------------------------------------------------------------------------
-- Only ch_user, admin, or creator can INSERT applications
DROP POLICY IF EXISTS "CH_USER can apply for templates" ON public.template_applications;
CREATE POLICY "CH_USER can apply for templates"
ON public.template_applications FOR INSERT
WITH CHECK (
  auth.uid() IS NOT NULL AND (public.is_ch_user() OR public.is_admin_or_creator())
);

-- Users can view their own applications; Admins can view all applications
DROP POLICY IF EXISTS "Users can view own applications" ON public.template_applications;
CREATE POLICY "Users can view own applications"
ON public.template_applications FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

-- Only Admins can update application status
DROP POLICY IF EXISTS "Admins can update application status" ON public.template_applications;
CREATE POLICY "Admins can update application status"
ON public.template_applications FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 9.4 Membership Payments Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own payments" ON public.membership_payments;
CREATE POLICY "Users can view own payments"
ON public.membership_payments FOR SELECT
USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Authenticated users can insert payments" ON public.membership_payments;
CREATE POLICY "Authenticated users can insert payments"
ON public.membership_payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 9.5 OTP Verifications Policies
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Service role manages OTPs" ON public.otp_verifications;
CREATE POLICY "Service role manages OTPs"
ON public.otp_verifications FOR ALL
USING (TRUE)
WITH CHECK (TRUE);

-- ==============================================================================
-- 10. Upgrade to CH_USER Function (LKR 600 / USD 1.82)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.upgrade_to_ch_user(
  p_user_id UUID,
  p_amount NUMERIC DEFAULT 600.00,
  p_currency TEXT DEFAULT 'LKR',
  p_tx_ref TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_current_role TEXT;
BEGIN
  -- Verify caller is updating themselves or is admin
  IF auth.uid() <> p_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized to upgrade user membership.';
  END IF;

  SELECT role INTO v_current_role FROM public.profiles WHERE id = p_user_id;

  -- Only upgrade if not already admin or creator
  IF v_current_role IN ('admin', 'creator') THEN
    RETURN json_build_object('success', true, 'message', 'User already has higher role.', 'role', v_current_role);
  END IF;

  -- Record payment
  INSERT INTO public.membership_payments (
    user_id,
    amount,
    currency,
    transaction_ref,
    status
  ) VALUES (
    p_user_id,
    p_amount,
    p_currency,
    COALESCE(p_tx_ref, 'TXN-' || floor(random() * 899999 + 100000)::text),
    'completed'
  );

  -- Upgrade profile role
  UPDATE public.profiles
  SET role = 'ch_user',
      is_paid = TRUE,
      paid_amount = p_amount,
      paid_currency = p_currency,
      paid_at = NOW()
  WHERE id = p_user_id;

  RETURN json_build_object(
    'success', true,
    'message', 'User upgraded to CH_USER successfully.',
    'role', 'ch_user'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 11. Initial Seeding: Templates Catalog (USD and LKR)
-- ==============================================================================
INSERT INTO public.templates (
  slug, name, category, blurb, pages, accent, layout, demo_url, price_usd, price_lkr, badge
) VALUES
(
  'grand-azure-resort',
  'Grand Azure Luxury Resort',
  'Hotel',
  'Room suites booking, virtual tour, amenities showcase, and instant reservation inquiry.',
  'Home, Rooms & Suites, Dining, Spa, Booking, Contact',
  '#027cc7',
  'split',
  'https://demo.codehelio.com/grand-azure',
  99.00,
  32670.00,
  'Popular'
),
(
  'carepoint-hospital',
  'CarePoint Super Speciality',
  'Hospital',
  'Doctor profiles, OPD schedule, online appointments, emergency hotline, and patient portal.',
  'Home, Doctors, Departments, Appointments, Emergency, Contact',
  '#0f766e',
  'grid',
  'https://demo.codehelio.com/carepoint',
  89.00,
  29370.00,
  'Healthcare'
),
(
  'cartwell-store',
  'Cartwell Fashion & Goods',
  'Ecommerce',
  'Modern product catalog, instant cart drawer, secure checkout flow, and discount coupons.',
  'Home, Shop, Collections, Product Details, Cart, Checkout',
  '#7c3aed',
  'center',
  'https://demo.codehelio.com/cartwell',
  119.00,
  39270.00,
  'Best Seller'
),
(
  'freshmart-market',
  'FreshMart Express',
  'Supermarket',
  'Daily grocery discounts, category aisles, fresh produce orders, and same-day delivery slots.',
  'Home, Aisles, Fresh Produce, Weekly Deals, Quick Order, Contact',
  '#16a34a',
  'grid',
  'https://demo.codehelio.com/freshmart',
  109.00,
  35970.00,
  'Fresh Deals'
),
(
  'saffron-table',
  'Saffron Table Fine Dine',
  'Restaurant',
  'Online table reservations, curated multi-course menu, and appetizing culinary gallery.',
  'Home, Menu, Reservations, Private Events, Gallery, Contact',
  '#c2410c',
  'split',
  'https://demo.codehelio.com/saffron-table',
  79.00,
  26070.00,
  NULL
),
(
  'studio-lune',
  'Studio Lune Wellness Spa',
  'Salon & spa',
  'Service menu with transparent pricing, stylist portfolios, and easy calendar bookings.',
  'Home, Services, Team, Online Booking, Pricing, Contact',
  '#be5b86',
  'center',
  'https://demo.codehelio.com/studio-lune',
  69.00,
  22770.00,
  NULL
),
(
  'keystone-homes',
  'Keystone Luxury Realty',
  'Real estate',
  'Property search filters, high-resolution photo galleries, agent direct contact, and map pins.',
  'Home, Featured Listings, Properties, Virtual Tours, Contact',
  '#1d4ed8',
  'grid',
  'https://demo.codehelio.com/keystone-homes',
  129.00,
  42570.00,
  NULL
),
(
  'folio-creative',
  'Folio Creator Studio',
  'Portfolio',
  'Minimalist, blazing-fast personal brand portfolio for agencies, designers, and engineers.',
  'Home, Case Studies, Projects, About, Resume, Contact',
  '#0ea5e9',
  'split',
  'https://demo.codehelio.com/folio',
  49.00,
  16170.00,
  NULL
)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    price_usd = EXCLUDED.price_usd,
    price_lkr = EXCLUDED.price_lkr,
    category = EXCLUDED.category,
    blurb = EXCLUDED.blurb;
