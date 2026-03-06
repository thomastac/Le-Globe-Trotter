"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PopupEditorPage() {
    const router = useRouter();
    const [config, setConfig] = useState({
        is_popup_enabled: false,
        popup_image_url: '',
        popup_text: 'Bienvenue sur GlobeTrotter !',
        popup_text_color: '#1a1a1a',
        popup_text_size: 28,
        popup_text_x: 400,
        popup_text_y: 300,
        popup_text_weight: 800
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Canvas de prévisualisation: 800x600 (ratio 4:3 standard)
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;

    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth');
        if (!isAuth) {
            router.push('/');
            return;
        }

        async function fetchConfig() {
            try {
                const res = await fetch(`/api/popup-config?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    setConfig({
                        is_popup_enabled: data.is_popup_enabled || false,
                        popup_image_url: data.popup_image_url || '',
                        popup_text: data.popup_text || 'Bienvenue !',
                        popup_text_color: data.popup_text_color || '#1a1a1a',
                        popup_text_size: data.popup_text_size || 28,
                        popup_text_x: data.popup_text_x ?? 400,
                        popup_text_y: data.popup_text_y ?? 300,
                        popup_text_weight: data.popup_text_weight || 800
                    });
                }
            } catch (err) {
                console.error("Erreur de chargement", err);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, [router]);

    const handleSave = async () => {
        setSaving(true);
        const configToSave = {
            ...config,
            popup_text_size: Math.round(config.popup_text_size),
            popup_text_x: Math.round(config.popup_text_x),
            popup_text_y: Math.round(config.popup_text_y)
        };

        try {
            const res = await fetch('/api/admin/popup-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configToSave)
            });

            if (res.ok) {
                alert('✅ Configuration du Pop-up sauvegardée !');
            } else {
                const data = await res.json();
                alert(`❌ Erreur: ${data.error}`);
            }
        } catch (e: any) {
            alert(`❌ Erreur de réseau: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setConfig(prev => ({ ...prev, popup_image_url: imageUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        const target = e.currentTarget as HTMLElement; // draggable text container
        const parent = target.parentElement as HTMLElement; // canvas container
        const parentRect = parent.getBoundingClientRect();

        const relativeX = (e.clientX - parentRect.left) / parentRect.width;
        const relativeY = (e.clientY - parentRect.top) / parentRect.height;

        const pointerXBase800 = relativeX * CANVAS_WIDTH;
        const pointerYBase600 = relativeY * CANVAS_HEIGHT;

        setDragOffset({
            x: pointerXBase800 - config.popup_text_x,
            y: pointerYBase600 - config.popup_text_y
        });
        setDragging(true);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;
        const container = e.currentTarget as HTMLElement;
        const rect = container.getBoundingClientRect();

        const relativeX = (e.clientX - rect.left) / rect.width;
        const relativeY = (e.clientY - rect.top) / rect.height;

        const pointerXBase800 = relativeX * CANVAS_WIDTH;
        const pointerYBase600 = relativeY * CANVAS_HEIGHT;

        setConfig(prev => ({
            ...prev,
            popup_text_x: Math.round(Math.max(0, Math.min(CANVAS_WIDTH, pointerXBase800 - dragOffset.x))),
            popup_text_y: Math.round(Math.max(0, Math.min(CANVAS_HEIGHT, pointerYBase600 - dragOffset.y))),
        }));
    };

    const handleMouseUp = () => setDragging(false);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f9fafb' }}>Chargement...</div>;

    return (
        <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>✨ Éditeur du Pop-up d'accueil</h1>
                        <p style={{ color: '#6b7280', margin: 0 }}>Configurez la fenêtre qui s'affiche à l'ouverture du site.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: saving ? 'wait' : 'pointer' }}
                        >
                            {saving ? '⏳ Sauvegarde...' : '💾 Sauvegarder'}
                        </button>
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            style={{ padding: '10px 20px', background: 'white', color: '#374151', border: '1px solid #e5e7eb', borderRadius: '10px', fontWeight: 600, cursor: 'pointer' }}
                        >
                            ← Retour
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 380px', gap: '24px' }}>

                {/* PREVIEW CONTAINER */}
                <div style={{ background: 'white', borderRadius: '16px', padding: '32px', border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, fontWeight: 600, color: '#111827' }}>Prévisualisation Globale</h3>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', background: config.is_popup_enabled ? '#dcfce7' : '#fee2e2', padding: '8px 16px', borderRadius: '20px', fontWeight: 600, color: config.is_popup_enabled ? '#166534' : '#991b1b', transition: 'all 0.2s' }}>
                            <input
                                type="checkbox"
                                checked={config.is_popup_enabled}
                                onChange={(e) => setConfig({ ...config, is_popup_enabled: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: '#16a34a' }}
                            />
                            {config.is_popup_enabled ? 'Activé sur le site' : 'Désactivé'}
                        </label>
                    </div>

                    <div
                        style={{
                            width: '100%',
                            position: 'relative',
                            backgroundColor: '#f3f4f6',
                            borderRadius: '12px',
                            border: '2px solid #e5e7eb',
                            overflow: 'hidden',
                            cursor: dragging ? 'grabbing' : 'auto'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        {config.popup_image_url ? (
                            <img src={config.popup_image_url} style={{ width: '100%', height: 'auto', display: 'block', pointerEvents: 'none' }} alt="Preview" />
                        ) : (
                            <div style={{ width: '100%', aspectRatio: '800/600', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>Aucune image de fond</div>
                        )}

                        {/* TEXT DRAGGABLE CONTAINER */}
                        <div
                            style={{
                                position: 'absolute',
                                left: `${(config.popup_text_x / CANVAS_WIDTH) * 100}%`,
                                top: `${(config.popup_text_y / CANVAS_HEIGHT) * 100}%`,
                                transform: 'translate(-50%, -50%)',
                                cursor: 'grab',
                                display: 'inline-block',
                                padding: '12px',
                                border: dragging ? '2px dashed #3b82f6' : '2px dashed transparent',
                                transition: 'border 0.2s'
                            }}
                            onMouseDown={handleMouseDown}
                        >
                            <span style={{
                                color: config.popup_text_color,
                                fontSize: `${config.popup_text_size}px`,
                                fontWeight: config.popup_text_weight,
                                textShadow: '0 2px 4px rgba(255,255,255,0.8)',
                                whiteSpace: 'pre-wrap',
                                display: 'block',
                                textAlign: 'center'
                            }}>
                                {config.popup_text}
                            </span>
                        </div>
                    </div>
                    <p style={{ textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '16px' }}>💡 Glissez le texte pour modifier sa position</p>
                </div>

                {/* CONTROLS SIDEBAR */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Background Control */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ margin: 0, marginBottom: '16px', fontWeight: 600, color: '#111827' }}>🖼️ Image de fond</h3>
                        <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => fileInputRef.current?.click()} style={{ flex: 1, padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                Importer une image
                            </button>
                            <button onClick={() => setConfig({ ...config, popup_image_url: '' })} style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>
                                Effacer
                            </button>
                        </div>
                    </div>

                    {/* Text Controls */}
                    <div style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ margin: 0, marginBottom: '16px', fontWeight: 600, color: '#111827' }}>✍️ Contenu du texte</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Texte affiché</label>
                                <textarea
                                    value={config.popup_text}
                                    onChange={(e) => setConfig({ ...config, popup_text: e.target.value })}
                                    style={{ width: '100%', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', minHeight: '80px', resize: 'vertical', fontFamily: 'inherit' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Taille (px)</label>
                                    <input
                                        type="number"
                                        value={config.popup_text_size}
                                        onChange={(e) => setConfig({ ...config, popup_text_size: Number(e.target.value) })}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Couleur</label>
                                    <input
                                        type="color"
                                        value={config.popup_text_color}
                                        onChange={(e) => setConfig({ ...config, popup_text_color: e.target.value })}
                                        style={{ width: '100%', height: '36px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>Graisse (Épaisseur)</label>
                                <select
                                    value={config.popup_text_weight}
                                    onChange={(e) => setConfig({ ...config, popup_text_weight: Number(e.target.value) })}
                                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer' }}
                                >
                                    <option value="400">Normal (400)</option>
                                    <option value="600">Semi-Gras (600)</option>
                                    <option value="800">Gras (800)</option>
                                    <option value="900">Extra Gras (900)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
