// features/dev/json-validator/CompareMode.tsx
"use client";

import { useState, useMemo, useCallback } from "react";

interface CompareModeProps {
  leftDefault?: string;
}

type DiffType = "added" | "removed" | "modified" | "same";

interface DiffLine {
  type: DiffType;
  path: string;
  leftValue?: any;
  rightValue?: any;
  line: number;
}

function deepCompare(left: any, right: any, path = "$"): DiffLine[] {
  const diffs: DiffLine[] = [];

  // Type mismatch
  if (typeof left !== typeof right || Array.isArray(left) !== Array.isArray(right)) {
    diffs.push({
      type: "modified",
      path,
      leftValue: left,
      rightValue: right,
      line: 0,
    });
    return diffs;
  }

  // Primitives
  if (typeof left !== "object" || left === null) {
    if (left !== right) {
      diffs.push({
        type: "modified",
        path,
        leftValue: left,
        rightValue: right,
        line: 0,
      });
    }
    return diffs;
  }

  // Arrays
  if (Array.isArray(left)) {
    const maxLen = Math.max(left.length, right.length);
    for (let i = 0; i < maxLen; i++) {
      if (i >= left.length) {
        diffs.push({
          type: "added",
          path: `${path}[${i}]`,
          rightValue: right[i],
          line: 0,
        });
      } else if (i >= right.length) {
        diffs.push({
          type: "removed",
          path: `${path}[${i}]`,
          leftValue: left[i],
          line: 0,
        });
      } else {
        diffs.push(...deepCompare(left[i], right[i], `${path}[${i}]`));
      }
    }
    return diffs;
  }

  // Objects
  const allKeys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of allKeys) {
    const newPath = `${path}.${key}`;
    if (!(key in right)) {
      diffs.push({
        type: "removed",
        path: newPath,
        leftValue: left[key],
        line: 0,
      });
    } else if (!(key in left)) {
      diffs.push({
        type: "added",
        path: newPath,
        rightValue: right[key],
        line: 0,
      });
    } else {
      diffs.push(...deepCompare(left[key], right[key], newPath));
    }
  }

  return diffs;
}

export default function CompareMode({ leftDefault = "" }: CompareModeProps) {
  const [leftInput, setLeftInput] = useState(leftDefault);
  const [rightInput, setRightInput] = useState("");
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [copiedKey, setCopiedKey] = useState("");

  const comparison = useMemo(() => {
    if (!leftInput.trim() || !rightInput.trim()) {
      return { valid: false, diffs: [] };
    }

    try {
      const leftParsed = JSON.parse(leftInput);
      const rightParsed = JSON.parse(rightInput);
      const diffs = deepCompare(leftParsed, rightParsed);

      return {
        valid: true,
        diffs,
        stats: {
          added: diffs.filter((d) => d.type === "added").length,
          removed: diffs.filter((d) => d.type === "removed").length,
          modified: diffs.filter((d) => d.type === "modified").length,
          same: diffs.filter((d) => d.type === "same").length,
        },
      };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : "Parse error",
        diffs: [],
      };
    }
  }, [leftInput, rightInput]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const areSame = comparison.valid && comparison.diffs.length === 0;

  return (
    <>
      <div className="cm-root">
        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-left">
            <i className="ti ti-git-compare" />
            <span>Compare JSON Documents</span>
          </div>
          <div className="cm-header-right">
            <div className="cm-view-toggle">
              <button
                type="button"
                className={`cm-view-btn${viewMode === "split" ? " active" : ""}`}
                onClick={() => setViewMode("split")}
              >
                <i className="ti ti-layout-columns" />
                Split
              </button>
              <button
                type="button"
                className={`cm-view-btn${viewMode === "unified" ? " active" : ""}`}
                onClick={() => setViewMode("unified")}
              >
                <i className="ti ti-list" />
                Unified
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        {comparison.valid && comparison.stats && (
          <div className="cm-stats">
            {areSame ? (
              <div className="cm-stat cm-stat--same">
                <i className="ti ti-checks" />
                <span>Documents are identical</span>
              </div>
            ) : (
              <>
                {comparison.stats.added > 0 && (
                  <div className="cm-stat cm-stat--added">
                    <i className="ti ti-plus" />
                    <span>{comparison.stats.added} added</span>
                  </div>
                )}
                {comparison.stats.removed > 0 && (
                  <div className="cm-stat cm-stat--removed">
                    <i className="ti ti-minus" />
                    <span>{comparison.stats.removed} removed</span>
                  </div>
                )}
                {comparison.stats.modified > 0 && (
                  <div className="cm-stat cm-stat--modified">
                    <i className="ti ti-pencil" />
                    <span>{comparison.stats.modified} modified</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`cm-body cm-body--${viewMode}`}>
          {viewMode === "split" ? (
            <>
              {/* Left Panel */}
              <div className="cm-panel">
                <div className="cm-panel-header">
                  <div className="cm-panel-title">
                    <i className="ti ti-file" />
                    Original
                  </div>
                  <div className="cm-panel-actions">
                    <button
                      type="button"
                      className={`cm-copy-btn${copiedKey === "left" ? " copied" : ""}`}
                      onClick={() => handleCopy(leftInput, "left")}
                      disabled={!leftInput}
                    >
                      <i className={`ti ${copiedKey === "left" ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className="cm-clear-btn"
                      onClick={() => setLeftInput("")}
                      disabled={!leftInput}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                </div>
                <textarea
                  className="cm-textarea"
                  value={leftInput}
                  onChange={(e) => setLeftInput(e.target.value)}
                  placeholder="Paste first JSON..."
                  spellCheck={false}
                />
              </div>

              {/* Divider */}
              <div className="cm-divider">
                <div className="cm-divider-icon">
                  <i className="ti ti-arrows-left-right" />
                </div>
              </div>

              {/* Right Panel */}
              <div className="cm-panel">
                <div className="cm-panel-header">
                  <div className="cm-panel-title">
                    <i className="ti ti-file" />
                    Modified
                  </div>
                  <div className="cm-panel-actions">
                    <button
                      type="button"
                      className={`cm-copy-btn${copiedKey === "right" ? " copied" : ""}`}
                      onClick={() => handleCopy(rightInput, "right")}
                      disabled={!rightInput}
                    >
                      <i className={`ti ${copiedKey === "right" ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className="cm-clear-btn"
                      onClick={() => setRightInput("")}
                      disabled={!rightInput}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                </div>
                <textarea
                  className="cm-textarea"
                  value={rightInput}
                  onChange={(e) => setRightInput(e.target.value)}
                  placeholder="Paste second JSON to compare..."
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            /* Unified View */
            <div className="cm-unified">
              {!comparison.valid && comparison.error && (
                <div className="cm-error">
                  <i className="ti ti-alert-circle" />
                  <span>{comparison.error}</span>
                </div>
              )}

              {comparison.valid && comparison.diffs.length === 0 && (
                <div className="cm-same">
                  <i className="ti ti-checks" />
                  <span>Documents are identical</span>
                </div>
              )}

              {comparison.valid && comparison.diffs.length > 0 && (
                <div className="cm-diff-list">
                  {comparison.diffs.map((diff, idx) => (
                    <div key={idx} className={`cm-diff-item cm-diff-item--${diff.type}`}>
                      <div className="cm-diff-icon">
                        {diff.type === "added" && <i className="ti ti-plus" />}
                        {diff.type === "removed" && <i className="ti ti-minus" />}
                        {diff.type === "modified" && <i className="ti ti-pencil" />}
                      </div>
                      <div className="cm-diff-content">
                        <div className="cm-diff-path">{diff.path}</div>
                        {diff.type === "modified" && (
                          <div className="cm-diff-values">
                            <div className="cm-diff-value cm-diff-value--old">
                              <span className="cm-diff-label">−</span>
                              <code>{JSON.stringify(diff.leftValue)}</code>
                            </div>
                            <div className="cm-diff-value cm-diff-value--new">
                              <span className="cm-diff-label">+</span>
                              <code>{JSON.stringify(diff.rightValue)}</code>
                            </div>
                          </div>
                        )}
                        {diff.type === "removed" && (
                          <div className="cm-diff-value cm-diff-value--old">
                            <span className="cm-diff-label">−</span>
                            <code>{JSON.stringify(diff.leftValue)}</code>
                          </div>
                        )}
                        {diff.type === "added" && (
                          <div className="cm-diff-value cm-diff-value--new">
                            <span className="cm-diff-label">+</span>
                            <code>{JSON.stringify(diff.rightValue)}</code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Empty State */}
        {!leftInput && !rightInput && (
          <div className="cm-empty">
            <div className="cm-empty-icon">
              <i className="ti ti-git-compare" />
            </div>
            <h3 className="cm-empty-title">Compare JSON Documents</h3>
            <p className="cm-empty-desc">
              Paste two JSON documents to see structural differences, additions, and modifications.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
