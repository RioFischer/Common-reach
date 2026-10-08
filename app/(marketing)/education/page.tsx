import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CommonReach for Community Colleges — Basic Needs Referral Directories',
  description: 'CommonReach gives your single point of contact a living referral directory for student basic needs — on your site, by phone, by text, in any language, around the clock.',
  alternates: { canonical: '/education' },
  openGraph: { title: 'CommonReach for Community Colleges — Basic Needs Referral Directories', description: 'CommonReach gives your single point of contact a living referral directory for student basic needs — on your site, by phone, by text, in any language, around the clock.', url: '/education', type: 'website' },
}

export default function EducationPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="hero" aria-labelledby="hero-heading">
        <div className="container">
          <div className="hero-inner">
            <div>
              <h1 id="hero-heading">Trustworthy data.<br /><strong>Always accessible.</strong></h1>
      
              <p className="hero-sub">
                CommonReach equips SPOCs with a current, trustworthy source of information and an accessible resource for the student who comes in only once.
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
                <span role="listitem">Automatic data refreshing and cleaning</span>
                <span className="hero-proof-dot" aria-hidden="true"></span>
                <span role="listitem">Any language</span>
                <span className="hero-proof-dot" aria-hidden="true"></span>
                <span role="listitem">Integrates with student portals</span>
              </div>
            </div>
      
            <div className="hero-visual" role="img" aria-label="Screenshot of a college-branded CommonReach directory showing a search bar and categories including Food and Basic Needs, Housing, Health and Mental Health, Childcare and Family, and Legal and Financial Help">
              <div className="mockup-browser" aria-hidden="true">
                <div className="mockup-toolbar">
                  <div className="mockup-dots"><span></span><span></span><span></span></div>
                  <div className="mockup-url">resources.yourcollege.edu</div>
                </div>
                <div className="mockup-body">
                  <div className="mockup-nav">
                    <div className="mockup-nav-brand">
                      <span className="mockup-nav-name">CommonReach</span>
                      <span className="mockup-nav-divider"></span>
                      <span className="mockup-nav-city">Student Resources</span>
                    </div>
                    <span className="mockup-nav-tag">Free &amp; low-cost support near campus</span>
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
                      <span className="mockup-wc-label">Food &amp; Basic Needs</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">26</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Housing &amp; Shelter</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">14</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Health &amp; Mental Health</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">31</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Childcare &amp; Family</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">11</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                    <div className="mockup-wizard-card">
                      <span className="mockup-wc-label">Legal &amp; Financial Help</span>
                      <span className="mockup-wc-right"><span className="mockup-wc-count">9</span><span className="mockup-wc-chevron">&rsaquo;</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── Problem ───────────────────────────────────────────────────────────── */}
      <section className="problem" id="problem" aria-labelledby="problem-heading">
        <div className="container" style={{textAlign: 'center'}}>
          <span className="section-label" aria-hidden="true">The problem</span>
          <h2 className="section-h2" id="problem-heading">The support exists,<br /><strong>it isn't always shared</strong></h2>
          <p className="section-sub" style={{margin: '0 auto'}}>Single points of contact (SPOCs) serve the vital role of connecting students to services and programs so that they have the capacity to focus on learning. Despite their best efforts, SPOCs are overburdened with unnecessary work researching to make sure information is fresh, and building an internal roadmap of which services are most needed. We want to alleviate that burden.</p>
      
          <div className="problem-grid">
            <div className="problem-item">
              <div className="problem-number">Siloed</div>
              <h3>Knowledge doesn't always get shared among providers</h3>
              <p>Which pantry is open Thursdays, which clinic takes students without insurance, who answers the phone at the housing office. Siloed information makes it harder to build comprehensive maps of services.</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">Perishable</div>
              <h3>Data quickly goes stale</h3>
              <p>Programs shut down. Pantries are seasonal, or mobile. Email contacts and URLs change. Out-of-date data destroys trust before it solidifies.</p>
            </div>
            <div className="problem-item">
              <div className="problem-number">Stigmatized</div>
              <h3>Asking means telling someone</h3>
              <p>The religious student wondering about birth control. The young parent who has run out of diapers and feels like a failure. It takes real courage to ask for help, and stigma is a massive barrier.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* ── What it does ──────────────────────────────────────────────────────── */}
      <section className="features" id="features" aria-labelledby="features-heading">
        <div className="container">
          <div className="features-header">
            <span className="section-label" aria-hidden="true">What CommonReach does</span>
            <h2 className="section-h2" id="features-heading">A referral directory that <strong>holds the knowledge</strong></h2>
            <p className="section-sub">Built for the person responsible for the answer, and for the students who need it at two in the morning.</p>
          </div>
      
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </div>
              <h3>Students can look without asking</h3>
              <p>Anonymously browsing a directory has a low cost of entry. Students who would never walk into an office can still find the pantry, the clinic, and the legal aid line.</p>
            </div>
      
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <h3>Access in any language</h3>
              <p>A student asks in their most comfortable language. We adjust to them. Lowering the cognitive load encourages more students to search for help.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>
              </div>
              <h3>Provider information always current</h3>
              <p>We automatically keep provider details accurate, including mobile, seasonal, and frequently changing programs that go stale fastest. Every listing carries its verification status to prioritize trustworthy information.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Filters that match a student's situation</h3>
              <p>Filter by eligibility prerequisites such as insurance accepted, language, and age so that students don't waste time sifting through providers irrelevant to them.</p>
            </div>
      
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>
              </div>
              <h3>Private by design</h3>
              <p>No account, no cookies, no trackers. Conversations are deleted within the hour and nothing is saved to the student's device. We could not tell you who looked for what, because we never record it.</p>
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
                <p className="flowchart-body">We sit down with your SPOC and the staff around them &mdash; advising, financial aid, student life &mdash; to learn what students actually ask for and which providers you already trust.</p>
              </div>
            </li>
      
            <li className="flowchart-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </li>
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">2</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 2: Generation &#8220;Ingestion&#8221;</h3>
                <p className="flowchart-body">We build the directory from automated discovery plus whatever you already have &mdash; the referral spreadsheet, the handout, the list in someone's inbox. Local knowledge makes it better, and nothing you've built gets thrown away.</p>
              </div>
            </li>
      
            <li className="flowchart-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </li>
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">3</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 3: Data processing &#8220;Enrichment&#8221;</h3>
                <p className="flowchart-body">We clean and verify the data before launch. We make sure that the information is accurate and complete. Then we keep verifying it at regular intervals. A referral directory with incomplete or inaccurate data breaks trust.</p>
              </div>
            </li>
      
            <li className="flowchart-arrow" aria-hidden="true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12l7 7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </li>
      
            <li className="flowchart-step">
              <div className="flowchart-number" aria-hidden="true">4</div>
              <div className="flowchart-content">
                <h3 className="flowchart-title">Step 4: Launch</h3>
                <p className="flowchart-body">We embed the directory in your student services site under your own branding. Because we don't track student data, we can report how often the directory is opened &mdash; never what anyone searched for.</p>
              </div>
            </li>
      
          </ol>
        </div>
      </section>
      
      {/* ── Explore ───────────────────────────────────────────────────────────── */}
      <section className="explore" id="explore" aria-labelledby="explore-heading">
        <div className="container" style={{textAlign: 'center'}}>
          <span className="section-label" aria-hidden="true">See it for yourself</span>
          <h2 className="section-h2" id="explore-heading">Explore CommonReach</h2>
          <p className="section-sub" style={{margin: '0 auto'}}>The demo is built around a town rather than a campus, but every pathway a student would use is the same.</p>
      
          <div className="explore-row explore-row--single">
      
            <div className="explore-card">
              <h3>Try the demo</h3>
              <p>Browse real services, search by need, and get a feel for what a student would experience on your site.</p>
              <Link href="/demo" className="btn btn-outline-dark" target="_blank" rel="noopener">
                Open the demo
              </Link>
            </div>
      
          </div>
        </div>
      </section>
      
      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="final-cta" aria-labelledby="cta-heading">
        <div className="container">
          <div className="final-cta-inner">
            <h2 id="cta-heading">Ready to see CommonReach for your students?</h2>
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
