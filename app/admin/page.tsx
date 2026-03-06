"use client";

import { useState, useEffect } from 'react';
import { fetchRecentSubmissions, Submission } from '@/lib/fetchSubmissions';
import { generateWeeklyRecap } from '@/utils/generatePdf';
import Image from 'next/image';
import logo from '../../img/logo.png';
import MenuModal from '../components/MenuModal';

const DEFAULT_PAGES = [
  '/img/menu/2.jpg',
  '/img/menu/3.jpg',
  '/img/menu/6.jpg',
  '/img/menu/7.jpg',
  '/img/menu/10.jpg',
  '/img/menu/11.jpg'
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'submissions' | 'pages'>('submissions');
  const [menuPages, setMenuPages] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
      setIsAuthenticated(true);
      loadSubmissions();
      loadMenuPages(true);
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const data = await fetchRecentSubmissions();
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadMenuPages = async (checkEmpty = false) => {
    try {
      const res = await fetch('/api/menu?category=MenuPage');
      if (!res.ok) throw new Error('Failed to load menu pages');
      const data = await res.json();

      if (checkEmpty && (!data || data.length === 0)) {
        await handleSeedDefaults();
      } else {
        setMenuPages(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSeedDefaults = async () => {
    setUploading(true);
    try {
      // Check count via API (GET returns array, check length)
      const res = await fetch('/api/menu?category=MenuPage');
      const data = await res.json();
      if (data.length > 0) {
        setUploading(false);
        setMenuPages(data);
        return;
      }

      for (let i = 0; i < DEFAULT_PAGES.length; i++) {
        await fetch('/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `Page ${i + 1}`,
            category: 'MenuPage',
            image_url: DEFAULT_PAGES[i],
            price: i,
            active: true
          })
        });
      }
      await loadMenuPages();
    } catch (e) {
      console.error(e);
      alert('Erreur lors de l\'initialisation');
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Upload failed');

      // Add page via API (API handles max price calculation if price is missing)
      const resAdd = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `Page ${menuPages.length + 1}`,
          category: 'MenuPage',
          image_url: json.url,
          active: true
        })
      });

      if (!resAdd.ok) {
        const err = await resAdd.json();
        throw new Error(err.error || 'Failed to add page');
      }

      await loadMenuPages();
      alert('Page ajoutée avec succès !');
    } catch (err: any) {
      alert(`Erreur lors de l'ajout: ${err.message || err}`);
      console.error(err);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Supprimer cette page du menu ?')) return;
    try {
      const res = await fetch(`/api/menu?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadMenuPages();
    } catch (e) {
      alert('Erreur lors de la suppression');
      console.error(e);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === menuPages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentItem = menuPages[index];
    const targetItem = menuPages[targetIndex];

    try {
      await Promise.all([
        fetch('/api/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: currentItem.id, price: targetItem.price })
        }),
        fetch('/api/menu', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetItem.id, price: currentItem.price })
        })
      ]);
      loadMenuPages();
    } catch (e) {
      console.error('Error moving items', e);
      alert('Erreur lors du déplacement');
    }
  };

  const handleRefresh = async () => {
    await loadMenuPages();
    alert('Site mis à jour ! Les modifications sont en ligne.');
  };

  const handleDownloadPdf = async () => {
    if (submissions.length === 0) {
      alert('Aucune soumission à générer.');
      return;
    }
    try {
      const pdfBytes = await generateWeeklyRecap(submissions);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `globetrotter-recap-${new Date().toISOString().slice(0, 10)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('PDF Generation failed', e);
      alert('Erreur lors de la génération du PDF');
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="container" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#111827' }}>
        <form onSubmit={handleLogin} className="glass-card" style={{ width: '100%', maxWidth: 400, padding: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <Image src={logo} alt="GlobeTrotter" width={80} height={80} />
            <h1 className="font-hand" style={{ color: '#f6b17a', fontSize: '2.5rem', marginTop: 16 }}>Admin Access</h1>
          </div>
          <input
            type="password"
            className="input pill-input"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: 24, width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
          />
          <button type="submit" className="btn btn-pill btn-mint btn-lg" style={{ width: '100%' }}>Entrer</button>
        </form>
      </main>
    );
  }

  return (
    <main style={{ minHeight: '100vh', background: '#111827', color: '#fff', paddingBottom: 80 }}>
      <header style={{ background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.1)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Image src={logo} alt="GlobeTrotter" width={40} height={40} />
            <h1 className="font-hand" style={{ fontSize: '2rem', color: '#f6b17a', margin: 0 }}>Espace Admin</h1>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className={`btn btn-pill ${activeTab === 'submissions' ? 'btn-mint' : 'btn-outline'}`}
              onClick={() => setActiveTab('submissions')}
            >
              Soumissions
            </button>
            <button
              className={`btn btn-pill ${activeTab === 'pages' ? 'btn-mint' : 'btn-outline'}`}
              onClick={() => setActiveTab('pages')}
            >
              Pages Menu
            </button>
          </div>
        </div>
      </header>

      <div className="container" style={{ marginTop: 40 }}>
        {activeTab === 'submissions' && (
          <>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 className="font-hand" style={{ fontSize: '2.5rem', color: '#fff', margin: 0 }}>Dernières soumissions</h2>
              <button onClick={handleDownloadPdf} className="btn btn-pill btn-mint">
                📄 Télécharger le Récap
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}>Chargement...</div>
            ) : (
              <div style={{ display: 'grid', gap: 24 }}>
                {submissions.length === 0 ? (
                  <p style={{ color: '#9ca3af' }}>Aucune nouvelle soumission.</p>
                ) : (
                  submissions.map((sub) => (
                    <div key={sub.id} className="glass-card" style={{ display: 'flex', gap: 24, padding: 24, alignItems: 'start' }}>
                      {sub.photo_url && (
                        <img src={sub.photo_url} alt="" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 16 }} />
                      )}
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <h3 style={{ margin: 0, fontSize: '1.5rem', color: '#fff' }}>{sub.display_name}</h3>
                          <span style={{ color: '#f6b17a' }}>{sub.country}</span>
                        </div>
                        <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 16 }}>{new Date(sub.submitted_at).toLocaleString()}</p>
                        {sub.anecdote_text && (
                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, fontStyle: 'italic', color: '#e2e8f0' }}>
                            "{sub.anecdote_text}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'pages' && (
          <div style={{ display: 'grid', gap: 40 }}>
            <div className="glass-card" style={{ padding: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 24 }}>
                <div>
                  <h3 className="font-hand" style={{ fontSize: '2rem', color: '#f6b17a', marginBottom: 8 }}>Gérer les pages du menu</h3>
                  <p style={{ color: '#9ca3af', margin: 0 }}>Ajoutez, supprimez ou réorganisez les pages.</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setShowPreview(true)} className="btn btn-pill btn-outline">
                    👁️ Voir l'aperçu du site
                  </button>
                  <button onClick={handleRefresh} className="btn btn-pill btn-mint">
                    🔄 Rafraîchir le site
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <label className="btn btn-pill btn-mint" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span>{uploading ? 'Upload...' : 'Ajouter une page (Image)'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} disabled={uploading} />
                </label>

                {menuPages.length === 0 && (
                  <button onClick={handleSeedDefaults} className="btn btn-pill btn-outline" disabled={uploading}>
                    Charger les pages par défaut
                  </button>
                )}
              </div>
            </div>

            <div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
              {menuPages.map((item, index) => (
                <div key={item.id} className="glass-card" style={{ padding: 12, position: 'relative', group: 'true' } as any}>
                  <div style={{ position: 'relative' }}>
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', borderRadius: 8, marginBottom: 12, display: 'block' }} />
                    <button
                      onClick={() => handleDeletePage(item.id)}
                      className="delete-btn"
                      title="Supprimer"
                    >
                      &times;
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 14 }}>{item.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                        className="btn-icon"
                        title="Monter"
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === menuPages.length - 1}
                        className="btn-icon"
                        title="Descendre"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <MenuModal isOpen={showPreview} onClose={() => setShowPreview(false)} />

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
        }
        .btn-outline {
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          background: transparent;
        }
        .btn-outline:hover {
          border-color: #fff;
          background: rgba(255,255,255,0.05);
        }
        .delete-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #ef4444;
          color: white;
          border: none;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .glass-card:hover .delete-btn {
          opacity: 1;
        }
        .btn-icon {
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          width: 28px;
          height: 28px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .btn-icon:hover:not(:disabled) {
          background: rgba(255,255,255,0.2);
        }
        .btn-icon:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      `}</style>
    </main>
  );
}
