import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hey Balkan! - Dating fuer die Balkan-Diaspora',
  description: 'Die Dating-App fuer Serben, Kroaten, Bosnier, Montenegriner, Mazedonier, Kosovaren und Slowenen in der Schweiz, Deutschland und Oesterreich.',
  keywords: 'dating, balkan, diaspora, serbian, croatian, bosnian, DACH, schweiz, deutschland',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
