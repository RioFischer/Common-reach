"use client"

import { useEffect, useState } from "react"
import { refreshAccessToken, getAccessToken, getUser } from "@/lib/auth"
import { getClients } from "@/lib/adminApi"
import type { Client } from "@/lib/types"

const BILLING_BADGE: Record<string, string> = {
  active:   "bg-accent/10 text-accent",
  trial:    "bg-primary/10 text-primary",
  inactive: "bg-muted text-muted-foreground",
}

export default function DashboardPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        if (!getAccessToken()) await refreshAccessToken()
        const data = await getClients()
        setClients(data.clients ?? [])
      } catch {
        setError("Failed to load client data.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const user = getUser()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        {user && (
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back, {user.email}
          </p>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {!loading && !error && clients.length === 0 && (
        <p className="text-sm text-muted-foreground">No clients assigned to your account.</p>
      )}

      {clients.map(client => {
        const q = `?client_id=${client.id}`
        const quickLinks = [
          { label: "Theme & Branding", href: `/admin/dashboard/theme${q}`,     description: "Colours, fonts, logo" },
          { label: "Providers",        href: `/admin/dashboard/providers${q}`,  description: "Manage directory visibility" },
          { label: "Catchment",        href: `/admin/dashboard/catchment${q}`,  description: "Geographic coverage" },
        ]

        return (
          <section
            key={client.id}
            className="rounded-lg border border-border bg-surface p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">{client.name}</h2>
                {client.contact_email && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{client.contact_email}</p>
                )}
              </div>
              <span
                className={[
                  "rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                  BILLING_BADGE[client.billing_status] ?? BILLING_BADGE.inactive,
                ].join(" ")}
              >
                {client.billing_status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {quickLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  className="rounded-md border border-border px-4 py-3 text-sm hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <div className="font-medium text-foreground">{link.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{link.description}</div>
                </a>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
