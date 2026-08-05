"use client"

/**
 * /admin/dashboard/providers — provider visibility management.
 *
 * Searchable list of all providers in the client's catchment.
 * Each row has a toggle that writes to ClientProviderOverride via PATCH.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import {
  listProvidersWithVisibility,
  setProviderVisibility,
} from "@/lib/adminApi"
import type { ProviderWithVisibility } from "@/lib/adminApi"

// ── Toggle switch ─────────────────────────────────────────────────────────────

interface ToggleProps {
  checked: boolean
  onChange: (v: boolean) => void
  loading: boolean
  label: string
}

function Toggle({ checked, onChange, loading, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={loading}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
        "disabled:opacity-40",
        checked ? "bg-accent" : "bg-border",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow",
          "transform transition-transform",
          checked ? "translate-x-4" : "translate-x-0",
        ].join(" ")}
        aria-hidden="true"
      />
    </button>
  )
}

// ── Verification status badge ─────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  verified:   "bg-accent/10 text-accent",
  unverified: "bg-muted text-muted-foreground",
  pending:    "bg-primary/10 text-primary",
  failed:     "bg-error/10 text-error",
}

// ── Row component ─────────────────────────────────────────────────────────────

interface RowProps {
  provider: ProviderWithVisibility
  clientId: string
  onToggled: (id: string, isHidden: boolean) => void
}

function ProviderRow({ provider, clientId, onToggled }: RowProps) {
  const [toggling, setToggling] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleToggle = async (nowVisible: boolean) => {
    const isHidden = !nowVisible
    setToggling(true)
    setError(null)
    try {
      await setProviderVisibility(clientId, provider.id, isHidden)
      onToggled(provider.id, isHidden)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to update.")
    } finally {
      setToggling(false)
    }
  }

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{provider.name}</p>
        {provider.address && (
          <p className="truncate text-xs text-muted-foreground">{provider.address}</p>
        )}
        {error && <p className="text-xs text-error">{error}</p>}
      </div>

      <span
        className={[
          "hidden shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize sm:inline",
          STATUS_CLASSES[provider.verification_status] ?? STATUS_CLASSES.unverified,
        ].join(" ")}
      >
        {provider.verification_status}
      </span>

      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <Toggle
          checked={!provider.is_hidden}
          onChange={handleToggle}
          loading={toggling}
          label={`${provider.is_hidden ? "Show" : "Hide"} ${provider.name}`}
        />
        <span className="text-[10px] text-muted-foreground">
          {provider.is_hidden ? "Hidden" : "Visible"}
        </span>
      </div>
    </li>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ProvidersPage() {
  const searchParams = useSearchParams()
  const clientId     = searchParams.get("client_id") ?? ""

  const [providers, setProviders] = useState<ProviderWithVisibility[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [q, setQ]                 = useState("")
  const [debouncedQ, setDebounced] = useState("")
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  const PAGE_SIZE = 50
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebounced(q)
      setPage(1)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q])

  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    async function load() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        const data = await listProvidersWithVisibility(clientId, page, PAGE_SIZE, debouncedQ || undefined)
        setProviders(data.providers)
        setTotal(data.total)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load providers.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [clientId, page, debouncedQ])

  const handleToggled = useCallback((id: string, isHidden: boolean) => {
    setProviders(prev => prev.map(p => p.id === id ? { ...p, is_hidden: isHidden } : p))
  }, [])

  if (!clientId) return (
    <p className="text-sm text-muted-foreground">No client_id in URL. Navigate from the dashboard.</p>
  )

  const totalPages = Math.ceil(total / PAGE_SIZE)
  const visibleCount = providers.filter(p => !p.is_hidden).length
  const hiddenCount  = providers.filter(p => p.is_hidden).length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Provider Visibility</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle providers on or off for your public directory.
        </p>
      </div>

      {/* Search + stats bar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name…"
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:max-w-xs"
          aria-label="Search providers"
        />
        {!loading && (
          <p className="shrink-0 text-sm text-muted-foreground">
            {total.toLocaleString()} providers · {visibleCount} visible · {hiddenCount} hidden
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="space-y-0 divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <div className="space-y-1">
                  <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                </div>
                <div className="h-5 w-9 animate-pulse rounded-full bg-muted" />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {debouncedQ ? `No providers match "${debouncedQ}".` : "No providers found."}
          </p>
        ) : (
          <ul role="list" className="divide-y divide-border">
            {providers.map(p => (
              <ProviderRow key={p.id} provider={p} clientId={clientId} onToggled={handleToggled} />
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-border px-3 py-1.5 text-foreground hover:bg-muted disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default function ProvidersPageWrapper() {
  return (
    <Suspense>
      <ProvidersPage />
    </Suspense>
  )
}
