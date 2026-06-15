// features/dev/uuid-generator/Workspace.tsx
"use client";

import { useState, useCallback, useRef } from "react";
import type { Tool } from "@/lib/tools";

type UuidVersion = "v4" | "v1" | "v7" | "nil";
type UuidFormat = "standard" | "no-hyphens" | "braces" | "urn";

function generateV4(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateV1(): string {
    // RFC 4122 v1-like (time-based, pseudo)
    const now = Date.now();
    const timeHigh = Math.floor(now / 0x100000000);
    const timeLow = now & 0xffffffff;
    const hex = (n: number, len: number) => n.toString(16).padStart(len, "0");
    const rand = () => Math.floor(Math.random() * 0x10000);
    return [
        hex(timeLow, 8),
        hex((timeHigh & 0xffff), 4),
        hex(0x1000 | (rand() & 0x0fff), 4),
        hex(0x8000 | (rand() & 0x3fff), 4),
        hex(rand(), 4) + hex(rand(), 4) + hex(rand(), 4),
    ].join("-");
}

function generateV7(): string {
    // RFC 9562 v7 — Unix epoch ms in first 48 bits
    const now = Date.now();
    const msHex = now.toString(16).padStart(12, "0");
    const rand4 = () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
    const rand12 = () => (Math.floor(Math.random() * 0x1000)).toString(16).padStart(3, "0");
    const varBits = (0x8 | (Math.floor(Math.random() * 4))).toString(16);
    return `${msHex.slice(0, 8)}-${msHex.slice(8, 12)}-7${rand12()}-${varBits}${rand4().slice(1)}-${rand4()}${rand4()}${rand4().slice(0, 4)}`;
}

function generateNil(): string {
    return "00000000-0000-0000-0000-000000000000";
}

function generate(version: UuidVersion): string {
    if (version === "v1") return generateV1();
    if (version === "v7") return generateV7();
    if (version === "nil") return generateNil();
    return generateV4();
}

function formatUuid(uuid: string, fmt: UuidFormat): string {
    const clean = uuid.replace(/-/g, "");
    if (fmt === "no-hyphens") return clean;
    if (fmt === "braces") return `{${uuid}}`;
    if (fmt === "urn") return `urn:uuid:${uuid}`;
    return uuid;
}

const VERSION_INFO: Record<UuidVersion, { label: string; desc: string }> = {
    v4: { label: "v4", desc: "Random · most common" },
    v1: { label: "v1", desc: "Time-based" },
    v7: { label: "v7", desc: "Unix timestamp · sortable" },
    nil: { label: "Nil", desc: "All zeros" },
};

const MAX_BULK = 100;

export default function UuidGeneratorWorkspace({ tool }: { tool: Tool }) {
    const [version, setVersion] = useState<UuidVersion>("v4");
    const [format, setFormat] = useState<UuidFormat>("standard");
    const [uppercase, setUppercase] = useState(false);
    const [count, setCount] = useState(1);
    const [uuids, setUuids] = useState<string[]>([]);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const generate_ = useCallback(() => {
        const n = Math.min(Math.max(1, count), MAX_BULK);
        const results = Array.from({ length: n }, () => {
            let u = generate(version);
            u = formatUuid(u, format);
            if (uppercase) u = u.toUpperCase();
            return u;
        });
        setUuids(results);
    }, [version, format, uppercase, count]);

    const copyOne = useCallback(async (uuid: string, idx: number) => {
        await navigator.clipboard.writeText(uuid);
        setCopiedIdx(idx);
        setTimeout(() => setCopiedIdx(null), 1200);
    }, []);

    const copyAll = useCallback(async () => {
        if (!uuids.length) return;
        await navigator.clipboard.writeText(uuids.join("\n"));
        setCopiedAll(true);
        setTimeout(() => setCopiedAll(false), 1500);
    }, [uuids]);

    const download = useCallback(() => {
        if (!uuids.length) return;
        const blob = new Blob([uuids.join("\n")], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "uuids.txt"; a.click();
        URL.revokeObjectURL(url);
    }, [uuids]);

    // Generate one on first render
    const didInit = useRef(false);
    if (!didInit.current) {
        didInit.current = true;
        setUuids([formatUuid(generate("v4"), "standard")]);
    }

    return (
        <>
            <div className="ug-root">
                {/* Chrome */}
                <div className="ug-chrome">
                    <div className="ug-chrome-left">
                        {/* Version */}
                        <div className="ug-pill-group" role="group" aria-label="UUID version">
                            {(["v4", "v1", "v7", "nil"] as UuidVersion[]).map((v) => (
                                <button
                                    key={v}
                                    type="button"
                                    className={`ug-pill${version === v ? " active" : ""}`}
                                    onClick={() => setVersion(v)}
                                    aria-pressed={version === v}
                                    title={VERSION_INFO[v].desc}
                                >
                                    {VERSION_INFO[v].label}
                                </button>
                            ))}
                        </div>

                        {/* Format */}
                        <div className="ug-pill-group" role="group" aria-label="Format">
                            {([
                                { id: "standard", label: "Standard" },
                                { id: "no-hyphens", label: "No hyphens" },
                                { id: "braces", label: "{Braces}" },
                                { id: "urn", label: "URN" },
                            ] as { id: UuidFormat; label: string }[]).map((f) => (
                                <button
                                    key={f.id}
                                    type="button"
                                    className={`ug-pill${format === f.id ? " active" : ""}`}
                                    onClick={() => setFormat(f.id)}
                                    aria-pressed={format === f.id}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        <label className="ug-toggle" title="Uppercase output">
                            <input
                                type="checkbox"
                                checked={uppercase}
                                onChange={(e) => setUppercase(e.target.checked)}
                                aria-label="Uppercase"
                            />
                            <span className="ug-toggle-track" aria-hidden="true">
                                <span className="ug-toggle-thumb" />
                            </span>
                            <span className="ug-toggle-lbl">AA</span>
                        </label>
                    </div>

                    <div className="ug-chrome-right">
                        {/* Count */}
                        <div className="ug-count-row" role="group" aria-label="Number of UUIDs">
                            <button
                                type="button"
                                className="ug-count-btn"
                                onClick={() => setCount((c) => Math.max(1, c - 1))}
                                aria-label="Decrease count"
                                disabled={count <= 1}
                            >
                                <i className="ti ti-minus" aria-hidden="true" />
                            </button>
                            <input
                                type="number"
                                className="ug-count-input"
                                value={count}
                                onChange={(e) => setCount(Math.min(MAX_BULK, Math.max(1, Number(e.target.value))))}
                                min={1}
                                max={MAX_BULK}
                                aria-label="Number of UUIDs to generate"
                            />
                            <button
                                type="button"
                                className="ug-count-btn"
                                onClick={() => setCount((c) => Math.min(MAX_BULK, c + 1))}
                                aria-label="Increase count"
                                disabled={count >= MAX_BULK}
                            >
                                <i className="ti ti-plus" aria-hidden="true" />
                            </button>
                        </div>

                        <button type="button" className="ug-generate-btn" onClick={generate_}>
                            <i className="ti ti-refresh" aria-hidden="true" />
                            Generate
                        </button>

                        {uuids.length > 0 && (
                            <>
                                <button
                                    type="button"
                                    className={`ug-action${copiedAll ? " success" : ""}`}
                                    onClick={copyAll}
                                >
                                    <i className={`ti ${copiedAll ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                    {copiedAll ? "Copied" : uuids.length > 1 ? `Copy all` : "Copy"}
                                </button>
                                <button type="button" className="ug-action" onClick={download}>
                                    <i className="ti ti-download" aria-hidden="true" />
                                    <span className="ug-action-label">Save</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Version info */}
                <div className="ug-version-bar">
                    <i className="ti ti-info-circle" aria-hidden="true" />
                    <span>
                        {version === "v4" && "UUID v4 uses random data. Best for most use cases — low collision probability."}
                        {version === "v1" && "UUID v1 encodes a timestamp + MAC address. Sortable by time, but leaks info."}
                        {version === "v7" && "UUID v7 is timestamp-based with random suffix. Sortable + database-friendly."}
                        {version === "nil" && "Nil UUID is all zeros (00000000-…). Used as a null/empty sentinel value."}
                    </span>
                </div>

                {/* UUID list */}
                <div className="ug-body">
                    {uuids.length === 0 ? (
                        <div className="ug-empty">
                            <i className="ti ti-fingerprint" aria-hidden="true" />
                            <p>Press Generate to create UUIDs</p>
                        </div>
                    ) : (
                        <ul className="ug-list" aria-label="Generated UUIDs" role="list">
                            {uuids.map((uuid, i) => (
                                <li key={i} className="ug-item" role="listitem">
                                    <span className="ug-item-num" aria-hidden="true">{i + 1}</span>
                                    <code className="ug-item-uuid">{uuid}</code>
                                    <button
                                        type="button"
                                        className={`ug-item-copy${copiedIdx === i ? " success" : ""}`}
                                        onClick={() => copyOne(uuid, i)}
                                        aria-label={`Copy UUID ${uuid}`}
                                    >
                                        <i className={`ti ${copiedIdx === i ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <style>{`
        .ug-root {
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          min-height: 400px;
        }

        .ug-chrome {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 12px;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
          flex-wrap: wrap;
        }
        .ug-chrome-left, .ug-chrome-right {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .ug-pill-group {
          display: flex;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .ug-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          height: 28px;
          padding: 0 11px;
          border: none;
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background 0.1s, color 0.1s;
          white-space: nowrap;
        }
        .ug-pill:last-child { border-right: none; }
        .ug-pill:hover { background: var(--border); color: var(--text); }
        .ug-pill.active { background: var(--brand-light); color: var(--brand-text); }

        .ug-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          user-select: none;
        }
        .ug-toggle input { position: absolute; opacity: 0; width: 0; height: 0; }
        .ug-toggle-track {
          width: 28px;
          height: 16px;
          background: var(--border);
          border-radius: 99px;
          position: relative;
          transition: background 0.15s;
          flex-shrink: 0;
        }
        .ug-toggle input:checked + .ug-toggle-track { background: var(--brand); }
        .ug-toggle-thumb {
          position: absolute;
          top: 2px;
          left: 2px;
          width: 12px;
          height: 12px;
          background: #fff;
          border-radius: 50%;
          transition: transform 0.15s;
        }
        .ug-toggle input:checked + .ug-toggle-track .ug-toggle-thumb { transform: translateX(12px); }
        .ug-toggle-lbl {
          font-size: 11px;
          font-weight: 700;
          color: var(--text-secondary);
          font-family: var(--font-mono);
          letter-spacing: 0.05em;
        }

        .ug-count-row {
          display: flex;
          align-items: center;
          border: 0.5px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-card);
        }
        .ug-count-btn {
          width: 28px;
          height: 28px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.1s;
        }
        .ug-count-btn:hover { background: var(--border); color: var(--text); }
        .ug-count-btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .ug-count-input {
          width: 40px;
          height: 28px;
          border: none;
          border-left: 0.5px solid var(--border);
          border-right: 0.5px solid var(--border);
          background: transparent;
          color: var(--text);
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-mono);
          text-align: center;
          outline: none;
          -moz-appearance: textfield;
        }
        .ug-count-input::-webkit-outer-spin-button,
        .ug-count-input::-webkit-inner-spin-button { -webkit-appearance: none; }

        .ug-generate-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 28px;
          padding: 0 14px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--brand-border);
          background: var(--brand-light);
          color: var(--brand-text);
          font-size: 12px;
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.1s;
        }
        .ug-generate-btn:hover { background: var(--brand); color: var(--bg); border-color: var(--brand); }
        .ug-generate-btn i { font-size: 13px; }

        .ug-action {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          height: 28px;
          padding: 0 12px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: all 0.1s;
          white-space: nowrap;
        }
        .ug-action i { font-size: 12px; }
        .ug-action:hover { background: var(--border); color: var(--text); }
        .ug-action:disabled { opacity: 0.38; cursor: not-allowed; }
        .ug-action.success { background: var(--brand-light); color: var(--brand-text); border-color: var(--brand-border); }
        .ug-action-label { display: inline; }

        .ug-version-bar {
          display: flex;
          align-items: flex-start;
          gap: 7px;
          padding: 7px 14px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          font-size: 11.5px;
          color: var(--text-secondary);
          font-family: var(--font-sans);
          line-height: 1.5;
        }
        .ug-version-bar i { font-size: 13px; color: var(--text-tertiary); margin-top: 1px; flex-shrink: 0; }

        .ug-body { flex: 1; overflow: auto; }
        .ug-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 48px;
          color: var(--text-disabled);
          font-family: var(--font-sans);
        }
        .ug-empty i { font-size: 24px; }
        .ug-empty p { font-size: 12.5px; margin: 0; }

        .ug-list {
          list-style: none;
          padding: 6px 0;
          margin: 0;
        }
        .ug-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 14px;
          height: 38px;
          transition: background 0.1s;
        }
        .ug-item:hover { background: var(--bg-surface); }
        .ug-item:hover .ug-item-copy { opacity: 1; }
        .ug-item + .ug-item { border-top: 0.5px solid var(--border-faint); }
        .ug-item-num {
          width: 22px;
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
          text-align: right;
          flex-shrink: 0;
        }
        .ug-item-uuid {
          flex: 1;
          font-size: 12.5px;
          font-family: var(--font-mono);
          color: var(--text);
          letter-spacing: 0.02em;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          background: none;
          border: none;
          padding: 0;
        }
        .ug-item-copy {
          width: 26px;
          height: 26px;
          border-radius: var(--radius-sm);
          border: none;
          background: transparent;
          color: var(--text-disabled);
          font-size: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.1s, color 0.1s, background 0.1s;
          flex-shrink: 0;
        }
        .ug-item-copy:hover { color: var(--brand); background: var(--brand-light); }
        .ug-item-copy.success { color: var(--brand); opacity: 1; }

        @media (max-width: 768px) {
          .ug-action-label { display: none; }
          .ug-item-num { display: none; }
          .ug-item-copy { opacity: 1; }
          .ug-item-uuid { font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ug-pill, .ug-action, .ug-item, .ug-item-copy,
          .ug-toggle-track, .ug-toggle-thumb { transition: none; }
        }
      `}</style>
        </>
    );
}