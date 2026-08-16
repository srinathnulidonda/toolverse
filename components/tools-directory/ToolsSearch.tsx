// components/tools-directory/ToolsSearch.tsx
"use client";

type ToolsSearchProps = {
  query: string;
  onChange: (value: string) => void;
};

export default function ToolsSearch({ query, onChange }: ToolsSearchProps) {
  return (
    <>
      <div className="tds-container">
        <div className="tds-wrap">
          <span className="tds-icon-wrap">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            className="tds-input"
            placeholder="Search tools..."
            value={query}
            onChange={(e) => onChange(e.target.value)}
          />
          {query && (
            <button className="tds-clear" onClick={() => onChange("")} aria-label="Clear search">
              ×
            </button>
          )}
        </div>
      </div>

      <style>{`
        .tds-container {
          display: flex;
          justify-content: center;
          margin-bottom: 28px;
        }

        .tds-wrap {
          position: relative;
          display: flex;
          align-items: center;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          width: 100%;
          max-width: 480px;
        }
        .tds-wrap:hover {
          border-color: var(--text-disabled);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.12);
        }
        .tds-wrap:focus-within {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(76, 175, 130, 0.12), 0 4px 12px rgba(0, 0, 0, 0.16);
        }

        .tds-icon-wrap {
          position: absolute;
          left: 16px;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .tds-input {
          flex: 1;
          padding: 12px 18px 12px 42px;
          background: transparent;
          border: none;
          font-size: 14px;
          color: var(--text);
          font-family: var(--font-sans);
          outline: none;
          caret-color: var(--brand);
          min-width: 0;
          letter-spacing: -0.1px;
          border-radius: 9999px;
        }
        .tds-input::placeholder {
          color: var(--text-disabled);
          font-weight: 400;
        }

        .tds-clear {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .tds-clear:hover {
          background: var(--border);
          color: var(--text);
        }
      `}</style>
    </>
  );
}
