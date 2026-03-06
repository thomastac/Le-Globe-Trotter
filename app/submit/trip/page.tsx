"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';
import logo from '../../../img/logo.png';
import globeEmoji from '../../../img/emojis/globe.png';
import campingEmoji from '../../../img/emojis/camping.png';
import beachEmoji from '../../../img/emojis/beach-with-umbrella_1f3d6-fe0f.png';
import cultureEmoji from '../../../img/emojis/culture.png';
import roadtripEmoji from '../../../img/emojis/Roadtrip.png';
import volontariatEmoji from '../../../img/emojis/volontariat.png';
import spiritualiteEmoji from '../../../img/emojis/spiritualité.png';
import proEmoji from '../../../img/emojis/professionnel.png';

const DURATION_OPTIONS = [
  { k: "<3m", label: "< 3 mois" },
  { k: "3-6m", label: "3 - 6 mois" },
  { k: ">6m", label: "> 6 mois" },
];

// Build-time inlined public key (prevents 'process is not defined' at runtime)
const GMAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const CONTEXT_OPTIONS: { k: string; label: string; img?: any }[] = [
  { k: "multi", label: "Multi Pays", img: globeEmoji },
  { k: "aventure", label: "Aventure", img: campingEmoji },
  { k: "detente", label: "Détente", img: beachEmoji },
  { k: "culture", label: "Culture", img: cultureEmoji },
  { k: "roadtrip", label: "Roadtrip", img: roadtripEmoji },
  { k: "volontariat", label: "Volontariat", img: volontariatEmoji },
  { k: "spiritualite", label: "Spiritualité", img: spiritualiteEmoji },
  { k: "pro", label: "Professionnel", img: proEmoji },
  { k: "autres", label: "Autres …" },
];

function TripStepInner() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get("id");

  const [duration, setDuration] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [city, setCity] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [contexts, setContexts] = useState<string[]>([]);
  const [otherContext, setOtherContext] = useState<string>("");
  const [stage1, setStage1] = useState("");
  const [stage2, setStage2] = useState("");
  const [stage3, setStage3] = useState("");
  const stage1Ref = useRef<HTMLInputElement | null>(null);
  const stage2Ref = useRef<HTMLInputElement | null>(null);
  const stage3Ref = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [retourHover, setRetourHover] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const stepsWrapRef = useRef<HTMLDivElement | null>(null);
  const step1Ref = useRef<HTMLDivElement | null>(null);
  const step2Ref = useRef<HTMLDivElement | null>(null);
  const step3Ref = useRef<HTMLDivElement | null>(null);
  const midBgRef = useRef<HTMLDivElement | null>(null);
  const midFgRef = useRef<HTMLDivElement | null>(null);
  const leftFgRef = useRef<HTMLDivElement | null>(null);

  // Scroll-driven progress between step 2 and step 3
  useEffect(() => {
    function layoutSegment() {
      const wrap = stepsWrapRef.current;
      const s1 = step1Ref.current;
      const s2 = step2Ref.current;
      const s3 = step3Ref.current;
      const midBg = midBgRef.current;
      const midFg = midFgRef.current;
      const leftFg = leftFgRef.current;
      if (!wrap || !s1 || !s2 || !s3 || !midBg || !midFg || !leftFg) return;
      const wrapRect = wrap.getBoundingClientRect();
      const r1 = s1.getBoundingClientRect();
      const r2 = s2.getBoundingClientRect();
      const r3 = s3.getBoundingClientRect();
      const c1 = r1.left + r1.width / 2 - wrapRect.left;
      const c2 = r2.left + r2.width / 2 - wrapRect.left;
      const c3 = r3.left + r3.width / 2 - wrapRect.left;
      const left = Math.min(c2, c3);
      const width = Math.abs(c3 - c2);
      midBg.style.left = `${left}px`;
      midBg.style.width = `${width}px`;
      midFg.style.left = `${left}px`;
      // Left, already-filled segment (search -> plane)
      const leftLeft = Math.min(c1, c2);
      const leftWidth = Math.abs(c2 - c1);
      leftFg.style.left = `${leftLeft}px`;
      leftFg.style.width = `${leftWidth}px`;
      // do not set width here; width follows scroll percent
      updateProgress();
    }

    function updateProgress() {
      const midBg = midBgRef.current;
      const midFg = midFgRef.current;
      if (!midBg || !midFg) return;
      const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const pct = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const bgWidth = midBg.getBoundingClientRect().width;
      midFg.style.width = `${bgWidth * pct}px`;
    }

    const onScroll = () => updateProgress();
    const onResize = () => layoutSegment();

    layoutSegment();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    // Re-layout after fonts/images may shift positions
    const t = setTimeout(layoutSegment, 200);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      clearTimeout(t);
    };
  }, []);

  // Track desktop vs mobile to adjust context card size only on desktop
  useEffect(() => {
    const update = () => setIsDesktop(window.innerWidth >= 1024);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Init Google Places Autocomplete for stages (cities and countries only)
  useEffect(() => {
    function attachAutocomplete(input: HTMLInputElement | null, setter: (v: string) => void) {
      try {
        const g = (window as any).google;
        if (!g?.maps?.places || !input) return;
        const ac = new g.maps.places.Autocomplete(input, {
          fields: ["name", "types", "address_components"],
          // '(regions)' allows countries and admin areas; we'll filter to only country or locality
          types: ["(regions)"],
        });
        ac.addListener("place_changed", () => {
          const plc = ac.getPlace();
          const types: string[] = plc?.types || [];
          const name = plc?.name || "";
          const isCity = types.includes('locality') || types.includes('postal_town');
          const isCountry = types.includes('country');
          if (isCity || isCountry) {
            setter(name);
            if (input && name) input.value = name;
          } else {
            // Reject other region types; clear input visual if not allowed
            if (input) input.value = '';
          }
        });
      } catch { }
    }

    function ensurePlacesLoaded(cb: () => void) {
      const g = (window as any).google;
      if (g?.maps?.places) { cb(); return; }
      // Inject script if not present
      const existing = document.querySelector('script[data-gmaps="true"]') as HTMLScriptElement | null;
      const url = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GMAPS_KEY)}&libraries=places`;
      const onReady = () => setTimeout(cb, 50);
      if (existing) {
        existing.addEventListener('load', onReady, { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.defer = true;
      s.dataset.gmaps = 'true';
      s.addEventListener('load', onReady, { once: true });
      document.body.appendChild(s);
    }

    ensurePlacesLoaded(() => {
      attachAutocomplete(stage1Ref.current, setStage1);
      attachAutocomplete(stage2Ref.current, setStage2);
      attachAutocomplete(stage3Ref.current, setStage3);
    });
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(String(id))}`);
        const j = await res.json();
        if (!res.ok) throw new Error(j?.error || "Fetch failed");
        const s = j?.submission;
        if (!s) return;
        setYear(s.travel_year != null ? String(s.travel_year) : "");
        setDuration(s.travel_duration_group || s.travel_duration || "");
        const cs: string[] = Array.isArray(s.trip_contexts) ? s.trip_contexts : [];
        setContexts(cs.length > 0 ? cs : (s.trip_context ? [s.trip_context] : []));
        if (cs.includes('autres') || s.trip_context === 'autres') {
          setOtherContext(s.trip_context_other ?? "");
        }
        setStage1(s.stage1 ?? "");
        setStage2(s.stage2 ?? "");
        setStage3(s.stage3 ?? "");
        setCity(s.city ?? "");
        setCountry(s.country ?? "");
      } catch (e: any) {
        setMsg(e?.message || "Chargement impossible");
      }
    })();
  }, [id]);

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const arr: number[] = [];
    for (let y = now; y >= 1990; y--) arr.push(y);
    return arr;
  }, []);

  async function saveAndGo(target: "story" | "preview") {
    if (!id) { setMsg("Identifiant manquant"); return; }

    // Validate required fields before submission
    const missingFields: string[] = [];
    if (!city || !city.trim()) missingFields.push("la ville de destination");
    if (!country || !country.trim()) missingFields.push("le pays de destination");
    if (!year || !year.trim()) missingFields.push("l'année de voyage");
    if (!stage1 || !stage1.trim()) missingFields.push("l'étape 1");

    if (missingFields.length > 0) {
      const fieldsList = missingFields.join(" et ");
      setMsg(`Veuillez remplir ${fieldsList} avant de continuer.`);
      setLoading(false);
      // Focus on the first missing field
      if (!city || !city.trim()) {
        const cityInput = document.getElementById('city-input');
        cityInput?.focus();
      } else if (!country || !country.trim()) {
        const countryInput = document.getElementById('country-input');
        countryInput?.focus();
      } else if (!year || !year.trim()) {
        const yearSelect = document.querySelector('select[className*="pill-input"]') as HTMLSelectElement;
        yearSelect?.focus();
      } else if (!stage1 || !stage1.trim()) {
        stage1Ref.current?.focus();
      }
      return;
    }

    setLoading(true);
    setMsg(null);
    try {
      const body: any = {
        id,
        travel_year: year ? Number(year) : null,
        travel_duration_group: duration || null,
        trip_contexts: contexts.length > 0
          ? contexts.map(c => c === 'autres' ? (otherContext?.trim() ? 'autres' : 'autres') : c)
          : [],
        travel_context_other: contexts.includes('autres') ? (otherContext?.trim() || null) : null,
        stage1: stage1 || null,
        stage2: stage2 || null,
        stage3: stage3 || null,
        city: city || null,
        country: country || null,
      };
      const res = await fetch('/api/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || 'Échec de sauvegarde');
      const q = new URLSearchParams({ id: String(id) }).toString();
      router.push(target === 'story' ? `/submit/story?${q}` : `/submit/preview?${q}`);
    } catch (e: any) {
      setMsg(e?.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="submit-page" style={{ overflowX: 'hidden' }}>
      <section className="container" style={{ maxWidth: 820, margin: '0 auto', padding: '0 12px', overflow: 'hidden' }}>
        <div className="card">
          <header className="submit-header">
            <h1 className="submit-title">Mon anecdote Globetrotter</h1>
            <p className="submit-subtitle">Partage ton voyage avec nous</p>
            <div className="submit-banner">
              <Image src={logo} alt="GlobeTrotter" className="submit-banner-logo" width={48} height={48} priority />
              <div className="submit-banner-text">Seul, en groupe ou pour le travail dans tous les voyages il y a de l'aventure !</div>
            </div>
            <p className="submit-hint">Les champs précédés d'une "*" sont obligatoires</p>
            <div ref={stepsWrapRef} className="submit-steps" style={{ position: 'relative', overflow: 'hidden' }}>
              <div className="steps-line" style={{ display: 'none' }} />
              {/* Middle segment background (plane -> bubble) */}
              <div ref={midBgRef} style={{ position: 'absolute', height: 6, background: 'rgba(15, 23, 42, 0.08)', borderRadius: 6, top: 28, left: 0, width: 0 }} />
              {/* Middle segment foreground (scroll progress) */}
              <div ref={midFgRef} style={{ position: 'absolute', height: 6, background: '#8fb3c6', borderRadius: 6, top: 28, left: 0, width: 0 }} />
              {/* Left filled segment (search -> plane) */}
              <div ref={leftFgRef} style={{ position: 'absolute', height: 6, background: '#8fb3c6', borderRadius: 6, top: 28, left: 0, width: 0 }} />
              <div ref={step1Ref} className="step" aria-label="Recherche">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z" /></svg>
              </div>
              <div ref={step2Ref} className="step active" aria-label="Voyage">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" /></svg>
              </div>
              <div ref={step3Ref} className="step" aria-label="Livre">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a1 1 0 0 0-1-1H6Z" /></svg>
              </div>
            </div>
          </header>

          <div className="submit-form">
            <div className="label">Destination Globale*</div>
            <div className="grid-2" style={{ gap: 8, marginBottom: 14 }}>
              <input id="city-input" className="input pill-input white-border" placeholder="Ville ou Région*" value={city} onChange={(e) => setCity(e.target.value)} />
              <input id="country-input" className="input pill-input white-border" placeholder="Pays*" value={country} onChange={(e) => setCountry(e.target.value)} />
            </div>

            <div className="label">Combien de temps a duré ton voyage ?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
              {DURATION_OPTIONS.map((d) => {
                const active = duration === d.k;
                return (
                  <button key={d.k} type="button" className="input pill-input white-border"
                    onClick={() => setDuration(d.k)}
                    aria-pressed={active}
                    style={{
                      width: '100%',
                      fontWeight: 700,
                      background: active ? '#ffd37a' : '#eaf3fb',
                      borderColor: '#cfe9f3',
                      color: '#0f172a',
                      height: 40,
                      padding: '0 12px',
                      whiteSpace: 'nowrap',
                      display: 'grid', placeItems: 'center',
                      boxShadow: '0 2px 8px rgba(0,0,0,.08)'
                    }}
                  >{d.label}</button>
                );
              })}
            </div>

            <label className="label">Sélectionne l'année de voyage*</label>
            <select
              className="input pill-input white-border"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              <option value="">Sélectionne…</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <div className="label" style={{ marginTop: 14 }}>Quel est le contexte de ton voyage ?</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
              {CONTEXT_OPTIONS.map((c) => {
                const active = contexts.includes(c.k);
                return (
                  <button key={c.k} type="button" className="input white-border"
                    onClick={() => {
                      setContexts(prev => {
                        if (prev.includes(c.k)) {
                          const next = prev.filter(x => x !== c.k);
                          if (c.k === 'autres') setOtherContext('');
                          return next;
                        }
                        return [...prev, c.k];
                      });
                    }}
                    aria-pressed={active}
                    style={{
                      width: '100%',
                      aspectRatio: '1 / 1',
                      height: 'auto',
                      boxSizing: 'border-box',
                      padding: 0,
                      display: 'grid',
                      placeItems: 'center',
                      background: active ? '#ffd37a' : '#eaf3fb',
                      borderColor: '#cfe9f3',
                      color: '#0f172a',
                      borderRadius: 16,
                      boxShadow: '0 2px 8px rgba(0,0,0,.08)'
                    }}
                  >
                    <div style={{ display: 'grid', justifyItems: 'center', alignItems: 'center', padding: isDesktop ? 6 : 8, width: '100%', minWidth: 0 }}>
                      {c.img ? (
                        <Image src={c.img} alt={c.label} width={isDesktop ? 26 : 32} height={isDesktop ? 26 : 32} style={{ objectFit: 'contain' }} />
                      ) : (
                        <div style={{ fontSize: 24, lineHeight: 1 }}>...</div>
                      )}
                      <div style={{ fontWeight: 700, marginTop: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%', textAlign: 'center' }}>
                        {c.label}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {contexts.includes('autres') && (
              <label className="label">
                Précise le contexte
                <input
                  className="input pill-input white-border"
                  placeholder="Ton contexte..."
                  value={otherContext}
                  onChange={(e) => setOtherContext(e.target.value)}
                />
              </label>
            )}

            <div className="label" style={{ marginTop: 6 }}>Donne nous les trois étapes clés de ton voyage ?</div>
            <div className="stack" style={{ gap: 8 }}>
              <input ref={stage1Ref} className="input pill-input white-border" placeholder="Étape 1* (Ville ou Pays)" value={stage1} onChange={(e) => setStage1(e.target.value)} />
              <input ref={stage2Ref} className="input pill-input white-border" placeholder="Étape 2 (Ville ou Pays)" value={stage2} onChange={(e) => setStage2(e.target.value)} />
              <input ref={stage3Ref} className="input pill-input white-border" placeholder="Étape 3 (Ville ou Pays)" value={stage3} onChange={(e) => setStage3(e.target.value)} />
            </div>

            <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr', marginTop: 16 }}>
              <button type="button" className="checkin-btn" onClick={() => saveAndGo('story')} style={{ cursor: 'pointer' }}>
                <span className="checkin-inner">Décollage</span>
              </button>
              <button
                type="button"
                className="checkin-btn"
                onClick={() => router.back()}
                onMouseEnter={() => setRetourHover(true)}
                onMouseLeave={() => setRetourHover(false)}
                style={{
                  background: retourHover ? '#ffe5e5' : '#fff0f0',
                  border: retourHover ? '1px solid #d62828' : '1px solid #f3b5b5',
                  color: '#d62828'
                }}
              >
                <span className="checkin-inner">Retour</span>
              </button>
            </div>

            {msg && <div style={{ marginTop: 8, color: 'crimson' }}>{msg}</div>}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function TripStepPage() {
  return (
    <Suspense fallback={null}>
      <TripStepInner />
    </Suspense>
  );
}
