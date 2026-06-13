// components/search/SearchEmpty.tsx
import Link from "next/link";
import { TOOLS, CATEGORIES } from "@/lib/tools";

type SearchEmptyProps = {
  query: string;
  onClear: () => void;
};

const popular = TOOLS.filter((t) => t.badge === "popular").slice(0, 4);

export default function SearchEmpty({ query, onClear }: SearchEmptyProps) {
  return (
    <>
      <div className="se-root">
        {/* Empty state */}
        <div className="se-empty">
          <div className="se-empty-icon">
            <i className="ti ti-search-off" aria-hidden="true" />
          </div>
          <p className="se-empty-title">
            No results for &quot;{query}&quot;
          </p>
          <p className="se-empty-desc">
            Try different keywords or browse by category below.
          </p>
          <button className="se-clear-btn" onClick={onClear}>
            Clear search
          </button>
        </div>

        {/* Popular tools */}
        <div className="se-section">
          <p className="se-section-label">Popular tools</p>
          <div className="se-grid">
            {popular.map((tool) => (
              <Link key={tool.slug} href={tool.href} className="se-tool">
                <div className="se-tool-icon">
                  <i className={`ti ${tool.icon}`} aria-hidden="true" />
                </div>
                <span className="se-tool-name">{tool.label}</span>
                <i
                  className="ti ti-arrow-right se-tool-arrow"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </div>

        {/* Browse categories */}
        <div className="se-section">
          <p className="se-section-label">Browse categories</p>
          <div className="se-cats">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/tools/${cat.slug}`}
                className="se-cat"
              >
                <i className={`ti ${cat.icon}`} aria-hidden="true" />
                <span className="se-cat-name">
                  {cat.label.replace(" Tools", "")}
                </span>
                <span className="se-cat-count">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .se-root {
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .se-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          padding: 40px 24px 0;
        }

        .se-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--text-tertiary);
          margin-bottom: 4px;
        }

        .se-empty-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          margin: 0;
          letter-spacing: -0.3px;
        }

        .se-empty-desc {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          margin: 0;
          line-height: 1.6;
          max-width: 320px;
        }

        .se-clear-btn {
          margin-top: 8px;
          padding: 8px 18px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-sans);
          color: var(--text-secondary);
          cursor: pointer;
          transition: background 0.12s, color 0.12s;
        }
        .se-clear-btn:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .se-section {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .se-section-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
          margin: 0;
        }

        .se-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 8px;
        }

        .se-tool {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: background 0.12s, transform 0.12s;
        }
        .se-tool:hover {
          background: var(--bg-surface);
          transform: translateY(-1px);
          text-decoration: none;
        }
        .se-tool:hover .se-tool-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        .se-tool-icon {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 14px;
          color: var(--text-secondary);
        }

        .se-tool-name {
          flex: 1;
          font-size: 13px;
          font-weight: 500;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
        }

        .se-tool-arrow {
          font-size: 13px;
          color: var(--text-disabled);
          opacity: 0;
          transition: opacity 0.13s, transform 0.13s;
        }

        .se-cats {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .se-cat {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 99px;
          text-decoration: none;
          transition: background 0.12s, color 0.12s;
        }
        .se-cat:hover {
          background: var(--bg-surface);
          text-decoration: none;
        }
        .se-cat i {
          font-size: 14px;
          color: var(--text-tertiary);
        }
        .se-cat-name {
          font-size: 12px;
          font-weight: 500;
          color: var(--text-secondary);
          font-family: var(--font-sans);
        }
        .se-cat-count {
          font-size: 11px;
          color: var(--text-disabled);
          font-family: var(--font-sans);
        }

        @media (max-width: 640px) {
          .se-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}