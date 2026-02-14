import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Fraunces } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';
import { Navigation } from '../components/Navigation';

const bricolage = Bricolage_Grotesque({ 
  subsets: ['latin'],
  variable: '--font-bricolage',
});

const fraunces = Fraunces({ 
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kissa',
  description: 'Make it effortless to brew excellent coffee daily',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#43302b',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${bricolage.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
          <Navigation />
        </Providers>
      </body>
    </html>
  );
}
