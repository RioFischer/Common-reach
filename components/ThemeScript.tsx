import { buildCssBlock } from '@/lib/theme'
import type { ThemeConfig } from '@/lib/types'

interface ThemeScriptProps {
  config: ThemeConfig | null | undefined
}

/**
 * Server component — injects a <style> block with all resolved CSS token
 * variables directly into the page, overriding the root layout defaults.
 *
 * Security: CSS is built from server-validated ThemeConfig values only.
 * Hex colours are validated by the Pydantic schema before reaching here;
 * typography and radius values are numeric; no raw user input is interpolated.
 */
export function ThemeScript({ config }: ThemeScriptProps) {
  return (
    <style
      // biome-ignore lint/security/noDangerouslySetInnerHtml: server-built CSS, no user input
      dangerouslySetInnerHTML={{ __html: buildCssBlock(config) }}
    />
  )
}
