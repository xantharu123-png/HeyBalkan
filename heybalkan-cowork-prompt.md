# Hey Balkan – Projekt-Briefing für Cowork

## Projekt-Übersicht

**Name:** Hey Balkan  
**Typ:** Dating-App für die Balkan-Diaspora im DACH-Raum  
**Status:** Konzeptphase abgeschlossen, bereit für Umsetzung  
**Domains:** heybalkan.com & heybalkan.app (beide verfügbar, noch nicht registriert)

---

## Was ist Hey Balkan?

Hey Balkan ist eine Dating-App speziell für Menschen mit Wurzeln aus Ex-Jugoslawien (Serbien, Kroatien, Bosnien, Montenegro, Nordmazedonien, Kosovo, Slowenien), die in der Schweiz, Deutschland oder Österreich leben.

### Das Killer-Feature: Porodica-Modus 👩‍👦

Ein einzigartiges Feature, das keine andere Dating-App hat: User können optional EIN Familienmitglied (typischerweise die Mutter) einladen, das eingeschränkten Zugang bekommt:

**Was Mama KANN:**
- Profile ansehen (Fotos, Herkunft, Beruf, Religion)
- Profile "vorschlagen" → Kind bekommt Push-Notification: "Deine Mama findet, du solltest dir Marko aus Zürich anschauen 👀"
- Ein Herzchen vergeben (Super-Like von Mama)

**Was Mama NICHT kann:**
- Chats lesen
- Im Namen des Kindes swipen
- Versteckte Matches sehen

**Warum das funktioniert:**
- Balkan-Mütter WOLLEN involviert sein (kulturell relevant)
- Virales Marketing-Potenzial ("Die App wo deine Mama dir Männer vorschlägt")
- Eisbrecher: "Meine Mama hat dich geliked"
- Medien-Story garantiert
- Differenzierung von ALLEN anderen Dating-Apps weltweit

---

## Zielgruppe

**Primär:** Singles (18-45 Jahre) mit Wurzeln aus:
- 🇷🇸 Serbien
- 🇭🇷 Kroatien
- 🇧🇦 Bosnien und Herzegowina
- 🇲🇪 Montenegro
- 🇲🇰 Nordmazedonien
- 🇽🇰 Kosovo
- 🇸🇮 Slowenien

**Geografischer Fokus:** 
1. Schweiz (Start – 400.000 Ex-Yu Bevölkerung)
2. Deutschland (Expansion – 1.5 Mio)
3. Österreich (Expansion – 500.000)

**Gesamtmarkt:** ~72.000 potenzielle aktive User im DACH-Raum

---

## Konkurrenz-Situation

**Wichtigste Erkenntnis: Der Markt ist praktisch leer!**

| Konkurrent | Downloads | Problem |
|------------|-----------|---------|
| Upoznaj me Balkan | **680 total** | Winzige Nutzerbasis, keine differenzierenden Features |
| SerbianLove | ~10.000 | Nur für Serben, veraltetes UI |
| dua.com | ~50.000 | Nur für Albaner |

→ Es gibt KEINE moderne, gut designte App für die gesamte Balkan-Diaspora.

---

## Bereits erstellte Materialien

Folgende Dateien wurden bereits erstellt und können als Grundlage verwendet werden:

1. **heybalkan-prototype.jsx** – Klickbarer React-Prototyp der App
   - Splash Screen mit Logo
   - Swipe-Interface mit Beispiel-Profilen
   - Match-Animation
   - Porodica-Modus mit Mama-Benachrichtigungen
   - Bottom Navigation

2. **heybalkan-landing.jsx** – Landing Page für Wartelist-Signups
   - Hero Section mit Email-Signup
   - Herkunftsland-Auswahl
   - Feature-Erklärungen
   - Testimonials
   - Responsive Design

3. **heybalkan-business-plan.md** – Vollständiger Business Plan
   - Marktanalyse
   - Kostenübersicht (CHF 17k - 120k für MVP)
   - Monetarisierungsstrategie
   - Go-to-Market Plan
   - Timeline

4. **heybalkan-konkurrenzanalyse.md** – Detaillierte Wettbewerbsanalyse

---

## Branding & Design

**Farbschema:**
- Primär: Gradient von Sky-500 (#0ea5e9) über Indigo-600 (#4f46e5) zu Purple-700 (#7c3aed)
- Akzent: Purple für Porodica-Modus
- Neutral: Stone-Töne

**Logo:** 👋 + "Hey Balkan" (freundlich, einladend)

**Tone of Voice:**
- Freundlich und locker
- Mix aus Deutsch und Balkan-Ausdrücken ("ajde", "naši", etc.)
- Humorvoll aber respektvoll
- Inklusiv für alle Ex-Yu Länder

---

## Monetarisierung

**Freemium-Modell:**

| Tier | Preis | Features |
|------|-------|----------|
| Free | CHF 0 | 10 Likes/Tag, Basis-Chat, 1 Familienmitglied |
| Hey Balkan+ | CHF 14.90/Monat | Unbegrenzte Likes, Sehen wer dich liked, erweiterte Filter |
| Hey Balkan Gold | CHF 24.90/Monat | Alles von +, Boosts, Video-Anrufe, bis zu 3 Familienmitglieder |

**Revenue-Prognose:**
- Monat 12: 10.000 MAU, CHF 7.500 MRR
- Monat 18: 25.000 MAU, CHF 21.250 MRR (Break-Even)
- Monat 24: 40.000 MAU, CHF 36.000 MRR

---

## Technologie-Empfehlung

**Frontend:** React Native (Cross-Platform) mit Expo
**Backend:** Node.js + Express + PostgreSQL
**Infrastruktur:** AWS oder DigitalOcean
**Push Notifications:** Firebase
**Verifizierung:** Selfie-Check gegen Fake-Profile

**Geschätzte Entwicklungskosten:**
- Low-Budget (Templates): CHF 17.000 - 28.000
- Standard (Offshore): CHF 41.000 - 65.000
- Premium: CHF 80.000 - 120.000

---

## Nächste Schritte (Priorisiert)

### Phase 1: Sofort (Diese Woche)
- [ ] Domain registrieren: heybalkan.com
- [ ] Instagram-Account erstellen: @heybalkan.app
- [ ] TikTok-Account erstellen: @heybalkan.app
- [ ] Landing Page auf Vercel deployen

### Phase 2: Pre-Launch (4-6 Wochen)
- [ ] Social Media Content-Plan erstellen
- [ ] Erste Memes/Posts für Balkan-Community
- [ ] Facebook-Gruppen identifizieren (Srbi u Švajcarskoj, Hrvati u Njemačkoj, etc.)
- [ ] Micro-Influencer recherchieren
- [ ] Email-Liste aufbauen (Ziel: 500 Signups)

### Phase 3: Entwicklung (3-5 Monate)
- [ ] Entwickler-Agenturen briefen (3-5 Offerten)
- [ ] UI/UX Design finalisieren
- [ ] MVP entwickeln
- [ ] Beta-Test mit 50 Usern
- [ ] App Store Submission

### Phase 4: Launch
- [ ] Soft Launch nur in Zürich
- [ ] PR-Kampagne (20 Minuten, Watson)
- [ ] Referral-Programm aktivieren
- [ ] Bei 2.000 Usern: Deutschland-Expansion

---

## Wichtige Entscheidungen (bereits getroffen)

1. **Name:** Hey Balkan (nicht "Naši" – zu exklusiv für Nicht-Muttersprachler)
2. **Modell:** Tinder-Style Swipe + Hybrid-Features (beide können schreiben nach Match)
3. **USP:** Porodica-Modus als virales Differenzierungsmerkmal
4. **Fokus:** DACH-Diaspora zuerst, nicht Balkan-Länder selbst
5. **Monetarisierung:** Freemium mit Premium-Tiers

---

## Kontext für AI-Assistenten

Wenn du mit diesem Projekt weiterarbeitest, beachte:

1. **Kulturelle Sensibilität:** Die Balkan-Region hat komplexe Geschichte. Die App soll ALLE Ex-Yu Länder inklusiv ansprechen, ohne politische Spannungen zu triggern.

2. **Humor ist wichtig:** Der Porodica-Modus funktioniert nur, wenn er mit Augenzwinkern präsentiert wird. Die Zielgruppe versteht den Witz.

3. **Sprach-Mix:** Content sollte primär Deutsch sein, aber mit authentischen Balkan-Ausdrücken gespickt (ajde, brate, naši, ćevapi, rakija, etc.)

4. **Familie ist zentral:** In der Balkan-Kultur ist Familie extrem wichtig. Das ist kein Klischee, sondern Realität. Der Porodica-Modus greift das auf.

5. **Qualität vor Quantität:** Lieber weniger aber aktive User als eine leere App. Deshalb Soft-Launch in einer Stadt (Zürich).

---

## Dateien zum Anhängen

Bitte lade folgende Dateien hoch, wenn du in Cowork weiterarbeitest:
- heybalkan-prototype.jsx
- heybalkan-landing.jsx
- heybalkan-business-plan.md
- heybalkan-konkurrenzanalyse.md

---

## Beispiel-Prompts für Cowork

**Landing Page deployen:**
"Deploye die heybalkan-landing.jsx auf Vercel. Die Domain soll heybalkan.com sein (oder temporär eine Vercel-Subdomain). Füge ein funktionierendes Email-Signup hinzu, das die Adressen in einer Datenbank speichert."

**Social Media Content:**
"Erstelle 10 Instagram-Posts für @heybalkan.app. Mix aus: 
- Balkan-Dating-Memes (auf Deutsch mit Balkan-Wörtern)
- Teaser für den Porodica-Modus
- 'Coming Soon' Ankündigungen
Zielgruppe: 20-35 Jahre, Balkan-Diaspora in der Schweiz."

**Entwickler-Briefing:**
"Erstelle ein detailliertes Technical Requirements Document für Hey Balkan. Basierend auf dem Business Plan und Prototyp. Fokus auf MVP-Features. Ziel: Dieses Dokument an 3-5 Entwickler-Agenturen schicken für Offerten."

**Pitch Deck:**
"Erstelle ein 10-Slide Pitch Deck für Hey Balkan für potenzielle Investoren oder Business Angels. Basierend auf dem Business Plan. Visuell ansprechend, mit dem Hey Balkan Branding."

---

*Erstellt: Februar 2026*
*Projekt-Owner: Miroslav*
