"use client";

import { useEffect, useState } from 'react';
import cocktailImg from '../../img/menu/cocktail.jpg';
import nachosImg from '../../img/menu/nachos.png';
import vinImg from '../../img/menu/vin.jpg';
import MenuModal from './MenuModal';

export default function MenuTeaser({ variant = 'default' }: { variant?: 'default' | 'hero' }) {
  const [offset, setOffset] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setOffset(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openMenu = () => {
    setIsModalOpen(true);
  };

  const isHero = variant === 'hero';

  return (
    <>
      <section className={`teaser-section ${isHero ? 'teaser-hero' : ''}`}>
        <div className={`container teaser-grid ${isHero ? 'grid-hero' : ''}`}>
          <div className="teaser-content">
            <h2 className="font-hand teaser-title" style={isHero ? { fontSize: '2.5rem', marginBottom: 16 } : {}}>
              {isHero ? "Le Goût de l'Aventure" : "Le Goût de l'Aventure"}
            </h2>
            <p className="teaser-text" style={isHero ? { fontSize: '1rem', marginBottom: 20, color: '#e2e8f0' } : {}}>
              Parce qu'un bon voyage commence souvent autour d'un verre ou d'un bon plat.
              Découvrez notre sélection de saveurs du monde.
            </p>
            <button onClick={openMenu} className="btn btn-pill btn-mint btn-lg teaser-btn">
              <span>🍹</span> Découvrir la Carte
            </button>
          </div>

          <div className="teaser-visuals" style={isHero ? { height: 300 } : {}}>
            <div className="visual-card card-1" style={{ transform: `translateY(${offset * 0.05}px)` }}>
              <img src={cocktailImg.src} alt="Cocktail" />
            </div>
            <div className="visual-card card-2" style={{ transform: `translateY(${-offset * 0.08}px)` }}>
              <img src={nachosImg.src} alt="Nachos" />
            </div>
            <div className="visual-card card-3" style={{ transform: `translateY(${offset * 0.03}px)` }}>
              <img src={vinImg.src} alt="Vin" />
            </div>
          </div>
        </div>

        <style jsx>{`
          .teaser-section {
            padding: 100px 0;
            background: #F0E8DA;
            overflow: hidden;
            position: relative;
          }
          .teaser-hero {
            padding: 0;
            background: transparent;
            width: 100%;
          }
          
          .teaser-grid {
            display: grid;
            gap: 60px;
            align-items: center;
          }
          .grid-hero {
            gap: 20px;
            padding: 0;
            max-width: none;
          }

          @media (min-width: 900px) {
            .teaser-grid {
              grid-template-columns: 1fr 1fr;
            }
            .grid-hero {
              grid-template-columns: 1fr; /* Stack in hero column */
              text-align: center;
            }
          }

          .teaser-content {
            z-index: 2;
          }
          .teaser-title {
            font-size: 3.5rem;
            color: #2DCEBE;
            margin-bottom: 24px;
            line-height: 1.1;
            text-shadow: 0 4px 20px rgba(45, 206, 190, 0.15);
          }
          .teaser-text {
            color: #78716c;
            font-size: 1.05rem;
            line-height: 1.7;
            margin-bottom: 32px;
            max-width: 480px;
          }
          /* Center text in hero mode if needed, or keep left */
          .teaser-hero .teaser-content {
             /* adjustments for hero context */
          }

          .teaser-btn {
            background: #D4F5F1 !important;
            border-color: #B8EDE8 !important;
            color: #0d7a72 !important;
            box-shadow: none;
            transition: background 0.2s ease, color 0.2s ease, transform 0.15s ease;
          }
          .teaser-btn:hover {
            background: #2DCEBE !important;
            border-color: #2DCEBE !important;
            color: #ffffff !important;
            transform: translateY(-2px);
            box-shadow: none;
          }

          .teaser-visuals {
            position: relative;
            height: 400px;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .visual-card {
            position: absolute;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.4);
            transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
            border: 4px solid rgba(255,255,255,0.1);
          }
          .visual-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.7s ease;
          }
          .visual-card:hover {
            z-index: 10;
            transform: scale(1.1) !important;
            border-color: rgba(255,255,255,0.8);
          }
          .visual-card:hover img {
            transform: scale(1.15);
          }

          .card-1 {
            width: 220px;
            height: 280px;
            left: 0;
            top: 20px;
            z-index: 3;
            transform: rotate(-6deg);
          }
          .teaser-hero .card-1 { width: 160px; height: 200px; left: 10%; }

          .card-2 {
            width: 240px;
            height: 320px;
            right: 20px;
            top: -20px;
            z-index: 2;
            transform: rotate(4deg);
          }
          .teaser-hero .card-2 { width: 180px; height: 240px; right: 10%; }

          .card-3 {
            width: 180px;
            height: 180px;
            bottom: -40px;
            left: 30%;
            z-index: 4;
            transform: rotate(-12deg);
          }
          .teaser-hero .card-3 { width: 130px; height: 130px; bottom: 0; }

          /* Mobile optimizations */
          @media (max-width: 500px) {
            .teaser-section {
              padding: 60px 0;
            }
            
            .teaser-visuals {
              height: auto !important;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              gap: 24px;
              padding: 40px 0;
            }
            
            .visual-card {
              position: relative !important;
              left: auto !important;
              right: auto !important;
              top: auto !important;
              bottom: auto !important;
              transform: none !important;
              flex-shrink: 0;
              width: 220px !important;
              height: 280px !important;
              border-radius: 24px;
            }
            
            .card-1 {
              width: 200px !important;
              height: 260px !important;
            }
            .card-2 {
              width: 220px !important;
              height: 280px !important;
            }
            .card-3 {
              width: 200px !important;
              height: 260px !important;
            }

            .teaser-hero .card-1,
            .teaser-hero .card-2,
            .teaser-hero .card-3 { 
              position: relative !important;
              left: auto !important;
              right: auto !important;
              top: auto !important;
              bottom: auto !important;
              transform: none !important;
            }
          }
        `}</style>
      </section>

      <MenuModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
