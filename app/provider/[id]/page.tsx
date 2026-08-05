import type { Metadata } from 'next'
import { getClient, getClientBySlug, getProvider } from '@/lib/api'
import { NavHeader } from '@/components/NavHeader'
import { PageFooter } from '@/components/PageFooter'
import { ProviderDetail } from '@/components/provider/ProviderDetail'

interface ProviderPageProps {
  params: { id: string }
  searchParams: { client_id?: string; slug?: string }
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

async function resolveClient(searchParams: { client_id?: string; slug?: string }) {
  if (searchParams.slug) {
    try {
      return await getClientBySlug(searchParams.slug)
    } catch {
      return null
    }
  }
  if (searchParams.client_id) {
    try {
      return await getClient(searchParams.client_id)
    } catch {
      return null
    }
  }
  return null
}

export async function generateMetadata({
  params,
  searchParams,
}: ProviderPageProps): Promise<Metadata> {
  const client = await resolveClient(searchParams)
  const clientId = client?.id ?? ''
  try {
    const provider = await getProvider(params.id, clientId)
    return { title: `${provider.name} — CommonReach` }
  } catch {
    return { title: 'Provider — CommonReach' }
  }
}

export default async function ProviderPage({
  params,
  searchParams,
}: ProviderPageProps) {
  const client = await resolveClient(searchParams)
  const clientId = client?.id ?? ''
  const slug = searchParams.slug ?? ''

  const provider = clientId
    ? await getProvider(params.id, clientId).catch(() => null)
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ds-bg-subtle)' }}>
      <NavHeader cityName={slug && client?.name ? slugToDisplayName(slug, client.name) : (client?.name ?? '')} clientId={clientId} slug={slug || undefined} logoUrl={client?.theme_config?.logo_url} />

      <main id="main-content" className="p-4 sm:p-6" style={{ flex: 1, maxWidth: '42rem', width: '100%', margin: '0 auto' }}>
        {!provider ? (
          <div
            role="alert"
            style={{
              borderRadius: 'var(--ds-radius-lg)',
              border: '1px solid var(--ds-border-error)',
              backgroundColor: 'var(--ds-error-light)',
              padding: 'var(--ds-space-3) var(--ds-space-4)',
              fontSize: 'var(--ds-text-sm)',
              color: 'var(--ds-error-base)',
            }}
          >
            {clientId ? 'Provider not found or unavailable.' : 'No client supplied. Cannot load provider.'}
          </div>
        ) : (
          <ProviderDetail provider={provider} clientId={clientId} slug={slug} />
        )}
      </main>

      <PageFooter />
    </div>
  )
}
