-- ============================================
-- Hey Balkan - Waitlist Public Access Hardening
-- ============================================
-- Replaces broad anon select/update access with narrow RPCs.
-- Run after supabase-setup.sql.
-- ============================================

DROP POLICY IF EXISTS "Allow anonymous inserts" ON public.waitlist;
DROP POLICY IF EXISTS "Allow anonymous updates by email" ON public.waitlist;
DROP POLICY IF EXISTS "Allow anonymous select" ON public.waitlist;

CREATE OR REPLACE FUNCTION public.join_waitlist(
  p_email text,
  p_origin text DEFAULT NULL,
  p_language text DEFAULT 'de',
  p_referred_by text DEFAULT NULL
)
RETURNS TABLE (
  referral_code text,
  referral_count integer,
  position integer,
  name text,
  bio text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
  v_referrer text := NULLIF(trim(p_referred_by), '');
  v_rows integer := 0;
BEGIN
  IF v_email IS NULL OR v_email = '' OR position('@' in v_email) = 0 THEN
    RAISE EXCEPTION 'Invalid email' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.waitlist (email, origin, language, referred_by)
  VALUES (v_email, NULLIF(trim(p_origin), ''), COALESCE(NULLIF(trim(p_language), ''), 'de'), v_referrer)
  ON CONFLICT (email) DO NOTHING;

  GET DIAGNOSTICS v_rows = ROW_COUNT;

  IF v_rows > 0 AND v_referrer IS NOT NULL THEN
    UPDATE public.waitlist
    SET referral_count = referral_count + 1
    WHERE referral_code = v_referrer
      AND email <> v_email;
  END IF;

  RETURN QUERY
  SELECT
    w.referral_code,
    COALESCE(w.referral_count, 0),
    w.position,
    w.name,
    w.bio
  FROM public.waitlist w
  WHERE w.email = v_email
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_waitlist_entry(p_email text)
RETURNS TABLE (
  referral_code text,
  referral_count integer,
  position integer,
  name text,
  bio text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.referral_code,
    COALESCE(w.referral_count, 0),
    w.position,
    w.name,
    w.bio
  FROM public.waitlist w
  WHERE w.email = lower(trim(p_email))
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.save_waitlist_profile(
  p_email text,
  p_name text,
  p_bio text DEFAULT NULL
)
RETURNS TABLE (
  referral_code text,
  referral_count integer,
  position integer,
  name text,
  bio text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text := lower(trim(p_email));
BEGIN
  IF NULLIF(trim(p_name), '') IS NULL THEN
    RAISE EXCEPTION 'Name is required' USING ERRCODE = '22023';
  END IF;

  UPDATE public.waitlist
  SET
    name = trim(p_name),
    bio = NULLIF(trim(p_bio), '')
  WHERE email = v_email;

  RETURN QUERY
  SELECT
    w.referral_code,
    COALESCE(w.referral_count, 0),
    w.position,
    w.name,
    w.bio
  FROM public.waitlist w
  WHERE w.email = v_email
  LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.join_waitlist(text, text, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_waitlist_entry(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.save_waitlist_profile(text, text, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.join_waitlist(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_waitlist_entry(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_waitlist_profile(text, text, text) TO anon, authenticated;
