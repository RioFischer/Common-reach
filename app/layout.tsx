import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  // Makes the relative canonical and og:url on each page resolve to absolute
  // URLs. Without it they ship as "/municipalities", which leaves apex vs www
  // ambiguous to crawlers.
  metadataBase: new URL('https://common-reach.com'),
  title: 'CommonReach',
  description: 'Find local civic service providers in your area.',
}

// 1. Tells search engines CommonReach is an entity rather than two English
// words that happened to appear together. alternateName links the spaced form
// to the same entity. Add LinkedIn, Crunchbase and any press to sameAs as they
// come online — each one strengthens the association.
const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://common-reach.com/#organization',
  name: 'CommonReach',
  alternateName: 'Common Reach',
  url: 'https://common-reach.com',
  logo: 'https://common-reach.com/brand/logo/commonreach-logo.svg',
  description:
    'A community services directory for municipalities and community colleges. Residents and students find local programs and services by search, browse, phone or text, in any language.',
  parentOrganization: {
    '@type': 'Organization',
    name: 'Upriver Design',
    url: 'https://www.upriver.design',
  },
  sameAs: [] as string[],
}

const WEBSITE = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://common-reach.com/#website',
  name: 'CommonReach',
  url: 'https://common-reach.com',
  publisher: { '@id': 'https://common-reach.com/#organization' },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE) }}
        />
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
