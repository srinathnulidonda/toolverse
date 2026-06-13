// components/tool/ToolHeader.tsx
import type { Tool, CategoryWithCount } from "@/lib/tools";

type ToolHeaderProps = {
  tool: Tool;
  category: CategoryWithCount;
};

export default function ToolHeader({ tool, category }: ToolHeaderProps) {
  return (
    <>
      <div className="th-root">
        <div className="th-inner">
          {/* Title row */}
          <div className="th-title-row">
            <div className="th-icon-wrap">
              <i
                className={`ti ${tool.icon} th-icon`}
                aria-hidden="true"
              />
            </div>
            <div className="th-title-content">
              <div className="th-title-meta">
                <h1 className="th-title">{tool.label}</h1>
                {tool.badge && (
                  <span className={`th-badge th-badge-${tool.badge}`}>
                    {tool.badge}
                  </span>
                )}
              </div>
              <p className="th-subtitle">{tool.description}</p>
            </div>
          </div>

          {/* Privacy strip */}
          <div className="th-privacy-strip">
            {[
              { icon: "ti-cloud-off", label: "No uploads" },
              { icon: "ti-user-off", label: "No account" },
              { icon: "ti-bolt", label: "Runs in browser" },
              { icon: "ti-infinity", label: "Free forever" },
            ].map((item) => (
              <div key={item.label} className="th-privacy-item">
                <i className={`ti ${item.icon}`} aria-hidden="true" />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .th-root {
          background: var(--bg);
          padding: 40px 40px 32px;
        }
        .th-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .th-title-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .th-icon-wrap {
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

        .th-icon {
          font-size: 22px;
          color: var(--text-secondary);
        }

        .th-title-content {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
          text-align: left;
        }
        .th-title-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .th-title {
          font-size: clamp(22px, 3vw, 30px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
        }

        .th-badge {
          font-size: 10px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 99px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-family: var(--font-sans);
        }
        .th-badge-popular {
          background: #fdf3e7;
          color: #b45309;
          border: 0.5px solid #f5d08a;
        }
        @media (prefers-color-scheme: dark) {
          .th-badge-popular {
            background: #2a1500;
            color: #fbbf24;
            border-color: #78350f;
          }
        }
        .th-badge-new {
          background: var(--brand-light);
          color: var(--brand-text);
          border: 0.5px solid var(--brand-border);
        }
        .th-badge-beta {
          background: var(--bg-surface);
          color: var(--text-tertiary);
          border: 0.5px solid var(--border);
        }

        .th-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          max-width: 560px;
          font-family: var(--font-sans);
        }

        .th-privacy-strip {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .th-privacy-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-tertiary);
          font-family: var(--font-sans);
        }
        .th-privacy-item i {
          font-size: 13px;
          color: var(--brand);
        }

        @media (max-width: 1024px) {
          .th-root {
            padding: 32px 24px;
          }
        }
        @media (max-width: 768px) {
          .th-root {
            padding: 24px 20px 20px;
          }
        }
        @media (max-width: 480px) {
          .th-privacy-strip {
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}