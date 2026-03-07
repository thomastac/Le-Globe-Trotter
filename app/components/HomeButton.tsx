"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HomeButton() {
    const pathname = usePathname();
    const router = useRouter();
    const [showConfirm, setShowConfirm] = useState(false);

    // Cacher sur certaines pages
    const hide = pathname === '/' || pathname.startsWith('/admin');
    if (hide) return null;

    const handleClick = (e: React.MouseEvent) => {
        // Check if we are in the submission flow
        if (pathname.startsWith('/submit')) {
            e.preventDefault();
            setShowConfirm(true);
        }
    };

    const confirmLeave = () => {
        setShowConfirm(false);
        router.push('/');
    };

    const cancelLeave = () => {
        setShowConfirm(false);
    };

    return (
        <>
            <Link
                href="/"
                onClick={handleClick}
                className="home-btn btn btn-pill btn-mint"
                title="Retour à l'accueil"
                style={{
                    position: 'fixed',
                    top: '40px',
                    left: '40px',
                    bottom: 'auto',
                    right: 'auto',
                    zIndex: 999999,
                }}
            >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span>Accueil</span>
            </Link>

            {showConfirm && (
                <div className="custom-confirm-overlay">
                    <div className="custom-confirm-modal">
                        <div className="confirm-icon">
                            <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                <line x1="12" y1="9" x2="12" y2="13"></line>
                                <line x1="12" y1="17" x2="12.01" y2="17"></line>
                            </svg>
                        </div>
                        <h3 className="confirm-title">Quitter la page ?</h3>
                        <p className="confirm-text">
                            Attention, si vous quittez cette page, vos données non sauvegardées seront perdues. Voulez-vous vraiment retourner à l'accueil ?
                        </p>
                        <div className="confirm-actions">
                            <button onClick={cancelLeave} className="btn-confirm btn-cancel">Annuler</button>
                            <button onClick={confirmLeave} className="btn-confirm btn-leave">Oui, quitter</button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
                .home-btn {
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    display: flex;
                    align-items: center;
                    padding: 12px 24px;
                    font-weight: bold;
                    text-decoration: none;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .home-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0,0,0,0.4);
                }

                .custom-confirm-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(15, 10, 8, 0.6);
                    backdrop-filter: blur(4px);
                    z-index: 9999999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeInOverlay 0.3s ease forwards;
                    padding: 20px;
                }

                .custom-confirm-modal {
                    background: #ffffff;
                    border-radius: 20px;
                    padding: 30px;
                    max-width: 420px;
                    width: 100%;
                    text-align: center;
                    box-shadow: 0 12px 32px rgba(0,0,0,0.2);
                    animation: scaleUpModal 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                }

                .confirm-icon {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: #fff0f0;
                    color: #e63946;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 8px;
                }

                .confirm-title {
                    font-size: 20px;
                    font-weight: 800;
                    color: #1c1917;
                    margin: 0;
                }

                .confirm-text {
                    font-size: 15px;
                    color: #444;
                    line-height: 1.5;
                    margin: 0 0 8px 0;
                }

                .confirm-actions {
                    display: flex;
                    gap: 12px;
                    width: 100%;
                }

                .btn-confirm {
                    flex: 1;
                    padding: 12px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 15px;
                    cursor: pointer;
                    border: none;
                    transition: all 0.2s ease;
                }

                .btn-cancel {
                    background: #f1f1f1;
                    color: #333;
                }

                .btn-cancel:hover {
                    background: #e4e4e4;
                }

                .btn-leave {
                    background: #e63946;
                    color: #fff;
                }

                .btn-leave:hover {
                    background: #d62828;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(230, 57, 70, 0.3);
                }

                @keyframes fadeInOverlay {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes scaleUpModal {
                    from { opacity: 0; transform: scale(0.9) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </>
    );
}
