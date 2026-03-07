"use client";

export const dynamic = 'force-dynamic';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import Image from 'next/image';
import { generateBoardingPassImage, saveBoardingPassCard } from '../../../utils/generateBoardingPassImage';
import { generateBoardingPassPDF } from '../../../utils/generateBoardingPassPDF';

function SubmitPreviewPageContent() {
  const router = useRouter();
  const params = useSearchParams();
  const id = params.get('id');

  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgUrlLarge, setImgUrlLarge] = useState<string | null>(null);
  const [zoomOpen, setZoomOpen] = useState(false);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [actionsH, setActionsH] = useState<number>(104);
  const [headerH, setHeaderH] = useState<number>(0);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [cardGenerated, setCardGenerated] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [submissionData, setSubmissionData] = useState<any>(null);

  // Lock body scroll on this page (mobile & desktop)
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Measure header/footer height to size the preview area
  useEffect(() => {
    const measure = () => {
      const h = footerRef.current?.offsetHeight || 104;
      setActionsH(h);
      const hh = headerRef.current?.offsetHeight || 0;
      setHeaderH(hh);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Load boarding pass image once it's generated
  useEffect(() => {
    if (!id || !cardGenerated) return;

    // Use the generated boarding pass image from Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const imageUrl = `${supabaseUrl}/storage/v1/object/public/cartes/${id}.png`;

    // Add cache buster to ensure we get the latest version
    const timestamp = Date.now();
    const imageWithTimestamp = `${imageUrl}?t=${timestamp}`;

    setImgUrl(imageWithTimestamp);
    setImgUrlLarge(imageWithTimestamp);
  }, [id, cardGenerated]);

  const handleDownload = useCallback(async () => {
    if (!id || !submissionData) return;
    setIsDownloading(true);
    try {
      await generateBoardingPassPDF(submissionData);
    } catch (e: any) { 
      console.error('Error generating PDF', e);
    } finally {
      setIsDownloading(false);
    }
  }, [id, submissionData]);

  const handleNew = useCallback(() => {
    try { localStorage.removeItem('submit_step1_draft_v1'); } catch { }
    if (id) {
      try { localStorage.removeItem(`submit_step2_${id}`); } catch { }
      try { localStorage.removeItem(`submit_step3_${id}`); } catch { }
    }
    router.push('/submit');
  }, [id, router]);

  const handleMap = useCallback(() => {
    if (!id) return;
    router.push(`/map?id=${encodeURIComponent(String(id))}`);
  }, [id, router]);

  // Auto-generate boarding pass image when page loads
  useEffect(() => {
    if (!id || generatingCard || cardGenerated) return;

    setGeneratingCard(true);
    (async () => {
      try {
        // Fetch submission data
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(String(id))}`);
        if (!res.ok) throw new Error('Failed to fetch submission');
        const json = await res.json();
        const submission = json?.submission;
        if (!submission) throw new Error('No submission data');

        setSubmissionData(submission);

        // Generate boarding pass image
        const blob = await generateBoardingPassImage(submission);

        // Save boarding pass image
        await saveBoardingPassCard(String(id), blob);

        setCardGenerated(true);
        console.log('✅ Boarding pass generated successfully');
      } catch (error) {
        console.error('Failed to generate boarding pass:', error);
      } finally {
        setGeneratingCard(false);
      }
    })();
  }, [id, generatingCard, cardGenerated]);

  return (
    <main className="submit-page" style={{ height: '100dvh', overflow: 'hidden', position: 'relative' }}>
      <section className="container" style={{ maxWidth: 820 }}>
        <div className="card">
          <header ref={headerRef} className="submit-header">
            <h1 className="submit-title">Mon anecdote Globetrotter</h1>
            <p className="submit-subtitle">Partage ton voyage avec nous</p>
            <div className="submit-banner">
              <Image src="/img/logo.png" alt="GlobeTrotter" className="submit-banner-logo" width={48} height={48} priority />
              <div className="submit-banner-text">Seul, en groupe ou pour le travail dans tous les voyages il y a de l'aventure !</div>
            </div>
            <p className="submit-hint">Aperçu de ton livret PDF</p>
            <div className="submit-steps">
              <div className="steps-line" />
              <div className="steps-progress" />
              <div className="step" aria-label="Recherche">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z" /></svg>
              </div>
              <div className="step" aria-label="Voyage">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" /></svg>
              </div>
              <div className="step active" aria-label="Livre">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a 1 1 0 0 0-1-1H6Z" /></svg>
              </div>
            </div>
          </header>
        </div>
      </section>

      <div style={{ height: `calc(100dvh - ${actionsH}px - ${headerH}px)`, display: 'grid', placeItems: 'center', padding: 12 }}>
        {id ? (
          imgUrl ? (
            <div
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '240px',
                aspectRatio: '1240 / 1748',
                borderRadius: 12,
                border: '2px solid #e7e5e4',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                cursor: imgUrlLarge ? 'zoom-in' : 'default',
                transition: 'transform 0.2s ease',
                backgroundColor: '#fff'
              }}
              onClick={() => { if (imgUrlLarge) setZoomOpen(true); }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'rotate(-1deg) scale(1.03)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'rotate(0deg) scale(1)'}
            >
              <img
                src={imgUrl}
                alt="Aperçu PDF"
                style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 10 }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: -12,
                  right: -12,
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  zIndex: 2
                }}
              >
                📌
              </div>
            </div>
          ) : (
            <div style={{ color: 'var(--muted)' }}>Génération de l'aperçu…</div>
          )
        ) : (
          <div style={{ padding: 16, textAlign: 'center' }}>Identifiant manquant.</div>
        )}
      </div>
      <div
        ref={footerRef}
        style={{
          position: 'fixed', left: 0, right: 0, bottom: 0,
          padding: '12px 16px',
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
          display: 'grid', gap: 12,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          alignItems: 'center',
          background: 'rgba(255,255,255,.92)',
          WebkitBackdropFilter: 'saturate(150%) blur(8px)' as any,
          backdropFilter: 'saturate(150%) blur(8px)',
          borderTop: '1px solid rgba(0,0,0,.06)',
          boxShadow: '0 -4px 14px rgba(0,0,0,.06)',
          zIndex: 30,
        }}
      >
        <button className="checkin-btn ready" onClick={handleDownload} style={{ cursor: 'pointer' }} disabled={isDownloading}>
          {isDownloading ? (
            <span className="checkin-inner">
              <svg className="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true" style={{ animation: 'rotation 1s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Téléchargement...
            </span>
          ) : (
            <span className="checkin-inner">Télécharger le PDF</span>
          )}
        </button>
        <button className="checkin-btn" onClick={handleNew} style={{ cursor: 'pointer' }}>
          <span className="checkin-inner">Partager une nouvelle anecdote</span>
        </button>
        <button className="checkin-btn" onClick={handleMap} style={{ cursor: 'pointer' }}>
          <span className="checkin-inner">Voir mon voyage sur la carte</span>
        </button>
      </div>

      {zoomOpen && imgUrlLarge && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoomOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'grid', placeItems: 'center', zIndex: 50,
          }}
        >
          <img
            src={imgUrlLarge}
            alt="Aperçu agrandi"
            style={{ maxWidth: '92vw', maxHeight: '92dvh', borderRadius: 8, boxShadow: '0 6px 20px rgba(0,0,0,.35)', objectFit: 'contain' }}
          />
        </div>
      )}
    </main>
  );
}

export default function SubmitPreviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmitPreviewPageContent />
    </Suspense>
  );
}
