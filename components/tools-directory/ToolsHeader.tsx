// components/tools-directory/ToolsHeader.tsx
import { TOOLS } from "@/lib/tools";
import Breadcrumb from "@/components/shared/Breadcrumb";

export default function ToolsHeader() {
  return (
    <>
      <div className="tdh-root">
        <div className="tdh-inner">
          <div className="tdh-header-row">
            <div className="tdh-crumb-col">
              <Breadcrumb items={[{ label: "All Tools" }]} inline />
            </div>

            <div className="tdh-title-row">
              <h1 className="tdh-title">All Tools</h1>
            </div>

            <div className="tdh-spacer" aria-hidden="true" />
          </div>

          <p className="tdh-desc">
            {TOOLS.length} free browser-based tools — no sign-up, no uploads.
          </p>
        </div>
      </div>

      <style>{`
        .tdh-root {
          background: var(--bg);
          padding: 20px 40px 32px;
        }
        
        .tdh-inner {
          max-width: 1600px;
          margin: 0 auto;
        }

        .tdh-header-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
          align-items: center;
          column-gap: 20px;
          margin-bottom: 12px;
        }

        .tdh-crumb-col {
          justify-self: start;
          min-width: 0;
        }

        .tdh-spacer {
          justify-self: end;
        }

        .tdh-title-row {
          justify-self: center;
        }

        .tdh-title {
          font-size: clamp(22px, 2.8vw, 30px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin: 0;
          font-family: var(--font-sans);
          white-space: nowrap;
        }

        .tdh-desc {
          font-size: 14px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1.6;
          margin: 0 auto;
          max-width: 560px;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .tdh-root {
            padding: 18px 24px 24px;
          }
        }

        @media (max-width: 860px) {
          .tdh-header-row {
            grid-template-columns: 1fr;
            justify-items: center;
            row-gap: 14px;
          }

          .tdh-crumb-col,
          .tdh-spacer {
            justify-self: center;
          }

          .tdh-title {
            white-space: normal;
          }
        }
        
        @media (max-width: 768px) {
          .tdh-root {
            padding: 14px 20px 20px;
          }
        }
      `}</style>
    </>
  );
}
