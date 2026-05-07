#!/usr/bin/env node
// =============================================
// Hey Balkan - Auto Migration Runner
// =============================================
// Fuehrt alle SQL-Dateien automatisch in Supabase aus
//
// Usage:
//   node migrate.mjs
//
// Benoetigt eine lokale Umgebungsvariable:
//   DATABASE_URL=postgresql://postgres.PROJECT_REF:DEIN_PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
//
// Oder als Umgebungsvariable:
//   DATABASE_URL=... node migrate.mjs
// =============================================

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('\x1b[31mDATABASE_URL fehlt.\x1b[0m');
  console.error('Setze sie lokal, z.B.:');
  console.error('  $env:DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"');
  console.error('  node migrate.mjs');
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
  '../fake-profiles.sql',
];

// Tracking-Tabelle fuer bereits ausgefuehrte Migrations
const TRACKING_SQL = `
CREATE TABLE IF NOT EXISTS public._migrations (
  id serial PRIMARY KEY,
  filename text UNIQUE NOT NULL,
  executed_at timestamptz DEFAULT now()
);
`;

async function run() {
  console.log('\n\x1b[36m🚀 Hey Balkan - Migration Runner\x1b[0m\n');

  const client = new pg.Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

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

    for (const file of MIGRATION_FILES) {
      const filename = path.basename(file);
      const fullPath = path.resolve(__dirname, file);

      if (doneSet.has(filename)) {
        console.log(`  \x1b[90m⏭  ${filename} (bereits ausgefuehrt)\x1b[0m`);
        skipCount++;
        continue;
      }

      if (!fs.existsSync(fullPath)) {
        console.log(`  \x1b[33m⚠  ${filename} (Datei nicht gefunden: ${fullPath})\x1b[0m`);
        continue;
      }

      const sql = fs.readFileSync(fullPath, 'utf-8');

      try {
        console.log(`  \x1b[34m▶  ${filename} ...\x1b[0m`);
        await client.query(sql);
        await client.query('INSERT INTO public._migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
        console.log(`  \x1b[32m✓  ${filename} erfolgreich!\x1b[0m`);
        ranCount++;
      } catch (err) {
        console.error(`  \x1b[31m✗  ${filename} FEHLER:\x1b[0m`);
        console.error(`     ${err.message}`);

        // Bei bestimmten Fehlern (z.B. "already exists") trotzdem als erledigt markieren
        if (err.message.includes('already exists') || err.message.includes('duplicate key')) {
          await client.query('INSERT INTO public._migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING', [filename]);
          console.log(`     \x1b[33m(als erledigt markiert - Objekte existieren bereits)\x1b[0m`);
          ranCount++;
        }
      }
    }

    console.log('');
    console.log(`\x1b[36m📊 Zusammenfassung:\x1b[0m`);
    console.log(`   ${ranCount} Migration(s) ausgefuehrt`);
    console.log(`   ${skipCount} bereits erledigt`);
    console.log(`   ${MIGRATION_FILES.length} total\n`);

  } catch (err) {
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
}

run();
