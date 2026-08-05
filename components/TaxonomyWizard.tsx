'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getTaxonomyTree } from '@/lib/api'
import type { ProgramCard, ProviderCard, TaxonomyNode } from '@/lib/types'
import type { SearchState } from '@/hooks/useSearch'
import { WizardCard } from './WizardCard'
import type { IconName } from '@/components/ui/Icon'

const DOMAIN_ICON: Record<string, IconName> = {
  'food':                    'food',
  'clothing-personal-care':  'clothing',
  'transportation':          'transportation',
  'housing':                 'housing',
  'health':                  'medical',
  'children-youth-families': 'childcare',
  'work-money-education':    'employment',
  'legal-immigration':       'legal-aid',
  'disability-aging':        'disability',
}
import { ResultCard } from './search/ResultCard'
import { ProgramResultCard } from './search/ProgramResultCard'

interface TaxonomyWizardProps {
  clientSlug: string
  clientId: string
  onServiceTagSelect: (tagIds: string[], nodeLabel: string) => void
  results: (ProviderCard | ProgramCard)[]
  total: number
  isLoading: boolean
  /** Current browse path from URL (e.g. "food/food-or-groceries") */
  browse: string
  /** Push a new history entry — used for forward navigation */
  pushFilters: (overrides: Partial<SearchState>) => void
  /** Replace current history entry — used for auto-navigate */
  setFilters: (overrides: Partial<SearchState>) => void
  /** When set, auto-navigates to the best matching taxonomy node for the query. */
  query?: string
  embedMode?: boolean
}

export function TaxonomyWizard({
  clientSlug,
  clientId,
  onServiceTagSelect,
  results,
  total,
  isLoading,
  browse,
  pushFilters,
  setFilters,
  query,
  embedMode = false,
}: TaxonomyWizardProps) {
  const router = useRouter()

  const [treeData, setTreeData] = useState<TaxonomyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Path derived from the browse prop (managed by useSearch)
  const path = useMemo(
    () => browse ? browse.split('/').filter(Boolean) : [],
    [browse],
  )

  // Fetch tree once on mount
  useEffect(() => {
    getTaxonomyTree(clientId || undefined)
      .then((res) => { setTreeData(res.nodes); setLoading(false) })
      .catch((err) => { setError(err?.message ?? 'Failed to load categories'); setLoading(false) })
  }, []) // eslint-disable-line

  const nodeMap = useMemo(() => {
    const map = new Map<string, TaxonomyNode>()
    for (const n of treeData) map.set(n.slug, n)
    return map
  }, [treeData])

  const idMap = useMemo(() => {
    const map = new Map<string, TaxonomyNode>()
    for (const n of treeData) map.set(n.id, n)
    return map
  }, [treeData])

  const labelMap = useMemo(() => {
    const map = new Map<string, TaxonomyNode>()
    for (const n of treeData) map.set(n.label.toLowerCase(), n)
    return map
  }, [treeData])

  const childrenMap = useMemo(() => {
    const map = new Map<string | null, TaxonomyNode[]>()
    for (const n of treeData) {
      const key = n.parent_id ?? null
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(n)
    }
    for (const [, children] of map) children.sort((a, b) => a.sort_order - b.sort_order)
    return map
  }, [treeData])

  const currentNode: TaxonomyNode | null = useMemo(
    () => path.length === 0 ? null : nodeMap.get(path[path.length - 1]) ?? null,
    [path, nodeMap],
  )

  const visibleNodes = useMemo(() => {
    const parentId = currentNode?.id ?? null
    return (childrenMap.get(parentId) ?? []).filter(n => n.provider_count > 0)
  }, [currentNode, childrenMap])

  const isLeaf = currentNode !== null && visibleNodes.length === 0

  const hasChildren = useCallback(
    (node: TaxonomyNode) => (childrenMap.get(node.id) ?? []).some(n => n.provider_count > 0),
    [childrenMap],
  )

  const collectTagIds = useCallback(
    (node: TaxonomyNode): string[] => {
      const ids: string[] = [...node.service_tag_ids]
      for (const child of childrenMap.get(node.id) ?? []) ids.push(...collectTagIds(child))
      return [...new Set(ids)]
    },
    [childrenMap],
  )

  // Fire onServiceTagSelect whenever the leaf state changes
  useEffect(() => {
    if (!currentNode) { onServiceTagSelect([], ''); return }
    if (isLeaf) {
      onServiceTagSelect(collectTagIds(currentNode), currentNode.label)
    } else {
      onServiceTagSelect([], '')
    }
  }, [currentNode?.id, isLeaf]) // eslint-disable-line

  // Auto-navigate to best taxonomy match when query + results change
  useEffect(() => {
    if (!query) return  // don't reset manual browse navigation when query is empty
    if (results.length === 0 || treeData.length === 0) return

    const freq = new Map<string, number>()
    for (const p of results) {
      // ProgramCard has no domains/subcategories (that hierarchy is
      // deprecated) — only real providers contribute to the frequency score.
      if (p.type !== 'provider') continue
      for (const d of p.domains ?? []) freq.set(d.toLowerCase(), (freq.get(d.toLowerCase()) ?? 0) + 1)
      for (const s of p.subcategories ?? []) freq.set(s.toLowerCase(), (freq.get(s.toLowerCase()) ?? 0) + 2)
    }

    let bestNode: TaxonomyNode | null = null
    let bestScore = 0
    for (const [label, score] of freq) {
      const node = labelMap.get(label)
      if (node && score > bestScore) { bestNode = node; bestScore = score }
    }
    if (!bestNode) return

    const pathSlugs: string[] = []
    let cur: TaxonomyNode | undefined = bestNode
    while (cur) {
      pathSlugs.unshift(cur.slug)
      cur = cur.parent_id ? idMap.get(cur.parent_id) : undefined
    }
    setFilters({ browse: pathSlugs.join('/') })
  }, [query, results, treeData]) // eslint-disable-line

  const handleNodeClick = useCallback(
    (node: TaxonomyNode) => {
      const newPath = [...path, node.slug]
      const tagIds = hasChildren(node) ? [] : collectTagIds(node)
      pushFilters({ browse: newPath.join('/'), serviceTagIds: tagIds })
    },
    [path, pushFilters, hasChildren, collectTagIds],
  )

  const handleBack = useCallback(() => router.back(), [router])

  const heading = isLeaf
    ? currentNode!.label_user_facing
    : currentNode
      ? currentNode.label_user_facing
      : 'What are you looking for help with today?'

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div role="alert" className="rounded-lg border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      {path.length > 0 && (
        <nav aria-label="Category path" className="flex flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => pushFilters({ browse: '', serviceTagIds: [] })}
            className="text-muted-foreground hover:text-foreground underline rounded"
          >
            Home
          </button>
          {path.map((slug, idx) => {
            const node = nodeMap.get(slug)
            return (
              <span key={slug} className="flex items-center gap-1">
                <span className="text-muted-foreground" aria-hidden="true">/</span>
                <button
                  type="button"
                  onClick={() => pushFilters({ browse: path.slice(0, idx + 1).join('/'), serviceTagIds: [] })}
                  className="text-muted-foreground hover:text-foreground underline rounded"
                >
                  {node?.label ?? slug}
                </button>
              </span>
            )
          })}
        </nav>
      )}

      {/* Back button */}
      {path.length > 0 && (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground rounded"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z" clipRule="evenodd"/>
          </svg>
          Back
        </button>
      )}

      {/* Heading — only show when drilled into a node */}
      {currentNode && <h2 className="text-lg font-semibold text-foreground leading-snug">{heading}</h2>}

      {/* Leaf results view */}
      {isLeaf ? (
        <>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          )}
          {!isLoading && results.length === 0 && (
            <div className="rounded-lg border border-border px-4 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No providers found for <span className="font-medium text-foreground">{currentNode!.label}</span>.
              </p>
            </div>
          )}
          {!isLoading && results.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground">{total} result{total !== 1 ? 's' : ''}</p>
              <ol className="space-y-2">
                {results.map(item => (
                  <li key={item.id}>
                    {item.type === 'program'
                      ? <ProgramResultCard program={item} clientId={clientId} slug={clientSlug} embedMode={embedMode} />
                      : <ResultCard provider={item} clientId={clientId} slug={clientSlug} embedMode={embedMode} />}
                  </li>
                ))}
              </ol>
              {total > results.length && (
                <p className="text-xs text-muted-foreground">Showing {results.length} of {total}.</p>
              )}
            </>
          )}
        </>
      ) : (
        <div className="space-y-2">
          {visibleNodes.map((node) => (
            <WizardCard
              key={node.id}
              label={node.label}
              labelUserFacing={node.label_user_facing}
              providerCount={node.provider_count}
              onClick={() => handleNodeClick(node)}
              hasChildren={hasChildren(node)}
              iconName={path.length === 0 ? DOMAIN_ICON[node.slug] : undefined}
            />
          ))}
          {visibleNodes.length === 0 && (
            <p className="text-sm text-muted-foreground">No categories available.</p>
          )}
        </div>
      )}
    </div>
  )
}
