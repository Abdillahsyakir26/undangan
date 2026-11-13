import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Undangan Pernikahan',
  robots: { index: true, follow: true },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#faf3e7' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
