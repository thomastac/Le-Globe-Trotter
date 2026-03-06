"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Submission } from '@/lib/fetchSubmissions';
import Link from 'next/link';

export default function AdminDrawPage() {
    const router = useRouter();
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [drawYear, setDrawYear] = useState<string>('all');
    const [drawResult, setDrawResult] = useState<any | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Vérifier l'authentification
    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth');
        if (!isAuth) {
            router.push('/');
            return;
        }

        // Fetch all submissions for the draw
        async function fetchAllSubmissions() {
            try {
                const res = await fetch(`/api/admin/stats?t=${Date.now()}`, { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
                setSubmissions(data.allSubmissions || data.recentSubmissions || []);
            } catch (e: any) {
                setError(e.message || 'Failed to load submissions');
            } finally {
                setLoading(false);
            }
        }

        fetchAllSubmissions();
    }, [router]);

    const availableYears = Array.from(
        new Set(
            submissions.map((s: any) => new Date(s.created_at || s.submitted_at).getFullYear().toString())
        )
    ).sort((a, b) => Number(b) - Number(a));

    const handleDraw = () => {
        setIsDrawing(true);
        setDrawResult(null);

        setTimeout(() => {
            // 1. Sort chronologically (oldest first)
            const sortedSubmissions = [...submissions].sort(
                (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
            );

            // 2. Filter
            let availableForDraw: any[] = [];
            sortedSubmissions.forEach((sub: any) => {
                if (drawYear === 'all') {
                    availableForDraw.push(sub);
                } else {
                    const submissionYear = new Date(sub.created_at || sub.submitted_at).getFullYear().toString();
                    if (submissionYear === drawYear) {
                        availableForDraw.push(sub);
                    }
                }
            });

            if (availableForDraw.length === 0) {
                alert("Aucun voyage trouvé pour cette sélection.");
                setIsDrawing(false);
                return;
            }

            // 3. Random pick
            const randomIndex = Math.floor(Math.random() * availableForDraw.length);
            setDrawResult(availableForDraw[randomIndex]);
            setIsDrawing(false);
        }, 600); // Small animation delay
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '32px 16px', color: 'var(--ink)' }}>
                <p style={{ textAlign: 'center', marginTop: '40px' }}>Chargement...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '32px 16px', color: 'red' }}>
                <p style={{ textAlign: 'center' }}>Erreur : {error}</p>
            </main>
        );
    }

    return (
        <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '80px 16px 32px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <h1 className="font-hand" style={{
                        fontSize: 'clamp(32px, 5vw, 48px)',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        marginBottom: '12px',
                        letterSpacing: '-0.02em'
                    }}>
                        🎲 Tirage au sort
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '18px', marginBottom: '24px' }}>
                        Sélectionnez une année et lancez le tirage au sort.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <Link href="/admin/dashboard" className="btn" style={{ fontSize: '14px', padding: '8px 20px', textDecoration: 'none' }}>
                            ← Retour au Dashboard
                        </Link>
                    </div>
                </header>

                <div className="card paper-texture" style={{ padding: '32px', border: '1.5px solid var(--vintage-border)', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap' }}>
                        <select
                            className="input pill-input white-border"
                            value={drawYear}
                            onChange={(e) => setDrawYear(e.target.value)}
                            style={{ flex: 1, minWidth: '200px', padding: '12px 24px', cursor: 'pointer' }}
                        >
                            <option value="all">Toutes années confondues</option>
                            {availableYears.map(year => (
                                <option key={year} value={year}>Année {year}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleDraw}
                            className="btn btn-primary"
                            disabled={isDrawing || submissions.length === 0}
                            style={{ padding: '12px 24px' }}
                        >
                            {isDrawing ? 'Tirage en cours...' : '🎲 Lancer le tirage'}
                        </button>
                    </div>

                    {drawResult && (
                        <div style={{ padding: '32px', background: 'rgba(21, 128, 61, 0.05)', border: '1px solid rgba(21, 128, 61, 0.2)', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <h4 className="font-hand" style={{ fontSize: '2.5rem', color: 'var(--ink)', margin: 0 }}>
                                    Gagnant N°{drawResult.submission_number} !
                                </h4>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', color: 'var(--ink)', fontSize: '1.2rem', fontWeight: 'bold' }}>
                                        {drawResult.display_name}
                                    </span>
                                    <span style={{ color: 'var(--muted)' }}>
                                        Contact: {drawResult.phone || 'Non renseigné'}
                                    </span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', flexDirection: 'column' }}>
                                {drawResult.photo_url && (
                                    <img
                                        src={drawResult.photo_url}
                                        alt="Photo du voyage"
                                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '12px', background: '#fff', border: '1.5px solid var(--vintage-border)' }}
                                    />
                                )}

                                <div className="card" style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid var(--vintage-border)' }}>
                                    <p style={{ margin: '0 0 12px 0', color: 'var(--ink)', fontWeight: 'bold' }}>
                                        📍 {drawResult.city ? `${drawResult.city}, ` : ''}{drawResult.country || 'Destination inconnue'}
                                        {drawResult.travel_year ? ` (${drawResult.travel_year})` : ''}
                                    </p>
                                    {drawResult.anecdote_text && (
                                        <p style={{ margin: 0, fontStyle: 'italic', color: 'var(--muted)', lineHeight: 1.6 }}>
                                            "{drawResult.anecdote_text}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
