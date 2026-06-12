// components/home/QuickAccess.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

// Types

type Tool = { slug: string; label: string; href: string; icon: string };

// Constants

const ALL_TOOLS: Tool[] = [
    { slug: "compress-pdf", label: "Compress PDF", href: "/tools/compress-pdf", icon: "ti-file-zip" },
    { slug: "merge-pdf", label: "Merge PDF", href: "/tools/merge-pdf", icon: "ti-files" },
    { slug: "image-compress", label: "Image compressor", href: "/tools/image-compress", icon: "ti-photo" },
    { slug: "qr-generator", label: "QR generator", href: "/tools/qr-generator", icon: "ti-qrcode" },
    { slug: "json-formatter", label: "JSON formatter", href: "/tools/json-formatter", icon: "ti-code" },
    { slug: "resume-builder", label: "Resume builder", href: "/tools/resume-builder", icon: "ti-file-cv" },
];

const DEFAULT_SLUGS = ALL_TOOLS.map((t) => t.slug);
const RECENT_KEY = "tv:recents";
const PINNED_KEY = "tv:pins";
const MAX_ITEMS = 6;

// Component

export default function QuickAccess() {
    const [pinned, setPinned] = useState<string[]>([]);
    const [recent, setRecent] = useState<string[]>([]);

    useEffect(() => {
        try {
            const p = JSON.parse(localStorage.getItem(PINNED_KEY) ?? "[]");
            const r = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
            if (Array.isArray(p)) setPinned(p);
            if (Array.isArray(r)) setRecent(r);
        } catch { /* ignore corrupted storage */ }
    }, []);

    const togglePin = useCallback((slug: string) => {
        setPinned((prev) => {
            const next = prev.includes(slug)
                ? prev.filter((s) => s !== slug)
                : [slug, ...prev].slice(0, MAX_ITEMS);
            try { localStorage.setItem(PINNED_KEY, JSON.stringify(next)); } catch { }
            return next;
        });
    }, []);

    const recordVisit = useCallback((slug: string) => {
        setRecent((prev) => {
            const next = [slug, ...prev.filter((s) => s !== slug)].slice(0, MAX_ITEMS);
            try { localStorage.setItem(RECENT_KEY, JSON.stringify(next)); } catch { }
            return next;
        });
    }, []);

    const clearRecent = useCallback(() => {
        setRecent([]);
        try { localStorage.removeItem(RECENT_KEY); } catch { }
    }, []);

    // Build ordered, deduplicated list
    const order = [...pinned, ...recent, ...DEFAULT_SLUGS];
    const seen = new Set<string>();
    const items: Tool[] = [];
    for (const slug of order) {
        if (seen.has(slug)) continue;
        const tool = ALL_TOOLS.find((t) => t.slug === slug);
        if (!tool) continue;
        seen.add(slug);
        items.push(tool);
        if (items.length >= MAX_ITEMS) break;
    }

    return (
        <>
            <div className="qa-card">

                {/* Header */}
                <div className="qa-header">
                    <span className="qa-label">Quick access</span>
                    {recent.length > 0 && (
                        <button onClick={clearRecent} className="qa-clear-btn">
                            <i className="ti ti-x" aria-hidden="true" />
                            Clear recents
                        </button>
                    )}
                </div>

                <div className="qa-divider" />

                {/* Tool list */}
                <ul className="qa-list">
                    {items.map((item) => {
                        const isPinned = pinned.includes(item.slug);
                        const isRecent = !isPinned && recent.includes(item.slug);

                        return (
                            <li key={item.slug}>
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

                                    <button
                                        className={`qa-pin${isPinned ? " pinned" : ""}`}
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); togglePin(item.slug); }}
                                        aria-label={isPinned ? `Unpin ${item.label}` : `Pin ${item.label}`}
                                        aria-pressed={isPinned}
                                    >
                                        <i className={`ti ${isPinned ? "ti-star-filled" : "ti-star"}`} aria-hidden="true" />
                                    </button>
                                </Link>
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

        .qa-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 7px 8px;
          border-radius: var(--radius-md);
          text-decoration: none;
          cursor: pointer;
          transition: background 0.12s;
        }
        .qa-item:hover {
          background: var(--bg-surface);
          text-decoration: none;
        }
        .qa-item:hover .qa-pin {
          opacity: 1;
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
        .qa-item:hover .qa-icon {
          background: var(--border);
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
          padding: 2px;
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
      `}</style>
        </>
    );
}