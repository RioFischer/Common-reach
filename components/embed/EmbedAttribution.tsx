import Image from 'next/image'

export function EmbedAttribution() {
  return (
    <footer
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '12px var(--ds-space-6)',
        borderTop: '1px solid var(--ds-border-subtle)',
        backgroundColor: 'var(--ds-bg-subtle)',
      }}
    >
      <Image
        src="/brand/logo/commonreach-mark.svg"
        alt="CommonReach"
        width={18}
        height={18}
        style={{ display: 'block', opacity: 0.7 }}
      />
      <span style={{
        fontSize: 'var(--ds-text-xs)',
        fontWeight: 'var(--ds-weight-semibold)',
        color: 'var(--ds-text-secondary)',
        fontFamily: 'var(--ds-font-sans)',
        letterSpacing: '0.02em',
      }}>
        CommonReach
      </span>
      <span style={{
        fontSize: 'var(--ds-text-xs)',
        color: 'var(--ds-text-tertiary)',
        fontFamily: 'var(--ds-font-sans)',
      }}>
        powered by
      </span>
      <Image
        src="/brand/logo/upriver-logo.svg"
        alt="Upriver"
        width={28}
        height={28}
        style={{ display: 'block', opacity: 0.75 }}
      />
    </footer>
  )
}
