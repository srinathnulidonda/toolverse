// features/dev/json-formatter/JsonValueCell.tsx
"use client";

import { useCallback, useState } from "react";

type JsonValueCellProps = {
  value: unknown; // primitive (string, number, boolean, null, undefined)
  path: string;
  depth: number;
  onPathClick?: (path: string) => void;
  isLast: boolean;
  nodeKey?: string;
};

export function JsonValueCell({
  value,
  path,
  depth,
  onPathClick,
  isLast,
  nodeKey,
}: JsonValueCellProps) {
  const [pathCopied, setPathCopied] = useState(false);

  const getType = (v: unknown): string => {
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v;
  };

  const type = getType(value);

  let cls = "jt-prim-string";
  let display: string;
  if (type === "string") {
    cls = "jt-prim-string";
    // Escape quotes and backslashes for display
    display = `"${(value as string).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  } else if (type === "number") {
    cls = "jt-prim-number";
    display = String(value);
  } else if (type === "boolean") {
    cls = "jt-prim-boolean";
    display = String(value);
  } else {
    // null or undefined
    cls = "jt-prim-null";
    display = value === null ? "null" : "undefined";
  }

  const handlePathClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      const p = path || "$";
      if (onPathClick) onPathClick(p);
      try {
        await navigator.clipboard.writeText(p);
        setPathCopied(true);
        setTimeout(() => setPathCopied(false), 1200);
      } catch {
        /* */
      }
    },
    [path, onPathClick]
  );

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
