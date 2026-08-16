// features/dev/json-formatter/JsonTree.tsx
"use client";

import { JsonArrayNode } from "./JsonArrayNode";
import { JsonObjectNode } from "./JsonObjectNode";
import { JsonValueCell } from "./JsonValueCell";
import type { Tool } from "@/lib/tools";
import styles from "./style/JsonTree.module.css";

type JsonTreeProps = {
  value: unknown;
  onPathClick?: (path: string) => void;
};

export default function JsonTree({ value, onPathClick }: JsonTreeProps) {
  // Determine the type of the root value to render the appropriate component
  if (value === null) {
    return (
      <>
        <div className={styles.jtRoot} role="tree" aria-label="JSON tree view">
          <JsonValueCell value={null} path="$" depth={0} onPathClick={onPathClick} isLast />
        </div>
      </>
    );
  }

  if (Array.isArray(value)) {
    return (
      <>
        <div className={styles.jtRoot} role="tree" aria-label="JSON tree view">
          <JsonArrayNode value={value} path="$" depth={0} onPathClick={onPathClick} isLast />
        </div>
      </>
    );
  }

  if (typeof value === "object") {
    return (
      <>
        <div className={styles.jtRoot} role="tree" aria-label="JSON tree view">
          <JsonObjectNode
            value={value as Record<string, unknown>}
            path="$"
            depth={0}
            onPathClick={onPathClick}
            isLast
          />
        </div>
      </>
    );
  }

  // Primitive (string, number, boolean, undefined)
  return (
    <>
      <div className={styles.jtRoot} role="tree" aria-label="JSON tree view">
        <JsonValueCell value={value} path="$" depth={0} onPathClick={onPathClick} isLast />
      </div>
    </>
  );
}