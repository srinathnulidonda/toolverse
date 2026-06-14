// components/search/SearchInput.tsx
"use client";

import { useRef, useEffect } from "react";

type SearchInputProps = {
  query: string;
  onChange: (value: string) => void;
};

export default function SearchInput({ query, onChange }: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <div className="si-wrap">
        <span className="si-icon">
          <svg
            width="16"
            height="16"
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
          ref={inputRef}
          type="text"
          className="si-input"
          placeholder="Search tools..."
          value={query}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            className="si-clear"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <style>{`
        .si-wrap {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
          max-width: 520px;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: 9999px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12),
                      0 1px 2px rgba(0, 0, 0, 0.08);
          transition: all 0.2s ease;
          margin-bottom: 20px;
        }
        .si-wrap:hover {
          border-color: var(--text-disabled);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16),
                      0 2px 4px rgba(0, 0, 0, 0.12);
        }
        .si-wrap:focus-within {
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(76, 175, 130, 0.12),
                      0 4px 12px rgba(0, 0, 0, 0.16);
        }

        .si-icon {
          position: absolute;
          left: 18px;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          pointer-events: none;
          flex-shrink: 0;
        }

        .si-input {
          flex: 1;
          padding: 14px 18px 14px 48px;
          background: transparent;
          border: none;
          font-size: 15px;
          color: var(--text);
          font-family: var(--font-sans);
          outline: none;
          caret-color: var(--brand);
          letter-spacing: -0.1px;
          border-radius: 9999px;
          width: 100%;
        }
        .si-input::placeholder {
          color: var(--text-disabled);
          font-weight: 400;
        }

        .si-clear {
          position: absolute;
          right: 14px;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: none;
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 20px;
          line-height: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.15s, color 0.15s;
        }
        .si-clear:hover {
          background: var(--border);
          color: var(--text);
        }

        @media (max-width: 640px) {
          .si-wrap {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
}