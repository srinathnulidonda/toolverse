// components/home/BrowseCategories.tsx
import Link from "next/link";
import { getCategoriesWithCount } from "@/lib/tools";

export default function BrowseCategories() {
  const categories = getCategoriesWithCount();

  return (
    <>
      <div className="ws-card">
        <div className="ws-header">
          <span className="ws-label">Workspace</span>
          <Link href="/tools" className="ws-all-link">
            All tools
            <i className="ti ti-arrow-right" aria-hidden="true" />
          </Link>
        </div>

        <div className="ws-divider" />

        {categories.length > 0 ? (
          <div className="ws-grid">
            {categories.map((cat) => (
              <Link key={cat.slug} href={`/tools/${cat.slug}`} className="ws-chip">
                <i className={`ti ${cat.icon} ws-chip-icon`} aria-hidden="true" />
                <span className="ws-chip-name">{cat.label}</span>
                <span className="ws-chip-count" aria-label={`${cat.count} tools`}>
                  {cat.count}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="ws-empty">No categories yet</div>
        )}

        <Link href="/categories" className="ws-footer-link">
          <i className="ti ti-layout-grid" aria-hidden="true" />
          Browse all categories
        </Link>
      </div>

      <style>{`
        .ws-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          width: 100%;
          display: flex;
          flex-direction: column;
        }

        .ws-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 10px;
        }

        .ws-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }

        .ws-all-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-tertiary);
          text-decoration: none;
          font-family: var(--font-sans);
          transition: color 0.15s;
          border-radius: 4px;
        }
        .ws-all-link i { font-size: 11px; }
        .ws-all-link:hover { color: var(--text); text-decoration: none; }

        .ws-divider {
          height: 0.5px;
          background: var(--border);
          margin: 0 16px;
        }

        .ws-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          padding: 10px 12px 8px;
        }

        .ws-empty {
          padding: 24px 16px;
          text-align: center;
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .ws-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 9px 10px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.12s, border-color 0.12s;
        }
        .ws-chip:hover {
          background: var(--bg-surface);
          border-color: var(--border-faint);
          text-decoration: none;
        }

        .ws-chip-icon {
          font-size: 15px;
          color: var(--text-secondary);
          flex-shrink: 0;
        }

        .ws-chip-name {
          flex: 1;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
        }

        .ws-chip-count {
          font-size: 11px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          font-family: var(--font-sans);
        }

        .ws-footer-link {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          margin: 0 12px 12px;
          padding: 8px;
          border-radius: var(--radius-md);
          border: 0.5px dashed var(--border);
          font-size: 12px;
          color: var(--text-tertiary);
          text-decoration: none;
          font-family: var(--font-sans);
          transition: background 0.12s, color 0.12s;
          cursor: pointer;
        }
        .ws-footer-link i { font-size: 13px; }
        .ws-footer-link:hover {
          background: var(--bg-surface);
          color: var(--text-secondary);
          text-decoration: none;
        }

        .ws-chip:focus-visible,
        .ws-all-link:focus-visible,
        .ws-footer-link:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}