// @ts-nocheck — legacy file superseded by TaxonomySearchClient, kept for reference
'use client'

/**
 * Main search orchestrator — client component.
 * Sits inside a <Suspense> boundary in the page so it can call useSearchParams().
 *
 * Responsibilities:
 *   - Reads/writes all filter state via useSearch (URL params)
 *   - Maintains a debounced local copy of the keyword input
 *   - Fires API calls on every filter change; cancels stale requests
 *   - Owns the geolocation flow (browser API → lat/lng → URL)
 *   - Renders SearchBar, FilterPanel (collapsible on mobile), ResultsList
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { searchProviders } from '@/lib/api'
import { useSearch } from '@/hooks/useSearch'
import { FilterPanel } from './FilterPanel'
import { ResultsList } from './ResultsList'
import { SearchBar } from './SearchBar'
import type { SearchFilterSchema, SearchResult } from '@/lib/types'

interface SearchClientProps {
  clientId: string
  schema: SearchFilterSchema
}

export function SearchClient({ clientId, schema }: SearchClientProps) {
  const { state, setFilter, setFilters, toggleTag, clearFilters, toApiParams } =
    useSearch(clientId)

  // ── Local keyword input (debounced before hitting URL) ──────────────────
  const [localQ, setLocalQ] = useState(state.q)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep localQ in sync when navigating back/forward
  useEffect(() => { setLocalQ(state.q) }, [state.q])

  const handleQueryChange = useCallback(
    (q: string) => {
      setLocalQ(q)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => setFilter('q', q), 400)
    },
    [setFilter],
  )

  // ── Geolocation ─────────────────────────────────────────────────────────
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
          zipCode: '',    // clear zip when geo coords are set
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

  // ── Search API calls ─────────────────────────────────────────────────────
  const [results, setResults] = useState<SearchResult | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Stringify params so the effect dependency is stable
  const paramsKey = JSON.stringify(toApiParams())

  useEffect(() => {
    if (!clientId) return
    const controller = new AbortController()
    setSearchLoading(true)
    setSearchError(null)

    searchProviders(toApiParams())
      .then(data => {
        if (!controller.signal.aborted) {
          setResults(data)
          setSearchLoading(false)
        }
      })
      .catch(err => {
        if (!controller.signal.aborted) {
          setSearchError(
            err?.message ?? 'Search failed. Please try again.',
          )
          setSearchLoading(false)
        }
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, clientId])

  // ── Mobile filter drawer ─────────────────────────────────────────────────
  const [filtersOpen, setFiltersOpen] = useState(false)
  // Ref used to move focus into the panel when it opens (WCAG 2.4.3)
  const filterPanelHeadingRef = useRef<HTMLHeadingElement>(null)
  // Ref to restore focus to the toggle button when panel closes
  const filterToggleRef = useRef<HTMLButtonElement>(null)

  const toggleFilters = useCallback((open: boolean) => {
    setFiltersOpen(open)
    if (open) {
      // Move focus to panel heading on next paint (WCAG 2.4.3 Focus Order)
      requestAnimationFrame(() => filterPanelHeadingRef.current?.focus())
    } else {
      // Restore focus to toggle button when panel closes
      requestAnimationFrame(() => filterToggleRef.current?.focus())
    }
  }, [])

  // Close filter panel on Escape key (WCAG 2.1.1 Keyboard)
  useEffect(() => {
    if (!filtersOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleFilters(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [filtersOpen, toggleFilters])

  const hasActiveFilters =
    !!state.domain ||
    !!state.subcategory ||
    state.serviceTags.length > 0 ||
    state.populationTags.length > 0 ||
    state.languageTags.length > 0 ||
    state.insuranceTags.length > 0

  const activeFilterCount = [
    state.domain,
    state.subcategory,
    ...state.serviceTags,
    ...state.populationTags,
    ...state.languageTags,
    ...state.insuranceTags,
  ].filter(Boolean).length

  return (
    <div>
      {/*
        WCAG 2.4.6 — Page titled / Headings and Labels
        A visually hidden h1 gives the page a proper heading hierarchy.
        The FilterPanel h2 "Filters" now has a logical parent.
      */}
      <h1 className="sr-only">
        {schema.client_id ? 'Provider search' : 'Find civic service providers'}
      </h1>

      {/* Skip link target for mobile filter panel (WCAG 2.4.1) */}
      <a href="#filter-panel" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-2 focus:bg-primary focus:text-primary-foreground rounded">
        Skip to filters
      </a>

      {/* ── Search bar ─────────────────────────────────────────────────── */}
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
      />

      {/* ── Mobile filter toggle ────────────────────────────────────────── */}
      <div className="mt-4 flex items-center justify-between lg:hidden">
        <button
          ref={filterToggleRef}
          type="button"
          onClick={() => toggleFilters(!filtersOpen)}
          aria-expanded={filtersOpen}
          aria-controls="filter-panel"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path d="M1 3h14v1.5L9 10v5l-2-1V10L1 4.5V3z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground"
              aria-label={`${activeFilterCount} active filter${activeFilterCount !== 1 ? 's' : ''}`}
            >
              {/* Number is hidden from AT; aria-label on the span provides the full label */}
              <span aria-hidden="true">{activeFilterCount}</span>
            </span>
          )}
        </button>
        {results && (
          /*
            WCAG 4.1.3 — duplicate aria-live suppressed.
            ResultsList already has an aria-live region for result count.
            This visible-only copy adds aria-hidden so AT hears only one announcement.
          */
          <p className="text-sm text-muted-foreground" aria-hidden="true">
            {results.total.toLocaleString()} result{results.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────── */}
      <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Filter sidebar */}
        <div
          id="filter-panel"
          className={[
            'w-full lg:w-64 lg:shrink-0',
            filtersOpen ? 'block' : 'hidden lg:block',
          ].join(' ')}
        >
          {/* Mobile close button — only rendered when drawer is open (WCAG 2.1.1) */}
          {filtersOpen && (
            <div className="mb-2 flex items-center justify-between lg:hidden">
              <span
                ref={filterPanelHeadingRef}
                tabIndex={-1}
                className="text-sm font-semibold text-foreground focus-visible:outline-none"
              >
                Filters
              </span>
              <button
                type="button"
                onClick={() => toggleFilters(false)}
                className="rounded p-1 text-sm text-muted-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
          )}
          <FilterPanel
            schema={schema}
            activeServiceTags={state.serviceTags}
            activePopulationTags={state.populationTags}
            activeAgeTags={state.ageTags}
            activeLanguageTags={state.languageTags}
            onToggleService={tag => toggleTag('serviceTags', tag)}
            onTogglePopulation={tag => toggleTag('populationTags', tag)}
            onToggleAge={tag => toggleTag('ageTags', tag)}
            onToggleLanguage={tag => toggleTag('languageTags', tag)}
            onClearAll={clearFilters}
          />
        </div>

        {/* Results column */}
        <div className="min-w-0 flex-1">
          {searchError && (
            <div
              role="alert"
              className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error"
            >
              {searchError}
            </div>
          )}
          <ResultsList
            results={results?.results ?? []}
            total={results?.total ?? 0}
            page={state.page}
            pageSize={state.pageSize}
            clientId={clientId}
            isLoading={searchLoading}
            onPageChange={p => setFilter('page', p)}
          />
        </div>
      </div>
    </div>
  )
}
