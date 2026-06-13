// components/tool/ToolWorkspace.tsx
import type { Tool } from "@/lib/tools";

type ToolWorkspaceProps = {
  tool: Tool;
};

export default function ToolWorkspace({ tool }: ToolWorkspaceProps) {
  return (
    <>
      <div className="tw-root">
        <div className="tw-placeholder">
          <div className="tw-icon">
            <i className={`ti ${tool.icon}`} aria-hidden="true" />
          </div>
          <p className="tw-title">{tool.label}</p>
          <p className="tw-desc">
            Tool interface coming soon. This is where the{" "}
            {tool.label.toLowerCase()} tool will live.
          </p>
        </div>
      </div>

      <style>{`
        .tw-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          min-height: 480px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tw-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 48px 32px;
          gap: 12px;
        }

        .tw-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .tw-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text);
          font-family: var(--font-sans);
          margin: 0;
          letter-spacing: -0.3px;
        }

        .tw-desc {
          font-size: 13px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          margin: 0;
          line-height: 1.6;
          max-width: 320px;
        }

        @media (max-width: 768px) {
          .tw-root {
            min-height: 360px;
          }
        }
      `}</style>
    </>
  );
}