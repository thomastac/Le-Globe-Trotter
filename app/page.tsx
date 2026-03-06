import Link from 'next/link';
import Image from 'next/image';
import logo from '../img/logo.png';
import AnecdoteCarousel from './components/AnecdoteCarousel';
import MenuTeaser from './components/MenuTeaser';

export default function HomePage() {
  return (
    <main>

      {/* ── Section Hero ────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero__overlay" />
        <div className="home-hero__body">
          <Image
            src={logo}
            alt="GlobeTrotter logo"
            className="home-hero__logo"
            priority
          />
          <h1 className="home-hero__title">Bienvenue au<br /><span className="home-hero__title-accent">GlobeTrotter</span></h1>
          <p className="home-hero__subtitle">
            Le point de rencontre des voyageurs. Partagez vos meilleures adresses,
            racontez vos anecdotes et découvrez le monde à travers les yeux de ceux qui l'explorent.
          </p>
          <div className="home-hero__actions">
            <Link href="/submit" className="btn-gt btn-gt--primary">
              Racontez votre voyage
            </Link>
            <Link href="/map" className="btn-gt btn-gt--secondary">
              Explorez la carte
            </Link>
          </div>
        </div>
      </section>

      {/* ── Section Menu / Goût de l'Aventure ───────────── */}
      <section className="home-menu-section">
        <MenuTeaser />
      </section>

      {/* ── Section Dernières Aventures ─────────────────── */}
      <section className="home-feed-section">
        <div className="home-section-header">
          <h2 className="home-section-title">Dernières Aventures</h2>
          <p className="home-section-sub">Les histoires récentes de notre communauté</p>
        </div>
        <AnecdoteCarousel />
      </section>

    </main>
  );
}
