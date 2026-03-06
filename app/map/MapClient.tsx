"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { fetchSubmissions, Submission } from '@/lib/fetchSubmissions';
import CountryMultiSelect from '@/components/CountryMultiSelect';
import { generateKml } from '@/utils/generateKml';

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker,places,geocoding&language=fr&region=FR`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error('Failed to load Google Maps script'));
    document.head.appendChild(script);
  });
}

// Warm beige theme styles (light sepia) — inverted land/water and darker browns
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  // Base land geometry (continents) — slightly darker brown for better contrast
  { elementType: 'geometry', stylers: [{ color: '#d2bfa4' }] },
  // Labels
  { elementType: 'labels.text.fill', stylers: [{ color: '#5a4a3a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#d2bfa4' }] },
  // Administrative strokes, slightly darker
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#cbbba6' }] },
  { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#c1b099' }] },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  // Points of interest hidden
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  // Roads slightly darker beige to sit above land
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#c1ae97' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#bda78e' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#b1997e' }] },
  // Transit hidden
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  // Water geometry (kept light for contrast)
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#efe8db' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#7a6a56' }] },
];

const MapClient = forwardRef<{ recenter: () => void }>(function MapClient(_props, ref) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const [points, setPoints] = useState<Submission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [countryAtCenter, setCountryAtCenter] = useState<string>('');
  const [countryCodeAtCenter, setCountryCodeAtCenter] = useState<string>('');
  const [countriesMap, setCountriesMap] = useState<Record<string, string>>({}); // name(lower)->code2
  const [countriesList, setCountriesList] = useState<{ code2: string; name: string }[]>([]);
  const [filterOpen, setFilterOpen] = useState<boolean>(false);
  const [filterCountries, setFilterCountries] = useState<Set<string>>(new Set());
  const [filterCats, setFilterCats] = useState<Set<string>>(new Set());
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ startY: number; currentY: number; dragging: boolean }>({ startY: 0, currentY: 0, dragging: false });
  const markersById = useRef<Map<string, google.maps.Marker>>(new Map());
  const initialCentered = useRef(false);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const idleTimer = useRef<number | null>(null);
  const resolveCenter = useRef<(() => void) | null>(null);
  const geoCache = useRef<Map<string, { lat: number; lng: number }>>(new Map());

  // Convert ISO2 to flag emoji
  function flagFromIso2(code?: string) {
    if (!code || code.length !== 2) return '';
    const up = code.toUpperCase();
    const A = 0x1f1e6; // Regional Indicator Symbol Letter A
    const base = 'A'.charCodeAt(0);
    return String.fromCodePoint(A + (up.charCodeAt(0) - base)) + String.fromCodePoint(A + (up.charCodeAt(1) - base));
  }

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
            minZoom: 2, // Limite de dézoom - ne peut pas zoomer plus loin que la vue monde
            maxZoom: 18, // Limite de zoom maximum
            disableDefaultUI: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: false,
            rotateControl: false,
            scaleControl: false,
            backgroundColor: '#e6ddcc',
            styles: MAP_STYLES,
          });
          geocoderRef.current = new g.maps.Geocoder();

          resolveCenter.current = () => {
            if (!mapInstance.current || !geocoderRef.current) return;
            const center = mapInstance.current.getCenter();
            if (!center) return;
            geocoderRef.current!.geocode({ location: center }, async (results, status) => {
              try {
                if (status === 'OK' && results && results.length) {
                  const countryResult = results.find(r => (r.types || []).includes('country')) || results[0];
                  const comp = countryResult.address_components?.find((c) => c.types?.includes('country')) as any;
                  if (comp?.long_name) {
                    setCountryAtCenter(comp.long_name);
                    setCountryCodeAtCenter(comp.short_name || '');
                    return;
                  }
                } else {
                  console.warn('Geocoder status:', status);
                }
              } catch (e) {
                console.warn('Geocoder error', e);
              }

              // Fallback: OpenStreetMap Nominatim
              try {
                const lat = center.lat();
                const lon = center.lng();
                const ctrl = new AbortController();
                const t = setTimeout(() => ctrl.abort(), 2500);
                const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=3`, { signal: ctrl.signal, headers: { 'Accept-Language': 'fr' } });
                clearTimeout(t);
                if (resp.ok) {
                  const json: any = await resp.json();
                  const name = json?.address?.country || json?.display_name || '';
                  if (name) {
                    setCountryAtCenter(name);
                    setCountryCodeAtCenter('');
                    return;
                  }
                }
              } catch (e) {
                console.warn('OSM fallback error', e);
              }
              // If all fails, clear but show hint
              setCountryCodeAtCenter('');
            });
          };

          // On center change (idle), reverse geocode the country under center with debounce
          mapInstance.current.addListener('idle', () => {
            if (idleTimer.current) window.clearTimeout(idleTimer.current);
            idleTimer.current = window.setTimeout(() => resolveCenter.current && resolveCenter.current(), 200);
          });

          // Resolve once initially
          resolveCenter.current();
        }
        // Load countries mapping for flag fallback (name->code2)
        try {
          const r = await fetch('/api/countries');
          const j = await r.json();
          const map: Record<string, string> = {};
          const list: { code2: string; name: string }[] = (j?.countries || []).map((c: any) => ({ code2: String(c.code2).toLowerCase(), name: String(c.name) }));
          list.forEach((c) => { map[c.name.toLowerCase()] = c.code2; });
          if (!cancelled) { setCountriesMap(map); setCountriesList(list); }
        } catch { }
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

    const colorFor = (cat?: string | null) => {
      const key = (cat || '').toLowerCase();
      if (key.includes('food') || key.includes('resto') || key.includes('cuisine') || key.includes('boire')) return '#d97706';
      if (key.includes('culture') || key.includes('mus') || key.includes('patr')) return '#7c3aed';
      if (key.includes('budget') || key.includes('prix') || key.includes('argent') || key.includes('cheap')) return '#059669';
      if (key.includes('transport') || key.includes('bus') || key.includes('train') || key.includes('avion')) return '#2563eb';
      if (key.includes('secur') || key.includes('safety')) return '#dc2626';
      if (key.includes('nature') || key.includes('plage') || key.includes('mont')) return '#16a34a';
      if (key.includes('log') || key.includes('hotel') || key.includes('heberg')) return '#ea580c';
      if (key.includes('shopping') || key.includes('achat') || key.includes('souvenir')) return '#a21caf';
      if (key.includes('activ') || key.includes('sport')) return '#0ea5e9';
      return '#b45309';
    };

    const pinFor = (color: string): google.maps.Icon => {
      const svg = `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 24 24'>
          <path fill='${color}' d='M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7Zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5Z'/>
        </svg>`
      )}`;
      return { url: svg, scaledSize: new google.maps.Size(36, 36), anchor: new google.maps.Point(18, 34) };
    };

    const doGeocode = (text: string): Promise<google.maps.GeocoderResult[] | null> => {
      return new Promise((resolve) => {
        try {
          if (!geocoderRef.current) geocoderRef.current = new g.maps.Geocoder();
          geocoderRef.current.geocode({ address: text }, (results, status) => {
            if (status === 'OK' && results && results.length) resolve(results);
            else resolve(null);
          });
        } catch {
          resolve(null);
        }
      });
    };

    const geocodeStage = async (stageText: string, countryName?: string): Promise<{ lat: number; lng: number } | null> => {
      try {
        // 1) Google geocode with full text as-is
        const r1 = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
          try {
            if (!geocoderRef.current) geocoderRef.current = new g.maps.Geocoder();
            geocoderRef.current.geocode({ address: stageText }, (results, status) => {
              if (status === 'OK' && results && results[0]) resolve(results);
              else resolve(null);
            });
          } catch { resolve(null); }
        });
        if (r1 && r1[0]) {
          const loc = r1[0].geometry?.location; if (loc) return { lat: loc.lat(), lng: loc.lng() };
        }
        // 2) Google geocode with region hint (ISO2) if we can map the country name
        const code2 = countryName ? countriesMap[countryName.toLowerCase()] : undefined;
        if (code2) {
          const r2 = await new Promise<google.maps.GeocoderResult[] | null>((resolve) => {
            try {
              if (!geocoderRef.current) geocoderRef.current = new g.maps.Geocoder();
              geocoderRef.current.geocode({ address: stageText, region: code2 } as any, (results, status) => {
                if (status === 'OK' && results && results[0]) resolve(results);
                else resolve(null);
              });
            } catch { resolve(null); }
          });
          if (r2 && r2[0]) {
            const loc = r2[0].geometry?.location; if (loc) return { lat: loc.lat(), lng: loc.lng() };
          }
        }
        // 3) OSM fallback
        try {
          const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 2500);
          const q = encodeURIComponent(stageText + (countryName ? `, ${countryName}` : ''));
          const resp = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=1`, { signal: ctrl.signal, headers: { 'Accept-Language': 'fr' } });
          clearTimeout(t);
          if (resp.ok) {
            const arr: any[] = await resp.json();
            const hit = arr?.[0];
            const lat = parseFloat(hit?.lat); const lon = parseFloat(hit?.lon);
            if (!Number.isNaN(lat) && !Number.isNaN(lon)) return { lat, lng: lon };
          }
        } catch { }
      } catch { }
      return null;
    };

    const url = typeof window !== 'undefined' ? new URL(window.location.href) : null;
    const deepId = url?.searchParams.get('id');

    const canonicalKeyFor = (cat?: string | null): string | null => {
      const key = (cat || '').toLowerCase();
      if (!key) return null;
      if (key.includes('resto') || key.includes('restaurant') || key.includes('food') || key.includes('boire') || key.includes('cuisine')) return 'restaurant';
      if (key.includes('culture') || key.includes('mus') || key.includes('patr')) return 'culture';
      if (key.includes('nature') || key.includes('plage') || key.includes('mont') || key.includes('parc')) return 'nature';
      if (key.includes('transport') || key.includes('bus') || key.includes('train') || key.includes('avion')) return 'transport';
      if (key.includes('budget') || key.includes('prix') || key.includes('argent') || key.includes('cheap')) return 'budget';
      if (key.includes('secur')) return 'securite';
      if (key.includes('hotel') || key.includes('heberg') || key.includes('log')) return 'logement';
      if (key.includes('shopping') || key.includes('achat') || key.includes('souvenir')) return 'shopping';
      if (key.includes('activ') || key.includes('sport')) return 'activites';
      return 'autre';
    };

    const matchesFilter = (p: Submission): boolean => {
      // Country filter (multi-select)
      if (filterCountries.size > 0 && !filterCountries.has(String(p.country || ''))) return false;
      // Categories filter (multi)
      if (filterCats.size > 0) {
        const k = canonicalKeyFor(p.tip1_category) || 'autre';
        if (!filterCats.has(k)) return false;
      }
      return true;
    };

    points.forEach((p) => {
      if (!matchesFilter(p)) return;
      const marker = new g.maps.Marker({
        position: { lat: p.latitude, lng: p.longitude },
        map,
        title: p.display_name,
        icon: pinFor(colorFor(p.tip1_category)),
      });
      marker.addListener('click', () => {
        setSelected(p);
        try { marker.setAnimation(g.maps.Animation.BOUNCE); setTimeout(() => marker.setAnimation(null), 1200); } catch { }
      });
      markers.push(marker);
      markersById.current.set(String(p.id), marker);

      // Keep the marker exactly at the saved coordinates (p.latitude, p.longitude)
      // Only pan if returning from a deep link ID
      if (!initialCentered.current && deepId && String(p.id) === deepId) {
        map.panTo({ lat: p.latitude, lng: p.longitude });
        map.setZoom(13);
        setSelected(p);
        initialCentered.current = true;
      }
    });

    return () => {
      markers.forEach((m) => m.setMap(null));
    };
  }, [points, filterCountries, filterCats, countriesMap]);

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
        try { marker.setAnimation((window as any).google.maps.Animation.BOUNCE); setTimeout(() => marker.setAnimation(null), 1200); } catch { }
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
    <div style={{ height: '100dvh', width: '100%', position: 'relative' }}>
      {/* Top banner with country under center */}
      <div
        style={{
          position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,.9)', border: '1px solid rgba(0,0,0,.08)',
          borderRadius: 12, padding: '8px 14px', zIndex: 5, pointerEvents: 'none',
          boxShadow: '0 2px 10px rgba(0,0,0,.08)', color: '#3f3f3f',
          fontWeight: 600, fontSize: 14,
        }}
      >{countryAtCenter ? `${flagFromIso2(countryCodeAtCenter || countriesMap[countryAtCenter.toLowerCase()])} ${countryAtCenter}`.trim() : 'Déplace la carte pour détecter le pays'}</div>

      {/* Global KML Export Button */}
      <button
        className="btn btn-pill"
        onClick={() => {
          // Gather currently visible points based on filters
          const visiblePoints = points.filter((p) => {
            if (filterCountries.size > 0 && !filterCountries.has(String(p.country || ''))) return false;
            if (filterCats.size > 0) {
              // To avoid redeclaring canonicalKeyFor here, we just use a simplified version for the global export
              const key = (p.tip1_category || '').toLowerCase();
              let k = 'autre';
              if (key.includes('resto') || key.includes('restaurant') || key.includes('food') || key.includes('boire') || key.includes('cuisine')) k = 'restaurant';
              else if (key.includes('culture') || key.includes('mus') || key.includes('patr')) k = 'culture';
              else if (key.includes('nature') || key.includes('plage') || key.includes('mont') || key.includes('parc')) k = 'nature';
              else if (key.includes('transport') || key.includes('bus') || key.includes('train') || key.includes('avion')) k = 'transport';
              else if (key.includes('budget') || key.includes('prix') || key.includes('argent') || key.includes('cheap')) k = 'budget';
              else if (key.includes('secur')) k = 'securite';
              else if (key.includes('hotel') || key.includes('heberg') || key.includes('log')) k = 'logement';
              else if (key.includes('shopping') || key.includes('achat') || key.includes('souvenir')) k = 'shopping';
              else if (key.includes('activ') || key.includes('sport')) k = 'activites';

              if (!filterCats.has(k)) return false;
            }
            return true;
          });
          generateKml(visiblePoints);
        }}
        style={{ position: 'absolute', bottom: 24, right: 12, zIndex: 6, background: '#10b981', color: '#fff', borderColor: '#059669', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
        title="Télécharger ces anecdotes pour Google Maps"
      >
        <span style={{ fontSize: 16, marginRight: 6 }}>📍</span> Emporter mes découvertes
      </button>

      {/* Filter button + panel */}
      <button
        className="btn"
        onClick={() => setFilterOpen((v) => !v)}
        style={{ position: 'absolute', top: 48, right: 12, zIndex: 6 }}
        aria-haspopup="dialog"
        aria-expanded={filterOpen}
      >Filtre</button>
      {filterOpen && (
        <div
          role="dialog"
          aria-modal="false"
          style={{
            position: 'absolute', top: 86, right: 12, zIndex: 6,
            width: 300,
            background: 'rgba(253, 251, 247, 0.95)', // Warm paper color with transparency
            backdropFilter: 'blur(12px)',
            border: '1.5px solid rgba(230, 226, 216, 0.8)', // Vintage border
            borderRadius: 12,
            boxShadow: '0 8px 24px rgba(41, 37, 36, 0.15)', // Warm shadow
            padding: 12
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: 8, color: '#292524' }}>Filtrer</div>
          <div style={{ marginBottom: 10 }}>
            <div className="label">Pays</div>
            <CountryMultiSelect
              countries={countriesList}
              selectedCountries={filterCountries}
              onChange={(countries) => setFilterCountries(countries)}
              placeholder="Tous les pays"
              ariaLabel="Filtrer par pays"
            />
          </div>
          <div style={{ marginBottom: 10 }}>
            <div className="label">Catégories</div>
            {[
              { k: 'nature', label: 'Nature' },
              { k: 'culture', label: 'Culture' },
              { k: 'restaurant', label: 'Resto' },
              { k: 'transport', label: 'Transport' },
              { k: 'budget', label: 'Budget' },
              { k: 'securite', label: 'Sécurité' },
              { k: 'logement', label: 'Logement' },
              { k: 'shopping', label: 'Shopping' },
              { k: 'activites', label: 'Activités' },
            ].map((c) => (
              <label key={c.k} style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0', color: '#0f172a' }}>
                <input
                  type="checkbox"
                  checked={filterCats.has(c.k)}
                  onChange={(e) => {
                    setFilterCats((s) => {
                      const n = new Set(s);
                      if (e.target.checked) n.add(c.k); else n.delete(c.k);
                      return n;
                    });
                  }}
                />
                {c.label}
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              className="btn"
              onClick={() => {
                setFilterOpen(false);
                // Fit map bounds to all currently visible markers after aplying filters
                try {
                  const g = (window as any).google as typeof google | undefined;
                  if (!g || !mapInstance.current) return;
                  const map = mapInstance.current!;

                  const bounds = new g.maps.LatLngBounds();
                  let hasPositions = false;
                  markersById.current.forEach((marker) => {
                    const pos = marker.getPosition();
                    if (pos && (marker as any).getMap && (marker as any).getMap()) {
                      bounds.extend(pos);
                      hasPositions = true;
                    }
                  });
                  if (hasPositions) {
                    map.fitBounds(bounds, 40);
                  }
                } catch { }
              }}
            >Appliquer</button>
            <button className="btn" onClick={() => { setFilterCountries(new Set()); setFilterCats(new Set()); setFilterOpen(false); }}>Réinitialiser</button>
          </div>
        </div>
      )}

      {error ? (
        <div style={{ padding: 12, color: 'crimson' }}>Erreur: {error}</div>
      ) : (
        <div ref={mapRef} className="map-container" />
      )}

      {
        selected && (
          <>
            <div className="sheet-overlay" onClick={() => setSelected(null)} />
            <div
              ref={sheetRef}
              className="sheet paper-texture"
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
              <div className="title font-hand" style={{ fontWeight: 700, fontSize: 28, color: '#2c3e50' }}>{selected.display_name}</div>
              <div className="meta" style={{ opacity: .8, marginBottom: 12, fontSize: 15 }}>
                {[selected.city, selected.country].filter(Boolean).join(', ')}
              </div>
              {selected.photo_url && (
                <div style={{ position: 'relative', marginBottom: 16 }}>
                  {/* Compact thumbnail with pin icon */}
                  <div
                    style={{
                      position: 'relative',
                      width: '200px',
                      height: '150px',
                      borderRadius: 12,
                      overflow: 'hidden',
                      border: '2px solid #e7e5e4',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease',
                    }}
                    onClick={() => {
                      const modal = document.getElementById('image-modal-' + selected.id);
                      if (modal) modal.style.display = 'flex';
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <img
                      src={selected.photo_url}
                      alt={selected.display_name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                    {/* Pin icon overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(255,255,255,0.95)',
                        borderRadius: '50%',
                        width: 32,
                        height: 32,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 16,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                      }}
                    >
                      📌
                    </div>
                    {/* Zoom indicator */}
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                        padding: '8px',
                        color: 'white',
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: 'center'
                      }}
                    >
                      🔍 Cliquer pour agrandir
                    </div>
                  </div>

                  {/* Full-size modal */}
                  <div
                    id={'image-modal-' + selected.id}
                    style={{
                      display: 'none',
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0,0,0,0.9)',
                      zIndex: 9999,
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 20
                    }}
                    onClick={(e) => {
                      if (e.target === e.currentTarget) {
                        e.currentTarget.style.display = 'none';
                      }
                    }}
                  >
                    <button
                      onClick={() => {
                        const modal = document.getElementById('image-modal-' + selected.id);
                        if (modal) modal.style.display = 'none';
                      }}
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        background: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: 40,
                        height: 40,
                        fontSize: 20,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.3)'
                      }}
                    >
                      ✕
                    </button>
                    <img
                      src={selected.photo_url}
                      alt={selected.display_name}
                      style={{
                        maxWidth: '90%',
                        maxHeight: '90%',
                        objectFit: 'contain',
                        borderRadius: 8
                      }}
                    />
                  </div>
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 16, background: 'rgba(255,255,255,0.5)', padding: 10, borderRadius: 8 }}>
                <div style={{ fontSize: 14 }}><strong>Année</strong><br />{selected.travel_year ?? '—'}</div>
                <div style={{ fontSize: 14 }}><strong>Durée</strong><br />{selected.travel_duration ?? '—'}</div>
                <div style={{ fontSize: 14 }}><strong>Soumise</strong><br />{new Date(selected.submitted_at).toLocaleDateString('fr-FR')}</div>
              </div>
              {selected.anecdote_text && (
                <div style={{ marginBottom: 16 }}>
                  <strong className="font-hand" style={{ fontSize: 20, display: 'block', marginBottom: 4 }}>L'Anecdote</strong>
                  <p style={{ lineHeight: 1.6, fontStyle: 'italic', color: '#4b5563' }}>"{truncate(selected.anecdote_text, 340)}"</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20, flexWrap: 'wrap' }}>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${selected.latitude},${selected.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                >
                  <span>🗺️</span> Ouvrir dans Maps
                </a>
                <button
                  className="btn"
                  onClick={() => generateKml([selected], `anecdote-${selected.id}.kml`)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eaf3fb', borderColor: '#cfe9f3' }}
                  title="Télécharger au format KML pour importer dans vos listes Google Maps"
                >
                  <span>📥</span> Exporter (KML)
                </button>
                <button className="btn btn-pill btn-mint" onClick={() => { window.location.href = `/submit/preview?id=${encodeURIComponent(String(selected.id))}`; }}>
                  Voir le carnet
                </button>
                <button className="btn" onClick={() => setSelected(null)}>Fermer</button>
              </div>
            </div>
          </>
        )
      }
    </div >
  );
});

export default MapClient;
