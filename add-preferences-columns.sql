-- ============================================
-- Hey Balkan - Preference-Felder hinzufuegen
-- ============================================
-- Fuehre dieses SQL im Supabase SQL Editor aus
-- ============================================

-- Neue Spalten fuer Suchpraeferenzen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS preferred_age_min integer DEFAULT 18,
ADD COLUMN IF NOT EXISTS preferred_age_max integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS preferred_religion text DEFAULT 'egal',
ADD COLUMN IF NOT EXISTS preferred_origins text[] DEFAULT '{}';

-- preferred_religion: 'Orthodox', 'Katholisch', 'Islam', 'Andere', 'egal'
-- preferred_origins: Array von Country-Codes z.B. ['RS', 'HR', 'BA'] oder leer = egal

-- Auch die Fake-Profile updaten mit realistischen Preferences
UPDATE profiles SET preferred_age_min = 22, preferred_age_max = 35, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Milica';
UPDATE profiles SET preferred_age_min = 23, preferred_age_max = 35, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Alen';
UPDATE profiles SET preferred_age_min = 22, preferred_age_max = 32, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Ivana';
UPDATE profiles SET preferred_age_min = 22, preferred_age_max = 38, preferred_religion = 'Orthodox', preferred_origins = ARRAY['RS','ME','BA'] WHERE first_name = 'Dragan';
UPDATE profiles SET preferred_age_min = 21, preferred_age_max = 33, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Anisa';
UPDATE profiles SET preferred_age_min = 21, preferred_age_max = 32, preferred_religion = 'egal', preferred_origins = ARRAY['RS','HR'] WHERE first_name = 'Marko';
UPDATE profiles SET preferred_age_min = 24, preferred_age_max = 36, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Maja';
UPDATE profiles SET preferred_age_min = 22, preferred_age_max = 34, preferred_religion = 'Islam', preferred_origins = ARRAY['BA','XK'] WHERE first_name = 'Emir';
UPDATE profiles SET preferred_age_min = 23, preferred_age_max = 35, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Tijana';
UPDATE profiles SET preferred_age_min = 22, preferred_age_max = 34, preferred_religion = 'egal', preferred_origins = ARRAY['SI','HR'] WHERE first_name = 'Luka';
UPDATE profiles SET preferred_age_min = 22, preferred_age_max = 35, preferred_religion = 'egal', preferred_origins = '{}' WHERE first_name = 'Amra';
UPDATE profiles SET preferred_age_min = 21, preferred_age_max = 32, preferred_religion = 'Katholisch', preferred_origins = ARRAY['HR','SI'] WHERE first_name = 'Nikola';

-- Verifizierung
SELECT first_name, preferred_age_min, preferred_age_max, preferred_religion, preferred_origins FROM profiles;
