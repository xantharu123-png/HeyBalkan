import type { Metadata } from 'next';
import LegalLayout from '@/components/LegalLayout';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = {
  title: 'Impressum – Hey Balkan',
};

export default function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <h2>Betreiber</h2>
      <p>
        Hey Balkan<br />
        {LEGAL.operator}<br />
        {LEGAL.address}<br />
        {LEGAL.country}
      </p>

      <h2 id="kontakt">Kontakt</h2>
      <p>
        E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>{LEGAL.operator}, Anschrift wie oben.</p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Wir erstellen die Inhalte dieser Website mit Sorgfalt, übernehmen aber keine Gewähr für
        Richtigkeit, Vollständigkeit und Aktualität. Für Profile, Fotos und Nachrichten sind die
        jeweiligen Mitglieder selbst verantwortlich. Rechtswidrige Inhalte entfernen wir, sobald
        wir davon Kenntnis erhalten. Hinweise nehmen wir über die Melde-Funktion in der App oder
        per E-Mail entgegen.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Für Inhalte externer Websites, auf die wir verlinken, sind ausschliesslich deren Betreiber
        verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Gestaltung und Logo von Hey Balkan sind urheberrechtlich geschützt. Eine
        Verwendung ausserhalb der App bedarf unserer Zustimmung.
      </p>
    </LegalLayout>
  );
}
