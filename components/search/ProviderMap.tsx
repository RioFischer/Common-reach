'use client'

import { useEffect, useRef } from 'react'
import type { ProgramCard, ProviderCard } from '@/lib/types'

function markerDomains(p: ProviderCard | ProgramCard): string[] {
  // ProgramCard has no domains field (the domain/category/subcategory
  // hierarchy is deprecated) — only real providers carry domain data.
  return p.type === 'provider' ? p.domains : []
}

function markerHref(
  p: ProviderCard | ProgramCard,
  slug: string | undefined,
  clientId: string,
): string {
  const isProgram = p.type === 'program' && !p.is_provider_fallback
  const basePath = isProgram ? '/program' : '/provider'
  return slug ? `${basePath}/${p.id}?slug=${slug}` : `${basePath}/${p.id}?client_id=${clientId}`
}

interface ProviderMapProps {
  providers: (ProviderCard | ProgramCard)[]
  userLat: number | null
  userLng: number | null
  cityLat: number | null
  cityLng: number | null
  slug?: string
  clientId: string
}

// Leaflet is loaded dynamically to avoid SSR issues (it accesses window/document)
export function ProviderMap({
  providers,
  userLat,
  userLng,
  cityLat,
  cityLng,
  slug,
  clientId,
}: ProviderMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const providersRef = useRef(providers)

  // Center: user location > city center > fallback
  const centerLat = userLat ?? cityLat ?? 42.4851
  const centerLng = userLng ?? cityLng ?? -71.4328
  const zoom = userLat || cityLat ? 12 : 10

  // Keep ref in sync so initMap can read the latest providers after async init
  providersRef.current = providers

  useEffect(() => {
    if (!containerRef.current) return

    let L: any

    async function initMap() {
      // Dynamic import — Leaflet cannot run on the server
      L = await import('leaflet')

      // Fix default marker icon paths broken by webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      if (mapRef.current) {
        mapRef.current.remove()
      }

      const map = L.map(containerRef.current!).setView([centerLat, centerLng], zoom)
      mapRef.current = map

      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/">CARTO</a>',
        maxZoom: 19,
      }).addTo(map)

      // User location marker (distinct color)
      if (userLat && userLng) {
        const userIcon = L.divIcon({
          className: '',
          html: `<div style="width:14px;height:14px;border-radius:50%;background:hsl(var(--color-primary));border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4)"></div>`,
          iconAnchor: [7, 7],
        })
        L.marker([userLat, userLng], { icon: userIcon })
          .addTo(map)
          .bindPopup('<strong>Your location</strong>')
      }

      // Provider markers — use ref so we pick up any providers that arrived during async init
      markersRef.current = []
      for (const p of providersRef.current) {
        if (p.lat == null || p.lng == null) continue

        const detailHref = markerHref(p, slug, clientId)

        const popup = `
          <div style="min-width:180px;font-family:inherit">
            <p style="font-weight:600;margin:0 0 4px">${p.name}</p>
            ${p.address ? `<p style="margin:0 0 4px;font-size:12px;color:#666">${p.address}</p>` : ''}
            ${p.phone ? `<p style="margin:0 0 4px;font-size:12px"><a href="tel:${p.phone}">${p.phone}</a></p>` : ''}
            ${markerDomains(p).length ? `<p style="margin:0 0 6px;font-size:12px;color:#444">${markerDomains(p).join(", ")}</p>` : ""}
            <a href="${detailHref}" style="font-size:12px;color:hsl(var(--color-primary))">View details →</a>
          </div>`

        const marker = L.marker([p.lat, p.lng]).addTo(map).bindPopup(popup)
        markersRef.current.push(marker)
      }
    }

    initMap()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update markers when providers change without re-initialising the map
  useEffect(() => {
    if (!mapRef.current) return

    import('leaflet').then((L) => {
      // Remove old markers
      for (const m of markersRef.current) m.remove()
      markersRef.current = []

      for (const p of providers) {
        if (p.lat == null || p.lng == null) continue

        const detailHref = markerHref(p, slug, clientId)

        const popup = `
          <div style="min-width:180px;font-family:inherit">
            <p style="font-weight:600;margin:0 0 4px">${p.name}</p>
            ${p.address ? `<p style="margin:0 0 4px;font-size:12px;color:#666">${p.address}</p>` : ''}
            ${p.phone ? `<p style="margin:0 0 4px;font-size:12px"><a href="tel:${p.phone}">${p.phone}</a></p>` : ''}
            ${markerDomains(p).length ? `<p style="margin:0 0 6px;font-size:12px;color:#444">${markerDomains(p).join(", ")}</p>` : ""}
            <a href="${detailHref}" style="font-size:12px;color:hsl(var(--color-primary))">View details →</a>
          </div>`

        const marker = (L as any).marker([p.lat, p.lng]).addTo(mapRef.current).bindPopup(popup)
        markersRef.current.push(marker)
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providers])

  const withCoords = providers.filter(p => p.lat != null && p.lng != null).length

  return (
    <div>
      <div
        ref={containerRef}
        className="w-full rounded-lg border border-border overflow-hidden"
        style={{ height: 'clamp(300px, 55vh, 480px)' }}
        role="application"
        aria-label={`Map showing ${withCoords} provider locations`}
      />
      {withCoords < providers.length && (
        <p className="mt-1 text-xs text-muted-foreground">
          {withCoords} of {providers.length} results have map locations
        </p>
      )}
    </div>
  )
}
