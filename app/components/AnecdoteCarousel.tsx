"use client";

import { useEffect, useState, useRef } from 'react';
import { fetchRecentSubmissions, Submission } from '../../lib/fetchSubmissions';
import BoardingPassModal from './BoardingPassModal';

export default function AnecdoteCarousel() {
  const [items, setItems] = useState<Submission[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRecentSubmissions().then(setItems);
  }, []);

  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  if (items.length === 0) return null;

  return (
    <div className="carousel-container">
      {/* Flèche gauche */}
      <button className="carousel-arrow carousel-arrow--left" onClick={() => scroll('left')} aria-label="Précédent">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div className="carousel-track" ref={trackRef}>
        {items.map((item) => (
          <div
            key={item.id}
            className="carousel-card paper-texture"
            onClick={() => setSelectedId(item.id)}
            style={{ cursor: 'pointer' }}
          >
            {item.photo_url && (
              <div className="carousel-img-wrap">
                <img src={item.photo_url} alt={item.display_name} />
              </div>
            )}
            <div className="carousel-content">
              <h3 className="font-hand" style={{ fontSize: 22, margin: '0 0 4px', color: '#1c1917' }}>{item.display_name}</h3>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2DCEBE', marginBottom: 8 }}>
                {item.country}
              </div>
              {item.anecdote_text && (
                <p style={{ fontStyle: 'italic', fontSize: 13, lineHeight: 1.55, color: '#78716c', margin: 0 }}>
                  "{item.anecdote_text.length > 120 ? item.anecdote_text.slice(0, 120) + '...' : item.anecdote_text}"
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Flèche droite */}
      <button className="carousel-arrow carousel-arrow--right" onClick={() => scroll('right')} aria-label="Suivant">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <BoardingPassModal
        isOpen={!!selectedId}
        onClose={() => setSelectedId(null)}
        submissionId={selectedId}
      />

      <style jsx>{`
        .carousel-container {
          position: relative;
          padding: 8px 0 32px;
        }
        /* ── Flèches ── */
        .carousel-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-60%);
          z-index: 10;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(250, 248, 243, 0.82);
          color: #44403c;
          backdrop-filter: blur(6px);
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          transition: background 0.18s ease, color 0.18s ease;
        }
        .carousel-arrow:hover {
          background: #CE425B;
          color: #ffffff;
        }
        .carousel-arrow--left  { left: 8px; }
        .carousel-arrow--right { right: 8px; }
        @media (max-width: 600px) {
          .carousel-arrow { display: none; }
        }
        /* ── Track ── */
        .carousel-track {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 10px 56px 20px;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: thin;
          scrollbar-color: #E8E0D0 transparent;
        }
        .carousel-track::-webkit-scrollbar { height: 5px; }
        .carousel-track::-webkit-scrollbar-thumb {
          background: #D6C9B6;
          border-radius: 3px;
        }
        /* ── Cards ── */
        .carousel-card {
          flex: 0 0 268px;
          border-radius: 14px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #EDE4D7;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .carousel-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }
        .carousel-img-wrap {
          height: 160px;
          overflow: hidden;
        }
        .carousel-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
        }
        .carousel-card:hover .carousel-img-wrap img {
          transform: scale(1.04);
        }
        .carousel-content {
          padding: 16px;
          flex: 1;
        }
      `}</style>
    </div>
  );
}
