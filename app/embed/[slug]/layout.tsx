import { HeightReporter } from '@/components/embed/HeightReporter'
import { EmbedAttribution } from '@/components/embed/EmbedAttribution'

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeightReporter />
      {children}
      <EmbedAttribution />
    </div>
  )
}
