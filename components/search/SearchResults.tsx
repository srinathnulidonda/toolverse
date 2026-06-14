// components/search/SearchResults.tsx
import Link from "next/link";
import type { Tool } from "@/lib/tools";
import { getCategoriesWithCount } from "@/lib/tools";

type SearchResultsProps = {
  tools: Tool[];
  query: string;
};

function highlight(text: string, query: string) {
  if (!query.trim()) return <>{text}</>;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="sr-highlight">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export default function SearchResults({ tools, query }: SearchResultsProps) {
  const CATEGORIES = getCategoriesWithCount();

  const grouped = CATEGORIES.map((cat) => ({
    category: cat,
    tools: tools.filter((t) => t.category === cat.slug),
  })).filter((g) => g.tools.length > 0);

  const isGrouped = grouped.length > 1;

  return (
    <>
      <div className="sr-root">
        {isGrouped ? (
          grouped.map(({ category, tools: catTools }) => (
            <div key={category.slug} className="sr-group">
              {/* Group header */}
              <div className="sr-group-header">
                <div className="sr-group-icon">
                  <i className={`ti ${category.icon}`} aria-hidden="true" />
                </div>
                <span className="sr-group-name">{category.label}</span>
                <span className="sr-group-count">
                  {catTools.length} result{catTools.length !== 1 ? "s" : ""}
                </span>
                <div className="sr-group-line" />
              </div>

              {/* Tools grid */}
              <div className="sr-grid">
                {catTools.map((tool) => (
                  <SearchResultCard key={tool.slug} tool={tool} query={query} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="sr-grid">
            {tools.map((tool) => (
              <SearchResultCard key={tool.slug} tool={tool} query={query} />
            ))}
          </div>
        )}
      </div>

      <style>{`
        .sr-root {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .sr-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sr-group-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .sr-group-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 13px;
          color: var(--text-secondary);
        }

        .sr-group-name {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          white-space: nowrap;
        }

        .sr-group-count {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .sr-group-line {
          flex: 1;
          height: 0.5px;
          background: var(--border);
        }

        .sr-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .sr-highlight {
          background: rgba(76, 175, 130, 0.15);
          color: var(--brand);
          border-radius: 2px;
          padding: 0 1px;
          font-style: normal;
        }

        @media (max-width: 1024px) {
          .sr-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .sr-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 480px) {
          .sr-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}

function SearchResultCard({ tool, query }: { tool: Tool; query: string }) {
  return (
    <>
      <Link href={tool.href} className="src-root">
        <div className="src-icon">
          <i className={`ti ${tool.icon}`} aria-hidden="true" />
        </div>
        <div className="src-body">
          <span className="src-name">{highlight(tool.label, query)}</span>
          <p className="src-desc">{highlight(tool.description, query)}</p>
          {tool.tags && tool.tags.length > 0 && (
            <div className="src-tags">
              {tool.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="src-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <i className="ti ti-arrow-right src-arrow" aria-hidden="true" />
      </Link>

      <style>{`
        .src-root {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: box-shadow 0.15s, transform 0.12s;
        }
        .src-root:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
          text-decoration: none;
        }
        .src-root:hover .src-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        .src-icon {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          font-size: 16px;
          color: var(--text-secondary);
        }

        .src-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .src-name {
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

        .src-desc {
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1.5;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .src-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 2px;
        }

        .src-tag {
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 4px;
          padding: 2px 6px;
          font-family: var(--font-sans);
        }

        .src-arrow {
          font-size: 13px;
          color: var(--text-disabled);
          flex-shrink: 0;
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
          margin-top: 2px;
        }
      `}</style>
    </>
  );
}