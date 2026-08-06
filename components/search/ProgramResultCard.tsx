'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ContactForm } from '@/components/provider/ContactForm'
import { TrustBadges } from '@/components/TrustBadges'
import type { ProgramCard } from '@/lib/types'

interface ProgramResultCardProps {
  program: ProgramCard
  clientId: string
  slug?: string
  embedMode?: boolean
}

function mapsUrl(address: string | null): string | null {
  if (!address) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const core = digits.startsWith('1') ? digits.slice(1) : digits
  if (core.length !== 10) return phone
  return `(${core.slice(0, 3)}) ${core.slice(3, 6)}-${core.slice(6)}`
}

function verifiedLabel(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } catch {
    return 'Verified'
  }
}

/**
 * Program-mode search result card — sibling of ResultCard.tsx rather than a
 * shared abstraction (that file has its own in-flight rewrite and no
 * title-prop abstraction today). Same visual chrome, but titled by the
 * program name with a "via {provider}" subtitle, and links to the program
 * detail page unless this card is a zero-program fallback (is_provider_fallback),
 * in which case it behaves exactly like a plain provider card.
 */
export function ProgramResultCard({ program, clientId, slug, embedMode = false }: ProgramResultCardProps) {
  const [hovered, setHovered] = useState(false)
  const maps = mapsUrl(program.address)
  const detailHref = program.is_provider_fallback
    ? (slug ? `/provider/${program.id}?slug=${slug}` : `/provider/${program.id}?client_id=${clientId}`)
    : (slug ? `/program/${program.id}?slug=${slug}` : `/program/${program.id}?client_id=${clientId}`)
  const providerProgramsHref = slug
    ? `/provider/${program.provider_id}/programs?slug=${slug}`
    : `/provider/${program.provider_id}/programs?client_id=${clientId}`

  // Programs don't carry domain data (the domain/category/subcategory
  // hierarchy is deprecated) — always use the default accent color.
  const accentColor = 'var(--ds-brand-400)'

  return (
    <div className="@container">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          display: 'flex',
          backgroundColor: 'var(--ds-bg-default)',
          border: '1px solid',
          borderColor: hovered ? 'var(--ds-border-strong)' : 'var(--ds-border-default)',
          borderRadius: 'var(--ds-radius-lg)',
          boxShadow: hovered ? 'var(--ds-shadow-card-hover)' : 'var(--ds-shadow-card)',
          overflow: 'hidden',
          transform: hovered ? 'translateY(-1px)' : 'translateY(0)',
          transition: `box-shadow var(--ds-transition-normal), transform var(--ds-transition-normal), border-color var(--ds-transition-fast)`,
        }}
      >
        {/* Domain accent bar */}
        <div style={{ width: '3px', flexShrink: 0, backgroundColor: accentColor }} aria-hidden="true" />

        {/* ── Card body ── */}
        <div className="flex-1 px-4 py-4 @sm:px-6 @sm:py-5">

          {/* ── Row 1: Name + verified badge ── */}
          <div className="flex items-start justify-between gap-2 @sm:gap-3 mb-1">
            <a
              href={detailHref}
              aria-label={`View details for ${program.name}`}
              {...(embedMode ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              style={{
                fontSize: '1rem',
                fontWeight: 'var(--ds-weight-semibold)',
                lineHeight: '1.3',
                color: 'var(--ds-text-primary)',
                textDecoration: 'none',
                letterSpacing: '-0.01em',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
            >
              {program.name}
            </a>

            {program.website_verified_at && (
              <span
                className="hidden @xs:inline-flex"
                style={{
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: 'var(--ds-radius-full)',
                  backgroundColor: 'var(--ds-success-light)',
                  color: 'var(--ds-success-base)',
                  fontSize: 'var(--ds-text-xs)',
                  fontWeight: 'var(--ds-weight-medium)',
                  flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--ds-success-base)' }} />
                <span className="hidden @sm:inline">{verifiedLabel(program.website_verified_at)}</span>
                <span className="@sm:hidden">Verified</span>
              </span>
            )}
          </div>

          {(program.data_verified || program.community_verified) && (
            <div className="mb-2">
              <TrustBadges dataVerified={program.data_verified} communityVerified={program.community_verified} />
            </div>
          )}

          {/* ── "via {Provider}" subtitle — links to the provider's full programs list ── */}
          {!program.is_provider_fallback && (
            <div className="mb-2" style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>
              via{' '}
              <Link
                href={providerProgramsHref}
                style={{
                  color: 'var(--ds-brand-600)',
                  fontWeight: 'var(--ds-weight-semibold)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-brand-700)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
              >
                {program.provider_name}
              </Link>
            </div>
          )}

          {/* ── Row 2: Phone ── */}
          {program.phone && (
            <div className="mb-3">
              <a
                href={`tel:${program.phone}`}
                aria-label={`Call ${program.name}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--ds-space-2)',
                  fontSize: 'var(--ds-text-base)',
                  fontWeight: 'var(--ds-weight-semibold)',
                  color: 'var(--ds-brand-600)',
                  textDecoration: 'none',
                  fontVariantNumeric: 'tabular-nums',
                  transition: 'color var(--ds-transition-fast)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-brand-700)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
                </svg>
                {formatPhone(program.phone)}
              </a>
            </div>
          )}

          {/* ── Row 3: Address + distance ── */}
          {(program.address || program.distance_miles !== null) && (
            <div className="flex items-start gap-3 mb-4 flex-wrap">
              {program.address && (
                <div className="flex items-start gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--ds-neutral-400)" aria-hidden="true" className="shrink-0 mt-0.5">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <span style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)', lineHeight: '1.4' }}>
                    {program.address}
                  </span>
                </div>
              )}
              {program.distance_miles !== null && (
                <span className="hidden @xs:inline" style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                  {program.distance_miles.toFixed(1)} mi
                </span>
              )}
            </div>
          )}

          {/* ── Divider ── */}
          <div style={{ borderTop: '1px solid var(--ds-border-subtle)', marginBottom: 'var(--ds-space-3)' }} />

          {/* ── Row 4: Secondary links ── */}
          <div className={`flex items-center gap-4 flex-wrap ${program.service_tags.length > 0 ? 'mb-3' : ''}`}>
            {maps && (
              <a
                href={maps}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', textDecoration: 'none', transition: 'color var(--ds-transition-fast)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
              >
                Directions ↗
              </a>
            )}
            {program.website && (
              <a
                href={program.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', textDecoration: 'none', transition: 'color var(--ds-transition-fast)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
              >
                Website ↗
              </a>
            )}
          </div>

          {/* ── Row 5: Service tags ── */}
          {program.service_tags.length > 0 && (
            <div role="group" aria-label="Service types" className="flex flex-wrap gap-1">
              {program.service_tags.slice(0, 4).map(t => (
                <span key={t} style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--ds-radius-full)',
                  backgroundColor: 'var(--ds-brand-50)',
                  color: 'var(--ds-brand-700)',
                  fontSize: 'var(--ds-text-xs)',
                  fontWeight: 'var(--ds-weight-medium)',
                }}>
                  {t}
                </span>
              ))}
              {program.service_tags.length > 4 && (
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 'var(--ds-radius-full)',
                  backgroundColor: 'var(--ds-neutral-100)',
                  color: 'var(--ds-text-tertiary)',
                  fontSize: 'var(--ds-text-xs)',
                }}>
                  +{program.service_tags.length - 4}
                </span>
              )}
            </div>
          )}

          <ContactForm
            providerId={program.provider_id}
            providerName={program.name}
            providerEmail={program.email ?? null}
            languageTags={program.language_tags}
          />
        </div>
      </div>
    </div>
  )
}
