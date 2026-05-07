-- ============================================
-- Hey Balkan - Porodica Public Access Hardening
-- ============================================
-- Replaces broad anon table access with narrow SECURITY DEFINER RPCs.
-- Run after add-porodica-tables.sql.
-- ============================================

DROP POLICY IF EXISTS "Anyone can view family member by invite code"
  ON public.family_members;
DROP POLICY IF EXISTS "Anon can read profiles for porodica"
  ON public.profiles;
DROP POLICY IF EXISTS "Anon can create suggestions via invite code"
  ON public.porodica_suggestions;
DROP POLICY IF EXISTS "Anon can view suggestions they created"
  ON public.porodica_suggestions;
DROP POLICY IF EXISTS "Anon can read swipes for porodica"
  ON public.swipes;

CREATE OR REPLACE FUNCTION public.get_porodica_invite(p_invite_code text)
RETURNS TABLE (
  member_id uuid,
  owner_id uuid,
  member_name text,
  relation_type text,
  invite_code text,
  owner_first_name text,
  owner_gender text,
  owner_looking_for text
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    fm.id,
    fm.owner_id,
    fm.name,
    fm.relation_type,
    fm.invite_code,
    p.first_name,
    p.gender,
    p.looking_for
  FROM public.family_members fm
  JOIN public.profiles p ON p.id = fm.owner_id
  WHERE fm.invite_code = p_invite_code
    AND p.onboarding_complete = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_porodica_browse_profiles(
  p_invite_code text,
  p_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  first_name text,
  birth_date date,
  origin_country text,
  city text,
  bio text,
  photos text[]
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  WITH owner_profile AS (
    SELECT
      fm.id AS member_id,
      p.id AS owner_id,
      p.gender AS owner_gender,
      p.looking_for AS owner_looking_for,
      p.preferred_age_min,
      p.preferred_age_max,
      p.preferred_religion,
      p.preferred_origins,
      p.preferred_regions
    FROM public.family_members fm
    JOIN public.profiles p ON p.id = fm.owner_id
    WHERE fm.invite_code = p_invite_code
      AND p.onboarding_complete = true
    LIMIT 1
  )
  SELECT
    p.id,
    p.first_name,
    p.birth_date,
    p.origin_country,
    p.city,
    p.bio,
    p.photos
  FROM public.profiles p
  CROSS JOIN owner_profile owner
  WHERE p.id <> owner.owner_id
    AND p.onboarding_complete = true
    AND NOT EXISTS (
      SELECT 1
      FROM public.porodica_suggestions ps
      WHERE ps.family_member_id = owner.member_id
        AND ps.suggested_profile_id = p.id
    )
    AND NOT EXISTS (
      SELECT 1
      FROM public.swipes s
      WHERE s.swiper_id = owner.owner_id
        AND s.swiped_id = p.id
    )
    AND (
      owner.owner_looking_for IS NULL
      OR owner.owner_looking_for = 'both'
      OR p.gender = owner.owner_looking_for
    )
    AND (
      owner.owner_gender IS NULL
      OR p.looking_for = owner.owner_gender
      OR p.looking_for = 'both'
    )
    AND (
      owner.preferred_religion IS NULL
      OR owner.preferred_religion = 'egal'
      OR p.religion = owner.preferred_religion
    )
    AND (
      COALESCE(array_length(owner.preferred_origins, 1), 0) = 0
      OR p.origin_country = ANY(owner.preferred_origins)
    )
    AND (
      date_part('year', age(p.birth_date))::integer
      BETWEEN COALESCE(owner.preferred_age_min, 18)
      AND COALESCE(owner.preferred_age_max, 99)
    )
    AND (
      COALESCE(array_length(owner.preferred_regions, 1), 0) = 0
      OR p.origin_region IS NULL
      OR p.origin_region = ANY(owner.preferred_regions)
    )
  ORDER BY p.last_active DESC NULLS LAST, p.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 50), 1), 50);
$$;

CREATE OR REPLACE FUNCTION public.create_porodica_suggestion(
  p_invite_code text,
  p_suggested_profile_id uuid,
  p_message text DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_member record;
  v_suggestion_id bigint;
BEGIN
  SELECT id, owner_id
  INTO v_member
  FROM public.family_members
  WHERE invite_code = p_invite_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid invite code' USING ERRCODE = '22023';
  END IF;

  IF p_suggested_profile_id = v_member.owner_id THEN
    RAISE EXCEPTION 'Cannot suggest owner profile' USING ERRCODE = '22023';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = p_suggested_profile_id
      AND onboarding_complete = true
  ) THEN
    RAISE EXCEPTION 'Suggested profile not found' USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.porodica_suggestions (
    family_member_id,
    for_user_id,
    suggested_profile_id,
    message
  )
  VALUES (
    v_member.id,
    v_member.owner_id,
    p_suggested_profile_id,
    NULLIF(trim(p_message), '')
  )
  ON CONFLICT (family_member_id, for_user_id, suggested_profile_id)
  DO UPDATE SET
    message = EXCLUDED.message,
    status = 'pending',
    created_at = now()
  RETURNING id INTO v_suggestion_id;

  RETURN v_suggestion_id;
END;
$$;

REVOKE ALL ON FUNCTION public.get_porodica_invite(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_porodica_browse_profiles(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_porodica_suggestion(text, uuid, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_porodica_invite(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_porodica_browse_profiles(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_porodica_suggestion(text, uuid, text) TO anon, authenticated;
