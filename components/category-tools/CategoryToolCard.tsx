// components/category-tools/CategoryToolCard.tsx
import Link from "next/link";
import type { Tool } from "@/lib/tools";

type CategoryToolCardProps = {
  tool: Tool;
};

export default function CategoryToolCard({ tool }: CategoryToolCardProps) {
  return (
    <>
      <Link href={tool.href} className="ctc-root">
        <div className="ctc-icon">
          <i className={`ti ${tool.icon}`} aria-hidden="true" />
        </div>
        <div className="ctc-body">
          {tool.badge ? (
            <div className="ctc-title-row">
              <span className="ctc-name">{tool.label}</span>
              <span className={`ctc-badge ctc-badge-${tool.badge}`}>
                {tool.badge}
              </span>
            </div>
          ) : (
            <span className="ctc-name">{tool.label}</span>
          )}
          <p className="ctc-desc">{tool.description}</p>
        </div>
        <i className="ti ti-arrow-right ctc-arrow" aria-hidden="true" />
      </Link>

      <style>{`
        .ctc-root {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          text-decoration: none;
          transition: box-shadow 0.15s, transform 0.12s;
        }
        .ctc-root:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
          text-decoration: none;
        }
        .ctc-root:hover .ctc-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        .ctc-icon {
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

        .ctc-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .ctc-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ctc-name {
          font-size: 13px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          letter-spacing: -0.1px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }

        .ctc-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
          font-family: var(--font-sans);
        }
        .ctc-badge-popular {
          background: #fdf3e7;
          color: #b45309;
        }
        @media (prefers-color-scheme: dark) {
          .ctc-badge-popular {
            background: #2a1500;
            color: #fbbf24;
          }
        }
        .ctc-badge-new {
          background: var(--brand-light);
          color: var(--brand-text);
        }

        .ctc-desc {
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

        .ctc-arrow {
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