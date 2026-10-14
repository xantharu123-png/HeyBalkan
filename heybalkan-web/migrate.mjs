#!/usr/bin/env node
// =============================================
// Hey Balkan - Auto Migration Runner
// =============================================
// Fuehrt alle SQL-Dateien automatisch in Supabase aus
//
// Usage:
//   npm run migrate            (liest DATABASE_URL aus .env.local)
//   npm run migrate -- --status   (zeigt nur, was offen ist)
//
// Benoetigt eine lokale Umgebungsvariable (nie committen!):
//   DATABASE_URL=postgresql://postgres.PROJECT_REF:DEIN_PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
//
// Oder als Umgebungsvariable:
//   DATABASE_URL=... node migrate.mjs
//
// Fake-/Demo-Daten liegen in ../supabase/dev-seeds/ und laufen hier NIE mit.
// =============================================

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;
const STATUS_ONLY = process.argv.includes('--status');

if (!DATABASE_URL) {
  console.error('\x1b[31mDATABASE_URL fehlt.\x1b[0m');
  console.error('Trage sie in heybalkan-web/.env.local ein (wird nicht committet) und starte:');
  console.error('  npm run migrate');
  process.exit(1);
}

// Migration files in der richtigen Reihenfolge
const MIGRATION_FILES = [
  '../supabase-setup.sql',
  '../harden-waitlist-public-access.sql',
  '../heybalkan-app/supabase-app-schema.sql',
  '../add-preferences-columns.sql',
  '../add-regions-columns.sql',
  '../add-porodica-tables.sql',
  '../harden-porodica-public-access.sql',
  '../add-launch-readiness.sql',
];

// Tracking-Tabelle fuer bereits ausgefuehrte Migrations
// (RLS an + keine Rechte fuer anon/authenticated, sonst waere sie ueber die API offen)
const TRACKING_SQL = `
CREATE TABLE IF NOT EXISTS public._migrations (
  id serial PRIMARY KEY,
  filename text UNIQUE NOT NULL,
  executed_at timestamptz DEFAULT now()
);
ALTER TABLE public._migrations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public._migrations FROM anon, authenticated;
`;

async function run() {
  console.log('\n\x1b[36m🚀 Hey Balkan - Migration Runner\x1b[0m\n');

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  let failed = false;

  try {
    await client.connect();
    console.log('\x1b[32m✓ Verbunden mit Supabase\x1b[0m\n');

    // Create tracking table
    await client.query(TRACKING_SQL);

    // Check which migrations already ran
    const { rows: done } = await client.query('SELECT filename FROM public._migrations');
    const doneSet = new Set(done.map(r => r.filename));

    let ranCount = 0;
    let skipCount = 0;
    let pendingCount = 0;

    for (const file of MIGRATION_FILES) {
      const filename = path.basename(file);
      const fullPath = path.resolve(__dirname, file);

      if (doneSet.has(filename)) {
        console.log(`  \x1b[90m⏭  ${filename} (bereits ausgefuehrt)\x1b[0m`);
        skipCount++;
        continue;
      }

      if (!fs.existsSync(fullPath)) {
        console.error(`  \x1b[31m✗  ${filename} (Datei nicht gefunden: ${fullPath})\x1b[0m`);
        failed = true;
        break;
      }

      if (STATUS_ONLY) {
        console.log(`  \x1b[33m•  ${filename} (offen)\x1b[0m`);
        pendingCount++;
        continue;
      }

      const sql = fs.readFileSync(fullPath, 'utf-8');

      // Datei + Tracking-Eintrag atomar: entweder beides oder nichts
      try {
        console.log(`  \x1b[34m▶  ${filename} ...\x1b[0m`);
        await client.query('BEGIN');
        await client.query(sql);
        await client.query('INSERT INTO public._migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
        await client.query('COMMIT');
        console.log(`  \x1b[32m✓  ${filename} erfolgreich!\x1b[0m`);
        ranCount++;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => {});
        console.error(`  \x1b[31m✗  ${filename} FEHLER (zurueckgerollt, nichts geaendert):\x1b[0m`);
        console.error(`     ${err.message}`);
        console.error('     Abbruch: nachfolgende Migrationen bauen evtl. darauf auf.');
        failed = true;
        break;
      }
    }

    console.log('');
    console.log(`\x1b[36m📊 Zusammenfassung:\x1b[0m`);
    if (STATUS_ONLY) {
      console.log(`   ${pendingCount} offen`);
    } else {
      console.log(`   ${ranCount} Migration(s) ausgefuehrt`);
    }
    console.log(`   ${skipCount} bereits erledigt`);
    console.log(`   ${MIGRATION_FILES.length} total\n`);

  } catch (err) {
    failed = true;
    console.error('\x1b[31m✗ Verbindungsfehler:\x1b[0m', err.message);
    console.log('');
    console.log('Moegliche Ursachen:');
    console.log('  - Falsches Passwort in DATABASE_URL');
    console.log('  - Supabase Projekt ist pausiert');
    console.log('  - Firewall blockiert die Verbindung');
    console.log('');
  } finally {
    await client.end();
  }

  if (failed) process.exit(1);
}

run();
