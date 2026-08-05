"use client"

/**
 * /admin/csi/programs — CSI staff program management.
 *
 * A Program is a specific program a Provider runs (e.g. "Rental Assistance"
 * under a city Housing Authority) — see backend/app/models/program.py.
 * Mirrors the shape of /admin/csi/providers: paginated table, create/edit
 * modal, soft-delete. Tag assignment is a separate modal built around
 * TagPicker (5 flat vocabularies — no subcategory dimension, that hierarchy
 * is deprecated, see ROADMAP.md) — saving it
 * propagates any new tag up to the parent provider (see program_sync.py's
 * "double arrow" rule: the provider's tags must stay a superset of its
 * programs' tags).
 */

import { useCallback, useEffect, useRef, useState } from "react"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import {
  listAdminPrograms,
  getAdminProgram,
  createProgram,
  updateProgram,
  deleteProgram,
  updateProgramTags,
  listAdminProviders,
  getTagVocabulary,
} from "@/lib/adminApi"
import type {
  AdminProgramRow,
  ProgramCreateRequest,
  AdminProviderRow,
  TagVocabularyResponse,
} from "@/lib/adminApi"
import type { ProgramTagIds } from "@/lib/types"
import { TagPicker } from "@/components/admin/TagPicker"

// ── Program form modal (name/description/contact fields) ─────────────────────

interface ProgramFormProps {
  initial?: AdminProgramRow | null
  providers: AdminProviderRow[]
  defaultProviderId?: string
  onSave: (p: AdminProgramRow) => void
  onClose: () => void
}

function ProgramForm({ initial, providers, defaultProviderId, onSave, onClose }: ProgramFormProps) {
  const [providerId, setProviderId] = useState(initial?.provider_id ?? defaultProviderId ?? "")
  const [name, setName]             = useState(initial?.name ?? "")
  const [description, setDesc]      = useState(initial?.description ?? "")
  const [phone, setPhone]           = useState(initial?.phone ?? "")
  const [email, setEmail]           = useState(initial?.email ?? "")
  const [hours, setHours]           = useState(initial?.hours ?? "")
  const [address, setAddress]       = useState(initial?.address ?? "")
  const [website, setWebsite]       = useState(initial?.website ?? "")
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError("Name is required."); return }
    if (!initial && !providerId) { setError("A provider is required."); return }
    setSaving(true)
    setError(null)
    try {
      const data: Partial<ProgramCreateRequest> = {
        name: name.trim(),
        description: description || null,
        phone: phone || null,
        email: email || null,
        hours: hours || null,
        address: address || null,
        website: website || null,
      }
      const saved = initial
        ? await updateProgram(initial.id, data)
        : await createProgram({ ...data, provider_id: providerId, name: name.trim() } as ProgramCreateRequest)
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
            {initial ? "Edit Program" : "New Program"}
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
        <form onSubmit={handleSubmit} className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <p role="alert" className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          {!initial && (
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Provider *</label>
              <select
                value={providerId}
                onChange={e => setProviderId(e.target.value)}
                required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— select a provider —</option>
                {providers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          {initial && (
            <p className="text-xs text-muted-foreground">
              Provider: <span className="font-medium text-foreground">{initial.provider_name}</span> (fixed after creation)
            </p>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              placeholder="e.g. Rental Assistance"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Description</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Contact fields below override the provider&rsquo;s — leave blank to fall back to the provider&rsquo;s own value.
          </p>
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
              <label className="mb-1 block text-sm font-medium text-foreground">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
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
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Hours</label>
            <input
              type="text"
              value={hours}
              onChange={e => setHours(e.target.value)}
              placeholder="Mon-Fri 9am-5pm"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
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

// ── Tag editor modal ───────────────────────────────────────────────────────────

const EMPTY_TAGS: ProgramTagIds = {
  service_tag_ids: [], population_tag_ids: [],
  language_tag_ids: [], insurance_tag_ids: [], age_tag_ids: [],
}

interface TagsModalProps {
  program: AdminProgramRow
  vocabulary: TagVocabularyResponse
  onClose: () => void
  onSaved: () => void
}

function TagsModal({ program, vocabulary, onClose, onSaved }: TagsModalProps) {
  const [tags, setTags]     = useState<ProgramTagIds>(EMPTY_TAGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const detail = await getAdminProgram(program.id)
        if (!cancelled) setTags(detail.tags)
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load tags.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    void load()
    return () => { cancelled = true }
  }, [program.id])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      await updateProgramTags(program.id, tags)
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Tags — {program.name}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Any tag added here that the provider doesn&rsquo;t already have is added to the provider too — never removed.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto px-6 py-5">
          {error && (
            <p role="alert" className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          ) : (
            <>
              <TagPicker
                label="Service tags"
                items={vocabulary.service_tags}
                selectedIds={tags.service_tag_ids}
                onChange={ids => setTags(t => ({ ...t, service_tag_ids: ids }))}
              />
              <TagPicker
                label="Population tags"
                items={vocabulary.population_tags}
                selectedIds={tags.population_tag_ids}
                onChange={ids => setTags(t => ({ ...t, population_tag_ids: ids }))}
              />
              <TagPicker
                label="Language tags"
                items={vocabulary.language_tags}
                selectedIds={tags.language_tag_ids}
                onChange={ids => setTags(t => ({ ...t, language_tag_ids: ids }))}
              />
              <TagPicker
                label="Insurance tags"
                items={vocabulary.insurance_tags}
                selectedIds={tags.insurance_tag_ids}
                onChange={ids => setTags(t => ({ ...t, insurance_tag_ids: ids }))}
              />
              <TagPicker
                label="Age tags"
                items={vocabulary.age_tags}
                selectedIds={tags.age_tag_ids}
                onChange={ids => setTags(t => ({ ...t, age_tag_ids: ids }))}
              />
            </>
          )}
        </div>
        <div className="flex justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save tags"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CsiProgramsPage() {
  const [programs, setPrograms]     = useState<AdminProgramRow[]>([])
  const [providers, setProviders]   = useState<AdminProviderRow[]>([])
  const [vocabulary, setVocabulary] = useState<TagVocabularyResponse | null>(null)
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [q, setQ]                   = useState("")
  const [debouncedQ, setDebounced]  = useState("")
  const [includeInactive, setII]    = useState(false)
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)
  const [modal, setModal]           = useState<"create" | AdminProgramRow | null>(null)
  const [tagsModal, setTagsModal]   = useState<AdminProgramRow | null>(null)
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
    async function loadRefs() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        // NOTE: page_size capped at 200 by the backend — with >200 providers
        // this list will be incomplete. Fine at current demo scale (208).
        const [providersData, vocabData] = await Promise.all([
          listAdminProviders({ page_size: 200 }),
          getTagVocabulary(),
        ])
        setProviders(providersData.providers)
        setVocabulary(vocabData)
      } catch { /* non-critical for the list view itself */ }
    }
    void loadRefs()
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    if (!getAccessToken()) await refreshAccessToken()
    try {
      const data = await listAdminPrograms({
        q: debouncedQ || undefined,
        include_inactive: includeInactive,
        page,
        page_size: PAGE_SIZE,
      })
      setPrograms(data.programs)
      setTotal(data.total)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load programs.")
    } finally {
      setLoading(false)
    }
  }, [debouncedQ, includeInactive, page])

  useEffect(() => { void load() }, [load])

  const handleSaved = useCallback((saved: AdminProgramRow) => {
    setPrograms(prev => {
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
      await deleteProgram(id)
      setPrograms(prev => prev.filter(p => p.id !== id))
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
        <ProgramForm
          initial={modal === "create" ? null : modal}
          providers={providers}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
      {tagsModal && vocabulary && (
        <TagsModal
          program={tagsModal}
          vocabulary={vocabulary}
          onClose={() => setTagsModal(null)}
          onSaved={() => { setTagsModal(null); void load() }}
        />
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Program Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Programs are specific offerings a provider runs (e.g. &ldquo;Rental Assistance&rdquo; under a Housing Authority).
            Toggle provider-vs-program display mode per client on the Theme page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModal("create")}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
        >
          + New program
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
            {total.toLocaleString()} program{total !== 1 ? "s" : ""}
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
        ) : programs.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            {debouncedQ ? `No programs match "${debouncedQ}".` : "No programs yet — create one to get started."}
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Provider</th>
                <th className="hidden px-4 py-3 font-medium text-muted-foreground sm:table-cell">Contact override</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {programs.map(p => (
                <tr key={p.id} className={p.is_active ? "" : "opacity-50"}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{p.name}</p>
                    {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.provider_name}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                    {p.phone || p.email || p.address ? "Yes" : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.is_active ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setTagsModal(p)}
                        className="rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        Tags
                      </button>
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

export default function CsiProgramsPageWrapper() {
  return (
    <Suspense>
      <CsiProgramsPage />
    </Suspense>
  )
}
