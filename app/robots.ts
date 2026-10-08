import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Demo data is fictional; keeping it out of search stops anyone finding a
      // made-up pantry and trying to call it.
      disallow: ['/demo', '/codman-square'],
    },
    sitemap: 'https://common-reach.com/sitemap.xml',
  }
}
