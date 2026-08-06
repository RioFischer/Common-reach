'use client'

import { useState, useMemo } from 'react'
import type { SearchFilterSchema } from '@/lib/types'

const POPULATION_TAGS_TO_HIDE: string[] = []

const AGE_LABEL_MAP: Record<string, string> = {
  '0–5': 'Infants & Young Children (0–5)',
  '6–12': 'School Age (6–12)',
  '13–17': 'Teens (13–17)',
  '18–35': 'Young Adults (18–35)',
  '35–65': 'Adults (35–65)',
  '65+': 'Seniors (65+)',
}

const RADIUS_OPTIONS = [5, 10, 25, 50] as const

// ── Eligibility filter constants (frontend-only, see note on FilterPanel) ────
const INCOME_MIN = 0
const INCOME_MAX = 150_000
const INCOME_STEP = 1_000
const CREDIT_MIN = 0
const CREDIT_MAX = 850
const CREDIT_STEP = 10
const ELIGIBILITY_OPTIONS = ['Citizen', 'Law-involved']

function formatIncome(v: number): string {
  if (v >= INCOME_MAX) return '$150k+'
  return `$${Math.round(v / 1000)}k`
}

// ── Pill toggle button ────────────────────────────────────────────────────────

function PillButton({
  label,
  active,
  activeCount,
  onClick,
}: {
  label: string
  active: boolean
  activeCount?: number
  onClick: () => void
}) {
  const hasActive = (activeCount ?? 0) > 0
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        padding: '6px 12px',
        borderRadius: 'var(--ds-radius-md)',
        border: `1px solid ${hasActive ? 'var(--ds-brand-300)' : active ? 'var(--ds-brand-400)' : 'var(--ds-border-strong)'}`,
        backgroundColor: hasActive ? 'var(--ds-brand-50)' : active ? 'var(--ds-neutral-50)' : 'var(--ds-bg-default)',
        color: hasActive ? 'var(--ds-brand-700)' : 'var(--ds-neutral-700)',
        fontSize: 'var(--ds-text-sm)', fontWeight: hasActive ? 600 : 400,
        cursor: 'pointer', fontFamily: 'var(--ds-font-sans)', whiteSpace: 'nowrap',
        boxShadow: 'var(--ds-shadow-sm)', transition: 'all 0.15s',
      }}
    >
      {label}
      {hasActive && (
        <span style={{
          backgroundColor: 'var(--ds-brand-600)', color: 'white',
          borderRadius: 'var(--ds-radius-full)', padding: '0 5px',
          fontSize: 'var(--ds-text-2xs)', fontWeight: 700, minWidth: '16px', textAlign: 'center',
        }}>
          {activeCount}
        </span>
      )}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
        style={{ transition: 'transform 0.2s', transform: active ? 'rotate(180deg)' : 'none' }}>
        <path d="M2 4l4 4 4-4" />
      </svg>
    </button>
  )
}

// ── Checkbox list ─────────────────────────────────────────────────────────────

function CheckboxList({
  options,
  selected,
  counts,
  getLabel = (v: string) => v,
  onToggle,
  columns = 1,
}: {
  options: string[]
  selected: string[]
  counts?: Record<string, number>
  getLabel?: (v: string) => string
  onToggle: (opt: string) => void
  columns?: number
}) {
  const gridCols = columns === 1
    ? '1fr'
    : 'repeat(auto-fit, minmax(180px, 1fr))'
  return (
    <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: '2px var(--ds-space-3)' }}>
      {options.map(opt => {
        const isSelected = selected.includes(opt)
        const optCount = counts?.[opt]
        const disabled = !isSelected && optCount === 0
        return (
          <div
            key={opt}
            onClick={() => !disabled && onToggle(opt)}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '7px 8px', borderRadius: 'var(--ds-radius-sm)',
              cursor: disabled ? 'not-allowed' : 'pointer',
              backgroundColor: isSelected ? 'var(--ds-brand-50)' : 'transparent',
              opacity: disabled ? 0.4 : 1,
            }}
            onMouseEnter={e => { if (!isSelected && !disabled) (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--ds-neutral-50)' }}
            onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent' }}
          >
            <div style={{
              width: '16px', height: '16px', flexShrink: 0,
              borderRadius: 'var(--ds-radius-sm)',
              border: `1.5px solid ${isSelected ? 'var(--ds-brand-600)' : 'var(--ds-border-strong)'}`,
              backgroundColor: isSelected ? 'var(--ds-brand-600)' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s',
            }}>
              {isSelected && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="1.5,5 4,7.5 8.5,2.5" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 'var(--ds-text-sm)', color: isSelected ? 'var(--ds-brand-700)' : 'var(--ds-neutral-700)', fontWeight: isSelected ? 500 : 400, flex: 1 }}>
              {getLabel(opt)}
            </span>
            {optCount !== undefined && (
              <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-neutral-400)', fontVariantNumeric: 'tabular-nums' }}>
                {optCount}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── DualRangeSlider ────────────────────────────────────────────────────────────
// Frontend-only display control — not wired to search filtering. Two overlapping
// native range inputs (a standard dependency-free dual-thumb technique); only
// each input's own thumb is interactive (see .dual-range-thumb in globals.css),
// with a plain div underneath showing the filled range between them.

function DualRangeSlider({
  min,
  max,
  step,
  low,
  high,
  onLowChange,
  onHighChange,
}: {
  min: number
  max: number
  step: number
  low: number
  high: number
  onLowChange: (v: number) => void
  onHighChange: (v: number) => void
}) {
  const lowPct = ((low - min) / (max - min)) * 100
  const highPct = ((high - min) / (max - min)) * 100
  const lowOnTop = low > (min + max) / 2

  return (
    <div style={{ position: 'relative', height: '32px' }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
        height: '4px', borderRadius: 'var(--ds-radius-full)', backgroundColor: 'var(--ds-neutral-200)',
      }} />
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        height: '4px', borderRadius: 'var(--ds-radius-full)', backgroundColor: 'var(--ds-brand-500)',
        left: `${lowPct}%`, right: `${100 - highPct}%`,
      }} />
      <input
        type="range" min={min} max={max} step={step} value={low}
        onChange={e => onLowChange(Math.min(Number(e.target.value), high))}
        className="dual-range-thumb"
        aria-label="Minimum"
        style={{ position: 'absolute', width: '100%', left: 0, top: 0, margin: 0, zIndex: lowOnTop ? 5 : 3 }}
      />
      <input
        type="range" min={min} max={max} step={step} value={high}
        onChange={e => onHighChange(Math.max(Number(e.target.value), low))}
        className="dual-range-thumb"
        aria-label="Maximum"
        style={{ position: 'absolute', width: '100%', left: 0, top: 0, margin: 0, zIndex: 4 }}
      />
    </div>
  )
}

// ── Small numeric text input used beside a DualRangeSlider ───────────────────

function RangeNumberInput({
  value,
  onChange,
  prefix,
  width = '68px',
}: {
  value: number
  onChange: (v: number) => void
  prefix?: string
  width?: string
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {prefix && (
        <span style={{ position: 'absolute', left: '8px', fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-tertiary)', pointerEvents: 'none' }}>
          {prefix}
        </span>
      )}
      <input
        type="number"
        value={value}
        onChange={e => {
          const v = Number(e.target.value)
          if (!Number.isNaN(v)) onChange(v)
        }}
        style={{
          width, height: '30px',
          padding: prefix ? '0 8px 0 18px' : '0 8px',
          fontSize: 'var(--ds-text-sm)', fontFamily: 'var(--ds-font-sans)',
          color: 'var(--ds-text-primary)', backgroundColor: 'var(--ds-bg-default)',
          border: '1px solid var(--ds-border-strong)', borderRadius: 'var(--ds-radius-md)',
          outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  )
}

// ── filterActiveCount ─────────────────────────────────────────────────────────

export function filterActiveCount({
  activePopulationTags, activeAgeTags, activeLanguageTags, hasGeo, zipCode,
}: { activePopulationTags: string[]; activeAgeTags: string[]; activeLanguageTags: string[]; hasGeo: boolean; zipCode: string }) {
  return activePopulationTags.length + activeAgeTags.length + activeLanguageTags.length +
    (hasGeo || zipCode.length === 5 ? 1 : 0)
}

// ── FilterPanel ───────────────────────────────────────────────────────────────

type FilterKey = 'location' | 'age' | 'population' | 'language' | 'insurance' | 'eligibility'

interface FilterPanelProps {
  open: boolean
  schema: SearchFilterSchema
  activeServiceTags: string[]
  activePopulationTags: string[]
  activeAgeTags: string[]
  activeLanguageTags: string[]
  filterCounts?: Record<string, Record<string, number>>
  onToggleService: (tag: string) => void
  onTogglePopulation: (tag: string) => void
  onToggleAge: (tag: string) => void
  onToggleLanguage: (tag: string) => void
  onClearAll: () => void
  radiusMiles: number
  zipCode: string
  hasGeo: boolean
  geoLoading: boolean
  geoError: string | null
  onZipChange: (zip: string) => void
  onRequestGeo: () => void
  onClearGeo: () => void
  onRadiusChange: (miles: number) => void
}

export function FilterPanel({
  open,
  schema,
  activePopulationTags,
  activeAgeTags,
  activeLanguageTags,
  filterCounts,
  onTogglePopulation,
  onToggleAge,
  onToggleLanguage,
  onClearAll,
  radiusMiles,
  zipCode,
  hasGeo,
  geoLoading,
  geoError,
  onZipChange,
  onRequestGeo,
  onClearGeo,
  onRadiusChange,
}: FilterPanelProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey | null>(null)

  // ── Eligibility filter state ──────────────────────────────────────────────
  // Frontend-only for now: intentionally local state, not lifted to props or
  // wired into the search query — this doesn't filter results yet.
  const [incomeLow, setIncomeLow] = useState(INCOME_MIN)
  const [incomeHigh, setIncomeHigh] = useState(INCOME_MAX)
  const [creditLow, setCreditLow] = useState(CREDIT_MIN)
  const [creditHigh, setCreditHigh] = useState(CREDIT_MAX)
  const [eligibilityOptions, setEligibilityOptions] = useState<string[]>([])
  const eligibilityActive =
    incomeLow !== INCOME_MIN || incomeHigh !== INCOME_MAX ||
    creditLow !== CREDIT_MIN || creditHigh !== CREDIT_MAX ||
    eligibilityOptions.length > 0

  function toggleEligibilityOption(opt: string) {
    setEligibilityOptions(prev => prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt])
  }

  const populationTags = useMemo(
    () => schema.population_tags.filter(t => !POPULATION_TAGS_TO_HIDE.includes(t)),
    [schema.population_tags],
  )

  const locationActive = hasGeo || zipCode.length === 5
  const activeCount = activePopulationTags.length + activeAgeTags.length + activeLanguageTags.length + (locationActive ? 1 : 0)

  function toggle(key: FilterKey) {
    setActiveFilter(prev => prev === key ? null : key)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateRows: open ? '1fr' : '0fr',
      transition: 'grid-template-rows 0.22s ease',
    }}>
      <div style={{ overflow: 'hidden', minHeight: 0 }}>
        <div style={{ paddingTop: 'var(--ds-space-2)' }}>

          {/* Row of pill buttons — right aligned */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', flexWrap: 'wrap', gap: 'var(--ds-space-2)' }}>
            <PillButton label="Filter by location" active={activeFilter === 'location'} activeCount={locationActive ? 1 : 0} onClick={() => toggle('location')} />
            {schema.age_tags.length > 0 && (
              <PillButton label="Age Group" active={activeFilter === 'age'} activeCount={activeAgeTags.length} onClick={() => toggle('age')} />
            )}
            {populationTags.length > 0 && (
              <PillButton label="Who it Serves" active={activeFilter === 'population'} activeCount={activePopulationTags.length} onClick={() => toggle('population')} />
            )}
            {schema.language_tags.length > 0 && (
              <PillButton label="Language" active={activeFilter === 'language'} activeCount={activeLanguageTags.length} onClick={() => toggle('language')} />
            )}
            {schema.insurance_tags.length > 0 && (
              <PillButton label="Insurance" active={activeFilter === 'insurance'} onClick={() => toggle('insurance')} />
            )}
            <PillButton label="Eligibility" active={activeFilter === 'eligibility'} activeCount={eligibilityActive ? 1 : 0} onClick={() => toggle('eligibility')} />
            {activeCount > 0 && (
              <button
                type="button"
                onClick={onClearAll}
                style={{
                  padding: '6px 12px', borderRadius: 'var(--ds-radius-md)',
                  border: 'none', backgroundColor: 'transparent',
                  color: 'var(--ds-neutral-500)', fontSize: 'var(--ds-text-sm)',
                  cursor: 'pointer', fontFamily: 'var(--ds-font-sans)',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--ds-neutral-800)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--ds-neutral-500)')}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Expanded content for active filter */}
          <div style={{
            display: 'grid',
            gridTemplateRows: activeFilter ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.2s ease',
          }}>
            <div style={{ overflow: 'hidden', minHeight: 0 }}>
              <div style={{ paddingTop: 'var(--ds-space-3)' }}>

                {/* Location */}
                {activeFilter === 'location' && (
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', justifyContent: 'flex-end' }}>
                    <input
                      type="text" inputMode="numeric" pattern="[0-9]{5}" maxLength={5}
                      placeholder="Zip code" value={zipCode}
                      onChange={e => onZipChange(e.target.value)} disabled={hasGeo}
                      style={{
                        width: '90px', height: '32px', padding: '0 8px',
                        fontSize: 'var(--ds-text-sm)', fontFamily: 'var(--ds-font-sans)',
                        color: 'var(--ds-text-primary)',
                        backgroundColor: hasGeo ? 'var(--ds-bg-muted)' : 'var(--ds-bg-default)',
                        border: '1px solid var(--ds-border-strong)',
                        borderRadius: 'var(--ds-radius-md)', outline: 'none', boxSizing: 'border-box',
                      }}
                    />
                    <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>or</span>
                    <button
                      type="button"
                      onClick={() => { if (!hasGeo && !geoLoading) onRequestGeo() }}
                      disabled={geoLoading || hasGeo}
                      style={{
                        height: '32px', padding: '0 10px',
                        backgroundColor: hasGeo ? 'var(--ds-brand-50)' : 'var(--ds-bg-default)',
                        color: hasGeo ? 'var(--ds-brand-600)' : 'var(--ds-text-secondary)',
                        border: `1px solid ${hasGeo ? 'var(--ds-brand-300)' : 'var(--ds-border-strong)'}`,
                        borderRadius: 'var(--ds-radius-md)', fontSize: 'var(--ds-text-xs)', fontWeight: 500,
                        fontFamily: 'var(--ds-font-sans)', cursor: geoLoading || hasGeo ? 'default' : 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap',
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      {geoLoading ? 'Locating…' : hasGeo ? 'Using GPS' : 'Use my location'}
                    </button>
                    <select
                      value={radiusMiles} onChange={e => onRadiusChange(Number(e.target.value))}
                      style={{
                        height: '32px', padding: '0 8px',
                        fontSize: 'var(--ds-text-sm)', fontFamily: 'var(--ds-font-sans)',
                        color: 'var(--ds-text-primary)', backgroundColor: 'var(--ds-bg-default)',
                        border: '1px solid var(--ds-border-strong)',
                        borderRadius: 'var(--ds-radius-md)', cursor: 'pointer',
                      }}
                    >
                      {RADIUS_OPTIONS.map(r => <option key={r} value={r}>{r} mi</option>)}
                    </select>
                    {locationActive && (
                      <button type="button" onClick={() => hasGeo ? onClearGeo() : onZipChange('')}
                        style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-brand-600)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--ds-font-sans)', padding: 0 }}>
                        Clear
                      </button>
                    )}
                    {geoError && <p role="alert" style={{ margin: 0, fontSize: 'var(--ds-text-xs)', color: 'var(--ds-error-base)' }}>{geoError}</p>}
                  </div>
                )}

                {/* Age */}
                {activeFilter === 'age' && (
                  <CheckboxList options={schema.age_tags} selected={activeAgeTags} counts={filterCounts?.age_tags} getLabel={v => AGE_LABEL_MAP[v] ?? v} onToggle={onToggleAge} />
                )}

                {/* Population */}
                {activeFilter === 'population' && (
                  <CheckboxList options={populationTags} selected={activePopulationTags} counts={filterCounts?.population_tags} onToggle={onTogglePopulation} columns={2} />
                )}

                {/* Language */}
                {activeFilter === 'language' && (
                  <CheckboxList options={schema.language_tags} selected={activeLanguageTags} counts={filterCounts?.language_tags} onToggle={onToggleLanguage} columns={2} />
                )}

                {/* Insurance */}
                {activeFilter === 'insurance' && (
                  <CheckboxList options={schema.insurance_tags} selected={[]} counts={filterCounts?.insurance_tags} onToggle={() => {}} />
                )}

                {/* Eligibility */}
                {activeFilter === 'eligibility' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--ds-space-5)' }}>

                    {/* Income range */}
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: 'var(--ds-text-xs)', fontWeight: 600, color: 'var(--ds-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Household income
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-3)' }}>
                        <RangeNumberInput value={incomeLow} onChange={v => setIncomeLow(Math.min(Math.max(v, INCOME_MIN), incomeHigh))} prefix="$" width="92px" />
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <DualRangeSlider
                            min={INCOME_MIN} max={INCOME_MAX} step={INCOME_STEP}
                            low={incomeLow} high={incomeHigh}
                            onLowChange={setIncomeLow} onHighChange={setIncomeHigh}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>{formatIncome(incomeLow)}</span>
                            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>{formatIncome(incomeHigh)}</span>
                          </div>
                        </div>
                        <RangeNumberInput value={incomeHigh} onChange={v => setIncomeHigh(Math.max(Math.min(v, INCOME_MAX), incomeLow))} prefix="$" width="92px" />
                      </div>
                    </div>

                    {/* Credit range */}
                    <div>
                      <p style={{ margin: '0 0 10px', fontSize: 'var(--ds-text-xs)', fontWeight: 600, color: 'var(--ds-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Credit score
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--ds-space-3)' }}>
                        <RangeNumberInput value={creditLow} onChange={v => setCreditLow(Math.min(Math.max(v, CREDIT_MIN), creditHigh))} />
                        <div style={{ flex: 1, minWidth: '120px' }}>
                          <DualRangeSlider
                            min={CREDIT_MIN} max={CREDIT_MAX} step={CREDIT_STEP}
                            low={creditLow} high={creditHigh}
                            onLowChange={setCreditLow} onHighChange={setCreditHigh}
                          />
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>{creditLow}</span>
                            <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--ds-text-tertiary)' }}>{creditHigh}</span>
                          </div>
                        </div>
                        <RangeNumberInput value={creditHigh} onChange={v => setCreditHigh(Math.max(Math.min(v, CREDIT_MAX), creditLow))} />
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p style={{ margin: '0 0 6px', fontSize: 'var(--ds-text-xs)', fontWeight: 600, color: 'var(--ds-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Status
                      </p>
                      <CheckboxList options={ELIGIBILITY_OPTIONS} selected={eligibilityOptions} onToggle={toggleEligibilityOption} columns={2} />
                    </div>

                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
