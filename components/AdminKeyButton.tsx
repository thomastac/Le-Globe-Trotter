"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminKeyButton() {
    const [isExpanded, setIsExpanded] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter();

    const handleSubmit = () => {
        // Vérifier le mot de passe (temporaire: "123")
        // TODO: Récupérer depuis localStorage ou API
        const storedPassword = localStorage.getItem('admin_password') || '123';

        if (password === storedPassword) {
            // Stocker l'authentification
            sessionStorage.setItem('admin_auth', 'true');
            router.push('/admin/dashboard');
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    const handleClear = () => {
        setPassword('');
        setIsExpanded(false);
        setError(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div
            style={{
                position: 'fixed',
                bottom: 24,
                left: 24,
                zIndex: 1000,
            }}
        >
            <div
                style={{
                    background: isExpanded ? 'rgba(28, 25, 23, 0.95)' : 'rgba(120, 113, 108, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: isExpanded ? 24 : '50%',
                    width: isExpanded ? 280 : 48,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    padding: isExpanded ? '0 16px' : '0',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: error ? '2px solid #ef4444' : '2px solid rgba(231, 229, 228, 0.3)',
                    boxShadow: error
                        ? '0 0 0 4px rgba(239, 68, 68, 0.2), 0 8px 24px rgba(0, 0, 0, 0.2)'
                        : '0 4px 12px rgba(0, 0, 0, 0.15)',
                    cursor: isExpanded ? 'default' : 'pointer',
                    animation: error ? 'shake 0.3s' : 'none',
                }}
                onClick={() => !isExpanded && setIsExpanded(true)}
            >
                {!isExpanded ? (
                    // Icône de clé seule
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 20,
                        }}
                    >
                        🔑
                    </div>
                ) : (
                    // Mode étendu avec input
                    <>
                        <div style={{ fontSize: 20, marginRight: 12 }}>🔑</div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Mot de passe"
                            autoFocus
                            style={{
                                flex: 1,
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: 'white',
                                fontSize: 14,
                                fontWeight: 500,
                            }}
                        />
                        <button
                            onClick={handleSubmit}
                            style={{
                                background: '#10b981',
                                border: 'none',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginLeft: 8,
                                transition: 'all 0.2s',
                                fontSize: 16,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.background = '#059669';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = '#10b981';
                            }}
                            title="Valider"
                        >
                            ✓
                        </button>
                        <button
                            onClick={handleClear}
                            style={{
                                background: '#ef4444',
                                border: 'none',
                                borderRadius: '50%',
                                width: 32,
                                height: 32,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                marginLeft: 4,
                                transition: 'all 0.2s',
                                fontSize: 16,
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.1)';
                                e.currentTarget.style.background = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.background = '#ef4444';
                            }}
                            title="Effacer"
                        >
                            ✕
                        </button>
                    </>
                )}
            </div>

            <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        input[type="password"]::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }
      `}</style>
        </div>
    );
}
