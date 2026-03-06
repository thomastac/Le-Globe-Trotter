"use client";

import dynamic from 'next/dynamic';
import { useRef } from 'react';

const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

export default function MapPage() {
  const apiRef = useRef<{ recenter: () => void } | null>(null);
  return (
    <main>
      <MapClient ref={apiRef as any} />
    </main>
  );
}
