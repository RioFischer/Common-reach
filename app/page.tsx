import Link from 'next/link'

export default function HomePage() {
  return (
    <main
      id="main-content"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--ds-space-6)',
      }}
    >
      <div>
        <p>Landing page coming soon.</p>
        <p>
          <Link href="/demo">View the demo &rarr;</Link>
        </p>
      </div>
    </main>
  )
}
