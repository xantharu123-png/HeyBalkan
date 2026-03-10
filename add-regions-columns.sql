-- ============================================
-- Hey Balkan - Region-Felder hinzufuegen
-- ============================================
-- Fuehre dieses SQL im Supabase SQL Editor aus
-- NACH dem add-preferences-columns.sql
-- ============================================

-- Neue Spalten fuer Regionen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS origin_region text DEFAULT NULL,
ADD COLUMN IF NOT EXISTS preferred_regions text[] DEFAULT '{}';

-- origin_region: Region-Code z.B. 'HR-DA' fuer Dalmatien
-- preferred_regions: Array von Region-Codes z.B. ['HR-DA', 'RS-BG'] oder leer = egal

-- Fake-Profile mit Regionen updaten
UPDATE profiles SET origin_region = 'RS-BG' WHERE first_name = 'Milica';
UPDATE profiles SET origin_region = 'BA-SA' WHERE first_name = 'Alen';
UPDATE profiles SET origin_region = 'HR-DA' WHERE first_name = 'Ivana';
UPDATE profiles SET origin_region = 'ME-PG' WHERE first_name = 'Dragan';
UPDATE profiles SET origin_region = 'XK-PR' WHERE first_name = 'Anisa';
UPDATE profiles SET origin_region = 'RS-BG' WHERE first_name = 'Marko';
UPDATE profiles SET origin_region = 'MK-SK' WHERE first_name = 'Maja';
UPDATE profiles SET origin_region = 'BA-MO' WHERE first_name = 'Emir';
UPDATE profiles SET origin_region = 'RS-VO' WHERE first_name = 'Tijana';
UPDATE profiles SET origin_region = 'SI-LJ' WHERE first_name = 'Luka';
UPDATE profiles SET origin_region = 'BA-SA' WHERE first_name = 'Amra';
UPDATE profiles SET origin_region = 'HR-ZG' WHERE first_name = 'Nikola';

-- Verifizierung
SELECT first_name, origin_country, origin_region, preferred_origins, preferred_regions FROM profiles;
