// =============================================
// Hey Balkan - DB-Zustand pruefen (NUR LESEND)
// =============================================
// Laeuft in einer READ ONLY Transaktion und aendert nichts.
// Gibt DATABASE_URL nie aus.
//
// Usage (aus heybalkan-web/):
//   node --env-file=.env.local ../supabase/checks/db-check.mjs
// =============================================

import { createRequire } from 'module';

const require = createRequire(new URL('../../heybalkan-web/package.json', import.meta.url));
const pg = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL fehlt (heybalkan-web/.env.local).');
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();
await client.query('BEGIN READ ONLY');

const q = async (label, sql) => {
  try {
    const { rows } = await client.query(sql);
    console.log(`\n## ${label}`);
    console.table(rows);
  } catch (e) {
    console.log(`\n## ${label}\n  FEHLER: ${e.message}`);
  }
};

await q('Postgres-Version', `select current_setting('server_version') as version, current_user`);
await q('_migrations: existiert / RLS / anon-Rechte', `
  select c.relname, c.relrowsecurity as rls_enabled,
    has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
    has_table_privilege('anon', c.oid, 'INSERT') as anon_insert
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relname = '_migrations'`);
await q('_migrations: Eintraege', `select filename, executed_at from public._migrations order by id`);
await q('RLS auf allen public-Tabellen', `
  select c.relname, c.relrowsecurity as rls
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' order by 1`);
await q('Policies public', `
  select tablename, policyname, roles::text, cmd, permissive, qual
  from pg_policies where schemaname = 'public' order by tablename, policyname`);
await q('Hardening-/Launch-RPCs vorhanden?', `
  select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and proname in (
    'join_waitlist','get_waitlist_entry','save_waitlist_profile',
    'get_porodica_invite','get_porodica_browse_profiles','create_porodica_suggestion',
    'is_blocked_with','delete_my_account','request_verification') order by 1`);
await q('Storage-Policies', `
  select policyname, roles::text, cmd, qual, with_check
  from pg_policies where schemaname = 'storage' and tablename = 'objects' order by policyname`);
await q('Storage-Buckets', `select id, public, file_size_limit, allowed_mime_types from storage.buckets`);
await q('Trigger auf storage.objects', `
  select tgname, pg_get_triggerdef(t.oid) as def from pg_trigger t
  where tgrelid = 'storage.objects'::regclass and not tgisinternal`);
await q('FKs von storage.objects', `
  select conname, pg_get_constraintdef(oid) from pg_constraint
  where conrelid = 'storage.objects'::regclass and contype = 'f'`);
await q('Profile-Spalten (Auswahl)', `
  select column_name, data_type, column_default from information_schema.columns
  where table_schema = 'public' and table_name = 'profiles'
    and column_name in ('is_verified','verification_status','birth_date','onboarding_complete')`);
await q('Constraints profiles/blocks', `
  select conrelid::regclass as tbl, conname, pg_get_constraintdef(oid) as def from pg_constraint
  where conrelid = 'public.profiles'::regclass
     or (to_regclass('public.blocks') is not null and conrelid = to_regclass('public.blocks'))`);
await q('FKs auf auth.users', `
  select conrelid::regclass as tbl, conname, pg_get_constraintdef(oid) as def from pg_constraint
  where confrelid = 'auth.users'::regclass`);
await q('Trigger auf auth.users (z.B. handle_new_user)', `
  select tgname, pg_get_triggerdef(t.oid) as def from pg_trigger t
  where tgrelid = 'auth.users'::regclass and not tgisinternal`);
await q('Zahlen: Nutzer, Fake-Daten, Altersverstoesse', `
  select
    (select count(*) from auth.users) as auth_users,
    (select count(*) from auth.users where email like '%@heybalkan.fake') as fake_auth_users,
    (select count(*) from public.profiles) as profiles,
    (select count(*) from public.profiles where id::text like 'a0000001-%') as fake12_profiles,
    (select count(*) from public.profiles where id::text like 'f0000001-%') as fake1000_profiles,
    (select count(*) from public.profiles where is_verified) as verified_true,
    (select count(*) from public.profiles where birth_date > (current_date - interval '18 years')::date) as under_18,
    (select count(*) from public.waitlist) as waitlist`);
await q('Aktivitaet', `
  select
    (select count(*) from public.matches) as matches,
    (select count(*) from public.messages) as messages,
    (select count(*) from public.swipes) as swipes,
    (select count(*) from public.family_members) as family_members,
    (select count(*) from public.porodica_suggestions) as suggestions`);
await q('blocks/reports vorhanden?', `
  select to_regclass('public.blocks') as blocks, to_regclass('public.reports') as reports`);
await q('Self-Blocks (verletzen spaeter blocks_not_self)', `
  select count(*) from public.blocks where blocker_id = blocked_id`);

await client.query('ROLLBACK');
await client.end();
