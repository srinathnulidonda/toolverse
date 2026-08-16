// features/dev/url-encoder/UrlCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { decodeUrl, normalizeUrl, parseUrl, type EncodingOptions } from "./ts/utils";
import { formatBytes } from "@/utils";
import styles from "./style/UrlCompare.module.css";

interface UrlCompareProps {
  options: EncodingOptions;
}

export default function UrlCompare({ options }: UrlCompareProps) {
  const [leftInput, setLeftInput] = useState("");
  const [rightInput, setRightInput] = useState("");

  const leftDecoded = useMemo(() => {
    if (!leftInput.trim()) return null;
    return decodeUrl(leftInput, options);
  }, [leftInput, options]);

  const rightDecoded = useMemo(() => {
    if (!rightInput.trim()) return null;
    return decodeUrl(rightInput, options);
  }, [rightInput, options]);

  const comparison = useMemo(() => {
    if (!leftInput.trim() || !rightInput.trim()) return null;

    try {
      const leftNorm = normalizeUrl(leftInput);
      const rightNorm = normalizeUrl(rightInput);

      const identical = leftNorm === rightNorm;
      const leftBytes = new Blob([leftInput]).size;
      const rightBytes = new Blob([rightInput]).size;

      // Calculate similarity
      const maxLen = Math.max(leftInput.length, rightInput.length);
      let matches = 0;
      for (let i = 0; i < maxLen; i++) {
        if (leftInput[i] === rightInput[i]) matches++;
      }
      const similarity = maxLen > 0 ? (matches / maxLen) * 100 : 0;

      // Parse both URLs
      const leftParsed = parseUrl(leftInput);
      const rightParsed = parseUrl(rightInput);

      const sameHost = leftParsed?.hostname === rightParsed?.hostname;
      const samePath = leftParsed?.pathname === rightParsed?.pathname;
      const sameProtocol = leftParsed?.protocol === rightParsed?.protocol;

      return {
        identical,
        similarity: Math.round(similarity),
        leftBytes,
        rightBytes,
        sizeDiff: rightBytes - leftBytes,
        sameHost,
        samePath,
        sameProtocol,
        leftParsed,
        rightParsed,
      };
    } catch {
      return null;
    }
  }, [leftInput, rightInput, options]);

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
    <>
      <div className={styles.ucRoot}>
        {/*  Controls  */}
        <div className={styles.ucControls}>
          <div className={styles.ucControlsLabel}>
            <i className="ti ti-git-compare" />
            Compare URLs
          </div>
          <div className={styles.ucActions}>
            <button
              type="button"
              className={styles.ucBtn}
              onClick={handleSwap}
              disabled={!leftInput || !rightInput}
            >
              <i className="ti ti-arrows-left-right" />
              Swap
            </button>
            <button
              type="button"
              className={styles.ucBtn}
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
          <div className={styles.ucResult}>
            <div className={`${styles.ucResultCard} ${comparison.identical ? styles.identical : styles.different}`}>
              <div className={styles.ucResultIcon}>
                <i className={`ti ${comparison.identical ? "ti-checks" : "ti-git-compare"}`} />
              </div>
              <div className={styles.ucResultContent}>
                <h3 className={styles.ucResultTitle}>
                  {comparison.identical ? "Identical Match" : "Different URLs"}
                </h3>
                <p className={styles.ucResultDesc}>
                  {comparison.identical
                    ? "Both URLs are exactly the same"
                    : `${comparison.similarity}% similar`}
                </p>
              </div>
            </div>

            {/* Detailed comparison */}
            <div className={styles.ucDetails}>
              <div className={styles.ucDetailGrid}>
                <div className={styles.ucDetailCard}>
                  <div className={styles.ucDetailHeader}>
                    <i className="ti ti-chart-bar" />
                    <span>Similarity</span>
                  </div>
                  <div className={styles.ucDetailValue}>{comparison.similarity}%</div>
                  <div className={styles.ucDetailBar}>
                    <div
                      className={styles.ucDetailBarFill}
                      style={{ width: `${comparison.similarity}%` }}
                    />
                  </div>
                </div>

                <div className={styles.ucDetailCard}>
                  <div className={styles.ucDetailHeader}>
                    <i className="ti ti-file-diff" />
                    <span>Size Difference</span>
                  </div>
                  <div className={styles.ucDetailValue}>
                    {comparison.sizeDiff > 0 ? "+" : ""}
                    {formatBytes(Math.abs(comparison.sizeDiff))}
                  </div>
                  <div className={styles.ucDetailLabel}>
                    {comparison.sizeDiff > 0
                      ? "Right is larger"
                      : comparison.sizeDiff < 0
                        ? "Left is larger"
                        : "Same size"}
                  </div>
                </div>

                <div className={styles.ucDetailCard}>
                  <div className={styles.ucDetailHeader}>
                    <i className="ti ti-world" />
                    <span>Host</span>
                  </div>
                  <div className={styles.ucDetailValue}>
                    {comparison.sameHost ? (
                      <span className={styles.ucMatch}>✓ Same</span>
                    ) : (
                      <span className={styles.ucDiff}>✗ Different</span>
                    )}
                  </div>
                  <div className={styles.ucDetailLabel}>{comparison.leftParsed?.hostname || "N/A"}</div>
                </div>

                <div className={styles.ucDetailCard}>
                  <div className={styles.ucDetailHeader}>
                    <i className="ti ti-route" />
                    <span>Path</span>
                  </div>
                  <div className={styles.ucDetailValue}>
                    {comparison.samePath ? (
                      <span className={styles.ucMatch}>✓ Same</span>
                    ) : (
                      <span className={styles.ucDiff}>✗ Different</span>
                    )}
                  </div>
                  <div className={styles.ucDetailLabel}>{comparison.leftParsed?.pathname || "/"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*  Side-by-Side Inputs  */}
        <div className={styles.ucInputs}>
          <div className={styles.ucInputPanel}>
            <div className={styles.ucInputHeader}>
              <div className={styles.ucInputLabel}>
                <i className="ti ti-arrow-left" />
                Left Side
              </div>
              {leftInput && (
                <div className={styles.ucInputMeta}>
                  <span className={styles.ucMetaSize}>{formatBytes(new Blob([leftInput]).size)}</span>
                  {leftDecoded?.error && (
                    <span className={styles.ucMetaError}>
                      <i className="ti ti-alert-circle" />
                      Invalid
                    </span>
                  )}
                  {!leftDecoded?.error && leftDecoded && (
                    <span className={styles.ucMetaValid}>
                      <i className="ti ti-check" />
                      Valid
                    </span>
                  )}
                </div>
              )}
            </div>
            <textarea
              className={styles.ucTextarea}
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Paste first URL..."
              spellCheck={false}
            />
            {leftDecoded?.error && (
              <div className={styles.ucInputError}>
                <i className="ti ti-alert-triangle" />
                {leftDecoded.error}
              </div>
            )}
          </div>

          <div className={styles.ucVs}>
            <div className={styles.ucVsIcon}>
              <span>VS</span>
            </div>
          </div>

          <div className={styles.ucInputPanel}>
            <div className={styles.ucInputHeader}>
              <div className={styles.ucInputLabel}>
                <i className="ti ti-arrow-right" />
                Right Side
              </div>
              {rightInput && (
                <div className={styles.ucInputMeta}>
                  <span className={styles.ucMetaSize}>{formatBytes(new Blob([rightInput]).size)}</span>
                  {rightDecoded?.error && (
                    <span className={styles.ucMetaError}>
                      <i className="ti ti-alert-circle" />
                      Invalid
                    </span>
                  )}
                  {!rightDecoded?.error && rightDecoded && (
                    <span className={styles.ucMetaValid}>
                      <i className="ti ti-check" />
                      Valid
                    </span>
                  )}
                </div>
              )}
            </div>
            <textarea
              className={styles.ucTextarea}
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Paste second URL..."
              spellCheck={false}
            />
            {rightDecoded?.error && (
              <div className={styles.ucInputError}>
                <i className="ti ti-alert-triangle" />
                {rightDecoded.error}
              </div>
            )}
          </div>
        </div>

        {/*  Empty State  */}
        {!leftInput && !rightInput && (
          <div className={styles.ucEmpty}>
            <div className={styles.ucEmptyIcon}>
              <i className="ti ti-git-compare" />
            </div>
            <p className={styles.ucEmptyTitle}>Compare URLs</p>
            <p className={styles.ucEmptyDesc}>
              Paste two URLs above to compare their content, structure, and encoding
            </p>
          </div>
        )}
      </div>
    </>
  );
}