import type { Metadata } from 'next';
import Link from 'next/link';
import LegalLayout from '@/components/LegalLayout';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'AGB – Hey Balkan',
};

export default function AgbPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen">
      <h2>1. Geltungsbereich</h2>
      <p>
        Diese AGB regeln die Nutzung der Dating-App Hey Balkan (inkl. Porodica-Modus), betrieben
        von {LEGAL.operator}, {LEGAL.address}, {LEGAL.country} („wir“). Mit der Registrierung
        akzeptierst du diese AGB. Wie wir mit deinen Daten umgehen, steht in der{' '}
        <Link href="/datenschutz">Datenschutzerklärung</Link>.
      </p>

      <h2>2. Leistungen</h2>
      <p>
        Hey Balkan bringt Menschen aus der Balkan-Diaspora in der Schweiz, Deutschland und
        Österreich zusammen. Die Nutzung ist derzeit kostenlos. Wir garantieren weder Matches
        noch eine bestimmte Anzahl Mitglieder noch eine ununterbrochene Verfügbarkeit der App.
        Wir dürfen Funktionen ändern, erweitern oder einstellen.
      </p>

      <h2>3. Registrierung und Mindestalter</h2>
      <ul>
        <li>Du musst mindestens 18 Jahre alt sein.</li>
        <li>Pro Person ist ein Konto erlaubt. Das Konto ist nicht übertragbar.</li>
        <li>Deine Angaben müssen wahr sein. Fotos müssen dich selbst zeigen.</li>
        <li>Halte dein Passwort geheim. Du bist für Aktivitäten unter deinem Konto verantwortlich.</li>
      </ul>

      <h2>4. Verhaltensregeln</h2>
      <p>Auf Hey Balkan ist insbesondere verboten:</p>
      <ul>
        <li>Fake-Profile, falsche Identitäten oder das Vortäuschen einer anderen Person</li>
        <li>Belästigung, Drohungen, Beleidigungen, Hassrede oder Diskriminierung, auch wegen
          Herkunft, Religion, Geschlecht oder sexueller Orientierung</li>
        <li>Nacktheit, sexuelle oder gewaltverherrlichende Inhalte sowie Inhalte mit Minderjährigen</li>
        <li>Spam, Werbung, Geldforderungen, Betrug (z.B. Romance Scam) und das Anbieten
          sexueller Dienstleistungen</li>
        <li>Das Veröffentlichen von Daten oder Fotos anderer Personen ohne deren Zustimmung</li>
        <li>Automatisierte Zugriffe, das Auslesen von Profilen und Eingriffe in die Technik der App</li>
        <li>Jede andere rechtswidrige Nutzung</li>
      </ul>

      <h2>5. Melden, Blockieren und Moderation</h2>
      <p>
        Du kannst Profile jederzeit melden und blockieren. Blockierte Personen sehen dich nicht
        mehr, und du siehst sie nicht mehr. Wir prüfen Meldungen und dürfen Inhalte entfernen
        sowie Konten verwarnen, sperren oder löschen, wenn gegen diese AGB oder geltendes Recht
        verstossen wird. Bei Hinweisen auf Straftaten können wir die Behörden informieren.
      </p>

      <h2>6. Deine Inhalte</h2>
      <p>
        Für Profiltexte, Fotos und Nachrichten bist du selbst verantwortlich. Du bestätigst, dass
        du die nötigen Rechte daran hast. Du räumst uns das einfache, unentgeltliche Recht ein,
        diese Inhalte für den Betrieb der App zu speichern und anderen Mitgliedern sowie im
        Porodica-Modus anzuzeigen. Dieses Recht endet, wenn du die Inhalte oder dein Konto löschst.
      </p>

      <h2>7. Porodica-Modus</h2>
      <p>
        Du kannst Familienmitglieder einladen, die über einen persönlichen Link Profile ansehen
        und dir vorschlagen können. Teile den Link nur mit Personen, denen du vertraust. Wer den
        Link kennt, kann für dich Vorschläge machen. Du kannst ein Familienmitglied jederzeit
        entfernen; der Link wird damit ungültig. Familienmitglieder können nicht chatten.
      </p>

      <h2>8. Selfie-Verifizierung</h2>
      <p>
        Das Abzeichen „Verifiziert“ bedeutet nur, dass unser Team ein Selfie mit den Profilfotos
        verglichen hat und diese übereinzustimmen schienen. Es ist keine Prüfung der Identität,
        des Alters oder des Charakters einer Person.
      </p>

      <h2>9. Sicherheit beim Kennenlernen</h2>
      <p>
        Wir überprüfen Mitglieder nicht auf Vorstrafen. Sei vorsichtig: Triff dich zuerst an
        öffentlichen Orten, sag Freunden Bescheid und schick niemals Geld an Personen, die du nur
        aus der App kennst.
      </p>

      <h2>10. Laufzeit und Kündigung</h2>
      <p>
        Du kannst dein Konto jederzeit in der App unter Profil → „Konto löschen“ entfernen. Wir
        können die Nutzung aus wichtigem Grund, insbesondere bei Verstössen gegen diese AGB,
        jederzeit beenden.
      </p>

      <h2>11. Haftung</h2>
      <p>
        Für das Verhalten anderer Mitglieder, innerhalb oder ausserhalb der App, haften wir nicht.
        Im Übrigen haften wir nur für Schäden, die wir absichtlich oder grobfahrlässig verursacht
        haben, soweit das Gesetz dies zulässt. Zwingende gesetzliche Haftung bleibt unberührt.
      </p>

      <h2>12. Änderungen</h2>
      <p>
        Wir können diese AGB anpassen. Über wesentliche Änderungen informieren wir dich
        rechtzeitig in der App. Nutzt du die App danach weiter, gelten die neuen AGB. Bist du
        nicht einverstanden, kannst du dein Konto löschen.
      </p>

      <h2>13. Anwendbares Recht und Gerichtsstand</h2>
      <p>
        Es gilt Schweizer Recht. Gerichtsstand ist {LEGAL.venue}. Wohnst du als Verbraucherin
        oder Verbraucher in der EU, bleiben die zwingenden Verbraucherschutzvorschriften und der
        Gerichtsstand deines Wohnsitzlandes unberührt.
      </p>

      <h2>14. Kontakt</h2>
      <p>
        Fragen zu diesen AGB: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>
    </LegalLayout>
  );
}
