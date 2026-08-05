'use client'

/**
 * Manages all search filter state through URL query parameters.
 * No React state is used for filter values — the URL is the single source of truth.
 * This makes results shareable, bookmarkable, and correctly supports browser back/forward.
 *
 * Must be used inside a component wrapped in <Suspense> because it calls
 * useSearchParams(), which requires Suspense in the App Router.
 */

import { useCallback, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import type { SearchParams } from '@/lib/types'

export interface SearchState {
  clientId: string
  q: string
  zipCode: string
  lat: number | null
  lng: number | null
  radiusMiles: number
  domain: string
  subcategory: string
  browse: string
  serviceTagIds: string[]
  serviceTags: string[]
  populationTags: string[]
  languageTags: string[]
  insuranceTags: string[]
  ageTags: string[]
  sortBy: 'distance' | 'alphabetical' | 'recently_verified'
  page: number
  pageSize: number
}

export interface UseSearchReturn {
  state: SearchState
  /** Replace a single filter value and reset page to 1. */
  setFilter: (key: keyof SearchState, value: unknown) => void
  /** Atomically update multiple filter values at once, resetting page to 1. */
  setFilters: (overrides: Partial<SearchState>) => void
  /** Toggle a value in a multi-select list. */
  toggleTag: (
    key: 'serviceTags' | 'populationTags' | 'languageTags' | 'insuranceTags' | 'ageTags',
    value: string,
  ) => void
  /** Clear all filters except clientId. */
  clearFilters: () => void
  /** Convert state to API SearchParams, omitting empty/default values. */
  toApiParams: () => SearchParams
}

const DEFAULTS: Omit<SearchState, 'clientId'> = {
  q: '',
  zipCode: '',
  lat: null,
  lng: null,
  radiusMiles: 10,
  domain: '',
  subcategory: '',
  browse: '',
  serviceTagIds: [],
  serviceTags: [],
  populationTags: [],
  languageTags: [],
  insuranceTags: [],
  ageTags: [],
  sortBy: 'distance',
  page: 1,
  pageSize: 20,
}

function parseNullableFloat(raw: string | null): number | null {
  if (raw === null || raw === '') return null
  const n = parseFloat(raw)
  return isNaN(n) ? null : n
}

export function useSearch(clientId: string): UseSearchReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const state = useMemo<SearchState>(
    () => ({
      clientId,
      q:              searchParams.get('q') ?? DEFAULTS.q,
      zipCode:        searchParams.get('zip_code') ?? DEFAULTS.zipCode,
      lat:            parseNullableFloat(searchParams.get('lat')),
      lng:            parseNullableFloat(searchParams.get('lng')),
      radiusMiles:    Number(searchParams.get('radius_miles') ?? DEFAULTS.radiusMiles),
      domain:         searchParams.get('domain') ?? DEFAULTS.domain,
      subcategory:    searchParams.get('subcategory') ?? DEFAULTS.subcategory,
      browse:         searchParams.get('browse') ?? DEFAULTS.browse,
      serviceTagIds:  searchParams.getAll('service_tag_ids'),
      serviceTags:    searchParams.getAll('service_tags'),
      populationTags: searchParams.getAll('population_tags'),
      languageTags:   searchParams.getAll('language_tags'),
      insuranceTags:  searchParams.getAll('insurance_tags'),
      ageTags:        searchParams.getAll('age_tags'),
      sortBy:         (searchParams.get('sort_by') as SearchState['sortBy']) ?? DEFAULTS.sortBy,
      page:           Number(searchParams.get('page') ?? DEFAULTS.page),
      pageSize:       Number(searchParams.get('page_size') ?? DEFAULTS.pageSize),
    }),
    [clientId, searchParams],
  )

  const buildQs = useCallback(
    (overrides: Partial<SearchState> = {}): URLSearchParams => {
      const next = { ...state, ...overrides }
      const qs = new URLSearchParams()

      // client_id must always be preserved so it survives every client-side navigation
      if (next.clientId)      qs.set('client_id', next.clientId)
      if (next.q)           qs.set('q', next.q)
      if (next.zipCode)     qs.set('zip_code', next.zipCode)
      if (next.lat !== null) qs.set('lat', String(next.lat))
      if (next.lng !== null) qs.set('lng', String(next.lng))
      if (next.radiusMiles !== DEFAULTS.radiusMiles)
                            qs.set('radius_miles', String(next.radiusMiles))
      if (next.domain)      qs.set('domain', next.domain)
      if (next.subcategory) qs.set('subcategory', next.subcategory)
      if (next.browse)      qs.set('browse', next.browse)
      next.serviceTagIds.forEach(t  => qs.append('service_tag_ids', t))
      next.serviceTags.forEach(t    => qs.append('service_tags', t))
      next.populationTags.forEach(t => qs.append('population_tags', t))
      next.languageTags.forEach(t   => qs.append('language_tags', t))
      next.insuranceTags.forEach(t  => qs.append('insurance_tags', t))
      next.ageTags.forEach(t        => qs.append('age_tags', t))
      if (next.sortBy !== DEFAULTS.sortBy) qs.set('sort_by', next.sortBy)
      if (next.page !== 1)  qs.set('page', String(next.page))
      if (next.pageSize !== DEFAULTS.pageSize) qs.set('page_size', String(next.pageSize))

      return qs
    },
    [state],
  )

  const navigate = useCallback(
    (overrides: Partial<SearchState>) => {
      const qs = buildQs(overrides)
      const query = qs.toString()
      router.push(`${pathname}${query ? `?${query}` : ''}`, { scroll: false })
    },
    [router, pathname, buildQs],
  )

  const setFilter = useCallback(
    (key: keyof SearchState, value: unknown) => navigate({ [key]: value, page: 1 }),
    [navigate],
  )

  const setFilters = useCallback(
    (overrides: Partial<SearchState>) => navigate({ ...overrides, page: 1 }),
    [navigate],
  )

  const toggleTag = useCallback(
    (
      key: 'serviceTags' | 'populationTags' | 'languageTags' | 'insuranceTags' | 'ageTags',
      value: string,
    ) => {
      const current = state[key] as string[]
      const next = current.includes(value)
        ? current.filter(t => t !== value)
        : [...current, value]
      navigate({ [key]: next, page: 1 })
    },
    [navigate, state],
  )

  const clearFilters = useCallback(
    () =>
      navigate({
        q: '',
        zipCode: '',
        lat: null,
        lng: null,
        domain: '',
        subcategory: '',
        browse: '',
        serviceTagIds: [],
        serviceTags: [],
        populationTags: [],
        languageTags: [],
        insuranceTags: [],
        ageTags: [],
        sortBy: DEFAULTS.sortBy,
        page: 1,
      }),
    [navigate],
  )

  const toApiParams = useCallback(
    (): SearchParams => ({
      client_id:         state.clientId,
      q:               state.q || undefined,
      zip_code:        !state.lat && state.zipCode ? state.zipCode : undefined,
      lat:             state.lat ?? undefined,
      lng:             state.lng ?? undefined,
      radius_miles:    state.radiusMiles,
      domain:          state.domain || undefined,
      subcategory:     state.subcategory || undefined,
      service_tag_ids: state.serviceTagIds.length ? state.serviceTagIds : undefined,
      service_tags:    state.serviceTags.length ? state.serviceTags : undefined,
      population_tags: state.populationTags.length ? state.populationTags : undefined,
      language_tags:   state.languageTags.length ? state.languageTags : undefined,
      insurance_tags:  state.insuranceTags.length ? state.insuranceTags : undefined,
      age_tags:        state.ageTags.length ? state.ageTags : undefined,
      sort_by:         state.sortBy,
      page:            state.page,
      page_size:       state.pageSize,
    }),
    [state],
  )

  return { state, setFilter, setFilters, toggleTag, clearFilters, toApiParams }
}
