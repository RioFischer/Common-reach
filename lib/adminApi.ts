/**
 * Auth-aware API helpers for admin dashboard features.
 * All calls include the current access token; token refresh is attempted on 401.
 */

import { getAccessToken, refreshAccessToken } from "@/lib/auth"
import type { Client, DisplayMode, ProgramTagIds, ThemeConfig } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ""

// ── Typed responses ───────────────────────────────────────────────────────────

export interface ProviderWithVisibility {
  id: string
  name: string
  address: string | null
  verification_status: string
  is_hidden: boolean
}

export interface ProviderWithVisibilityList {
  providers: ProviderWithVisibility[]
  total: number
  page: number
  page_size: number
}

export interface TerritoryInfo {
  id: string
  name: string
  state: string | null
  center_lat: number | null
  center_lng: number | null
  boundary_radius_miles: number | null
}

// ── Core fetch ────────────────────────────────────────────────────────────────

async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const go = async () => {
    const token = getAccessToken()
    return fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  }

  let res = await go()

  // Attempt one token refresh on 401
  if (res.status === 401) {
    const refreshed = await refreshAccessToken()
    if (refreshed) res = await go()
  }

  if (!res.ok) {
    let detail = `${res.status} ${res.statusText}`
    try {
      const body = await res.json()
      if (body?.detail) detail = String(body.detail)
    } catch { /* ignore */ }
    throw new Error(detail)
  }

  // 204 No Content
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

// ── Client ────────────────────────────────────────────────────────────────────

export async function getClient(clientId: string): Promise<Client> {
  return adminFetch<Client>(`/api/v1/clients/${clientId}`)
}

export async function getClients(): Promise<{ clients: Client[]; total: number }> {
  return adminFetch<{ clients: Client[]; total: number }>("/api/v1/clients")
}

// ── Theme ─────────────────────────────────────────────────────────────────────

export async function updateTheme(clientId: string, config: ThemeConfig): Promise<ThemeConfig> {
  return adminFetch<ThemeConfig>(`/api/v1/clients/${clientId}/theme`, {
    method: "PUT",
    body: JSON.stringify(config),
  })
}

// ── Client settings (display mode, etc.) ─────────────────────────────────────

export async function updateClientSettings(
  clientId: string,
  data: { directory_display_mode?: DisplayMode },
): Promise<Client> {
  return adminFetch<Client>(`/api/v1/clients/${clientId}/settings`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })
}

// ── Provider visibility ───────────────────────────────────────────────────────

export async function listProvidersWithVisibility(
  clientId: string,
  page = 1,
  pageSize = 50,
  q?: string,
): Promise<ProviderWithVisibilityList> {
  const params = new URLSearchParams({ page: String(page), page_size: String(pageSize) })
  if (q) params.set("q", q)
  return adminFetch<ProviderWithVisibilityList>(
    `/api/v1/clients/${clientId}/providers?${params}`,
  )
}

export async function setProviderVisibility(
  clientId: string,
  providerId: string,
  isHidden: boolean,
): Promise<{ provider_id: string; is_hidden: boolean }> {
  return adminFetch(`/api/v1/clients/${clientId}/providers/${providerId}/visibility`, {
    method: "PATCH",
    body: JSON.stringify({ is_hidden: isHidden }),
  })
}

// ── Territories ───────────────────────────────────────────────────────────────

export async function getTerritory(territoryId: string): Promise<TerritoryInfo> {
  return adminFetch<TerritoryInfo>(`/api/v1/territories/${territoryId}`)
}

export async function listTerritories(): Promise<{ territories: TerritoryInfo[]; total: number }> {
  return adminFetch<{ territories: TerritoryInfo[]; total: number }>("/api/v1/territories")
}

// ── Admin provider CRUD ───────────────────────────────────────────────────────

export interface AdminProviderRow {
  id: string
  name: string
  address: string | null
  phone: string | null
  website: string | null
  territory_id: string | null
  territory_name: string | null
  verification_status: string
  confidence_score: number | null
  is_active: boolean
  latitude: number | null
  longitude: number | null
  data_verified: boolean
  community_verified: boolean
}

export interface AdminProviderListResponse {
  providers: AdminProviderRow[]
  total: number
  page: number
  page_size: number
}

export interface ProviderCreateRequest {
  name: string
  territory_id?: string | null
  address?: string | null
  phone?: string | null
  website?: string | null
  verification_status?: string
  latitude?: number | null
  longitude?: number | null
  data_verified?: boolean
  community_verified?: boolean
}

export async function listAdminProviders(params: {
  q?: string
  territory_id?: string
  verification_status?: string
  include_inactive?: boolean
  page?: number
  page_size?: number
}): Promise<AdminProviderListResponse> {
  const p = new URLSearchParams()
  if (params.q) p.set("q", params.q)
  if (params.territory_id) p.set("territory_id", params.territory_id)
  if (params.verification_status) p.set("verification_status", params.verification_status)
  if (params.include_inactive) p.set("include_inactive", "true")
  p.set("page", String(params.page ?? 1))
  p.set("page_size", String(params.page_size ?? 50))
  return adminFetch<AdminProviderListResponse>(`/api/v1/admin/providers?${p}`)
}

export async function createProvider(data: ProviderCreateRequest): Promise<AdminProviderRow> {
  return adminFetch<AdminProviderRow>("/api/v1/admin/providers", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateProvider(
  id: string,
  data: Partial<ProviderCreateRequest> & { is_active?: boolean },
): Promise<AdminProviderRow> {
  return adminFetch<AdminProviderRow>(`/api/v1/admin/providers/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteProvider(id: string): Promise<void> {
  return adminFetch<void>(`/api/v1/admin/providers/${id}`, { method: "DELETE" })
}

// ── Admin taxonomy ────────────────────────────────────────────────────────────

export interface DomainRow { id: string; client_id: string; name: string }
export interface CategoryRow { id: string; domain_id: string; name: string }
export interface SubcategoryRow { id: string; category_id: string; name: string; usage_count: number }
export interface TagRow { id: string; name: string; usage_count: number }

export type TagType = "service_tags" | "population_tags" | "language_tags" | "insurance_tags"

export async function listDomains(client_id?: string): Promise<DomainRow[]> {
  const p = client_id ? `?client_id=${client_id}` : ""
  return adminFetch<DomainRow[]>(`/api/v1/admin/taxonomy/domains${p}`)
}

export async function createDomain(client_id: string, name: string): Promise<DomainRow> {
  return adminFetch<DomainRow>("/api/v1/admin/taxonomy/domains", {
    method: "POST",
    body: JSON.stringify({ client_id, name }),
  })
}

export async function updateDomain(id: string, name: string): Promise<DomainRow> {
  return adminFetch<DomainRow>(`/api/v1/admin/taxonomy/domains/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export async function deleteDomain(id: string): Promise<void> {
  return adminFetch<void>(`/api/v1/admin/taxonomy/domains/${id}`, { method: "DELETE" })
}

export async function listCategories(domain_id?: string): Promise<CategoryRow[]> {
  const p = domain_id ? `?domain_id=${domain_id}` : ""
  return adminFetch<CategoryRow[]>(`/api/v1/admin/taxonomy/categories${p}`)
}

export async function createCategory(domain_id: string, name: string): Promise<CategoryRow> {
  return adminFetch<CategoryRow>("/api/v1/admin/taxonomy/categories", {
    method: "POST",
    body: JSON.stringify({ domain_id, name }),
  })
}

export async function updateCategory(id: string, name: string): Promise<CategoryRow> {
  return adminFetch<CategoryRow>(`/api/v1/admin/taxonomy/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export async function deleteCategory(id: string): Promise<void> {
  return adminFetch<void>(`/api/v1/admin/taxonomy/categories/${id}`, { method: "DELETE" })
}

export async function listSubcategories(category_id?: string): Promise<SubcategoryRow[]> {
  const p = category_id ? `?category_id=${category_id}` : ""
  return adminFetch<SubcategoryRow[]>(`/api/v1/admin/taxonomy/subcategories${p}`)
}

export async function createSubcategory(category_id: string, name: string): Promise<SubcategoryRow> {
  return adminFetch<SubcategoryRow>("/api/v1/admin/taxonomy/subcategories", {
    method: "POST",
    body: JSON.stringify({ category_id, name }),
  })
}

export async function updateSubcategory(id: string, name: string): Promise<SubcategoryRow> {
  return adminFetch<SubcategoryRow>(`/api/v1/admin/taxonomy/subcategories/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export async function deleteSubcategory(id: string): Promise<void> {
  return adminFetch<void>(`/api/v1/admin/taxonomy/subcategories/${id}`, { method: "DELETE" })
}

export async function listTags(tagType: TagType): Promise<TagRow[]> {
  return adminFetch<TagRow[]>(`/api/v1/admin/taxonomy/${tagType}`)
}

export async function createTag(tagType: TagType, name: string): Promise<TagRow> {
  return adminFetch<TagRow>(`/api/v1/admin/taxonomy/${tagType}`, {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function updateTag(tagType: TagType, id: string, name: string): Promise<TagRow> {
  return adminFetch<TagRow>(`/api/v1/admin/taxonomy/${tagType}/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  })
}

export async function deleteTag(tagType: TagType, id: string): Promise<void> {
  return adminFetch<void>(`/api/v1/admin/taxonomy/${tagType}/${id}`, { method: "DELETE" })
}

// ── Admin client onboarding ───────────────────────────────────────────────────

export interface ClientOnboardRequest {
  client_name: string
  contact_email?: string | null
  billing_status?: string
  enabled_domains?: string[]
  active_filters?: string[]
  catchment_type?: string
  territory_name: string
  territory_state?: string | null
  center_lat?: number | null
  center_lng?: number | null
  boundary_radius_miles?: number | null
  catchment_radius_miles?: number | null
  user_email: string
  user_password: string
}

export interface ClientOnboardResponse {
  client_id: string
  client_name: string
  territory_id: string
  user_id: string
  user_email: string
  api_key: string
}

export async function onboardClient(data: ClientOnboardRequest): Promise<ClientOnboardResponse> {
  return adminFetch<ClientOnboardResponse>("/api/v1/admin/clients", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

// ── Admin program CRUD ────────────────────────────────────────────────────────

export interface AdminProgramRow {
  id: string
  provider_id: string
  provider_name: string
  name: string
  description: string | null
  phone: string | null
  email: string | null
  hours: string | null
  address: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  is_active: boolean
}

export interface AdminProgramDetail extends AdminProgramRow {
  tags: ProgramTagIds
}

export interface AdminProgramListResponse {
  programs: AdminProgramRow[]
  total: number
  page: number
  page_size: number
}

export interface ProgramCreateRequest {
  provider_id: string
  name: string
  description?: string | null
  phone?: string | null
  email?: string | null
  hours?: string | null
  address?: string | null
  website?: string | null
  latitude?: number | null
  longitude?: number | null
}

export async function listAdminPrograms(params: {
  provider_id?: string
  q?: string
  include_inactive?: boolean
  page?: number
  page_size?: number
}): Promise<AdminProgramListResponse> {
  const p = new URLSearchParams()
  if (params.provider_id) p.set("provider_id", params.provider_id)
  if (params.q) p.set("q", params.q)
  if (params.include_inactive) p.set("include_inactive", "true")
  p.set("page", String(params.page ?? 1))
  p.set("page_size", String(params.page_size ?? 50))
  return adminFetch<AdminProgramListResponse>(`/api/v1/admin/programs?${p}`)
}

export async function getAdminProgram(id: string): Promise<AdminProgramDetail> {
  return adminFetch<AdminProgramDetail>(`/api/v1/admin/programs/${id}`)
}

export async function createProgram(data: ProgramCreateRequest): Promise<AdminProgramRow> {
  return adminFetch<AdminProgramRow>("/api/v1/admin/programs", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateProgram(
  id: string,
  data: Partial<Omit<ProgramCreateRequest, "provider_id">> & { is_active?: boolean },
): Promise<AdminProgramRow> {
  return adminFetch<AdminProgramRow>(`/api/v1/admin/programs/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteProgram(id: string): Promise<void> {
  return adminFetch<void>(`/api/v1/admin/programs/${id}`, { method: "DELETE" })
}

export async function updateProgramTags(id: string, tags: ProgramTagIds): Promise<AdminProgramRow> {
  return adminFetch<AdminProgramRow>(`/api/v1/admin/programs/${id}/tags`, {
    method: "PUT",
    body: JSON.stringify(tags),
  })
}

// ── Tag vocabulary (for the Program tag-assignment widget) ───────────────────

export interface TagVocabularyItem {
  id: string
  name: string
}

export interface TagVocabularyResponse {
  service_tags: TagVocabularyItem[]
  population_tags: TagVocabularyItem[]
  language_tags: TagVocabularyItem[]
  insurance_tags: TagVocabularyItem[]
  age_tags: TagVocabularyItem[]
}

export async function getTagVocabulary(): Promise<TagVocabularyResponse> {
  return adminFetch<TagVocabularyResponse>("/api/v1/admin/programs/tag-vocabulary")
}
