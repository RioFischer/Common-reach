import type { Metadata } from 'next'
import { getClient, getClientBySlug, getProgram } from '@/lib/api'
import { NavHeader } from '@/components/NavHeader'
import { PageFooter } from '@/components/PageFooter'
import { ProgramDetail } from '@/components/provider/ProgramDetail'

interface ProgramPageProps {
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
}: ProgramPageProps): Promise<Metadata> {
  const client = await resolveClient(searchParams)
  const clientId = client?.id ?? ''
  try {
    const program = await getProgram(params.id, clientId)
    return { title: `${program.name} — CommonReach` }
  } catch {
    return { title: 'Program — CommonReach' }
  }
}

export default async function ProgramPage({
  params,
  searchParams,
}: ProgramPageProps) {
  const client = await resolveClient(searchParams)
  const clientId = client?.id ?? ''
  const slug = searchParams.slug ?? ''

  const program = clientId
    ? await getProgram(params.id, clientId).catch(() => null)
    : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--ds-bg-subtle)' }}>
      <NavHeader cityName={slug && client?.name ? slugToDisplayName(slug, client.name) : (client?.name ?? '')} clientId={clientId} slug={slug || undefined} logoUrl={client?.theme_config?.logo_url} />

      <main id="main-content" className="p-4 sm:p-6" style={{ flex: 1, maxWidth: '42rem', width: '100%', margin: '0 auto' }}>
        {!program ? (
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
            {clientId ? 'Program not found or unavailable.' : 'No client supplied. Cannot load program.'}
          </div>
        ) : (
          <ProgramDetail program={program} clientId={clientId} slug={slug} />
        )}
      </main>

      <PageFooter />
    </div>
  )
}
