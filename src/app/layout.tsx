import type {Metadata} from 'next';
import './globals.css';
import { KioskErrorBoundary } from '@/components/kiosk/error-boundary';

export const metadata: Metadata = {
  title: 'JNL Studio Booth | Premium Photobooth Kiosk',
  description: 'High-readability kiosk interface for JNL Studio portraits with AI enhancement.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-black text-white selection:bg-primary/30">
        <KioskErrorBoundary>
          {children}
        </KioskErrorBoundary>
      </body>
    </html>
  );
}