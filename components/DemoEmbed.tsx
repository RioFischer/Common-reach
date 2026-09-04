'use client'

import { useEffect, useRef } from 'react'
import { NavHeader } from './NavHeader'
import { PageFooter } from './PageFooter'

interface DemoEmbedProps {
  cityName: string
  embedUrl: string
  disclaimer: string
}

export function DemoEmbed({ cityName, embedUrl, disclaimer }: DemoEmbedProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === 'commonreach-resize' && iframeRef.current) {
        iframeRef.current.style.height = e.data.height + 'px'
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <>
      <NavHeader cityName={cityName} />
      <div style={{ backgroundColor: 'var(--ds-bg-subtle)', borderBottom: '1px solid var(--ds-border-default)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '12px var(--ds-space-6)' }}>
          <p style={{ margin: 0, fontSize: 'var(--ds-text-sm)', color: 'var(--ds-text-secondary)', lineHeight: 1.6 }}>
            {disclaimer}
          </p>
        </div>
      </div>
      <main id="main-content" style={{ maxWidth: '72rem', margin: '0 auto', padding: 'var(--ds-space-6)' }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          style={{ width: '100%', border: 'none', display: 'block', minHeight: '80vh' }}
          title={`${cityName} community services directory — CommonReach demo`}
        />
      </main>
      <PageFooter />
    </>
  )
}
