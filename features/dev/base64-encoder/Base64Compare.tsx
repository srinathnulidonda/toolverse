// features\dev\base64-encoder\Base64Compare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { decodeBase64, detectMime, normalizeBase64, type EncodingOptions } from "./ts/utils";
import type { Mode } from "./ts/utils";
import { formatBytes } from "@/utils";
import styles from "./style/Base64Compare.module.css";

interface Base64CompareProps {
  mode: Mode;
  options: EncodingOptions;
}

export default function Base64Compare({ mode, options }: Base64CompareProps) {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");
  const [compareMode, setCompareMode] = useState<"visual" | "detailed">("visual");

  const leftDecoded = useMemo(() => {
    if (!leftInput.trim()) return null;
    return decodeBase64(leftInput, options);
  }, [leftInput, options]);

  const rightDecoded = useMemo(() => {
    if (!rightInput.trim()) return null;
    return decodeBase64(rightInput, options);
  }, [rightInput, options]);

  const comparison = useMemo(() => {
    if (!leftInput.trim() || !rightInput.trim()) return null;

    const leftNormalized = normalizeBase64(leftInput);
    const rightNormalized = normalizeBase64(rightInput);

    const identical = leftNormalized === rightNormalized;
    const leftBytes = new Blob([leftInput]).size;
    const rightBytes = new Blob([rightInput]).size;

    let similarity = 0;
    if (leftNormalized.length > 0 && rightNormalized.length > 0) {
      const maxLen = Math.max(leftNormalized.length, rightNormalized.length);
      let matches = 0;
      for (let i = 0; i < maxLen; i++) {
        if (leftNormalized[i] === rightNormalized[i]) matches++;
      }
      similarity = (matches / maxLen) * 100;
    }

    const leftMime = detectMime(leftInput);
    const rightMime = detectMime(rightInput);

    return {
      identical,
      similarity: Math.round(similarity),
      leftBytes,
      rightBytes,
      sizeDiff: rightBytes - leftBytes,
      leftMime,
      rightMime,
      sameType: leftMime?.mime === rightMime?.mime,
    };
  }, [leftInput, rightInput]);

  const handleSwap = useCallback(() => {
    const temp = leftInput;
    setLeftInput(rightInput);
    setRightInput(temp);
  }, [leftInput, rightInput]);

  const handleClear = useCallback(() => {
    setLeftInput("");
    setRightInput("");
  }, []);

  return (
    <div className={styles.root}>
      {/*  Comparison Controls  */}
      <div className={styles.controls}>
        <div className={styles.modeGroup}>
          <button
            type="button"
            className={`${styles.modeBtn} ${compareMode === "visual" ? styles.active : ""}`}
            onClick={() => setCompareMode("visual")}
          >
            <i className="ti ti-eye" />
            Visual
          </button>
          <button
            type="button"
            className={`${styles.modeBtn} ${compareMode === "detailed" ? styles.active : ""}`}
            onClick={() => setCompareMode("detailed")}
          >
            <i className="ti ti-chart-bar" />
            Detailed
          </button>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.btn}
            onClick={handleSwap}
            disabled={!leftInput || !rightInput}
          >
            <i className="ti ti-arrows-left-right" />
            Swap
          </button>
          <button
            type="button"
            className={styles.btn}
            onClick={handleClear}
            disabled={!leftInput && !rightInput}
          >
            <i className="ti ti-trash" />
            Clear
          </button>
        </div>
      </div>

      {/*  Comparison Result  */}
      {comparison && (
        <div className={styles.result}>
          {comparison.identical ? (
            <div className={`${styles.resultCard} ${styles.identical}`}>
              <div className={styles.resultIcon}>
                <i className="ti ti-checks" />
              </div>
              <div className={styles.resultContent}>
                <h3 className={styles.resultTitle}>Identical Match</h3>
                <p className={styles.resultDesc}>Both Base64 strings are exactly the same</p>
              </div>
            </div>
          ) : (
            <div className={`${styles.resultCard} ${styles.different}`}>
              <div className={styles.resultIcon}>
                <i className="ti ti-git-compare" />
              </div>
              <div className={styles.resultContent}>
                <h3 className={styles.resultTitle}>Different Strings</h3>
                <p className={styles.resultDesc}>{comparison.similarity}% similar</p>
              </div>
            </div>
          )}

          {compareMode === "detailed" && (
            <div className={styles.details}>
              <div className={styles.detailGrid}>
                <div className={styles.detailCard}>
                  <div className={styles.detailHeader}>
                    <i className="ti ti-file-text" />
                    <span>Similarity</span>
                  </div>
                  <div className={styles.detailValue}>{comparison.similarity}%</div>
                  <div className={styles.detailBar}>
                    <div
                      className={styles.detailBarFill}
                      style={{ width: `${comparison.similarity}%` }}
                    />
                  </div>
                </div>

                <div className={styles.detailCard}>
                  <div className={styles.detailHeader}>
                    <i className="ti ti-file-diff" />
                    <span>Size Difference</span>
                  </div>
                  <div className={styles.detailValue}>
                    {comparison.sizeDiff > 0 ? "+" : ""}
                    {formatBytes(Math.abs(comparison.sizeDiff))}
                  </div>
                  <div className={styles.detailLabel}>
                    {comparison.sizeDiff > 0
                      ? "Right is larger"
                      : comparison.sizeDiff < 0
                        ? "Left is larger"
                        : "Same size"}
                  </div>
                </div>

                {comparison.leftMime && comparison.rightMime && (
                  <div className={styles.detailCard}>
                    <div className={styles.detailHeader}>
                      <i className="ti ti-file-type" />
                      <span>File Type</span>
                    </div>
                    <div className={styles.detailValue}>
                      {comparison.sameType ? (
                        <span className={styles.match}>✓ Same</span>
                      ) : (
                        <span className={styles.diff}>✗ Different</span>
                      )}
                    </div>
                    <div className={styles.detailLabel}>
                      {comparison.leftMime.ext} vs {comparison.rightMime.ext}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/*  Side-by-Side Inputs  */}
      <div className={styles.inputs}>
        <div className={styles.inputPanel}>
          <div className={styles.inputHeader}>
            <div className={styles.inputLabel}>
              <i className="ti ti-arrow-left" />
              Left Side
            </div>
            {leftInput && (
              <div className={styles.inputMeta}>
                <span className={styles.metaSize}>{formatBytes(new Blob([leftInput]).size)}</span>
                {leftDecoded?.error && (
                  <span className={styles.metaError}>
                    <i className="ti ti-alert-circle" />
                    Invalid
                  </span>
                )}
                {!leftDecoded?.error && leftDecoded && (
                  <span className={styles.metaValid}>
                    <i className="ti ti-check" />
                    Valid
                  </span>
                )}
              </div>
            )}
          </div>
          <textarea
            className={styles.textarea}
            value={leftInput}
            onChange={(e) => setLeftInput(e.target.value)}
            placeholder="Paste first Base64 string..."
            spellCheck={false}
          />
          {leftDecoded?.error && (
            <div className={styles.inputError}>
              <i className="ti ti-alert-triangle" />
              {leftDecoded.error}
            </div>
          )}
        </div>

        <div className={styles.vs}>
          <div className={styles.vsIcon}>
            <span>VS</span>
          </div>
        </div>

        <div className={styles.inputPanel}>
          <div className={styles.inputHeader}>
            <div className={styles.inputLabel}>
              <i className="ti ti-arrow-right" />
              Right Side
            </div>
            {rightInput && (
              <div className={styles.inputMeta}>
                <span className={styles.metaSize}>{formatBytes(new Blob([rightInput]).size)}</span>
                {rightDecoded?.error && (
                  <span className={styles.metaError}>
                    <i className="ti ti-alert-circle" />
                    Invalid
                  </span>
                )}
                {!rightDecoded?.error && rightDecoded && (
                  <span className={styles.metaValid}>
                    <i className="ti ti-check" />
                    Valid
                  </span>
                )}
              </div>
            )}
          </div>
          <textarea
            className={styles.textarea}
            value={rightInput}
            onChange={(e) => setRightInput(e.target.value)}
            placeholder="Paste second Base64 string..."
            spellCheck={false}
          />
          {rightDecoded?.error && (
            <div className={styles.inputError}>
              <i className="ti ti-alert-triangle" />
              {rightDecoded.error}
            </div>
          )}
        </div>
      </div>

      {/*  Empty State  */}
      {!leftInput && !rightInput && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <i className="ti ti-git-compare" />
          </div>
          <p className={styles.emptyTitle}>Compare Base64 Strings</p>
          <p className={styles.emptyDesc}>
            Paste two Base64 strings above to compare their content, size, and type
          </p>
        </div>
      )}
    </div>
  );
}