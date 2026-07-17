// features/dev/json-formatter/JsonArrayNode.tsx
"use client";

import { useCallback, useState } from "react";
import { JsonValueCell } from "./JsonValueCell";
import { JsonObjectNode } from "./JsonObjectNode";

type JsonArrayNodeProps = {
  value: unknown[];
  path: string;
  depth: number;
  onPathClick?: (path: string) => void;
  isLast: boolean;
  nodeKey?: string;
};

export function JsonArrayNode({
  value,
  path,
  depth,
  onPathClick,
  isLast,
  nodeKey,
}: JsonArrayNodeProps) {
  const [collapsed, setCollapsed] = useState(depth > 2);
  const [pathCopied, setPathCopied] = useState(false);
  const entries = value.map((v, i) => [String(i), v] as [string, unknown]);
  const isEmpty = entries.length === 0;
  const bracket = ["[", "]"];
  const countLabel = `${entries.length} ${entries.length === 1 ? "item" : "items"}`;

  const toggle = useCallback(() => setCollapsed((c) => !c), []);

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
            aria-label={collapsed ? `Expand array` : `Collapse array`}
            aria-expanded={!collapsed}
          >
            <i
              className={`ti ${collapsed ? "ti-chevron-right" : "ti-chevron-down"}`}
              aria-hidden="true"
            />
            {collapsed && <span className="jt-collapsed-pill">{countLabel}</span>}
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
            {entries.map(([k, v], i) => {
              if (v === null) {
                return (
                  <JsonValueCell
                    key={k}
                    value={v}
                    path={`${path}.${k}`}
                    nodeKey={k}
                    depth={depth + 1}
                    onPathClick={onPathClick}
                    isLast={i === entries.length - 1}
                  />
                );
              } else if (Array.isArray(v)) {
                return (
                  <JsonArrayNode
                    key={k}
                    value={v}
                    path={`${path}.${k}`}
                    nodeKey={k}
                    depth={depth + 1}
                    onPathClick={onPathClick}
                    isLast={i === entries.length - 1}
                  />
                );
              } else if (typeof v === "object") {
                return (
                  <JsonObjectNode
                    key={k}
                    value={v as Record<string, unknown>}
                    path={`${path}.${k}`}
                    nodeKey={k}
                    depth={depth + 1}
                    onPathClick={onPathClick}
                    isLast={i === entries.length - 1}
                  />
                );
              } else {
                return (
                  <JsonValueCell
                    key={k}
                    value={v}
                    path={`${path}.${k}`}
                    nodeKey={k}
                    depth={depth + 1}
                    onPathClick={onPathClick}
                    isLast={i === entries.length - 1}
                  />
                );
              }
            })}
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
