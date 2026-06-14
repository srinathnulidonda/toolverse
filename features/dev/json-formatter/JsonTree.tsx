"use client";

import { useState, useCallback } from "react";

type JsonTreeProps = {
    value: unknown;
    onPathClick?: (path: string) => void;
};

type NodeProps = {
    value: unknown;
    path: string;
    depth: number;
    onPathClick?: (path: string) => void;
    isLast?: boolean;
    nodeKey?: string;
};

function getType(v: unknown): string {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v;
}

function JsonNode({ value, path, depth, onPathClick, isLast, nodeKey }: NodeProps) {
    const [collapsed, setCollapsed] = useState(depth > 2);
    const [pathCopied, setPathCopied] = useState(false);
    const type = getType(value);

    const handlePathClick = useCallback(async (e: React.MouseEvent) => {
        e.stopPropagation();
        const p = path || "$";
        if (onPathClick) onPathClick(p);
        try {
            await navigator.clipboard.writeText(p);
            setPathCopied(true);
            setTimeout(() => setPathCopied(false), 1200);
        } catch { /* */ }
    }, [path, onPathClick]);

    const toggle = useCallback(() => setCollapsed((c) => !c), []);

    if (type === "object" || type === "array") {
        const entries = type === "array"
            ? (value as unknown[]).map((v, i) => [String(i), v] as [string, unknown])
            : Object.entries(value as Record<string, unknown>);
        const isEmpty = entries.length === 0;
        const bracket = type === "array" ? ["[", "]"] : ["{", "}"];
        const countLabel = type === "array"
            ? `${entries.length} ${entries.length === 1 ? "item" : "items"}`
            : `${entries.length} ${entries.length === 1 ? "key" : "keys"}`;

        return (
            <div className="jt-node">
                <div className="jt-row">
                    {nodeKey !== undefined && (
                        <span className="jt-key-label">
                            &ldquo;{nodeKey}&rdquo;<span className="jt-colon">:</span>&nbsp;
                        </span>
                    )}
                    <span className="jt-bracket">{bracket[0]}</span>
                    {!isEmpty && (
                        <button
                            className="jt-toggle"
                            onClick={toggle}
                            aria-label={collapsed ? `Expand ${type}` : `Collapse ${type}`}
                            aria-expanded={!collapsed}
                        >
                            <i className={`ti ${collapsed ? "ti-chevron-right" : "ti-chevron-down"}`} aria-hidden="true" />
                            {collapsed && (
                                <span className="jt-collapsed-pill">{countLabel}</span>
                            )}
                        </button>
                    )}
                    {collapsed && !isEmpty && <span className="jt-bracket">{bracket[1]}</span>}
                    {(!collapsed || isEmpty) && isEmpty && <span className="jt-bracket">{bracket[1]}</span>}
                    {!isLast && (collapsed || isEmpty) && <span className="jt-comma">,</span>}
                    <button
                        className="jt-path-btn"
                        onClick={handlePathClick}
                        title={`Copy path: ${path || "$"}`}
                        aria-label={`Copy JSONPath ${path || "$"}`}
                    >
                        <i className={`ti ${pathCopied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
                    </button>
                </div>

                {!collapsed && !isEmpty && (
                    <>
                        <div className="jt-children">
                            {entries.map(([k, v], i) => (
                                <JsonNode
                                    key={k}
                                    value={v}
                                    nodeKey={type === "object" ? k : undefined}
                                    path={type === "array" ? `${path}[${k}]` : `${path}.${k}`}
                                    depth={depth + 1}
                                    onPathClick={onPathClick}
                                    isLast={i === entries.length - 1}
                                />
                            ))}
                        </div>
                        <div className="jt-row">
                            <span className="jt-bracket">{bracket[1]}</span>
                            {!isLast && <span className="jt-comma">,</span>}
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Primitive
    let cls = "jt-prim-string";
    let display: string;
    if (type === "string") {
        cls = "jt-prim-string";
        display = `"${(value as string).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    } else if (type === "number") {
        cls = "jt-prim-number";
        display = String(value);
    } else if (type === "boolean") {
        cls = "jt-prim-boolean";
        display = String(value);
    } else {
        cls = "jt-prim-null";
        display = "null";
    }

    return (
        <div className="jt-row jt-prim-row">
            {nodeKey !== undefined && (
                <span className="jt-key-label">
                    &ldquo;{nodeKey}&rdquo;<span className="jt-colon">:</span>&nbsp;
                </span>
            )}
            <span className={`jt-primitive ${cls}`}>{display}</span>
            {!isLast && <span className="jt-comma">,</span>}
            <button
                className="jt-path-btn"
                onClick={handlePathClick}
                title={`Copy path: ${path || "$"}`}
                aria-label={`Copy path ${path || "$"}`}
            >
                <i className={`ti ${pathCopied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
            </button>
        </div>
    );
}

export default function JsonTree({ value, onPathClick }: JsonTreeProps) {
    return (
        <>
            <div className="jt-root" role="tree" aria-label="JSON tree view">
                <JsonNode value={value} path="$" depth={0} onPathClick={onPathClick} isLast />
            </div>
            <style>{`
        .jt-root {
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.75;
          padding: 12px 0;
          overflow: auto;
          flex: 1;
          color: var(--text);
        }

        .jt-node {
          display: flex;
          flex-direction: column;
        }

        .jt-row {
          display: flex;
          align-items: baseline;
          gap: 1px;
          padding: 0 14px;
          min-height: 22px;
          border-radius: 3px;
          position: relative;
        }
        .jt-row:hover { background: var(--bg-surface); }
        .jt-row:hover .jt-path-btn { opacity: 1; }

        .jt-prim-row { padding-left: 14px; }

        .jt-key-label {
          color: var(--brand);
          white-space: nowrap;
          flex-shrink: 0;
        }
        .jt-colon { color: var(--text-secondary); }
        .jt-bracket {
          color: var(--text-secondary);
          font-weight: 500;
          flex-shrink: 0;
        }
        .jt-comma {
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .jt-toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          border: none;
          background: transparent;
          cursor: pointer;
          color: var(--text-tertiary);
          padding: 0 2px;
          font-size: 11px;
          border-radius: 3px;
          transition: color 0.1s, background 0.1s;
          flex-shrink: 0;
        }
        .jt-toggle:hover { color: var(--text); background: var(--border); }
        .jt-toggle i { font-size: 10px; }
        .jt-toggle:focus-visible { outline: 2px solid var(--brand); outline-offset: 1px; }

        .jt-collapsed-pill {
          font-size: 10px;
          color: var(--text-tertiary);
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          border-radius: 3px;
          padding: 0 5px;
          font-family: var(--font-sans);
          line-height: 18px;
        }

        .jt-children {
          border-left: 1.5px solid var(--border-faint);
          margin-left: 22px;
          padding-left: 0;
        }

        /* Primitives */
        .jt-primitive { flex-shrink: 0; }
        .jt-prim-string { color: #0A7D65; }
        .jt-prim-number { color: #1D5FBF; }
        .jt-prim-boolean { color: #A0501A; }
        .jt-prim-null { color: var(--text-tertiary); font-style: italic; }
        @media (prefers-color-scheme: dark) {
          .jt-prim-string { color: #5EEAD4; }
          .jt-prim-number { color: #93C5FD; }
          .jt-prim-boolean { color: #FDBA74; }
        }

        /* Path copy button */
        .jt-path-btn {
          border: none;
          background: transparent;
          padding: 1px 4px;
          cursor: pointer;
          color: var(--text-disabled);
          font-size: 10px;
          opacity: 0;
          transition: opacity 0.1s, color 0.1s;
          border-radius: 3px;
          display: inline-flex;
          align-items: center;
          margin-left: 4px;
        }
        .jt-path-btn:hover { color: var(--brand); opacity: 1 !important; }
        .jt-path-btn:focus-visible {
          outline: 2px solid var(--brand);
          outline-offset: 1px;
          opacity: 1;
        }

        @media (prefers-reduced-motion: reduce) {
          .jt-toggle, .jt-path-btn { transition: none; }
        }
      `}</style>
        </>
    );
}