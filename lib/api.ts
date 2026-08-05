import type {
  Client,
  ClientListResponse,
  Program,
  ProviderCard,
  SearchFilterSchema,
  SearchParams,
  SearchResult,
  TaxonomyTreeResponse,
} from '@/lib/types'

// ── Error type ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BASE_URL}${path}`
  let response: Response

  try {
    response = await fetch(url, {
      // Opt out of Next.js Data Cache on the server so theme changes apply immediately.
      // Only applied server-side: in the browser `cache: 'no-store'` adds a
      // Cache-Control request header that can fail CORS preflight checks.
      ...(typeof window === 'undefined' ? { cache: 'no-store' as RequestCache } : {}),
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    })
  } catch {
    throw new ApiError(0, `Network error: unable to reach ${url}`)
  }

  if (!response.ok) {
    let message = `Request failed: ${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.detail) {
        message = Array.isArray(body.detail)
          ? body.detail.map((e: { msg?: string }) => e.msg ?? String(e)).join(', ')
          : String(body.detail)
      }
    } catch {
      // ignore JSON parse failure; use the status text message
    }
    throw new ApiError(response.status, message)
  }

  return response.json() as Promise<T>
}

// ── Query string helper ───────────────────────────────────────────────────────

function toQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    if (Array.isArray(value)) {
      for (const item of value) qs.append(key, String(item))
    } else {
      qs.set(key, String(value))
    }
  }
  const str = qs.toString()
  return str ? `?${str}` : ''
}

// ── Client endpoints ──────────────────────────────────────────────────────────

export async function getClients(): Promise<ClientListResponse> {
  return apiFetch<ClientListResponse>('/api/v1/clients')
}

export async function getClient(clientId: string): Promise<Client> {
  return apiFetch<Client>(`/api/v1/clients/${clientId}`)
}

export async function getClientBySlug(slug: string): Promise<Client> {
  return apiFetch<Client>(`/api/v1/clients/by-slug/${slug}`)
}

// ── Provider endpoints ────────────────────────────────────────────────────────

export async function getProvider(
  providerId: string,
  clientId: string,
): Promise<ProviderCard> {
  return apiFetch<ProviderCard>(
    `/api/v1/providers/${providerId}${toQueryString({ client_id: clientId })}`,
  )
}

// ── Program endpoints ─────────────────────────────────────────────────────────

export async function getProgram(
  programId: string,
  clientId: string,
): Promise<Program> {
  return apiFetch<Program>(
    `/api/v1/programs/${programId}${toQueryString({ client_id: clientId })}`,
  )
}

// ── Search endpoints ──────────────────────────────────────────────────────────

export async function searchProviders(
  params: SearchParams,
): Promise<SearchResult> {
  return apiFetch<SearchResult>(
    `/api/v1/search${toQueryString(params as unknown as Record<string, unknown>)}`,
  )
}

export async function getSearchSchema(
  clientId: string,
): Promise<SearchFilterSchema> {
  return apiFetch<SearchFilterSchema>(`/api/v1/search/schema/${clientId}`)
}

// ── Contact endpoint ──────────────────────────────────────────────────────────

export interface ContactPayload {
  name: string
  sender_email?: string
  sender_phone?: string
  message: string
  preference: 'email' | 'phone' | 'text'
  language: string
}

export async function submitContact(providerId: string, payload: ContactPayload): Promise<void> {
  await apiFetch<void>(`/api/v1/providers/${providerId}/contact`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ── Taxonomy endpoints ────────────────────────────────────────────────────────

export async function getTaxonomyTree(clientId?: string): Promise<TaxonomyTreeResponse> {
  const qs = clientId ? `?client_id=${encodeURIComponent(clientId)}` : ''
  return apiFetch<TaxonomyTreeResponse>(`/api/v1/taxonomy/tree${qs}`)
}
