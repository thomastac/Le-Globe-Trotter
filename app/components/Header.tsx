"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const hide = pathname === '/map' || pathname === '/' || pathname === '/submit' || pathname.startsWith('/submit/');
  if (hide) return null;
  return (
    <header className="site-header">
      <div className="site-header-inner container">
        <Link href="/" className="brand">GlobeTrotter</Link>
        <nav className="nav">
          <Link href="/">Accueil</Link>
          <Link href="/map">Carte</Link>
          <Link href="/submit">Contribuer</Link>
        </nav>
      </div>
    </header>
  );
}
