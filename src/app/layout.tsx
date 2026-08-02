
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { KioskErrorBoundary } from '@/components/kiosk/error-boundary';

export const metadata: Metadata = {
  title: 'JNL Studio Booth | Premium Photobooth Kiosk',
  description: 'High-readability landscape kiosk interface for JNL Studio portraits.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'JNL Studio Booth',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#000000',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalError = console.error;
                console.error = function(...args) {
                  const msg = args[0] ? args[0].toString() : '';
                  if (msg.includes('Could not reach Cloud Firestore backend')) {
                    if (typeof document !== 'undefined' && document.body && document.body.classList && !document.body.classList.contains('admin-mode')) {
                      return;
                    }
                  }
                  originalError.apply(console, args);
                };
                
                // Safe diagnostic wrapper
                if (typeof window !== 'undefined') {
                  window.addEventListener('DOMContentLoaded', () => {
                    console.log('JNL System: Interface Hydrated');
                  });
                }
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased bg-black text-white selection:bg-primary/30">
        <KioskErrorBoundary>
          {children}
        </KioskErrorBoundary>
      </body>
    </html>
  );
}
