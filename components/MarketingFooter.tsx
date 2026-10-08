import Link from 'next/link'

export function MarketingFooter() {
  return (
    <footer>
      <div className="container">
        <div className="footer-inner">
          <span className="footer-logo">CommonReach</span>
          <span className="footer-copy">© 2026 CommonReach — a product of Upriver Design</span>
          <div className="footer-links">
            <Link href="/">Overview</Link>
            <Link href="/municipalities">Municipalities</Link>
            <Link href="/education">Community colleges</Link>
            <Link href="/demo">Live demo</Link>
            <a href="https://www.upriver.design" target="_blank" rel="noopener">Upriver Design</a>
            <a href="mailto:rio@upriver.design">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
