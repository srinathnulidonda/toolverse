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
            <button
              className="tds-clear"
              onClick={() => onChange("")}
              aria-label="Clear search"
            >
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
          background: #1A1A17;
          border: 0.5px solid #2C2C28;
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          width: 100%;
          max-width: 480px;
        }
        .tds-wrap:hover {
          border-color: #3C3B35;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.12);
        }
        .tds-wrap:focus-within {
          border-color: #4CAF82;
          box-shadow: 0 0 0 3px rgba(76, 175, 130, 0.12), 0 4px 12px rgba(0, 0, 0, 0.16);
        }

        @media (prefers-color-scheme: light) {
          .tds-wrap {
            background: #FFFFFF;
            border-color: #E8E8E2;
          }
          .tds-wrap:hover {
            border-color: #D1D0C8;
          }
        }

        .tds-icon-wrap {
          position: absolute;
          left: 16px;
          color: #3C3B35;
          display: flex;
          align-items: center;
          pointer-events: none;
        }
        @media (prefers-color-scheme: light) {
          .tds-icon-wrap {
            color: #6B6A62;
          }
        }

        .tds-input {
          flex: 1;
          padding: 12px 18px 12px 42px;
          background: transparent;
          border: none;
          font-size: 14px;
          color: #EDEDEA;
          font-family: var(--font-sans);
          outline: none;
          caret-color: #4CAF82;
          min-width: 0;
          letter-spacing: -0.1px;
          border-radius: 9999px;
        }
        .tds-input::placeholder {
          color: #3C3B35;
          font-weight: 400;
        }

        @media (prefers-color-scheme: light) {
          .tds-input {
            color: #1C1C18;
          }
          .tds-input::placeholder {
            color: #A8A79E;
          }
        }

        .tds-clear {
          position: absolute;
          right: 12px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: #222220;
          color: #6B6A62;
          font-size: 18px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .tds-clear:hover {
          background: #2C2C28;
          color: #A8A79E;
        }

        @media (prefers-color-scheme: light) {
          .tds-clear {
            background: #F4F4F0;
            color: #6B6A62;
          }
          .tds-clear:hover {
            background: #E8E8E2;
            color: #1C1C18;
          }
        }
      `}</style>
    </>
  );
}