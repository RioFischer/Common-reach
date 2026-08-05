'use client'

import { useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import type { IconName } from '@/components/ui/Icon'

interface WizardCardProps {
  label: string
  labelUserFacing: string
  providerCount: number
  onClick: () => void
  hasChildren: boolean
  iconName?: IconName
}

export function WizardCard({
  label,
  labelUserFacing,
  providerCount,
  onClick,
  hasChildren,
  iconName,
}: WizardCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        textAlign: 'left',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--ds-space-3)',
        minHeight: '56px',
        padding: 'var(--ds-space-4) var(--ds-space-5)',
        backgroundColor: 'var(--ds-bg-default)',
        border: `1px solid ${hovered ? 'var(--ds-brand-300)' : 'var(--ds-border-default)'}`,
        borderRadius: 'var(--ds-radius-lg)',
        boxShadow: hovered ? 'var(--ds-shadow-md)' : 'var(--ds-shadow-sm)',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, border-color 0.15s',
        outline: 'none',
        fontFamily: 'var(--ds-font-sans)',
      }}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      {iconName && (
        <span style={{
          flexShrink: 0,
          color: hovered ? 'var(--ds-brand-600)' : 'var(--ds-brand-700)',
          transition: 'color 0.15s',
          display: 'flex',
          alignItems: 'center',
        }}>
          <Icon name={iconName} size={20} />
        </span>
      )}
      <span style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1 }}>
        <span style={{
          fontSize: 'var(--ds-text-sm)',
          fontWeight: 'var(--ds-weight-semibold)',
          color: 'var(--ds-text-primary)',
          lineHeight: 'var(--ds-leading-snug)',
        }}>
          {labelUserFacing}
        </span>
        {label !== labelUserFacing && (
          <span style={{
            fontSize: 'var(--ds-text-xs)',
            color: 'var(--ds-text-tertiary)',
          }}>
            {label}
          </span>
        )}
      </span>

      <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-2)', flexShrink: 0 }}>
        {providerCount > 0 && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            borderRadius: 'var(--ds-radius-full)',
            backgroundColor: 'var(--ds-brand-50)',
            color: 'var(--ds-brand-600)',
            fontSize: 'var(--ds-text-xs)',
            fontWeight: 'var(--ds-weight-semibold)',
          }}>
            {providerCount}
          </span>
        )}
        {hasChildren ? (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            style={{ color: hovered ? 'var(--ds-brand-400)' : 'var(--ds-neutral-400)' }}
          >
            <path
              fillRule="evenodd"
              d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <span style={{
            fontSize: 'var(--ds-text-xs)',
            fontWeight: 'var(--ds-weight-medium)',
            color: hovered ? 'var(--ds-brand-700)' : 'var(--ds-brand-600)',
          }}>
            View →
          </span>
        )}
      </span>
    </button>
  )
}
