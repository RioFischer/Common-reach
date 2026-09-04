import type { Metadata } from 'next'
import { DemoEmbed } from '@/components/DemoEmbed'

export const metadata: Metadata = {
  title: 'Demo — CommonReach',
  description: 'Try the CommonReach community services directory with sample data for the fictional town of Anytown, USA.',
}

export default function DemoPage() {
  return (
    <DemoEmbed
      cityName="Anytown, USA"
      embedUrl="https://resourcedirectory.netlify.app/embed/anytown-usa/search"
      disclaimer="This is a CommonReach demo. Anytown, USA is a fictional municipality — all providers, addresses, and contact information shown here are for demonstration purposes only and do not represent real organizations or services."
    />
  )
}
