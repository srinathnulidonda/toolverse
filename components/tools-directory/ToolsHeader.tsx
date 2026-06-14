// components/tools-directory/ToolsHeader.tsx
import { TOOLS } from "@/lib/tools";

export default function ToolsHeader() {
  return (
    <>
      <div className="tdh-root">
        <div className="tdh-inner">
          <h1 className="tdh-title">All Tools</h1>
          <p className="tdh-desc">
            {TOOLS.length} free browser-based tools — no sign-up, no uploads.
          </p>
        </div>
      </div>

      <style>{`
        .tdh-root {
          background: var(--bg);
          padding: 40px 40px 32px;
        }
        .tdh-inner {
          max-width: 1600px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .tdh-title {
          font-size: clamp(24px, 3vw, 32px);
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.8px;
          line-height: 1.2;
          margin-bottom: 10px;
          font-family: var(--font-sans);
        }

        .tdh-desc {
          font-size: 14px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1.6;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .tdh-root {
            padding: 32px 24px;
          }
        }
        @media (max-width: 640px) {
          .tdh-root {
            padding: 24px 20px 20px;
          }
        }
      `}</style>
    </>
  );
}