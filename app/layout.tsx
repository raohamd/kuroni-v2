import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Home, PlaySquare, Flame } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kuroni | Legal Anime Discovery & Stream Hub',
  description: 'Discover, track, and stream authorized anime legally.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-40 bg-[#0B0B0E]/90 backdrop-blur-md border-b border-gray-800/80 px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-black text-purple-500 tracking-wider">
            KURONI
          </Link>
          <nav className="flex items-center gap-6 text-sm font-semibold text-gray-400">
            <Link href="/" className="hover:text-white flex items-center gap-2"><Home size={16}/> Home</Link>
            <Link href="/shorts" className="hover:text-white flex items-center gap-2"><PlaySquare size={16}/> Shorts Loop</Link>
          </nav>
        </header>
        <main className="min-h-[calc(100vh-80px)]">{children}</main>
      </body>
    </html>
  );
}