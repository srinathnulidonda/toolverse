// components/home/PopularTools.tsx
import Link from "next/link";
import { TOOLS, POPULAR_TOOLS, getCategoryBySlug } from "@/lib/tools";

export default function PopularTools() {
  const items = POPULAR_TOOLS.map((slug) => TOOLS.find((t) => t.slug === slug))
    .filter((t): t is (typeof TOOLS)[number] => Boolean(t))
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="pop-section">
      <div className="pop-head">
        <div className="pop-head-text">
          <span className="pop-label">Popular</span>
          <h2 className="pop-title">Most used tools</h2>
        </div>
        <Link href="/tools" className="pop-all-link">
          View all
          <i className="ti ti-arrow-right" aria-hidden="true" />
        </Link>
      </div>

      <div className="pop-grid">
        {items.map((tool) => {
          const category = getCategoryBySlug(tool.category);
          return (
            <Link key={tool.slug} href={tool.href} className="pop-card">
              <div className="pop-card-top">
                <div className="pop-icon-name">
                  <span className="pop-card-icon">
                    <i className={`ti ${tool.icon}`} aria-hidden="true" />
                  </span>
                  <span className="pop-card-name">{tool.label}</span>
                </div>
              </div>

              <div className="pop-card-body">
                <span className="pop-card-desc">{tool.description}</span>
              </div>

              <div className="pop-card-footer">
                <span className="pop-category-tag">{category?.label ?? tool.category}</span>
                <span className="pop-open">
                  Open
                  <i className="ti ti-arrow-up-right" aria-hidden="true" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <style>{`
        .pop-section {
          width: 100%;
        }

        .pop-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 16px;
          gap: 12px;
        }

        .pop-head-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pop-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }

        .pop-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.3px;
          font-family: var(--font-sans);
          margin: 0;
        }

        .pop-all-link {
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
        .pop-all-link i { font-size: 12px; }
        .pop-all-link:hover { color: var(--text); text-decoration: none; }

        .pop-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .pop-card {
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
        .pop-card:hover {
          border-color: var(--border-faint);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          text-decoration: none;
        }
        .pop-card:hover .pop-open {
          color: var(--text);
        }

        .pop-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
        }

        .pop-icon-name {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .pop-card-icon {
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

        .pop-card-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .pop-card-body {
          display: flex;
          flex-direction: column;
          gap: 5px;
          flex: 1;
        }

        .pop-card-desc {
          font-size: 11.5px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .pop-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }

        .pop-category-tag {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          font-weight: 500;
        }

        .pop-open {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 11.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          transition: color 0.15s;
        }
        .pop-open i { font-size: 11px; }

        .pop-card:focus-visible,
        .pop-all-link:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (max-width: 900px) {
          .pop-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 480px) {
          .pop-title { font-size: 16px; }
          .pop-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}