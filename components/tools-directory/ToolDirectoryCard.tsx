// components/tools-directory/ToolDirectoryCard.tsx
import Link from "next/link";
import type { Tool } from "@/lib/tools";

type ToolDirectoryCardProps = {
  tool: Tool;
};

export default function ToolDirectoryCard({ tool }: ToolDirectoryCardProps) {
  return (
    <>
      <Link href={tool.href} className="tdc-root">
        <div className="tdc-icon">
          <i className={`ti ${tool.icon}`} aria-hidden="true" />
        </div>
        <div className="tdc-body">
          <div className="tdc-title-row">
            <span className="tdc-name">{tool.label}</span>
            {tool.badge && (
              <span className={`tdc-badge tdc-badge-${tool.badge}`}>
                {tool.badge}
              </span>
            )}
          </div>
          <p className="tdc-desc">{tool.description}</p>
        </div>
        <i className="ti ti-arrow-right tdc-arrow" aria-hidden="true" />
      </Link>

      <style>{`
        .tdc-root {
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
        .tdc-root:hover {
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
          transform: translateY(-1px);
          text-decoration: none;
        }
        .tdc-root:hover .tdc-arrow {
          opacity: 1;
          transform: translateX(2px);
        }

        .tdc-icon {
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

        .tdc-body {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .tdc-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .tdc-name {
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

        .tdc-badge {
          font-size: 9px;
          font-weight: 700;
          padding: 2px 5px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          flex-shrink: 0;
          font-family: var(--font-sans);
        }
        .tdc-badge-popular {
          background: #fdf3e7;
          color: #b45309;
        }
        @media (prefers-color-scheme: dark) {
          .tdc-badge-popular {
            background: #2a1500;
            color: #fbbf24;
          }
        }
        .tdc-badge-new {
          background: var(--brand-light);
          color: var(--brand-text);
        }
        .tdc-badge-beta {
          background: var(--bg-surface);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
        }

        .tdc-desc {
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

        .tdc-arrow {
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