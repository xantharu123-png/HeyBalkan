import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung – Hey Balkan',
};

export default function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung">
      <p>
        Diese Datenschutzerklärung erklärt, welche Personendaten wir bei Hey Balkan bearbeiten,
        wozu, wer sie sieht und welche Rechte du hast. Sie gilt für die Web-App Hey Balkan
        (inkl. Porodica-Modus) und die Warteliste. Massgebend sind das Schweizer
        Datenschutzgesetz (DSG) und, soweit anwendbar, die Datenschutz-Grundverordnung der EU
        (DSGVO).
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {LEGAL.operator}<br />
        {LEGAL.address}<br />
        {LEGAL.country}<br />
        E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>
      <p>Vertreter in der EU (Art. 27 DSGVO): {LEGAL.euRepresentative}</p>

      <h2>2. Welche Daten wir bearbeiten</h2>
      <h3>Konto</h3>
      <ul>
        <li>E-Mail-Adresse und Passwort (das Passwort nur verschlüsselt als Hash)</li>
        <li>Zeitpunkt, zu dem du AGB, Datenschutzerklärung und Einwilligung bestätigt hast</li>
      </ul>
      <h3>Profil</h3>
      <ul>
        <li>Vorname, Geburtsdatum, Geschlecht, wen du suchst (Frauen, Männer, beide)</li>
        <li>Herkunftsland und -region, Sprachen, Wohnort und Wohnsitzland</li>
        <li>Religion (freiwillig), Beziehungsziel, Text über dich, Fotos</li>
        <li>Suchpräferenzen (Alter, Religion, Herkunft, Regionen) und Zeitpunkt der letzten Aktivität</li>
      </ul>
      <h3>Nutzung</h3>
      <ul>
        <li>Deine Swipes (Like, Pass, Super-Like), Matches und Chat-Nachrichten</li>
        <li>Porodica-Modus: Name und Verwandtschaftsgrad der Familienmitglieder, die du anlegst,
          deren Einladungscode sowie ihre Vorschläge inkl. optionaler Nachricht</li>
      </ul>
      <h3>Sicherheit</h3>
      <ul>
        <li>Blockierungen und Meldungen (Grund, Beschreibung, betroffenes Profil bzw. Match)</li>
        <li>Selfie und Status der freiwilligen Verifizierung</li>
      </ul>
      <h3>Technische Daten</h3>
      <ul>
        <li>IP-Adresse, Zeitpunkt und Browser-Angaben in den Server-Protokollen unserer Hosting-Dienstleister</li>
        <li>Im Browser gespeichert (Local Storage): deine Spracheinstellung und deine Anmeldesitzung.
          Wir verwenden keine Tracking-Cookies und keine Analyse- oder Werbedienste.</li>
      </ul>
      <h3>Warteliste</h3>
      <ul>
        <li>E-Mail-Adresse, Herkunft, Sprache, Empfehlungscode und Anzahl Empfehlungen,
          optional Name und Kurzbeschreibung</li>
      </ul>

      <h2>3. Besonders schützenswerte Daten</h2>
      <p>
        Aus deinen Angaben zu Herkunft, Religion und dazu, wen du suchst, können deine ethnische
        Herkunft, deine religiöse Überzeugung und deine sexuelle Orientierung hervorgehen. Diese
        Daten sind besonders schützenswert (Art. 5 lit. c DSG, Art. 9 DSGVO). Wir bearbeiten sie
        nur mit deiner ausdrücklichen Einwilligung, die du bei der Registrierung erteilst, und nur
        für das Matching und die Anzeige in deinem Profil. Die Angabe zur Religion ist
        freiwillig. Du kannst die Einwilligung jederzeit widerrufen, indem du die Angaben
        änderst oder dein Konto löschst. Ohne Angaben zu Geschlecht und Suche können wir dir
        keine passenden Profile zeigen.
      </p>
      <p>
        Das Verifizierungs-Selfie vergleichen Menschen aus unserem Team von Hand mit deinen
        Profilfotos. Eine automatisierte biometrische Auswertung findet nicht statt.
      </p>

      <h2>4. Zwecke und Rechtsgrundlagen</h2>
      <ul>
        <li><strong>Bereitstellung der App</strong> (Konto, Profil, Matching, Chat, Porodica):
          Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</li>
        <li><strong>Besonders schützenswerte Angaben</strong> und <strong>Verifizierung</strong>:
          ausdrückliche Einwilligung (Art. 6 Abs. 1 lit. a und Art. 9 Abs. 2 lit. a DSGVO, Art. 6 Abs. 7 DSG)</li>
        <li><strong>Sicherheit und Missbrauchsbekämpfung</strong> (Melden, Blockieren, Moderation,
          Server-Protokolle): berechtigtes Interesse an einer sicheren Plattform (Art. 6 Abs. 1 lit. f DSGVO)</li>
        <li><strong>Warteliste</strong>: Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)</li>
        <li><strong>Gesetzliche Pflichten</strong>, z.B. Auskünfte an Behörden: Art. 6 Abs. 1 lit. c DSGVO</li>
      </ul>
      <p>
        Wir verkaufen keine Daten und nutzen sie nicht für Werbung. Profilvorschläge entstehen aus
        deinen Filtern und denen anderer Mitglieder. Automatisierte Einzelentscheidungen mit
        rechtlicher Wirkung treffen wir nicht.
      </p>

      <h2>5. Wer deine Daten sieht</h2>
      <ul>
        <li><strong>Andere angemeldete Mitglieder</strong> sehen dein Profil: Vorname, Alter bzw.
          Geburtsdatum, Geschlecht, Herkunft, Wohnort, Sprachen, Religion, Beziehungsziel,
          Text über dich, Fotos, Verifizierungsstatus und deine Suchpräferenzen.</li>
        <li><strong>Familienmitglieder anderer Mitglieder</strong> (Porodica-Modus, über einen
          Einladungslink und ohne eigenes Konto) können Vorname, Alter, Herkunftsland, Wohnort,
          Text über dich und Fotos sehen, wenn dein Profil zu den Suchkriterien ihres
          Familienmitglieds passt. Sie können dein Profil vorschlagen, aber nicht mit dir chatten.</li>
        <li><strong>Deine Matches</strong> sehen die Nachrichten, die du ihnen schreibst.</li>
        <li><strong>Blockierte Personen</strong> sehen dich nicht mehr, und du siehst sie nicht mehr.</li>
        <li><strong>Profilfotos</strong> liegen unter einer nicht erratbaren Internetadresse. Wer
          diese Adresse kennt, kann das Foto auch ohne Konto abrufen.</li>
        <li><strong>Selfie und Meldungen</strong> sieht nur unser Team.</li>
      </ul>

      <h2>6. Dienstleister und Übermittlung ins Ausland</h2>
      <p>Wir setzen folgende Auftragsbearbeiter ein, die Daten nur nach unseren Weisungen bearbeiten:</p>
      <ul>
        <li><strong>Supabase Inc.</strong>, USA: Datenbank, Anmeldung, E-Mail-Versand zur
          Kontobestätigung und Dateispeicher. Die Daten liegen in einem Rechenzentrum in
          Frankfurt am Main (EU).</li>
        <li><strong>Vercel Inc.</strong>, USA: Hosting der Web-App, inkl. Server-Protokolle.
          Anfragen können über Server weltweit ausgeliefert werden.</li>
      </ul>
      <p>
        Da beide Unternehmen ihren Sitz in den USA haben, ist ein Zugriff aus den USA möglich.
        Die Übermittlung stützt sich auf das Swiss-U.S. bzw. EU-U.S. Data Privacy Framework,
        soweit der Anbieter zertifiziert ist, und andernfalls auf die Standardvertragsklauseln
        der EU-Kommission (vom EDÖB anerkannt).
      </p>

      <h2>7. Speicherdauer</h2>
      <ul>
        <li><strong>Konto, Profil, Fotos, Swipes, Matches, Porodica-Daten, Blockierungen und
          Selfie</strong>: bis du dein Konto löschst. Die Löschung erfolgt sofort. Chats mit dir
          werden dabei auch für deine Matches gelöscht.</li>
        <li><strong>Meldungen</strong>: Wenn ein Konto gelöscht wird, entfernen wir den Bezug zum
          Konto. Den Inhalt der Meldung bewahren wir nur so lange auf, wie es für die Bearbeitung
          und die Sicherheit der Plattform nötig ist, in der Regel höchstens 12 Monate.</li>
        <li><strong>Server-Protokolle</strong>: gemäss den Fristen der Hosting-Dienstleister,
          in der Regel wenige Tage bis Wochen.</li>
        <li><strong>Warteliste</strong>: bis du dich austrägst (formlose E-Mail an uns genügt)
          oder bis wir die Warteliste nicht mehr benötigen.</li>
        <li>Sicherungskopien unserer Dienstleister werden im Rahmen ihrer regulären Rotation
          überschrieben.</li>
      </ul>

      <h2>8. Datensicherheit</h2>
      <p>
        Die Übertragung ist TLS-verschlüsselt. Zugriffsregeln in der Datenbank stellen sicher,
        dass Mitglieder nur auf die Daten zugreifen können, die für sie bestimmt sind.
        Passwörter speichern wir nur als Hash.
      </p>

      <h2>9. Mindestalter</h2>
      <p>
        Hey Balkan ist nur für Personen ab 18 Jahren. Erfahren wir, dass ein Konto einer
        minderjährigen Person gehört, löschen wir es.
      </p>

      <h2>10. Deine Rechte</h2>
      <p>Du hast insbesondere das Recht auf:</p>
      <ul>
        <li>Auskunft über deine Daten (Art. 25 DSG, Art. 15 DSGVO)</li>
        <li>Berichtigung (Art. 32 DSG, Art. 16 DSGVO); dein Profil kannst du jederzeit selbst bearbeiten</li>
        <li>Löschung (Art. 17 DSGVO); dein Konto kannst du jederzeit selbst unter Profil → „Konto löschen“ entfernen</li>
        <li>Einschränkung der Bearbeitung und Widerspruch (Art. 18 und 21 DSGVO)</li>
        <li>Herausgabe bzw. Übertragung deiner Daten (Art. 28 DSG, Art. 20 DSGVO)</li>
        <li>Widerruf deiner Einwilligungen mit Wirkung für die Zukunft</li>
      </ul>
      <p>
        Schreib uns dazu an <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Du kannst dich
        ausserdem beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB) oder,
        wenn du in der EU wohnst, bei der Datenschutzaufsicht deines Wohnsitzlandes beschweren.
      </p>

      <h2>11. Änderungen</h2>
      <p>
        Wir passen diese Datenschutzerklärung an, wenn sich die App oder die Rechtslage ändert.
        Es gilt die jeweils hier veröffentlichte Fassung. Über wesentliche Änderungen informieren
        wir dich in der App.
      </p>
    </LegalLayout>
  );
}
