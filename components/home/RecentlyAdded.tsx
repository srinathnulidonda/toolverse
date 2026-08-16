// components/home/RecentlyAdded.tsx
import Link from "next/link";
import { getNewTools, getCategoryBySlug } from "@/lib/tools";

export default function RecentlyAdded() {
  const items = getNewTools();

  if (items.length === 0) return null;

  return (
    <section className="ra-section">
      <div className="ra-head">
        <div className="ra-head-left">
          <span className="ra-eyebrow">Just shipped</span>
          <h2 className="ra-title">Recently added</h2>
        </div>
        <Link href="/tools" className="ra-all-link">
          View all
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="ra-grid">
        {items.map((tool) => {
          const category = getCategoryBySlug(tool.category);
          return (
            <Link key={tool.slug} href={tool.href} className="ra-card">
              <div className="ra-card-top">
                <div className="ra-icon-name">
                  <span className="ra-icon">
                    <i className={`ti ${tool.icon}`} aria-hidden="true" />
                  </span>
                  <span className="ra-name">{tool.label}</span>
                </div>
                <span className="ra-new-badge">New</span>
              </div>

              <div className="ra-card-body">
                <span className="ra-desc">{tool.description}</span>
              </div>

              <div className="ra-card-footer">
                <span className="ra-category-tag">{category?.label ?? tool.category}</span>
                <span className="ra-open">
                  Open
                  <i className="ti ti-arrow-up-right" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .ra-section {
          width: 100%;
        }

        .ra-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
        }

        .ra-head-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .ra-eyebrow {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }

        .ra-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.4px;
          font-family: var(--font-sans);
          margin: 0;
        }

        .ra-all-link {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-tertiary);
          text-decoration: none;
          font-family: var(--font-sans);
          transition: color 0.15s;
          flex-shrink: 0;
          border-radius: 4px;
        }
        .ra-all-link i { font-size: 12px; }
        .ra-all-link:hover { color: var(--text); text-decoration: none; }

        .ra-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .ra-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 16px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
        }
        .ra-card:hover {
          border-color: var(--border-faint);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          text-decoration: none;
        }
        .ra-card:hover .ra-open {
          color: var(--text);
        }

        .ra-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .ra-icon-name {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .ra-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          background: var(--bg-surface);
          color: var(--text-secondary);
        }

        .ra-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ra-new-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          letter-spacing: 0.04em;
          text-transform: uppercase;
          border: 1px solid var(--brand-border);
          flex-shrink: 0;
        }

        .ra-card-body {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .ra-desc {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .ra-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }

        .ra-category-tag {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-weight: 500;
        }

        .ra-open {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          transition: color 0.15s;
        }
        .ra-open i { font-size: 11px; }

        .ra-card:focus-visible,
        .ra-all-link:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (max-width: 1080px) {
          .ra-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 768px) {
          .ra-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .ra-title { font-size: 16px; }
          .ra-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}