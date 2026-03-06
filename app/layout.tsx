import './globals.css';
import type { Metadata } from 'next';
import { Caveat } from 'next/font/google';
import Header from './components/Header';
import HomeButton from './components/HomeButton';
import Footer from '@/components/Footer';
import WelcomePopup from '@/components/WelcomePopup';

const caveat = Caveat({ subsets: ['latin'], variable: '--font-caveat' });

export const metadata: Metadata = {
  title: 'GlobeTrotter Map',
  description: 'Demo – 3 points seed BDD (améliorable)',
  icons: {
    icon: '/img/logo.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={caveat.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <Header />
        <div>
          {children}
        </div>
        <HomeButton />
        <WelcomePopup />
        <Footer />
      </body>
    </html>
  );
}
