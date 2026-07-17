// features/dev/json-formatter/JsonTree.tsx
"use client";

import { JsonArrayNode } from "./JsonArrayNode";
import { JsonObjectNode } from "./JsonObjectNode";
import { JsonValueCell } from "./JsonValueCell";
import type { Tool } from "@/lib/tools";

type JsonTreeProps = {
  value: unknown;
  onPathClick?: (path: string) => void;
};

export default function JsonTree({ value, onPathClick }: JsonTreeProps) {
  // Determine the type of the root value to render the appropriate component
  if (value === null) {
    return (
      <>
        <div className="jt-root" role="tree" aria-label="JSON tree view">
          <JsonValueCell value={null} path="$" depth={0} onPathClick={onPathClick} isLast />
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

  if (Array.isArray(value)) {
    return (
      <>
        <div className="jt-root" role="tree" aria-label="JSON tree view">
          <JsonArrayNode value={value} path="$" depth={0} onPathClick={onPathClick} isLast />
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

  if (typeof value === "object") {
    return (
      <>
        <div className="jt-root" role="tree" aria-label="JSON tree view">
          <JsonObjectNode
            value={value as Record<string, unknown>}
            path="$"
            depth={0}
            onPathClick={onPathClick}
            isLast
          />
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

  // Primitive (string, number, boolean, undefined)
  return (
    <>
      <div className="jt-root" role="tree" aria-label="JSON tree view">
        <JsonValueCell value={value} path="$" depth={0} onPathClick={onPathClick} isLast />
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
