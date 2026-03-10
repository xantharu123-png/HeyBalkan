# Hey Balkan Landing Page – Deployment auf Vercel

## Option 1: Vercel Dashboard (einfachste Methode)

1. Gehe zu [vercel.com/new](https://vercel.com/new)
2. Klicke "Upload" (kein Git noetig)
3. Ziehe den gesamten `heybalkan-landing` Ordner per Drag & Drop rein
4. Vercel erkennt automatisch Vite + React
5. Klicke "Deploy"
6. Fertig! Du bekommst eine URL wie `heybalkan-landing.vercel.app`

## Option 2: Vercel CLI

```bash
cd heybalkan-landing
npm install
npx vercel login
npx vercel deploy --prod
```

## Option 3: GitHub + Vercel (empfohlen fur langfristig)

```bash
# 1. Neues GitHub Repo erstellen: github.com/new -> "heybalkan-landing"
# 2. Dann:
cd heybalkan-landing
git init
git add .
git commit -m "Initial Hey Balkan landing page"
git remote add origin https://github.com/DEIN-USERNAME/heybalkan-landing.git
git push -u origin main
# 3. In Vercel Dashboard: "Import Git Repository" -> dein Repo auswaehlen
# 4. Jedes git push deployed automatisch!
```

## Custom Domain verbinden

Nachdem deployed:
1. Vercel Dashboard -> dein Projekt -> Settings -> Domains
2. "heybalkan.com" eingeben
3. DNS-Einstellungen bei deinem Domain-Registrar anpassen (Vercel zeigt dir die Werte)

## Technische Details

- Framework: Vite + React
- Styling: Tailwind CSS v4
- Icons: Lucide React
- Build Command: `npm run build`
- Output Directory: `dist`
