import type { Metadata } from 'next'
import { DemoEmbed } from '@/components/DemoEmbed'

export const metadata: Metadata = {
  title: 'Codman Square Demo — CommonReach',
  description: 'A CommonReach directory demo prepared for the Codman Square Anti-Displacement Initiative.',
}

// The codman-square tenant only exists in the Resource_Directory staging
// backend, not production — swap to the production embed once that data
// is promoted.
const EMBED_URL = 'https://stage--resourcedirectory.netlify.app/embed/codman-square/search'

export default function CodmanSquarePage() {
  return (
    <DemoEmbed
      cityName="Codman Square"
      embedUrl={EMBED_URL}
      disclaimer="This is a demo prepared for the Codman Square Anti-Displacement Initiative."
    />
  )
}
