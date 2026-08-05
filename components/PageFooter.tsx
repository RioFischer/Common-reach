'use client'

export function PageFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{
      borderTop: '1px solid var(--ds-border-default)',
      backgroundColor: 'var(--ds-bg-subtle)',
      padding: 'var(--ds-space-4) var(--ds-space-6)',
    }}>
      <div style={{
        maxWidth: '72rem',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--ds-space-2)',
      }}>
        <span style={{
          fontSize: 'var(--ds-text-xs)',
          color: 'var(--ds-text-tertiary)',
          fontFamily: 'var(--ds-font-sans)',
        }}>
          © {year} Civic Service Index
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--ds-space-4)',
        }}>
          {[
            { label: 'Accessibility', href: '#' },
            { label: 'Data sources', href: '#' },
            { label: 'Report an error', href: '#' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 'var(--ds-text-xs)',
                color: 'var(--ds-text-tertiary)',
                textDecoration: 'none',
                fontFamily: 'var(--ds-font-sans)',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-brand-600)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-text-tertiary)')}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}
