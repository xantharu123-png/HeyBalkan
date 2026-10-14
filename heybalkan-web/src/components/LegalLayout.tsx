import Link from 'next/link';
import LegalLinks from '@/components/LegalLinks';
import { LEGAL } from '@/lib/legal';

export default function LegalLayout({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-700">
      <header className="bg-gradient-to-br from-sky-500 via-indigo-600 to-purple-700">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2 text-white">
            <span className="text-2xl">👋</span>
            <span className="text-xl font-black">Hey Balkan</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-3xl sm:text-4xl font-black text-stone-900">{title}</h1>
        <p className="text-sm text-stone-500 mt-2">Stand: {LEGAL.lastUpdated}</p>

        <div className="mt-8 leading-relaxed break-words [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-stone-900 [&_h2]:mt-10 [&_h2]:mb-3 [&_h3]:font-semibold [&_h3]:text-stone-900 [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mt-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mt-3 [&_ul]:space-y-1.5 [&_a]:text-indigo-600 [&_a]:underline">
          {children}
        </div>
      </main>

      <footer className="bg-stone-900 text-stone-400 py-8 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p>&copy; 2026 Hey Balkan</p>
          <LegalLinks />
        </div>
      </footer>
    </div>
  );
}
