"use client"

/**
 * /admin/csi — CSI staff overview.
 *
 * Platform-wide statistics: total clients, providers, territories,
 * and pending provider suggestions in the last 30 days.
 *
 * Data from GET /api/v1/admin/stats (csi_staff only).
 */

import { useEffect, useState } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

interface Stats {
  total_clients: number
  total_providers: number
  total_territories: number
  recent_suggestions: number
}

interface StatCardProps {
  label: string
  value: number | null
  loading: boolean
}

function StatCard({ label, value, loading }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      {loading ? (
        <div className="mt-2 h-8 w-20 animate-pulse rounded bg-muted" />
      ) : (
        <p className="mt-2 text-3xl font-semibold tabular-nums text-foreground">
          {value?.toLocaleString() ?? "—"}
        </p>
      )}
    </div>
  )
}

export default function CsiOverviewPage() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (!getAccessToken()) await refreshAccessToken()
        const token = getAccessToken()
        const res = await fetch(`${API_URL}/api/v1/admin/stats`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`${res.status}`)
        setStats(await res.json())
      } catch {
        setError("Failed to load stats.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Platform Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Live counts across all tenants
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Clients"        value={stats?.total_clients ?? null}      loading={loading} />
        <StatCard label="Providers"      value={stats?.total_providers ?? null}    loading={loading} />
        <StatCard label="Territories"    value={stats?.total_territories ?? null}  loading={loading} />
        <StatCard label="Pending (30d)"  value={stats?.recent_suggestions ?? null} loading={loading} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm">
        <h2 className="text-base font-semibold text-foreground">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Manage Providers",   href: "/admin/csi/providers",  desc: "Browse and edit all provider records" },
            { label: "Manage Taxonomy",    href: "/admin/csi/taxonomy",   desc: "Domains, subcategories, tags" },
            { label: "Manage Clients",     href: "/admin/csi/clients",    desc: "Onboarding and tenant config" },
          ].map(item => (
            <a
              key={item.label}
              href={item.href}
              className="rounded-md border border-border px-4 py-3 text-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <div className="font-medium text-foreground">{item.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
