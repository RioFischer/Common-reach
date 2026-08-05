import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { getClientBySlug, getSearchSchema } from '@/lib/api'
import { TaxonomySearchClient } from '@/components/search/TaxonomySearchClient'
import type { SearchFilterSchema } from '@/lib/types'

interface EmbedSearchPageProps {
  params: { slug: string }
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

export default async function EmbedSearchPage({ params }: EmbedSearchPageProps) {
  const { slug } = params

  let client
  try {
    client = await getClientBySlug(slug)
  } catch {
    notFound()
  }
  if (!client) notFound()

  const schema = await getSearchSchema(client.id).catch(() => null)

  return (
    <main
      id="main-content"
      className="p-3 sm:p-5"
      style={{
        maxWidth: '72rem',
        width: '100%',
        margin: '0 auto',
        backgroundColor: 'var(--ds-bg-subtle)',
      }}
    >
      <Suspense fallback={
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ height: '96px', borderRadius: 'var(--ds-radius-lg)', backgroundColor: 'var(--ds-bg-muted)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      }>
        <TaxonomySearchClient
          client={client}
          schema={schema ?? EMPTY_SCHEMA}
          slug={slug}
          embedMode
        />
      </Suspense>
    </main>
  )
}
