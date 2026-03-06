"use client";

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import logo from '../../../img/logo.png';
import { Suspense, useEffect, useState } from 'react';
import AddressAutocomplete from '../../components/AddressAutocomplete';

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

// Allow all types for "Bon plans" (restaurants, museums, etc.)
const TIPS_TYPES: string[] = [];

function SubmitStep3Inner() {
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
  const [isPublishing, setIsPublishing] = useState(false);

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
    try { localStorage.setItem(draftKey, JSON.stringify(payload)); } catch { }
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
    setIsPublishing(true);

    (async () => {
      if (!submissionId) {
        setSummaryError("Identifiant de soumission manquant. Reviens en arrière et relance 'check in'.");
        setIsPublishing(false);
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
        try { if (submissionId) localStorage.removeItem(`submit_step3_${submissionId}`); } catch { }

        // Redirect to map
        router.push('/map');
      } catch (e: any) {
        setSummaryError(e?.message || 'Échec de sauvegarde. Réessaie.');
        setIsPublishing(false);
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
    <main className="submit-page">
      <section className="container" style={{ maxWidth: 820 }}>
        <div className="card paper-texture" style={{ border: 'none' }}>
          <header className="submit-header">
            <h1 className="submit-title font-hand" style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>Le Livre d'Or</h1>
            <p className="submit-subtitle font-hand" style={{ fontSize: '1.5rem' }}>Raconte-nous ton histoire...</p>

            <div className="submit-steps stepper-3" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
              <div className="steps-line" />
              <div className="steps-progress" />
              <div className="step" aria-label="Recherche">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z" /></svg>
              </div>
              <div className="step" aria-label="Voyage">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" /></svg>
              </div>
              <div className="step active" aria-label="Livre">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a1 1 0 0 0-1-1H6Z" /></svg>
              </div>
            </div>
          </header>

          <div className="submit-form" style={{ padding: '0 24px 24px' }}>

            <div className="stack" style={{ gap: '24px' }}>
              <div>
                <label className="notebook-label">Tes 3 coups de cœur ❤️</label>

                {/* Tip 1 */}
                <div className={`tip-row ${errors.tip1 ? 'invalid' : ''}`} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 72px', gap: 12, marginBottom: 12 }}>
                  <AddressAutocomplete
                    apiKey={apiKey}
                    className={`notebook-input ${errors.tip1 ? 'invalid' : ''}`}
                    placeholder="Lieu incontournable 1*"
                    value={tip1}
                    onChange={setTip1}
                    types={TIPS_TYPES}
                  />
                  <div className="cat-select-wrap">
                    <span className="cat-emoji-preview" aria-hidden>{(CATEGORIES.find(c => c.key === cat1)?.emoji) || '🏷️'}</span>
                    <select className={`pill-input white-border cat-select ${errors.cat1 ? 'invalid' : ''}`} value={cat1} onChange={(e) => setCat1(e.target.value)} title={cat1 ? (CATEGORIES.find(c => c.key === cat1)?.label || '') : ''}>
                      <option value="" disabled>Catégorie*</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{`${c.emoji} ${c.label}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {cat1 === 'other' && (
                  <input className="notebook-input" placeholder="Précise..." value={cat1Other} onChange={(e) => setCat1Other(e.target.value)} />
                )}

                {/* Tip 2 */}
                <div className="tip-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 72px', gap: 12, marginBottom: 12 }}>
                  <AddressAutocomplete
                    apiKey={apiKey}
                    className="notebook-input"
                    placeholder="Lieu incontournable 2"
                    value={tip2}
                    onChange={setTip2}
                    types={TIPS_TYPES}
                  />
                  <div className="cat-select-wrap">
                    <span className="cat-emoji-preview" aria-hidden>{(CATEGORIES.find(c => c.key === cat2)?.emoji) || '🏷️'}</span>
                    <select className="pill-input white-border cat-select" value={cat2} onChange={(e) => setCat2(e.target.value)} title={cat2 ? (CATEGORIES.find(c => c.key === cat2)?.label || '') : ''}>
                      <option value="">Catégorie</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{`${c.emoji} ${c.label}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {cat2 === 'other' && (
                  <input className="notebook-input" placeholder="Précise..." value={cat2Other} onChange={(e) => setCat2Other(e.target.value)} />
                )}

                {/* Tip 3 */}
                <div className="tip-row" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 72px', gap: 12 }}>
                  <AddressAutocomplete
                    apiKey={apiKey}
                    className="notebook-input"
                    placeholder="Lieu incontournable 3"
                    value={tip3}
                    onChange={setTip3}
                    types={TIPS_TYPES}
                  />
                  <div className="cat-select-wrap">
                    <span className="cat-emoji-preview" aria-hidden>{(CATEGORIES.find(c => c.key === cat3)?.emoji) || '🏷️'}</span>
                    <select className="pill-input white-border cat-select" value={cat3} onChange={(e) => setCat3(e.target.value)} title={cat3 ? (CATEGORIES.find(c => c.key === cat3)?.label || '') : ''}>
                      <option value="">Catégorie</option>
                      {CATEGORIES.map((c) => (
                        <option key={c.key} value={c.key}>{`${c.emoji} ${c.label}`}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {cat3 === 'other' && (
                  <input className="notebook-input" placeholder="Précise..." value={cat3Other} onChange={(e) => setCat3Other(e.target.value)} />
                )}
              </div>

              <div>
                <label className="notebook-label">Ton anecdote de voyage ✍️</label>
                <textarea
                  className="notebook-input"
                  placeholder="Raconte-nous un moment marquant, une rencontre, ou un imprévu..."
                  value={anecdote}
                  onChange={(e) => setAnecdote(e.target.value)}
                  rows={6}
                  style={{ width: '100%', resize: 'vertical', minHeight: '150px', lineHeight: '1.5' }}
                />
              </div>
            </div>

            {summaryError && <p className="submit-error" style={{ textAlign: 'center', marginTop: '1rem' }}>{summaryError}</p>}

            <div className="cta-row" style={{ marginTop: '2rem' }}>
              <button type="button" className={`checkin-btn ${ready ? 'ready' : ''}`} onClick={handlePublish} disabled={isPublishing}>
                <span className="checkin-inner">
                  {isPublishing ? 'Publication...' : 'Publier mon carnet !'}
                </span>
              </button>
              <button type="button" className="checkin-btn checkin-btn--danger" onClick={handleBack} disabled={isPublishing}>
                <span className="checkin-inner">
                  Retour
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SubmitStep3Page() {
  return (
    <Suspense fallback={null}>
      <SubmitStep3Inner />
    </Suspense>
  );
}
