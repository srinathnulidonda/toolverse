// features/dev/json-formatter/JsonValueCell.tsx
"use client";

import { useCallback, useState } from "react";
import styles from "./style/JsonTree.module.css";

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

  let cls = styles.jtPrimString;
  let display: string;
  if (type === "string") {
    cls = styles.jtPrimString;
    // Escape quotes and backslashes for display
    display = `"${(value as string).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
  } else if (type === "number") {
    cls = styles.jtPrimNumber;
    display = String(value);
  } else if (type === "boolean") {
    cls = styles.jtPrimBoolean;
    display = String(value);
  } else {
    // null or undefined
    cls = styles.jtPrimNull;
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
    <div className={`${styles.jtRow} ${styles.jtPrimRow}`}>
      {nodeKey !== undefined && (
        <span className={styles.jtKeyLabel}>
          &ldquo;{nodeKey}&rdquo;<span className={styles.jtColon}>:</span>&nbsp;
        </span>
      )}
      <span className={`${styles.jtPrimitive} ${cls}`}>{display}</span>
      {!isLast && <span className={styles.jtComma}>,</span>}
      <button
        className={styles.jtPathBtn}
        onClick={handlePathClick}
        title={`Copy path: ${path || "$"}`}
        aria-label={`Copy path ${path || "$"}`}
      >
        <i className={`ti ${pathCopied ? "ti-check" : "ti-copy"}`} aria-hidden="true" />
      </button>
    </div>
  );
}