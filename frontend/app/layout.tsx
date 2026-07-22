import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import AuroraProvider from '@/components/aurora-provider'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const jost = Jost({
  subsets: ['latin'],
  weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Restro Audit | Dine-In Management & Audit System',
  description: 'Premium dine-in management portal with loyalty, inventory, and audit intelligence. DBMS Mini Project 21CSC205P at SRMIST.',
  icons: { icon: '/icon.svg' },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning className={`${cormorant.variable} ${jost.variable}`}>
      <body className="antialiased" suppressHydrationWarning style={{ fontFamily: 'var(--font-sans, Jost, sans-serif)', position: 'relative' }}>
        {/* Global aurora cursor-tracking blob — sits behind all content */}
        <AuroraProvider />
        <div style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </div>
        <Toaster
          position="bottom-right"
          richColors
          toastOptions={{
            style: {
              background: '#FDFAF4',
              border: '1px solid rgba(107, 94, 78, 0.18)',
              color: '#2D3A2E',
              fontFamily: 'Jost, sans-serif',
            },
          }}
        />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
