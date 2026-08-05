/**
 * Resident-facing trust badges — "Data Verified" and "Community Verified".
 * Distinct from the existing green "Verified" badge (website_verified_at),
 * which tracks something else (automated website-scrape verification).
 * How a provider earns either badge isn't modeled yet — these are plain
 * flags set by CSI staff for now.
 */

interface TrustBadgesProps {
  dataVerified?: boolean
  communityVerified?: boolean
  /** Compact mode drops the label text on narrow cards, keeping just the icon. */
  compact?: boolean
}

function Badge({
  icon, label, lightVar, baseVar,
}: { icon: React.ReactNode; label: string; lightVar: string; baseVar: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: 'var(--ds-radius-full)',
        backgroundColor: `var(${lightVar})`,
        color: `var(${baseVar})`,
        fontSize: 'var(--ds-text-xs)',
        fontWeight: 'var(--ds-weight-medium)',
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </span>
  )
}

export function TrustBadges({ dataVerified, communityVerified, compact = false }: TrustBadgesProps) {
  if (!dataVerified && !communityVerified) return null

  return (
    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
      {dataVerified && (
        <Badge
          lightVar="--ds-info-light"
          baseVar="--ds-info-base"
          icon={
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M13.5 3.5 6 11 2.5 7.5l1-1L6 9l6.5-6.5 1 1z" />
            </svg>
          }
          label={compact ? 'Data' : 'Data Verified'}
        />
      )}
      {communityVerified && (
        <Badge
          lightVar="--ds-warning-light"
          baseVar="--ds-warning-base"
          icon={
            <svg width="11" height="11" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M5.5 7a2 2 0 100-4 2 2 0 000 4zm5 0a2 2 0 100-4 2 2 0 000 4zM0 13c0-2.2 2.5-4 5.5-4 .9 0 1.75.16 2.5.46A5.5 5.5 0 0110.5 9c3 0 5.5 1.8 5.5 4v1H0v-1z" />
            </svg>
          }
          label={compact ? 'Community' : 'Community Verified'}
        />
      )}
    </div>
  )
}
