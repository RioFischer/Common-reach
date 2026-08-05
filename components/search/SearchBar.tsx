'use client'

import { useId, useState } from 'react'

interface SearchBarProps {
  q: string
  zipCode: string
  hasGeo: boolean
  geoLoading: boolean
  geoError: string | null
  radiusMiles: number
  onQueryChange: (q: string) => void
  onZipChange: (zip: string) => void
  onRequestGeo: () => void
  onClearGeo: () => void
  onRadiusChange: (miles: number) => void
  onSubmit: () => void
  /** Hide the location rows — use when location is rendered separately */
  hideLocation?: boolean
}

const RADIUS_OPTIONS = [5, 10, 25, 50] as const

function DSInput({
  label,
  id,
  style,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; style?: React.CSSProperties }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label htmlFor={id} style={{
          fontSize: 'var(--ds-text-sm)',
          fontWeight: 'var(--ds-weight-medium)',
          color: 'var(--ds-text-secondary)',
        }}>
          {label}
        </label>
      )}
      <input
        id={id}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          height: '40px',
          padding: '0 var(--ds-space-3)',
          fontSize: 'var(--ds-text-sm)',
          fontFamily: 'var(--ds-font-sans)',
          color: 'var(--ds-text-primary)',
          backgroundColor: props.disabled ? 'var(--ds-bg-muted)' : 'var(--ds-bg-default)',
          border: `1px solid ${focused ? 'var(--ds-border-focus)' : 'var(--ds-border-strong)'}`,
          borderRadius: 'var(--ds-radius-lg)',
          outline: 'none',
          boxShadow: focused ? '0 0 0 3px var(--ds-brand-100)' : 'var(--ds-shadow-sm)',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          width: '100%',
          boxSizing: 'border-box',
          ...style,
        }}
        {...props}
      />
    </div>
  )
}

export function SearchBar({
  q,
  zipCode,
  hasGeo,
  geoLoading,
  geoError,
  radiusMiles,
  onQueryChange,
  onZipChange,
  onRequestGeo,
  onClearGeo,
  onRadiusChange,
  onSubmit,
  hideLocation = false,
}: SearchBarProps) {
  const geoId = useId()
  const radiusId = useId()
  const searchId = useId()
  const [searchFocused, setSearchFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>

      {/* Row 1: keyword search */}
      <form
        role="search"
        aria-label="Search providers"
        style={{ display: 'flex', gap: 'var(--ds-space-2)' }}
        onSubmit={e => { e.preventDefault(); onSubmit() }}
      >
        {/* Search input with inset icon */}
        <div style={{ position: 'relative', flex: 1 }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none',
              color: searchFocused ? 'var(--ds-brand-600)' : 'var(--ds-neutral-400)',
              transition: 'color 0.15s',
              zIndex: 1,
            }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            id={searchId}
            type="search"
            placeholder="Organisation name or service…"
            value={q}
            onChange={e => onQueryChange(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            autoComplete="off"
            aria-label="Search providers"
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '40px',
              paddingRight: 'var(--ds-space-4)',
              fontSize: 'var(--ds-text-sm)',
              fontFamily: 'var(--ds-font-sans)',
              color: 'var(--ds-text-primary)',
              backgroundColor: 'var(--ds-bg-default)',
              border: `1px solid ${searchFocused ? 'var(--ds-border-focus)' : 'var(--ds-border-strong)'}`,
              borderRadius: 'var(--ds-radius-lg)',
              outline: 'none',
              boxShadow: searchFocused ? '0 0 0 3px var(--ds-brand-100)' : 'var(--ds-shadow-sm)',
              transition: 'border-color 0.15s, box-shadow 0.15s',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          style={{
            alignSelf: 'flex-end',
            height: '44px',
            padding: '0 var(--ds-space-6)',
            backgroundColor: 'var(--ds-action-primary-bg)',
            color: 'var(--ds-action-primary-fg)',
            border: 'none',
            borderRadius: 'var(--ds-radius-lg)',
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 'var(--ds-weight-medium)',
            fontFamily: 'var(--ds-font-sans)',
            cursor: 'pointer',
            boxShadow: 'var(--ds-shadow-sm)',
            transition: 'background-color 0.15s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--ds-action-primary-bg-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--ds-action-primary-bg)')}
        >
          Search
        </button>
      </form>

      {/* Rows 2 + 3: location (hidden when hideLocation=true) */}
      {!hideLocation && <><div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: 'var(--ds-space-3)' }}>
        {/* Zip */}
        <div style={{ flex: '0 1 128px', minWidth: '110px' }}>
          <DSInput
            id={geoId}
            label="Zip code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{5}"
            maxLength={5}
            placeholder="01720"
            value={zipCode}
            onChange={e => onZipChange(e.target.value)}
            autoComplete="postal-code"
            disabled={hasGeo}
          />
        </div>

        <span style={{
          paddingBottom: '8px',
          fontSize: 'var(--ds-text-sm)',
          color: 'var(--ds-text-tertiary)',
        }}>
          or
        </span>

        {/* Use location button */}
        <button
          type="button"
          onClick={() => { if (!hasGeo && !geoLoading) onRequestGeo() }}
          disabled={geoLoading || hasGeo}
          style={{
            height: '40px',
            padding: '0 var(--ds-space-4)',
            backgroundColor: hasGeo ? 'var(--ds-brand-50)' : 'var(--ds-bg-default)',
            color: hasGeo ? 'var(--ds-brand-600)' : 'var(--ds-text-secondary)',
            border: `1px solid ${hasGeo ? 'var(--ds-brand-300)' : 'var(--ds-border-strong)'}`,
            borderRadius: 'var(--ds-radius-lg)',
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 'var(--ds-weight-medium)',
            fontFamily: 'var(--ds-font-sans)',
            cursor: geoLoading || hasGeo ? 'default' : 'pointer',
            opacity: geoLoading ? 0.6 : 1,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--ds-space-1-5 )',
            transition: 'border-color 0.15s, background-color 0.15s',
            boxSizing: 'border-box',
          }}
        >
          {geoLoading ? (
            <>
              <span
                style={{
                  width: '12px',
                  height: '12px',
                  border: '2px solid currentColor',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              Locating…
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Use my location
            </>
          )}
        </button>

        {/* Radius */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label htmlFor={radiusId} style={{
            fontSize: 'var(--ds-text-sm)',
            fontWeight: 'var(--ds-weight-medium)',
            color: 'var(--ds-text-secondary)',
          }}>
            Within
          </label>
          <select
            id={radiusId}
            value={radiusMiles}
            onChange={e => onRadiusChange(Number(e.target.value))}
            style={{
              height: '40px',
              padding: '0 var(--ds-space-3)',
              fontSize: 'var(--ds-text-sm)',
              fontFamily: 'var(--ds-font-sans)',
              color: 'var(--ds-text-primary)',
              backgroundColor: 'var(--ds-bg-default)',
              border: '1px solid var(--ds-border-strong)',
              borderRadius: 'var(--ds-radius-lg)',
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {RADIUS_OPTIONS.map(r => (
              <option key={r} value={r}>{r} miles</option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 3: location status */}
      <div style={{ minHeight: '24px', display: 'flex', alignItems: 'center' }}>
        {zipCode.length === 5 && !hasGeo && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ds-space-2)', fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)' }}>
            Searching within{' '}
            <strong style={{ color: 'var(--ds-text-primary)' }}>{radiusMiles} miles</strong> of{' '}
            <strong style={{ color: 'var(--ds-text-primary)' }}>{zipCode}</strong>
            <button
              type="button"
              onClick={() => onZipChange('')}
              style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-brand-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--ds-font-sans)' }}
              aria-label="Clear zip code"
            >
              Clear
            </button>
          </span>
        )}
        {hasGeo && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--ds-space-2)', fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--ds-brand-600)" aria-hidden="true">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
            Searching within{' '}
            <strong style={{ color: 'var(--ds-text-primary)' }}>{radiusMiles} miles</strong> from your location
            <button
              type="button"
              onClick={onClearGeo}
              style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-brand-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--ds-font-sans)' }}
              aria-label="Clear location"
            >
              Clear
            </button>
          </span>
        )}
        {geoError && (
          <p role="alert" style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-error-base)', margin: 0 }}>{geoError}</p>
        )}
      </div></>}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
