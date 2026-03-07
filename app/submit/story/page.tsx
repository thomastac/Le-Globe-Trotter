"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Build-time public key for Maps Places (avoids runtime `process` access)
const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Legacy -> new category key mapping
const CAT_MAP: Record<string, string> = {
  nature: 'nature_paysages',
  culture: 'culture_patrimoine',
  restaurant: 'restaurants_streetfood',
  transport: 'transport_pratique',
  logement: 'logements_hospitalite',
  shopping: 'shopping_artisanat',
  activite: 'aventures_activites',
  activites: 'aventures_activites',
  // legacy extras mapped approximately
  budget: 'transport_pratique',
  securite: 'transport_pratique',
};

function mapCategory(v?: string): string | undefined {
  if (!v) return undefined;
  return CAT_MAP[v] || v;
}

function StoryStepInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [anecdote, setAnecdote] = useState("");
  const [plans, setPlans] = useState<Array<{ address: string; type?: string; categories?: string[]; description: string; latitude?: string; longitude?: string; locatorType?: 'address' | 'map' }>>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const addressRefs = useRef<Array<HTMLInputElement | null>>([]);
  const acRefs = useRef<any[]>([]);

  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [activeMapPlanIndex, setActiveMapPlanIndex] = useState<number | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const googleMapObj = useRef<google.maps.Map | null>(null);
  const markerObj = useRef<google.maps.Marker | null>(null);

  // Ensure Google Places is loaded, then attach autocomplete to each address input
  useEffect(() => {
    function ensurePlacesLoaded(cb: () => void) {
      const g = (window as any).google;
      if (g?.maps?.places) { cb(); return; }
      let script = document.querySelector('script[data-gmaps="true"]') as HTMLScriptElement | null;
      if (!script) {
        const url = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GMAPS_KEY)}&libraries=places&language=fr`;
        script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.defer = true;
        script.dataset.gmaps = 'true';
        document.head.appendChild(script);
      }
      script!.addEventListener('load', () => setTimeout(cb, 30), { once: true });
    }

    function attachAll() {
      const g = (window as any).google;
      if (!g?.maps?.places) return;
      addressRefs.current.forEach((el, idx) => {
        if (!el) return;
        if (acRefs.current[idx]) return; // already attached
        const ac = new g.maps.places.Autocomplete(el, {
          fields: ["formatted_address", "name"],
          types: ["geocode"],
        });
        ac.addListener('place_changed', () => {
          const plc = ac.getPlace();
          const text = plc?.formatted_address || plc?.name || '';
          if (!text) return;
          setPlans((arr) => arr.map((it, i) => i === idx ? { ...it, address: text } : it));
        });
        acRefs.current[idx] = ac;
      });
    }

    ensurePlacesLoaded(attachAll);
    // Re-attach when items change
    setTimeout(() => ensurePlacesLoaded(attachAll), 0);
  }, [plans.length]);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(String(id))}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Fetch failed");
        const s = j?.submission;
        if (!s) return;
        setAnecdote(s.anecdote_text ?? "");
        const bp = Array.isArray(s?.bon_plans) ? s.bon_plans : [];
        if (bp.length > 0) {
          const normalized = bp.map((p: any) => ({
            address: p.address || "",
            description: p.description || "",
            type: mapCategory(p.type) || "",
            categories: Array.isArray(p.categories)
              ? p.categories.map((x: string) => mapCategory(x)!).filter(Boolean)
              : (p.type ? [mapCategory(p.type)!] : []),
            latitude: p.latitude || "",
            longitude: p.longitude || "",
            locatorType: (p.latitude && !p.address) ? 'map' : 'address'
          }));
          setPlans(normalized.slice(0, 3));
        } else {
          // Initialize based on stages
          const stageCount = [s.stage1, s.stage2, s.stage3].filter(Boolean).length || 1;
          const defaultPlans = Array(stageCount).fill(null).map(() => ({ address: "", description: "", categories: [], type: "", latitude: "", longitude: "", locatorType: 'address' as const }));
          setPlans(defaultPlans);
        }
      } catch (e: any) {
        setMsg(e?.message || "Chargement impossible");
      }
    })();
  }, [id]);

  async function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (!id) { setMsg("Identifiant manquant"); return; }
    setLoading(true);
    setMsg(null);
    try {
      const firstPlan = plans[0];
      const rootCoords = firstPlan?.latitude && firstPlan?.longitude
        ? { latitude: parseFloat(firstPlan.latitude), longitude: parseFloat(firstPlan.longitude) }
        : {};

      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          anecdote_text: anecdote || null,
          bon_plans: plans,
          ...rootCoords
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Échec de sauvegarde');
      const nextParams = new URLSearchParams();
      nextParams.set('id', String(id));
      router.push(`/submit/preview?${nextParams.toString()}`);
    } catch (e: any) {
      setMsg(e?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="submit-page">
      <section className="container" style={{ maxWidth: 820 }}>
        <div className="card">
          <header className="submit-header">
            <h1 className="submit-title">Anecdote et bons plans</h1>
            <p className="submit-subtitle">Partage ton histoire et tes bons plans</p>
            {mapsError && <p className="submit-error" style={{ color: 'crimson', fontSize: '13px', marginTop: 8 }}>{mapsError}</p>}
          </header>
          <form onSubmit={handleNext} className="submit-form">
            <label className="label">
              Ton anecdote
              <textarea
                className="input pill-input white-border"
                rows={5}
                placeholder="Raconte ton expérience..."
                value={anecdote}
                onChange={(e) => setAnecdote(e.target.value)}
              />
            </label>

            <div className="stack" style={{ marginTop: 16 }}>
              <div className="label" style={{ fontWeight: 700 }}>Bon(s) plan(s)</div>
              {plans.map((p, idx) => (
                <div
                  key={idx}
                  className="input white-border"
                  style={{
                    padding: 12,
                    marginBottom: 10,
                    borderRadius: 16,
                    background: '#f8fbff',
                    borderColor: '#cfe9f3',
                    boxShadow: '0 2px 8px rgba(0,0,0,.06)'
                  }}
                >
                  <div className="grid-2">
                    <label className="label">
                      Localisation du bon plan (Optionnel)
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                        <button
                          type="button"
                          className="btn"
                          style={{ flex: 1, padding: '8px', fontSize: '14px', background: p.locatorType === 'map' ? '#fff' : '#0f172a', color: p.locatorType === 'map' ? '#0f172a' : '#fff', border: '1px solid #cbd5e1' }}
                          onClick={() => setPlans(arr => arr.map((it, i) => i === idx ? { ...it, locatorType: 'address', latitude: '', longitude: '' } : it))}
                        >
                          Adresse / Nom
                        </button>
                        <button
                          type="button"
                          className="btn"
                          style={{ flex: 1, padding: '8px', fontSize: '14px', background: p.locatorType === 'map' ? '#0f172a' : '#fff', color: p.locatorType === 'map' ? '#fff' : '#0f172a', border: '1px solid #cbd5e1' }}
                          onClick={() => {
                            setPlans(arr => arr.map((it, i) => i === idx ? { ...it, locatorType: 'map', address: '' } : it));
                            setActiveMapPlanIndex(idx);
                            setIsMapModalOpen(true);
                          }}
                        >
                          Point GPS
                        </button>
                      </div>

                      {p.locatorType !== 'map' ? (
                        <input
                          className="input pill-input white-border"
                          style={{ width: '100%' }}
                          value={p.address}
                          onChange={(e) => setPlans((arr) => arr.map((it, i) => i === idx ? { ...it, address: e.target.value } : it))}
                          ref={(el) => { addressRefs.current[idx] = el; }}
                          placeholder="ex: 12 Rue de la Paix, Paris"
                        />
                      ) : (
                        <div style={{ padding: '12px', background: '#eaf3fb', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', border: '1px dashed #93c5fd' }}
                             onClick={() => { setActiveMapPlanIndex(idx); setIsMapModalOpen(true); }}>
                          {p.latitude && p.longitude ? (
                            <span style={{ color: '#10b981', fontWeight: 600 }}>✓ Position enregistrée ({parseFloat(p.latitude).toFixed(3)}, {parseFloat(p.longitude).toFixed(3)})<br/><span style={{fontSize: 12, fontWeight: 'normal', color: '#64748b'}}>Cliquez pour modifier</span></span>
                          ) : (
                            <span style={{ color: '#0ea5e9', fontWeight: 600 }}>📍 Cliquer ici pour placer le point sur la carte</span>
                          )}
                        </div>
                      )}
                    </label>
                    <label className="label">
                      Catégorie
                      <select
                        className="input pill-input white-border"
                        value={p.type || (p.categories && p.categories[0]) || ''}
                        onChange={(e) => {
                          const v = e.currentTarget.value;
                          setPlans((arr) => arr.map((it, i) => i === idx ? { ...it, type: v, categories: v ? [v] : [] } : it));
                        }}
                      >
                        <option value="">Choisir…</option>
                        <option value="restaurants_streetfood">🍴 Restaurants & Street Food</option>
                        <option value="nature_paysages">🌳 Nature & Paysages</option>
                        <option value="culture_patrimoine">🏛️ Culture & Patrimoine</option>
                        <option value="vie_locale_sorties">🎉 Vie locale & Sorties</option>
                        <option value="aventures_activites">🚶‍♂️ Aventures & Activités</option>
                        <option value="shopping_artisanat">🛍️ Shopping & Artisanat</option>
                        <option value="logements_hospitalite">🏨 Logements & Hospitalité</option>
                        <option value="transport_pratique">🚗 Transport & Bons Plans Pratiques</option>
                      </select>
                    </label>
                  </div>
                  <label className="label">
                    Description / Avis
                    <textarea
                      className="input pill-input white-border"
                      rows={3}
                      placeholder="Décris ce bon plan et ton avis"
                      value={p.description}
                      onChange={(e) => setPlans((arr) => arr.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))}
                    />
                  </label>
                  {plans.length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button className="btn" type="button" onClick={() => setPlans((arr) => arr.filter((_, i) => i !== idx))}>Supprimer ce bon plan</button>
                    </div>
                  )}
                </div>
              ))}
              {plans.length < 3 && (
                <div>
                  <button
                    className="btn"
                    type="button"
                    onClick={() => setPlans((arr) => (arr.length >= 3 ? arr : [...arr, { address: '', type: '', description: '' }]))}
                  >
                    Ajouter un bon plan
                  </button>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button className="checkin-btn ready" type="submit" disabled={loading}>
                {loading ? (
                  <span className="checkin-inner">
                    <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" style={{ animation: 'rotation 1s linear infinite' }}>
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                    Enregistrement...
                  </span>
                ) : (
                  <span className="checkin-inner">Continuer</span>
                )}
              </button>
            </div>
            {msg && <div style={{ marginTop: 8, color: 'crimson' }}>{msg}</div>}
          </form>
        </div>
      </section>
      {/* Google Maps Precision Map Modal for Bon Plans */}
      {isMapModalOpen && activeMapPlanIndex !== null && (
        <MapModal
          initialLat={parseFloat(plans[activeMapPlanIndex].latitude || '48.8566')}
          initialLng={parseFloat(plans[activeMapPlanIndex].longitude || '2.3522')}
          onClose={() => {
            setIsMapModalOpen(false);
            setActiveMapPlanIndex(null);
          }}
          onValidate={(lat, lng) => {
            setPlans((arr) => arr.map((it, i) => i === activeMapPlanIndex ? { ...it, latitude: lat, longitude: lng } : it));
            setIsMapModalOpen(false);
            setActiveMapPlanIndex(null);
          }}
        />
      )}
    </main>
  );
}

// Separate component for MapModal to handle its own map initialization and lifecycle properly
function MapModal({ initialLat, initialLng, onClose, onValidate }: { initialLat: number; initialLng: number; onClose: () => void; onValidate: (lat: string, lng: string) => void }) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerObj = useRef<google.maps.Marker | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;
    const g = (window as any).google;
    if (!g?.maps) {
      setError("L'API Google Maps n'est pas encore chargée.");
      return;
    }

    const map = new g.maps.Map(mapRef.current, {
      center: { lat: initialLat || 48.8566, lng: initialLng || 2.3522 },
      zoom: 16,
      mapTypeId: 'hybrid',
      disableDefaultUI: true,
      zoomControl: true,
    });

    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng && markerObj.current) {
        markerObj.current.setPosition(e.latLng);
      }
    });

    markerObj.current = new g.maps.Marker({
      position: { lat: initialLat || 48.8566, lng: initialLng || 2.3522 },
      map: map,
      draggable: true,
      animation: g.maps.Animation.DROP,
    });

  }, [initialLat, initialLng]);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <div style={{ padding: '16px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Déplacer le marqueur au point précis</h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', padding: '0 8px' }}
            aria-label="Fermer"
          >
            &times;
          </button>
        </div>
        {error && <div style={{ padding: '16px', color: 'crimson', borderBottom: '1px solid #eee' }}>{error}</div>}
        <div ref={mapRef} style={{ flex: 1, width: '100%' }}></div>
        <div style={{ padding: '16px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="checkin-btn"
            onClick={() => {
              if (markerObj.current) {
                const pos = markerObj.current.getPosition();
                if (pos) {
                  onValidate(pos.lat().toString(), pos.lng().toString());
                  return;
                }
              }
              onClose();
            }}
          >
            <span className="checkin-inner">Valider cette position</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StoryStepPage() {
  return (
    <Suspense fallback={null}>
      <StoryStepInner />
    </Suspense>
  );
}
