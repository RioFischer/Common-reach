import type { Metadata } from 'next'
import './globals.css'
import 'leaflet/dist/leaflet.css'

export const metadata: Metadata = {
  title: 'CommonReach',
  description: 'Find local civic service providers in your area.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/brand/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/brand/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/brand/favicon/site.webmanifest" />
        <meta name="theme-color" content="#1C3A2E" />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {/* Skip navigation — WCAG 2.1 SC 2.4.1 */}
        <a
          href="#main-content"
          className="skip-nav sr-only rounded-md bg-primary px-4 py-2 text-primary-foreground"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  )
}
