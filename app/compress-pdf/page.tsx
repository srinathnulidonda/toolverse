// app/compress-pdf/page.tsx

'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import {
  compressPDF,
  downloadBlob,
  formatSize,
  levelFromPreset,
  CompressLevel,
  CompressResult,
  PresetKey,
} from '@/lib/compress'

const LEVEL_INFO: Record<CompressLevel, { label: string; desc: string; tag: string }> = {
  light: { label: 'Light', desc: 'Full quality preserved', tag: 'safe' },
  medium: { label: 'Medium', desc: 'Best size/quality ratio', tag: 'balanced' },
  heavy: { label: 'Heavy', desc: 'Smallest possible size', tag: 'smallest' },
}

const PRESETS: { label: string; sub: string; value: PresetKey }[] = [
  { label: 'WhatsApp', sub: '16 MB', value: 'whatsapp' },
  { label: 'Email', sub: '5 MB', value: 'email' },
  { label: '1 MB', sub: 'docs', value: '1mb' },
  { label: '500 KB', sub: 'web', value: '500kb' },
  { label: '200 KB', sub: 'tight', value: '200kb' },
  { label: '100 KB', sub: 'min', value: '100kb' },
]

const FAQ = [
  {
    q: 'How do I compress a PDF for WhatsApp?',
    a: 'Upload your PDF, select the WhatsApp preset, and click Compress. The compression level is automatically selected for optimal results.',
  },
  {
    q: 'Is my file uploaded to a server?',
    a: 'Never. Toolverse runs 100% in your browser. Your PDF never contacts any server — it stays on your device the entire time.',
  },
  {
    q: 'How do I get a PDF under 100 KB?',
    a: 'Select the "100 KB" preset or choose Heavy compression. Results depend on content — text-only PDFs compress much smaller than image-heavy ones.',
  },
  {
    q: 'Is Toolverse really free?',
    a: 'Yes. No sign-up, no email address, no credit card. Upload, compress, download — done.',
  },
]

type Stage = 'idle' | 'loading' | 'done' | 'error'

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null)
  const [level, setLevel] = useState<CompressLevel>('medium')
  const [preset, setPreset] = useState<PresetKey>(null)
  const [stage, setStage] = useState<Stage>('idle')
  const [result, setResult] = useState<CompressResult | null>(null)
  const [over, setOver] = useState(false)
  const [progress, setProgress] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<CompressResult | null>(null)

  const handleFile = (f: File) => {
    if (!f.type.includes('pdf')) return
    setFile(f)
    setStage('idle')
    setResult(null)
    setProgress(0)
    if (preset) setLevel(levelFromPreset(preset, f.size))
  }

  const handlePreset = (p: PresetKey) => {
    setPreset(p === preset ? null : p)
    if (file && p) setLevel(levelFromPreset(p, file.size))
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset])

  const onCompress = async () => {
    if (!file) return
    setStage('loading')
    setProgress(8)
    try {
      const tick = setInterval(() => setProgress(p => Math.min(p + 9, 82)), 300)
      const res = await compressPDF(file, level)
      clearInterval(tick)
      setProgress(100)
      resultRef.current = res
      setResult(res)
      setStage('done')
    } catch {
      setStage('error')
    }
  }

  const onDownload = () => {
    if (!resultRef.current || !file) return
    downloadBlob(resultRef.current.bytes, `compressed_${file.name}`)
  }

  const onReset = () => {
    setFile(null); setResult(null); setStage('idle')
    setProgress(0); setPreset(null); setLevel('medium')
    resultRef.current = null
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)' }}>

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="nav">
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          Toolverse<span className="dot" />
        </Link>
        <div className="nav-links">
          {['Compress', 'Merge', 'Split', 'PDF → Word', 'AI Summarise'].map((t, i) => (
            <span key={t} className={`nav-link${i === 0 ? ' active' : ''}`}>{t}</span>
          ))}
        </div>
        <div className="nav-actions">
          <Link href="/" className="btn btn-secondary btn-sm">All tools</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 580, margin: '0 auto', padding: '56px 24px 96px' }}>

        {/* ── Header ───────────────────────────────────── */}
        {stage !== 'done' && (
          <div className="u-anim-0" style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ marginBottom: 20 }}>
              <span className="badge badge-brand">
                <span className="badge-dot" />
                No sign-up · Processed locally · Always free
              </span>
            </div>
            <h1 className="t-display" style={{ marginBottom: 14 }}>
              Compress PDF
            </h1>
            <p style={{
              fontSize: 16,
              color: 'var(--text-secondary)',
              lineHeight: 1.72,
              maxWidth: 420,
              margin: '0 auto',
            }}>
              Reduce file size instantly. Processed entirely in your browser —
              your file never leaves your device.
            </p>
          </div>
        )}

        {/* ── Upload + Controls ─────────────────────────── */}
        {stage !== 'done' && (
          <div className="u-anim-1">

            {/* Drop Zone */}
            <div
              className={`drop-zone${over ? ' over' : ''}`}
              style={{ marginBottom: 24 }}
              onClick={() => inputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setOver(true) }}
              onDragLeave={() => setOver(false)}
              onDrop={onDrop}
              role="button"
              tabIndex={0}
              aria-label="Upload PDF file"
              onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                style={{ display: 'none' }}
                onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {!file ? (
                <>
                  <div className="drop-icon">📄</div>
                  <p style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-0.018em', marginBottom: 5 }}>
                    Drop your PDF here
                  </p>
                  <p className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 20 }}>
                    or click to browse — any file size accepted
                  </p>
                  <button
                    className="btn btn-secondary btn-md"
                    onClick={e => { e.stopPropagation(); inputRef.current?.click() }}
                  >
                    Browse file
                  </button>
                </>
              ) : (
                <>
                  <div className="drop-icon" style={{
                    background: 'var(--brand-light)',
                    borderColor: 'var(--brand-border)',
                    fontSize: 20,
                    color: 'var(--brand)',
                  }}>✓</div>
                  <p style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.015em', marginBottom: 4 }}>
                    {file.name}
                  </p>
                  <p className="t-body-sm" style={{ color: 'var(--text-tertiary)' }}>
                    {formatSize(file.size)} · click to change
                  </p>
                </>
              )}
            </div>

            {/* Size Presets */}
            <div style={{ marginBottom: 24 }}>
              <p className="t-label" style={{ marginBottom: 10 }}>Size target</p>
              <div className="chip-row">
                {PRESETS.map(p => (
                  <button
                    key={p.value}
                    className={`chip${preset === p.value ? ' selected' : ''}`}
                    onClick={() => handlePreset(p.value)}
                    aria-pressed={preset === p.value}
                  >
                    {p.label}
                    <span className="chip-sub">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
              <span style={{ fontSize: 11, color: 'var(--text-disabled)', fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>or set level manually</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-faint)' }} />
            </div>

            {/* Compression Level */}
            <div style={{ marginBottom: 28 }}>
              <p className="t-label" style={{ marginBottom: 10 }}>Compression level</p>
              <div className="level-grid">
                {(Object.entries(LEVEL_INFO) as [CompressLevel, typeof LEVEL_INFO[CompressLevel]][]).map(([k, v]) => (
                  <button
                    key={k}
                    className={`level-card${level === k ? ' selected' : ''}`}
                    onClick={() => { setLevel(k); setPreset(null) }}
                    aria-pressed={level === k}
                  >
                    <p className="level-name">{v.label}</p>
                    <p className="level-desc">{v.desc}</p>
                    <p className="level-tag">{v.tag}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Progress */}
            {stage === 'loading' && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--text-tertiary)', fontWeight: 500 }}>
                    Compressing…
                  </span>
                  <span style={{
                    fontSize: 12,
                    color: 'var(--brand)',
                    fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                  }}>{progress}%</span>
                </div>
                <div className="progress-wrap">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error */}
            {stage === 'error' && (
              <div className="notice notice-error" style={{ marginBottom: 16 }}>
                <span style={{ flexShrink: 0 }}>⚠</span>
                <span>Compression failed. Make sure the PDF isn't password-protected and try again.</span>
              </div>
            )}

            {/* Submit */}
            <button
              className="btn btn-primary btn-lg btn-full"
              onClick={onCompress}
              disabled={!file || stage === 'loading'}
              style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}
            >
              {stage === 'loading' ? (
                <>
                  <span style={{
                    width: 14, height: 14,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    flexShrink: 0,
                  }} />
                  Compressing…
                </>
              ) : 'Compress PDF →'}
            </button>

            {/* Privacy note */}
            <p style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-disabled)',
              marginTop: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
            }}>
              <span>🔒</span>
              Your file never leaves this device
            </p>

          </div>
        )}

        {/* ── Result ───────────────────────────────────── */}
        {stage === 'done' && result && (
          <div className="u-anim-in">

            {/* Back / header */}
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <div style={{ marginBottom: 20 }}>
                <span className="badge badge-live">
                  <span className="badge-dot" />
                  Done
                </span>
              </div>
              <h1 className="t-display" style={{ marginBottom: 8 }}>
                {result.savedPercent > 0
                  ? `${result.savedPercent}% smaller`
                  : 'Already optimised'}
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-tertiary)' }}>
                {result.savedPercent > 0
                  ? 'File compressed successfully'
                  : 'This PDF was already well optimised'}
              </p>
            </div>

            <div className="result-card" style={{ marginBottom: 12 }}>
              <div className="result-card-top-line" />

              <div className="result-stats">
                {[
                  { label: 'Original', value: formatSize(result.originalSize), cls: '' },
                  { label: 'Compressed', value: formatSize(result.compressedSize), cls: 'brand' },
                  { label: 'Saved', value: `${result.savedPercent}%`, cls: 'green' },
                ].map(s => (
                  <div key={s.label} className="result-stat">
                    <p className="result-stat-label">{s.label}</p>
                    <p className={`result-stat-value${s.cls ? ` ${s.cls}` : ''}`}>{s.value}</p>
                  </div>
                ))}
              </div>

              <button
                className="btn btn-primary btn-lg btn-full"
                onClick={onDownload}
                style={{ marginBottom: 8 }}
              >
                Download compressed PDF ↓
              </button>
              <button
                className="btn btn-ghost btn-lg btn-full"
                onClick={onReset}
              >
                Compress another file
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-disabled)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
              <span>🔒</span>
              Processed entirely in your browser. Nothing was uploaded.
            </p>
          </div>
        )}

        {/* ── FAQ ──────────────────────────────────────── */}
        <div className="u-anim-3" style={{ marginTop: 80 }}>
          <span className="section-eyebrow">FAQ</span>
          <h2 className="t-section" style={{ marginBottom: 4 }}>Common questions</h2>
          <p className="t-body-sm" style={{ color: 'var(--text-tertiary)', marginBottom: 28 }}>
            Everything you need to know.
          </p>

          {FAQ.map(({ q, a }) => (
            <div key={q} className="faq-item">
              <p className="faq-q">{q}</p>
              <p className="faq-a">{a}</p>
            </div>
          ))}
        </div>

      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-logo">Toolverse<span className="dot" /></div>
        <div className="footer-links">
          {['Privacy', 'About', 'Roadmap'].map(l => (
            <span key={l} className="footer-link">{l}</span>
          ))}
        </div>
        <div className="footer-text">© 2025 Toolverse · No sign-up ever</div>
      </footer>

    </div>
  )
}