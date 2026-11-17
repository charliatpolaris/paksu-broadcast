import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Monitoring WA Blast Natal PAKSU 2026',
  description: 'Portal Monitoring & Pengiriman Pesan WhatsApp Panitia Natal PAKSU 2026',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="bg-slate-50 text-slate-800 min-h-screen antialiased selection:bg-blue-100 selection:text-blue-900">
        {children}
      </body>
    </html>
  );
}
