"use client"

/**
 * Reusable checkbox-list-with-search tag-assignment widget. Built from
 * scratch for Program tag editing — no per-entity tag-assignment UI existed
 * anywhere in the admin frontend before this (provider tags are set only by
 * the automated tagger pipeline).
 */

import { useMemo, useState } from "react"

export interface TagPickerItem {
  id: string
  name: string
  /** Optional grouping label, e.g. "Housing > Emergency Shelter" for subcategories. */
  group?: string
}

interface TagPickerProps {
  label: string
  items: TagPickerItem[]
  selectedIds: string[]
  onChange: (ids: string[]) => void
}

export function TagPicker({ label, items, selectedIds, onChange }: TagPickerProps) {
  const [q, setQ] = useState("")
  const selected = useMemo(() => new Set(selectedIds), [selectedIds])

  const filtered = q.trim()
    ? items.filter(i =>
        i.name.toLowerCase().includes(q.toLowerCase()) ||
        (i.group?.toLowerCase().includes(q.toLowerCase()) ?? false))
    : items

  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">{label}</label>
        <span className="text-xs text-muted-foreground">{selectedIds.length} selected</span>
      </div>
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder={`Search ${label.toLowerCase()}…`}
        className="mb-2 w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="max-h-40 overflow-y-auto rounded-md border border-border bg-background p-2">
        {items.length === 0 ? (
          <p className="px-1 py-1 text-xs text-muted-foreground">No options available.</p>
        ) : filtered.length === 0 ? (
          <p className="px-1 py-1 text-xs text-muted-foreground">No matches for &ldquo;{q}&rdquo;.</p>
        ) : (
          filtered.map(item => (
            <label key={item.id} className="flex items-center gap-2 rounded px-1 py-1 text-sm text-foreground hover:bg-muted">
              <input
                type="checkbox"
                checked={selected.has(item.id)}
                onChange={() => toggle(item.id)}
                className="rounded border-border"
              />
              <span>
                {item.group && <span className="text-muted-foreground">{item.group} &middot; </span>}
                {item.name}
              </span>
            </label>
          ))
        )}
      </div>
    </div>
  )
}
