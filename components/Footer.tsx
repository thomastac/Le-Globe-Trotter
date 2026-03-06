"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Footer() {
    const router = useRouter();
    const [isKeyExpanded, setIsKeyExpanded] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleSubmit = () => {
        const storedPassword = typeof window !== 'undefined'
            ? (localStorage.getItem('admin_password') || '123')
            : '123';

        if (password === storedPassword) {
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('admin_auth', 'true');
            }
            router.push('/admin/dashboard');
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const handleClear = () => {
        setPassword('');
        setIsKeyExpanded(false);
        setError(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        } else if (e.key === 'Escape') {
            handleClear();
        }
    };

    return (
        <footer style={{
            background: '#EDE4D7',
            color: '#44403c',
            position: 'relative',
            borderTop: '1px solid #D6C9B6',
        }}>
            {/* Section principale */}
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 24px 24px' }}>
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '32px'
                }}>
                    {/* Logo/Nom en blanc */}
                    <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: '#1c1917' }}>GlobeTrotter</h3>
                        <p style={{ color: '#78716c', fontSize: '14px' }}>Partagez vos aventures</p>
                    </div>

                    {/* Instagram - Petit et élégant */}
                    <a
                        href="https://www.instagram.com/le_globetrotter_bar"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 20px',
                            background: '#F5EFE6',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '24px',
                            color: '#44403c',
                            textDecoration: 'none',
                            fontSize: '14px',
                            fontWeight: '500',
                            border: '1px solid #D6C9B6',
                            transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#CE425B';
                            e.currentTarget.style.color = '#ffffff';
                            e.currentTarget.style.borderColor = '#CE425B';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#F5EFE6';
                            e.currentTarget.style.color = '#44403c';
                            e.currentTarget.style.borderColor = '#D6C9B6';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <svg
                            style={{ width: '18px', height: '18px', fill: 'currentColor' }}
                            viewBox="0 0 24 24"
                        >
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>@le_globetrotter_bar</span>
                    </a>
                </div>
            </div>

            {/* Barre du bas avec clé */}
            <div style={{
                borderTop: '1px solid #D6C9B6',
                padding: '20px 24px',
            }}>
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '16px',
                    flexWrap: 'wrap',
                }}>
                    {/* Bulle clé admin - Style Apple parfait */}
                    <div
                        style={{
                            position: 'relative',
                            width: isKeyExpanded ? '280px' : '36px',
                            height: '36px',
                            transition: 'width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                right: 0,
                                top: 0,
                                width: '100%',
                                height: '100%',
                                background: error
                                    ? 'rgba(206, 66, 91, 0.15)'
                                    : isKeyExpanded
                                        ? 'rgba(0, 0, 0, 0.06)'
                                        : 'rgba(0, 0, 0, 0.08)',
                                backdropFilter: 'blur(8px)',
                                border: error
                                    ? '1.5px solid rgba(206, 66, 91, 0.4)'
                                    : '1.5px solid #D6C9B6',
                                borderRadius: '18px',
                                boxShadow: isKeyExpanded
                                    ? '0 8px 32px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                    : '0 4px 12px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isKeyExpanded ? 'flex-start' : 'center',
                                padding: isKeyExpanded ? '0 12px' : '0',
                                gap: '8px',
                                cursor: isKeyExpanded ? 'default' : 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                animation: error ? 'shake 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)' : 'none',
                            }}
                            onClick={() => !isKeyExpanded && setIsKeyExpanded(true)}
                        >
                            {!isKeyExpanded ? (
                                <span style={{ fontSize: '16px', opacity: 0.7 }}>🔑</span>
                            ) : (
                                <>
                                    <span style={{ fontSize: '14px', opacity: 0.7, flexShrink: 0 }}>🔑</span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Code"
                                        autoFocus
                                        style={{
                                            flex: 1,
                                            background: 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            color: '#1c1917',
                                            fontSize: '13px',
                                            fontWeight: '500',
                                            minWidth: 0,
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                        <button
                                            onClick={handleSubmit}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                                            }}
                                            title="Valider"
                                        >
                                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={handleClear}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                borderRadius: '14px',
                                                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                                border: 'none',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.transform = 'scale(1.1)';
                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.transform = 'scale(1)';
                                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                                            }}
                                            title="Annuler"
                                        >
                                            <svg width="14" height="14" fill="none" stroke="white" strokeWidth="2.5" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
        input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
        </footer>
    );
}
