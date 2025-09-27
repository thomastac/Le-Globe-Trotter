"use client";

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRef } from 'react';

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

export default function MapPage() {
  const apiRef = useRef<{ recenter: () => void } | null>(null);
  return (
    <main>
      <MapClient ref={apiRef as any} />
      <button className="fab-mini" aria-label="Me recentrer" onClick={() => apiRef.current?.recenter()}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 8a4 4 0 1 1 0 8a4 4 0 0 1 0-8m0-5a1 1 0 0 1 1 1v1.07A8.001 8.001 0 0 1 20.93 11H22a1 1 0 1 1 0 2h-1.07A8.001 8.001 0 0 1 13 20.93V22a1 1 0 1 1-2 0v-1.07A8.001 8.001 0 0 1 3.07 13H2a1 1 0 1 1 0-2h1.07A8.001 8.001 0 0 1 11 3.07V2a1 1 0 0 1 1-1Z"/>
        </svg>
      </button>
      <Link href="/submit" className="fab" aria-label="Ajouter une contribution">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/>
        </svg>
        Check-in
      </Link>
    </main>
  );
}
