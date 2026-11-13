# Übergabe an Codex – Hey Balkan Launch-Readiness

**Erstellt:** 11. November 2026 von Claude Code
**Für:** Codex (übernimmt die weitere Arbeit)
**Kurzstatus:** Code für die Launch-Readiness ist fertig und gebaut, aber **nichts davon ist in der Datenbank**. Einziger Blocker: Es gibt keinen DB-Zugang (`DATABASE_URL`).

> **Das Repo ist öffentlich.** In diese Datei, `STATUS.md` und alle Commits gehören keine Passwörter, Tokens, E-Mail-Adressen oder sonstige personenbezogenen Daten.

Lies zusätzlich `STATUS.md` (Kurzfassung) und `AGENTS.md` (Regel: `STATUS.md` zu Beginn lesen, am Ende aktualisieren).

---

## 0. Die ersten 10 Minuten

1. `git status` und `git log --oneline -3`: Erwartet wird Branch `launch-readiness`, HEAD = Übergabe-Commit über `b7a23f4`.
2. Prüfen, ob `DATABASE_URL` jetzt in `heybalkan-web/.env.local` steht (nur den Key prüfen, **den Wert nie ausgeben**):
   ```bash
   grep -c "^DATABASE_URL=" heybalkan-web/.env.local
   ```
   - `0` → weiter blockiert. Den User bitten, die Zeile einzutragen (Anleitung in Abschnitt 7.1). Bis dahin nur Dinge aus Abschnitt 10 angehen, die keine DB brauchen, und nur nach Rücksprache.
   - `1` → mit Abschnitt 7.2 weitermachen.
3. Am Ende der Sitzung `STATUS.md` aktualisieren.

---

## 1. Projekt und Struktur

Hey Balkan ist eine Dating-App für die Balkan-Diaspora in der Schweiz, in Deutschland und Österreich, mit einem "Porodica-Modus": Familienmitglieder schlagen per Einladungslink Profile vor.

| Pfad | Was | Anfassen? |
|------|-----|-----------|
| `heybalkan-web/` | **Haupt-App**: Next.js 14.2 (App Router, alles Client Components), TypeScript, Tailwind 3, Supabase JS v2, framer-motion, lucide-react. Deployed auf Vercel-Projekt `hey-balkan`. | ja |
| `src/` (Repo-Root) + `index.html`, `vite.config.js`, `package.json` im Root | **Landing Page mit Warteliste** (Vite + React 19 + Tailwind 4), 4 Sprachen | ja |
| `heybalkan-app/` | Expo/React-Native-Backup. Enthält aber `supabase-app-schema.sql` (Basis-Schema, steht in der Migrationsliste) | **nein** (ausser lesen) |
| `heybalkan-landing/` | alte Kopie der Landing, nicht die aktive | nein |
| `*.sql` im Root | Migrationen (Reihenfolge in `heybalkan-web/migrate.mjs`) | nur über den Runner |
| `supabase/dev-seeds/` | Fake-Daten, **nie in Produktion** | nein |
| `supabase/checks/` | Prüfskripte (DB-Check, RLS-Test), siehe 7.2 und 7.4 | ja |
| `instagram-posts/`, `heybalkan-*.md` | Marketing / Businessplan | nein |

**i18n der Web-App:** `heybalkan-web/src/i18n/translations.ts`, Sprachen `de`, `en`, `sr` (Serbisch/Kroatisch), `sq` (Albanisch). Fallback ist immer `de`. **Konvention:** In den Übersetzungen keine Umlaute und Diakritika (`fuer`, `Zurueck`, `Ueber`). Die Rechtsseiten sind bewusst in korrektem Deutsch mit Umlauten, aber mit Schweizer `ss` statt `ß`.

**Hooks/Helpers:** `useLanguage()` liefert `t(key)`. Platzhalter wie `{name}` werden per `.replace('{name}', …)` gefüllt. Der Supabase-Client liegt in `heybalkan-web/src/lib/supabase.ts`.

---

## 2. Der Auftrag des Users (Original, Reihenfolge verbindlich)

1. Prüfen, ob `harden-waitlist-public-access.sql` und `harden-porodica-public-access.sql` schon in Supabase gelaufen sind (Tabelle `_migrations`). Falls nicht, vor dem Merge ausführen, sonst bricht der neue Code. Prüfen, ob `_migrations` RLS hat, sonst aktivieren.
2. Neuer Branch `launch-readiness` auf Basis `codex/security-launch-hardening`.
3. `fake-profiles.sql` aus der Migrationsliste in `migrate.mjs` entfernen. Fake-Daten-Skripte (inkl. untracked `seed-1000-fake-users.sql`) nach `supabase/dev-seeds/` verschieben.
4. Melden und Blockieren von Usern (Tabellen + RLS + UI in Discover, Matches und Chat). Blockierte User erscheinen nirgends mehr.
5. Konto löschen im Profil (Daten + Auth-User, per Security-Definer-RPC).
6. 18+-Prüfung beim Onboarding (UI + DB-Constraint).
7. Seiten `/impressum`, `/datenschutz`, `/agb` (Schweizer DSG + DSGVO), Links im Footer, Zustimmungs-Checkbox bei Signup. Adresse als Platzhalter `[ADRESSE]` lassen, der User entscheidet.
8. Selfie-Verifizierung als Basis-Version: Selfie-Upload in privaten Storage-Bucket, Status pending/verified (manuelle Freigabe in Supabase), Badge im Profil und in Discover.
9. Landing: Text "Coming Soon – Frühling 2026" ersetzen (alle Sprachen).
10. Alle neuen SQL-Teile als eigene Migrationsdatei, in `migrate.mjs` eintragen.
11. `npm run build` + `lint` in `heybalkan-web`, Fehler beheben, lokal testen.
12. `task-summary.md` aktualisieren.
13. Branch pushen, **nicht in `main` mergen**. Dem User zeigen, was zu tun ist, bevor es live geht.

**Ausdrücklich nicht machen:** Domain kaufen, Bezahlfunktion, Push-Notifications.
**Regel des Users:** Alles, was etwas kostet oder nicht rückgängig zu machen ist, **vorher fragen**. **Nie wieder Zugangsdaten committen.**

---

## 3. Entscheidungen, die der User getroffen hat

| Thema | Entscheidung |
|-------|--------------|
| DB-Zugang | User trägt `DATABASE_URL` in `heybalkan-web/.env.local` ein (gitignored). Der Agent liest sie nur in Node-Skripten und gibt den Wert nie aus. **Passwort nie im Chat.** |
| Zeitpunkt der Hardening-Migrationen | **Sofort ausführen**, sobald DB-Zugang da ist, nicht erst vor dem Merge. Bewusst in Kauf genommen: Auf dem Live-Stand (`main`) funktionieren danach die Porodica-Einladungslinks (`/porodica/[code]`) und die Wartelisten-Anmeldung der alten Landing nicht mehr, bis der neue Code deployed ist. Begründung: Bis dahin kann jeder mit dem öffentlichen Anon-Key alle Wartelisten-E-Mails und alle Profile auslesen. |
| `AGENTS.md` / `STATUS.md` | `STATUS.md` zu Beginn jeder Sitzung lesen, am Ende aktualisieren. `CLAUDE.md` enthält nur `@AGENTS.md`. |

Noch **nicht** entschieden (siehe Abschnitt 9): Löschen von Fake-Daten in Produktion, Commit von `seed-1000-fake-users.sql`, erfundene Testimonials, Domain, Platzhalter in den Rechtstexten.

---

## 4. Aktueller Stand (geprüft am 11.11.2026)

### Git
| Branch | Commit | Remote | Inhalt |
|--------|--------|--------|--------|
| `main` | `db9dff4` | ja | Produktion. Enthält im Verlauf ein **altes DB-Passwort** in `heybalkan-web/migrate.mjs` (Commits `eb3f40e`/`db9dff4`). Laut User ist es **in Supabase bereits geändert**. Nicht wiederholen, nicht zitieren. |
| `codex/security-launch-hardening` | `12d83ca` | ja | Security-Hardening (RPCs statt offener anon-Policies, Env-Variablen statt Hardcoding). **Nicht in `main`.** |
| `launch-readiness` | `b7a23f4` + Übergabe-Commit | ja (gepusht am 11.11.2026) | Diese Arbeit. Basis `12d83ca`. **Nicht in `main` mergen**, bevor die Go-Live-Checkliste (7.10) erfüllt ist. |

- `core.autocrlf=true`, Index in LF. Die Warnungen "LF will be replaced by CRLF" sind harmlos.
- Untracked und bewusst **nicht** committet:
  - `supabase/dev-seeds/seed-1000-fake-users.sql`: enthält ein Demo-Passwort für 1000 Fake-Accounts. Entscheidung offen (9.4).
  - `.claude/launch.json`: lokale Dev-Server-Konfiguration für Claude Code. Irrelevant für Codex.

### Vercel (Stand 25.10., seitdem nicht erneut geprüft)
- Team `xani123s-projects`, Projekt `hey-balkan`, Framework Next.js, Node 24.x.
- Domains: nur `hey-balkan.vercel.app`, `hey-balkan-xani123s-projects.vercel.app`, `hey-balkan-git-main-xani123s-projects.vercel.app`. **Keine eigene Domain.**
- Produktion: Deployment von `main`/`db9dff4` (10.03.2026).
- Letztes Deployment: Preview von `codex/security-launch-hardening`/`12d83ca` (07.05.2026).
- **Deployment Protection:** `ssoProtection` = `all_except_custom_domains`. Prüfen, ob die Produktions-URL ohne Vercel-Login erreichbar ist (Go-Live-Checkliste).
- Env-Variablen konnten per API nicht gelistet werden (403). Benötigt werden `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Seit dem Security-Branch wirft `src/lib/supabase.ts` einen Fehler, wenn sie fehlen.
- Die **Vite-Landing** (Root `src/`) ist in diesem Vercel-Team nicht deployed. Wo sie läuft, ist unbekannt (User fragen). Seit dem Security-Branch braucht sie `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`, sonst wirft `src/supabase.js` beim Laden.

### Supabase
- Projekt-Ref `detmafncymcheenmtkny` (steht ohnehin öffentlich im Repo-Verlauf). Pooler-Region `eu-central-1` (Frankfurt).
- Dashboard: `https://supabase.com/dashboard/project/detmafncymcheenmtkny`
- **Unbekannt, weil nie geprüft:** Inhalt von `_migrations`, ob die Hardening-Migrationen gelaufen sind, ob Fake-Daten in Produktion liegen, welche Storage-Policies es tatsächlich gibt.

### Domain
`heybalkan.com` ist **nicht registriert** (Verisign-RDAP am 24.10.: 404). Auch `.ch`, `.app`, `.de`, `.eu`, `.io`, `.at`, `.net` und `hey-balkan.com` hatten keinen DNS-Eintrag. **Nicht kaufen**, das macht der User selbst.

---

## 5. Was im Branch steckt (Commit `b7a23f4`, 28 Dateien)

### 5.1 Neue Migration `add-launch-readiness.sql`

Idempotent, kann mehrfach laufen. Läuft nach `harden-porodica-public-access.sql`. Abschnitte:

**0. `_migrations` absichern:** Falls die Tabelle existiert: RLS an, `REVOKE ALL` für `anon`, `authenticated`.

**1. Blockieren**
- `public.blocks` (`CREATE TABLE IF NOT EXISTS`; existiert evtl. schon aus `supabase-app-schema.sql`), Index auf `blocked_id`.
- Constraint `blocks_not_self` mit `NOT VALID`, gilt also nur für neue Zeilen.
- Policies (drop + create): `Users can view their blocks` (nur die blockierende Person), `Users can create blocks` (nicht sich selbst), `Users can delete their blocks`.
- `public.is_blocked_with(p_other uuid)`: `SECURITY DEFINER`, `STABLE`, prüft beide Richtungen relativ zu `auth.uid()`. `EXECUTE` nur für `authenticated`.
- **RESTRICTIVE**-Policies, damit Blockierte überall verschwinden:
  - `profiles` SELECT: `id = auth.uid() OR NOT is_blocked_with(id)`
  - `matches` SELECT: kein Block mit dem Gegenüber
  - `matches` INSERT: `Matches require mutual like`. Teilnehmer ist `auth.uid()`, nicht dieselbe Person, kein Block, Like/Super-Like in **beide** Richtungen. Das schliesst auch eine alte Lücke: Vorher durfte jeder eingeloggte User mit jedem ein Match anlegen und schreiben.
  - `porodica_suggestions` SELECT: kein Block mit dem vorgeschlagenen Profil.
- `messages` braucht keine eigene Policy. Die bestehenden Policies prüfen per Subquery auf `matches`, und deren RLS greift dort mit.

**2. Melden:** `public.reports` mit `reporter_id` (Default `auth.uid()`, `ON DELETE SET NULL`), `reported_id` (`SET NULL`), `match_id`, `context` (`discover`/`match`/`chat`/`other`), `reason` (`fake_profile`, `inappropriate_content`, `harassment`, `spam_scam`, `underage`, `other`), `details` (≤ 1000 Zeichen), `status` (`open`/`in_review`/`resolved`/`dismissed`), `admin_note`, `reviewed_at`. RLS: nur INSERT für die eigene Person, `status` muss `open` sein. **Kein SELECT für User**, die Moderation läuft im Supabase-Dashboard.

**3. Porodica:** `get_porodica_browse_profiles` und `create_porodica_suggestion` werden mit identischer Signatur neu angelegt, plus Ausschluss geblockter Paare (direkt auf `blocks`, weil anon ohne `auth.uid()`). Grants wie im Hardening.

**4. 18+:** `profiles_min_age_18 CHECK (birth_date <= current_date - 18 Jahre AND birth_date >= 1900-01-01)` als `NOT VALID`. Ein `VALIDATE` folgt nur, wenn keine bestehende Zeile verstösst, sonst gibt es eine `NOTICE`. `current_date` im CHECK ist nicht immutable, aber hier unkritisch, weil Menschen nur älter werden.

**5. Selfie-Verifizierung**
- Neue Spalten in `profiles`: `verification_status` (`none`/`pending`/`verified`/`rejected`, Default `none`), `verification_submitted_at`, `verification_reviewed_at`. CHECK `profiles_verification_status_check`.
- `UPDATE profiles SET is_verified = false WHERE is_verified AND verification_status <> 'verified'`: Alle bisherigen Haken gelten als nicht belastbar, betrifft vermutlich Seed-Profile.
- Trigger `protect_profile_verification` (BEFORE INSERT/UPDATE): Bei `current_user IN ('anon','authenticated')` werden Änderungen an den Verifizierungsfeldern verworfen. Dashboard (`postgres`) und `SECURITY DEFINER`-RPCs dürfen. `is_verified` wird immer aus `verification_status` abgeleitet. Ein Wechsel auf `verified`/`rejected` setzt `verification_reviewed_at`.
- Bucket `verifications`: privat, 10 MB, nur Bilder (jpeg/png/webp/heic/heif). Storage-Policies: INSERT, SELECT und DELETE nur im Ordner `<auth.uid()>/`, **kein UPDATE**.
- `request_verification()`: `SECURITY DEFINER`. Setzt den Status auf `pending`, wenn er `none`/`rejected` war **und** ein Objekt in `verifications/<uid>/` existiert. Sonst Fehler `Selfie missing`.
- **Freigabe (manuell):** Im Table Editor `profiles.verification_status` auf `verified` oder `rejected` setzen. Das Selfie liegt unter Storage → `verifications/<user-id>/`.

**6. Foto-Storage härten (Bucket `photos`, public):** Drop von `Anyone can view photos`, `Authenticated users can upload photos`, `Users can update their own photos`, `Users can delete their own photos` und Neuanlage, die **nur noch den eigenen Ordner** erlaubt (`(storage.foldername(name))[1] = auth.uid()::text`). Vorher durfte jeder eingeloggte User **jedes** Foto hochladen, überschreiben und löschen. Öffentliche Foto-URLs funktionieren weiter, weil der Bucket public ist. Nur das Auflisten fremder Ordner geht nicht mehr.
> **Achtung:** Falls die Policies in Produktion andere Namen haben (z.B. im Dashboard angelegt), bleiben die alten offenen Policies bestehen. Policies werden per OR verknüpft, die Härtung wirkt dann nicht. Mit `db-check.mjs` prüfen und ggf. nachziehen.

**7. Konto löschen:** `delete_my_account()` mit `SECURITY DEFINER` löscht `profiles` (CASCADE auf Swipes, Matches, Nachrichten, Blocks, Familienmitglieder, Vorschläge) und `auth.users`. `reports` bleiben mit `NULL`-Bezug erhalten. Storage-Dateien löscht die **App vorher über die Storage-API**, nicht SQL. Neuere Supabase-Versionen blockieren `DELETE` auf `storage.objects` per SQL, und es entstünden verwaiste Dateien.
> **Achtung:** Falls `storage.objects.owner` einen FK auf `auth.users` hat, scheitert das Löschen, solange Dateien übrig sind. `db-check.mjs` zeigt die FKs.

### 5.2 Migrations-Runner `heybalkan-web/migrate.mjs` + npm-Script
- `npm run migrate` (= `node --env-file-if-exists=.env.local migrate.mjs`), `npm run migrate -- --status` listet nur offene Dateien.
- Reihenfolge: `supabase-setup.sql`, `harden-waitlist-public-access.sql`, `heybalkan-app/supabase-app-schema.sql`, `add-preferences-columns.sql`, `add-regions-columns.sql`, `add-porodica-tables.sql`, `harden-porodica-public-access.sql`, `add-launch-readiness.sql`. `fake-profiles.sql` ist entfernt.
- **Neu:** Jede Datei läuft mit ihrem Tracking-Eintrag in **einer Transaktion**. Beim ersten Fehler: `ROLLBACK`, Abbruch, Exit-Code 1. Die alte Logik ("bei 'already exists' als erledigt markieren") ist raus, weil sie zurückgerollte Dateien fälschlich als erledigt markiert hat.
- Die Tracking-Tabelle bekommt RLS und keine Rechte für `anon`/`authenticated`.
- Siehe **Baseline-Problem** in 7.3, bevor der Runner gegen Produktion läuft.

### 5.3 App-Änderungen (`heybalkan-web/src/`)

| Datei | Änderung |
|-------|----------|
| `components/SafetyActions.tsx` (neu) | Button (`MoreHorizontal`) + Bottom-Sheet: Menü → "Melden" (Grund, Details, Checkbox "auch blockieren", standardmässig an) oder "Blockieren" (Bestätigung) → Erfolgsmeldung. Insert in `reports`/`blocks`. `23505` (schon blockiert) zählt als Erfolg. `onBlocked` wird beim Schliessen aufgerufen. Props: `targetId`, `targetName`, `context`, `matchId?`, `onBlocked?`, `className?`. |
| `components/VerifiedBadge.tsx` (neu) | `BadgeCheck`-Icon, nur bei `status === 'verified'`. |
| `components/VerificationSection.tsx` (neu) | Profilbereich: Status-Anzeige. Bei `none`/`rejected` öffnet ein Button ein Modal mit Anleitung (Peace-Zeichen), `<input capture="user">`, Vorschau, Upload nach `verifications/<uid>/selfie_<ts>.<ext>`, dann `rpc('request_verification')`. Limit 10 MB. |
| `components/DeleteAccountSection.tsx` (neu) | "Konto löschen" mit Bestätigungswort je Sprache (`LOESCHEN`/`DELETE`/`OBRISI`/`FSHIJ`). Ablauf: `removeOwnFolder('photos')`, `removeOwnFolder('verifications')`, `rpc('delete_my_account')`, `signOut({ scope: 'local' })`, Abschluss-Screen. Bricht bei Fehlern ab. |
| `components/LegalLayout.tsx`, `LegalLinks.tsx` (neu) | Layout und Footer-Links der Rechtsseiten. `LEGAL_LINKS` wird auch auf der Startseite genutzt. |
| `lib/age.ts` (neu) | `parseBirthDate('TT.MM.JJJJ')` → ISO oder `null` (echte Kalenderprüfung, ≥ 1900), `getAgeFromIso`, `MIN_AGE = 18`. Ad hoc getestet: Geburtstag genau heute = 18, 31.02., 29.02. im Nicht-Schaltjahr. |
| `lib/storage.ts` (neu) | `removeOwnFolder(bucket, uid)` (in Schleifen à 100), `storagePathFromPublicUrl(url, bucket)`. |
| `lib/legal.ts` (neu) | **Zentrale Platzhalter** für die Rechtstexte (siehe 9.1) + `lastUpdated`. |
| `app/impressum`, `app/datenschutz`, `app/agb` (neu) | Statische Server-Seiten. Die Datenschutzerklärung beschreibt die tatsächliche Verarbeitung (Supabase Frankfurt, Vercel USA, Sichtbarkeit inkl. Porodica-Links und öffentlicher Foto-URLs, besonders schützenswerte Daten, Speicherdauern, Rechte nach DSG und DSGVO). **Entwürfe, keine Rechtsberatung.** |
| `app/page.tsx` | Footer: Kontakt → `/impressum#kontakt`, Impressum, Datenschutz, AGB. |
| `app/auth/signup/page.tsx` | Zwei Pflicht-Checkboxen: (1) 18+, AGB, Datenschutz (mit Links, öffnen in neuem Tab); (2) separate ausdrückliche Einwilligung für Herkunft, Religion und Partnersuche (ethnische Herkunft, Religion, sexuelle Orientierung = DSG Art. 5 lit. c / DSGVO Art. 9). Speichert `terms_version` (`LEGAL_VERSION = '2026-10-14'`), `terms_accepted_at` und `sensitive_data_consent_at` in den **Auth-User-Metadaten**. Diese sind vom User änderbar, als Nachweis also nur begrenzt belastbar. |
| `app/app/onboarding/page.tsx` | Geburtsdatum wird echt geprüft, Fehlertext unter dem Feld, Weiter erst ab 18. `23514` vom Server zeigt den Underage-Text. |
| `app/app/discover/page.tsx` | `SafetyActions` oben rechts auf der Karte. Beim Blockieren verschwindet das Profil sofort. Badge neben dem Namen. |
| `app/app/matches/page.tsx` | Karte in Wrapper-`div` (kein Button-in-Button), `SafetyActions` oben rechts, Badge. Join lädt `verification_status`. Name im Chat-Link per `encodeURIComponent`. |
| `app/app/chat/[matchId]/page.tsx` | Lädt das Match (`maybeSingle`) und das Partnerprofil. Ist eines nicht sichtbar (blockiert/gelöscht), erscheint "Chat nicht verfügbar". Header mit Foto, Name, Badge, `SafetyActions`. Beim Blockieren geht es zurück zu `/app/chat`. Schlägt das Senden fehl, wird die optimistische Nachricht zurückgenommen und der Text wiederhergestellt. |
| `app/app/porodica/page.tsx` | Vorschläge ohne sichtbares Profil (blockiert/gelöscht) werden ausgefiltert. |
| `app/app/profile/page.tsx` | Badge im Header, `VerificationSection` (zwischen Info und Präferenzen), `DeleteAccountSection` + Rechtslinks unter "Abmelden". Beim Speichern werden **entfernte eigene Fotos auch aus dem Storage gelöscht**. |
| `i18n/translations.ts` | 53 neue Keys je Sprache, in allen 4 Sprachen (u.a. `acceptTerms`, `acceptSensitive`, `report*`, `reason*`, `block*`, `deleteAccount*`, `verif*`, `errorUnderage`, `errorInvalidDate`). |

### 5.4 Landing (Root `src/`)
- `src/translations.js`: Das `hero.badge` "Coming Soon – Frühling 2026" ist in allen 4 Sprachen ersetzt durch "Bald verfuegbar – sichere dir deinen Platz" / "Launching soon – save your spot" / "Uskoro – osiguraj svoje mjesto" / "Se shpejti – siguro vendin tend".
- `src/PostSignup.jsx`: Footer "Spring 2026" → "Bald verfuegbar" (je Sprache).
- `heybalkan-landing/` (alte Kopie) bewusst nicht angepasst.

### 5.5 Repo-Hygiene
- Root-`.gitignore`: `.env`, `.env.*`, Ausnahme `!.env.example`. Vorher waren `.env`-Dateien im Root nicht ignoriert.
- `fake-profiles.sql` → `supabase/dev-seeds/fake-profiles.sql`, inkl. **Schutzabfrage**: bricht ab, sobald `auth.users` eine E-Mail enthält, die nicht auf `@heybalkan.fake` endet. Dieselbe Abfrage steht in `seed-1000-fake-users.sql` (lokal, untracked).

---

## 6. Was getestet ist und was nicht

| Geprüft | Ergebnis |
|---------|----------|
| `npm run lint` (heybalkan-web) | ✅ keine Warnungen/Fehler (14.10., erneut 11.11.) |
| `npm run build` (heybalkan-web) | ✅ alle 16 Seiten gebaut (14.10., erneut 11.11.) |
| `npm run build` (Root-Landing) | ✅ |
| `npx tsc --noEmit` | ✅ |
| Öffentliche Seiten im Browser (lokal, Desktop + 375px) | ✅ `/`, `/impressum`, `/datenschutz`, `/agb`, `/auth/signup`: Links korrekt, kein horizontales Scrollen |
| `lib/age.ts` | ✅ Grenzfälle ad hoc mit Node geprüft |

| **Nicht** geprüft | Warum |
|-------------------|-------|
| Alles in der DB (Migration, RLS, RPCs, Trigger, Storage-Policies) | kein DB-Zugang. `supabase/checks/rls-test.mjs` ist vorbereitet, **lief aber nie**, der Testcode selbst ist ungeprüft. |
| Eingeloggte Abläufe in der UI (Onboarding, Melden, Blockieren, Selfie, Konto löschen, Chat) | Lokal zeigt die App auf die **Produktions-DB**. Test-Accounts dort anzulegen wurde bewusst vermieden. Ziel: Preview-Deployment durchklicken (Go-Live-Checkliste), nachdem die Migrationen gelaufen sind. |
| Signup-Flow mit E-Mail-Bestätigung | Unbekannt, ob in Supabase Auth "Confirm email" aktiv ist. Falls ja, gibt `signUp` keine Session zurück, und der Redirect nach `/app/onboarding` landet beim Login. Vorbestehendes Verhalten, prüfen. |

---

## 7. Nächste Schritte – genauer Ablauf

### 7.1 DB-Zugang (macht der User)
1. Supabase → Projekt → **Connect** → Verbindungszeile unter **Session pooler** kopieren (Port 5432, Host `…pooler.supabase.com`).
2. `[YOUR-PASSWORD]` durch das neue DB-Passwort ersetzen. Sonderzeichen wie `@ : / ? # $ %` brechen die URL. Am einfachsten ein alphanumerisches Passwort, sonst URL-encodieren. Bei Bedarf über **Project Settings → Database → Reset database password** neu setzen.
3. In `heybalkan-web/.env.local` als Zeile `DATABASE_URL=…` eintragen. Die Datei ist gitignored.
4. **Der User schickt das Passwort nie in den Chat.** Der Agent gibt den Wert nie aus. Prüfen nur mit `grep -c "^DATABASE_URL="`.

### 7.2 Nur lesend prüfen
```bash
cd heybalkan-web
node --env-file=.env.local ../supabase/checks/db-check.mjs
```
Läuft in `BEGIN READ ONLY`. Ausgabe: `_migrations` (Existenz, RLS, anon-Rechte, Einträge), RLS je Tabelle, alle public-Policies, vorhandene RPCs, Storage-Policies/-Buckets/-Trigger/-FKs, FKs und Trigger auf `auth.users`, Zählungen (Fake-User, Fake-Profile `a0000001-…`/`f0000001-…`, `is_verified`, Profile unter 18, Warteliste), Aktivität, `blocks`/`reports` vorhanden, Self-Blocks.

### 7.3 Auswerten und **Baseline-Problem** lösen (kritisch)

Mehrere alte Migrationen wurden vermutlich von Hand im SQL Editor ausgeführt und stehen deshalb **nicht** in `_migrations`. Blind `npm run migrate` würde sie erneut ausführen:

| Datei | Risiko bei erneutem Lauf |
|-------|--------------------------|
| `supabase-setup.sql` | legt die **offenen anon-Policies der Warteliste wieder an**. Direkt danach entfernt `harden-waitlist` sie zwar wieder, besser trotzdem nicht. |
| `heybalkan-app/supabase-app-schema.sql` | `CREATE POLICY` ohne `IF NOT EXISTS` und `ALTER PUBLICATION … ADD TABLE` → Fehler → der neue Runner rollt zurück und **bricht ab**. Folgemigrationen laufen dann nicht. |
| `add-preferences-columns.sql`, `add-regions-columns.sql` | enthalten `UPDATE profiles … WHERE first_name = 'Milica'` usw. → würden **Präferenzen echter User** mit diesen Vornamen überschreiben. |
| `add-porodica-tables.sql` | enthält `DROP TABLE IF EXISTS public.porodica_suggestions` und `DROP TABLE IF EXISTS public.family_relations` → **Datenverlust**, falls die Datei durchläuft. Normalerweise bricht sie an einer existierenden Policy ab, verlass dich nicht darauf. |

**Vorgehen:**
1. Aus der `db-check`-Ausgabe für jede Datei bestimmen, ob ihre Objekte schon existieren:
   - `supabase-setup.sql`: Tabelle `waitlist` + Funktion `set_waitlist_position`
   - `supabase-app-schema.sql`: Tabellen `profiles`, `swipes`, `matches`, `messages`
   - `add-preferences-columns.sql`: Spalte `profiles.preferred_age_min`
   - `add-regions-columns.sql`: Spalte `profiles.origin_region`
   - `add-porodica-tables.sql`: Tabelle `family_members`
   - `harden-waitlist-public-access.sql`: RPC `join_waitlist` existiert **und** es gibt keine anon-Policies auf `waitlist`
   - `harden-porodica-public-access.sql`: RPC `get_porodica_invite` existiert **und** die anon-Policies auf `family_members`, `profiles`, `porodica_suggestions`, `swipes` sind weg
2. Für bereits angewendete Dateien **nur den Tracking-Eintrag setzen** (Baseline), nicht ausführen:
   ```sql
   INSERT INTO public._migrations (filename) VALUES ('supabase-setup.sql') ON CONFLICT DO NOTHING;
   -- usw., nur fuer Dateien, deren Objekte nachweislich existieren
   ```
   Das per kleinem Node-Skript mit `pg` ausführen, **keine** Hardening- oder Launch-Datei so markieren, die nicht wirklich gelaufen ist.
3. Danach muss `npm run migrate -- --status` nur noch die wirklich fehlenden Dateien als offen zeigen. Erwartet: die beiden `harden-*` (falls nicht gelaufen) und `add-launch-readiness.sql`.
4. Falls `_migrations` RLS aus hat: `ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY; REVOKE ALL ON public._migrations FROM anon, authenticated;`. Das ist Teil von Schritt 1 des Auftrags und reversibel. Der Runner und `add-launch-readiness.sql` machen das ohnehin.
5. Prüfen, ob die Storage-Policies in Produktion so heissen wie in 5.1 Abschnitt 6 angenommen. Falls nicht, `add-launch-readiness.sql` um die tatsächlichen Namen ergänzen (`DROP POLICY IF EXISTS "<echter Name>"`).
6. Gibt es Self-Blocks: unkritisch (`NOT VALID`). Gibt es Profile unter 18: Der Constraint bleibt `NOT VALID`, den User informieren, **nicht eigenmächtig löschen**.

### 7.4 Migration testen (Transaktion + ROLLBACK)
```bash
cd heybalkan-web
node --env-file=.env.local ../supabase/checks/rls-test.mjs \
  ../harden-waitlist-public-access.sql \
  ../harden-porodica-public-access.sql \
  ../add-launch-readiness.sql
```
Nur die Dateien angeben, die laut 7.3 noch offen sind. Das Skript legt 3 Test-User an und prüft 42 Fälle: 18+, Verifizierung, Foto-Storage, Matches nur bei gegenseitigem Like, Melden, Blockieren (Profil/Match/Nachrichten/neues Match unsichtbar bzw. unmöglich), Porodica, anon-Lesesperren, Konto löschen. Danach rollt es **alles** zurück. Es hält kurz Sperren auf Kerntabellen, also nicht unter Last starten.
- Wenn einzelne Tests wegen des **Testcodes** scheitern (z.B. weil direktes `INSERT` in `storage.objects` blockiert ist), den Test anpassen, nicht die Migration aufweichen.
- Bei echten Fehlern in der Migration: korrigieren, erneut testen.

### 7.5 Migrationen ausführen
```bash
cd heybalkan-web
npm run migrate -- --status   # nochmals kontrollieren
npm run migrate
npm run migrate -- --status   # muss "0 offen" zeigen
```
Danach `db-check.mjs` erneut laufen lassen und kontrollieren: Es gibt keine anon-Policies mehr auf `waitlist`, `family_members`, `profiles`, `porodica_suggestions`, `swipes`, RLS ist auf `_migrations` aktiv, und die neuen Objekte existieren.

**Kompatibilität mit dem Live-Stand (`main`):**
- Die Hardening-Migrationen brechen auf `main` die Porodica-Links und die alte Wartelisten-Anmeldung. Das hat der User bewusst so entschieden (Abschnitt 3).
- `add-launch-readiness.sql` sollte mit `main` kompatibel sein, so weit analysiert:
  - Der alte Code lädt Fotos nur in den eigenen Ordner hoch.
  - Matches entstehen dort nur nach gegenseitigem Like.
  - Ohne Einträge in `blocks` haben die Blockier-Policies keine Wirkung.
  - Eine Anmeldung unter 18 bricht beim Speichern ab und zeigt eine Fehlermeldung.

  Der **neue** Code braucht die Migration zwingend: Er nutzt `reports`, `blocks`, `verification_status`, den Bucket `verifications` und die RPCs. Also immer erst migrieren, dann deployen.

### 7.6 Fake-Daten in Produktion (User fragen!)
Falls `db-check` Fake-Accounts zeigt (`@heybalkan.fake`, IDs `a0000001-…` bzw. `f0000001-…`):
- **Sicherheitsrelevant:** Das Passwort der 12 Fake-Accounts aus `fake-profiles.sql` steht seit März **öffentlich** im Repo. Jeder kann sich als diese Profile einloggen und echten Usern schreiben.
- Fake-Profile in Discover täuschen echte User.
- **Nicht eigenmächtig löschen** (irreversibel). Dem User Anzahl und Vorschlag nennen und auf ein klares Ja warten. Danach am besten mit dem Supabase Admin API / Dashboard löschen oder per SQL `DELETE FROM auth.users WHERE email LIKE '%@heybalkan.fake'`. Das löscht per CASCADE auch Profile, Swipes, Matches und Nachrichten mit echten Usern; das dem User vorher sagen.

### 7.7 `seed-1000-fake-users.sql`
Liegt untracked in `supabase/dev-seeds/`. Enthält ein Demo-Passwort für 1000 Accounts. Committen ist nur unbedenklich, wenn diese Accounts **nicht** in Produktion existieren (siehe 7.6). Dann committen, die Schutzabfrage ist drin. Andernfalls erst nach dem Löschen committen oder den User fragen.

### 7.8 `task-summary.md` aktualisieren
Am 13.11.2026 neu geschrieben (Chronik, Dateien, nächste Schritte, Go-Live). Nach den DB-Schritten das Ergebnis nachtragen: welche Migrationen gelaufen sind und ob Fake-Daten entfernt wurden.

### 7.9 Commit und Push
- `launch-readiness` ist seit dem 11.11.2026 auf GitHub (Schritt 13 des Auftrags). Weitere Commits auf diesen Branch pushen, **nicht** in `main` mergen.
- Jeder Push löst bei Vercel ein **Preview-Deployment** aus. Dieses läuft gegen die Produktions-DB und ist durch Vercel Deployment Protection geschützt. Solange `add-launch-readiness.sql` nicht gelaufen ist, funktionieren dort Melden, Blockieren, Selfie und Konto löschen nicht (Tabellen, Spalten, Bucket und RPCs fehlen).
- Danach den User durch die Go-Live-Checkliste (7.10) führen.

### 7.10 Go-Live-Checkliste (für den User)
1. `npm run migrate -- --status` zeigt nichts Offenes.
2. Platzhalter in `heybalkan-web/src/lib/legal.ts` ersetzt (9.1). Den Satz zum EU-Vertreter ggf. aus `app/datenschutz/page.tsx` entfernen.
3. Vercel `hey-balkan`: `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` für Production **und** Preview gesetzt.
4. Falls die Vite-Landing deployed ist: `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` gesetzt und `codex/security-launch-hardening`-Stand der Landing deployed (sonst bleibt die Warteliste kaputt).
5. Vercel Deployment Protection: Die Produktions-URL ist ohne Vercel-Login erreichbar.
6. Preview des Branches durchklicken, mit eigenen Test-Accounts durch den User:
   - Registrieren (Checkboxen), Onboarding (auch Geburtsdatum unter 18 und ungültiges Datum)
   - Swipen, Match, Chat
   - Melden, Blockieren (verschwindet bei beiden?)
   - Selfie hochladen → in Supabase auf `verified` setzen → Badge sichtbar
   - Foto entfernen (Datei weg?), Konto löschen (Daten + Dateien weg?)
   - Porodica-Einladungslink (anon) inkl. Vorschlag
7. Erfundene Testimonials auf `/` entfernt oder ersetzt (9.3).
8. Erst dann `launch-readiness` (enthält `codex/security-launch-hardening`) in `main` mergen.

---

## 8. Risiken und Stolperfallen

- **Baseline/Re-Run alter Migrationen**, siehe 7.3. Grösstes Risiko für echte Daten.
- **Storage-Policy-Namen** können in Produktion abweichen, dann ist der Foto-Storage weiter offen (5.1 Abschnitt 6).
- **`storage.objects.owner`-FK auf `auth.users`** würde `delete_my_account()` blockieren, solange Dateien existieren. Die App löscht Dateien vorher. Falls die Storage-API das Löschen verweigert, bricht die App mit Fehler ab.
- **Restrictive Policy auf `profiles`** ruft pro Zeile `is_blocked_with()` auf (Indexzugriff auf `blocks`). Für den Launch ok. Bei vielen Profilen beobachten, dann ggf. Discover als RPC umsetzen.
- **Matches-INSERT** verlangt jetzt beide Likes. Edge Case im Porodica-Flow: Hat der User das Profil vorher selbst mit `pass` geswiped und liked dann den Vorschlag, schlägt das Swipe-Insert fehl (unique), und es entsteht kein Match. Das ist akzeptabel, hat aber keine Fehlermeldung.
- **Discover** schliesst geswipte Profile per `.not('id','in', '(…)')` aus. Bei vielen Swipes wird die URL sehr lang und kann scheitern (vorbestehend). Gehört langfristig in eine RPC.
- **Consent-Nachweis** liegt in den Auth-Metadaten und ist vom User änderbar. Für bessere Beweisbarkeit später eine eigene Tabelle `consents`.
- **Hardening bricht `main`** an zwei Stellen, siehe Abschnitt 3. Das ist gewollt, dem User beim Ausführen trotzdem nochmals kurz sagen.
- **Lokaler Dev-Server zeigt auf Produktions-Supabase** (`.env.local`). Lokale Tests mit Schreibzugriff erzeugen echte Daten.

---

## 9. Offen beim User (nicht selbst entscheiden)

1. **Platzhalter** in `heybalkan-web/src/lib/legal.ts`: `[NAME]`, `[ADRESSE]`, `[E-MAIL]`, `[GERICHTSSTAND]`, `[EU-VERTRETER]`. Der EU-Vertreter nach Art. 27 DSGVO ist nur nötig, falls nicht ausgenommen. Sonst den Satz in der Datenschutzerklärung streichen. Ein Name wurde bewusst nicht eingesetzt.
2. **Rechtstexte** von einer Fachperson prüfen lassen.
3. **Erfundene Testimonials** auf der Startseite der Web-App (`heybalkan-web/src/app/page.tsx`, Abschnitt "Das sagen unsere User": "Milica, 28, Zuerich", "Ante, 32, Muenchen … seit 3 Monaten zusammen"). Das gilt als irreführende Werbung (UWG CH/DE). Empfehlung: entfernen. **Nicht ohne Zustimmung ändern.** Ähnlich: Badge "Jetzt live" und "Verifizierte Profile" auf der Startseite. Die Verifizierung ist jetzt freiwillig, die Formulierung ggf. anpassen.
4. **Fake-Daten in Produktion** löschen? (7.6)
5. **`seed-1000-fake-users.sql`** committen? (7.7)
6. **Domain** kaufen: macht der User selbst. Danach in Vercel verbinden und die Links prüfen.
7. **Wo läuft die Vite-Landing?** Unbekannt.
8. **Prozesse:** Meldungen in `reports` regelmässig prüfen und `status`/`admin_note` setzen. Die Datenschutzerklärung verspricht "in der Regel höchstens 12 Monate" Aufbewahrung. Verifizierungen manuell freigeben (5.1 Abschnitt 5).

---

## 10. Bekannte Einschränkungen / Backlog (bewusst nicht gemacht)

- Alle Profilspalten (inkl. Geburtsdatum, Präferenzen) sind für jeden eingeloggten User per API lesbar (`profiles` SELECT `using (true)`). Besser: View/RPC mit nötigen Feldern.
- Bucket `photos` ist public. Wer die URL kennt, sieht das Foto, auch nach einem Block.
- Keine UI zum Entblocken. Die DB-Policy für DELETE existiert.
- Keine Admin-Oberfläche für Moderation und Verifizierung, alles läuft über das Supabase-Dashboard.
- Kein Rate-Limit bzw. Captcha für Warteliste, Signup, Meldungen.
- `get_waitlist_entry(email)` gibt jedem, der eine E-Mail kennt, Referral-Code, Position, Name und Bio zurück. Bewusstes Design aus dem Security-Branch, aber erwähnenswert.
- Profil-Einstellungen "Benachrichtigungen", "Privatsphäre" und "Hilfe" sind Buttons ohne Funktion.
- Einzelne hartcodierte deutsche Texte in der UI (z.B. "Du: " und "jetzt" in der Chat-Liste, "Ich suche…"/"Frauen"/"Maenner" im Onboarding/Profil, "Hauptfoto").
- `heybalkan-landing/` ist eine alte Kopie mit "Coming Soon – Spring 2026".
- Nicht gemacht wie gewünscht: Domain, Bezahlfunktion, Push-Notifications.

---

## 11. Sicherheitsbefunde (Historie, damit nichts verloren geht)

| Befund | Status |
|--------|--------|
| Anon-Key-Zugriff auf alle Wartelisten-E-Mails und alle Profile (offene anon-Policies) | Fix im Security-Branch (`harden-*.sql`), **in Produktion noch nicht ausgeführt** |
| Altes DB-Passwort im Git-Verlauf von `main` | Passwort laut User geändert. History-Rewrite nicht nötig, solange es rotiert ist. |
| Jeder eingeloggte User konnte mit jedem ein Match anlegen und schreiben | Fix in `add-launch-readiness.sql`, nicht ausgeführt |
| Jeder eingeloggte User konnte jedes Foto hochladen, überschreiben und löschen | Fix in `add-launch-readiness.sql`, nicht ausgeführt (Policy-Namen prüfen!) |
| `_migrations` ggf. über die API les- und schreibbar | Fix im Runner + Migration, nicht ausgeführt |
| User konnten `is_verified` selbst setzen | Fix (Trigger), nicht ausgeführt |
| Passwort der 12 Fake-Accounts öffentlich im Repo | offen, abhängig davon, ob die Accounts in Produktion existieren (7.6) |
| Root-`.gitignore` ignorierte keine `.env`-Dateien | Fix committet |

---

## 12. Konventionen

- Kommunikation mit dem User auf **Deutsch**, knapp und konkret. Vor allem, was kostet oder irreversibel ist, **fragen**.
- `STATUS.md` am Ende jeder Sitzung aktualisieren (`AGENTS.md`).
- Neue SQL immer als **eigene, idempotente Migrationsdatei** im Root und in `MIGRATION_FILES` in `migrate.mjs` eintragen. Nie bestehende, bereits gelaufene Migrationen umschreiben.
- Code-Stil: an die umgebenden Dateien anpassen (Tailwind-Klassen inline, deutsche Kommentare, wenige Kommentare).
- Vor jedem Commit: `npm run lint` und `npm run build` in `heybalkan-web`.

---

## 13. Wichtige Befehle

```bash
# Web-App
cd heybalkan-web
npm run dev                  # http://localhost:3000 (zeigt auf Produktions-Supabase!)
npm run lint
npm run build
npm run migrate -- --status
npm run migrate

# Prüfskripte (aus heybalkan-web/)
node --env-file=.env.local ../supabase/checks/db-check.mjs
node --env-file=.env.local ../supabase/checks/rls-test.mjs ../<offene-migration>.sql ...

# Landing (Repo-Root)
npm run build
```
