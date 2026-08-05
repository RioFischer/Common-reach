'use client'

import { useEffect } from 'react'

export function HeightReporter() {
  useEffect(() => {
    function report() {
      const height = document.documentElement.scrollHeight
      window.parent.postMessage({ type: 'commonreach-resize', height }, '*')
    }
    report()
    const ro = new ResizeObserver(report)
    ro.observe(document.documentElement)
    return () => ro.disconnect()
  }, [])
  return null
}
