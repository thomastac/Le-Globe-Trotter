"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { fetchSubmissions, Submission } from '@/lib/fetchSubmissions';

function truncate(text: string, max = 220) {
  if (text.length <= max) return text;
  return text.slice(0, max - 1) + '…';
}

function loadGoogleMaps(apiKey: string): Promise<typeof google> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('SSR'));
    // Already loaded
    if (typeof window.google !== 'undefined' && window.google.maps) {
      return resolve(window.google);
    }
    const existing = document.getElementById('google-maps-sdk');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.google));
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
      return;
    }
    const script = document.createElement('script');
    script.id = 'google-maps-sdk';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

const MapClient = forwardRef<{ recenter: () => void }>(function MapClient(_props, ref) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [points, setPoints] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startY: number; currentY: number; dragging: boolean }>({ startY: 0, currentY: 0, dragging: false });
  const markersById = useRef<Map<string, google.maps.Marker>>(new Map());
  const initialCentered = useRef(false);

  const worldCenter = useMemo(() => ({ lat: 20, lng: 0 }), []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const g = await loadGoogleMaps(apiKey);
        if (cancelled) return;
        if (mapRef.current && !mapInstance.current) {
          mapInstance.current = new g.maps.Map(mapRef.current, {
            center: worldCenter,
            zoom: 2,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
        }
        const data = await fetchSubmissions();
        if (!cancelled) setPoints(data);
      } catch (e: any) {
        console.error(e);
        if (!cancelled) setError(e.message ?? 'Erreur de chargement de la carte');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey, worldCenter]);

  useEffect(() => {
    if (!mapInstance.current || !window.google) return;

    const g = window.google;
    const map = mapInstance.current;

    const markers: google.maps.Marker[] = [];
    markersById.current.clear();

    points.forEach((p) => {
      const marker = new g.maps.Marker({
        position: { lat: p.latitude, lng: p.longitude },
        map,
        title: p.display_name,
      });
      marker.addListener('click', () => {
        setSelected(p);
        // Highlight marker briefly
        try { marker.setAnimation(g.maps.Animation.BOUNCE); setTimeout(() => marker.setAnimation(null), 1200); } catch {}
      });
      markers.push(marker);
      markersById.current.set(String(p.id), marker);
    });

    return () => {
      markers.forEach((m) => m.setMap(null));
    };
  }, [points]);

  // If URL has lat/lng or id, center and open the sheet once
  useEffect(() => {
    if (initialCentered.current) return;
    if (!mapInstance.current) return;
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const latStr = url.searchParams.get('lat');
    const lngStr = url.searchParams.get('lng');
    const id = url.searchParams.get('id');

    let target: Submission | null = null;
    if (id && points.length) {
      target = points.find((p) => String(p.id) === id) || null;
    }
    if (target) {
      mapInstance.current.panTo({ lat: target.latitude, lng: target.longitude });
      mapInstance.current.setZoom(13);
      setSelected(target);
      // Pulse/highlight marker
      const marker = markersById.current.get(String(target.id));
      if (marker && (window as any).google) {
        try { marker.setAnimation((window as any).google.maps.Animation.BOUNCE); setTimeout(() => marker.setAnimation(null), 1200); } catch {}
      }
      initialCentered.current = true;
      return;
    }
    const lat = latStr ? parseFloat(latStr) : NaN;
    const lng = lngStr ? parseFloat(lngStr) : NaN;
    if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
      mapInstance.current.panTo({ lat, lng });
      mapInstance.current.setZoom(13);
      initialCentered.current = true;
    }
  }, [points]);

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    recenter() {
      if (!mapInstance.current) return;
      if (!navigator.geolocation) {
        setError('La géolocalisation n\'est pas supportée par ce navigateur.');
        setTimeout(() => setError(null), 4000);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords as GeolocationCoordinates;
          mapInstance.current!.panTo({ lat: latitude, lng: longitude });
          mapInstance.current!.setZoom(13);
        },
        (err) => {
          const msg = err?.code === 1
            ? 'Accès à la localisation refusé.'
            : 'Impossible d\'obtenir la localisation (HTTP non sécurisé sur mobile ?).';
          setError(msg);
          setTimeout(() => setError(null), 4000);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
      );
    },
  }));

  return (
    <div style={{ height: '100dvh', width: '100%' }}>
      {error ? (
        <div style={{ padding: 12, color: 'crimson' }}>Erreur: {error}</div>
      ) : (
        <div ref={mapRef} className="map-container" />
      )}

      {selected && (
        <>
          <div className="sheet-overlay" onClick={() => setSelected(null)} />
          <div
            ref={sheetRef}
            className="sheet"
            role="dialog"
            aria-modal="true"
            onTouchStart={(e) => {
              drag.current.dragging = true;
              drag.current.startY = e.touches[0].clientY;
              drag.current.currentY = drag.current.startY;
            }}
            onTouchMove={(e) => {
              if (!drag.current.dragging) return;
              drag.current.currentY = e.touches[0].clientY;
              const diff = Math.max(0, drag.current.currentY - drag.current.startY);
              if (sheetRef.current) sheetRef.current.style.transform = `translateY(${diff}px)`;
            }}
            onTouchEnd={() => {
              if (!drag.current.dragging) return;
              const diff = Math.max(0, drag.current.currentY - drag.current.startY);
              drag.current.dragging = false;
              if (diff > 80) {
                setSelected(null);
              } else {
                if (sheetRef.current) {
                  sheetRef.current.style.transition = 'transform .18s ease';
                  sheetRef.current.style.transform = 'translateY(0)';
                  setTimeout(() => { if (sheetRef.current) sheetRef.current.style.transition = ''; }, 200);
                }
              }
            }}
          >
            <div className="handle-hit" />
            <div className="handle" />
            <div className="title">{selected.display_name}</div>
            <div className="meta">{[selected.city, selected.country].filter(Boolean).join(', ')}</div>
            {selected.photo_url && (
              <img src={selected.photo_url} alt={selected.display_name} />
            )}
            {selected.anecdote_text && <p>{truncate(selected.anecdote_text, 240)}</p>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button className="btn" onClick={() => setSelected(null)}>Fermer</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default MapClient;
