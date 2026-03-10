-- ============================================
-- Hey Balkan - Porodica (Family) Modus
-- ============================================
-- Fuehre dieses SQL im Supabase SQL Editor aus
-- NACH dem add-regions-columns.sql
-- ============================================

-- 1. FAMILY_MEMBERS Tabelle
-- Familienmitglieder die KEINE echten Auth-User sind
-- Der User erstellt Profile fuer seine Familie
-- invite_code ermoeglicht separaten Login fuer Familienmitglieder
CREATE TABLE IF NOT EXISTS public.family_members (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  relation_type text NOT NULL CHECK (relation_type IN ('mama', 'papa', 'schwester', 'bruder', 'cousine', 'cousin', 'tante', 'onkel', 'oma', 'opa', 'andere')),
  photo text DEFAULT NULL,
  invite_code text UNIQUE DEFAULT substr(md5(random()::text), 1, 8),
  created_at timestamptz DEFAULT now()
);

-- Index fuer invite_code Lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_family_members_invite_code ON public.family_members(invite_code);

-- 2. PORODICA_SUGGESTIONS updaten/neu erstellen
-- Falls die alte Tabelle existiert, droppen wir sie und erstellen sie neu
-- weil sie jetzt family_members statt profiles referenziert
DROP TABLE IF EXISTS public.porodica_suggestions;

CREATE TABLE public.porodica_suggestions (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  family_member_id uuid REFERENCES public.family_members(id) ON DELETE CASCADE NOT NULL,
  for_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  suggested_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'seen', 'liked', 'passed')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(family_member_id, for_user_id, suggested_profile_id)
);

-- Die alte family_relations Tabelle brauchen wir nicht mehr
DROP TABLE IF EXISTS public.family_relations;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_family_members_owner ON public.family_members(owner_id);
CREATE INDEX IF NOT EXISTS idx_porodica_suggestions_for_user ON public.porodica_suggestions(for_user_id);
CREATE INDEX IF NOT EXISTS idx_porodica_suggestions_family ON public.porodica_suggestions(family_member_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.porodica_suggestions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FAMILY_MEMBERS Policies
-- =============================================

-- Owner (authenticated) kann seine eigenen Mitglieder sehen
CREATE POLICY "Users can view their own family members"
  ON public.family_members FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Anon kann via invite_code ein Mitglied sehen (fuer den eigenen Login)
CREATE POLICY "Anyone can view family member by invite code"
  ON public.family_members FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Users can create family members"
  ON public.family_members FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their family members"
  ON public.family_members FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their family members"
  ON public.family_members FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- =============================================
-- PROFILES: Anon braucht Lesezugriff fuer Porodica-Browse
-- =============================================
-- Check ob anon schon lesen darf, falls nicht:
CREATE POLICY "Anon can read profiles for porodica"
  ON public.profiles FOR SELECT
  TO anon
  USING (true);

-- =============================================
-- PORODICA_SUGGESTIONS Policies
-- =============================================

-- Authenticated: Owner sieht Vorschlaege
CREATE POLICY "Users can view suggestions for them"
  ON public.porodica_suggestions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = for_user_id
    OR EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.id = porodica_suggestions.family_member_id
      AND family_members.owner_id = auth.uid()
    )
  );

-- Authenticated: Owner kann Vorschlaege erstellen (self-browse modus)
CREATE POLICY "Family member owners can create suggestions"
  ON public.porodica_suggestions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.id = family_member_id
      AND family_members.owner_id = auth.uid()
    )
  );

-- Anon: Familienmitglieder koennen Vorschlaege erstellen (via invite_code)
CREATE POLICY "Anon can create suggestions via invite code"
  ON public.porodica_suggestions FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.id = family_member_id
    )
  );

-- Anon: Familienmitglieder koennen ihre eigenen Vorschlaege sehen
CREATE POLICY "Anon can view suggestions they created"
  ON public.porodica_suggestions FOR SELECT
  TO anon
  USING (true);

-- Authenticated: User kann Status updaten (like/pass)
CREATE POLICY "Users can update suggestion status"
  ON public.porodica_suggestions FOR UPDATE
  TO authenticated
  USING (auth.uid() = for_user_id);

-- =============================================
-- SWIPES: Anon braucht Lesezugriff fuer already-swiped Check
-- =============================================
CREATE POLICY "Anon can read swipes for porodica"
  ON public.swipes FOR SELECT
  TO anon
  USING (true);

-- Verifizierung
SELECT 'family_members' as table_name, count(*) as count FROM public.family_members
UNION ALL
SELECT 'porodica_suggestions', count(*) FROM public.porodica_suggestions;
