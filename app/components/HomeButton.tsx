"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function HomeButton() {
    const pathname = usePathname();
    const router = useRouter();

    // Cacher sur certaines pages
    const hide = pathname === '/' || pathname.startsWith('/admin');
    if (hide) return null;

    const handleClick = (e: React.MouseEvent) => {
        // Check if we are in the submission flow
        if (pathname.startsWith('/submit')) {
            e.preventDefault();
            if (confirm("Attention, si vous quittez cette page, vos données non sauvegardées seront perdues. Voulez-vous vraiment retourner à l'accueil ?")) {
                router.push('/');
            }
        }
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
      `}</style>
        </>
    );
}
