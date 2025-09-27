"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import logo from '../../../img/logo.png';
import iconGlobe from '../../../img/emojis/globe.png';
import iconCamping from '../../../img/emojis/camping.png';
import iconDetente from '../../../img/emojis/beach-with-umbrella_1f3d6-fe0f.png';
import iconCulture from '../../../img/emojis/culture.png';
import iconRoadtrip from '../../../img/emojis/Roadtrip.png';
import iconVolontariat from '../../../img/emojis/volontariat.png';
import iconSpiritualite from '../../../img/emojis/spiritualité.png';
import iconPro from '../../../img/emojis/professionnel.png';
import { useMemo, useState } from 'react';

export default function SubmitStep2Page() {
  const router = useRouter();
  const params = useSearchParams();
  const submissionId = params.get('id');

  // duration: '<3', '3-6', '>6'
  const [duration, setDuration] = useState<string>('');
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    const start = 1970;
    const arr: number[] = [];
    for (let y = now; y >= start; y--) arr.push(y);
    return arr;
  }, []);
  const [year, setYear] = useState<string>('');

  const [selectedContext, setSelectedContext] = useState<string | null>(null);
  const [otherContext, setOtherContext] = useState<string>('');
  const otherRef = useState<HTMLDivElement | null>(null)[0] as any;

  const [stage1, setStage1] = useState('');
  const [stage2, setStage2] = useState('');
  const [stage3, setStage3] = useState('');
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const CONTEXT_ITEMS = [
    { key: 'multi', label: 'Multi Pays', src: iconGlobe, emoji: '🌍' },
    { key: 'aventure', label: 'Aventure', src: iconCamping, emoji: '⛺' },
    { key: 'detente', label: 'Détente', src: iconDetente, emoji: '🧘' },
    { key: 'culture', label: 'Culture', src: iconCulture, emoji: '🏛️' },
    { key: 'roadtrip', label: 'Roadtrip', src: iconRoadtrip, emoji: '🚐' },
    { key: 'volontariat', label: 'Volontariat', src: iconVolontariat, emoji: '🤝' },
    { key: 'spiritualite', label: 'Spiritualité', src: iconSpiritualite, emoji: '🧘‍♂️' },
    { key: 'pro', label: 'Professionnel', src: iconPro, emoji: '💼' },
  ];

  function toggleContext(k: string) {
    setSelectedContext(k);
  }

  function handleDecollage() {
    const missing: Record<string, boolean> = {};
    if (!duration) missing.duration = true;
    if (!year) missing.year = true;
    const contextValid = selectedContext && (selectedContext !== 'other' || otherContext.trim().length > 0);
    if (!contextValid) missing.context = true;
    if (!stage1.trim()) missing.stage1 = true;
    setErrors(missing);
    const hasMissing = Object.keys(missing).length > 0;
    if (hasMissing) {
      setSummaryError("Complète la durée, l'année, le contexte et l'étape 1 pour décoller.");
      // focus first missing logically
      if (missing.duration) return;
      if (missing.year) return;
      if (missing.context) return;
      return;
    }
    setSummaryError(null);
    // Persist step 2 to Supabase before navigating
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
            travel_duration: duration,
            travel_year: Number(year),
            travel_context: selectedContext === 'other' ? 'other' : selectedContext,
            travel_context_other: selectedContext === 'other' ? (otherContext.trim() || null) : null,
            stage1: stage1.trim(),
            stage2: stage2.trim() || null,
            stage3: stage3.trim() || null,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Update failed');
        router.push('/map');
      } catch (e: any) {
        setSummaryError(e?.message || 'Échec de sauvegarde. Réessaie.');
      }
    })();
  }

  function handleNext() {
    // Back to previous questionnaire page (Step 1) with id preserved
    const search = new URLSearchParams();
    if (submissionId) search.set('id', String(submissionId));
    router.push(`/submit${search.toString() ? `?${search.toString()}` : ''}`);
  }

  return (
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
            <div className="submit-steps stepper-2">
              <div className="steps-line" />
              <div className="steps-progress" />
              <div className="step" aria-label="Recherche">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z"/></svg>
              </div>
              <div className="step active" aria-label="Voyage">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/></svg>
              </div>
              <div className="step" aria-label="Livre">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a1 1 0 0 0-1-1H6Z"/></svg>
              </div>
            </div>
          </header>

          <div className="submit-form">
            <p className="submit-subtitle" style={{ textAlign: 'left' }}>Combien de temps a duré ton voyage ?</p>
            <div className={`duration-group ${errors.duration ? 'invalid' : ''}`}>
              <button type="button" className={`pill-choice ${duration === '<3' ? 'selected' : ''}`} onClick={() => setDuration('<3')}>&lt; 3 mois</button>
              <button type="button" className={`pill-choice ${duration === '3-6' ? 'selected' : ''}`} onClick={() => setDuration('3-6')}>3 - 6 mois</button>
              <button type="button" className={`pill-choice ${duration === '>6' ? 'selected' : ''}`} onClick={() => setDuration('>6')}>&gt; 6 mois</button>
            </div>
            {errors.duration && <p className="submit-error">Sélectionne une durée</p>}

            <label className={`label ${errors.year ? 'invalid' : ''}`}>
              Sélectionne l'année de voyage*
              <select className="pill-input white-border" value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="" disabled>Année</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>

            <p className="submit-subtitle" style={{ textAlign: 'left' }}>Quel est le contexte de ton voyage ?</p>
            <div className={`context-grid ${errors.context ? 'invalid' : ''}`}>
              {CONTEXT_ITEMS.map((it) => (
                <button
                  key={it.key}
                  type="button"
                  className={`context-tile ${selectedContext === it.key ? 'selected' : ''}`}
                  onClick={() => toggleContext(it.key)}
                >
                  <Image src={it.src} alt="" className="ctx-img" width={36} height={36} />
                  <span className="emoji-fallback" aria-hidden="true">{it.emoji}</span>
                  <span className="ctx-label">{it.label}</span>
                </button>
              ))}
              <div
                className={`context-tile other ${selectedContext === 'other' ? 'selected' : ''} ${errors.context ? 'invalid' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setSelectedContext('other');
                  // focus handled via ref if needed
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSelectedContext('other');
                  }
                }}
              >
                <div
                  className="other-editable"
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Autres ..."
                  onInput={(e) => setOtherContext((e.target as HTMLDivElement).innerText)}
                >{otherContext}</div>
              </div>
              {errors.context && (<p className="submit-error" style={{ gridColumn: '1 / -1' }}>Choisis un contexte (ou complète "Autres ...")</p>)}
            </div>

            <p className="submit-subtitle" style={{ textAlign: 'left' }}>Donne nous les trois étapes clés de ton voyage ?</p>
            <input className={`pill-input white-border ${errors.stage1 ? 'invalid' : ''}`} placeholder="Étape 1*" value={stage1} onChange={(e) => setStage1(e.target.value)} />
            <input className="pill-input white-border" placeholder="Étape 2" value={stage2} onChange={(e) => setStage2(e.target.value)} />
            <input className="pill-input white-border" placeholder="Étape 3" value={stage3} onChange={(e) => setStage3(e.target.value)} />

            {summaryError && <p className="submit-error" style={{ textAlign: 'center' }}>{summaryError}</p>}
            <div className="cta-row">
              {(() => {
                const ready = Boolean(
                  duration && year && selectedContext && (selectedContext !== 'other' || otherContext.trim().length > 0) && stage1.trim()
                );
                return (
                  <button
                    type="button"
                    className={`checkin-btn ${ready ? 'ready' : ''}`}
                    onClick={handleDecollage}
                  >
                    <span className="checkin-inner">
                      <svg className="plane" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z"/>
                      </svg>
                      Décollage
                    </span>
                  </button>
                );
              })()}
              <button type="button" className="checkin-btn checkin-btn--danger" onClick={handleNext}>
                <span className="checkin-inner">
                  <svg className="icon-left" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 19 3 12l7-7v4h8v6h-8v4Z"/></svg>
                  Check out
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
