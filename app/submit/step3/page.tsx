"use client";

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import logo from '../../../img/logo.png';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

const CATEGORIES = [
  { key: 'food', label: 'Restaurants & Street Food', emoji: '🍴' },
  { key: 'nature', label: 'Nature & Paysages', emoji: '🌳' },
  { key: 'culture', label: 'Culture & Patrimoine', emoji: '🏛️' },
  { key: 'nightlife', label: 'Vie locale & Sorties', emoji: '🎉' },
  { key: 'adventure', label: 'Aventures & Activités', emoji: '🚶‍♂️' },
  { key: 'shopping', label: 'Shopping & Artisanat', emoji: '🛍️' },
  { key: 'stay', label: 'Logements & Hospitalité', emoji: '🏨' },
  { key: 'transport', label: 'Transport & Bons Plans Pratiques', emoji: '🚗' },
  { key: 'other', label: 'Autre', emoji: '➕' },
];

export default function SubmitStep3Page() {
  const router = useRouter();
  const params = useSearchParams();
  const submissionId = params.get('id');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

  const [tip1, setTip1] = useState('');
  const [tip2, setTip2] = useState('');
  const [tip3, setTip3] = useState('');

  const [cat1, setCat1] = useState<string>('');
  const [cat2, setCat2] = useState<string>('');
  const [cat3, setCat3] = useState<string>('');
  const [cat1Other, setCat1Other] = useState('');
  const [cat2Other, setCat2Other] = useState('');
  const [cat3Other, setCat3Other] = useState('');

  const [anecdote, setAnecdote] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const tip1Ref = useRef<HTMLInputElement | null>(null);
  const tip2Ref = useRef<HTMLInputElement | null>(null);
  const tip3Ref = useRef<HTMLInputElement | null>(null);

  // Load Google Maps Places and attach Autocomplete to tips
  useEffect(() => {
    if (!apiKey || typeof window === 'undefined') return;

    function ensurePlacesLoaded(): Promise<typeof google> {
      return new Promise((resolve, reject) => {
        if (typeof window.google !== 'undefined' && (window as any).google?.maps?.places) {
          return resolve((window as any).google);
        }
        const existing = document.getElementById('google-maps-sdk');
        if (existing) {
          existing.addEventListener('load', () => resolve((window as any).google));
          existing.addEventListener('error', () => reject(new Error('Failed to load Google Maps script')));
          return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve((window as any).google);
        script.onerror = () => reject(new Error('Failed to load Google Maps script'));
        document.head.appendChild(script);
      });
    }

    let cancelled = false;
    ensurePlacesLoaded()
      .then((g) => {
        if (cancelled) return;
        const opts: google.maps.places.AutocompleteOptions = {};

        const setup = (input: HTMLInputElement | null, setValue: (v: string) => void) => {
          if (!input) return;
          const ac = new g.maps.places.Autocomplete(input, opts);
          ac.addListener('place_changed', () => {
            const place = ac.getPlace();
            const val = place?.formatted_address || place?.name || input.value;
            input.value = val || '';
            setValue(val || '');
          });
        };

        setup(tip1Ref.current, setTip1);
        setup(tip2Ref.current, setTip2);
        setup(tip3Ref.current, setTip3);
      })
      .catch((e) => console.error(e));

    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // Prefill from Supabase and restore from localStorage
  useEffect(() => {
    (async () => {
      const draftKey = submissionId ? `submit_step3_${submissionId}` : null;
      try {
        if (draftKey) {
          const draftRaw = localStorage.getItem(draftKey);
          if (draftRaw) {
            const d = JSON.parse(draftRaw);
            if (d) {
              if (typeof d.tip1 === 'string') setTip1(d.tip1);
              if (typeof d.tip2 === 'string') setTip2(d.tip2);
              if (typeof d.tip3 === 'string') setTip3(d.tip3);
              if (typeof d.cat1 === 'string') setCat1(d.cat1);
              if (typeof d.cat2 === 'string') setCat2(d.cat2);
              if (typeof d.cat3 === 'string') setCat3(d.cat3);
              if (typeof d.cat1Other === 'string') setCat1Other(d.cat1Other);
              if (typeof d.cat2Other === 'string') setCat2Other(d.cat2Other);
              if (typeof d.cat3Other === 'string') setCat3Other(d.cat3Other);
              if (typeof d.anecdote === 'string') setAnecdote(d.anecdote);
            }
          }
        }
        if (!submissionId) return;
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(submissionId)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Fetch failed');
        const s = json?.submission;
        if (!s) return;
        if (typeof s.tip1 === 'string') setTip1(s.tip1);
        if (typeof s.tip2 === 'string') setTip2(s.tip2);
        if (typeof s.tip3 === 'string') setTip3(s.tip3);
        if (typeof s.tip1_category === 'string') setCat1(s.tip1_category);
        if (typeof s.tip2_category === 'string') setCat2(s.tip2_category);
        if (typeof s.tip3_category === 'string') setCat3(s.tip3_category);
        if (typeof s.anecdote_text === 'string') setAnecdote(s.anecdote_text);
      } catch (e) {
        console.warn('Step3 prefill failed', e);
      }
    })();
  }, [submissionId]);

  // Autosave to localStorage
  useEffect(() => {
    const draftKey = submissionId ? `submit_step3_${submissionId}` : null;
    if (!draftKey) return;
    const payload = {
      tip1, tip2, tip3,
      cat1, cat2, cat3,
      cat1Other, cat2Other, cat3Other,
      anecdote,
    };
    try { localStorage.setItem(draftKey, JSON.stringify(payload)); } catch {}
  }, [submissionId, tip1, tip2, tip3, cat1, cat2, cat3, cat1Other, cat2Other, cat3Other, anecdote]);

  function handlePublish() {
    const missing: Record<string, boolean> = {};
    if (!tip1.trim()) missing.tip1 = true;
    const effectiveCat1 = cat1 === 'other' ? (cat1Other.trim() ? 'other' : '') : cat1;
    if (!effectiveCat1) missing.cat1 = true;

    setErrors(missing);
    if (Object.keys(missing).length) {
      setSummaryError('Complète au minimum le Bon plan 1 et sa catégorie.');
      return;
    }
    setSummaryError(null);

    (async () => {
      if (!submissionId) {
        setSummaryError("Identifiant de soumission manquant. Reviens en arrière et relance 'check in'.");
        return;
      }
      try {
        const res = await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: submissionId,
            tip1: tip1.trim(),
            tip2: tip2.trim() || null,
            tip3: tip3.trim() || null,
            tip1_category: cat1 === 'other' ? (cat1Other.trim() || 'other') : cat1,
            tip2_category: cat2 === 'other' ? (cat2Other.trim() || 'other') : (cat2 || null),
            tip3_category: cat3 === 'other' ? (cat3Other.trim() || 'other') : (cat3 || null),
            anecdote_text: anecdote.trim() || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Update failed');
        // Clear draft after successful publish
        try { if (submissionId) localStorage.removeItem(`submit_step3_${submissionId}`); } catch {}
        // Open PDF in a new tab
        try { if (submissionId) window.open(`/api/pdf?id=${encodeURIComponent(String(submissionId))}`, '_blank', 'noopener'); } catch {}
        router.push('/map');
      } catch (e: any) {
        setSummaryError(e?.message || 'Échec de sauvegarde. Réessaie.');
      }
    })();
  }

  function handleBack() {
    const search = new URLSearchParams();
    if (submissionId) search.set('id', String(submissionId));
    router.push(`/submit/step2${search.toString() ? `?${search.toString()}` : ''}`);
  }

  const ready = Boolean(tip1.trim() && (cat1 === 'other' ? cat1Other.trim() : cat1));

  return (
    <Suspense fallback={null}>
    <main className="submit-page">
      <section className="container" style={{ maxWidth: 820 }}>
        <div className="card">
          <header className="submit-header">
            <h1 className="submit-title">Mon anecdote Globetrotter</h1>
            <p className="submit-subtitle">Partage ton voyage avec nous</p>
            <div className="submit-banner">
              <Image src={logo} alt="GlobeTrotter" className="submit-banner-logo" width={48} height={48} priority />
              <div className="submit-banner-text">Seul, en groupe ou pour le travail dans tous les voyages il y a de l'aventure !</div>
            </div>
            <p className="submit-hint">Les champs précédés d'une "*" sont obligatoires</p>
            <div className="submit-steps stepper-3">
              <div className="steps-line" />
              <div className="steps-progress" />
              <div className="step" aria-label="Recherche">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z"/></svg>
              </div>
              <div className="step" aria-label="Voyage">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/></svg>
              </div>
              <div className="step active" aria-label="Livre">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a1 1 0 0 0-1-1H6Z"/></svg>
              </div>
            </div>
          </header>

          <div className="submit-form">
            <p className="submit-subtitle" style={{ textAlign: 'left' }}>Donne tes trois meilleurs lieux</p>

            {/* Tip 1 */}
            <div className={`tip-row ${errors.tip1 ? 'invalid' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 72px', gap: 12 }}>
              <input ref={tip1Ref} className={`pill-input white-border ${errors.tip1 ? 'invalid' : ''}`} placeholder="Bon plan 1*" value={tip1} onChange={(e) => setTip1(e.target.value)} />
              <div className="cat-select-wrap">
                <span className="cat-emoji-preview" aria-hidden>{(CATEGORIES.find(c=>c.key===cat1)?.emoji) || '🏷️'}</span>
                <select className={`pill-input white-border cat-select ${errors.cat1 ? 'invalid' : ''}`} value={cat1} onChange={(e) => setCat1(e.target.value)} title={cat1 ? (CATEGORIES.find(c=>c.key===cat1)?.label || '') : ''}>
                  <option value="" disabled>Catégorie*</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{`${c.emoji} ${c.label}`}</option>
                  ))}
                </select>
                {cat1 === 'other' && (
                  <input className="pill-input white-border" placeholder="Précise la catégorie" value={cat1Other} onChange={(e) => setCat1Other(e.target.value)} style={{ marginTop: 8 }} />
                )}
              </div>
            </div>

            {/* Tip 2 */}
            <div className="tip-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 72px', gap: 12 }}>
              <input ref={tip2Ref} className="pill-input white-border" placeholder="Bon plan 2" value={tip2} onChange={(e) => setTip2(e.target.value)} />
              <div className="cat-select-wrap">
                <span className="cat-emoji-preview" aria-hidden>{(CATEGORIES.find(c=>c.key===cat2)?.emoji) || '🏷️'}</span>
                <select className="pill-input white-border cat-select" value={cat2} onChange={(e) => setCat2(e.target.value)} title={cat2 ? (CATEGORIES.find(c=>c.key===cat2)?.label || '') : ''}>
                  <option value="">Catégorie</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{`${c.emoji} ${c.label}`}</option>
                  ))}
                </select>
                {cat2 === 'other' && (
                  <input className="pill-input white-border" placeholder="Précise la catégorie" value={cat2Other} onChange={(e) => setCat2Other(e.target.value)} style={{ marginTop: 8 }} />
                )}
              </div>
            </div>

            {/* Tip 3 */}
            <div className="tip-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 72px', gap: 12 }}>
              <input ref={tip3Ref} className="pill-input white-border" placeholder="Bon plan 3" value={tip3} onChange={(e) => setTip3(e.target.value)} />
              <div className="cat-select-wrap">
                <span className="cat-emoji-preview" aria-hidden>{(CATEGORIES.find(c=>c.key===cat3)?.emoji) || '🏷️'}</span>
                <select className="pill-input white-border cat-select" value={cat3} onChange={(e) => setCat3(e.target.value)} title={cat3 ? (CATEGORIES.find(c=>c.key===cat3)?.label || '') : ''}>
                  <option value="">Catégorie</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.key} value={c.key}>{`${c.emoji} ${c.label}`}</option>
                  ))}
                </select>
                {cat3 === 'other' && (
                  <input className="pill-input white-border" placeholder="Précise la catégorie" value={cat3Other} onChange={(e) => setCat3Other(e.target.value)} style={{ marginTop: 8 }} />
                )}
              </div>
            </div>

            <label className="label" style={{ marginTop: 16 }}>
              Raconte-nous tes aventures ou révèle tes bons plans
              <textarea className="pill-input white-border" placeholder="..." value={anecdote} onChange={(e) => setAnecdote(e.target.value)} rows={5} />
            </label>

            {summaryError && <p className="submit-error" style={{ textAlign: 'center' }}>{summaryError}</p>}
            <div className="cta-row">
              <button type="button" className={`checkin-btn ${ready ? 'ready' : ''}`} onClick={handlePublish}>
                <span className="checkin-inner">
                  <svg className="plane" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/>
                  </svg>
                  Publier mon voyage !
                </span>
              </button>
              <button type="button" className="checkin-btn checkin-btn--danger" onClick={handleBack}>
                <span className="checkin-inner">
                  <svg className="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 19 3 12l7-7v4h8v6h-8v4Z"/></svg>
                  Retour
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
    </Suspense>
  );
}
