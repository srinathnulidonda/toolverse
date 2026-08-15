// components/home/SearchBar.tsx
"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

const font = "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?s=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape" && query) {
      setQuery("");
    }
  }

  function clearQuery() {
    setQuery("");
    inputRef.current?.focus();
  }

  return (
    <>
      <form
        onSubmit={handleSearch}
        className="hero-search-form"
        style={{
          width: "100%",
          maxWidth: "380px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "var(--bg-card)",
          border: "0.5px solid var(--border)",
          borderRadius: "9999px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.08)",
          transition: "all 0.2s ease",
        }}
      >
        <span
          className="hero-search-icon"
          style={{
            position: "absolute",
            left: "16px",
            color: "var(--text-tertiary)",
            display: "flex",
            alignItems: "center",
            pointerEvents: "none",
          }}
        >
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

        <label htmlFor="search-input" className="sr-only">
          Search tools
        </label>
        <input
          id="search-input"
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tools..."
          className="hero-search-input"
          autoComplete="off"
          style={{
            flex: 1,
            padding: query ? "12px 36px 12px 42px" : "12px 18px 12px 42px",
            background: "transparent",
            border: "none",
            fontSize: "14px",
            color: "var(--text)",
            fontFamily: font,
            outline: "none",
            caretColor: "var(--brand)",
            minWidth: 0,
            letterSpacing: "-0.1px",
            borderRadius: "9999px",
          }}
        />

        {query && (
          <button
            type="button"
            onClick={clearQuery}
            className="hero-search-clear"
            aria-label="Clear search"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path
                d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </form>

      <style>{`
        .hero-search-input::placeholder {
          color: var(--text-disabled);
          font-weight: 400;
        }

        .hero-search-form:hover {
          border-color: var(--text-disabled) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.16),
            0 2px 4px rgba(0, 0, 0, 0.12) !important;
        }

        .hero-search-form:focus-within {
          border-color: var(--brand) !important;
          box-shadow: 0 0 0 3px rgba(76, 175, 130, 0.12),
            0 4px 12px rgba(0, 0, 0, 0.16) !important;
        }

        .hero-search-clear {
          position: absolute;
          right: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: none;
          background: var(--bg-surface);
          color: var(--text-tertiary);
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.12s, color 0.12s;
        }
        .hero-search-clear:hover {
          background: var(--border);
          color: var(--text);
        }
        .hero-search-clear:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .hero-search-form {
            max-width: 260px !important;
          }

          .hero-search-icon {
            left: 12px !important;
          }

          .hero-search-icon svg {
            width: 12px !important;
            height: 12px !important;
          }

          .hero-search-input {
            padding: 8px 30px 8px 32px !important;
            font-size: 12px !important;
          }

          .hero-search-clear {
            right: 10px;
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 340px) {
          .hero-search-form {
            max-width: 250px !important;
          }
        }
      `}</style>
    </>
  );
}