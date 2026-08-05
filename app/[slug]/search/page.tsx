import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getClientBySlug, getSearchSchema } from '@/lib/api'
import { NavHeader } from '@/components/NavHeader'
import { PageFooter } from '@/components/PageFooter'
import { TaxonomySearchClient } from '@/components/search/TaxonomySearchClient'
import type { SearchFilterSchema } from '@/lib/types'

interface SlugSearchPageProps {
  params: { slug: string }
}

function slugToDisplayName(slug: string, fallback: string): string {
  const parts = slug.split('-')
  const last = parts[parts.length - 1]
  if (last.length === 2 && /^[a-z]{2}$/.test(last)) {
    const city = fallback.replace(/,\s*$/, '').trim()
    return `${city}, ${last.toUpperCase()}`
  }
  return fallback
}

const EMPTY_SCHEMA: SearchFilterSchema = {
  client_id: '',
  domains: [],
  subcategories: [],
  service_tags: [],
  population_tags: [],
  language_tags: [],
  insurance_tags: [],
  age_tags: [],
  active_filters: [],
  city_center_lat: null,
  city_center_lng: null,
}

export async function generateMetadata({
  params,
}: SlugSearchPageProps): Promise<Metadata> {
  try {
    const client = await getClientBySlug(params.slug)
    return { title: `${client.name} Services — CommonReach` }
  } catch {
    return { title: 'Services — CommonReach' }
  }
}

export default async function SlugSearchPage({ params }: SlugSearchPageProps) {
  const { slug } = params

  let client
  try {
    client = await getClientBySlug(slug)
    console.log('[search] client resolved:', client?.id, client?.name)
  } catch (err) {
    console.error('[search] getClientBySlug failed:', err)
    notFound()
  }
  if (!client) notFound()

  const schema = await getSearchSchema(client.id).catch((err) => {
    console.error('[search] getSearchSchema failed:', err)
    return null
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ds-bg-subtle)', overflowX: 'hidden' }}>
      <NavHeader cityName={slugToDisplayName(slug, client.name)} clientId={client.id} slug={slug} logoUrl={client.theme_config?.logo_url} />

      <main id="main-content" className="p-4 sm:p-6" style={{ flex: 1, maxWidth: '72rem', width: '100%', margin: '0 auto' }}>
        <Suspense
          fallback={
            <div className="space-y-4">
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
              <div className="flex-1 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          }
        >
          <TaxonomySearchClient
            client={client}
            schema={schema ?? EMPTY_SCHEMA}
            slug={slug}
          />
        </Suspense>
      </main>

      <PageFooter />
    </div>
  )
}
