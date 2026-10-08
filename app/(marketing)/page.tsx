import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CommonReach — Community Services Directories That People Actually Use',
  description: 'CommonReach is a community services directory for municipalities and community colleges. People find what they need by search, browse, phone, or text — in any language, at any hour.',
  alternates: { canonical: '/' },
  openGraph: { title: 'CommonReach — Community Services Directories That People Actually Use', description: 'CommonReach is a community services directory for municipalities and community colleges. People find what they need by search, browse, phone, or text — in any language, at any hour.', url: '/', type: 'website' },
}

export default function HomePage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-inner">
            <div>
              <h1 id="hero-heading">The help is there,<br /><strong>make it discoverable</strong></h1>
      
              <p className="hero-sub">
                CommonReach is a community services directory that connects folks with programs and services. Information is automatically kept up-to-date and trustworthy. Folks can find services in any language, from any device.
              </p>
      
              <div className="hero-ctas">
                <a href="https://calendly.com/rio-upriver/30min" className="btn btn-accent btn-lg" target="_blank" rel="noopener">
                  Book a 30-min discovery
                </a>
                <Link href="/demo" className="btn btn-outline btn-lg" target="_blank" rel="noopener">
                  See the live demo &rarr;
                </Link>
              </div>
      
              <div className="hero-proof" role="list" aria-label="Key benefits">
                <span role="listitem">Any language</span>
                <span className="hero-proof-dot" aria-hidden="true"></span>
                <span role="listitem">Access by web, phone, or text</span>
                <span className="hero-proof-dot" aria-hidden="true"></span>
                <span role="listitem">No personal data tracked or stored</span>
              </div>
            </div>
      
            <div className="hero-visual" role="img" aria-label="Screenshot of the CommonReach directory showing a search bar and service category list including Basic Needs, Housing, Health, and Mental Health">
              <div className="mockup-browser" aria-hidden="true">
                <div className="mockup-toolbar">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <div className="mockup-url">anytown.commonreach.app/search</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-nav">
                    <div className="mockup-nav-brand">
                      <span className="mockup-nav-name">CommonReach</span>
                      <span className="mockup-nav-divider"></span>
                      <span className="mockup-nav-city">Anytown</span>
                    </div>
                    <span className="mockup-nav-tag">Free &amp; low-cost community services</span>
                  </div>
      
                  <div className="mockup-search-row">
                    <div className="mockup-search-wrap">
                      <svg className="mockup-search-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <div className="mockup-search-field" style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '300'}}>Organization name or service&hellip;</span>
                      </div>
                    </div>
                    <div className="mockup-search-btn">Search</div>
                  </div>
      
                  <div className="mockup-section-label">What are you looking for today?</div>
                  <div className="mockup-wizard-cards">
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Basic Needs</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">34</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Housing &amp; Shelter</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">18</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Health &amp; Medical</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">29</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Mental Health &amp; Substance Use</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">12</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Children, Youth &amp; Families</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">21</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── Audience chooser ──────────────────────────────────────────────────── */}
      <section className="explore" id="who" aria-labelledby="who-heading">
        <div className="container" style={{textAlign: 'center'}}>
          <span className="section-label" aria-hidden="true">Who it's for</span>
          <h2 className="section-h2" id="who-heading">Organizations focused on <strong>connections to care</strong></h2>
          <p className="section-sub" style={{margin: '0 auto'}}>Anyone interested in reducing barriers folks face when searching out services or programs.</p>
      
          <div className="explore-row">
      
            <Link className="explore-card audience-card" href="/municipalities">
              <span className="label-tag">For municipalities</span>
              <h3>Your city has resources. Residents can't always find them.</h3>
              <p>Replace the PDF or spreadsheet filled with outdated information with a directory residents trust. It can be embedded on your municipal site and has a dedicated 24h phone line.</p>
              <span className="audience-go" aria-hidden="true">CommonReach for municipalities &rarr;</span>
            </Link>
      
            <Link className="explore-card audience-card" href="/education">
              <span className="label-tag">For community colleges</span>
              <h3>One SPOC can't be everywhere at once.</h3>
              <p>Give your single point of contact a referral directory that holds trustworthy information, works asynchronously, and lets students browse privately.</p>
              <span className="audience-go" aria-hidden="true">CommonReach for community colleges &rarr;</span>
            </Link>
      
          </div>
        </div>
      </section>
      
      {/* ── Problem ───────────────────────────────────────────────────────────── */}
      <section className="problem" id="problem" aria-labelledby="problem-heading">
        <div className="container" style={{textAlign: 'center'}}>
          <span className="section-label" aria-hidden="true">The problem</span>
          <h2 className="section-h2" id="problem-heading">Community services exist.<br /><strong>People just can't find them.</strong></h2>
          <p className="section-sub" style={{margin: '0 auto'}}>Most organizations publish a PDF, spreadsheet, or webpage that hasn't been touched in years. The result is people who don't trust the information and staff that is underwater trying to keep information organized and useful to those who need it most.</p>
      
          <div className="problem-grid">
            <div className="problem-item">
              <div className="problem-number">Invisible</div>
              <h3>People don't know what exists</h3>
              <p>Without outreach campaigns, solid recruitment, or word of mouth, populations are left underserved by providers who are doing their best to help.</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">Obsolete</div>
              <h3>Static lists become stale within months</h3>
              <p>Phone numbers change. Hours shift. Organizations close. Without active maintenance, directories are no longer trustworthy.</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">Inaccessible</div>
              <h3>Language, technology or fear blocks the way</h3>
              <p>All sorts of barriers stand in the way of people seeking help: confusing eligibility requirements, inconsistent language coverage, prohibitive cost and more.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="final-cta" aria-labelledby="cta-heading">
        <div className="container">
          <div className="final-cta-inner">
            <h2 id="cta-heading">Ready to see CommonReach for your community?</h2>
            <p>Book a 30-minute discovery. We'll show you the live demo, walk through how we'd build yours, and answer every question you have.</p>
            <div className="final-cta-actions">
              <a href="https://calendly.com/rio-upriver/30min" className="btn btn-accent btn-lg" target="_blank" rel="noopener">
                Book a 30-min discovery
              </a>
              <a href="mailto:rio@upriver.design" className="btn btn-primary btn-lg">
                Email us
              </a>
            </div>
            <p className="final-cta-note">No sales pressure. No technical complexity. Just a conversation.</p>
          </div>
        </div>
      </section>
    </>
  )
}
