"use client"

/**
 * /admin/csi/taxonomy — CSI staff taxonomy management.
 *
 * Tabbed interface: Domains | Categories | Subcategories | Service Tags |
 *                  Population Tags | Language Tags | Insurance Tags
 * Inline add, edit (click to rename), delete with 409 conflict handling.
 */

import { useCallback, useEffect, useState } from "react"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import {
  getClients,
  listDomains, createDomain, updateDomain, deleteDomain,
  listCategories, createCategory, updateCategory, deleteCategory,
  listSubcategories, createSubcategory, updateSubcategory, deleteSubcategory,
  listTags, createTag, updateTag, deleteTag,
} from "@/lib/adminApi"
import type { DomainRow, CategoryRow, SubcategoryRow, TagRow, TagType } from "@/lib/adminApi"
import type { Client } from "@/lib/types"

// ── Inline editable row ───────────────────────────────────────────────────────

interface EditableRowProps {
  name: string
  usageCount?: number
  onRename: (newName: string) => Promise<void>
  onDelete: () => Promise<void>
}

function EditableRow({ name, usageCount, onRename, onDelete }: EditableRowProps) {
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState(name)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleRename = async () => {
    if (!draft.trim() || draft === name) { setEditing(false); return }
    setSaving(true)
    setError(null)
    try {
      await onRename(draft.trim())
      setEditing(false)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Rename failed.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    setError(null)
    try {
      await onDelete()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Delete failed.")
      setDeleting(false)
    }
  }

  return (
    <li className="flex items-center gap-3 px-4 py-2.5">
      {editing ? (
        <>
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") void handleRename()
              if (e.key === "Escape") setEditing(false)
            }}
            className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button type="button" onClick={handleRename} disabled={saving}
            className="text-xs text-accent hover:underline disabled:opacity-50">
            {saving ? "…" : "Save"}
          </button>
          <button type="button" onClick={() => setEditing(false)}
            className="text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </>
      ) : (
        <>
          <span className="flex-1 text-sm text-foreground">{name}</span>
          {usageCount !== undefined && (
            <span className="text-xs text-muted-foreground">
              {usageCount} provider{usageCount !== 1 ? "s" : ""}
            </span>
          )}
          <button type="button" onClick={() => { setDraft(name); setEditing(true) }}
            className="text-xs text-primary hover:underline">
            Rename
          </button>
          <button type="button" onClick={handleDelete} disabled={deleting}
            className="text-xs text-error hover:underline disabled:opacity-50">
            {deleting ? "…" : "Delete"}
          </button>
        </>
      )}
      {error && <span className="text-xs text-error">{error}</span>}
    </li>
  )
}

// ── Add-new row ───────────────────────────────────────────────────────────────

interface AddRowProps {
  placeholder: string
  onAdd: (name: string) => Promise<void>
  disabled?: boolean
  disabledHint?: string
}

function AddRow({ placeholder, onAdd, disabled, disabledHint }: AddRowProps) {
  const [value, setValue]   = useState("")
  const [adding, setAdding] = useState(false)
  const [error, setError]   = useState<string | null>(null)

  const handleAdd = async () => {
    if (!value.trim() || disabled) return
    setAdding(true)
    setError(null)
    try {
      await onAdd(value.trim())
      setValue("")
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Add failed.")
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="border-t border-border px-4 py-3">
      {disabled && disabledHint && (
        <p className="mb-2 text-xs text-muted-foreground">{disabledHint}</p>
      )}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") void handleAdd() }}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleAdd}
          disabled={adding || !value.trim() || disabled}
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  )
}

// ── Tab types ─────────────────────────────────────────────────────────────────

type Tab = "domains" | "categories" | "subcategories" | TagType

const TABS: { id: Tab; label: string }[] = [
  { id: "domains",         label: "Domains" },
  { id: "categories",      label: "Categories" },
  { id: "subcategories",   label: "Subcategories" },
  { id: "service_tags",    label: "Service Tags" },
  { id: "population_tags", label: "Population Tags" },
  { id: "language_tags",   label: "Language Tags" },
  { id: "insurance_tags",  label: "Insurance Tags" },
]

const TAG_TYPES = new Set<string>(["service_tags", "population_tags", "language_tags", "insurance_tags"])

// ── Page ──────────────────────────────────────────────────────────────────────

function TaxonomyPage() {
  const [tab, setTab]     = useState<Tab>("domains")
  const [clients, setClients] = useState<Client[]>([])

  const [domains, setDomains]         = useState<DomainRow[]>([])
  const [domainClientId, setDCid]     = useState("")
  const [categories, setCategories]   = useState<CategoryRow[]>([])
  const [catDomainId, setCatDid]      = useState("")
  const [subcats, setSubcats]         = useState<SubcategoryRow[]>([])
  const [subCatId, setSubCatId]       = useState("")
  const [tags, setTags]               = useState<TagRow[]>([])
  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState<string | null>(null)

  useEffect(() => {
    async function loadClients() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        const data = await getClients()
        setClients(data.clients)
        if (data.clients[0]) setDCid(data.clients[0].id)
      } catch { /* non-critical */ }
    }
    void loadClients()
  }, [])

  const loadTab = useCallback(async (t: Tab, dcid: string, catdid: string, subcid: string) => {
    setLoading(true)
    setError(null)
    try {
      if (!getAccessToken()) await refreshAccessToken()
      if (t === "domains") {
        setDomains(await listDomains(dcid || undefined))
      } else if (t === "categories") {
        setCategories(await listCategories(catdid || undefined))
      } else if (t === "subcategories") {
        setSubcats(await listSubcategories(subcid || undefined))
      } else if (TAG_TYPES.has(t)) {
        setTags(await listTags(t as TagType))
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadTab(tab, domainClientId, catDomainId, subCatId)
  }, [tab, domainClientId, catDomainId, subCatId, loadTab])

  const reload = () => loadTab(tab, domainClientId, catDomainId, subCatId)

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Taxonomy Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage domains, categories, subcategories, and tag vocabularies.
        </p>
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
        {TABS.map(t => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={[
              "rounded-t-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring",
              tab === t.id
                ? "border border-b-surface border-border bg-surface text-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface">
        {/* ── Domains ── */}
        {tab === "domains" && (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <label className="text-sm font-medium text-foreground">Client</label>
              <select
                value={domainClientId}
                onChange={e => setDCid(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All clients</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {loading
              ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</div>
              : <ul className="divide-y divide-border">
                  {domains.map(d => (
                    <EditableRow
                      key={d.id}
                      name={d.name}
                      onRename={async (name) => { await updateDomain(d.id, name); await reload() }}
                      onDelete={async () => { await deleteDomain(d.id); await reload() }}
                    />
                  ))}
                  {domains.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">No domains yet.</li>
                  )}
                </ul>
            }
            <AddRow
              placeholder="New domain name…"
              disabled={!domainClientId}
              disabledHint="Select a client above to add a domain."
              onAdd={async (name) => { await createDomain(domainClientId, name); await reload() }}
            />
          </>
        )}

        {/* ── Categories ── */}
        {tab === "categories" && (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <label className="text-sm font-medium text-foreground">Domain</label>
              <select
                value={catDomainId}
                onChange={e => setCatDid(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All domains</option>
                {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            {loading
              ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</div>
              : <ul className="divide-y divide-border">
                  {categories.map(c => (
                    <EditableRow
                      key={c.id}
                      name={c.name}
                      onRename={async (name) => { await updateCategory(c.id, name); await reload() }}
                      onDelete={async () => { await deleteCategory(c.id); await reload() }}
                    />
                  ))}
                  {categories.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">No categories yet.</li>
                  )}
                </ul>
            }
            <AddRow
              placeholder="New category name…"
              disabled={!catDomainId}
              disabledHint="Select a domain above to add a category."
              onAdd={async (name) => { await createCategory(catDomainId, name); await reload() }}
            />
          </>
        )}

        {/* ── Subcategories ── */}
        {tab === "subcategories" && (
          <>
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={subCatId}
                onChange={e => setSubCatId(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {loading
              ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</div>
              : <ul className="divide-y divide-border">
                  {subcats.map(s => (
                    <EditableRow
                      key={s.id}
                      name={s.name}
                      usageCount={s.usage_count}
                      onRename={async (name) => { await updateSubcategory(s.id, name); await reload() }}
                      onDelete={async () => { await deleteSubcategory(s.id); await reload() }}
                    />
                  ))}
                  {subcats.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">No subcategories yet.</li>
                  )}
                </ul>
            }
            <AddRow
              placeholder="New subcategory name…"
              disabled={!subCatId}
              disabledHint="Select a category above to add a subcategory."
              onAdd={async (name) => { await createSubcategory(subCatId, name); await reload() }}
            />
          </>
        )}

        {/* ── Tag tabs ── */}
        {TAG_TYPES.has(tab) && (
          <>
            {loading
              ? <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading…</div>
              : <ul className="divide-y divide-border">
                  {tags.map(t => (
                    <EditableRow
                      key={t.id}
                      name={t.name}
                      usageCount={t.usage_count}
                      onRename={async (name) => { await updateTag(tab as TagType, t.id, name); await reload() }}
                      onDelete={async () => { await deleteTag(tab as TagType, t.id); await reload() }}
                    />
                  ))}
                  {tags.length === 0 && (
                    <li className="px-4 py-6 text-center text-sm text-muted-foreground">No tags yet.</li>
                  )}
                </ul>
            }
            <AddRow
              placeholder="New tag name…"
              onAdd={async (name) => { await createTag(tab as TagType, name); await reload() }}
            />
          </>
        )}
      </div>
    </div>
  )
}

export default function TaxonomyPageWrapper() {
  return (
    <Suspense>
      <TaxonomyPage />
    </Suspense>
  )
}
