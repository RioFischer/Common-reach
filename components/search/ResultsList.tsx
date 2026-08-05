import { ResultCard } from './ResultCard'
import { Button } from '@/components/ui'
import type { ProviderCard } from '@/lib/types'

interface ResultsListProps {
  results: ProviderCard[]
  total: number
  page: number
  pageSize: number
  clientId: string
  slug?: string
  isLoading: boolean
  onPageChange: (page: number) => void
}

function SkeletonCard() {
  return (
    <div
      className="h-32 motion-safe:animate-pulse rounded-lg border border-border bg-muted/30"
      aria-hidden="true"
    />
  )
}

export function ResultsList({
  results,
  total,
  page,
  pageSize,
  clientId,
  slug,
  isLoading,
  onPageChange,
}: ResultsListProps) {
  const totalPages = Math.ceil(total / pageSize)
  const start      = Math.min((page - 1) * pageSize + 1, total)
  const end        = Math.min(page * pageSize, total)

  // Loading state
  if (isLoading) {
    return (
      <section aria-label="Search results" aria-busy="true">
        {/* Announce to screen readers */}
        <p className="sr-only" role="status" aria-live="polite">
          Loading results…
        </p>
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </section>
    )
  }

  // Empty state
  if (total === 0) {
    return (
      <section aria-label="Search results">
        <div
          role="status"
          aria-live="polite"
          className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center"
        >
          <p className="text-base font-medium text-foreground">No results found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try a different keyword, zip code, or remove some filters.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Search results">
      {/* Result count — announced on change */}
      <p
        className="mb-3 text-sm text-muted-foreground"
        aria-live="polite"
        aria-atomic="true"
      >
        Showing {start.toLocaleString()}–{end.toLocaleString()} of{' '}
        {total.toLocaleString()} result{total !== 1 ? 's' : ''}
      </p>

      {/* Result list */}
      <ol
        className="flex flex-col gap-3"
        aria-label={`${total.toLocaleString()} providers found`}
      >
        {results.map(provider => (
          <li key={provider.id}>
            <ResultCard provider={provider} clientId={clientId} slug={slug} />
          </li>
        ))}
      </ol>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination"
          className="mt-6 flex items-center justify-between gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={`Go to page ${page - 1}`}
          >
            ← Previous
          </Button>

          <div className="flex items-center gap-1" aria-label="Page navigation">
            <span className="text-sm text-muted-foreground">
              Page{' '}
              <strong className="text-foreground">{page}</strong>
              {' '}of{' '}
              <strong className="text-foreground">{totalPages}</strong>
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            aria-label={`Go to page ${page + 1}`}
          >
            Next →
          </Button>
        </nav>
      )}
    </section>
  )
}
