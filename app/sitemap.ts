import type { MetadataRoute } from 'next'

const BASE = 'https://common-reach.com'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`,                priority: 1.0 },
    { url: `${BASE}/municipalities`,  priority: 0.8 },
    { url: `${BASE}/education`,       priority: 0.8 },
  ]
}
