"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { generateBoardingPassPDF } from '@/utils/generateBoardingPassPDF';
import { generateBoardingPassImage, saveBoardingPassCard } from '@/utils/generateBoardingPassImage';

interface WeeklyStats {
    week: string;
    count: number;
    consented: number;
}

interface Submission {
    id: string;
    submission_number?: number;
    display_name: string;
    country: string;
    city: string;
    submitted_at: string;
    consent_publication: boolean;
    photo_url?: string;
    anecdote_text?: string;
    bon_plans?: Array<{
        address?: string;
        description?: string;
    }>;
}

interface StatsData {
    weeklySubmissions: WeeklyStats[];
    totalSubmissions: number;
    totalConsented: number;
    recentSubmissions: Submission[];
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [adminPassword, setAdminPassword] = useState('123');
    const [isEditingPassword, setIsEditingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [generatingPDF, setGeneratingPDF] = useState<string | null>(null);
    const [generatingCard, setGeneratingCard] = useState<string | null>(null);
    const [generatingAll, setGeneratingAll] = useState(false);
    const [deletingCard, setDeletingCard] = useState<string | null>(null);
    const [deletingSubmission, setDeletingSubmission] = useState<string | null>(null);

    // Vérifier l'authentification
    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth');
        if (!isAuth) {
            router.push('/');
            return;
        }

        const stored = localStorage.getItem('admin_password');
        if (stored) setAdminPassword(stored);
    }, [router]);

    useEffect(() => {
        async function fetchStats() {
            try {
                setLoading(true);
                const res = await fetch(`/api/admin/stats?t=${Date.now()}`, { cache: 'no-store' });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
                setStats(data);
            } catch (e: any) {
                setError(e.message || 'Failed to load dashboard');
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const handleRefresh = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/admin/stats?t=${Date.now()}`, { cache: 'no-store' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch stats');
            setStats(data);
        } catch (e: any) {
            setError(e.message || 'Failed to load dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = () => {
        if (newPassword.trim()) {
            localStorage.setItem('admin_password', newPassword);
            setAdminPassword(newPassword);
            setNewPassword('');
            setIsEditingPassword(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('admin_auth');
        router.push('/');
    };

    const handleDownloadPDF = async (submission: Submission) => {
        try {
            setGeneratingPDF(submission.id);
            await generateBoardingPassPDF(submission);
        } catch (error) {
            console.error('Erreur génération PDF:', error);
            alert('Erreur lors de la génération du PDF. Assurez-vous d\'avoir installé les dépendances:\nnpm install jspdf html2canvas');
        } finally {
            setGeneratingPDF(null);
        }
    };

    const handleGenerateCard = async (submission: Submission) => {
        try {
            setGeneratingCard(submission.id);
            const blob = await generateBoardingPassImage(submission);
            await saveBoardingPassCard(submission.id, blob);
            alert('✅ Carte d\'embarcation générée avec succès !');
        } catch (error) {
            console.error('Erreur génération carte:', error);
            alert('Erreur lors de la génération de la carte. Assurez-vous d\'avoir installé: npm install html2canvas');
        } finally {
            setGeneratingCard(null);
        }
    };

    const handleGenerateAllCards = async () => {
        if (!confirm(`Voulez-vous générer les cartes pour toutes les ${stats?.totalSubmissions} soumissions ?`)) {
            return;
        }

        try {
            setGeneratingAll(true);
            let successCount = 0;

            for (const sub of stats?.recentSubmissions || []) {
                try {
                    const blob = await generateBoardingPassImage(sub);
                    await saveBoardingPassCard(sub.id, blob);
                    successCount++;
                } catch (error) {
                    console.error(`Erreur pour ${sub.display_name}:`, error);
                }
            }

            alert(`✅ ${successCount} cartes générées avec succès sur ${stats?.recentSubmissions.length} !`);
        } catch (error) {
            console.error('Erreur génération batch:', error);
            alert('Erreur lors de la génération en masse.');
        } finally {
            setGeneratingAll(false);
        }
    };

    const handleDeleteCard = async (submissionId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette carte ?')) {
            return;
        }

        try {
            setDeletingCard(submissionId);
            const response = await fetch(`/api/delete-boarding-pass?submissionId=${submissionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete boarding pass');
            }

            alert('✅ Carte supprimée avec succès !');
        } catch (error) {
            console.error('Erreur suppression carte:', error);
            alert('Erreur lors de la suppression de la carte.');
        } finally {
            setDeletingCard(null);
        }
    };

    const handleDeleteSubmission = async (submissionId: string) => {
        if (!confirm('Voulez-vous vraiment supprimer cette anecdote complètement ? Cette action est irréversible.')) {
            return;
        }

        try {
            setDeletingSubmission(submissionId);
            const response = await fetch(`/api/submissions?id=${submissionId}`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to delete submission');
            }

            alert('✅ Anecdote supprimée avec succès !');
            // Reload stats
            window.location.reload();
        } catch (error: any) {
            console.error('Erreur suppression anecdote:', error);
            alert(`❌ Erreur lors de la suppression: ${error.message}\n\nVérifiez la console pour plus de détails.`);
        } finally {
            setDeletingSubmission(null);
        }
    };

    if (loading) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '32px 16px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', paddingTop: '80px' }}>
                    <div style={{
                        display: 'inline-block',
                        width: '48px',
                        height: '48px',
                        border: '4px solid var(--border)',
                        borderTopColor: 'var(--ink)',
                        borderRadius: '50%'
                    }} className="loading-spinner"></div>
                    <p style={{ marginTop: '24px', color: 'var(--muted)', fontSize: '18px' }}>Chargement...</p>
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '32px 16px' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div className="card" style={{ padding: '24px', border: '2px solid #dc2626', background: '#fef2f2' }}>
                        <p style={{ color: '#991b1b', fontSize: '16px' }}>⚠️ Erreur: {error}</p>
                    </div>
                </div>
            </main>
        );
    }

    if (!stats) return null;

    return (
        <main style={{ minHeight: '100vh', background: 'var(--paper)', padding: '80px 16px 32px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Header */}
                <header style={{ marginBottom: '48px', textAlign: 'center' }}>
                    <h1 className="font-hand" style={{
                        fontSize: 'clamp(32px, 5vw, 48px)',
                        fontWeight: 800,
                        color: 'var(--ink)',
                        marginBottom: '12px',
                        letterSpacing: '-0.02em'
                    }}>
                        🔐 Espace Propriétaire
                    </h1>
                    <p style={{ color: 'var(--muted)', fontSize: '18px', marginBottom: '24px' }}>
                        Gestion des soumissions GlobeTrotter
                    </p>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <button
                            onClick={handleRefresh}
                            className="btn"
                            style={{ fontSize: '14px', padding: '8px 20px' }}
                            disabled={loading}
                        >
                            {loading ? '⏳ Chargement...' : '🔄 Actualiser'}
                        </button>
                        <button
                            onClick={handleGenerateAllCards}
                            className="btn btn-primary"
                            style={{ fontSize: '14px', padding: '8px 20px' }}
                            disabled={generatingAll}
                        >
                            {generatingAll ? '⏳ Génération...' : '🎴 Générer toutes les cartes'}
                        </button>
                        <Link
                            href="/admin/template-editor"
                            className="btn"
                            style={{ fontSize: '14px', padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}
                        >
                            🎨 Éditeur de Template
                        </Link>
                        <Link
                            href="/admin/popup-editor"
                            className="btn"
                            style={{ fontSize: '14px', padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}
                        >
                            ✨ Configurer le Pop-up
                        </Link>
                        <Link
                            href="/admin/draw"
                            className="btn"
                            style={{ fontSize: '14px', padding: '8px 20px', textDecoration: 'none', display: 'inline-block' }}
                        >
                            🎲 Tirage au sort
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="btn"
                            style={{ fontSize: '14px', padding: '8px 20px' }}
                        >
                            🚪 Déconnexion
                        </button>
                    </div>
                </header>

                {/* Mot de passe */}
                <div className="card paper-texture" style={{ padding: '24px', marginBottom: '32px', border: '1.5px solid var(--vintage-border)' }}>
                    <h2 className="font-hand" style={{ fontSize: '24px', marginBottom: '16px', color: 'var(--ink)' }}>
                        🔑 Mot de passe administrateur
                    </h2>
                    {!isEditingPassword ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>Mot de passe actuel</p>
                                <code style={{
                                    background: 'rgba(0,0,0,0.03)',
                                    padding: '10px 16px',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '16px',
                                    display: 'inline-block'
                                }}>
                                    {adminPassword}
                                </code>
                            </div>
                            <button onClick={() => setIsEditingPassword(true)} className="btn" style={{ marginTop: '20px' }}>
                                ✏️ Modifier
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Nouveau mot de passe"
                                className="input pill-input white-border"
                                style={{ flex: 1, minWidth: '200px' }}
                            />
                            <button onClick={handlePasswordUpdate} className="btn btn-primary">✓ Valider</button>
                            <button onClick={() => { setNewPassword(''); setIsEditingPassword(false); }} className="btn">✕ Annuler</button>
                        </div>
                    )}
                </div>

                {/* Stats cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                    <div className="card paper-texture" style={{ padding: '24px', textAlign: 'center', border: '1.5px solid var(--vintage-border)' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📝</div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '4px' }}>
                            {stats.totalSubmissions}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Formulaires
                        </div>
                    </div>

                    <div className="card paper-texture" style={{ padding: '24px', textAlign: 'center', border: '1.5px solid #86efac' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>✅</div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#15803d', marginBottom: '4px' }}>
                            {stats.totalConsented}
                        </div>
                        <div style={{ fontSize: '14px', color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Publiés
                        </div>
                    </div>

                    <div className="card paper-texture" style={{ padding: '24px', textAlign: 'center', border: '1.5px solid #93c5fd' }}>
                        <div style={{ fontSize: '36px', marginBottom: '8px' }}>📈</div>
                        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#1e40af', marginBottom: '4px' }}>
                            {stats.totalSubmissions > 0 ? Math.round((stats.totalConsented / stats.totalSubmissions) * 100) : 0}%
                        </div>
                        <div style={{ fontSize: '14px', color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Taux
                        </div>
                    </div>
                </div>

                {/* Liste des soumissions */}
                <div className="card paper-texture" style={{ border: '1.5px solid var(--vintage-border)', overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: '1.5px solid var(--vintage-border)', background: 'rgba(0,0,0,0.02)' }}>
                        <h2 className="font-hand" style={{ fontSize: '28px', color: 'var(--ink)', marginBottom: '4px' }}>
                            📋 Formulaires soumis
                        </h2>
                        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
                            {stats.recentSubmissions.length} soumission{stats.recentSubmissions.length > 1 ? 's' : ''} · Cliquez pour voir les détails
                        </p>
                    </div>

                    <div>
                        {stats.recentSubmissions.map((sub) => (
                            <div key={sub.id} style={{ borderBottom: '1px solid var(--vintage-border)' }}>
                                {/* Ligne cliquable */}
                                <div
                                    onClick={() => setExpandedId(expandedId === sub.id ? null : sub.id)}
                                    style={{
                                        padding: '20px 24px',
                                        cursor: 'pointer',
                                        background: expandedId === sub.id ? 'rgba(0,0,0,0.02)' : 'transparent',
                                        transition: 'background 0.2s ease',
                                        display: 'flex',
                                        gap: '16px',
                                        alignItems: 'center',
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.02)'}
                                    onMouseLeave={(e) => {
                                        if (expandedId !== sub.id) e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    {/* Miniature */}
                                    <div style={{
                                        width: '64px',
                                        height: '64px',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        border: '1.5px solid var(--vintage-border)',
                                        background: '#f5f5f4',
                                        flexShrink: 0
                                    }}>
                                        {sub.photo_url ? (
                                            <img src={sub.photo_url} alt={sub.display_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px' }}>
                                                🌍
                                            </div>
                                        )}
                                    </div>

                                    {/* Infos */}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--ink)', marginBottom: '4px' }}>
                                            N°{sub.submission_number} - {sub.display_name}
                                        </h3>
                                        <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>
                                            📍 {[sub.city, sub.country].filter(Boolean).join(', ') || 'Non spécifié'}
                                        </p>
                                        {sub.anecdote_text && (
                                            <p style={{ fontSize: '13px', color: 'var(--muted)', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                "{sub.anecdote_text}"
                                            </p>
                                        )}
                                    </div>

                                    {/* Badge + date */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px', flexShrink: 0 }}>
                                        {sub.consent_publication ? (
                                            <span className="badge" style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                                ✓ Publié
                                            </span>
                                        ) : (
                                            <span className="badge" style={{ background: '#e7e5e4', color: '#57534e', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                                                🔒 Privé
                                            </span>
                                        )}
                                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                                            {new Date(sub.submitted_at).toLocaleDateString('fr-FR')}
                                        </span>
                                        <span style={{ fontSize: '20px', transition: 'transform 0.3s ease', display: 'inline-block', transform: expandedId === sub.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                                            ▼
                                        </span>
                                    </div>
                                </div>

                                {/* Détails expansibles */}
                                {expandedId === sub.id && (
                                    <div style={{
                                        padding: '24px',
                                        background: 'rgba(0,0,0,0.02)',
                                        borderTop: '1px solid var(--vintage-border)'
                                    }}>
                                        {/* Photo(s) */}
                                        {sub.photo_url && (
                                            <div style={{ marginBottom: '24px' }}>
                                                <h4 className="font-hand" style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--ink)' }}>📸 Photo jointe</h4>
                                                <img
                                                    src={sub.photo_url}
                                                    alt={sub.display_name}
                                                    style={{
                                                        width: '100%',
                                                        maxHeight: '400px',
                                                        objectFit: 'contain',
                                                        borderRadius: '12px',
                                                        border: '2px solid var(--vintage-border)',
                                                        background: 'white'
                                                    }}
                                                />
                                            </div>
                                        )}

                                        {/* Anecdote */}
                                        {sub.anecdote_text && (
                                            <div style={{ marginBottom: '24px' }}>
                                                <h4 className="font-hand" style={{ fontSize: '20px', marginBottom: '12px', color: 'var(--ink)' }}>✍️ Anecdote</h4>
                                                <div className="card paper-texture" style={{ padding: '20px', border: '1.5px solid var(--vintage-border)', background: 'white' }}>
                                                    <p style={{ lineHeight: '1.6', color: 'var(--text)', fontStyle: 'italic' }}>
                                                        "{sub.anecdote_text}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Boutons Actions */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', flexWrap: 'wrap' }}>
                                            <button
                                                onClick={() => handleGenerateCard(sub)}
                                                className="btn"
                                                style={{ fontSize: '14px' }}
                                                disabled={generatingCard === sub.id}
                                            >
                                                {generatingCard === sub.id ? '⏳ Génération...' : '🎴 Générer Carte'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteCard(sub.id)}
                                                className="btn"
                                                style={{ fontSize: '14px', background: '#ef4444', color: 'white', border: 'none' }}
                                                disabled={deletingCard === sub.id}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                                            >
                                                {deletingCard === sub.id ? '⏳ Suppression...' : '🗑️ Supprimer Carte'}
                                            </button>
                                            <button
                                                onClick={() => handleDownloadPDF(sub)}
                                                className="btn btn-primary"
                                                style={{ fontSize: '14px' }}
                                                disabled={generatingPDF === sub.id}
                                            >
                                                {generatingPDF === sub.id ? '⏳ Génération...' : '📄 Télécharger PDF'}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSubmission(sub.id)}
                                                className="btn"
                                                style={{ fontSize: '14px', background: '#dc2626', color: 'white', border: 'none' }}
                                                disabled={deletingSubmission === sub.id}
                                                onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
                                            >
                                                {deletingSubmission === sub.id ? '⏳ Suppression...' : '🗑️ Supprimer Anecdote'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        .loading-spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </main>
    );
}
