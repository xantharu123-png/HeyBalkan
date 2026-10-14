import Link from 'next/link';

// Legal-Seiten sind (wie im DACH-Raum ueblich) deutschsprachig.
export const LEGAL_LINKS = [
  { href: '/impressum', label: 'Impressum' },
  { href: '/datenschutz', label: 'Datenschutz' },
  { href: '/agb', label: 'AGB' },
];

export default function LegalLinks({ className = 'flex gap-4 text-sm', linkClassName = 'hover:text-white transition-colors' }: { className?: string; linkClassName?: string }) {
  return (
    <nav aria-label="Rechtliches" className={className}>
      {LEGAL_LINKS.map(l => (
        <Link key={l.href} href={l.href} className={linkClassName}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
