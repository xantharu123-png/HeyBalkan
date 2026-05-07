-- ============================================
-- HEY BALKAN - Supabase Setup
-- Kopiere ALLES und fuehre es im SQL Editor aus
-- supabase.com > Dein Projekt > SQL Editor > New Query
-- Danach harden-waitlist-public-access.sql ausfuehren.
-- ============================================

-- 1. Waitlist Tabelle erstellen (falls noch nicht vorhanden)
create table if not exists waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  origin text,
  language text default 'de',
  created_at timestamptz default now()
);

-- 2. Neue Spalten hinzufuegen
alter table waitlist add column if not exists referral_code text unique;
alter table waitlist add column if not exists referred_by text;
alter table waitlist add column if not exists referral_count int default 0;
alter table waitlist add column if not exists name text;
alter table waitlist add column if not exists bio text;
alter table waitlist add column if not exists position int;

-- 3. Automatische Position + Referral-Code bei jeder Anmeldung
create or replace function set_waitlist_position()
returns trigger as $$
begin
  new.position := (select coalesce(max(position), 0) + 1 from waitlist);
  new.referral_code := substr(md5(random()::text), 1, 8);
  return new;
end;
$$ language plpgsql;

drop trigger if exists waitlist_position_trigger on waitlist;
create trigger waitlist_position_trigger
  before insert on waitlist
  for each row execute function set_waitlist_position();

-- 4. Referral-Counter Funktion
create or replace function increment_referral_count(ref_code text)
returns void as $$
begin
  update waitlist
  set referral_count = referral_count + 1
  where referral_code = ref_code;
end;
$$ language plpgsql security definer;

-- 5. Row Level Security aktivieren + Policies
alter table waitlist enable row level security;

drop policy if exists "Allow anonymous inserts" on waitlist;
create policy "Allow anonymous inserts" on waitlist
  for insert to anon
  with check (true);

drop policy if exists "Allow anonymous updates by email" on waitlist;
create policy "Allow anonymous updates by email" on waitlist
  for update to anon
  using (true)
  with check (true);

drop policy if exists "Allow anonymous select" on waitlist;
create policy "Allow anonymous select" on waitlist
  for select to anon
  using (true);

-- FERTIG! Jetzt funktioniert die Waitlist mit:
-- - Email-Anmeldung
-- - Automatische Position (#1, #2, #3...)
-- - Automatischer Referral-Code
-- - Referral-Counter
-- - Profil (Name + Bio)
