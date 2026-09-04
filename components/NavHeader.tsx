import Link from 'next/link'

interface NavHeaderProps {
  cityName: string
  slug?: string
  /** Client's own logo — when set, replaces the plain-text city name. */
  logoUrl?: string | null
}

export function NavHeader({ cityName, slug, logoUrl }: NavHeaderProps) {
  const href = slug ? `/${slug}` : '/'

  return (
    <header style={{
      backgroundColor: 'var(--ds-bg-default)',
      borderBottom: '1px solid var(--ds-border-default)',
    }}>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto',
        padding: '0 var(--ds-space-6)',
        height: '56px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <nav aria-label="Site navigation">
          <Link
            href={href}
            aria-label={`${cityName} services — home`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--ds-space-3)',
              textDecoration: 'none',
              borderRadius: '4px',
            }}
          >
            <img
              src="/brand/logo/commonreach-logo.svg"
              alt="CommonReach"
              height={22}
              style={{ display: 'block' }}
            />
            {cityName && (
              <>
                <span style={{
                  width: '1px',
                  height: '16px',
                  backgroundColor: 'var(--ds-border-strong)',
                  flexShrink: 0,
                }} aria-hidden="true" />
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={cityName}
                    height={32}
                    style={{ display: 'block', maxHeight: '32px', width: 'auto' }}
                  />
                ) : (
                  <span style={{
                    fontSize: 'var(--ds-text-sm)',
                    fontWeight: 'var(--ds-weight-regular)',
                    color: 'var(--ds-text-secondary)',
                    fontFamily: 'var(--ds-font-sans)',
                  }}>
                    {cityName}
                  </span>
                )}
              </>
            )}
          </Link>
        </nav>

        <span className="hidden sm:block" style={{
          fontSize: 'var(--ds-text-xs)',
          color: 'var(--ds-text-tertiary)',
          fontFamily: 'var(--ds-font-sans)',
        }}>
          Find community services and resources
        </span>

      </div>

      <style>{`
        nav a:focus-visible {
          outline: 2px solid #356A57;
          outline-offset: 3px;
        }
      `}</style>
    </header>
  )
}
