"use client"

/**
 * /admin/csi/clients — CSI staff client onboarding.
 *
 * Lists existing clients with quick links to their admin pages.
 * "Onboard client" form creates client + territory + user in one call,
 * then shows the generated API key (displayed once).
 */

import { useEffect, useState } from "react"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import { getClients, onboardClient } from "@/lib/adminApi"
import type { ClientOnboardRequest, ClientOnboardResponse } from "@/lib/adminApi"
import type { Client } from "@/lib/types"

// ── Onboard form ──────────────────────────────────────────────────────────────

interface OnboardFormProps {
  onSuccess: (resp: ClientOnboardResponse) => void
  onClose: () => void
}

function OnboardForm({ onSuccess, onClose }: OnboardFormProps) {
  const [clientName, setClientName]   = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [billingStatus, setBilling]   = useState("trial")
  const [catchmentType, setCType]     = useState("territory_list")
  const [terrName, setTerrName]       = useState("")
  const [terrState, setTerrState]     = useState("")
  const [lat, setLat]                 = useState("")
  const [lng, setLng]                 = useState("")
  const [radius, setRadius]           = useState("")
  const [userEmail, setUserEmail]     = useState("")
  const [userPassword, setUserPw]     = useState("")
  const [saving, setSaving]           = useState(false)
  const [error, setError]             = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientName.trim() || !terrName.trim() || !userEmail.trim() || !userPassword) {
      setError("Client name, territory name, user email, and password are required.")
      return
    }
    setSaving(true)
    setError(null)
    try {
      const payload: ClientOnboardRequest = {
        client_name: clientName.trim(),
        contact_email: contactEmail || null,
        billing_status: billingStatus,
        catchment_type: catchmentType,
        territory_name: terrName.trim(),
        territory_state: terrState || null,
        center_lat: lat ? parseFloat(lat) : null,
        center_lng: lng ? parseFloat(lng) : null,
        boundary_radius_miles: radius ? parseFloat(radius) : null,
        catchment_radius_miles: catchmentType === "radius" && radius ? parseFloat(radius) : null,
        user_email: userEmail.trim(),
        user_password: userPassword,
        enabled_domains: [],
        active_filters: ["domain", "service_tag"],
      }
      const resp = await onboardClient(payload)
      onSuccess(resp)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Onboarding failed.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-surface shadow-lg">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Onboard New Client</h2>
          <button type="button" onClick={onClose} aria-label="Close"
            className="rounded p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {error && (
            <p role="alert" className="rounded-md border border-error/20 bg-error/10 px-3 py-2 text-sm text-error">
              {error}
            </p>
          )}

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Client details</legend>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Client name *</label>
              <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Contact email</label>
                <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Billing status</label>
                <select value={billingStatus} onChange={e => setBilling(e.target.value)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                  {["trial", "active", "inactive"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Territory / catchment</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Territory name *</label>
                <input type="text" value={terrName} onChange={e => setTerrName(e.target.value)} required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">State</label>
                <input type="text" value={terrState} onChange={e => setTerrState(e.target.value)}
                  placeholder="TX"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Catchment type</label>
              <select value={catchmentType} onChange={e => setCType(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="territory_list">Territory list</option>
                <option value="radius">Radius</option>
              </select>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Latitude</label>
                <input type="number" step="any" value={lat} onChange={e => setLat(e.target.value)}
                  placeholder="31.0"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Longitude</label>
                <input type="number" step="any" value={lng} onChange={e => setLng(e.target.value)}
                  placeholder="-97.0"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-foreground">Radius (mi)</label>
                <input type="number" step="any" value={radius} onChange={e => setRadius(e.target.value)}
                  placeholder="15"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="text-sm font-semibold text-foreground">Admin user</legend>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Email *</label>
              <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-foreground">Temporary password *</label>
              <input type="password" value={userPassword} onChange={e => setUserPw(e.target.value)} required
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
          </fieldset>

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button type="button" onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm text-foreground hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
              {saving ? "Onboarding…" : "Onboard client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Success panel ─────────────────────────────────────────────────────────────

function OnboardSuccess({ resp, onClose }: { resp: ClientOnboardResponse; onClose: () => void }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(resp.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface shadow-lg">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Client onboarded</h2>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div className="rounded-lg border border-accent/30 bg-accent/5 px-4 py-3">
            <p className="text-sm font-medium text-accent">Success! {resp.client_name} is ready.</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">API Key — shown once</p>
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
              <code className="flex-1 break-all font-mono text-xs text-foreground">{resp.api_key}</code>
              <button type="button" onClick={copy}
                className="shrink-0 rounded px-2 py-1 text-xs text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-ring">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">Store this securely — it cannot be retrieved later.</p>
          </div>
          <dl className="space-y-1 text-sm">
            <div className="flex gap-2">
              <dt className="w-32 text-muted-foreground">Client ID</dt>
              <dd className="font-mono text-xs text-foreground truncate">{resp.client_id}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-muted-foreground">Territory ID</dt>
              <dd className="font-mono text-xs text-foreground truncate">{resp.territory_id}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="w-32 text-muted-foreground">Admin user</dt>
              <dd className="text-foreground">{resp.user_email}</dd>
            </div>
          </dl>
        </div>
        <div className="border-t border-border px-6 py-4">
          <button type="button" onClick={onClose}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring">
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CsiClientsPage() {
  const [clients, setClients]     = useState<Client[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [showForm, setShowForm]   = useState(false)
  const [success, setSuccess]     = useState<ClientOnboardResponse | null>(null)

  const load = async () => {
    if (!getAccessToken()) await refreshAccessToken()
    setLoading(true)
    try {
      const data = await getClients()
      setClients(data.clients)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load clients.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const handleSuccess = (resp: ClientOnboardResponse) => {
    setShowForm(false)
    setSuccess(resp)
    void load()
  }

  const BILLING_CLASSES: Record<string, string> = {
    active:   "bg-accent/10 text-accent",
    trial:    "bg-primary/10 text-primary",
    inactive: "bg-muted text-muted-foreground",
  }

  return (
    <div className="mx-auto max-w-4xl">
      {showForm && (
        <OnboardForm onSuccess={handleSuccess} onClose={() => setShowForm(false)} />
      )}
      {success && (
        <OnboardSuccess resp={success} onClose={() => setSuccess(null)} />
      )}

      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Client Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Onboard new tenants, configure catchments, and manage billing.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring"
        >
          + Onboard client
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-border bg-surface">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-4">
                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">No clients yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {clients.map(c => (
              <li key={c.id} className="px-4 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground">{c.name}</p>
                    {c.contact_email && (
                      <p className="text-xs text-muted-foreground">{c.contact_email}</p>
                    )}
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{c.id}</p>
                  </div>
                  <span className={[
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                    BILLING_CLASSES[c.billing_status] ?? BILLING_CLASSES.inactive,
                  ].join(" ")}>
                    {c.billing_status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-3">
                  <a
                    href={`/admin/dashboard/theme?client_id=${c.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Theme editor
                  </a>
                  <a
                    href={`/admin/dashboard/providers?client_id=${c.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Provider visibility
                  </a>
                  <a
                    href={`/admin/dashboard/catchment?client_id=${c.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Catchment
                  </a>
                  <a
                    href={`/search?client_id=${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    View directory ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function CsiClientsPageWrapper() {
  return (
    <Suspense>
      <CsiClientsPage />
    </Suspense>
  )
}
