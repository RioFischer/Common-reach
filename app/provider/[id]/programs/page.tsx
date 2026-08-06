import type { Metadata } from 'next'
import Link from 'next/link'
import { getClient, getClientBySlug, getProvider } from '@/lib/api'
import { NavHeader } from '@/components/NavHeader'
import { PageFooter } from '@/components/PageFooter'
import { ProgramResultCard } from '@/components/search/ProgramResultCard'

interface ProviderProgramsPageProps {
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
}: ProviderProgramsPageProps): Promise<Metadata> {
  const client = await resolveClient(searchParams)
  const clientId = client?.id ?? ''
  try {
    const provider = await getProvider(params.id, clientId)
    return { title: `Programs at ${provider.name} — CommonReach` }
  } catch {
    return { title: 'Programs — CommonReach' }
  }
}

export default async function ProviderProgramsPage({
  params,
  searchParams,
}: ProviderProgramsPageProps) {
  const client = await resolveClient(searchParams)
  const clientId = client?.id ?? ''
  const slug = searchParams.slug ?? ''

  const provider = clientId
    ? await getProvider(params.id, clientId).catch(() => null)
    : null

  const backHref = slug ? `/${slug}/search` : `/search?client_id=${clientId}`
  const providerHref = slug ? `/provider/${params.id}?slug=${slug}` : `/provider/${params.id}?client_id=${clientId}`

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-6)' }}>
            <nav aria-label="Breadcrumb">
              <Link
                href={backHref}
                style={{
                  fontSize: 'var(--ds-text-sm)',
                  color: 'var(--ds-text-tertiary)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--ds-font-sans)',
                }}
              >
                ← Back to results
              </Link>
            </nav>

            <header>
              <h1 style={{ margin: 0, fontSize: 'var(--ds-text-2xl)', fontWeight: 700, color: 'var(--ds-text-primary)', fontFamily: 'var(--ds-font-sans)' }}>
                Programs at {provider.name}
              </h1>
              <p style={{ margin: '4px 0 0', fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>
                <Link href={providerHref} style={{ color: 'var(--ds-brand-600)', textDecoration: 'none' }}>
                  View contact info & details ↗
                </Link>
              </p>
            </header>

            {provider.programs.length === 0 ? (
              <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)', fontFamily: 'var(--ds-font-sans)' }}>
                This provider doesn&apos;t have any programs listed yet.
              </p>
            ) : (
              <ol aria-label={`${provider.programs.length} programs at ${provider.name}`} style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-3)' }}>
                {provider.programs.map(program => (
                  <li key={program.id}>
                    <ProgramResultCard program={program} clientId={clientId} slug={slug || undefined} />
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}
      </main>

      <PageFooter />
    </div>
  )
}
