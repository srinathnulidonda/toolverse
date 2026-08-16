// app/not-found.tsx
import Link from "next/link";
import { TOOLS } from "@/lib/tools";
import { getCategoriesWithCount } from "@/lib/tools";

export const metadata = {
  title: "Page Not Found - Toolverse",
  description: "The page you're looking for doesn't exist or has been moved.",
};

const popular = TOOLS.slice(0, 4);

export default function NotFound() {
  const CATEGORIES = getCategoriesWithCount();

  return (
    <>
      <div className="nf-page">
        <div className="nf-shell">
          {/* Status */}
          <div className="nf-status">
            <span className="nf-status-dot" aria-hidden="true" />
            404 — Page not found
          </div>

          {/* Headline */}
          <h1 className="nf-title">
            We couldn&apos;t find that page.
            <br />
            <span className="nf-title-muted">Here are some popular tools to get you started.</span>
          </h1>

          {/* Popular tools */}
          <div className="nf-results">
            <p className="nf-results-label">Popular tools</p>
            <div className="nf-results-list">
              {popular.map((tool) => (
                <Link key={tool.slug} href={tool.href} className="nf-result-item">
                  <div className="nf-result-icon">
                    <i className={`ti ${tool.icon}`} aria-hidden="true" />
                  </div>
                  <div className="nf-result-body">
                    <span className="nf-result-name">{tool.label}</span>
                    <span className="nf-result-desc">{tool.description}</span>
                  </div>
                  <i className="ti ti-arrow-right nf-result-arrow" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="nf-footer">
            <Link href="/" className="nf-btn nf-btn-ghost">
              <i className="ti ti-home" aria-hidden="true" />
              Home
            </Link>
            <Link href="/tools" className="nf-btn nf-btn-primary">
              <i className="ti ti-layout-grid" aria-hidden="true" />
              Browse all {TOOLS.length} tools
            </Link>
            <div className="nf-footer-cats">
              {CATEGORIES.slice(0, 4).map((cat) => (
                <Link key={cat.slug} href={`/categories/${cat.slug}`} className="nf-cat-chip">
                  <i className={`ti ${cat.icon}`} aria-hidden="true" />
                  {cat.label.replace(" Tools", "")}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* styles remain the same */}
      <style>{`
        .nf-page {
          min-height: 100vh;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 64px 24px;
        }

        .nf-shell {
          width: 100%;
          max-width: 580px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        /* Status pill */
        .nf-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12px;
          font-weight: 500;
          color: var(--text-tertiary);
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 99px;
          padding: 6px 14px 6px 11px;
          font-family: var(--font-sans);
          letter-spacing: 0.01em;
          margin-bottom: 28px;
        }

        .nf-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #E05252;
          flex-shrink: 0;
        }

        /* Title */
        .nf-title {
          font-size: clamp(24px, 4vw, 36px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -1.1px;
          line-height: 1.22;
          margin: 0 0 32px;
          font-family: var(--font-sans);
        }

        .nf-title-muted {
          color: var(--text-tertiary);
          font-size: 0.75em;
          font-weight: 500;
          letter-spacing: -0.5px;
        }

        /* Results */
        .nf-results {
          width: 100%;
          text-align: left;
        }

        .nf-results-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
          margin: 0 0 10px;
        }

        .nf-results-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nf-result-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.12s, border-color 0.12s;
        }
        .nf-result-item:hover {
          background: var(--bg-surface);
          border-color: var(--border-faint);
          text-decoration: none;
        }

        .nf-result-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 15px;
          color: var(--text-secondary);
        }

        .nf-result-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .nf-result-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nf-result-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1.4;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nf-result-arrow {
          font-size: 13px;
          color: var(--text-disabled);
          flex-shrink: 0;
          transition: transform 0.15s;
        }
        .nf-result-item:hover .nf-result-arrow {
          transform: translateX(3px);
          color: var(--text-tertiary);
        }

        /* Footer */
        .nf-footer {
          width: 100%;
          margin-top: 36px;
          padding-top: 28px;
          border-top: 0.5px solid var(--border);
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .nf-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          font-weight: 500;
          font-family: var(--font-sans);
          padding: 10px 16px;
          border-radius: 9px;
          text-decoration: none;
          white-space: nowrap;
          transition: background 0.15s, border-color 0.15s;
        }
        .nf-btn:hover { text-decoration: none; }
        .nf-btn i { font-size: 14px; }

        .nf-btn-primary {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }
        .nf-btn-primary:hover {
          background: var(--brand-border);
        }

        .nf-btn-ghost {
          background: var(--bg-card);
          color: var(--text-secondary);
          border: 0.5px solid var(--border);
        }
        .nf-btn-ghost:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .nf-footer-cats {
          width: 100%;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .nf-cat-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          padding: 6px 12px;
          border-radius: 99px;
          border: 0.5px solid var(--border);
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
        }
        .nf-cat-chip:hover {
          background: var(--bg-surface);
          color: var(--text-secondary);
          text-decoration: none;
        }
        .nf-cat-chip i { font-size: 12px; }

        @media (max-width: 480px) {
          .nf-page { padding: 40px 18px; }
          .nf-footer { flex-direction: column; }
          .nf-btn { width: 100%; justify-content: center; }
        }
      `}</style>
    </>
  );
}
