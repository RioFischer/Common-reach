import { redirect } from 'next/navigation'

interface BrowsePageProps {
  params: {
    slug: string
    path: string[]
  }
}

/**
 * Deep-link browse route: /[slug]/browse/[...path]
 * Redirects to the search page with ?browse= param set.
 * Kept for backwards-compat with any existing links.
 */
export default function BrowsePage({ params }: BrowsePageProps) {
  const { slug, path } = params
  const browsePath = (path ?? []).join('/')
  redirect(`/${slug}/search${browsePath ? `?browse=${browsePath}` : ''}`)
}
