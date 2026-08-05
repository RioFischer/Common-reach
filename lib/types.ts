// Types mirror the Pydantic response schemas defined in the FastAPI backend.
// Keep in sync with /backend/app/schemas/*.py

// ── Theme ─────────────────────────────────────────────────────────────────────

export interface TypographyToken {
  font_family: string
  weight: number
  size_rem: number
  line_height: number
  letter_spacing_em: number
}

/**
 * Full ThemeConfig token system — mirrors app/schemas/theme.py.
 * All fields are optional on the TypeScript side (backend always returns defaults,
 * but callers may supply partial configs for overrides).
 */
export interface ThemeConfig {
  // Identity
  logo_url?: string | null
  client_name?: string

  // Colours (#rrggbb hex)
  color_primary?: string
  color_accent?: string
  color_surface?: string
  color_background?: string
  color_on_surface?: string
  color_on_background?: string
  color_error?: string
  color_border?: string
  color_disabled?: string
  color_focus?: string

  // Typography
  typography_h1?: TypographyToken
  typography_h2?: TypographyToken
  typography_h3?: TypographyToken
  typography_body?: TypographyToken
  typography_small?: TypographyToken
  typography_label?: TypographyToken

  // Corner radius (rem)
  radius_sm?: number
  radius_md?: number
  radius_lg?: number
  radius_full?: number

  // Extraction metadata
  extraction_source?: string | null
  extraction_confidence?: number | null
}

/**
 * Resolved theme — derived by resolveTheme() for non-CSS uses
 * (logo display, font preloading, client name in NavHeader).
 */
export interface ResolvedTheme {
  logoUrl: string | null
  clientName: string | null
  googleFontUrl: string | null    // combined URL for all non-system fonts in the config
}

// ── Client ────────────────────────────────────────────────────────────────────

export type DisplayMode = 'provider' | 'program'

export interface Client {
  id: string
  name: string
  slug?: string
  contact_email: string | null
  billing_status: string
  catchment_type: string | null
  catchment_radius_miles: number | null
  catchment_territory_ids: string[]
  enabled_domains: string[]
  active_filters: string[]
  theme_config: ThemeConfig | null
  directory_display_mode: DisplayMode
  created_at: string
}

export interface ClientListResponse {
  clients: Client[]
  total: number
}

// ── Territory ─────────────────────────────────────────────────────────────────

export interface Territory {
  id: string
  name: string
  state: string | null
  center_lat: number | null
  center_lng: number | null
  boundary_radius_miles: number | null
  created_at: string
}

// ── Provider ──────────────────────────────────────────────────────────────────

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'failed'

/**
 * A program-mode search result — mirrors app/schemas/search.py:ProgramCard.
 * Providers with zero programs still produce exactly one card
 * (`is_provider_fallback: true`), content-identical to their provider-mode card.
 */
export interface ProgramCard {
  type: 'program'
  id: string
  provider_id: string
  provider_name: string
  is_provider_fallback: boolean
  name: string
  description: string | null
  address: string | null
  phone: string | null
  website: string | null
  email: string | null
  hours: string | null
  verification_status: VerificationStatus
  confidence_score: number | null
  last_verified_at: string | null
  website_verified_at: string | null
  /** Resident-facing trust badges, inherited from the parent provider. */
  data_verified: boolean
  community_verified: boolean
  distance_miles: number | null
  lat: number | null
  lng: number | null
  service_tags: string[]
  population_tags: string[]
  language_tags: string[]
  age_tags: string[]
}

export interface ProviderCard {
  type: 'provider'
  id: string
  name: string
  address: string | null
  phone: string | null
  website: string | null
  verification_status: VerificationStatus
  confidence_score: number | null
  last_verified_at: string | null
  website_verified_at: string | null
  data_verified: boolean
  community_verified: boolean
  distance_miles: number | null
  lat: number | null
  lng: number | null
  domains: string[]
  subcategories: string[]
  service_tags: string[]
  population_tags: string[]
  language_tags: string[]
  age_tags: string[]
  email: string | null
  hours: string | null
  // Programs this provider runs — own tags/effective contact fields already
  // resolved server-side. Empty unless the provider has ≥1 active program.
  programs: ProgramCard[]
}

export interface ProviderListResponse {
  providers: ProviderCard[]
  total: number
  page: number
  page_size: number
}

// ── Program (admin) ──────────────────────────────────────────────────────────

/** Full program detail — mirrors app/schemas/program.py:ProgramResponse. */
export interface Program {
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
  created_at: string
  updated_at: string
  data_verified: boolean
  community_verified: boolean
  service_tags: string[]
  population_tags: string[]
  language_tags: string[]
  insurance_tags: string[]
  age_tags: string[]
}

/** Tag id sets for a program — mirrors ProgramTagsUpdateRequest. No subcategory
 * dimension — the domain/category/subcategory hierarchy is deprecated. */
export interface ProgramTagIds {
  service_tag_ids: string[]
  population_tag_ids: string[]
  language_tag_ids: string[]
  insurance_tag_ids: string[]
  age_tag_ids: string[]
}

// ── Search ────────────────────────────────────────────────────────────────────

export interface SearchResult {
  total: number
  page: number
  page_size: number
  display_mode: DisplayMode
  results: (ProviderCard | ProgramCard)[]
  filter_counts: Record<string, Record<string, number>>
}

export interface SearchFilterSchema {
  client_id: string
  domains: string[]
  subcategories: string[]
  service_tags: string[]
  population_tags: string[]
  language_tags: string[]
  insurance_tags: string[]
  age_tags: string[]
  active_filters: string[]
  city_center_lat: number | null
  city_center_lng: number | null
}

export interface SearchParams {
  client_id: string
  q?: string
  zip_code?: string
  lat?: number
  lng?: number
  radius_miles?: number
  domain?: string
  subcategory?: string
  service_tags?: string[]
  service_tag_ids?: string[]
  population_tags?: string[]
  language_tags?: string[]
  insurance_tags?: string[]
  age_tags?: string[]
  sort_by?: 'distance' | 'alphabetical' | 'recently_verified'
  page?: number
  page_size?: number
}

// ── Taxonomy ──────────────────────────────────────────────────────────────────

export interface TaxonomyNode {
  id: string
  parent_id: string | null
  level: number
  slug: string
  label: string
  label_user_facing: string
  sort_order: number
  provider_count: number
  service_tag_ids: string[]
}

export interface TaxonomyTreeResponse {
  nodes: TaxonomyNode[]
}
