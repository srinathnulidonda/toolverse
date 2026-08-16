// components/home/TrendingTools.tsx
import Link from "next/link";
import { TOOLS, TRENDING_TOOLS, getCategoryBySlug } from "@/lib/tools";

export default function TrendingTools() {
  const items = TRENDING_TOOLS.map((slug) => TOOLS.find((t) => t.slug === slug))
    .filter((t): t is (typeof TOOLS)[number] => Boolean(t))
    .slice(0, 8);

  if (items.length === 0) return null;

  return (
    <section className="tr-section">
      <div className="tr-head">
        <div className="tr-head-left">
          <span className="tr-eyebrow">Trending</span>
          <h2 className="tr-title">What people are using</h2>
        </div>
      </div>

      <div className="tr-list">
        {items.map((tool, i) => {
          const category = getCategoryBySlug(tool.category);
          return (
            <Link key={tool.slug} href={tool.href} className="tr-row">
              <span className="tr-rank">{String(i + 1).padStart(2, "0")}</span>

              <span className="tr-icon">
                <i className={`ti ${tool.icon}`} aria-hidden="true" />
              </span>

              <span className="tr-body">
                <span className="tr-name">{tool.label}</span>
                <span className="tr-cat">{category?.label ?? tool.category}</span>
              </span>

              <i className="ti ti-arrow-up-right tr-arrow" aria-hidden="true" />
            </Link>
          );
        })}
      </div>

      <style>{`
        .tr-section {
          width: 100%;
        }

        .tr-head {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .tr-head-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .tr-eyebrow {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }

        .tr-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.4px;
          font-family: var(--font-sans);
          margin: 0;
        }

        .tr-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1px;
          background: var(--border);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
        }

        .tr-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--bg-card);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .tr-row:hover {
          background: var(--bg-surface);
          text-decoration: none;
        }
        .tr-row:hover .tr-arrow {
          opacity: 1;
          transform: translate(0, 0);
          color: var(--text);
        }

        .tr-rank {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          width: 18px;
          flex-shrink: 0;
        }

        .tr-icon {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 15px;
          flex-shrink: 0;
          background: var(--bg-surface);
          color: var(--text-secondary);
        }

        .tr-body {
          display: flex;
          flex-direction: column;
          gap: 2px;
          min-width: 0;
          flex: 1;
        }

        .tr-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .tr-cat {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .tr-arrow {
          font-size: 13px;
          color: var(--text-disabled);
          opacity: 0;
          transform: translate(-3px, 3px);
          transition: opacity 0.15s, transform 0.15s, color 0.15s;
          flex-shrink: 0;
        }

        .tr-row:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: -2px;
          background: var(--bg-surface);
        }

        @media (max-width: 560px) {
          .tr-title { font-size: 16px; }
          .tr-list {
            grid-template-columns: 1fr;
          }
          .tr-row { padding: 12px 14px; }
        }
      `}</style>
    </section>
  );
}