"use client"

/**
 * /admin/csi/providers — CSI staff provider management.
 *
 * Paginated table with search + filters (territory, verification status, active/inactive).
 * Create modal, inline edit modal, soft-delete confirmation.
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import {
  listAdminProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  listTerritories,
} from "@/lib/adminApi"
import type { AdminProviderRow, ProviderCreateRequest, TerritoryInfo } from "@/lib/adminApi"
import { TrustBadges } from "@/components/TrustBadges"

// ── Status badge ──────────────────────────────────────────────────────────────

const STATUS_CLASSES: Record<string, string> = {
  verified:   "bg-accent/10 text-accent",
  unverified: "bg-muted text-muted-foreground",
  pending:    "bg-primary/10 text-primary",
  failed:     "bg-error/10 text-error",
}

// ── Provider form modal ───────────────────────────────────────────────────────

interface ProviderFormProps {
  initial?: AdminProviderRow | null
  territories: TerritoryInfo[]
  onSave: (p: AdminProviderRow) => void
  onClose: () => void
}

function ProviderForm({ initial, territories, onSave, onClose }: ProviderFormProps) {
  const [name, setName]           = useState(initial?.name ?? "")
  const [address, setAddress]     = useState(initial?.address ?? "")
  const [phone, setPhone]         = useState(initial?.phone ?? "")
  const [website, setWebsite]     = useState(initial?.website ?? "")
  const [territoryId, setTerr]    = useState(initial?.territory_id ?? "")
  const [vstatus, setVstatus]     = useState(initial?.verification_status ?? "unverified")
  const [lat, setLat]             = useState(String(initial?.latitude ?? ""))
  const [lng, setLng]             = useState(String(initial?.longitude ?? ""))
  const [dataVerified, setDataVerified] = useState(initial?.data_verified ?? false)
  const [communityVerified, setCommunityVerified] = useState(initial?.community_verified ?? false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required."); return }
    setSaving(true)
    setError(null)
    try {
      const data: ProviderCreateRequest = {
        name: name.trim(),
        territory_id: territoryId || null,
        address: address || null,
        phone: phone || null,
        website: website || null,
        verification_status: vstatus,
        latitude: lat ? parseFloat(lat) : null,
        longitude: lng ? parseFloat(lng) : null,
        data_verified: dataVerified,
        community_verified: communityVerified,
      }
      const saved = initial
        ? await updateProvider(initial.id, data)
        : await createProvider(data)
      onSave(saved)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">
            {initial ? "Edit Provider" : "New Provider"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <p role="alert" className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Phone</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Website</label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Territory</label>
              <select
                value={territoryId}
                onChange={e => setTerr(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— none —</option>
                {territories.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Verification</label>
              <select
                value={vstatus}
                onChange={e => setVstatus(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {["unverified", "pending", "verified", "failed"].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Latitude</label>
              <input
                type="number"
                step="any"
                value={lat}
                onChange={e => setLat(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Longitude</label>
              <input
                type="number"
                step="any"
                value={lng}
                onChange={e => setLng(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Trust badges</label>
            <p className="mb-2 text-xs text-muted-foreground">
              How a provider earns these isn&rsquo;t automated yet — set manually for now.
            </p>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={dataVerified}
                  onChange={e => setDataVerified(e.target.checked)}
                  className="rounded border-border"
                />
                Data Verified
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={communityVerified}
                  onChange={e => setCommunityVerified(e.target.checked)}
                  className="rounded border-border"
                />
                Community Verified
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CsiProvidersPage() {
  const [providers, setProviders]   = useState<AdminProviderRow[]>([])
  const [territories, setTerr]      = useState<TerritoryInfo[]>([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [q, setQ]                   = useState("")
  const [debouncedQ, setDebounced]  = useState("")
  const [filterTerritory, setFT]    = useState("")
  const [filterStatus, setFS]       = useState("")
  const [includeInactive, setII]    = useState(false)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [modal, setModal]           = useState<"create" | AdminProviderRow | null>(null)
  const [deleting, setDeleting]     = useState<string | null>(null)
  const [deleteErr, setDeleteErr]   = useState<string | null>(null)

  const PAGE_SIZE = 50
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setDebounced(q); setPage(1) }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [q])

  useEffect(() => {
    async function loadTerritories() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        const data = await listTerritories()
        setTerr(data.territories)
      } catch { /* non-critical */ }
    }
    void loadTerritories()
  }, [])

  useEffect(() => {
    setLoading(true)
    async function load() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        const data = await listAdminProviders({
          q: debouncedQ || undefined,
          territory_id: filterTerritory || undefined,
          verification_status: filterStatus || undefined,
          include_inactive: includeInactive,
          page,
          page_size: PAGE_SIZE,
        })
        setProviders(data.providers)
        setTotal(data.total)
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load providers.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [debouncedQ, filterTerritory, filterStatus, includeInactive, page])

  const handleSaved = useCallback((saved: AdminProviderRow) => {
    setProviders(prev => {
      const idx = prev.findIndex(p => p.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
    if (modal === "create") setTotal(t => t + 1)
    setModal(null)
  }, [modal])

  const handleDelete = async (id: string) => {
    setDeleting(id)
    setDeleteErr(null)
    try {
      await deleteProvider(id)
      setProviders(prev => prev.filter(p => p.id !== id))
      setTotal(t => t - 1)
    } catch (e: unknown) {
      setDeleteErr(e instanceof Error ? e.message : "Delete failed.")
    } finally {
      setDeleting(null)
    }
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="mx-auto max-w-6xl">
      {modal && (
        <ProviderForm
          initial={modal === "create" ? null : modal}
          territories={territories}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Provider Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search, edit, and soft-delete providers across all territories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
        >
          + New provider
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search by name…"
          className="w-full max-w-xs rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={filterTerritory}
          onChange={e => { setFT(e.target.value); setPage(1) }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All territories</option>
          {territories.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFS(e.target.value); setPage(1) }}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">All statuses</option>
          {["unverified", "pending", "verified", "failed"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={includeInactive}
            onChange={e => { setII(e.target.checked); setPage(1) }}
            className="rounded border-border"
          />
          Show inactive
        </label>
        {!loading && (
          <span className="ml-auto text-sm text-muted-foreground">
            {total.toLocaleString()} provider{total !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}
      {deleteErr && (
        <div role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {deleteErr}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-4 w-48 animate-pulse rounded bg-muted" />
                <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : providers.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {debouncedQ ? `No providers match "${debouncedQ}".` : "No providers found."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground md:table-cell">Territory</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Address</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground lg:table-cell">Badges</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {providers.map(p => (
                <tr key={p.id} className={p.is_active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    {p.phone && <p className="text-xs text-muted-foreground">{p.phone}</p>}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {p.territory_name ?? "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {p.address ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={[
                      "rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      STATUS_CLASSES[p.verification_status] ?? STATUS_CLASSES.unverified,
                    ].join(" ")}>
                      {p.verification_status}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <TrustBadges dataVerified={p.data_verified} communityVerified={p.community_verified} compact />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setModal(p)}
                        className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={deleting === p.id || !p.is_active}
                        onClick={() => handleDelete(p.id)}
                        className="rounded px-2 py-1 text-xs text-error hover:bg-error/10 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-40"
                      >
                        {deleting === p.id ? "…" : "Deactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

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
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
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

export default function CsiProvidersPageWrapper() {
  return (
    <Suspense>
      <CsiProvidersPage />
    </Suspense>
  )
}
