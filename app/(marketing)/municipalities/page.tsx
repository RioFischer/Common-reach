import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CommonReach for Municipalities — Community Services Directories',
  description: 'CommonReach gives your city a branded, searchable community services directory. Residents find help. Staff spend less time fielding calls.',
  alternates: { canonical: '/municipalities' },
  openGraph: { title: 'CommonReach for Municipalities — Community Services Directories', description: 'CommonReach gives your city a branded, searchable community services directory. Residents find help. Staff spend less time fielding calls.', url: '/municipalities', type: 'website' },
}

export default function MunicipalitiesPage() {
  return (
    <>
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-inner">
            <div>
              <h1 id="hero-heading">Your city has resources.<br /><strong>Make them accessible.</strong></h1>
      
              <p className="hero-sub">
                CommonReach is a community services directory built for municipalities to provide information about available services and providers.
              </p>
      
              <div className="hero-ctas">
                <a href="https://calendly.com/rio-upriver/30min" className="btn btn-accent btn-lg" target="_blank" rel="noopener">
                  Book a 30-min discovery
                </a>
                <Link href="/demo" className="btn btn-outline btn-lg" target="_blank" rel="noopener">
                  See the live demo →
                </Link>
              </div>
      
              <div className="hero-proof" role="list" aria-label="Key benefits">
                <span role="listitem">Multiple accessible pathways</span>
                <span className="hero-proof-dot" aria-hidden="true"></span>
                <span role="listitem">Set up in days</span>
                <span className="hero-proof-dot" aria-hidden="true"></span>
                <span role="listitem">Total data privacy</span>
              </div>
            </div>
      
            <div className="hero-visual" role="img" aria-label="Screenshot of the CommonReach directory showing a search bar and service category list including Basic Needs, Housing, Health, and Mental Health">
              <div className="mockup-browser" aria-hidden="true">
                <div className="mockup-toolbar">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <div className="mockup-url">anytown.commonreach.app/search</div>
                </div>
                <div className="mockup-body">
                  {/* Nav header */}
                  <div className="mockup-nav">
                    <div className="mockup-nav-brand">
                      <span className="mockup-nav-name">CommonReach</span>
                      <span className="mockup-nav-divider"></span>
                      <span className="mockup-nav-city">Anytown</span>
                    </div>
                    <span className="mockup-nav-tag">Free &amp; low-cost community services</span>
                  </div>
      
                  {/* Search bar */}
                  <div className="mockup-search-row">
                    <div className="mockup-search-wrap">
                      <svg className="mockup-search-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                      <div className="mockup-search-field" style={{display: 'flex', alignItems: 'center'}}>
                        <span style={{fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: '300'}}>Organization name or service…</span>
                      </div>
                    </div>
                    <div className="mockup-search-btn">Search</div>
                  </div>
      
                  {/* Taxonomy wizard */}
                  <div className="mockup-section-label">What are you looking for today?</div>
                  <div className="mockup-wizard-cards">
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Basic Needs</span>
                      <span className="mockup-wc-right">
                        <span className="mockup-wc-count">34</span>
                        <span className="mockup-wc-chevron">›</span>
                      </span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Housing &amp; Shelter</span>
                      <span className="mockup-wc-right">
                        <span className="mockup-wc-count">18</span>
                        <span className="mockup-wc-chevron">›</span>
                      </span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Health &amp; Medical</span>
                      <span className="mockup-wc-right">
                        <span className="mockup-wc-count">29</span>
                        <span className="mockup-wc-chevron">›</span>
                      </span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Mental Health &amp; Substance Use</span>
                      <span className="mockup-wc-right">
                        <span className="mockup-wc-count">12</span>
                        <span className="mockup-wc-chevron">›</span>
                      </span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Children, Youth &amp; Families</span>
                      <span className="mockup-wc-right">
                        <span className="mockup-wc-count">21</span>
                        <span className="mockup-wc-chevron">›</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── Proof bar ─────────────────────────────────────────────────────────── */}
      
      {/* ── Problem ───────────────────────────────────────────────────────────── */}
      <section className="problem" id="problem" aria-labelledby="problem-heading">
        <div className="container" style={{textAlign: 'center'}}>
          <span className="section-label" aria-hidden="true">The problem</span>
          <h2 className="section-h2" id="problem-heading">Community services exist.<br /><strong>Residents just can't find them.</strong></h2>
          <p className="section-sub" style={{margin: '0 auto'}}>Most municipalities publish a PDF. Or a spreadsheet. Or a web page that hasn't been touched since 2019. The result is the same: residents don't use it, and staff answer the same questions over and over.</p>
      
          <div className="problem-grid">
            <div className="problem-item">
              <div className="problem-number">Invisible</div>
              <h3>Residents don't know what exists</h3>
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
      
      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="features" id="features" aria-labelledby="features-heading">
        <div className="container">
          <div className="features-header">
            <span className="section-label" aria-hidden="true">What CommonReach does</span>
            <h2 className="section-h2" id="features-heading">A directory residents <strong>trust</strong></h2>
            <p className="section-sub">Built for people seeking services and the folks working tirelessly to help them.</p>
          </div>
      
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3>Multiple accessible pathways</h3>
              <p>Ask in plain words, search, browse, call, or text — in any language, at any time of day, from any device.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <h3>Guided browsing</h3>
              <p>For those who don't know exactly what they need and are looking to see what is available and nearby.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <h3>Hours and contact, always current</h3>
              <p>We ensure that data is correct and current, even for providers who are mobile, seasonal, or whose services frequently change. Every listing carries its verification status, so residents can see what was checked and when.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              </div>
              <h3>Complete data privacy</h3>
              <p>We don't track, record, collect or own any sensitive data on cities or residents.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3>Robust provider discovery</h3>
              <p>CommonReach automatically finds relevant providers in and around your city, and can incorporate documents, spreadsheets, or webpages to make sure all trusted providers are included.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Filters residents actually need</h3>
              <p>Filter by location, age, language, insurances accepted, target populations, and more — so residents can find exactly what's available to them specifically.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── How it works ──────────────────────────────────────────────────────── */}
      <section className="how how--accent" id="key-features" aria-labelledby="key-features-heading">
        <div className="container">
          <div className="how-inner">
            <div>
              <span className="section-label" aria-hidden="true">Key features</span>
              <h2 className="section-h2" id="key-features-heading">What makes us <strong>special?</strong></h2>
              <p className="section-sub">Our product is built with real people in mind, from the individual searching out services to the administrator tirelessly working to keep information relevant and trustworthy.</p>
              <ul className="feature-list">
                <li>Access in your language, we will adjust to you in real time.</li>
                <li>Information is constantly updated and improved through automated searches and phone calls.</li>
                <li>Browse in privacy. We store no cookies and strive toward trauma-informed language.</li>
                <li>Support available by text, WhatsApp, and a 24h phone line to meet folks where they are at.</li>
              </ul>
            </div>
            <figure className="shot-figure">
              <img className="shot shot--tall" src="/shared/img/chat-multilingual.png" width="828" height="1274" loading="lazy"
                   alt="The CommonReach chat panel. A greeting reads “Hi! What can I help you find today?”. The person replies in Spanish, asking to speak Spanish and for help with food, and the directory answers in Spanish, asking whether they want a place to pick food up or need it delivered." />
            </figure>
          </div>
        </div>
      </section>
      
      <section className="how" id="how-it-works" aria-labelledby="how-heading">
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '48px'}}>
            <span className="section-label" aria-hidden="true">How we get started</span>
            <h2 className="section-h2" id="how-heading">Launched in days,<br />Constantly improving</h2>
          </div>
      
          <ol className="flowchart" aria-label="Setup and improvement process">
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">1</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 1: Discovery</h3>
                <p className="flowchart-body">We interview municipal stakeholders to get a clear picture of the community, what is already available, and key players.</p>
              </div>
            </li>
      
            <li className="flowchart-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </li>
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">2</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 2: Generation &#8220;Ingestion&#8221;</h3>
                <p className="flowchart-body">We generate databases through automated and manual processes. We call it ingestion because we can take any type of document or record of local knowledge to improve this process.</p>
              </div>
            </li>
      
            <li className="flowchart-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </li>
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">3</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 3: Data processing &#8220;Enrichment&#8221;</h3>
                <p className="flowchart-body">This is where we process and clean the data. This happens before we go live, but is also an ongoing process to make sure that the directory stays current and trustworthy.</p>
              </div>
            </li>
      
            <li className="flowchart-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </li>
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">4</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 4: Launch</h3>
                <p className="flowchart-body">We embed the directory seamlessly on your city&#8217;s webpage. It comes with a 24/7 phone line, SMS and WhatsApp supported messaging.</p>
              </div>
            </li>
      
          </ol>
        </div>
      </section>
      
      {/* ── For whom ──────────────────────────────────────────────────────────── */}
      <section className="explore" id="explore" aria-labelledby="explore-heading">
        <div className="container" style={{textAlign: 'center'}}>
          <span className="section-label" aria-hidden="true">See it for yourself</span>
          <h2 className="section-h2" id="explore-heading">Explore CommonReach</h2>
          <p className="section-sub" style={{margin: '0 auto'}}>There are two ways to get a feel for what CommonReach can do for your community.</p>
      
          <div className="explore-row">
      
            <div className="explore-card">
              <h3>Try the demo</h3>
              <p>This is how CommonReach would look on your city's webpage. Browse real services, search by need, and get a feel for the resident experience.</p>
              <Link href="/demo" className="btn btn-outline-dark" target="_blank" rel="noopener">
                Open the demo
              </Link>
            </div>
      
            <div className="explore-card">
              <h3>Call this number</h3>
              <a href="tel:+19787881096" style={{display: 'block', textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: '1.25rem', fontWeight: '700', color: 'var(--brand-primary)', textDecoration: 'none', marginBottom: '4px'}}>+1 (978) 788-1096</a>
              <p style={{textAlign: 'left'}}>This number is a demo phone line. Call it to experience how CommonReach lets residents access services by voice — no app, no internet required, and a natural way in for residents who are blind or have low tech literacy.</p>
            </div>
      
          </div>
        </div>
      </section>
      
      {/* ── Partnership ──────────────────────────────────────────────────────── */}
      <section className="proof" id="partnership" aria-labelledby="partnership-heading">
        <div className="container">
          <div style={{textAlign: 'center', marginBottom: '48px'}}>
            <span className="proof-label" aria-hidden="true">How we work together</span>
            <h2 id="partnership-heading" style={{fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,3vw,2.25rem)', fontWeight: '300', color: 'var(--surface-card)', lineHeight: '1.25'}}>A partnership, not a product.</h2>
          </div>
      
          <div className="partnership-grid">
      
            <div className="partnership-col">
              <h3 className="partnership-heading">What you bring</h3>
              <ul className="partnership-list">
                <li>Local knowledge about what matters most to your residents</li>
                <li>Information about local trusted service providers, and what they offer</li>
                <li>A commitment to residents and community based organizations</li>
              </ul>
            </div>
      
            <div className="partnership-col partnership-col--center">
              <h3 className="partnership-heading">What we make together</h3>
              <ul className="partnership-list">
                <li>A resident-facing directory that can be accessed in any language, at any time, through any device</li>
                <li>An up-to-date registry of social services, community based organizations, and governmental agencies</li>
                <li>A commitment to build community connections and social resilience and adaptive capacity</li>
              </ul>
            </div>
      
            <div className="partnership-col">
              <h3 className="partnership-heading">What we bring</h3>
              <ul className="partnership-list">
                <li>Tools to find and categorize providers</li>
                <li>Automated flows to clean, sort, and tag data</li>
                <li>Software, phonelines, and servers to run it all</li>
                <li>A commitment to partner with you to maintain the highest quality experiences and services hosted on your page</li>
              </ul>
            </div>
      
          </div>
      
        </div>
      </section>
      
      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="final-cta" aria-labelledby="cta-heading">
        <div className="container">
          <div className="final-cta-inner">
            <h2 id="cta-heading">Ready to see CommonReach for your city?</h2>
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
