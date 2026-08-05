'use client'

interface HoursDisplayProps {
  hours: string | null
}

export function HoursDisplay({ hours }: HoursDisplayProps) {
  if (!hours?.trim()) return null

  // Parse structured backend output: "Monday – Friday: 9:00 AM – 5:00 PM"
  const rows = hours
    .split('\n')
    .map(line => {
      const idx = line.indexOf(':')
      if (idx === -1) return null
      return { days: line.slice(0, idx).trim(), range: line.slice(idx + 1).trim() }
    })
    .filter(Boolean) as { days: string; range: string }[]

  if (rows.length === 0) return null

  return (
    <div style={{
      border: '1px solid var(--ds-border-default)',
      borderRadius: 'var(--ds-radius-lg)',
      overflow: 'hidden',
      fontFamily: 'var(--ds-font-sans)',
    }}>
      {rows.map(({ days, range }, i) => (
        <div key={i} style={{
          display: 'flex',
          gap: 'var(--ds-space-4)',
          padding: '12px 16px',
          borderBottom: i < rows.length - 1 ? '1px solid var(--ds-border-subtle)' : 'none',
        }}>
          <span style={{
            width: '160px',
            flexShrink: 0,
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 500,
            color: 'var(--ds-text-tertiary)',
            whiteSpace: 'nowrap',
          }}>
            {days}
          </span>
          <span style={{
            fontSize: 'var(--ds-text-sm)',
            color: 'var(--ds-text-primary)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {range}
          </span>
        </div>
      ))}
    </div>
  )
}
