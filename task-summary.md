# Hey Balkan – Task Summary

**Projekt-Owner:** Miroslav
**Letzte Aktualisierung:** 13. November 2026

Aktueller Arbeitsstand und Blocker: siehe `STATUS.md`. Vollständiger Kontext für die Weiterarbeit: `HANDOVER.md`.

---

## Was wurde erledigt

### 5. März 2026 – Landing Page, Native App, Web-App
- Landing Page mit Warteliste (Vite + React + Tailwind, 4 Sprachen, Supabase-Anmeldung, Empfehlungssystem, Profil nach Anmeldung)
- 10 Instagram-Posts (1080x1080px PNG)
- React-Native-App (Expo) als Backup: `heybalkan-app/`
- **Web-App (Next.js 14 + TypeScript + Tailwind) als Haupt-App:** Login/Signup, Onboarding, Swipe-Interface, Matches, Echtzeit-Chat, Profil, 4 Sprachen (DE, EN, SR/HR, SQ)
- GitHub-Repo: github.com/xantharu123-png/HeyBalkan (öffentlich)
- Domain-Check: heybalkan.com, .app, .io, .eu waren frei. **Registriert wurde bisher keine** (Stand 24.10.2026: heybalkan.com nicht registriert).

### 8.–10. März 2026 – Funktionen
- Startseite statt Login-Redirect
- Profil bearbeiten, Foto-Upload im Onboarding (Supabase Storage)
- Discover filtert nach Geschlecht, Alter, Religion, Herkunft und Region
- **Porodica-Modus:** Familienmitglieder anlegen, per Einladungslink ohne eigenes Konto Profile vorschlagen
- Migrations-Runner `heybalkan-web/migrate.mjs` mit Tabelle `_migrations`
- Web-App auf Vercel (Projekt `hey-balkan`, Produktion = Branch `main`)

### 7. Mai 2026 – Security-Hardening (Branch `codex/security-launch-hardening`)
- Offene anon-Policies (Warteliste, Profile, Porodica) durch eng begrenzte RPCs ersetzt: `harden-waitlist-public-access.sql`, `harden-porodica-public-access.sql`
- Supabase-Zugangsdaten aus dem Code in Env-Variablen verschoben. Das alte DB-Passwort steht noch im Git-Verlauf von `main` und wurde in Supabase geändert.

### Oktober/November 2026 – Launch-Readiness (Branch `launch-readiness`, auf GitHub, nicht in `main`)
- **Melden und Blockieren** in Discover, Matches und Chat. Blockierte Personen verschwinden für beide Seiten überall, auch im Porodica-Modus.
- Matches entstehen nur noch bei gegenseitigem Like
- **Konto löschen** im Profil (Fotos, Selfie, Profil, Matches, Nachrichten, Auth-User)
- **18+-Prüfung** im Onboarding und als Datenbank-Constraint
- **Selfie-Verifizierung** (privater Bucket, Status pending/verified, manuelle Freigabe in Supabase, Badge in Discover, Profil, Matches und Chat)
- Foto-Storage: Hochladen, Ändern und Löschen nur noch im eigenen Ordner
- **Rechtsseiten** `/impressum`, `/datenschutz`, `/agb` (DSG + DSGVO), Footer-Links, zwei Zustimmungs-Checkboxen bei der Registrierung
- Landing: "Coming Soon – Frühling 2026" ersetzt (alle 4 Sprachen)
- Fake-Daten-Skripte nach `supabase/dev-seeds/` verschoben, nicht mehr in den Migrationen
- Neue Migration `add-launch-readiness.sql`. Der Runner läuft jetzt pro Datei in einer Transaktion und stoppt beim ersten Fehler.
- `STATUS.md`, `HANDOVER.md`, `AGENTS.md`/`CLAUDE.md`, Prüfskripte in `supabase/checks/`
- Build und Lint fehlerfrei. **Datenbank-Teil noch nicht ausgeführt** (kein DB-Zugang, siehe `STATUS.md`).

---

## Dateien

| Datei/Ordner | Beschreibung |
|-------------|-------------|
| `heybalkan-web/` | **Next.js Web-App (Haupt-App)** |
| `heybalkan-web/src/app/auth/` | Login & Signup (inkl. Zustimmungen) |
| `heybalkan-web/src/app/app/onboarding/` | 7-Schritt-Onboarding (inkl. 18+) |
| `heybalkan-web/src/app/app/discover/` | Swipe-Interface |
| `heybalkan-web/src/app/app/matches/` | Matches-Übersicht |
| `heybalkan-web/src/app/app/chat/` | Chat-Liste + Chat-Raum |
| `heybalkan-web/src/app/app/porodica/` | Porodica-Modus (eingeloggt) |
| `heybalkan-web/src/app/porodica/[code]/` | Porodica-Einladungslink (ohne Konto) |
| `heybalkan-web/src/app/app/profile/` | Profil, Verifizierung, Konto löschen |
| `heybalkan-web/src/app/impressum`, `datenschutz`, `agb` | Rechtsseiten |
| `heybalkan-web/src/lib/legal.ts` | **Platzhalter für die Rechtstexte** (Name, Adresse, E-Mail …) |
| `heybalkan-web/src/components/` | Melden/Blockieren, Badge, Verifizierung, Konto löschen, Rechtslayout |
| `heybalkan-web/src/i18n/translations.ts` | 4 Sprachen |
| `heybalkan-web/migrate.mjs` | Migrations-Runner (`npm run migrate`) |
| `*.sql` im Root | Migrationen (Reihenfolge in `migrate.mjs`) |
| `supabase/checks/` | DB-Prüfung (nur lesend) und RLS-Test (mit Rollback) |
| `supabase/dev-seeds/` | Fake-Daten, **nur für Dev-/Demo-Datenbanken** |
| `src/` (Root) | Landing Page mit Warteliste (Vite) |
| `heybalkan-app/` | React-Native-App (Backup, nicht anfassen) |
| `heybalkan-landing/` | alte Kopie der Landing |
| `instagram-posts/` | 10 Social-Media-Posts + Captions |

---

## Nächste Schritte

### Jetzt (Blocker)
- [ ] `DATABASE_URL` in `heybalkan-web/.env.local` eintragen (Anleitung: `HANDOVER.md` Abschnitt 7.1). **Passwort nie in den Chat oder ins Repo.**
- [ ] Danach: DB prüfen, Migrationen testen und ausführen (`HANDOVER.md` 7.2–7.5)

### Vor dem Go-Live
- [ ] Platzhalter in `heybalkan-web/src/lib/legal.ts` ausfüllen, Rechtstexte prüfen lassen
- [ ] Erfundene Testimonials auf der Startseite entfernen oder ersetzen
- [ ] Fake-Daten in Produktion löschen? (nach DB-Prüfung entscheiden)
- [ ] Vercel: Env-Variablen und Deployment Protection prüfen
- [ ] Preview-Deployment von `launch-readiness` durchklicken
- [ ] Dann `launch-readiness` in `main` mergen

Komplette Go-Live-Checkliste: `HANDOVER.md` Abschnitt 7.10.

### Später
- [ ] Domain registrieren (heybalkan.com ist frei)
- [ ] Entblocken in der App, Moderations-Oberfläche
- [ ] Profildaten für andere User auf das Nötige beschränken
- [ ] Push-Notifications, Bezahlfunktion (bewusst noch nicht)
- [ ] Pitch Deck

---

## Lokal starten

```bash
cd heybalkan-web
npm install
npm run dev        # http://localhost:3000 – achtung: nutzt die Produktions-Datenbank
npm run lint
npm run build
npm run migrate -- --status
```

## Vercel

- Projekt `hey-balkan`, Root Directory `heybalkan-web`, Produktion = Branch `main`
- Env-Variablen: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Die Vite-Landing braucht `VITE_SUPABASE_URL` und `VITE_SUPABASE_ANON_KEY`
