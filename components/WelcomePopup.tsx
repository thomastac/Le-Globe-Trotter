"use client";

import { useEffect, useState } from 'react';

export default function WelcomePopup() {
    const [config, setConfig] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isEntering, setIsEntering] = useState(true);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        // Ne pas afficher si déjà vu pendant cette session
        if (sessionStorage.getItem('hasSeenPopup')) {
            return;
        }

        async function fetchConfig() {
            try {
                const res = await fetch(`/api/popup-config?t=${Date.now()}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.is_popup_enabled) {
                        setConfig(data);
                        setIsVisible(true);
                    }
                }
            } catch (err) {
                console.error("Erreur lors du chargement de la config du popup:", err);
            }
        }

        fetchConfig();
    }, []);

    useEffect(() => {
        if (isVisible) {
            // Déclenche l'animation d'apparition après le premier rendu
            const timer = setTimeout(() => setIsEntering(false), 50);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    const handleClose = () => {
        setIsClosing(true);
        sessionStorage.setItem('hasSeenPopup', 'true');
        setTimeout(() => {
            setIsVisible(false);
        }, 500); // On attend la fin de l'animation
    };

    if (!isVisible || !config) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            opacity: isClosing || isEntering ? 0 : 1,
            transition: 'opacity 0.4s ease'
        }}>
            <div style={{
                position: 'relative',
                display: 'inline-flex',
                maxWidth: '90vw',
                maxHeight: '85vh',
                background: 'white',
                borderRadius: '16px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                transform: isClosing ? 'scale(0.9) translateY(20px)' : (isEntering ? 'scale(0.9) translateY(20px)' : 'scale(1) translateY(0)'),
                opacity: isClosing || isEntering ? 0 : 1,
                transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}>
                {/* Bouton Fermer */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        zIndex: 10,
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(4px)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s, background 0.2s',
                        color: '#374151'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.background = 'white';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                    }}
                >
                    <span style={{ fontSize: '20px', lineHeight: 1 }}>✕</span>
                </button>

                {/* Contenu visuel */}
                <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {config.popup_image_url ? (
                        <img
                            src={config.popup_image_url}
                            alt="Welcome"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '85vh',
                                width: 'auto',
                                height: 'auto',
                                display: 'block',
                                objectFit: 'contain'
                            }}
                        />
                    ) : (
                        <div style={{ width: '600px', maxWidth: '90vw', aspectRatio: '4/3', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)' }} />
                    )}

                    {/* Texte superposé */}
                    {config.popup_text && (
                        <div style={{
                            position: 'absolute',
                            left: `${(config.popup_text_x / 800) * 100}%`,
                            top: `${(config.popup_text_y / 600) * 100}%`,
                            color: config.popup_text_color,
                            fontSize: `clamp(14px, ${(config.popup_text_size / 800) * 100}vw, ${config.popup_text_size}px)`,
                            fontWeight: config.popup_text_weight,
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center',
                            width: 'max-content',
                            maxWidth: '90%',
                            textShadow: '0 2px 4px rgba(255,255,255,0.8)',
                            lineHeight: 1.2
                        }}>
                            {config.popup_text}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
