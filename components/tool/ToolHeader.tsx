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
            <i className={`ti ${tool.icon} th-icon`} aria-hidden="true" />
            <h1 className="th-title">{tool.label}</h1>
          </div>
          <p className="th-subtitle">{tool.description}</p>
        </div>
      </div>

      <style>{`
        .th-root {
          background: var(--bg);
          padding: 40px 40px 32px;
        }
        .th-inner {
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .th-title-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .th-icon {
          font-size: 26px;
          color: var(--text-secondary);
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

        .th-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          max-width: 560px;
          font-family: var(--font-sans);
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
      `}</style>
    </>
  );
}