'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/municipalities', label: 'For municipalities' },
  { href: '/education', label: 'For community colleges' },
  { href: '/demo', label: 'Live demo' },
]

/**
 * Marketing chrome for /, /municipalities and /education.
 * The demo routes use NavHeader instead — that one is the white-label city
 * header shown above an embedded directory, not site navigation.
 */
export function MarketingNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Primary">
      <div className="container">
        <div className="nav-inner">
          <Link className="nav-logo" href="/">
            <svg className="nav-logo-svg" width="250" height="48" viewBox="0 0 250 48" fill="none"
                 xmlns="http://www.w3.org/2000/svg" role="img" aria-label="CommonReach" style={{ color: '#fff' }}>
              <path d="M24 43 C 20.5 35 13.5 29.2 11.6 23.7 A 13 13 0 1 1 36.4 23.7 C 34.5 29.2 27.5 35 24 43 Z"
                    fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
              <circle cx="24" cy="19" r="5.4" fill="#A8C5A0" />
              <text x="46" y="34" fontFamily="'DM Sans', system-ui, sans-serif" fontSize="30"
                    letterSpacing="-0.5" fill="currentColor">
                <tspan fontWeight="300">Common</tspan><tspan fontWeight="700" letterSpacing="-0.9">Reach</tspan>
              </text>
            </svg>
          </Link>

          <ul className="nav-links">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} aria-current={pathname === href ? 'page' : undefined}>{label}</Link>
              </li>
            ))}
          </ul>

          <div className="nav-cta">
            <a href="https://calendly.com/rio-upriver/30min" className="btn btn-white"
               target="_blank" rel="noopener">Book a call</a>
          </div>
        </div>
      </div>
    </nav>
  )
}
