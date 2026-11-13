# Hey Balkan – Status Launch-Readiness

**Stand:** 13. November 2026 (`task-summary.md` aktualisiert; weiter blockiert durch fehlende `DATABASE_URL`)
**Übergabe an Codex:** vorbereitet am 11.11.2026, siehe **`HANDOVER.md`** (vollständiger Kontext, Ablauf, Risiken). Prüfskripte liegen in `supabase/checks/`.
**Übergabe 25.10.:** Arbeit aus einem anderen Account geprüft. Weder im Repo, auf GitHub, in Vercel noch in lokalen Sessions sind Änderungen zu finden.
**Branch:** `launch-readiness` (basiert auf `codex/security-launch-hardening`): Feature-Commit `b7a23f4` + Übergabe-Commit, **auf GitHub gepusht (11.11.)**, nicht in `main`
**Produktion:** läuft weiter auf `main` (`db9dff4`), Vercel-Projekt `hey-balkan`

---

## Blocker

**`DATABASE_URL` fehlt in `heybalkan-web/.env.local`.** Ohne sie habe ich nichts in Supabase gelesen oder ausgeführt.

```
DATABASE_URL=postgresql://postgres.detmafncymcheenmtkny:DEIN_NEUES_PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

Die Datei ist per `.gitignore` ausgeschlossen. Den Wert nie in den Chat oder ins Repo kopieren.

Solange die Hardening-Migrationen nicht gelaufen sind, gilt: Mit dem öffentlichen Anon-Key kann jeder alle Wartelisten-E-Mails und alle Profile auslesen.

---

## Aufgaben

| # | Aufgabe | Status |
|---|---------|--------|
| 1 | `_migrations` prüfen, Hardening-Migrationen ausführen, RLS auf `_migrations` | ⛔ blockiert (DB-Zugang) |
| 2 | Branch `launch-readiness` | ✅ |
| 3 | `fake-profiles.sql` aus `migrate.mjs`, Seeds nach `supabase/dev-seeds/` | ✅ (`seed-1000-fake-users.sql` noch nicht committet, siehe unten) |
| 4 | Melden & Blockieren (Discover, Matches, Chat) | ✅ Code, ⏳ DB-Test |
| 5 | Konto löschen (Daten + Auth-User, RPC) | ✅ Code, ⏳ DB-Test |
| 6 | 18+-Prüfung (UI + DB-Constraint) | ✅ Code + UI-Logik getestet, ⏳ DB-Test |
| 7 | `/impressum`, `/datenschutz`, `/agb`, Footer, Zustimmung bei Signup | ✅ (Platzhalter offen) |
| 8 | Selfie-Verifizierung (privater Bucket, pending/verified, Badge) | ✅ Code, ⏳ DB-Test |
| 9 | Landing: "Coming Soon – Frühling 2026" ersetzen | ✅ alle 4 Sprachen |
| 10 | Neue SQL als eigene Migration, in `migrate.mjs` | ✅ `add-launch-readiness.sql` |
| 11 | Build + Lint, lokal testen | ✅ Build/Lint fehlerfrei (zuletzt 11.11.), öffentliche Seiten im Browser geprüft; eingeloggte Abläufe ⏳ |
| 12 | `task-summary.md` aktualisieren | ✅ 13.11. (nach den DB-Schritten Ergebnis nachtragen) |
| 13 | Branch pushen, Go-Live-Schritte zeigen | ✅ gepusht (11.11.); Go-Live-Checkliste in `HANDOVER.md` 7.10, mit dem User durchgehen nach den DB-Schritten |

---

## Getroffene Entscheidungen

- **13.11.: Nächste Aufgaben (vom User gewählt, in dieser Reihenfolge):** (1) User trägt `DATABASE_URL` ein, danach DB-Prüfung/Test/Migrationen; (2) **Entblocken in der App**: Liste "Blockierte Personen" im Profil mit Entblocken-Knopf (DELETE-Policy auf `blocks` existiert, keine neue Migration nötig); (3) **Texte übersetzen**: restliche fest deutsche UI-Texte in alle 4 Sprachen (siehe `HANDOVER.md` Abschnitt 10). Fake-Testimonials: vom User vorerst **nicht** zum Entfernen freigegeben. Punkte 2 und 3 sind noch nicht begonnen.
- **DB-Zugang:** über `heybalkan-web/.env.local`, Runner mit `npm run migrate`
- **Hardening-Migrationen:** sofort ausführen, sobald DB-Zugang da ist. Bis zum Deploy des neuen Branches fallen auf dem Live-Stand die Porodica-Einladungslinks und die Wartelisten-Anmeldung der alten Landing aus. Der eingeloggte App-Bereich ist nicht betroffen.

---

## Was der Branch enthält

### Sicherheit & Datenbank (`add-launch-readiness.sql`)
- `blocks` + `reports` mit RLS. Blockierte Personen sind für beide Seiten unsichtbar: Profil, Match, Nachrichten, Porodica-Vorschläge, Familien-Browse.
- Matches nur noch bei gegenseitigem Like. Bisher konnte jeder eingeloggte User mit jedem ein Match anlegen und schreiben.
- `delete_my_account()`: löscht Profil (inkl. Swipes, Matches, Nachrichten, Porodica per CASCADE) und Auth-User. Die App entfernt vorher die eigenen Dateien über die Storage-API. Meldungen bleiben ohne Kontobezug erhalten.
- Constraint `profiles_min_age_18`
- Verifizierung: `verification_status` (`none`/`pending`/`verified`/`rejected`), privater Bucket `verifications`, RPC `request_verification()`. Ein Trigger verhindert, dass User sich selbst verifizieren.
- Foto-Storage: Hochladen, Überschreiben und Löschen nur noch im eigenen Ordner. Bisher durfte jeder eingeloggte User fremde Fotos ersetzen oder löschen.
- RLS + keine Rechte für `anon`/`authenticated` auf `_migrations`

### Migrations-Runner (`heybalkan-web/migrate.mjs`)
- Jede Datei in einer eigenen Transaktion, Stopp beim ersten Fehler. Bisher wurden zurückgerollte Dateien bei "already exists" als erledigt markiert.
- `npm run migrate` (liest `.env.local`), `npm run migrate -- --status` zeigt nur offene Migrationen

### App
- Menü "Melden / Blockieren" in Discover, Matches und im Chat-Raum
- Verifiziert-Badge in Discover, Profil, Matches, Chat
- Profil: Verifizierungs-Bereich, "Konto löschen", Rechtslinks. Entfernte Fotos werden jetzt auch aus dem Storage gelöscht.
- Onboarding: echtes Datum (kein 31.02.) und mindestens 18 Jahre
- Signup: Checkbox 18+/AGB/Datenschutz und separate ausdrückliche Einwilligung für Herkunft, Religion und Partnersuche (besonders schützenswerte Daten nach DSG Art. 5 lit. c / DSGVO Art. 9). Zeitpunkt wird in den Auth-Metadaten gespeichert.
- Rechtsseiten mit zentralen Platzhaltern in `heybalkan-web/src/lib/legal.ts`

### Sonstiges
- `AGENTS.md` (Codex) und `CLAUDE.md` (Claude Code, verweist auf `AGENTS.md`): `STATUS.md` zu Beginn lesen, am Ende aktualisieren; bei Übernahme `HANDOVER.md` lesen.
- `supabase/checks/db-check.mjs` (nur lesend) und `supabase/checks/rls-test.mjs` (Test mit Rollback), beide noch nie gegen die DB gelaufen
- Root-`.gitignore` schliesst jetzt `.env`-Dateien aus
- Dev-Seeds brechen ab, sobald die Datenbank echte Nutzer enthält

---

## Nächste Schritte (sobald `DATABASE_URL` da ist)

1. Nur lesend prüfen mit `supabase/checks/db-check.mjs`: `_migrations`, Policies, Storage, Anzahl Fake-Accounts und Profile unter 18
1a. **Baseline:** bereits angewendete Alt-Migrationen nur in `_migrations` eintragen, nicht erneut ausführen (Details und Risiken: `HANDOVER.md` 7.3)
2. Neue Migration mit `supabase/checks/rls-test.mjs` in einer Transaktion gegen die echte DB testen (3 Test-User, 42 Prüfungen), danach Rollback
3. Fehlende Migrationen ausführen (Hardening + `add-launch-readiness.sql`)
4. Falls Fake-Daten in Produktion: dich fragen, ob sie gelöscht werden sollen
5. `task-summary.md` aktualisieren, Branch pushen

---

## Offen bei dir

- **Domain:** `heybalkan.com` ist nicht registriert, von niemandem (Registry-Abfrage am 24.10.2026: 404). Auch `.ch`, `.app`, `.de`, `.eu`, `.io`, `.at`, `.net` und `hey-balkan.com` haben keinen DNS-Eintrag. Die App läuft nur unter `hey-balkan.vercel.app`. Kauf nur auf deine Entscheidung (kostet).
- **Platzhalter** in `heybalkan-web/src/lib/legal.ts` ausfüllen: `[NAME]`, `[ADRESSE]`, `[E-MAIL]`, `[GERICHTSSTAND]`, `[EU-VERTRETER]`. Den EU-Vertreter (Art. 27 DSGVO) nur eintragen, falls du einen bestellst, sonst den Satz in der Datenschutzerklärung entfernen.
- **Rechtstexte** von einer Fachperson prüfen lassen. Es sind sorgfältige Entwürfe, aber keine Rechtsberatung.
- **Erfundene Testimonials** auf der Startseite der Web-App ("Milica, 28", "Ante, 32 … seit 3 Monaten zusammen") entfernen oder durch echte ersetzen. Erfundene Kundenstimmen gelten als irreführende Werbung (UWG).
- **`seed-1000-fake-users.sql`** committen? Die Datei enthält ein Demo-Passwort. Entscheidung nach der DB-Prüfung.
- **Melde-Prozess:** Meldungen in Supabase (Tabelle `reports`) regelmässig prüfen. Die Datenschutzerklärung sagt "in der Regel höchstens 12 Monate" Aufbewahrung, das muss eingehalten werden.
- **Verifizierungen freigeben:** in Supabase `profiles.verification_status` von `pending` auf `verified` oder `rejected` setzen, Selfie im Bucket `verifications/<user-id>/`

---

## Vor dem Go-Live (Merge in `main`)

1. Migrationen sind gelaufen (`npm run migrate -- --status` zeigt nichts Offenes)
2. Platzhalter in `legal.ts` ersetzt
3. Vercel `hey-balkan`: `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt
4. Falls die Vite-Landing deployed wird: `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY` setzen (seit dem Security-Branch nicht mehr hartcodiert)
5. Vercel Deployment Protection prüfen: Die Produktions-URL muss ohne Vercel-Login erreichbar sein
6. Preview-Deployment des Branches durchklicken: Registrieren, Onboarding (auch mit Alter unter 18), Swipen, Match, Chat, Melden, Blockieren, Selfie, Konto löschen, Porodica-Link
7. Erst dann mergen

---

## Bekannte Einschränkungen (bewusst nicht in diesem Branch)

- Alle Profilfelder (inkl. Suchpräferenzen, Geburtsdatum) sind für jeden eingeloggten User per API lesbar. Besser später auf eine View oder RPC mit den nötigen Feldern einschränken.
- Profilfotos liegen in einem öffentlichen Bucket (abrufbar, wer die URL kennt)
- Keine Oberfläche zum Entblocken
- `heybalkan-landing/` ist eine alte Kopie der Landing und enthält noch "Coming Soon – Spring 2026"
- Nicht gemacht wie gewünscht: Domain, Bezahlfunktion, Push-Notifications
