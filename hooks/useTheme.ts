'use client'

import { useEffect } from 'react'
import { applyTheme } from '@/lib/theme'
import type { ThemeConfig } from '@/lib/types'

/**
 * Re-applies a ThemeConfig to the document's CSS variables on the client.
 * Safety net for client-side navigation when the server-rendered <ThemeScript>
 * block is not re-executed (SPA transitions between tenants).
 *
 * No-op during SSR. The server-side ThemeScript handles first render.
 */
export function useTheme(config: ThemeConfig | null | undefined): void {
  useEffect(() => {
    applyTheme(config)
  }, [config])
}
