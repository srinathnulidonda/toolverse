// components/category-tools/CategoryToolsHeader.tsx
import type { CategoryWithCount, Tool } from "@/lib/tools";

type CategoryToolsHeaderProps = {
  category: CategoryWithCount;
  tools: Tool[];
};

export default function CategoryToolsHeader({
  category,
  tools,
}: CategoryToolsHeaderProps) {
  const popular = tools.filter((t) => t.badge === "popular");
  const newTools = tools.filter((t) => t.badge === "new");

  return (
    <>
      <div className="cth-root">
        <div className="cth-inner">
          {/* Title row */}
          <div className="cth-title-row">
            <div className="cth-icon-wrap">
              <i
                className={`ti ${category.icon} cth-icon`}
                aria-hidden="true"
              />
            </div>
            <div className="cth-title-content">
              <h1 className="cth-title">{category.label}</h1>
              <p className="cth-subtitle">{category.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="cth-stats">
            <div className="cth-stat">
              <span className="cth-stat-val">{tools.length}</span>
              <span className="cth-stat-key">Tools</span>
            </div>
            {popular.length > 0 && (
              <div className="cth-stat">
                <span className="cth-stat-val">{popular.length}</span>
                <span className="cth-stat-key">Popular</span>
              </div>
            )}
            {newTools.length > 0 && (
              <div className="cth-stat">
                <span className="cth-stat-val">{newTools.length}</span>
                <span className="cth-stat-key">New</span>
              </div>
            )}
            <div className="cth-stat">
              <span className="cth-stat-val">Free</span>
              <span className="cth-stat-key">Forever</span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cth-root {
          background: var(--bg);
          padding: 40px 40px 32px;
        }
        .cth-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .cth-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .cth-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .cth-icon {
          font-size: 22px;
          color: var(--text-secondary);
        }

        .cth-title-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          text-align: left;
        }

        .cth-title {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
        }
        
        .cth-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          max-width: 560px;
          font-family: var(--font-sans);
        }

        .cth-stats {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 0;
          justify-content: center;
        }
        .cth-stat {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 20px 10px 0;
          margin-right: 20px;
          border-right: 0.5px solid var(--border);
        }
        .cth-stat:last-child {
          border-right: none;
          padding-right: 0;
          margin-right: 0;
        }
        .cth-stat-val {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.5px;
          line-height: 1;
          font-family: var(--font-sans);
        }
        .cth-stat-key {
          font-size: 11px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 500;
        }

        @media (max-width: 1024px) {
          .cth-root {
            padding: 32px 24px;
          }
        }
        @media (max-width: 768px) {
          .cth-root {
            padding: 24px 20px 20px;
          }
          .cth-title-row {
            gap: 12px;
          }
          .cth-icon-wrap {
            width: 44px;
            height: 44px;
          }
        }
        @media (max-width: 480px) {
          .cth-stats {
            gap: 8px;
          }
          .cth-stat {
            border-right: none;
            padding: 8px 12px;
            background: var(--bg-surface);
            border-radius: var(--radius-md);
            border: 0.5px solid var(--border);
            margin-right: 0;
          }
        }
      `}</style>
    </>
  );
}