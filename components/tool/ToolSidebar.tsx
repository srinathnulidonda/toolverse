// components/tool/ToolSidebar.tsx
import Link from "next/link";
import type { Tool, CategoryWithCount } from "@/lib/tools";

type ToolSidebarProps = {
  tool: Tool;
  category: CategoryWithCount;
  relatedTools: Tool[];
};

export default function ToolSidebar({
  tool,
  category,
  relatedTools,
}: ToolSidebarProps) {
  return (
    <>
      <aside className="ts-root">
        {/* About card */}
        <div className="ts-about">
          <p className="ts-about-label">About this tool</p>
          <p className="ts-about-body">{tool.description}</p>
          {tool.tags && tool.tags.length > 0 && (
            <div className="ts-about-tags">
              {tool.tags.map((tag) => (
                <span key={tag} className="ts-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Privacy card */}
        <div className="ts-priv">
          <div className="ts-priv-icon">
            <i className="ti ti-shield-check" aria-hidden="true" />
          </div>
          <div>
            <p className="ts-priv-title">100% private</p>
            <p className="ts-priv-body">
              Everything runs in your browser. No files are ever uploaded to our
              servers.
            </p>
          </div>
        </div>

        {/* Related tools */}
        {relatedTools.length > 0 && (
          <div className="ts-related">
            <p className="ts-related-label">More {category.label}</p>
            <div className="ts-related-list">
              {relatedTools.map((t) => (
                <Link key={t.slug} href={t.href} className="ts-related-item">
                  <div className="ts-related-icon">
                    <i className={`ti ${t.icon}`} aria-hidden="true" />
                  </div>
                  <span className="ts-related-name">{t.label}</span>
                  <i
                    className="ti ti-chevron-right ts-related-chevron"
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
            <Link href={`/tools/${category.slug}`} className="ts-related-all">
              View all {category.label}
              <i className="ti ti-arrow-right" aria-hidden="true" />
            </Link>
          </div>
        )}
      </aside>

      <style>{`
        .ts-root {
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }

        .ts-about {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ts-about-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
          margin: 0;
        }

        .ts-about-body {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          font-family: var(--font-sans);
        }

        .ts-about-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
        }

        .ts-tag {
          display: inline-flex;
          align-items: center;
          font-size: 10px;
          font-weight: 500;
          padding: 3px 8px;
          border-radius: 99px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }

        .ts-priv {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 14px 16px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: var(--radius-lg);
        }
        @media (prefers-color-scheme: dark) {
          .ts-priv {
            background: #0b1f16;
          }
        }

        .ts-priv-icon {
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

        .ts-priv-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text);
          margin: 0 0 3px;
          font-family: var(--font-sans);
        }

        .ts-priv-body {
          font-size: 11px;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
          font-family: var(--font-sans);
        }

        .ts-related {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .ts-related-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 12px 14px 8px;
          margin: 0;
          font-family: var(--font-sans);
        }

        .ts-related-list {
          display: flex;
          flex-direction: column;
        }

        .ts-related-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 14px;
          text-decoration: none;
          border-top: 0.5px solid var(--border-faint);
          transition: background 0.12s;
        }
        .ts-related-item:hover {
          background: var(--bg-surface);
          text-decoration: none;
        }
        .ts-related-item:hover .ts-related-chevron {
          transform: translateX(2px);
          color: var(--text-secondary);
        }

        .ts-related-icon {
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

        .ts-related-name {
          flex: 1;
          font-size: 12px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .ts-related-chevron {
          font-size: 11px;
          color: var(--text-disabled);
          transition: transform 0.15s, color 0.15s;
        }

        .ts-related-all {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          font-size: 11px;
          font-weight: 500;
          color: var(--brand);
          text-decoration: none;
          font-family: var(--font-sans);
          border-top: 0.5px solid var(--border);
          transition: background 0.12s;
        }
        .ts-related-all:hover {
          background: var(--bg-surface);
          text-decoration: none;
        }
        .ts-related-all i {
          font-size: 11px;
        }

        @media (max-width: 768px) {
          .ts-root {
            position: static;
          }
        }
      `}</style>
    </>
  );
}