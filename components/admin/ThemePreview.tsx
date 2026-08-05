"use client"

/**
 * ThemePreview — live style-tile component for the theme editor.
 *
 * Renders an isolated preview card using inline styles derived from the
 * draft ThemeConfig, so it never interferes with the surrounding admin UI.
 * All tokens are inlined directly; no CSS variables are written to :root.
 */

import { hexToHsl } from "@/lib/theme"
import type { ThemeConfig } from "@/lib/types"

interface ThemePreviewProps {
  config: Partial<ThemeConfig>
}

// Resolve a CSS value from a hex color field, falling back to a default HSL.
function hslVar(hex: string | undefined, fallback: string): string {
  if (!hex) return `hsl(${fallback})`
  const hsl = hexToHsl(hex)
  return hsl ? `hsl(${hsl})` : `hsl(${fallback})`
}

function darkenHex(hex: string | undefined, fallback: string): string {
  if (!hex) return `hsl(${fallback})`
  const hsl = hexToHsl(hex)
  if (!hsl) return `hsl(${fallback})`
  const m = hsl.match(/(\d+)\s+(\d+)%\s+(\d+)%/)
  if (!m) return `hsl(${hsl})`
  return `hsl(${m[1]} ${m[2]}% ${Math.max(0, parseInt(m[3], 10) - 6)}%)`
}

function autoFg(hex: string | undefined): string {
  if (!hex) return "#ffffff"
  const hsl = hexToHsl(hex)
  if (!hsl) return "#ffffff"
  const m = hsl.match(/\d+\s+\d+%\s+(\d+)%/)
  return m && parseInt(m[1], 10) > 55 ? "#1e293b" : "#ffffff"
}

const BADGE_LABELS = ["Housing", "Food", "Healthcare"]
const FONT_OPTIONS = ["Inter", "Georgia", "Merriweather", "Playfair Display", "Roboto", "Open Sans"]

export function ThemePreview({ config }: ThemePreviewProps) {
  const primary    = hslVar(config.color_primary,    "220 85% 38%")
  const primaryDark = darkenHex(config.color_primary, "220 85% 32%")
  const primaryFg  = autoFg(config.color_primary)
  const accent     = hslVar(config.color_accent,     "142 72% 29%")
  const surface    = hslVar(config.color_surface,    "0 0% 100%")
  const background = hslVar(config.color_background, "210 40% 98%")
  const border     = hslVar(config.color_border,     "213 32% 91%")
  const fg         = hslVar(config.color_on_surface, "215 40% 17%")
  const fgMuted    = hslVar(config.color_on_background, "215 25% 27%")
  const error      = hslVar(config.color_error,      "0 72% 51%")

  const hFont = config.typography_h1?.font_family || "Inter"
  const bFont = config.typography_body?.font_family || "Inter"
  const radMd = config.radius_md !== undefined ? `${config.radius_md}rem` : "0.5rem"
  const radSm = config.radius_sm !== undefined ? `${config.radius_sm}rem` : "0.25rem"

  return (
    <div
      className="overflow-hidden rounded-lg border"
      style={{ background, borderColor: border, fontFamily: `"${bFont}", system-ui, sans-serif` }}
      aria-label="Theme preview"
    >
      {/* Header strip */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: primary }}
      >
        <div
          className="h-6 w-6 rounded-full"
          style={{ background: primaryFg, opacity: 0.9 }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold" style={{ color: primaryFg, fontFamily: `"${hFont}", system-ui, sans-serif` }}>
          {config.typography_h1?.font_family || "Inter"} — Preview
        </span>
      </div>

      <div className="space-y-5 p-4">
        {/* Colour swatches */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: fgMuted }}>
            Colours
          </p>
          <div className="flex gap-2">
            {[
              { color: primary, label: "Primary" },
              { color: accent,  label: "Accent" },
              { color: surface, label: "Surface", bordered: true },
              { color: error,   label: "Error" },
            ].map(({ color, label, bordered }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div
                  className="h-8 w-8 rounded-full"
                  style={{
                    background: color,
                    border: bordered ? `1px solid ${border}` : undefined,
                  }}
                  title={label}
                  aria-label={label}
                />
                <span className="text-[10px]" style={{ color: fgMuted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Typography specimens */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: fgMuted }}>
            Typography
          </p>
          <div className="space-y-0.5">
            {[
              { tag: "H1", size: "1.25rem", weight: 700, family: hFont },
              { tag: "H2", size: "1.1rem",  weight: 600, family: hFont },
              { tag: "H3", size: "0.95rem", weight: 600, family: hFont },
              { tag: "Body", size: "0.875rem", weight: 400, family: bFont },
              { tag: "Label", size: "0.8rem",  weight: 500, family: bFont },
            ].map(({ tag, size, weight, family }) => (
              <div key={tag} className="flex items-baseline gap-2">
                <span className="w-8 text-[10px]" style={{ color: fgMuted }}>{tag}</span>
                <span
                  style={{ fontSize: size, fontWeight: weight, color: fg, fontFamily: `"${family}", system-ui, sans-serif` }}
                >
                  Civic Service Index
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Components row */}
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide" style={{ color: fgMuted }}>
            Components
          </p>

          {/* Button + Input */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              type="button"
              className="cursor-default text-sm font-medium px-3 py-1.5"
              style={{
                background: primary,
                color: primaryFg,
                borderRadius: radMd,
                fontFamily: `"${bFont}", system-ui, sans-serif`,
              }}
            >
              Find Services
            </button>
            <input
              readOnly
              value="Enter zip code…"
              className="text-sm px-3 py-1.5 border outline-none"
              style={{
                borderRadius: radMd,
                borderColor: border,
                background: surface,
                color: fgMuted,
                fontFamily: `"${bFont}", system-ui, sans-serif`,
                width: "140px",
              }}
            />
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {BADGE_LABELS.map(label => (
              <span
                key={label}
                className="text-xs font-medium px-2 py-0.5"
                style={{
                  borderRadius: radSm,
                  background: accent + "22",
                  color: accent,
                }}
              >
                {label}
              </span>
            ))}
            <span
              className="text-xs font-medium px-2 py-0.5"
              style={{
                borderRadius: radSm,
                background: primary + "22",
                color: primary,
              }}
            >
              Verified
            </span>
          </div>

          {/* Sample ResultCard */}
          <div
            className="p-3 border"
            style={{
              background: surface,
              borderColor: border,
              borderRadius: radMd,
            }}
          >
            <div
              className="font-semibold text-sm"
              style={{ color: fg, fontFamily: `"${hFont}", system-ui, sans-serif` }}
            >
              Riverside Community Health Clinic
            </div>
            <div className="text-xs mt-0.5" style={{ color: fgMuted }}>
              123 Main St · 0.8 mi away
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {["Healthcare", "Walk-in", "Medicaid"].map(t => (
                <span
                  key={t}
                  className="text-[10px] px-1.5 py-0.5"
                  style={{
                    borderRadius: radSm,
                    background: border,
                    color: fgMuted,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <a
                href="#"
                onClick={e => e.preventDefault()}
                className="text-xs font-medium"
                style={{ color: primary }}
              >
                View details →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
