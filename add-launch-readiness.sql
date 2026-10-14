-- ============================================
-- Hey Balkan - Launch Readiness
-- ============================================
-- Melden & Blockieren, Konto loeschen, 18+-Pruefung,
-- Selfie-Verifizierung und Haertung des Foto-Storage.
-- Run after harden-porodica-public-access.sql.
-- Idempotent: kann gefahrlos mehrfach laufen.
-- ============================================

-- ============================================
-- 0. Migrations-Tracking nicht oeffentlich lesbar/schreibbar
-- ============================================
DO $$
BEGIN
  IF to_regclass('public._migrations') IS NOT NULL THEN
    ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE public._migrations FROM anon, authenticated;
  END IF;
END $$;

-- ============================================
-- 1. BLOCKIEREN
-- ============================================
CREATE TABLE IF NOT EXISTS public.blocks (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  blocker_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  blocked_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON public.blocks(blocked_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'blocks_not_self' AND conrelid = 'public.blocks'::regclass
  ) THEN
    ALTER TABLE public.blocks
      ADD CONSTRAINT blocks_not_self CHECK (blocker_id <> blocked_id) NOT VALID;
  END IF;
END $$;

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their blocks" ON public.blocks;
CREATE POLICY "Users can view their blocks"
  ON public.blocks FOR SELECT
  TO authenticated
  USING (auth.uid() = blocker_id);

DROP POLICY IF EXISTS "Users can create blocks" ON public.blocks;
CREATE POLICY "Users can create blocks"
  ON public.blocks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = blocker_id AND blocked_id <> auth.uid());

DROP POLICY IF EXISTS "Users can delete their blocks" ON public.blocks;
CREATE POLICY "Users can delete their blocks"
  ON public.blocks FOR DELETE
  TO authenticated
  USING (auth.uid() = blocker_id);

-- Prueft in beide Richtungen, ob zwischen dem aktuellen User und p_other
-- eine Blockierung besteht. SECURITY DEFINER, weil der Blockierte die
-- Block-Zeile selbst nicht lesen darf.
CREATE OR REPLACE FUNCTION public.is_blocked_with(p_other uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.blocks b
    WHERE (b.blocker_id = auth.uid() AND b.blocked_id = p_other)
       OR (b.blocker_id = p_other AND b.blocked_id = auth.uid())
  );
$$;

REVOKE ALL ON FUNCTION public.is_blocked_with(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_blocked_with(uuid) TO authenticated;

-- Blockierte Profile sind fuer beide Seiten unsichtbar
-- (Discover, Matches, Chat, Porodica-Vorschlaege).
DROP POLICY IF EXISTS "Hide blocked profiles" ON public.profiles;
CREATE POLICY "Hide blocked profiles"
  ON public.profiles
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR NOT public.is_blocked_with(id));

-- Matches mit blockierten Usern verschwinden. Nachrichten haengen per
-- Policy am Match und sind damit ebenfalls weder lesbar noch schreibbar.
DROP POLICY IF EXISTS "Hide matches with blocked users" ON public.matches;
CREATE POLICY "Hide matches with blocked users"
  ON public.matches
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    NOT public.is_blocked_with(
      CASE WHEN matches.user1_id = auth.uid() THEN matches.user2_id ELSE matches.user1_id END
    )
  );

-- Ein Match darf nur bei gegenseitigem Like und ohne Blockierung entstehen.
DROP POLICY IF EXISTS "Matches require mutual like" ON public.matches;
CREATE POLICY "Matches require mutual like"
  ON public.matches
  AS RESTRICTIVE
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (auth.uid() = matches.user1_id OR auth.uid() = matches.user2_id)
    AND matches.user1_id <> matches.user2_id
    AND NOT public.is_blocked_with(
      CASE WHEN matches.user1_id = auth.uid() THEN matches.user2_id ELSE matches.user1_id END
    )
    AND EXISTS (
      SELECT 1 FROM public.swipes s
      WHERE s.swiper_id = matches.user1_id
        AND s.swiped_id = matches.user2_id
        AND s.action IN ('like', 'super_like')
    )
    AND EXISTS (
      SELECT 1 FROM public.swipes s
      WHERE s.swiper_id = matches.user2_id
        AND s.swiped_id = matches.user1_id
        AND s.action IN ('like', 'super_like')
    )
  );

DROP POLICY IF EXISTS "Hide suggestions of blocked users" ON public.porodica_suggestions;
CREATE POLICY "Hide suggestions of blocked users"
  ON public.porodica_suggestions
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (NOT public.is_blocked_with(porodica_suggestions.suggested_profile_id));

-- ============================================
-- 2. MELDEN
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id uuid DEFAULT auth.uid() REFERENCES public.profiles(id) ON DELETE SET NULL,
  reported_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  match_id bigint REFERENCES public.matches(id) ON DELETE SET NULL,
  context text NOT NULL DEFAULT 'other'
    CHECK (context IN ('discover', 'match', 'chat', 'other')),
  reason text NOT NULL
    CHECK (reason IN ('fake_profile', 'inappropriate_content', 'harassment', 'spam_scam', 'underage', 'other')),
  details text CHECK (char_length(details) <= 1000),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'in_review', 'resolved', 'dismissed')),
  admin_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_reports_reported ON public.reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status, created_at);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- User duerfen nur melden, nicht lesen oder bearbeiten.
-- Moderation laeuft im Supabase Dashboard (Table Editor -> reports).
DROP POLICY IF EXISTS "Users can create reports" ON public.reports;
CREATE POLICY "Users can create reports"
  ON public.reports FOR INSERT
  TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
    AND reported_id IS NOT NULL
    AND reported_id <> auth.uid()
    AND status = 'open'
    AND admin_note IS NULL
    AND reviewed_at IS NULL
  );

-- ============================================
-- 3. PORODICA: blockierte Profile ausschliessen
-- ============================================
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
      FROM public.blocks b
      WHERE (b.blocker_id = owner.owner_id AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = owner.owner_id)
    )
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
  ) OR EXISTS (
    SELECT 1
    FROM public.blocks b
    WHERE (b.blocker_id = v_member.owner_id AND b.blocked_id = p_suggested_profile_id)
       OR (b.blocker_id = p_suggested_profile_id AND b.blocked_id = v_member.owner_id)
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

REVOKE ALL ON FUNCTION public.get_porodica_browse_profiles(text, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_porodica_suggestion(text, uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_porodica_browse_profiles(text, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_porodica_suggestion(text, uuid, text) TO anon, authenticated;

-- ============================================
-- 4. 18+ PRUEFUNG
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_min_age_18' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_min_age_18
      CHECK (
        birth_date <= (current_date - interval '18 years')::date
        AND birth_date >= date '1900-01-01'
      ) NOT VALID;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE NOT (
      birth_date <= (current_date - interval '18 years')::date
      AND birth_date >= date '1900-01-01'
    )
  ) THEN
    RAISE NOTICE 'profiles_min_age_18: bestehende Profile unter 18 gefunden. Der Constraint gilt fuer neue und geaenderte Profile, bestehende bitte manuell pruefen.';
  ELSE
    ALTER TABLE public.profiles VALIDATE CONSTRAINT profiles_min_age_18;
  END IF;
END $$;

-- ============================================
-- 5. SELFIE-VERIFIZIERUNG
-- ============================================
-- Ablauf: User laedt Selfie in den privaten Bucket "verifications"
-- (Ordner = eigene User-ID) und ruft request_verification() auf.
-- Freigabe manuell im Supabase Dashboard:
--   profiles.verification_status von 'pending' auf 'verified' oder 'rejected'.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS verification_submitted_at timestamptz,
  ADD COLUMN IF NOT EXISTS verification_reviewed_at timestamptz;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_verification_status_check' AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_verification_status_check
      CHECK (verification_status IN ('none', 'pending', 'verified', 'rejected'));
  END IF;
END $$;

-- Ohne Verifizierungsprozess gesetzte Haken sind nicht belastbar.
UPDATE public.profiles
SET is_verified = false
WHERE is_verified = true
  AND verification_status <> 'verified';

-- User duerfen ihren Verifizierungsstatus nie selbst setzen.
-- Aenderungen durch die Rollen anon/authenticated werden verworfen;
-- Dashboard (postgres) und SECURITY-DEFINER-RPCs duerfen.
CREATE OR REPLACE FUNCTION public.protect_profile_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF current_user IN ('anon', 'authenticated') THEN
    IF TG_OP = 'INSERT' THEN
      NEW.verification_status := 'none';
      NEW.verification_submitted_at := NULL;
      NEW.verification_reviewed_at := NULL;
    ELSE
      NEW.verification_status := OLD.verification_status;
      NEW.verification_submitted_at := OLD.verification_submitted_at;
      NEW.verification_reviewed_at := OLD.verification_reviewed_at;
    END IF;
  ELSIF TG_OP = 'UPDATE'
    AND NEW.verification_status IS DISTINCT FROM OLD.verification_status
    AND NEW.verification_status IN ('verified', 'rejected') THEN
    NEW.verification_reviewed_at := now();
  END IF;

  NEW.is_verified := (NEW.verification_status = 'verified');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_verification ON public.profiles;
CREATE TRIGGER protect_profile_verification
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_verification();

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verifications',
  'verifications',
  false,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Users can upload own verification selfie" ON storage.objects;
CREATE POLICY "Users can upload own verification selfie"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can view own verification selfie" ON storage.objects;
CREATE POLICY "Users can view own verification selfie"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete own verification selfie" ON storage.objects;
CREATE POLICY "Users can delete own verification selfie"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'verifications'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE OR REPLACE FUNCTION public.request_verification()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_status text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  SELECT verification_status INTO v_status
  FROM public.profiles
  WHERE id = v_uid;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found' USING ERRCODE = '22023';
  END IF;

  IF v_status IN ('pending', 'verified') THEN
    RETURN v_status;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM storage.objects o
    WHERE o.bucket_id = 'verifications'
      AND (storage.foldername(o.name))[1] = v_uid::text
  ) THEN
    RAISE EXCEPTION 'Selfie missing' USING ERRCODE = '22023';
  END IF;

  UPDATE public.profiles
  SET
    verification_status = 'pending',
    verification_submitted_at = now(),
    verification_reviewed_at = NULL
  WHERE id = v_uid;

  RETURN 'pending';
END;
$$;

REVOKE ALL ON FUNCTION public.request_verification() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_verification() TO authenticated;

-- ============================================
-- 6. FOTO-STORAGE HAERTEN
-- ============================================
-- Vorher durfte jeder eingeloggte User jedes Foto im Bucket "photos"
-- hochladen, ueberschreiben und loeschen. Jetzt nur noch im eigenen
-- Ordner (<user-id>/...). Oeffentliche Foto-URLs funktionieren weiter,
-- weil der Bucket public ist; Auflisten fremder Ordner geht nicht mehr.
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own photo objects" ON storage.objects;
CREATE POLICY "Users can view own photo objects"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Authenticated users can upload photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can update their own photos" ON storage.objects;
CREATE POLICY "Users can update their own photos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can delete their own photos" ON storage.objects;
CREATE POLICY "Users can delete their own photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================
-- 7. KONTO LOESCHEN
-- ============================================
-- Die App loescht vorher die eigenen Dateien ueber die Storage-API
-- (photos/<uid>/*, verifications/<uid>/*). Danach entfernt diese RPC das
-- Profil (inkl. Swipes, Matches, Nachrichten, Blocks, Porodica per CASCADE)
-- und den Auth-User. Meldungen bleiben anonymisiert erhalten (SET NULL).
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '42501';
  END IF;

  DELETE FROM public.profiles WHERE id = v_uid;
  DELETE FROM auth.users WHERE id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_my_account() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_my_account() TO authenticated;
