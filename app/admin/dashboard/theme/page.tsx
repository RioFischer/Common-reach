"use client"

/**
 * /admin/dashboard/theme — theme configuration editor.
 *
 * Two-column layout: form on the left, live ThemePreview on the right.
 * All changes are draft-only until the user clicks Save.
 */

import { useEffect, useState, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { refreshAccessToken, getAccessToken } from "@/lib/auth"
import { getClient, updateClientSettings, updateTheme } from "@/lib/adminApi"
import { ThemePreview } from "@/components/admin/ThemePreview"
import type { DisplayMode, ThemeConfig, TypographyToken } from "@/lib/types"

const DEFAULT_TYPO: Required<TypographyToken> = {
  font_family: "Inter", weight: 400, size_rem: 1.0, line_height: 1.5, letter_spacing_em: 0,
}

function mergeTypo(base: TypographyToken | undefined, family: string): TypographyToken {
  return { ...DEFAULT_TYPO, ...(base ?? {}), font_family: family }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FONT_OPTIONS = [
  "Inter", "Georgia", "Merriweather", "Playfair Display", "Roboto", "Open Sans",
]

const RADIUS_PRESETS = [
  { label: "Sharp",   value: 0 },
  { label: "Subtle",  value: 0.25 },
  { label: "Rounded", value: 0.5 },
  { label: "Pill",    value: 1.0 },
]

// ── Sub-components ────────────────────────────────────────────────────────────

interface ColorFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [hex, setHex] = useState(value)

  // Keep local hex in sync when parent value changes (e.g. initial load)
  useEffect(() => setHex(value), [value])

  const commit = (raw: string) => {
    const normalised = raw.startsWith("#") ? raw : `#${raw}`
    if (/^#[0-9a-fA-F]{6}$/.test(normalised)) onChange(normalised.toLowerCase())
    else setHex(value) // reset to last valid on blur
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex.length === 7 ? hex : "#2563eb"}
          onChange={e => { setHex(e.target.value); onChange(e.target.value) }}
          className="h-9 w-9 cursor-pointer rounded border border-border p-0.5"
          aria-label={`${label} color picker`}
        />
        <input
          type="text"
          value={hex}
          maxLength={7}
          onChange={e => setHex(e.target.value)}
          onBlur={e => commit(e.target.value)}
          className="w-28 rounded-md border border-border bg-background px-2 py-1.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label={`${label} hex value`}
        />
      </div>
    </div>
  )
}

interface SelectFieldProps {
  label: string
  value: string
  options: { label: string; value: string | number }[]
  onChange: (v: string) => void
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-foreground">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      >
        {options.map(o => (
          <option key={String(o.value)} value={String(o.value)}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

function ThemePage() {
  const searchParams = useSearchParams()
  const clientId = searchParams.get("client_id") ?? ""

  const [draft, setDraft]       = useState<ThemeConfig | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saveMsg, setSaveMsg]   = useState<{ ok: boolean; text: string } | null>(null)
  const [fetchErr, setFetchErr] = useState<string | null>(null)

  const [displayMode, setDisplayMode] = useState<DisplayMode>("provider")
  const [modeSaving, setModeSaving]   = useState(false)
  const [modeMsg, setModeMsg]         = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (!clientId) return
    async function load() {
      if (!getAccessToken()) await refreshAccessToken()
      try {
        const client = await getClient(clientId)
        setDraft(client.theme_config ?? {})
        setDisplayMode(client.directory_display_mode)
      } catch (e: unknown) {
        setFetchErr(e instanceof Error ? e.message : "Failed to load theme.")
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [clientId])

  const handleDisplayModeChange = async (mode: DisplayMode) => {
    if (!clientId || mode === displayMode) return
    const previous = displayMode
    setDisplayMode(mode)
    setModeSaving(true)
    setModeMsg(null)
    try {
      await updateClientSettings(clientId, { directory_display_mode: mode })
      setModeMsg({ ok: true, text: "Display mode saved." })
    } catch (e: unknown) {
      setDisplayMode(previous)
      setModeMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed." })
    } finally {
      setModeSaving(false)
    }
  }

  const set = useCallback((key: keyof ThemeConfig, val: unknown) => {
    setDraft(prev => prev ? { ...prev, [key]: val } as ThemeConfig : { [key]: val } as ThemeConfig)
    setSaveMsg(null)
  }, [])

  const setTypoFont = useCallback((scale: "h1" | "h2" | "h3" | "body" | "small" | "label", family: string) => {
    const key = `typography_${scale}` as keyof ThemeConfig
    setDraft(prev => {
      if (!prev) return prev
      const existing = (prev[key] as ThemeConfig["typography_h1"]) ?? {}
      return { ...prev, [key]: { ...existing, font_family: family } }
    })
    setSaveMsg(null)
  }, [])

  const setHeadingFont = useCallback((family: string) => {
    setDraft(prev => {
      if (!prev) return prev
      return {
        ...prev,
        typography_h1: mergeTypo(prev.typography_h1, family),
        typography_h2: mergeTypo(prev.typography_h2, family),
        typography_h3: mergeTypo(prev.typography_h3, family),
      }
    })
    setSaveMsg(null)
  }, [])

  const setBodyFont = useCallback((family: string) => {
    setDraft(prev => {
      if (!prev) return prev
      return {
        ...prev,
        typography_body:  mergeTypo(prev.typography_body,  family),
        typography_small: mergeTypo(prev.typography_small, family),
        typography_label: mergeTypo(prev.typography_label, family),
      }
    })
    setSaveMsg(null)
  }, [])

  const setRadiusPreset = useCallback((value: string) => {
    const n = parseFloat(value)
    setDraft(prev => prev ? {
      ...prev,
      radius_sm: Math.max(0, n - 0.25),
      radius_md: n,
      radius_lg: n > 0 ? n * 2 : 0,
    } : prev)
    setSaveMsg(null)
  }, [])

  const handleSave = async () => {
    if (!clientId || !draft) return
    setSaving(true)
    setSaveMsg(null)
    try {
      await updateTheme(clientId, draft)
      setSaveMsg({ ok: true, text: "Theme saved." })
    } catch (e: unknown) {
      setSaveMsg({ ok: false, text: e instanceof Error ? e.message : "Save failed." })
    } finally {
      setSaving(false)
    }
  }

  if (!clientId) return (
    <p className="text-sm text-muted-foreground">No client_id in URL. Navigate from the dashboard.</p>
  )

  if (loading) return (
    <div className="mx-auto max-w-5xl space-y-4">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="h-64 animate-pulse rounded-lg bg-muted" />
    </div>
  )

  if (fetchErr) return (
    <div role="alert" className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
      {fetchErr}
    </div>
  )

  const headingFont = draft?.typography_h1?.font_family ?? "Inter"
  const bodyFont    = draft?.typography_body?.font_family ?? "Inter"
  const radiusPreset = String(draft?.radius_md ?? 0.5)

  const radiusOptions = RADIUS_PRESETS.map(p => ({
    label: `${p.label} — ${p.value === 0 ? "square" : `${p.value}rem`}`,
    value: String(p.value),
  }))

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Theme & Branding</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes are previewed live. Click Save to apply.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {saveMsg && (
            <span className={`text-sm ${saveMsg.ok ? "text-accent" : "text-error"}`}>
              {saveMsg.text}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* ── Form ── */}
        <div className="space-y-6 rounded-lg border border-border bg-surface p-6">

          {/* Logo */}
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">Logo URL</label>
            <input
              type="url"
              value={draft?.logo_url ?? ""}
              onChange={e => set("logo_url", e.target.value || null)}
              placeholder="https://example.com/logo.svg"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {draft?.logo_url && (
              <img
                src={draft.logo_url}
                alt="Logo preview"
                className="mt-2 h-10 object-contain"
                onError={e => (e.currentTarget.style.display = "none")}
              />
            )}
          </div>

          <hr className="border-border" />

          {/* Display mode */}
          <div>
            <h2 className="mb-1 text-sm font-semibold text-foreground">Directory display mode</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Provider mode (default): one card per organization, with any programs it runs listed inside.
              Program mode: one card per program — an organization running several programs appears once per program.
              Saves immediately.
            </p>
            <div className="flex items-center gap-4">
              {(["provider", "program"] as const).map(mode => (
                <label key={mode} className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="radio"
                    name="directory_display_mode"
                    value={mode}
                    checked={displayMode === mode}
                    disabled={modeSaving}
                    onChange={() => void handleDisplayModeChange(mode)}
                    className="h-4 w-4"
                  />
                  {mode === "provider" ? "By provider" : "By program"}
                </label>
              ))}
              {modeMsg && (
                <span className={`text-sm ${modeMsg.ok ? "text-accent" : "text-error"}`}>
                  {modeMsg.text}
                </span>
              )}
            </div>
          </div>

          <hr className="border-border" />

          {/* Colours */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Colours</h2>
            <div className="grid grid-cols-2 gap-4">
              <ColorField label="Primary"    value={draft?.color_primary    ?? "#2563eb"} onChange={v => set("color_primary", v)} />
              <ColorField label="Accent"     value={draft?.color_accent     ?? "#16a34a"} onChange={v => set("color_accent", v)} />
              <ColorField label="Surface"    value={draft?.color_surface    ?? "#ffffff"} onChange={v => set("color_surface", v)} />
              <ColorField label="Background" value={draft?.color_background ?? "#f8fafc"} onChange={v => set("color_background", v)} />
            </div>
          </div>

          <hr className="border-border" />

          {/* Typography */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Typography</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField
                label="Heading font (H1–H3)"
                value={headingFont}
                options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
                onChange={setHeadingFont}
              />
              <SelectField
                label="Body font"
                value={bodyFont}
                options={FONT_OPTIONS.map(f => ({ label: f, value: f }))}
                onChange={setBodyFont}
              />
            </div>
          </div>

          <hr className="border-border" />

          {/* Radius */}
          <div>
            <h2 className="mb-3 text-sm font-semibold text-foreground">Corner radius</h2>
            <SelectField
              label="Preset"
              value={radiusPreset}
              options={radiusOptions}
              onChange={setRadiusPreset}
            />
          </div>
        </div>

        {/* ── Live preview ── */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Live preview
          </p>
          {draft && <ThemePreview config={draft} />}
        </div>
      </div>
    </div>
  )
}

export default function ThemePageWrapper() {
  return (
    <Suspense>
      <ThemePage />
    </Suspense>
  )
}
