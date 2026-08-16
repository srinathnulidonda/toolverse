// components/home/QuickAccess.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { TOOLS } from "@/lib/tools";
import useLocalStorage from "@/lib/useLocalStorage";

const DEFAULT_SLUGS = [
  "compress-pdf",
  "merge-pdf",
  "image-compress",
  "qr-generator",
  "json-formatter",
  "resume-builder",
];

const RECENT_KEY = "tv:recents";
const PINNED_KEY = "tv:pins";
const MAX_ITEMS = 6;

export default function QuickAccess() {
  const [mounted, setMounted] = useState(false);
  const [pinned, setPinned] = useLocalStorage<string[]>(PINNED_KEY, []);
  const [recent, setRecent] = useLocalStorage<string[]>(RECENT_KEY, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const togglePin = useCallback(
    (slug: string) => {
      setPinned((prev) => {
        const next = prev.includes(slug)
          ? prev.filter((s) => s !== slug)
          : [slug, ...prev].slice(0, MAX_ITEMS);
        return next;
      });
    },
    [setPinned]
  );

  const recordVisit = useCallback(
    (slug: string) => {
      setRecent((prev) => {
        const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
        return next;
      });
    },
    [setRecent]
  );

  const clearRecent = useCallback(() => {
    setRecent([]);
  }, [setRecent]);

  const effectivePinned = mounted ? pinned : [];
  const effectiveRecent = mounted ? recent : [];

  const order = [...effectivePinned, ...effectiveRecent, ...DEFAULT_SLUGS];
  const seen = new Set<string>();
  const items: typeof TOOLS = [];
  for (const slug of order) {
    if (seen.has(slug)) continue;
    const tool = TOOLS.find((t) => t.slug === slug);
    if (!tool) continue;
    seen.add(slug);
    items.push(tool);
    if (items.length >= MAX_ITEMS) break;
  }

  return (
    <>
      <div className="qa-card">
        <div className="qa-header">
          <span className="qa-label">Quick access</span>
          {effectiveRecent.length > 0 && (
            <button onClick={clearRecent} className="qa-clear-btn">
              <i className="ti ti-x" aria-hidden="true" />
              Clear recents
            </button>
          )}
        </div>

        <div className="qa-divider" />

        <ul className="qa-list">
          {items.map((item) => {
            const isPinned = effectivePinned.includes(item.slug);
            const isRecent = !isPinned && effectiveRecent.includes(item.slug);

            return (
              <li key={item.slug} className="qa-list-item">
                {/* Fixed: pin button is now a sibling, not nested inside the
                    Link — nesting <button> inside <a> is invalid HTML and
                    broke screen-reader focus order. */}
                <Link
                  href={item.href}
                  className="qa-item"
                  onClick={() => recordVisit(item.slug)}
                >
                  <span className="qa-icon">
                    <i className={`ti ${item.icon}`} aria-hidden="true" />
                  </span>

                  <span className="qa-name">{item.label}</span>

                  {isRecent && (
                    <span className="qa-badge" aria-label="Recently used">
                      recent
                    </span>
                  )}
                </Link>

                <button
                  type="button"
                  className={`qa-pin${isPinned ? " pinned" : ""}`}
                  onClick={() => togglePin(item.slug)}
                  aria-label={isPinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
                  aria-pressed={isPinned}
                >
                  <i
                    className={`ti ${isPinned ? "ti-star-filled" : "ti-star"}`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <style>{`
        .qa-card {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          width: 100%;
        }

        .qa-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px 10px;
        }

        .qa-label {
          font-size: 11px;
          font-weight: 500;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-family: var(--font-sans);
        }

        .qa-divider {
          height: 0.5px;
          background: var(--border);
          margin: 0 16px;
        }

        .qa-clear-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 11px;
          font-family: var(--font-sans);
          color: var(--text-tertiary);
          padding: 0;
          transition: color 0.15s;
        }
        .qa-clear-btn i { font-size: 10px; }
        .qa-clear-btn:hover { color: var(--text); }

        .qa-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          padding: 8px 8px;
          gap: 1px;
        }

        .qa-list-item {
          display: flex;
          align-items: center;
          gap: 2px;
          border-radius: var(--radius-md);
          transition: background 0.12s;
        }
        .qa-list-item:hover {
          background: var(--bg-surface);
        }
        .qa-list-item:hover .qa-icon {
          background: var(--border);
        }
        .qa-list-item:hover .qa-pin {
          opacity: 1;
        }

        .qa-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 4px 7px 8px;
          border-radius: var(--radius-md);
          text-decoration: none;
          cursor: pointer;
          flex: 1;
          min-width: 0;
        }
        .qa-item:hover {
          text-decoration: none;
        }

        .qa-icon {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: var(--bg-surface);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: var(--text-secondary);
          flex-shrink: 0;
          transition: background 0.12s;
        }

        .qa-name {
          flex: 1;
          font-size: 13px;
          color: var(--text);
          font-family: var(--font-sans);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          min-width: 0;
        }

        .qa-badge {
          font-size: 10px;
          font-weight: 500;
          padding: 2px 6px;
          border-radius: 99px;
          background: var(--brand-light);
          color: var(--brand-text);
          flex-shrink: 0;
          letter-spacing: 0.03em;
        }

        .qa-pin {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-disabled);
          font-size: 14px;
          padding: 4px;
          margin-right: 6px;
          opacity: 0;
          flex-shrink: 0;
          transition: opacity 0.12s, color 0.12s;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }
        .qa-pin.pinned {
          opacity: 1;
          color: var(--brand);
        }
        .qa-pin:hover {
          color: var(--text);
          background: var(--border);
        }

        /* Fixed: pin was only reachable via :hover, making it invisible
           and unusable on touch devices with no hover capability. */
        @media (hover: none) {
          .qa-pin {
            opacity: 1;
          }
        }

        .qa-item:focus-visible,
        .qa-pin:focus-visible,
        .qa-clear-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 2px;
        }
      `}</style>
    </>
  );
}