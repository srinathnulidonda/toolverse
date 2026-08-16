// components/tool/ToolHeader.tsx
import type { Tool, CategoryWithCount } from "@/lib/tools";
import Breadcrumb from "@/components/shared/Breadcrumb";

type ToolHeaderProps = {
  tool: Tool;
  category: CategoryWithCount;
};

export default function ToolHeader({ tool, category }: ToolHeaderProps) {
  return (
    <>
      <div className="th-root">
        <div className="th-inner">
          <div className="th-header-row">
            <div className="th-crumb-col">
              <Breadcrumb
                items={[
                  { label: "Tools", href: "/tools" },
                  { label: category.label, href: `/tools/${category.slug}` },
                  { label: tool.label },
                ]}
                inline
              />
            </div>

            <div className="th-title-row">
              <i className={`ti ${tool.icon} th-icon`} aria-hidden="true" />
              <h1 className="th-title">{tool.label}</h1>
            </div>

            <div className="th-spacer" aria-hidden="true" />
          </div>

          <p className="th-subtitle">{tool.description}</p>
        </div>
      </div>

      <style>{`
        .th-root {
          background: var(--bg);
          padding: 20px 40px 32px;
        }
        
        .th-inner {
          max-width: 1600px;
          margin: 0 auto;
        }

        .th-header-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          column-gap: 20px;
          margin-bottom: 12px;
        }

        .th-crumb-col {
          justify-self: start;
          min-width: 0;
        }

        .th-spacer {
          justify-self: end;
        }

        .th-title-row {
          justify-self: center;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .th-icon {
          font-size: 24px;
          color: var(--text-secondary);
        }

        .th-title {
          font-size: clamp(20px, 2.6vw, 28px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .th-subtitle {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0 auto;
          max-width: 560px;
          text-align: center;
          font-family: var(--font-sans);
        }

        @media (max-width: 1024px) {
          .th-root {
            padding: 18px 24px 24px;
          }
        }

        @media (max-width: 860px) {
          .th-header-row {
            grid-template-columns: 1fr;
            justify-items: center;
            row-gap: 14px;
          }

          .th-crumb-col,
          .th-spacer {
            justify-self: center;
          }

          .th-title {
            white-space: normal;
          }
        }
        
        @media (max-width: 768px) {
          .th-root {
            padding: 14px 20px 20px;
          }
        }
      `}</style>
    </>
  );
}
