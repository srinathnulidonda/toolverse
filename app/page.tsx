// app/page.tsx

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Toolverse — Free PDF Tools. No Sign-Up.',
  description: 'Compress, merge, split, convert — processed entirely in your browser. Your files never touch a server.',
}

const TOOLS = [
  {
    href: '/compress-pdf',
    emoji: '🗜️',
    name: 'Compress PDF',
    desc: 'Reduce file size for email, portals, or storage. Works on any PDF, any size.',
    badge: 'live' as const,
    live: true,
  },
  {
    href: '/merge-pdf',
    emoji: '🔗',
    name: 'Merge PDF',
    desc: 'Combine multiple PDFs into one. Drag pages to reorder exactly how you need.',
    badge: 'soon' as const,
    live: false,
  },
  {
    href: '/split-pdf',
    emoji: '✂️',
    name: 'Split PDF',
    desc: 'Extract specific pages or split into multiple separate files instantly.',
    badge: 'soon' as const,
    live: false,
  },
  {
    href: '/pdf-to-word',
    emoji: '📝',
    name: 'PDF → Word',
    desc: 'Convert any PDF into a fully editable .docx document in seconds.',
    badge: 'soon' as const,
    live: false,
  },
  {
    href: '/jpg-to-pdf',
    emoji: '🖼️',
    name: 'Image → PDF',
    desc: 'Turn photos, JPGs, or PNGs into a single clean PDF file instantly.',
    badge: 'soon' as const,
    live: false,
  },
  {
    href: '/summarize-pdf',
    emoji: '✦',
    name: 'AI Summarise',
    desc: 'Upload any PDF and get a smart summary, key points, and instant Q&A.',
    badge: 'ai' as const,
    live: false,
  },
]

const STATS = [
  { value: '0', label: 'Sign-ups required' },
  { value: '∞', label: 'File size limit', brand: false },
  { value: '100%', label: 'Browser-side processing' },
  { value: 'Free', label: 'Always, no credit card', brand: true },
]

const WHY = [
  {
    num: '01',
    icon: '⚡',
    title: 'Instant results',
    desc: 'All processing runs locally in your browser. No upload queues, no server latency. Results in seconds on any connection.',
  },
  {
    num: '02',
    icon: '🔒',
    title: 'Complete privacy',
    desc: 'Your files never leave your device. Zero server contact, zero cloud storage, zero data risk — by design.',
  },
  {
    num: '03',
    icon: '📱',
    title: 'Works everywhere',
    desc: 'Designed for every screen — desktop, tablet, or phone. No app install needed, just open and use.',
  },
]

function ToolBadge({ type }: { type: 'live' | 'soon' | 'ai' }) {
  if (type === 'live') return (
    <span className="badge badge-live">
      <span className="badge-dot" />Live
    </span>
  )
  if (type === 'ai') return <span className="badge badge-ai">✦ AI</span>
  return <span className="badge badge-soon">Soon</span>
}

export default function HomePage() {
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="nav">
        <span className="nav-logo">
          Toolverse<span className="dot" />
        </span>
        <div className="nav-links">
          {['Compress', 'Merge', 'Split', 'PDF → Word', 'AI Summarise'].map(t => (
            <span key={t} className="nav-link">{t}</span>
          ))}
        </div>
        <div className="nav-actions">
          <Link href="/compress-pdf" className="btn btn-primary btn-sm">Try free →</Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section style={{ padding: 'var(--sp-11) 0 var(--sp-10)' }}>
        <div className="wrap">
          <div className="hero-grid">

            {/* Left — copy */}
            <div>
              <div className="u-anim-0" style={{ marginBottom: 28 }}>
                <span className="badge badge-brand">
                  <span className="badge-dot" />
                  No sign-up · No uploads · 100% free
                </span>
              </div>

              <h1 className="t-hero u-anim-1" style={{ marginBottom: 24 }}>
                PDF tools that<br />
                <em>just work.</em>
              </h1>

              <p className="u-anim-2" style={{
                fontSize: 17,
                color: 'var(--text-secondary)',
                maxWidth: 460,
                lineHeight: 1.75,
                marginBottom: 40,
              }}>
                Compress, merge, split, convert — processed entirely in your browser.
                Your files never touch a server.
              </p>

              <div className="u-anim-3" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 44 }}>
                <Link href="/compress-pdf" className="btn btn-primary btn-xl">
                  Compress a PDF →
                </Link>
                <span className="btn btn-outline btn-xl" style={{ cursor: 'pointer' }}>
                  Explore tools
                </span>
              </div>

              <div className="trust-row u-anim-4" style={{ justifyContent: 'flex-start' }}>
                <span className="trust-item">⚡ Instant results</span>
                <span className="trust-dot" />
                <span className="trust-item">🔒 Files stay on device</span>
                <span className="trust-dot" />
                <span className="trust-item">📱 Any device</span>
                <span className="trust-dot" />
                <span className="trust-item">✦ AI-powered</span>
              </div>
            </div>

            {/* Right — upload preview card */}
            <div className="u-anim-2">
              <div className="hero-upload-card">
                <div style={{
                  border: '1.5px dashed var(--border-default)',
                  borderRadius: 'var(--r-xl)',
                  padding: '40px 24px',
                  textAlign: 'center',
                  background: 'var(--surface-0)',
                  marginBottom: 20,
                }}>
                  <div style={{
                    width: 52,
                    height: 52,
                    borderRadius: 'var(--r-lg)',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                    fontSize: 22,
                  }}>📄</div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 5, letterSpacing: '-0.015em' }}>
                    Drop your PDF here
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 18 }}>
                    or click to browse — any file size
                  </p>
                  <Link href="/compress-pdf" className="btn btn-secondary btn-sm">
                    Browse file
                  </Link>
                </div>

                {/* Compression level preview */}
                <div style={{ marginBottom: 16 }}>
                  <p style={{
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: '0.07em',
                    textTransform: 'uppercase',
                    color: 'var(--text-tertiary)',
                    marginBottom: 8,
                  }}>Compression level</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                    {['Light', 'Medium', 'Heavy'].map((l, i) => (
                      <div key={l} style={{
                        padding: '10px 10px',
                        borderRadius: 'var(--r-md)',
                        border: `1px solid ${i === 1 ? 'var(--brand)' : 'var(--border-subtle)'}`,
                        background: i === 1 ? 'var(--brand-light)' : 'var(--surface-2)',
                        textAlign: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: i === 1 ? 'var(--brand)' : 'var(--text-secondary)',
                      }}>{l}</div>
                    ))}
                  </div>
                </div>

                <Link href="/compress-pdf" className="btn btn-primary btn-lg btn-full">
                  Compress PDF →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <section style={{ paddingBottom: 'var(--sp-10)' }}>
        <div className="wrap u-anim-2">
          <div className="stats-row">
            {STATS.map(s => (
              <div key={s.label} className="stat-cell">
                <div className={`stat-value${s.brand ? ' brand' : ''}`}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Grid ───────────────────────────────────── */}
      <section style={{ paddingBottom: 'var(--sp-11)' }}>
        <div className="wrap">
          <div style={{ marginBottom: 36 }}>
            <span className="section-eyebrow">All tools</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
              <h2 className="t-title">Everything you need</h2>
              <span style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', paddingBottom: 3 }}>
                View roadmap →
              </span>
            </div>
            <p className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginTop: 6 }}>
              Compress is live. Five more tools launching soon.
            </p>
          </div>

          <div className="grid-3">
            {TOOLS.map(tool =>
              tool.live ? (
                <Link key={tool.href} href={tool.href} className="tool-card live">
                  <div className="tool-card-badge">
                    <ToolBadge type={tool.badge} />
                  </div>
                  <span className="tool-icon">{tool.emoji}</span>
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-desc">{tool.desc}</div>
                  <div className="tool-cta">Use tool <span>→</span></div>
                </Link>
              ) : (
                <div
                  key={tool.href}
                  className="tool-card"
                  style={{ opacity: 0.42, cursor: 'default', pointerEvents: 'none' }}
                >
                  <div className="tool-card-badge">
                    <ToolBadge type={tool.badge} />
                  </div>
                  <span className="tool-icon">{tool.emoji}</span>
                  <div className="tool-name">{tool.name}</div>
                  <div className="tool-desc">{tool.desc}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── Why ──────────────────────────────────────────── */}
      <section style={{ paddingBottom: 'var(--sp-11)' }}>
        <div className="wrap">
          <div style={{ marginBottom: 40 }}>
            <span className="section-eyebrow">Why Toolverse</span>
            <h2 className="t-title">
              Designed for how<br />you actually work
            </h2>
          </div>
          <div className="grid-3">
            {WHY.map(w => (
              <div key={w.title} className="why-card">
                <div className="why-number">{w.num}</div>
                <div className="why-icon">{w.icon}</div>
                <div className="why-title">{w.title}</div>
                <div className="why-desc">{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section style={{ paddingBottom: 'var(--sp-11)' }}>
        <div className="wrap">
          <div className="cta-banner">
            <div>
              <h2 className="t-section" style={{ marginBottom: 8 }}>
                Ready to compress your first PDF?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                No sign-up. No size limit. Done in seconds.
              </p>
            </div>
            <Link href="/compress-pdf" className="btn btn-primary btn-xl">
              Get started free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">Toolverse<span className="dot" /></div>
        <div className="footer-links">
          {['Privacy', 'About', 'Roadmap'].map(l => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
        <div className="footer-text">© 2025 Toolverse · Free PDF tools · No sign-up ever</div>
      </footer>

    </div>
  )
}