'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { searchProviders } from '@/lib/api'
import { useSearch } from '@/hooks/useSearch'
import { SearchBar } from './SearchBar'
import { FilterPanel, filterActiveCount } from './FilterPanel'
import { TaxonomyBrowser } from './TaxonomyBrowser'
import { TaxonomyWizard } from '@/components/TaxonomyWizard'
import { ResultCard } from './ResultCard'
import { ProgramResultCard } from './ProgramResultCard'
import { InlineChat } from './InlineChat'
import dynamic from 'next/dynamic'

const ProviderMap = dynamic(() => import('./ProviderMap').then(m => m.ProviderMap), { ssr: false })
import type { Client, SearchFilterSchema, SearchResult } from '@/lib/types'

// ── Location Pill ─────────────────────────────────────────────────────────────

const RADIUS_OPTIONS = [5, 10, 25, 50] as const

function LocationPill({
  label,
  radiusMiles,
  zipCode,
  hasGeo,
  geoLoading,
  geoError,
  onZipChange,
  onRequestGeo,
  onClearGeo,
  onRadiusChange,
}: {
  label: string | null
  radiusMiles: number
  zipCode: string
  hasGeo: boolean
  geoLoading: boolean
  geoError: string | null
  onZipChange: (zip: string) => void
  onRequestGeo: () => void
  onClearGeo: () => void
  onRadiusChange: (miles: number) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = hasGeo || zipCode.length === 5

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '7px 12px',
          borderRadius: 'var(--ds-radius-md)',
          border: `1px solid ${isActive ? 'var(--ds-brand-300)' : 'var(--ds-border-strong)'}`,
          backgroundColor: isActive ? 'var(--ds-brand-50)' : 'var(--ds-bg-default)',
          color: isActive ? 'var(--ds-brand-700)' : 'var(--ds-neutral-700)',
          fontSize: 'var(--ds-text-sm)',
          fontWeight: isActive ? 600 : 400,
          cursor: 'pointer',
          fontFamily: 'var(--ds-font-sans)',
          whiteSpace: 'nowrap',
          boxShadow: 'var(--ds-shadow-sm)',
          transition: 'all 0.15s',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
        {label ?? 'Filter by location'}
        {isActive && (
          <span
            onClick={e => { e.stopPropagation(); hasGeo ? onClearGeo() : onZipChange('') }}
            style={{ display: 'flex', alignItems: 'center', color: 'var(--ds-brand-400)', marginLeft: '2px' }}
            aria-label="Clear location"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M1.5 1.5 10.5 10.5M10.5 1.5 1.5 10.5" />
            </svg>
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M2 4l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          right: 0,
          width: '260px',
          backgroundColor: 'var(--ds-bg-default)',
          border: '1px solid var(--ds-border-default)',
          borderRadius: 'var(--ds-radius-lg)',
          boxShadow: 'var(--ds-shadow-lg)',
          padding: 'var(--ds-space-4)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--ds-space-3)',
        }}>
          <p style={{ fontSize: 'var(--ds-text-xs)', fontWeight: 600, color: 'var(--ds-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
            Location
          </p>

          {/* Zip input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: 'var(--ds-text-xs)', fontWeight: 500, color: 'var(--ds-text-secondary)' }}>
              Zip code
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="e.g. 01720"
              value={zipCode}
              onChange={e => onZipChange(e.target.value)}
              disabled={hasGeo}
              style={{
                height: '36px',
                padding: '0 var(--ds-space-3)',
                fontSize: 'var(--ds-text-sm)',
                fontFamily: 'var(--ds-font-sans)',
                color: 'var(--ds-text-primary)',
                backgroundColor: hasGeo ? 'var(--ds-bg-muted)' : 'var(--ds-bg-default)',
                border: '1px solid var(--ds-border-strong)',
                borderRadius: 'var(--ds-radius-md)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-2)' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-border-subtle)' }} />
            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>or</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--ds-border-subtle)' }} />
          </div>

          {/* GPS button */}
          <button
            type="button"
            onClick={() => { if (!hasGeo && !geoLoading) { onRequestGeo(); setOpen(false) } }}
            disabled={geoLoading || hasGeo}
            style={{
              width: '100%',
              height: '36px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--ds-space-2)',
              backgroundColor: hasGeo ? 'var(--ds-brand-50)' : 'var(--ds-bg-default)',
              color: hasGeo ? 'var(--ds-brand-600)' : 'var(--ds-text-secondary)',
              border: `1px solid ${hasGeo ? 'var(--ds-brand-300)' : 'var(--ds-border-strong)'}`,
              borderRadius: 'var(--ds-radius-md)',
              fontSize: 'var(--ds-text-sm)',
              fontWeight: 500,
              fontFamily: 'var(--ds-font-sans)',
              cursor: hasGeo || geoLoading ? 'default' : 'pointer',
              opacity: geoLoading ? 0.6 : 1,
            }}
          >
            {geoLoading ? 'Locating…' : hasGeo ? '✓ Using your location' : 'Use my location'}
          </button>

          {geoError && (
            <p style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-error-base)', margin: 0 }}>{geoError}</p>
          )}

          {/* Radius */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)' }}>Radius</span>
            <select
              value={radiusMiles}
              onChange={e => onRadiusChange(Number(e.target.value))}
              style={{
                height: '32px',
                padding: '0 var(--ds-space-2)',
                fontSize: 'var(--ds-text-sm)',
                fontFamily: 'var(--ds-font-sans)',
                color: 'var(--ds-text-primary)',
                backgroundColor: 'var(--ds-bg-default)',
                border: '1px solid var(--ds-border-strong)',
                borderRadius: 'var(--ds-radius-md)',
                cursor: 'pointer',
              }}
            >
              {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} miles</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

interface TaxonomySearchClientProps {
  client: Client
  schema: SearchFilterSchema
  slug: string
  embedMode?: boolean
}

export function TaxonomySearchClient({ client, schema, slug, embedMode = false }: TaxonomySearchClientProps) {
  const { state, setFilter, setFilters, toggleTag, clearFilters, toApiParams } =
    useSearch(client.id)
  const pushFilters = setFilters

  // ── Local keyword input (debounced) ────────────────────────────────────
  const [localQ, setLocalQ] = useState(state.q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setLocalQ(state.q) }, [state.q])

  const handleQueryChange = useCallback(
    (q: string) => {
      setLocalQ(q)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        if (q) setFilters({ q, browse: '', serviceTagIds: [] })
        else setFilters({ q: '', browse: '', serviceTagIds: [] })
      }, 400)
    },
    [setFilter],
  )

  // ── Geolocation ────────────────────────────────────────────────────────
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const handleRequestGeo = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setGeoLoading(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGeoLoading(false)
        setFilters({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          zipCode: '',
          sortBy: 'distance',
        })
      },
      err => {
        setGeoLoading(false)
        setGeoError(
          err.code === 1
            ? 'Location access denied. Please allow location or enter a zip code.'
            : 'Unable to retrieve your location.',
        )
      },
      { timeout: 10_000 },
    )
  }, [setFilters])

  const handleClearGeo = useCallback(() => {
    setGeoError(null)
    setFilters({ lat: null, lng: null })
  }, [setFilters])

  // ── View toggle ────────────────────────────────────────────────────────
  const [view, setView] = useState<'list' | 'map'>('list')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // ── Search API ─────────────────────────────────────────────────────────
  const [results, setResults] = useState<SearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Domain-availability results: same params but WITHOUT domain filter.
  // Used to determine which domain buttons are inactive — avoids the bug
  // where selecting a domain makes all other domains go inactive.
  const [availabilityResults, setAvailabilityResults] = useState<SearchResult | null>(null)

  const effectivePageSize = 100
  const apiParams = { ...toApiParams(), page_size: effectivePageSize }
  const paramsKey = JSON.stringify(apiParams)

  // Strip domain/subcategory for availability check
  const availabilityParams = { ...toApiParams(), domain: undefined, subcategory: undefined, page_size: effectivePageSize }
  const availabilityKey = JSON.stringify(availabilityParams)

  useEffect(() => {
    if (!client.id) return
    const controller = new AbortController()
    setSearchLoading(true)
    setSearchError(null)

    // Debounce: wait 400ms before firing so rapid filter clicks coalesce
    const timer = setTimeout(() => {
      searchProviders(apiParams)
        .then(data => {
          if (!controller.signal.aborted) {
            setResults(data)
            setSearchLoading(false)
          }
        })
        .catch(err => {
          if (!controller.signal.aborted) {
            setSearchError(err?.message ?? 'Search failed. Please try again.')
            setSearchLoading(false)
          }
        })
    }, 400)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, client.id])

  // Separate availability search — only re-fires when non-domain params change
  useEffect(() => {
    if (!client.id) return
    const controller = new AbortController()
    const timer = setTimeout(() => {
      searchProviders(availabilityParams)
        .then(data => { if (!controller.signal.aborted) setAvailabilityResults(data) })
        .catch(() => {})
    }, 400)
    return () => { clearTimeout(timer); controller.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availabilityKey, client.id])

  // ── Age label map (for display in chips) ────────────────────────────────
  const AGE_LABEL_MAP: Record<string, string> = {
    '0–5': 'Infants & Young Children (0–5)',
    '6–12': 'School Age (6–12)',
    '13–17': 'Teens (13–17)',
    '18–35': 'Young Adults (18–35)',
    '35–65': 'Adults (35–65)',
    '65+': 'Seniors (65+)',
  }

  // ── Active filter chips (all filters, not just search) ──────────────────
  const activeChips: { label: string; onRemove: () => void }[] = []
  if (state.q) {
    activeChips.push({ label: `"${state.q}"`, onRemove: () => setFilters({ q: '', browse: '', serviceTagIds: [] }) })
  }
  for (const tag of state.serviceTags) {
    activeChips.push({ label: tag, onRemove: () => toggleTag('serviceTags', tag) })
  }
  for (const tag of state.populationTags) {
    activeChips.push({ label: tag, onRemove: () => toggleTag('populationTags', tag) })
  }
  for (const tag of state.ageTags) {
    activeChips.push({ label: AGE_LABEL_MAP[tag] ?? tag, onRemove: () => toggleTag('ageTags', tag) })
  }
  for (const tag of state.languageTags) {
    activeChips.push({ label: tag, onRemove: () => toggleTag('languageTags', tag) })
  }

  return (
    <div>
      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 'var(--ds-space-4)' }}>
        <h1 style={{
          fontSize: 'var(--ds-text-2xl)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: 'var(--ds-brand-800)',
          marginBottom: 'var(--ds-space-1)',
          fontFamily: 'var(--font-family-h1)',
          lineHeight: 1.15,
        }}>
          What are you looking for today?
        </h1>
      </div>

      {/* ── PRIMARY: Inline chat ─────────────────────────────────────────── */}
      <InlineChat
        clientId={client.id}
        slug={slug}
        onHasMessages={() => {}}
      />

      {/* ── Progressive reveal: keyword search ──────────────────────────── */}
      {searchOpen && (
        <div style={{ marginTop: 'var(--ds-space-3)' }}>
          <SearchBar
            q={localQ}
            zipCode={state.zipCode}
            hasGeo={state.lat !== null}
            geoLoading={geoLoading}
            geoError={geoError}
            radiusMiles={state.radiusMiles}
            onQueryChange={handleQueryChange}
            onZipChange={zip => setFilters({ zipCode: zip, lat: null, lng: null })}
            onRequestGeo={handleRequestGeo}
            onClearGeo={handleClearGeo}
            onRadiusChange={r => setFilter('radiusMiles', r)}
            onSubmit={() => setFilter('q', localQ)}
            hideLocation
          />
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────────── */}
      {searchError && (
        <div
          role="alert"
          style={{
            marginTop: 'var(--ds-space-3)',
            padding: 'var(--ds-space-3) var(--ds-space-4)',
            backgroundColor: 'var(--ds-error-light)',
            borderLeft: '3px solid var(--ds-error-base)',
            borderRadius: 'var(--ds-radius-lg)',
            fontSize: 'var(--ds-text-sm)',
            color: 'var(--ds-error-base)',
          }}
        >
          {searchError}
        </div>
      )}

      {/* ── Section header: Browse + secondary controls ───────────────────── */}
      <div style={{ marginTop: 'var(--ds-space-6)', marginBottom: 'var(--ds-space-3)' }}>

        {/* Row: title + view toggle */}
        <div className="flex flex-col gap-2 mb-2 min-[500px]:flex-row min-[500px]:items-center min-[500px]:justify-between">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--ds-space-3)', minWidth: 0 }}>
            <h2 style={{
              fontSize: 'var(--ds-text-base)',
              fontWeight: 'var(--ds-weight-semibold)',
              color: 'var(--ds-text-primary)',
              fontFamily: 'var(--ds-font-sans)',
            }}>
              Browse services
            </h2>
            {results && (
              <span style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)' }}>
                {results.total.toLocaleString()} provider{results.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Right: Search toggle + Filters button + view toggle */}
          <div className="flex items-center gap-2 flex-wrap">

          {/* Search toggle button */}
          <button
            type="button"
            aria-label={searchOpen ? 'Hide keyword search' : 'Show keyword search'}
            aria-pressed={searchOpen}
            onClick={() => setSearchOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 34, height: 34,
              borderRadius: 'var(--ds-radius-md)',
              border: `1px solid ${searchOpen ? 'var(--ds-brand-400)' : 'var(--ds-border-strong)'}`,
              backgroundColor: searchOpen ? 'var(--ds-brand-50)' : 'var(--ds-bg-default)',
              color: searchOpen ? 'var(--ds-brand-700)' : 'var(--ds-neutral-600)',
              cursor: 'pointer',
              boxShadow: 'var(--ds-shadow-sm)',
              transition: 'all 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="4.5"/>
              <path d="M10.5 10.5 14 14"/>
            </svg>
          </button>

          {/* Filters button */}
          {(() => {
            const count = filterActiveCount({ activePopulationTags: state.populationTags, activeAgeTags: state.ageTags, activeLanguageTags: state.languageTags, hasGeo: state.lat !== null, zipCode: state.zipCode })
            return (
              <button
                type="button"
                onClick={() => setFiltersOpen(o => !o)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '6px 12px',
                  borderRadius: 'var(--ds-radius-md)',
                  border: `1px solid ${count > 0 ? 'var(--ds-brand-300)' : filtersOpen ? 'var(--ds-brand-400)' : 'var(--ds-border-strong)'}`,
                  backgroundColor: count > 0 ? 'var(--ds-brand-50)' : filtersOpen ? 'var(--ds-neutral-50)' : 'var(--ds-bg-default)',
                  color: count > 0 ? 'var(--ds-brand-700)' : 'var(--ds-neutral-700)',
                  fontSize: 'var(--ds-text-sm)', fontWeight: count > 0 ? 600 : 400,
                  cursor: 'pointer', fontFamily: 'var(--ds-font-sans)', whiteSpace: 'nowrap',
                  boxShadow: 'var(--ds-shadow-sm)', transition: 'all 0.15s',
                }}
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <line x1="2" y1="4" x2="14" y2="4"/><line x1="4" y1="8" x2="12" y2="8"/><line x1="6" y1="12" x2="10" y2="12"/>
                </svg>
                Filters
                {count > 0 && (
                  <span style={{ backgroundColor: 'var(--ds-brand-600)', color: 'white', borderRadius: 'var(--ds-radius-full)', padding: '0 5px', fontSize: 'var(--ds-text-2xs)', fontWeight: 700, minWidth: '16px', textAlign: 'center' }}>
                    {count}
                  </span>
                )}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
                  style={{ transition: 'transform 0.2s', transform: filtersOpen ? 'rotate(180deg)' : 'none' }}>
                  <path d="M2 4l4 4 4-4"/>
                </svg>
              </button>
            )
          })()}

          {/* View segment control */}
          <div style={{
            display: 'inline-flex',
            border: '1px solid var(--ds-border-strong)',
            borderRadius: 'var(--ds-radius-md)',
            overflow: 'hidden',
            boxShadow: 'var(--ds-shadow-sm)',
          }}>
            {(['list', 'map'] as const).map((v, i) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                aria-pressed={view === v}
                style={{
                  padding: '6px 14px',
                  fontSize: 'var(--ds-text-sm)',
                  fontWeight: view === v ? 600 : 400,
                  fontFamily: 'var(--ds-font-sans)',
                  cursor: 'pointer',
                  border: 'none',
                  borderLeft: i > 0 ? '1px solid var(--ds-border-strong)' : 'none',
                  backgroundColor: view === v ? 'var(--ds-brand-600)' : 'var(--ds-bg-default)',
                  color: view === v ? 'white' : 'var(--ds-neutral-600)',
                  transition: 'background-color 0.15s, color 0.15s',
                  outline: 'none',
                }}
                onMouseEnter={e => { if (view !== v) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ds-neutral-50)' }}
                onMouseLeave={e => { if (view !== v) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ds-bg-default)' }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {v === 'list' ? (
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <rect x="1" y="2" width="12" height="2" rx="1"/>
                      <rect x="1" y="6" width="12" height="2" rx="1"/>
                      <rect x="1" y="10" width="12" height="2" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
                      <path d="M7 1C4.24 1 2 3.24 2 6c0 3.94 5 7 5 7s5-3.06 5-7c0-2.76-2.24-5-5-5zm0 6.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3z"/>
                    </svg>
                  )}
                  {v === 'list' ? 'List' : 'Map'}
                </span>
              </button>
            ))}
          </div>{/* view toggle */}
          </div>{/* right side */}
        </div>{/* title row */}

        {/* Full-width filter panel — expands to left margin */}
        <FilterPanel
          open={filtersOpen}
          schema={schema}
          activeServiceTags={state.serviceTags}
          activePopulationTags={state.populationTags}
          activeAgeTags={state.ageTags}
          activeLanguageTags={state.languageTags}
          filterCounts={results?.filter_counts}
          onToggleService={tag => toggleTag('serviceTags', tag)}
          onTogglePopulation={tag => toggleTag('populationTags', tag)}
          onToggleAge={tag => toggleTag('ageTags', tag)}
          onToggleLanguage={tag => toggleTag('languageTags', tag)}
          onClearAll={clearFilters}
          radiusMiles={state.radiusMiles}
          zipCode={state.zipCode}
          hasGeo={state.lat !== null}
          geoLoading={geoLoading}
          geoError={geoError}
          onZipChange={zip => setFilters({ zipCode: zip, lat: null, lng: null })}
          onRequestGeo={handleRequestGeo}
          onClearGeo={handleClearGeo}
          onRadiusChange={r => setFilter('radiusMiles', r)}
        />
      </div>{/* section */}

      {/* ── Active filter chips ───────────────────────────────────────────── */}
      {activeChips.length > 0 && (
        <div style={{ marginBottom: 'var(--ds-space-3)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--ds-space-2)' }}>
          {activeChips.map(chip => (
            <button
              key={chip.label}
              type="button"
              onClick={chip.onRemove}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: 'var(--ds-radius-full)',
                border: '1px solid var(--ds-brand-300)',
                backgroundColor: 'var(--ds-brand-50)',
                color: 'var(--ds-brand-700)',
                fontSize: 'var(--ds-text-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--ds-font-sans)',
                whiteSpace: 'nowrap',
              }}
              aria-label={`Remove ${chip.label} filter`}
            >
              {chip.label}
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="var(--ds-brand-400)" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M1.5 1.5 8.5 8.5M8.5 1.5 1.5 8.5" />
              </svg>
            </button>
          ))}
          <button
            type="button"
            onClick={clearFilters}
            style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-neutral-500)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--ds-font-sans)', textDecoration: 'underline' }}
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────── */}
      {view === 'map' && (
        <ProviderMap
          providers={results?.results ?? []}
          userLat={state.lat}
          userLng={state.lng}
          cityLat={schema.city_center_lat ?? null}
          cityLng={schema.city_center_lng ?? null}
          slug={slug}
          clientId={client.id}
        />
      )}

      {view === 'list' && state.q && (
        <>
          {searchLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} style={{ height: '96px', borderRadius: 'var(--ds-radius-lg)', backgroundColor: 'var(--ds-bg-muted)', animation: 'pulse 1.5s ease-in-out infinite' }} />
              ))}
            </div>
          )}
          {!searchLoading && (results?.results ?? []).length === 0 && (
            <div style={{ padding: 'var(--ds-space-8) var(--ds-space-4)', textAlign: 'center', color: 'var(--ds-text-tertiary)', fontSize: 'var(--ds-text-sm)' }}>
              No results found for &ldquo;{state.q}&rdquo;.
            </div>
          )}
          {!searchLoading && (results?.results ?? []).length > 0 && (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-2)' }}>
              {(results?.results ?? []).map(item => (
                <li key={item.id}>
                  {item.type === 'program'
                    ? <ProgramResultCard program={item} clientId={client.id} slug={slug} embedMode={embedMode} />
                    : <ResultCard provider={item} clientId={client.id} slug={slug} embedMode={embedMode} />}
                </li>
              ))}
            </ol>
          )}
        </>
      )}

      {view === 'list' && !state.q && (
        <TaxonomyWizard
          clientSlug={slug}
          clientId={client.id}
          results={results?.results ?? []}
          total={results?.total ?? 0}
          isLoading={searchLoading}
          browse={state.browse}
          pushFilters={pushFilters}
          setFilters={setFilters}
          embedMode={embedMode}
          onServiceTagSelect={(tagIds, _nodeLabel) => {
            setFilters({ serviceTagIds: tagIds })
          }}
        />
      )}
    </div>
  )
}
