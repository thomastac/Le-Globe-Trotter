import './globals.css';
import type { Metadata } from 'next';
import Header from './components/Header';

export const metadata: Metadata = {
  title: 'GlobeTrotter Map',
  description: 'Demo – 3 points seed BDD (améliorable)',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <Header />
        <div>
          {children}
        </div>
      </body>
    </html>
  );
}
