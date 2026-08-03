// components/categories/CategoryCard.tsx
import Link from "next/link";
import type { Category, Tool } from "@/lib/tools";

type CategoryCardProps = {
  category: Category;
  tools: Tool[];
};

export default function CategoryCard({ category, tools }: CategoryCardProps) {
  const preview = tools.slice(0, 3);

  return (
    <>
      <Link href={`/tools/${category.slug}`} className="cc-root">
        {/* Top row: icon + name + count */}
        <div className="cc-top">
          <div className="cc-icon-wrap">
            <i className={`ti ${category.icon} cc-icon`} aria-hidden="true" />
          </div>
          <div className="cc-title-group">
            <span className="cc-name">{category.label}</span>
          </div>
          <span className="cc-count">{tools.length} tools</span>
        </div>

        {/* Description */}
        <p className="cc-desc">{category.description}</p>

        {/* Tool preview pills */}
        <div className="cc-pills">
          {preview.map((tool) => (
            <span key={tool.slug} className="cc-pill">
              {tool.label}
            </span>
          ))}
          {tools.length > 3 && <span className="cc-pill cc-pill-more">+{tools.length - 3}</span>}
        </div>

        {/* Footer: stats */}
        <div className="cc-footer">
          <span className="cc-stat">
            <i className="ti ti-infinity" aria-hidden="true" />
            Free forever
          </span>
          <span className="cc-stat cc-stat-private">
            <i className="ti ti-lock" aria-hidden="true" />
            Browser-only
          </span>
        </div>
      </Link>

      <style>{`
        .cc-root {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 12px;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .cc-root:hover {
          text-decoration: none;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
        }

        .cc-top {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .cc-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cc-icon {
          font-size: 17px;
          color: var(--text-secondary);
        }

        .cc-title-group {
          flex: 1;
          min-width: 0;
        }

        .cc-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          letter-spacing: -0.2px;
          line-height: 1.2;
          font-family: var(--font-sans);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .cc-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 99px;
          padding: 3px 9px;
          flex-shrink: 0;
        }

        .cc-desc {
          font-size: 12.5px;
          color: var(--text-secondary);
          line-height: 1.65;
          margin: 0;
          font-family: var(--font-sans);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          max-height: 3.3em;
        }

        .cc-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .cc-pill {
          font-size: 11px;
          font-weight: 400;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 6px;
          padding: 4px 9px;
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .cc-pill-more {
          color: var(--text-disabled);
          background: transparent;
          border-color: transparent;
        }

        .cc-footer {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-top: 14px;
          border-top: 0.5px solid var(--border);
        }

        .cc-stat {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .cc-stat i {
          font-size: 11px;
        }

        .cc-stat-private {
          margin-left: auto;
        }
      `}</style>
    </>
  );
}
