// =============================================
// Hey Balkan - RLS-Test fuer add-launch-readiness.sql
// =============================================
// Spielt die uebergebenen Migrationen in EINER Transaktion ein, legt
// 3 Test-User an, prueft Blockieren/Melden/Matches/Verifizierung/Storage/
// 18+/Konto loeschen/Porodica und rollt am Ende ALLES zurueck.
// Gibt DATABASE_URL nie aus.
//
// Usage (aus heybalkan-web/), nur noch nicht gelaufene Migrationen angeben:
//   node --env-file=.env.local ../supabase/checks/rls-test.mjs \
//     ../harden-waitlist-public-access.sql \
//     ../harden-porodica-public-access.sql \
//     ../add-launch-readiness.sql
//
// Hinweis: Die DDL haelt waehrend des Tests kurz Sperren auf profiles,
// matches usw. (wenige Sekunden). Nicht unter Last laufen lassen.
// Bisher NIE gelaufen (kein DB-Zugang), Testcode selbst ist ungeprueft.
// =============================================

import fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(new URL('../../heybalkan-web/package.json', import.meta.url));
const pg = require('pg');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL fehlt (heybalkan-web/.env.local).');
  process.exit(1);
}

const files = process.argv.slice(2);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

let pass = 0;
let fail = 0;
const ok = (cond, label, extra = '') => {
  if (cond) { pass++; console.log(`  PASS  ${label}`); }
  else { fail++; console.log(`  FAIL  ${label} ${extra}`); }
};

const A = '00000000-7e57-4000-a000-00000000000a';
const B = '00000000-7e57-4000-a000-00000000000b';
const C = '00000000-7e57-4000-a000-00000000000c';

async function as(uid, fn) {
  await client.query(`select set_config('request.jwt.claims', $1, true), set_config('request.jwt.claim.sub', $2, true)`,
    [JSON.stringify({ sub: uid, role: 'authenticated' }), uid]);
  await client.query('set local role authenticated');
  try { return await fn(); } finally { await client.query('reset role'); }
}
async function asAnon(fn) {
  await client.query(`select set_config('request.jwt.claims', '{"role":"anon"}', true), set_config('request.jwt.claim.sub', '', true)`);
  await client.query('set local role anon');
  try { return await fn(); } finally { await client.query('reset role'); }
}
// Erwarteter Fehler: per Savepoint abfangen, Transaktion bleibt nutzbar
async function tryQ(sql, params = []) {
  await client.query('savepoint sp');
  try {
    const r = await client.query(sql, params);
    await client.query('release savepoint sp');
    return { ok: true, rows: r.rows, rowCount: r.rowCount };
  } catch (e) {
    await client.query('rollback to savepoint sp');
    return { ok: false, error: e.message, code: e.code };
  }
}

try {
  await client.query('BEGIN');
  for (const f of files) {
    console.log(`Migration (in Transaktion): ${f}`);
    await client.query(fs.readFileSync(f, 'utf8'));
  }

  // --- Testdaten (nur in dieser Transaktion) ---
  for (const [id, mail] of [[A, 'a'], [B, 'b'], [C, 'c']]) {
    await client.query(`insert into auth.users (id, instance_id, aud, role, email, created_at, updated_at)
      values ($1, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', $2, now(), now())`,
      [id, `rls-test-${mail}@example.invalid`]);
  }
  const adult = '1995-05-05';
  await client.query(`insert into public.profiles (id, first_name, birth_date, origin_country, gender, looking_for, onboarding_complete)
    values ($1,'TestA',$4,'RS','male','female',true), ($2,'TestB',$4,'HR','female','male',true), ($3,'TestC',$4,'BA','female','male',true)`,
    [A, B, C, adult]);

  console.log('\n== 18+ ==');
  let r = await as(A, () => tryQ(`update public.profiles set birth_date = (current_date - interval '17 years')::date where id = $1`, [A]));
  ok(!r.ok && r.code === '23514', 'Update auf 17 Jahre wird abgelehnt', JSON.stringify(r));
  r = await tryQ(`insert into public.profiles (id, first_name, birth_date, origin_country) values ('00000000-7e57-4000-a000-0000000000dd','Kid',(current_date - interval '16 years')::date,'RS')`);
  ok(!r.ok && r.code === '23514', 'Insert mit 16 Jahren wird abgelehnt', JSON.stringify(r));
  r = await as(A, () => tryQ(`update public.profiles set birth_date = (current_date - interval '18 years')::date where id = $1`, [A]));
  ok(r.ok, 'Genau 18 Jahre ist erlaubt', JSON.stringify(r));

  console.log('\n== Verifizierung ==');
  await as(A, () => client.query(`update public.profiles set verification_status = 'verified', is_verified = true where id = $1`, [A]));
  r = await client.query(`select verification_status, is_verified from public.profiles where id = $1`, [A]);
  ok(r.rows[0].verification_status === 'none' && r.rows[0].is_verified === false, 'User kann sich nicht selbst verifizieren', JSON.stringify(r.rows[0]));
  r = await as(A, () => tryQ(`select public.request_verification()`));
  ok(!r.ok && /Selfie missing/.test(r.error), 'request_verification ohne Selfie schlaegt fehl', JSON.stringify(r));
  r = await as(A, () => tryQ(`insert into storage.objects (bucket_id, name, owner) values ('verifications', $1, $2)`, [`${B}/selfie.jpg`, A]));
  ok(!r.ok, 'Selfie in fremden Ordner hochladen wird abgelehnt', JSON.stringify(r));
  r = await as(A, () => tryQ(`insert into storage.objects (bucket_id, name, owner) values ('verifications', $1, $2)`, [`${A}/selfie.jpg`, A]));
  ok(r.ok, 'Selfie in eigenen Ordner hochladen klappt', JSON.stringify(r));
  r = await as(B, () => tryQ(`select name from storage.objects where bucket_id = 'verifications'`));
  ok(r.ok && r.rows.length === 0, 'Fremde Selfies sind nicht sichtbar', JSON.stringify(r));
  r = await as(A, () => tryQ(`select public.request_verification() as s`));
  ok(r.ok && r.rows[0].s === 'pending', 'request_verification mit Selfie -> pending', JSON.stringify(r));
  await client.query(`update public.profiles set verification_status = 'verified' where id = $1`, [A]);
  r = await client.query(`select is_verified, verification_reviewed_at is not null as reviewed from public.profiles where id = $1`, [A]);
  ok(r.rows[0].is_verified && r.rows[0].reviewed, 'Admin-Freigabe setzt is_verified + reviewed_at', JSON.stringify(r.rows[0]));

  console.log('\n== Foto-Storage ==');
  r = await as(B, () => tryQ(`insert into storage.objects (bucket_id, name, owner) values ('photos', $1, $2)`, [`${A}/hack.jpg`, B]));
  ok(!r.ok, 'Upload in fremden Foto-Ordner wird abgelehnt', JSON.stringify(r));
  r = await as(B, () => tryQ(`insert into storage.objects (bucket_id, name, owner) values ('photos', $1, $2)`, [`${B}/me.jpg`, B]));
  ok(r.ok, 'Upload in eigenen Foto-Ordner klappt', JSON.stringify(r));
  r = await as(A, () => tryQ(`delete from storage.objects where bucket_id = 'photos' and name = $1`, [`${B}/me.jpg`]));
  ok(r.ok && r.rowCount === 0, 'Fremdes Foto loeschen wirkt nicht', JSON.stringify(r));

  console.log('\n== Matches nur bei gegenseitigem Like ==');
  r = await as(A, () => tryQ(`insert into public.matches (user1_id, user2_id) values ($1, $2)`, [A, B]));
  ok(!r.ok, 'Match ohne Likes wird abgelehnt', JSON.stringify(r));
  await as(A, () => client.query(`insert into public.swipes (swiper_id, swiped_id, action) values ($1, $2, 'like')`, [A, B]));
  r = await as(A, () => tryQ(`insert into public.matches (user1_id, user2_id) values ($1, $2)`, [A, B]));
  ok(!r.ok, 'Match mit einseitigem Like wird abgelehnt', JSON.stringify(r));
  await as(B, () => client.query(`insert into public.swipes (swiper_id, swiped_id, action) values ($1, $2, 'super_like')`, [B, A]));
  r = await as(A, () => tryQ(`insert into public.matches (user1_id, user2_id) values ($1, $2) returning id`, [A, B]));
  ok(r.ok, 'Match bei gegenseitigem Like klappt', JSON.stringify(r));
  const matchId = r.rows?.[0]?.id;
  r = await as(B, () => tryQ(`insert into public.messages (match_id, sender_id, content) values ($1, $2, 'hallo')`, [matchId, B]));
  ok(r.ok, 'Nachricht im Match senden klappt', JSON.stringify(r));

  console.log('\n== Melden ==');
  r = await as(A, () => tryQ(`insert into public.reports (reporter_id, reported_id, match_id, context, reason, details) values ($1, $2, $3, 'chat', 'harassment', 'test')`, [A, B, matchId]));
  ok(r.ok, 'Melden klappt', JSON.stringify(r));
  r = await as(A, () => tryQ(`insert into public.reports (reporter_id, reported_id, reason) values ($1, $2, 'spam_scam')`, [B, C]));
  ok(!r.ok, 'Melden im Namen anderer wird abgelehnt', JSON.stringify(r));
  r = await as(A, () => tryQ(`insert into public.reports (reporter_id, reported_id, reason, status) values ($1, $2, 'other', 'resolved')`, [A, C]));
  ok(!r.ok, 'Status beim Melden nicht manipulierbar', JSON.stringify(r));
  r = await as(B, () => tryQ(`select * from public.reports`));
  ok(r.ok && r.rows.length === 0, 'Gemeldete Person sieht keine Meldungen', JSON.stringify(r));

  console.log('\n== Blockieren ==');
  r = await as(B, () => tryQ(`insert into public.blocks (blocker_id, blocked_id) values ($1, $1)`, [B]));
  ok(!r.ok, 'Sich selbst blockieren geht nicht', JSON.stringify(r));
  r = await as(B, () => tryQ(`select count(*)::int n from public.profiles where id = $1`, [A]));
  ok(r.rows[0].n === 1, 'Vor dem Block: B sieht A');
  r = await as(A, () => tryQ(`insert into public.blocks (blocker_id, blocked_id) values ($1, $2)`, [A, B]));
  ok(r.ok, 'A blockiert B', JSON.stringify(r));
  r = await as(B, () => tryQ(`select count(*)::int n from public.profiles where id = $1`, [A]));
  ok(r.rows[0].n === 0, 'Blockierte B sieht A nicht mehr (Discover)');
  r = await as(A, () => tryQ(`select count(*)::int n from public.profiles where id = $1`, [B]));
  ok(r.rows[0].n === 0, 'A sieht B nicht mehr');
  r = await as(A, () => tryQ(`select count(*)::int n from public.profiles where id in ($1, $2)`, [A, C]));
  ok(r.rows[0].n === 2, 'A sieht sich selbst und Unbeteiligte weiterhin');
  r = await as(B, () => tryQ(`select count(*)::int n from public.matches where id = $1`, [matchId]));
  ok(r.rows[0].n === 0, 'Match ist fuer B verschwunden (Matches/Chat)');
  r = await as(A, () => tryQ(`select count(*)::int n from public.matches where id = $1`, [matchId]));
  ok(r.rows[0].n === 0, 'Match ist fuer A verschwunden');
  r = await as(B, () => tryQ(`select count(*)::int n from public.messages where match_id = $1`, [matchId]));
  ok(r.rows[0].n === 0, 'Nachrichten sind fuer B nicht mehr lesbar');
  r = await as(B, () => tryQ(`insert into public.messages (match_id, sender_id, content) values ($1, $2, 'noch da?')`, [matchId, B]));
  ok(!r.ok, 'B kann A keine Nachricht mehr schicken', JSON.stringify(r));
  r = await as(B, () => tryQ(`insert into public.matches (user1_id, user2_id) values ($1, $2)`, [B, A]));
  ok(!r.ok, 'B kann keinen neuen Match mit A anlegen', JSON.stringify(r));
  r = await as(B, () => tryQ(`select * from public.blocks`));
  ok(r.rows.length === 0, 'B sieht nicht, wer B blockiert hat');

  console.log('\n== Porodica ==');
  const { rows: fm } = await client.query(`insert into public.family_members (owner_id, name, relation_type) values ($1, 'Mama', 'mama') returning invite_code`, [B]);
  const code = fm[0].invite_code;
  r = await asAnon(() => tryQ(`select id from public.get_porodica_browse_profiles($1, 50)`, [code]));
  const ids = (r.rows || []).map(x => x.id);
  ok(r.ok && !ids.includes(A), 'Familien-Browse zeigt blockierte Person nicht', JSON.stringify(r));
  r = await asAnon(() => tryQ(`select public.create_porodica_suggestion($1, $2, null)`, [code, A]));
  ok(!r.ok, 'Familie kann blockierte Person nicht vorschlagen', JSON.stringify(r));
  r = await asAnon(() => tryQ(`select * from public.waitlist limit 1`));
  ok(!r.ok || r.rows.length === 0, 'anon kann Warteliste nicht lesen', JSON.stringify(r).slice(0, 200));
  r = await asAnon(() => tryQ(`select * from public.family_members limit 1`));
  ok(!r.ok || r.rows.length === 0, 'anon kann family_members nicht lesen');
  r = await asAnon(() => tryQ(`select * from public._migrations limit 1`));
  ok(!r.ok || r.rows.length === 0, 'anon kann _migrations nicht lesen', JSON.stringify(r).slice(0, 200));

  console.log('\n== Konto loeschen ==');
  r = await asAnon(() => tryQ(`select public.delete_my_account()`));
  ok(!r.ok, 'anon kann delete_my_account nicht aufrufen', JSON.stringify(r));
  // Selfie-Objekt von A entfernen, wie es die App vorher ueber die Storage-API tut.
  // Neuere Supabase-Versionen verbieten DELETE auf storage.objects per SQL -> nur Info.
  r = await tryQ(`delete from storage.objects where bucket_id = 'verifications' and name = $1`, [`${A}/selfie.jpg`]);
  console.log(`  info  Storage-Delete per SQL: ${r.ok ? 'erlaubt' : r.error}`);
  r = await as(A, () => tryQ(`select public.delete_my_account()`));
  ok(r.ok, 'A loescht eigenes Konto', JSON.stringify(r));
  r = await client.query(`select
      (select count(*) from auth.users where id = $1)::int as auth,
      (select count(*) from public.profiles where id = $1)::int as profile,
      (select count(*) from public.swipes where swiper_id = $1 or swiped_id = $1)::int as swipes,
      (select count(*) from public.matches where user1_id = $1 or user2_id = $1)::int as matches,
      (select count(*) from public.blocks where blocker_id = $1 or blocked_id = $1)::int as blocks,
      (select count(*) from public.reports where reporter_id = $1)::int as reports_linked,
      (select count(*) from public.reports where details = 'test')::int as reports_kept`, [A]);
  const d = r.rows[0];
  ok(d.auth === 0 && d.profile === 0 && d.swipes === 0 && d.matches === 0 && d.blocks === 0, 'Auth-User, Profil, Swipes, Matches, Blocks entfernt', JSON.stringify(d));
  ok(d.reports_linked === 0 && d.reports_kept === 1, 'Meldung bleibt anonymisiert erhalten', JSON.stringify(d));
} catch (e) {
  fail++;
  console.log(`\nABBRUCH: ${e.message}`);
} finally {
  await client.query('ROLLBACK').catch(() => {});
  await client.end();
  console.log(`\nErgebnis: ${pass} PASS, ${fail} FAIL (alles zurueckgerollt)`);
  process.exit(fail ? 1 : 0);
}
