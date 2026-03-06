"use client";

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import logo from '../../img/logo.png';

function SubmitPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const submissionId = params.get('id');
  const [form, setForm] = useState({
    display_name: "",
    phone: "",
    city: "",
    country: "",
    latitude: "",
    longitude: "",
    address_line: "",
    anecdote_text: "",
    photo_url: "",
    consent_publication: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const DRAFT_KEY = 'submit_step1_draft_v1';

  // --- Phone helpers (France) ---
  const FR_PHONE_REGEX = /^(?:\+33\s?[1-9](?:[\s.-]?\d{2}){4}|0[1-9](?:[\s.-]?\d{2}){4})$/;

  function formatPhoneFR(input: string): string {
    const raw = input.replace(/[^\d+]/g, "");
    if (raw.startsWith("+33")) {
      const digits = raw.replace(/\D/g, "").slice(2); // strip 33
      const parts = [digits.slice(0, 1), digits.slice(1, 3), digits.slice(3, 5), digits.slice(5, 7), digits.slice(7, 9)]
        .filter(Boolean);
      return "+33 " + parts.join(" ");
    }
    // default: 0X XX XX XX XX
    const digits = raw.replace(/\D/g, "").slice(0, 10);
    if (!digits) return "";
    const p = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean);
    return p.join(" ");
  }



  // Prefill from Supabase when returning with an id
  useEffect(() => {
    (async () => {
      if (!submissionId) return;
      try {
        const res = await fetch(`/api/submissions?id=${encodeURIComponent(submissionId)}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Fetch failed');
        const s = json?.submission;
        if (!s) return;
        setForm((f) => ({
          ...f,
          display_name: s.display_name ?? '',
          phone: s.phone ?? '',
          city: s.city ?? '',
          country: s.country ?? '',
          latitude: s.latitude != null ? String(s.latitude) : f.latitude,
          longitude: s.longitude != null ? String(s.longitude) : f.longitude,
          address_line: s.address_line ?? '',
          anecdote_text: s.anecdote_text ?? '',
          photo_url: s.photo_url ?? '',
          consent_publication: !!s.consent_publication,
        }));
        // Consider the name valid if it exists

      } catch (e) {
        console.warn('Prefill failed', e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  // Local draft: load once on mount if no submissionId
  useEffect(() => {
    if (submissionId) return; // server data has priority
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        setForm((f) => ({
          ...f,
          ...['display_name', 'phone', 'city', 'country', 'latitude', 'longitude', 'address_line', 'anecdote_text', 'photo_url', 'consent_publication']
            .reduce((acc: any, k: string) => {
              if (typeof parsed[k] !== 'undefined') acc[k] = parsed[k];
              return acc;
            }, {})
        }));

      }
    } catch { }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local draft: debounce save on changes
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const payload = {
          display_name: form.display_name,
          phone: form.phone,
          city: form.city,
          country: form.country,
          latitude: form.latitude,
          longitude: form.longitude,
          address_line: form.address_line,
          anecdote_text: form.anecdote_text,
          photo_url: form.photo_url,
          consent_publication: form.consent_publication,
          ts: Date.now(),
        };
        localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      } catch { }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.display_name, form.phone, form.city, form.country, form.latitude, form.longitude, form.address_line, form.anecdote_text, form.photo_url, form.consent_publication]);



  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrors({});
    try {
      // Validate and compress image if present (kept for future full submit)
      const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
      const toUpload: File | null = await (async () => {
        if (!file) return null;
        if (!file.type.startsWith('image/')) throw new Error('Le fichier doit être une image');
        if (file.size > MAX_BYTES) {
          // Try compressing
          try {
            const bitmap = await createImageBitmap(file);
            const canvas = document.createElement('canvas');
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas non supporté');
            ctx.drawImage(bitmap, 0, 0);
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.8));
            if (!blob) throw new Error('Échec de compression');
            if (blob.size > MAX_BYTES) throw new Error('Image trop volumineuse (>8MB)');
            return new File([blob], (file.name.split('.')[0] || 'photo') + '.webp', { type: 'image/webp' });
          } catch (err: any) {
            throw new Error('Image trop volumineuse (>8MB). Choisis une image plus petite.');
          }
        }
        return file;
      })();

      // If a file is selected, upload it first to get a public URL
      let uploadedPhotoUrl: string | null = null;
      if (toUpload) {
        const fd = new FormData();
        fd.append('file', toUpload);
        const up = await fetch('/api/upload', { method: 'POST', body: fd });
        const upJson = await up.json();
        if (!up.ok) throw new Error(upJson?.error || 'Upload failed');
        uploadedPhotoUrl = upJson?.url || null;
      }
      // Required fields validation (name, consent)
      const missing: string[] = [];
      if (!form.display_name.trim()) missing.push('display_name');
      if (!form.consent_publication) missing.push('consent_publication');

      // Phone validation (FR-only as before)
      if (form.phone.trim() && !FR_PHONE_REGEX.test(form.phone.trim())) {
        setErrors((e) => ({ ...e, phone: true }));
        setLoading(false);
        setTimeout(() => {
          // find the phone input and focus it
          const el = document.querySelector<HTMLInputElement>('input[autocomplete="tel"]');
          el?.focus();
        }, 0);
        return;
      }

      if (missing.length) {
        const map: Record<string, boolean> = {};
        missing.forEach((k) => (map[k] = true));
        setErrors(map);
        setLoading(false);
        setTimeout(() => {
          if (map.display_name) nameInputRef.current?.focus();
        }, 0);
        return;
      }

      // Create or update submission, then navigate to step 2 with the id
      let targetId = submissionId;
      if (submissionId) {
        // Update existing
        const res = await fetch('/api/submissions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: submissionId,
            display_name: form.display_name.trim(),
            phone: form.phone.trim() || null,
            city: form.city.trim() || null,
            country: form.country.trim() || null,
            latitude: parseFloat(form.latitude) || 0,
            longitude: parseFloat(form.longitude) || 0,
            address_line: form.address_line.trim() || null,
            anecdote_text: form.anecdote_text.trim() || null,
            photo_url: uploadedPhotoUrl ?? (form.photo_url?.trim() || null),
            consent_publication: !!form.consent_publication,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Update failed');
        targetId = json?.submission?.id ?? submissionId;
      } else {
        // Insert new
        const res = await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            display_name: form.display_name.trim(),
            phone: form.phone.trim() || null,
            city: form.city.trim() || null,
            country: form.country.trim() || null,
            latitude: parseFloat(form.latitude) || 0,
            longitude: parseFloat(form.longitude) || 0,
            address_line: form.address_line.trim() || null,
            anecdote_text: form.anecdote_text.trim() || null,
            photo_url: uploadedPhotoUrl ?? (form.photo_url?.trim() || null),
            consent_publication: !!form.consent_publication,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || 'Insert failed');
        targetId = json?.submission?.id;
      }

      // Clear local draft after a successful create/update
      try { localStorage.removeItem(DRAFT_KEY); } catch { }

      const nextParams = new URLSearchParams();
      if (targetId) nextParams.set('id', String(targetId));
      router.push(`/submit/trip${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
      setLoading(false);
      return;
    } catch (err: any) {
      const msg = (err && err.message) || "Erreur inconnue";

      // Si c'est une erreur réseau générique ("fetch failed"),
      // on laisse l'utilisateur continuer vers la page 2 malgré tout.
      if (typeof msg === 'string' && msg.toLowerCase().includes('fetch failed')) {
        const nextParams = new URLSearchParams();
        if (submissionId) nextParams.set('id', String(submissionId));
        router.push(`/submit/trip${nextParams.toString() ? `?${nextParams.toString()}` : ''}`);
        return;
      }

      setMessage(msg);
    } finally {
      setLoading(false);
    }
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
            <div className="submit-steps">
              <div className="steps-line" />
              <div className="steps-progress" />
              <div className="step active" aria-label="Recherche">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M10 18a8 8 0 1 1 5.293-14.293A8 8 0 0 1 10 18Zm0-2a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm11 3.586-5.121-5.12 1.414-1.415 5.12 5.121L21 19.586Z" /></svg>
              </div>
              <div className="step" aria-label="Voyage">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" /></svg>
              </div>
              <div className="step" aria-label="Livre">
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 2h11a3 3 0 0 1 3 3v15.5a1.5 1.5 0 0 1-2.25 1.304L14 19H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 2v13h8.5l3.5 1.944V5a1 1 0 0 0-1-1H6Z" /></svg>
              </div>
            </div>
          </header>

          <form onSubmit={handleSubmit} className="submit-form">
            <label className={`label ${errors.display_name ? 'invalid' : ''}`}>
              Nom et Prénom*
              <input
                className="input pill-input white-border"
                ref={nameInputRef}
                value={form.display_name}
                onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
                placeholder="Nom et Prénom*"
              />
            </label>
            <label className="label">
              Téléphone
              <input
                className={`input pill-input white-border ${errors.phone ? 'invalid' : ''}`}
                inputMode="tel"
                placeholder="ex: 06 12 34 56 78 ou +33 6 12 34 56 78"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: formatPhoneFR(e.target.value) }))}
                autoComplete="tel"
                pattern="^(\+33\s?)?[0-9]{1}(\s?\-?\s?\d{2}){4}$"
                title="Format attendu: 06 12 34 56 78 ou +33 6 12 34 56 78"
              />
            </label>

            <div className="stack">
              <span className="label">Photo</span>
              {/* hidden picker */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0] || null;
                  setFile(f);
                  if (previewUrl) URL.revokeObjectURL(previewUrl);
                  setPreviewUrl(f ? URL.createObjectURL(f) : null);
                }}
              />
              {!previewUrl && !form.photo_url && (
                <button type="button" className="photo-button" onClick={() => galleryInputRef.current?.click()} aria-label="Choisir une photo">
                  <svg width="34" height="34" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M4 7h3l1.5-2h7L17 7h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm8 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0-2a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
                  </svg>
                </button>
              )}
              {(previewUrl || form.photo_url) && (
                <div className="photo-preview">
                  <img src={previewUrl || form.photo_url} alt="Prévisualisation" />
                  <button
                    type="button"
                    className="photo-remove"
                    aria-label="Retirer la photo"
                    onClick={() => {
                      setFile(null);
                      if (previewUrl) URL.revokeObjectURL(previewUrl);
                      setPreviewUrl(null);
                      setForm((f) => ({ ...f, photo_url: '' }));
                      if (galleryInputRef.current) galleryInputRef.current.value = '';
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Anecdote déplacée à l'étape "story" */}
            <label className={`label ${errors.consent_publication ? 'invalid' : ''}`} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.consent_publication}
                onChange={(e) => setForm((f) => ({ ...f, consent_publication: e.target.checked }))}
              />
              J'accepte que mon nom, mon prénom, mon anecdote ainsi que mon image soient diffusés et puissent être utilisés par le bar.
            </label>
            {(() => {
              const ready = Boolean(
                form.display_name.trim() &&
                form.consent_publication
              );
              return (
                <button className={`checkin-btn ${ready ? 'ready' : ''}`} type="submit" disabled={loading}>
                  {loading ? (
                    "check in..."
                  ) : (
                    <span className="checkin-inner">
                      <svg className="plane" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9L2 14v2l8-2.5V19l-2 1.5V22l3-1 3 1v-1.5L13 19v-5.5l8 2.5Z" />
                      </svg>
                      check in
                    </span>
                  )}
                </button>
              );
            })()}
          </form>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}
        </div>
      </section>

    </main>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={null}>
      <SubmitPageInner />
    </Suspense>
  );
}

