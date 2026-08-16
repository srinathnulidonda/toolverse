// features/dev/json-validator/CompareMode.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import styles from "./style/CompareMode.module.css";

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
      <div className={styles.cmRoot}>
        {/* Header */}
        <div className={styles.cmHeader}>
          <div className={styles.cmHeaderLeft}>
            <i className="ti ti-git-compare" />
            <span>Compare JSON Documents</span>
          </div>
          <div className={styles.cmHeaderRight}>
            <div className={styles.cmViewToggle}>
              <button
                type="button"
                className={`${styles.cmViewBtn}${viewMode === "split" ? " active" : ""}`}
                onClick={() => setViewMode("split")}
              >
                <i className="ti ti-layout-columns" />
                Split
              </button>
              <button
                type="button"
                className={`${styles.cmViewBtn}${viewMode === "unified" ? " active" : ""}`}
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
          <div className={styles.cmStats}>
            {areSame ? (
              <div className={`${styles.cmStat} ${styles.cmStatSame}`}>
                <i className="ti ti-checks" />
                <span>Documents are identical</span>
              </div>
            ) : (
              <>
                {comparison.stats.added > 0 && (
                  <div className={`${styles.cmStat} ${styles.cmStatAdded}`}>
                    <i className="ti ti-plus" />
                    <span>{comparison.stats.added} added</span>
                  </div>
                )}
                {comparison.stats.removed > 0 && (
                  <div className={`${styles.cmStat} ${styles.cmStatRemoved}`}>
                    <i className="ti ti-minus" />
                    <span>{comparison.stats.removed} removed</span>
                  </div>
                )}
                {comparison.stats.modified > 0 && (
                  <div className={`${styles.cmStat} ${styles.cmStatModified}`}>
                    <i className="ti ti-pencil" />
                    <span>{comparison.stats.modified} modified</span>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Body */}
        <div className={`${styles.cmBody} ${styles[`cmBody${viewMode.charAt(0).toUpperCase()}${viewMode.slice(1)}`]}`}>
          {viewMode === "split" ? (
            <>
              {/* Left Panel */}
              <div className={styles.cmPanel}>
                <div className={styles.cmPanelHeader}>
                  <div className={styles.cmPanelTitle}>
                    <i className="ti ti-file" />
                    Original
                  </div>
                  <div className={styles.cmPanelActions}>
                    <button
                      type="button"
                      className={`${styles.cmCopyBtn}${copiedKey === "left" ? " copied" : ""}`}
                      onClick={() => handleCopy(leftInput, "left")}
                      disabled={!leftInput}
                    >
                      <i className={`ti ${copiedKey === "left" ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.cmClearBtn}
                      onClick={() => setLeftInput("")}
                      disabled={!leftInput}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                </div>
                <textarea
                  className={styles.cmTextarea}
                  value={leftInput}
                  onChange={(e) => setLeftInput(e.target.value)}
                  placeholder="Paste first JSON..."
                  spellCheck={false}
                />
              </div>

              {/* Divider */}
              <div className={styles.cmDivider}>
                <div className={styles.cmDividerIcon}>
                  <i className="ti ti-arrows-left-right" />
                </div>
              </div>

              {/* Right Panel */}
              <div className={styles.cmPanel}>
                <div className={styles.cmPanelHeader}>
                  <div className={styles.cmPanelTitle}>
                    <i className="ti ti-file" />
                    Modified
                  </div>
                  <div className={styles.cmPanelActions}>
                    <button
                      type="button"
                      className={`${styles.cmCopyBtn}${copiedKey === "right" ? " copied" : ""}`}
                      onClick={() => handleCopy(rightInput, "right")}
                      disabled={!rightInput}
                    >
                      <i className={`ti ${copiedKey === "right" ? "ti-check" : "ti-copy"}`} />
                    </button>
                    <button
                      type="button"
                      className={styles.cmClearBtn}
                      onClick={() => setRightInput("")}
                      disabled={!rightInput}
                    >
                      <i className="ti ti-x" />
                    </button>
                  </div>
                </div>
                <textarea
                  className={styles.cmTextarea}
                  value={rightInput}
                  onChange={(e) => setRightInput(e.target.value)}
                  placeholder="Paste second JSON to compare..."
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            /* Unified View */
            <div className={styles.cmUnified}>
              {!comparison.valid && comparison.error && (
                <div className={styles.cmError}>
                  <i className="ti ti-alert-circle" />
                  <span>{comparison.error}</span>
                </div>
              )}

              {comparison.valid && comparison.diffs.length === 0 && (
                <div className={styles.cmSame}>
                  <i className="ti ti-checks" />
                  <span>Documents are identical</span>
                </div>
              )}

              {comparison.valid && comparison.diffs.length > 0 && (
                <div className={styles.cmDiffList}>
                  {comparison.diffs.map((diff, idx) => (
                    <div key={idx} className={`${styles.cmDiffItem} ${styles[`cmDiffItem${diff.type.charAt(0).toUpperCase()}${diff.type.slice(1)}`]}`}>
                      <div className={styles.cmDiffIcon}>
                        {diff.type === "added" && <i className="ti ti-plus" />}
                        {diff.type === "removed" && <i className="ti ti-minus" />}
                        {diff.type === "modified" && <i className="ti ti-pencil" />}
                      </div>
                      <div className={styles.cmDiffContent}>
                        <div className={styles.cmDiffPath}>{diff.path}</div>
                        {diff.type === "modified" && (
                          <div className={styles.cmDiffValues}>
                            <div className={`${styles.cmDiffValue} ${styles.cmDiffValueOld}`}>
                              <span className={styles.cmDiffLabel}>−</span>
                              <code>{JSON.stringify(diff.leftValue)}</code>
                            </div>
                            <div className={`${styles.cmDiffValue} ${styles.cmDiffValueNew}`}>
                              <span className={styles.cmDiffLabel}>+</span>
                              <code>{JSON.stringify(diff.rightValue)}</code>
                            </div>
                          </div>
                        )}
                        {diff.type === "removed" && (
                          <div className={`${styles.cmDiffValue} ${styles.cmDiffValueOld}`}>
                            <span className={styles.cmDiffLabel}>−</span>
                            <code>{JSON.stringify(diff.leftValue)}</code>
                          </div>
                        )}
                        {diff.type === "added" && (
                          <div className={`${styles.cmDiffValue} ${styles.cmDiffValueNew}`}>
                            <span className={styles.cmDiffLabel}>+</span>
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
          <div className={styles.cmEmpty}>
            <div className={styles.cmEmptyIcon}>
              <i className="ti ti-git-compare" />
            </div>
            <h3 className={styles.cmEmptyTitle}>Compare JSON Documents</h3>
            <p className={styles.cmEmptyDesc}>
              Paste two JSON documents to see structural differences, additions, and modifications.
            </p>
          </div>
        )}
      </div>
    </>
  );
}