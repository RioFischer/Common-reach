"use client"

/**
 * /admin/dashboard/catchment — read-only catchment display.
 *
 * Shows the client's geographic catchment definition.
 * Radius catchments show a static SVG map; territory lists show territory names.
 * Intentionally read-only — changes are made by CSI staff during onboarding.
 */

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import { getClient, getTerritory } from "@/lib/adminApi"
import type { Client } from "@/lib/types"
import type { TerritoryInfo } from "@/lib/adminApi"

// ── Static radius map ─────────────────────────────────────────────────────────

interface RadiusMapProps {
  lat: number
  lng: number
  radiusMiles: number
}

/**
 * A simple SVG pin-and-circle illustration (no external map tiles required).
 * Just a decorative schematic — not geographically accurate.
 */
function RadiusMap({ lat, lng, radiusMiles }: RadiusMapProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-background p-6">
      <svg
        width="200"
        height="200"
        viewBox="0 0 200 200"
        aria-label={`Catchment radius: ${radiusMiles} miles around ${lat.toFixed(4)}, ${lng.toFixed(4)}`}
        className="text-primary"
      >
        {/* Background */}
        <circle cx="100" cy="100" r="95" fill="currentColor" fillOpacity="0.06" />
        {/* Radius circle */}
        <circle cx="100" cy="100" r="70" fill="currentColor" fillOpacity="0.08" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 3" />
        {/* Inner city area */}
        <circle cx="100" cy="100" r="28" fill="currentColor" fillOpacity="0.15" />
        {/* Center pin */}
        <circle cx="100" cy="100" r="7" fill="currentColor" />
        <circle cx="100" cy="100" r="3" fill="white" />
        {/* Cardinal tick marks */}
        {[0, 90, 180, 270].map(angle => {
          const rad = (angle * Math.PI) / 180
          const x1 = 100 + 68 * Math.cos(rad)
          const y1 = 100 + 68 * Math.sin(rad)
          const x2 = 100 + 76 * Math.cos(rad)
          const y2 = 100 + 76 * Math.sin(rad)
          return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" />
        })}
        {/* Radius label */}
        <text x="100" y="185" textAnchor="middle" fontSize="11" fill="currentColor" opacity="0.7">
          {radiusMiles} mi radius
        </text>
      </svg>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">Center point</p>
        <p className="mt-0.5 font-mono text-xs text-muted-foreground">
          {lat.toFixed(5)}°N, {Math.abs(lng).toFixed(5)}°{lng < 0 ? "W" : "E"}
        </p>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function CatchmentPage() {
  const searchParams = useSearchParams()
  const clientId     = searchParams.get("client_id") ?? ""

  const [client, setClient]         = useState<Client | null>(null)
  const [territories, setTerritories] = useState<TerritoryInfo[]>([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    async function load() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        const c = await getClient(clientId)
        setClient(c)

        // Load territory details for territory_list catchments
        if (c.catchment_territory_ids?.length) {
          const resolved = await Promise.all(
            c.catchment_territory_ids.map(id =>
              getTerritory(id).catch(() => null),
            ),
          )
          setTerritories(resolved.filter((t): t is TerritoryInfo => t !== null))
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load catchment.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [clientId])

  if (!clientId) return (
    <p className="text-sm text-muted-foreground">No client_id in URL. Navigate from the dashboard.</p>
  )

  if (loading) return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  )

  if (error) return (
    <div role="alert" className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
      {error}
    </div>
  )

  const catchmentType = client?.catchment_type ?? null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Catchment Area</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The geographic area your directory covers.
        </p>
      </div>

      {!catchmentType && (
        <div className="rounded-lg border border-border bg-surface p-6 text-sm text-muted-foreground">
          No catchment configured yet. Contact CSI staff to set up your coverage area.
        </div>
      )}

      {catchmentType === "radius" && (
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Radius catchment</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            All providers within {client?.catchment_radius_miles ?? "—"} miles of the center point.
          </p>
          {territories[0]?.center_lat != null && territories[0]?.center_lng != null ? (
            <RadiusMap
              lat={territories[0].center_lat}
              lng={territories[0].center_lng}
              radiusMiles={client?.catchment_radius_miles ?? 0}
            />
          ) : (
            <div className="rounded border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
              Center coordinates not yet configured.
            </div>
          )}
        </div>
      )}

      {catchmentType === "territory_list" && (
        <div className="rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="mb-1 text-base font-semibold text-foreground">Territory list</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Your directory surfaces providers from the following territories.
          </p>
          {territories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No territories assigned.</p>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {territories.map(t => (
                <li key={t.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {t.name}{t.state ? `, ${t.state}` : ""}
                    </p>
                    {t.center_lat != null && (
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                        {t.center_lat.toFixed(4)}°, {t.center_lng?.toFixed(4)}°
                        {t.boundary_radius_miles != null ? ` · ${t.boundary_radius_miles} mi radius` : ""}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Read-only notice */}
      <div className="flex items-start gap-3 rounded-lg border border-border bg-background px-4 py-3">
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
          className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true"
        >
          <path fillRule="evenodd" clipRule="evenodd"
            d="M8 1a7 7 0 100 14A7 7 0 008 1zm.75 4a.75.75 0 00-1.5 0v3.25a.75.75 0 001.5 0V5zm-.75 6a.875.875 0 100-1.75A.875.875 0 008 11z"
          />
        </svg>
        <p className="text-sm text-muted-foreground">
          To change your catchment area, contact{" "}
          <a href="mailto:support@civicserviceindex.com" className="text-primary underline underline-offset-2">
            CSI support
          </a>
          . Catchment is configured during onboarding.
        </p>
      </div>
    </div>
  )
}

export default function CatchmentPageWrapper() {
  return (
    <Suspense>
      <CatchmentPage />
    </Suspense>
  )
}
