import type { VerificationStatus } from '@/lib/types'

interface VerificationBadgeProps {
  status: VerificationStatus
  confidenceScore: number | null
  lastVerifiedAt: string | null
}

type StatusConfig = {
  label: string
  description: string
  dotColor: string
  badgeBg: string
  badgeColor: string
  borderColor: string
  bgColor: string
}

const STATUS_CONFIG: Record<VerificationStatus, StatusConfig> = {
  verified: {
    label: 'Verified',
    description: 'This provider has been verified by the Civic Service Index.',
    dotColor: 'var(--ds-success-500)',
    badgeBg: 'var(--ds-success-50)',
    badgeColor: 'var(--ds-success-700)',
    borderColor: 'var(--ds-success-200)',
    bgColor: 'var(--ds-success-50)',
  },
  pending: {
    label: 'Verification pending',
    description: 'Verification is currently in progress.',
    dotColor: 'var(--ds-warning-500)',
    badgeBg: 'var(--ds-warning-50)',
    badgeColor: 'var(--ds-warning-700)',
    borderColor: 'var(--ds-warning-200)',
    bgColor: 'var(--ds-warning-50)',
  },
  failed: {
    label: 'Verification failed',
    description: 'This provider could not be verified. Information may be out of date.',
    dotColor: 'var(--ds-error-500)',
    badgeBg: 'var(--ds-error-50)',
    badgeColor: 'var(--ds-error-700)',
    borderColor: 'var(--ds-error-200)',
    bgColor: 'var(--ds-error-50)',
  },
  unverified: {
    label: 'Not yet verified',
    description: 'This provider has not yet been verified.',
    dotColor: 'var(--ds-neutral-400)',
    badgeBg: 'var(--ds-neutral-100)',
    badgeColor: 'var(--ds-text-secondary)',
    borderColor: 'var(--ds-border-default)',
    bgColor: 'var(--ds-neutral-50)',
  },
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function confidenceLabel(score: number): string {
  if (score >= 0.8) return 'High confidence'
  if (score >= 0.5) return 'Moderate confidence'
  return 'Low confidence'
}

export function VerificationBadge({ status, confidenceScore, lastVerifiedAt }: VerificationBadgeProps) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.unverified

  return (
    <div
      role="region"
      aria-label="Verification status"
      style={{
        border: `1px solid ${cfg.borderColor}`,
        borderRadius: 'var(--ds-radius-lg)',
        backgroundColor: cfg.bgColor,
        padding: '12px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        fontFamily: 'var(--ds-font-sans)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '2px 10px',
          borderRadius: 'var(--ds-radius-full)',
          backgroundColor: cfg.badgeBg,
          color: cfg.badgeColor,
          fontSize: 'var(--ds-text-xs)',
          fontWeight: 600,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: cfg.dotColor,
            flexShrink: 0,
          }} />
          {cfg.label}
        </span>
        {confidenceScore !== null && (
          <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>
            {confidenceLabel(confidenceScore)} · {Math.round(confidenceScore * 100)}%
          </span>
        )}
      </div>
      <p style={{ margin: 0, fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-secondary)' }}>
        {cfg.description}
      </p>
      {lastVerifiedAt && (
        <p style={{ margin: 0, fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>
          Last verified: {formatDate(lastVerifiedAt)}
        </p>
      )}
    </div>
  )
}
