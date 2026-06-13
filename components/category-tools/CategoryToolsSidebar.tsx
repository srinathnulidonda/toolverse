// components/category-tools/CategoryToolsSidebar.tsx
import Link from "next/link";
import { CATEGORIES } from "@/lib/tools";
import type { CategoryWithCount } from "@/lib/tools";

type CategoryToolsSidebarProps = {
  currentCategory: CategoryWithCount;
};

export default function CategoryToolsSidebar({
  currentCategory,
}: CategoryToolsSidebarProps) {
  const otherCategories = CATEGORIES.filter(
    (c) => c.slug !== currentCategory.slug
  );

  return (
    <>
      <aside className="cts-root">
        {/* Privacy card */}
        <div className="cts-priv">
          <div className="cts-priv-icon">
            <i className="ti ti-shield-check" aria-hidden="true" />
          </div>
          <div>
            <p className="cts-priv-title">100% private</p>
            <p className="cts-priv-body">
              All tools run entirely in your browser. Your files never leave
              your device.
            </p>
          </div>
        </div>

        {/* Other categories */}
        <div className="cts-other">
          <p className="cts-other-label">Other categories</p>
          <div className="cts-other-list">
            {otherCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/tools/${cat.slug}`}
                className="cts-other-item"
              >
                <i
                  className={`ti ${cat.icon} cts-other-icon`}
                  aria-hidden="true"
                />
                <span className="cts-other-name">{cat.label}</span>
                <span className="cts-other-count">{cat.count}</span>
                <i
                  className="ti ti-chevron-right cts-other-chevron"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* All tools link */}
        <Link href="/tools" className="cts-all-btn">
          <i className="ti ti-layout-grid" aria-hidden="true" />
          View all tools
          <i
            className="ti ti-arrow-right"
            aria-hidden="true"
            style={{ marginLeft: "auto" }}
          />
        </Link>
      </aside>

      <style>{`
        .cts-root {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }

        .cts-priv {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
        }
        @media (prefers-color-scheme: dark) {
          .cts-priv {
            background: #0b1f16;
          }
        }

        .cts-priv-icon {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: var(--brand-border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 15px;
          color: var(--brand);
        }

        .cts-priv-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 3px;
          font-family: var(--font-sans);
        }

        .cts-priv-body {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
          font-family: var(--font-sans);
        }

        .cts-other {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .cts-other-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 12px 14px 8px;
          margin: 0;
          font-family: var(--font-sans);
        }

        .cts-other-list {
          display: flex;
          flex-direction: column;
        }

        .cts-other-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          text-decoration: none;
          border-top: 0.5px solid var(--border-faint);
          transition: background 0.12s;
        }
        .cts-other-item:hover {
          background: var(--bg-surface);
          text-decoration: none;
        }
        .cts-other-item:hover .cts-other-chevron {
          transform: translateX(2px);
          color: var(--text-secondary);
        }

        .cts-other-icon {
          font-size: 14px;
          color: var(--text-tertiary);
          flex-shrink: 0;
          width: 16px;
          text-align: center;
        }

        .cts-other-name {
          flex: 1;
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }

        .cts-other-count {
          font-size: 11px;
          color: var(--text-disabled);
          font-family: var(--font-sans);
        }

        .cts-other-chevron {
          font-size: 11px;
          color: var(--text-disabled);
          transition: transform 0.15s, color 0.15s;
        }

        .cts-all-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          text-decoration: none;
          font-family: var(--font-sans);
          transition: background 0.15s, color 0.15s;
        }
        .cts-all-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
          text-decoration: none;
        }
        .cts-all-btn i {
          font-size: 13px;
        }

        @media (max-width: 768px) {
          .cts-root {
            position: static;
          }
        }
      `}</style>
    </>
  );
}