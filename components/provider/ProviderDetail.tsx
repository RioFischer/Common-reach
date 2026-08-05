'use client'

import { useState } from 'react'
import Link from 'next/link'
import { VerificationBadge } from './VerificationBadge'
import { ContactForm } from './ContactForm'
import { HoursDisplay } from './HoursDisplay'
import { TrustBadges } from '@/components/TrustBadges'
import type { ProviderCard } from '@/lib/types'

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  const core = digits.startsWith('1') ? digits.slice(1) : digits
  if (core.length !== 10) return phone
  return `+1 ${core.slice(0,3)}-${core.slice(3,6)}-${core.slice(6)}`
}

function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
}

interface ProviderDetailProps {
  provider: ProviderCard
  clientId: string
  slug?: string
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      margin: '0 0 var(--ds-space-3)',
      fontSize: 'var(--ds-text-xs)',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: 'var(--ds-text-tertiary)',
      fontFamily: 'var(--ds-font-sans)',
    }}>
      {children}
    </h2>
  )
}

function Tag({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: 'neutral' | 'brand' }) {
  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: 'var(--ds-radius-full)',
      backgroundColor: variant === 'brand' ? 'var(--ds-brand-50)' : 'var(--ds-neutral-100)',
      color: variant === 'brand' ? 'var(--ds-brand-600)' : 'var(--ds-text-secondary)',
      fontSize: 'var(--ds-text-xs)',
      fontWeight: 500,
      fontFamily: 'var(--ds-font-sans)',
    }}>
      {children}
    </span>
  )
}

export function ProviderDetail({ provider, clientId, slug }: ProviderDetailProps) {
  const [showMapLinks, setShowMapLinks] = useState(false)
  const backHref = slug ? `/${slug}/search` : `/search?client_id=${clientId}`

  return (
    <article aria-label={provider.name} style={{ maxWidth: '672px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-6)' }}>

      {/* Back */}
      <nav aria-label="Breadcrumb">
        <Link
          href={backHref}
          style={{
            fontSize: 'var(--ds-text-sm)',
            color: 'var(--ds-text-tertiary)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontFamily: 'var(--ds-font-sans)',
          }}
          onMouseOver={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
          onMouseOut={e => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
        >
          ← Back to results
        </Link>
      </nav>

      {/* Header */}
      <header>
        <h1 style={{ margin: 0, fontSize: 'var(--ds-text-2xl)', fontWeight: 700, color: 'var(--ds-text-primary)', fontFamily: 'var(--ds-font-sans)' }}>
          {provider.name}
        </h1>
        {provider.address && (
          <p style={{ margin: '4px 0 0', fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>
            {provider.address}
          </p>
        )}
      </header>

      {/* Verification */}
      <VerificationBadge
        status={provider.verification_status}
        confidenceScore={provider.confidence_score}
        lastVerifiedAt={provider.last_verified_at}
      />
      <TrustBadges dataVerified={provider.data_verified} communityVerified={provider.community_verified} />

      {/* Contact info */}
      <section aria-label="Contact information">
        <SectionHeading>Contact</SectionHeading>
        <div style={{
          border: '1px solid var(--ds-border-default)',
          borderRadius: 'var(--ds-radius-lg)',
          overflow: 'hidden',
          fontFamily: 'var(--ds-font-sans)',
        }}>
          {provider.phone && (
            <div style={{ display: 'flex', gap: 'var(--ds-space-4)', padding: '12px 16px', borderBottom: provider.website || provider.address ? '1px solid var(--ds-border-subtle)' : 'none' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: 'var(--ds-text-sm)', fontWeight: 500, color: 'var(--ds-text-tertiary)' }}>Phone</span>
              <a href={`tel:${provider.phone}`} style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-primary)', textDecoration: 'none' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--ds-text-primary)')}>
                {formatPhone(provider.phone)}
              </a>
            </div>
          )}
          {provider.website && (
            <div style={{ display: 'flex', gap: 'var(--ds-space-4)', padding: '12px 16px', borderBottom: provider.address ? '1px solid var(--ds-border-subtle)' : 'none' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: 'var(--ds-text-sm)', fontWeight: 500, color: 'var(--ds-text-tertiary)' }}>Website</span>
              <a href={provider.website} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-primary)', textDecoration: 'none', wordBreak: 'break-all' }}
                onMouseOver={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
                onMouseOut={e => (e.currentTarget.style.color = 'var(--ds-text-primary)')}>
                {provider.website} ↗
              </a>
            </div>
          )}
          {provider.address && (
            <div style={{ display: 'flex', gap: 'var(--ds-space-4)', padding: '12px 16px', position: 'relative' }}>
              <span style={{ width: '80px', flexShrink: 0, fontSize: 'var(--ds-text-sm)', fontWeight: 500, color: 'var(--ds-text-tertiary)' }}>Address</span>
              <div style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setShowMapLinks(v => !v)}
                  aria-expanded={showMapLinks}
                  style={{
                    background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                    fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-primary)',
                    fontFamily: 'var(--ds-font-sans)', textAlign: 'left',
                    textDecoration: 'underline', textDecorationStyle: 'dotted',
                    textUnderlineOffset: '2px',
                  }}
                  onMouseOver={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
                  onMouseOut={e => (e.currentTarget.style.color = 'var(--ds-text-primary)')}
                >
                  {provider.address}
                </button>
                {showMapLinks && (
                  <div role="dialog" aria-label="Navigation options" style={{
                    position: 'absolute', left: 0, top: 'calc(100% + 4px)', zIndex: 20,
                    display: 'flex', flexDirection: 'column', gap: '2px',
                    backgroundColor: 'var(--ds-bg-default)',
                    border: '1px solid var(--ds-border-default)',
                    borderRadius: 'var(--ds-radius-lg)',
                    boxShadow: 'var(--ds-shadow-md)',
                    padding: 'var(--ds-space-1)',
                    minWidth: '200px',
                  }}>
                    {[
                      { label: 'Open in Google Maps ↗', href: mapsUrl(provider.address) },
                      { label: 'Open in Apple Maps ↗', href: `https://maps.apple.com/?q=${encodeURIComponent(provider.address)}` },
                    ].map(({ label, href }) => (
                      <a key={label} href={href} target="_blank" rel="noopener noreferrer" style={{
                        display: 'block', padding: '8px 12px', whiteSpace: 'nowrap',
                        fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-primary)',
                        textDecoration: 'none', borderRadius: 'var(--ds-radius-md)',
                        fontFamily: 'var(--ds-font-sans)',
                      }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = 'var(--ds-neutral-50)')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact form */}
        <ContactForm
          providerId={provider.id}
          providerName={provider.name}
          providerEmail={provider.email ?? null}
          languageTags={provider.language_tags}
        />
      </section>

      {/* Hours */}
      {provider.hours && (
        <section aria-label="Hours of operation">
          <SectionHeading>Hours of operation</SectionHeading>
          <HoursDisplay hours={provider.hours} />
        </section>
      )}

      {/* Services */}
      {(provider.domains.length > 0 || provider.subcategories.length > 0 || provider.service_tags.length > 0) && (
        <section aria-label="Service categories and tags">
          <SectionHeading>Services</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
            {provider.domains.length > 0 && (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>Domain</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-space-1)' }}>
                  {provider.domains.map(d => <Tag key={d}>{d}</Tag>)}
                </div>
              </div>
            )}
            {provider.subcategories.length > 0 && (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>Categories</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-space-1)' }}>
                  {provider.subcategories.map(s => <Tag key={s}>{s}</Tag>)}
                </div>
              </div>
            )}
            {provider.service_tags.length > 0 && (
              <div>
                <p style={{ margin: '0 0 6px', fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>Service tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--ds-space-1)' }}>
                  {provider.service_tags.map(t => <Tag key={t} variant="brand">{t}</Tag>)}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Programs offered */}
      {provider.programs.length > 0 && (
        <section aria-label="Programs offered">
          <SectionHeading>Programs offered</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
            {provider.programs.map(program => (
              <Link
                key={program.id}
                href={slug ? `/program/${program.id}?slug=${slug}` : `/program/${program.id}?client_id=${clientId}`}
                style={{
                  display: 'block',
                  padding: '12px 16px',
                  border: '1px solid var(--ds-border-default)',
                  borderRadius: 'var(--ds-radius-lg)',
                  textDecoration: 'none',
                  fontFamily: 'var(--ds-font-sans)',
                }}
                onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--ds-border-strong)')}
                onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--ds-border-default)')}
              >
                <p style={{ margin: 0, fontSize: 'var(--ds-text-sm)', fontWeight: 600, color: 'var(--ds-text-primary)' }}>
                  {program.name}
                </p>
                {program.description && (
                  <p style={{ margin: '4px 0 0', fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)' }}>
                    {program.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
