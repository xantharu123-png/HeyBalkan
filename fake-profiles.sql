-- ============================================
-- Hey Balkan - Fake Test-Profile
-- ============================================
-- Erstellt zuerst Auth-User und dann die Profile.
-- Fuehre dieses SQL im Supabase SQL Editor aus:
-- Dashboard -> SQL Editor -> New Query -> Einfuegen -> Run
-- ============================================

-- Schritt 1: Fake Auth-User erstellen (mit festen UUIDs)
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, confirmation_token, recovery_token)
VALUES
  ('a0000001-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'milica.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alen.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'ivana.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dragan.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'anisa.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'marko.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maja.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'emir.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'tijana.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'luka.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'amra.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', ''),
  ('a0000001-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'nikola.test@heybalkan.fake', crypt('TestPass123!', gen_salt('bf')), NOW(), NOW(), NOW(), '', '')
ON CONFLICT (id) DO NOTHING;

-- Schritt 1b: Identities fuer die Auth-User erstellen (noetig fuer Supabase Auth)
INSERT INTO auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'email', '{"sub":"a0000001-0000-0000-0000-000000000001","email":"milica.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'a0000001-0000-0000-0000-000000000002', 'email', '{"sub":"a0000001-0000-0000-0000-000000000002","email":"alen.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000003', 'email', '{"sub":"a0000001-0000-0000-0000-000000000003","email":"ivana.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'a0000001-0000-0000-0000-000000000004', 'email', '{"sub":"a0000001-0000-0000-0000-000000000004","email":"dragan.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'a0000001-0000-0000-0000-000000000005', 'email', '{"sub":"a0000001-0000-0000-0000-000000000005","email":"anisa.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000006', 'email', '{"sub":"a0000001-0000-0000-0000-000000000006","email":"marko.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000007', 'email', '{"sub":"a0000001-0000-0000-0000-000000000007","email":"maja.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'a0000001-0000-0000-0000-000000000008', 'email', '{"sub":"a0000001-0000-0000-0000-000000000008","email":"emir.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'a0000001-0000-0000-0000-000000000009', 'email', '{"sub":"a0000001-0000-0000-0000-000000000009","email":"tijana.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'a0000001-0000-0000-0000-000000000010', 'email', '{"sub":"a0000001-0000-0000-0000-000000000010","email":"luka.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000011', 'email', '{"sub":"a0000001-0000-0000-0000-000000000011","email":"amra.test@heybalkan.fake"}', NOW(), NOW(), NOW()),
  ('a0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000012', 'a0000001-0000-0000-0000-000000000012', 'email', '{"sub":"a0000001-0000-0000-0000-000000000012","email":"nikola.test@heybalkan.fake"}', NOW(), NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Schritt 2: Profile einfuegen
INSERT INTO profiles (id, first_name, birth_date, gender, looking_for, origin_country, spoken_languages, city, living_country, religion, relationship_goal, bio, photos, onboarding_complete, created_at)
VALUES
-- 1. Milica aus Serbien, lebt in Zuerich
(
  'a0000001-0000-0000-0000-000000000001',
  'Milica',
  '1997-03-15',
  'female',
  'male',
  'RS',
  ARRAY['Srpski', 'Deutsch', 'English'],
  'Zuerich',
  'CH',
  'Orthodox',
  'serious',
  'Medicinska sestra u Zuericu. Volim planinarenje po Alpima i kuham najbolji burek van Balkana. Trazim nekoga ko zna sta znaci "ajde" i ko voli nedeljni rucak kod bake.',
  ARRAY['https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '3 days'
),
-- 2. Alen aus Bosnien, lebt in Wien
(
  'a0000001-0000-0000-0000-000000000002',
  'Alen',
  '1995-08-22',
  'male',
  'female',
  'BA',
  ARRAY['Bosanski', 'Deutsch', 'English'],
  'Wien',
  'AT',
  'Islam',
  'serious',
  'Software Developer aus Sarajevo, jetzt in Wien. Kaffee-Liebhaber (bosanska kafa naravno). Am Wochenende findest du mich entweder beim Fussball oder in einem guten Restaurant.',
  ARRAY['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '2 days'
),
-- 3. Ivana aus Kroatien, lebt in Muenchen
(
  'a0000001-0000-0000-0000-000000000003',
  'Ivana',
  '1998-12-05',
  'female',
  'male',
  'HR',
  ARRAY['Hrvatski', 'Deutsch', 'English', 'Slovenski'],
  'Muenchen',
  'DE',
  'Katholisch',
  'casual',
  'Studentin iz Splita, studiram Architektur in Muenchen. Moje Hobbys: Reisen, Kochen (dalmatinska kuhinja je die Beste!), und Yoga. Trazim nekoga za kavu i mozda vise.',
  ARRAY['https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '1 day'
),
-- 4. Dragan aus Montenegro, lebt in Zuerich
(
  'a0000001-0000-0000-0000-000000000004',
  'Dragan',
  '1993-06-18',
  'male',
  'female',
  'ME',
  ARRAY['Crnogorski', 'Srpski', 'Deutsch', 'English'],
  'Zuerich',
  'CH',
  'Orthodox',
  'serious',
  'Iz Podgorice, radim u finansijama u Zuericu. Volim sport, putovanja i dobru muziku. Trazim nekoga ko zna uzivati u zivotu - od planine do mora.',
  ARRAY['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '5 days'
),
-- 5. Anisa aus Kosovo, lebt in Berlin
(
  'a0000001-0000-0000-0000-000000000005',
  'Anisa',
  '1999-01-30',
  'female',
  'male',
  'XK',
  ARRAY['Shqip', 'Deutsch', 'English'],
  'Berlin',
  'DE',
  'Islam',
  'open',
  'Jam nga Prishtina, jetoj ne Berlin. Studioj dizajn grafik. Dua muziken, artin dhe udhetimet. Kerkoj dike qe eshte i hapur per kultura te ndryshme.',
  ARRAY['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '4 days'
),
-- 6. Marko aus Serbien, lebt in Wien
(
  'a0000001-0000-0000-0000-000000000006',
  'Marko',
  '1996-04-11',
  'male',
  'female',
  'RS',
  ARRAY['Srpski', 'Deutsch', 'English'],
  'Wien',
  'AT',
  'Keine Angabe',
  'casual',
  'DJ i producent iz Beograda. Zivim u Becu vec 5 godina. Kad ne miksujem muziku, kuvam ili istrazujem nove kafice. Opusten tip, volim da se smejem.',
  ARRAY['https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '6 days'
),
-- 7. Maja aus Mazedonien, lebt in Bern
(
  'a0000001-0000-0000-0000-000000000007',
  'Maja',
  '1997-09-28',
  'female',
  'male',
  'MK',
  ARRAY['Makedonski', 'Srpski', 'Deutsch', 'English'],
  'Bern',
  'CH',
  'Orthodox',
  'serious',
  'Od Skopje, zhiveam vo Bern. Rabotam kako marketing menadzher. Sakam da gotvam (tavce gravce e moj specijalitet!), cham knigi i patuvam. Baram nekoj koj e seriozhen.',
  ARRAY['https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '7 days'
),
-- 8. Emir aus Bosnien, lebt in Hamburg
(
  'a0000001-0000-0000-0000-000000000008',
  'Emir',
  '1994-11-03',
  'male',
  'female',
  'BA',
  ARRAY['Bosanski', 'Deutsch', 'English', 'Tuerkisch'],
  'Hamburg',
  'DE',
  'Islam',
  'serious',
  'Iz Mostara, vec 8 godina u Hamburgu. Radim kao inzenjer. Volim more (Alster je OK zamjena za Jadran), fudbal i dobru hranu. Porodicne vrijednosti su mi bitne.',
  ARRAY['https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '3 days'
),
-- 9. Tijana aus Serbien, lebt in Basel
(
  'a0000001-0000-0000-0000-000000000009',
  'Tijana',
  '1996-07-14',
  'female',
  'male',
  'RS',
  ARRAY['Srpski', 'Deutsch', 'English', 'Hrvatski'],
  'Basel',
  'CH',
  'Keine Angabe',
  'friendship',
  'Novi Sad -> Basel. Radim u farma industriji. Volim trcanje, koncerte i spontane putovanja. Nova sam u gradu pa trazim drustvo - prijatelje ili mozda nesto vise.',
  ARRAY['https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '2 days'
),
-- 10. Luka aus Slowenien, lebt in Muenchen
(
  'a0000001-0000-0000-0000-000000000010',
  'Luka',
  '1995-02-20',
  'male',
  'female',
  'SI',
  ARRAY['Slovenski', 'Deutsch', 'English', 'Hrvatski'],
  'Muenchen',
  'DE',
  'Katholisch',
  'serious',
  'Iz Ljubljane, zivim v Muenchnu ze 4 leta. Delam kot fizioterapeut. Rad hodim v gore, kuham in igram kitaro. Ischem nekoga za resno zvezo.',
  ARRAY['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '8 days'
),
-- 11. Amra aus Bosnien, lebt in Zuerich
(
  'a0000001-0000-0000-0000-000000000011',
  'Amra',
  '1998-05-09',
  'female',
  'male',
  'BA',
  ARRAY['Bosanski', 'Deutsch', 'English'],
  'Zuerich',
  'CH',
  'Islam',
  'open',
  'Sarajka u Zuericu. Studiram pravo na ETH. Volim fotografiju, putovanja i ples. Otvorena sam za upoznavanje novih ljudi - sta bude, bude!',
  ARRAY['https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=500&fit=crop', 'https://images.unsplash.com/photo-1514315384763-ba401779410f?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '1 day'
),
-- 12. Nikola aus Kroatien, lebt in Wien
(
  'a0000001-0000-0000-0000-000000000012',
  'Nikola',
  '1994-10-25',
  'male',
  'female',
  'HR',
  ARRAY['Hrvatski', 'Deutsch', 'English'],
  'Wien',
  'AT',
  'Katholisch',
  'casual',
  'Zagreb -> Wien. Radim kao arhitekt. Volim dizajn, dobru kavu i duge setnje. Jednostavan tip koji trazi neku jednostavnu curu za druzenje.',
  ARRAY['https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=500&fit=crop'],
  true,
  NOW() - interval '5 days'
)
ON CONFLICT (id) DO NOTHING;

-- Verifizierung
SELECT first_name, gender, origin_country, city, living_country, relationship_goal
FROM profiles
WHERE onboarding_complete = true
ORDER BY created_at DESC;
