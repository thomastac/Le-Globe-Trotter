import Link from 'next/link';
import Image from 'next/image';
import logo from '../img/logo.png';

export default function HomePage() {
  return (
    <main className="home-hero">
      <div className="home-hero__overlay" />
      <div className="home-hero__content">
        <Image
          src={logo}
          alt="GlobeTrotter logo"
          className="home-hero__logo"
          priority
        />
        <h1 className="home-hero__title">Bienvenue au GlobetrotterSpace</h1>
        <div className="home-hero__actions">
          <Link href="/submit" className="btn btn-pill btn-mint btn-lg">Partage ton voyage</Link>
          <Link href="/map" className="btn btn-pill btn-mint btn-lg btn-alt">Cartes des Globetrotters</Link>
        </div>
      </div>
    </main>
  );
}

