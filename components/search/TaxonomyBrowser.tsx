'use client'

import { useCallback, useId, useRef } from 'react'
import { ResultCard } from './ResultCard'
import type { ProviderCard, SearchFilterSchema } from '@/lib/types'

interface TaxonomyBrowserProps {
  domains: string[]
  schema: SearchFilterSchema
  results: ProviderCard[]
  /** Domain-unfiltered results — used to compute which domain buttons are active/inactive. */
  availabilityResults: ProviderCard[]
  total: number
  activeDomain: string
  isLoading: boolean
  /** True once the first availability response has arrived; false while initial load is in flight. */
  resultsLoaded: boolean
  onSelectDomain: (d: string) => void
  clientId: string
  slug: string
}

function domainSlug(domain: string): string {
  return domain.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function TaxonomyBrowser({
  domains,
  results,
  availabilityResults,
  total,
  activeDomain,
  isLoading,
  resultsLoaded,
  onSelectDomain,
  clientId,
  slug,
}: TaxonomyBrowserProps) {
  const baseId = useId()
  const domainRefs = useRef<(HTMLButtonElement | null)[]>([])

  // Use domain-unfiltered availability results so selecting a domain doesn't
  // incorrectly mark all other domains inactive.
  const domainsWithResults = resultsLoaded
    ? new Set(availabilityResults.flatMap(r => r.domains))
    : null  // null = initial load in flight, show all domains as active

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let nextIndex = -1
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = index < domains.length - 1 ? index + 1 : 0
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = index > 0 ? index - 1 : domains.length - 1
      } else if (e.key === 'Home') {
        e.preventDefault()
        nextIndex = 0
      } else if (e.key === 'End') {
        e.preventDefault()
        nextIndex = domains.length - 1
      }
      if (nextIndex >= 0) domainRefs.current[nextIndex]?.focus()
    },
    [domains.length],
  )

  if (domains.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No service categories available.
      </p>
    )
  }

  return (
    <div className="space-y-1" role="list" aria-label="Service categories">
      {domains.map((domain, index) => {
        const dSlug = domainSlug(domain)
        const btnId = `${baseId}-domain-${dSlug}-btn`
        const panelId = `${baseId}-domain-${dSlug}-panel`
        const isExpanded = activeDomain === domain
        const isDisabled = domainsWithResults !== null && !domainsWithResults.has(domain)

        return (
          <div key={domain} role="listitem">
            <button
              ref={el => { domainRefs.current[index] = el }}
              id={btnId}
              type="button"
              onClick={() => !isDisabled && onSelectDomain(domain)}
              onKeyDown={e => !isDisabled && handleKeyDown(e, index)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-disabled={isDisabled}
              disabled={isDisabled}
              className={[
                'flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                isDisabled
                  ? 'cursor-not-allowed border-border/40 bg-muted/40 text-disabled opacity-50'
                  : 'border-border bg-surface text-on-surface hover:bg-muted',
              ].join(' ')}
            >
              <span>{domain}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={`shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>

            {isExpanded && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={btnId}
                className="mt-1 rounded-lg border border-border bg-background px-4 py-4"
              >
                {isLoading && (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                    ))}
                  </div>
                )}

                {!isLoading && results.length === 0 && (
                  <p className="py-2 text-sm text-muted-foreground">
                    No services found in this category.
                  </p>
                )}

                {!isLoading && results.length > 0 && (
                  <>
                    <ol className="space-y-2" aria-label={`Providers in ${domain}`}>
                      {results.map(provider => (
                        <li key={provider.id}>
                          <ResultCard provider={provider} clientId={clientId} slug={slug} />
                        </li>
                      ))}
                    </ol>
                    {total > results.length && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Showing {results.length} of {total} providers.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
