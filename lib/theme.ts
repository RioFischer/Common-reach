/**
 * White-label theming engine for CommonReach — v2 (full token system).
 *
 * Flow:
 *   1. Backend returns Client.theme_config (full ThemeConfig with all tokens)
 *   2. buildCssBlock(config) converts tokens → :root { … } CSS string
 *   3. ThemeScript injects that string server-side (zero FOUC)
 *   4. applyTheme(config) re-applies on client for SPA navigation
 *   5. resolveTheme(config) extracts logoUrl / clientName / googleFontUrl
 *      for NavHeader and font preloading
 *
 * Colour strategy: hex → HSL channels ("220 85% 38%") stored in CSS variables.
 * Tailwind reads hsl(var(--color-primary)) — the channel format enables the
 * opacity modifier syntax: bg-primary/10 → hsl(var(--color-primary) / 0.1).
 */

import type { ResolvedTheme, ThemeConfig, TypographyToken } from '@/lib/types'

// ── Default token values (match ThemeConfig Pydantic defaults) ────────────────

const DEFAULT_CONFIG: Required<ThemeConfig> = {
  logo_url:              '/brand/logo/commonreach-logo.svg',
  client_name:           'CommonReach',
  color_primary:         '#1C3A2E',
  color_accent:          '#A8C5A0',
  color_surface:         '#FFFFFF',
  color_background:      '#F7F5F0',
  color_on_surface:      '#24211C',
  color_on_background:   '#4A453C',
  color_error:           '#B23B3B',
  color_border:          '#E2DCD0',
  color_disabled:        '#A8A093',
  color_focus:           '#356A57',
  typography_h1:    { font_family: 'DM Serif Display', weight: 400, size_rem: 2.0,   line_height: 1.15, letter_spacing_em: 0 },
  typography_h2:    { font_family: 'DM Serif Display', weight: 400, size_rem: 1.5,   line_height: 1.25, letter_spacing_em: 0 },
  typography_h3:    { font_family: 'DM Sans',          weight: 600, size_rem: 1.25,  line_height: 1.35, letter_spacing_em: 0 },
  typography_body:  { font_family: 'DM Sans',          weight: 400, size_rem: 1.0,   line_height: 1.6,  letter_spacing_em: 0 },
  typography_small: { font_family: 'DM Sans',          weight: 400, size_rem: 0.875, line_height: 1.5,  letter_spacing_em: 0 },
  typography_label: { font_family: 'DM Sans',          weight: 500, size_rem: 0.875, line_height: 1.4,  letter_spacing_em: 0 },
  radius_sm:   0.25,
  radius_md:   0.5,
  radius_lg:   1.0,
  radius_full: 9999,
  extraction_source:     null,
  extraction_confidence: null,
}

// ── Fonts that don't need a Google Fonts request ──────────────────────────────

const SYSTEM_FONTS = new Set([
  'Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Georgia',
  'Helvetica', 'Helvetica Neue', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
  'Palatino Linotype', 'Tahoma', 'Times New Roman', 'Trebuchet MS', 'Verdana',
  'system-ui', 'ui-sans-serif', 'ui-serif', 'ui-monospace',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
])

// ── Colour helpers ────────────────────────────────────────────────────────────

/**
 * Convert a 6-digit CSS hex colour to HSL channel string "H S% L%".
 * Returns null on invalid input so callers can fall back gracefully.
 */
export function hexToHsl(hex: string): string | null {
  const normalised = hex
    .trim()
    .replace(/^#/, '')
    .replace(/^([0-9a-f])([0-9a-f])([0-9a-f])$/i, '$1$1$2$2$3$3')

  if (!/^[0-9a-f]{6}$/i.test(normalised)) return null

  const r = parseInt(normalised.slice(0, 2), 16) / 255
  const g = parseInt(normalised.slice(2, 4), 16) / 255
  const b = parseInt(normalised.slice(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l   = (max + min) / 2
  let h = 0, s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6;               break
      case b: h = ((r - g) / d + 4) / 6;               break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

/** Reduce lightness of an HSL channel string by `amount` percentage points. */
function darken(hsl: string, amount: number): string {
  const m = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  if (!m) return hsl
  return `${m[1]} ${m[2]}% ${Math.max(0, parseInt(m[3], 10) - amount)}%`
}

/** WCAG heuristic: return white or near-black based on background lightness. */
function autoForeground(hsl: string): string {
  const m = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  if (!m) return '0 0% 100%'
  return parseInt(m[3], 10) > 55 ? '220 15% 15%' : '0 0% 100%'
}

// ── Typography helpers ────────────────────────────────────────────────────────

function isSystemFont(fontFamily: string): boolean {
  const base = fontFamily.split(',')[0].trim().replace(/['"]/g, '')
  return SYSTEM_FONTS.has(base)
}

/** Wrap a font name in quotes if it contains spaces, add system fallbacks. */
function cssFontFamily(name: string): string {
  const trimmed = name.trim()
  const quoted  = /\s/.test(trimmed) && !trimmed.startsWith('"') && !trimmed.startsWith("'")
    ? `"${trimmed}"`
    : trimmed
  return `${quoted}, system-ui, sans-serif`
}

/** Generate a combined Google Fonts URL for a list of font family names. */
function buildGoogleFontUrl(families: string[]): string {
  const params = families
    .map(f => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
    .join('&')
  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

// ── Config merger ─────────────────────────────────────────────────────────────

/** Merge a (possibly partial) ThemeConfig with all defaults. */
function mergeConfig(config: ThemeConfig | null | undefined): Required<ThemeConfig> {
  if (!config) return DEFAULT_CONFIG
  return {
    ...DEFAULT_CONFIG,
    ...config,
    // Merge nested typography tokens individually so a partial override works
    typography_h1:    { ...DEFAULT_CONFIG.typography_h1,    ...(config.typography_h1    ?? {}) },
    typography_h2:    { ...DEFAULT_CONFIG.typography_h2,    ...(config.typography_h2    ?? {}) },
    typography_h3:    { ...DEFAULT_CONFIG.typography_h3,    ...(config.typography_h3    ?? {}) },
    typography_body:  { ...DEFAULT_CONFIG.typography_body,  ...(config.typography_body  ?? {}) },
    typography_small: { ...DEFAULT_CONFIG.typography_small, ...(config.typography_small ?? {}) },
    typography_label: { ...DEFAULT_CONFIG.typography_label, ...(config.typography_label ?? {}) },
  }
}

// ── Main CSS builder ──────────────────────────────────────────────────────────

/** Render a typography token's CSS variables for a given scale name (h1, h2…). */
function typoVars(scale: string, t: TypographyToken): Record<string, string> {
  return {
    [`--font-family-${scale}`]:     cssFontFamily(t.font_family),
    [`--font-weight-${scale}`]:     String(t.weight),
    [`--font-size-${scale}`]:       `${t.size_rem}rem`,
    [`--line-height-${scale}`]:     String(t.line_height),
    [`--letter-spacing-${scale}`]:  `${t.letter_spacing_em}em`,
  }
}

/**
 * Build a complete `:root { … }` CSS block from a ThemeConfig.
 * Used by ThemeScript for server-side injection and applyTheme for client updates.
 * Falls back to DEFAULT_CONFIG values for any missing/null fields.
 */
export function buildCssBlock(config: ThemeConfig | null | undefined): string {
  const c = mergeConfig(config)

  // Colour helpers — fall back to defaults if hex is invalid
  const hsl = (hex: string, fallback: string): string =>
    hexToHsl(hex) || hexToHsl(fallback) || fallback

  const primary       = hsl(c.color_primary,       DEFAULT_CONFIG.color_primary)
  const accent        = hsl(c.color_accent,         DEFAULT_CONFIG.color_accent)
  const surface       = hsl(c.color_surface,        DEFAULT_CONFIG.color_surface)
  const background    = hsl(c.color_background,     DEFAULT_CONFIG.color_background)
  const onSurface     = hsl(c.color_on_surface,     DEFAULT_CONFIG.color_on_surface)
  const onBackground  = hsl(c.color_on_background,  DEFAULT_CONFIG.color_on_background)
  const error         = hsl(c.color_error,          DEFAULT_CONFIG.color_error)
  const border        = hsl(c.color_border,         DEFAULT_CONFIG.color_border)
  const disabled      = hsl(c.color_disabled,       DEFAULT_CONFIG.color_disabled)
  const focus         = hsl(c.color_focus,          DEFAULT_CONFIG.color_focus)

  // Derive muted from background (slightly darker/more saturated for subtle surfaces)
  const muted = darken(background, 2)

  const vars: Record<string, string> = {
    // ── New token names ───────────────────────────────────────────────────────
    '--color-primary':         primary,
    '--color-primary-hover':   darken(primary, 6),
    '--color-accent':          accent,
    '--color-surface':         surface,
    '--color-background':      background,
    '--color-on-surface':      onSurface,
    '--color-on-background':   onBackground,
    '--color-error':           error,
    '--color-border':          border,
    '--color-disabled':        disabled,
    '--color-focus':           focus,

    // ── Backward-compat aliases (existing Tailwind classes keep working) ──────
    '--color-primary-foreground':   autoForeground(primary),
    '--color-accent-foreground':    autoForeground(accent),
    '--color-foreground':           onSurface,   // text-foreground
    '--color-input':                border,      // border-input on form controls
    '--color-ring':                 focus,       // focus-visible:ring-ring
    '--color-secondary':            '215 20% 95%',
    '--color-secondary-foreground': '220 15% 20%',
    '--color-muted':                muted,
    '--color-muted-foreground':     '215 15% 45%',

    // ── Typography — one set of vars per scale ────────────────────────────────
    ...typoVars('h1',    c.typography_h1),
    ...typoVars('h2',    c.typography_h2),
    ...typoVars('h3',    c.typography_h3),
    ...typoVars('body',  c.typography_body),
    ...typoVars('small', c.typography_small),
    ...typoVars('label', c.typography_label),

    // ── Backward-compat font alias (body font → --font-sans) ─────────────────
    '--font-sans': cssFontFamily(c.typography_body.font_family),

    // ── Corner radius ─────────────────────────────────────────────────────────
    '--radius-sm':   `${c.radius_sm}rem`,
    '--radius-md':   `${c.radius_md}rem`,
    '--radius-lg':   `${c.radius_lg}rem`,
    '--radius-full': `${c.radius_full === 9999 ? '9999px' : `${c.radius_full}rem`}`,

    // ── Backward-compat radius alias ──────────────────────────────────────────
    '--radius': `${c.radius_md}rem`,
  }

  const declarations = Object.entries(vars)
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n')
  return `:root {\n${declarations}\n}`
}

// ── Client-side application ───────────────────────────────────────────────────

/**
 * Apply a ThemeConfig to the document's CSS variables.
 * Call inside useEffect — client-only.
 */
export function applyTheme(config: ThemeConfig | null | undefined): void {
  if (typeof document === 'undefined') return
  const css   = buildCssBlock(config)
  const root  = document.documentElement
  const lines = css.replace(':root {', '').replace(/\}$/, '').trim().split('\n')
  for (const line of lines) {
    const m = line.trim().match(/^(--[^:]+):\s*(.+);$/)
    if (m) root.style.setProperty(m[1].trim(), m[2].trim())
  }
}

// ── Metadata resolution (logoUrl, clientName, googleFontUrl) ─────────────────

/**
 * Extract rendering metadata from a ThemeConfig.
 * Used by NavHeader (clientName, logoUrl) and page components (googleFontUrl).
 */
export function resolveTheme(
  config: ThemeConfig | null | undefined,
  clientName?: string | null,
): ResolvedTheme {
  const c = mergeConfig(config)

  // Collect all unique non-system font families across typography tokens
  const allFonts = [
    c.typography_h1, c.typography_h2, c.typography_h3,
    c.typography_body, c.typography_small, c.typography_label,
  ]
    .map(t => t.font_family.split(',')[0].trim().replace(/['"]/g, ''))
    .filter(f => !isSystemFont(f))

  const uniqueFonts = [...new Set(allFonts)]
  const googleFontUrl = uniqueFonts.length > 0 ? buildGoogleFontUrl(uniqueFonts) : null

  return {
    logoUrl:      c.logo_url ?? null,
    clientName:   c.client_name !== 'CommonReach' ? c.client_name : (clientName ?? null),
    googleFontUrl,
  }
}

/**
 * Returns the client-specific Google Font URL only when it differs from the
 * default Inter font (avoids a duplicate network request for the default).
 */
export function cityFontUrl(theme: ResolvedTheme): string | null {
  if (!theme.googleFontUrl) return null
  // Default is Inter-only; skip if the config also only uses Inter
  if (theme.googleFontUrl === DEFAULT_THEME.googleFontUrl) return null
  return theme.googleFontUrl
}

// ── Defaults (computed once at module load) ───────────────────────────────────

export const DEFAULT_THEME_CONFIG: ThemeConfig = DEFAULT_CONFIG

export const DEFAULT_THEME: ResolvedTheme = resolveTheme(DEFAULT_CONFIG)
