"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getTemplateConfig, saveTemplateConfig, getDefaultConfig, resetTemplateConfig, type TemplateConfig, type TemplateBlock } from '../../../utils/templateConfig';

type BlockKey = keyof TemplateConfig['blocks'];

export default function TemplateEditor() {
    const router = useRouter();
    const [config, setConfig] = useState<TemplateConfig>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('boarding_pass_config');
            if (saved) {
                try {
                    return JSON.parse(saved);
                } catch (error) {
                    console.error('Error parsing saved config:', error);
                    return getDefaultConfig();
                }
            }
        }
        return getDefaultConfig();
    });

    const [selectedBlock, setSelectedBlock] = useState<BlockKey | null>(null);
    const [dragging, setDragging] = useState<BlockKey | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Vérifier l'authentification
    useEffect(() => {
        const isAuth = sessionStorage.getItem('admin_auth');
        if (!isAuth) {
            router.push('/');
        }
    }, [router]);

    const handleMouseDown = (e: React.MouseEvent, key: BlockKey) => {
        const target = e.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        setDragging(key);
        setSelectedBlock(key);
        setDragOffset({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        e.stopPropagation();
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging) return;

        const container = e.currentTarget as HTMLElement;
        const rect = container.getBoundingClientRect();
        const scale = 1240 / rect.width;

        const newLeft = Math.round((e.clientX - rect.left - dragOffset.x) * scale);
        const newTop = Math.round((e.clientY - rect.top - dragOffset.y) * scale);

        setConfig((prev: TemplateConfig) => ({
            ...prev,
            blocks: {
                ...prev.blocks,
                [dragging]: {
                    ...prev.blocks[dragging],
                    left: Math.max(0, Math.min(1240, newLeft)),
                    top: Math.max(0, Math.min(1748, newTop)),
                }
            }
        }));
    };

    const handleMouseUp = () => {
        setDragging(null);
    };

    const handleSave = async () => {
        try {
            await saveTemplateConfig(config);
            alert('✅ Configuration sauvegardée avec succès !');
        } catch (e: any) {
            alert('❌ Erreur lors de la sauvegarde: ' + e.message);
        }
    };

    const handleReset = () => {
        if (confirm('Voulez-vous vraiment revenir à la configuration par défaut ?')) {
            resetTemplateConfig();
            setConfig(getDefaultConfig());
            setSelectedBlock(null);
            alert('✅ Configuration réinitialisée !');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string;
                setConfig((prev: TemplateConfig) => ({ ...prev, backgroundImage: imageUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleResetImage = () => {
        setConfig((prev: TemplateConfig) => ({ ...prev, backgroundImage: '/img/tampon d embarcation.png' }));
    };

    const updateBlockProperty = (key: BlockKey, property: keyof TemplateBlock, value: number | string) => {
        setConfig((prev: TemplateConfig) => ({
            ...prev,
            blocks: {
                ...prev.blocks,
                [key]: {
                    ...prev.blocks[key],
                    [property]: value
                }
            }
        }));
    };

    const selectedBlockData = selectedBlock && config?.blocks ? config.blocks[selectedBlock] : null;

    const blockColors: Record<BlockKey, string> = {
        photo: '#3b82f6',
        name: '#10b981',
        destination: '#f59e0b',
        anecdote: '#8b5cf6',
        stop1: '#ec4899',
        stop2: '#ef4444',
        stop3: '#f97316',
        bonPlan1: '#14b8a6',
        bonPlan2: '#06b6d4',
        bonPlan3: '#0284c7',
    };

    const blockLabels: Record<BlockKey, string> = {
        photo: '📸 Photo',
        name: '✍️ Nom',
        destination: '🛫 Destination',
        anecdote: '📝 Anecdote',
        stop1: '📍 Arrêt 1',
        stop2: '📍 Arrêt 2',
        stop3: '📍 Arrêt 3',
        bonPlan1: '💡 Bon Plan 1',
        bonPlan2: '💡 Bon Plan 2',
        bonPlan3: '💡 Bon Plan 3',
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
            padding: '24px'
        }}>
            {/* Header */}
            <div style={{ maxWidth: '1600px', margin: '0 auto', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                        <h1 style={{
                            fontSize: '32px',
                            fontWeight: 700,
                            color: '#111827',
                            marginBottom: '4px',
                            letterSpacing: '-0.02em'
                        }}>
                            🎨 Éditeur de Template
                        </h1>
                        <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
                            Personnalisez visuellement votre carte d'embarcation
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                            onClick={handleSave}
                            style={{
                                padding: '10px 20px',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            💾 Sauvegarder
                        </button>
                        <button
                            onClick={handleReset}
                            style={{
                                padding: '10px 20px',
                                background: 'white',
                                color: '#374151',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            🔄 Réinitialiser
                        </button>
                        <button
                            onClick={() => router.push('/admin/dashboard')}
                            style={{
                                padding: '10px 20px',
                                background: 'white',
                                color: '#374151',
                                border: '1px solid #e5e7eb',
                                borderRadius: '10px',
                                fontWeight: 600,
                                fontSize: '14px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                        >
                            ← Retour
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - 3 columns: Palette | Preview | Controls */}
            <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'grid', gridTemplateColumns: '220px 1fr 380px', gap: '24px' }}>

                {/* LEFT: Palette de blocs */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb',
                    height: 'fit-content'
                }}>
                    <h3 style={{
                        fontSize: '15px',
                        fontWeight: 600,
                        color: '#111827',
                        marginBottom: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        📦 Blocs
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {(Object.keys(blockLabels) as BlockKey[]).map((key) => (
                            <div
                                key={String(key)}
                                onClick={() => setSelectedBlock(key)}
                                style={{
                                    padding: '12px',
                                    background: selectedBlock === key ? `${blockColors[key]}20` : '#f9fafb',
                                    border: `2px solid ${selectedBlock === key ? blockColors[key] : '#e5e7eb'}`,
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontSize: '13px',
                                    fontWeight: 600,
                                    color: selectedBlock === key ? blockColors[key] : '#374151',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                    if (selectedBlock !== key) {
                                        e.currentTarget.style.borderColor = blockColors[key];
                                        e.currentTarget.style.background = `${blockColors[key]}10`;
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (selectedBlock !== key) {
                                        e.currentTarget.style.borderColor = '#e5e7eb';
                                        e.currentTarget.style.background = '#f9fafb';
                                    }
                                }}
                            >
                                <div style={{
                                    width: '12px',
                                    height: '12px',
                                    background: blockColors[key],
                                    borderRadius: '3px',
                                    flexShrink: 0
                                }} />
                                <span style={{ fontSize: '12px' }}>{blockLabels[key]}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '16px',
                        padding: '12px',
                        background: '#eff6ff',
                        borderRadius: '8px',
                        fontSize: '11px',
                        color: '#1e40af',
                        lineHeight: '1.4'
                    }}>
                        💡 Cliquez sur un bloc pour le sélectionner
                    </div>
                </div>

                {/* CENTER: Preview */}
                <div style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '32px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    border: '1px solid #e5e7eb'
                }}>
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '700px',
                            aspectRatio: '1240 / 1748',
                            margin: '0 auto',
                            background: `url('${config.backgroundImage}') center/contain no-repeat`,
                            border: '2px solid #e5e7eb',
                            borderRadius: '12px',
                            cursor: dragging ? 'grabbing' : 'default',
                            overflow: 'hidden'
                        }}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onClick={() => setSelectedBlock(null)}
                    >
                        {/* Render blocks */}
                        {config?.blocks && (Object.keys(config.blocks) as BlockKey[]).map((key) => {
                            const block = config.blocks[key];
                            const color = blockColors[key];
                            const isSelected = selectedBlock === key;

                            if (key === 'photo') {
                                return (
                                    <div
                                        key={String(key)}
                                        style={{
                                            position: 'absolute',
                                            left: `${(block.left / 1240) * 100}%`,
                                            top: `${(block.top / 1748) * 100}%`,
                                            width: `${((block.width || 0) / 1240) * 100}%`,
                                            height: `${((block.height || 0) / 1748) * 100}%`,
                                            border: isSelected ? `3px solid ${color}` : `2px dashed ${color}`,
                                            background: `${color}15`,
                                            cursor: 'grab',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '11px',
                                            color: color,
                                            fontWeight: 700,
                                            boxShadow: isSelected ? `0 0 0 4px ${color}20` : 'none',
                                            transition: 'all 0.15s'
                                        }}
                                        onMouseDown={(e) => handleMouseDown(e, key)}
                                    >
                                        {blockLabels[key]}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={String(key)}
                                    style={{
                                        position: 'absolute',
                                        left: `${(block.left / 1240) * 100}%`,
                                        top: `${(block.top / 1748) * 100}%`,
                                        padding: '4px 10px',
                                        border: isSelected ? `2px solid ${color}` : `2px dashed ${color}`,
                                        background: `${color}15`,
                                        cursor: 'grab',
                                        fontSize: '10px',
                                        color: color,
                                        fontWeight: 700,
                                        whiteSpace: 'nowrap',
                                        borderRadius: '6px',
                                        boxShadow: isSelected ? `0 0 0 3px ${color}20` : 'none',
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseDown={(e) => handleMouseDown(e, key)}
                                >
                                    {blockLabels[key]}
                                </div>
                            );
                        })}
                    </div>

                    <p style={{
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontSize: '13px',
                        marginTop: '20px',
                        fontStyle: 'italic'
                    }}>
                        💡 Cliquez et déplacez les blocs pour les repositionner
                    </p>
                </div>

                {/* Control Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Image Background Card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '16px',
                        padding: '20px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        border: '1px solid #e5e7eb'
                    }}>
                        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            🖼️ Image de fond
                        </h3>
                        <div style={{
                            width: '100%',
                            height: '140px',
                            background: `url('${config.backgroundImage}') center/contain no-repeat`,
                            border: '2px dashed #e5e7eb',
                            borderRadius: '10px',
                            marginBottom: '12px'
                        }} />
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                            >
                                📤 Upload
                            </button>
                            <button
                                onClick={handleResetImage}
                                style={{
                                    flex: 1,
                                    padding: '10px',
                                    background: 'white',
                                    color: '#374151',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                            >
                                Défaut
                            </button>
                        </div>
                    </div>

                    {/* Block Controls Card */}
                    {selectedBlock && selectedBlockData && (
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '20px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                            border: '1px solid #e5e7eb'
                        }}>
                            <h3 style={{
                                fontSize: '15px',
                                fontWeight: 600,
                                color: '#111827',
                                marginBottom: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{
                                    width: '12px',
                                    height: '12px',
                                    background: blockColors[selectedBlock],
                                    borderRadius: '3px'
                                }} />
                                {blockLabels[selectedBlock]}
                            </h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {/* Position */}
                                <div>
                                    <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                                        Position
                                    </label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                        <div>
                                            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>X</label>
                                            <input
                                                type="number"
                                                value={selectedBlockData.left}
                                                onChange={(e) => updateBlockProperty(selectedBlock, 'left', parseInt(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 10px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Y</label>
                                            <input
                                                type="number"
                                                value={selectedBlockData.top}
                                                onChange={(e) => updateBlockProperty(selectedBlock, 'top', parseInt(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 10px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Size for photo and anecdote */}
                                {(selectedBlock === 'photo' || selectedBlock === 'anecdote') && (
                                    <div>
                                        <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                                            Dimensions
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <div>
                                                <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Largeur</label>
                                                <input
                                                    type="number"
                                                    value={selectedBlockData.width || 0}
                                                    onChange={(e) => updateBlockProperty(selectedBlock, 'width', parseInt(e.target.value))}
                                                    style={{
                                                        width: '100%',
                                                        padding: '8px 10px',
                                                        border: '1px solid #e5e7eb',
                                                        borderRadius: '8px',
                                                        fontSize: '14px',
                                                        background: '#f9fafb'
                                                    }}
                                                />
                                            </div>
                                            {selectedBlock === 'photo' && (
                                                <div>
                                                    <label style={{ fontSize: '11px', color: '#9ca3af', display: 'block', marginBottom: '4px' }}>Hauteur</label>
                                                    <input
                                                        type="number"
                                                        value={selectedBlockData.height || 0}
                                                        onChange={(e) => updateBlockProperty(selectedBlock, 'height', parseInt(e.target.value))}
                                                        style={{
                                                            width: '100%',
                                                            padding: '8px 10px',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            fontSize: '14px',
                                                            background: '#f9fafb'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Typography for text blocks */}
                                {selectedBlock !== 'photo' && (
                                    <>
                                        <div>
                                            <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                                                Taille de police
                                            </label>
                                            <input
                                                type="number"
                                                value={selectedBlockData.fontSize || 16}
                                                onChange={(e) => updateBlockProperty(selectedBlock, 'fontSize', parseInt(e.target.value))}
                                                min="8"
                                                max="100"
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 10px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    background: '#f9fafb'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                                                Couleur
                                            </label>
                                            <input
                                                type="color"
                                                value={selectedBlockData.color || '#000000'}
                                                onChange={(e) => updateBlockProperty(selectedBlock, 'color', e.target.value)}
                                                style={{
                                                    width: '100%',
                                                    height: '40px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    cursor: 'pointer'
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <label style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
                                                Graisse
                                            </label>
                                            <select
                                                value={selectedBlockData.fontWeight || 400}
                                                onChange={(e) => updateBlockProperty(selectedBlock, 'fontWeight', parseInt(e.target.value))}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 10px',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    fontSize: '14px',
                                                    background: '#f9fafb',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="400">Regular (400)</option>
                                                <option value="500">Medium (500)</option>
                                                <option value="600">Semibold (600)</option>
                                                <option value="700">Bold (700)</option>
                                                <option value="800">Extrabold (800)</option>
                                                <option value="900">Black (900)</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Instructions Card */}
                    {!selectedBlock && (
                        <div style={{
                            background: '#eff6ff',
                            borderRadius: '16px',
                            padding: '20px',
                            border: '1px solid #dbeafe'
                        }}>
                            <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>
                                <strong>💡 Mode d'emploi :</strong><br />
                                1. Cliquez sur un bloc pour le sé lectionner<br />
                                2. Déplacez-le en glissant<br />
                                3. Modifiez ses propriétés ici<br />
                                4. Sauvegardez vos changements
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
