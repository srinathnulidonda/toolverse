// features/dev/base64-encoder/Base64Compare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { decodeBase64, detectMime, normalizeBase64, type EncodingOptions } from "./utils";
import type { Mode } from "./utils";
import { formatBytes } from "@/utils";

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
    <>
      <div className="bc-root">
        {/*  Comparison Controls  */}
        <div className="bc-controls">
          <div className="bc-mode-group">
            <button
              type="button"
              className={`bc-mode-btn${compareMode === "visual" ? " active" : ""}`}
              onClick={() => setCompareMode("visual")}
            >
              <i className="ti ti-eye" />
              Visual
            </button>
            <button
              type="button"
              className={`bc-mode-btn${compareMode === "detailed" ? " active" : ""}`}
              onClick={() => setCompareMode("detailed")}
            >
              <i className="ti ti-chart-bar" />
              Detailed
            </button>
          </div>

          <div className="bc-actions">
            <button
              type="button"
              className="bc-btn"
              onClick={handleSwap}
              disabled={!leftInput || !rightInput}
            >
              <i className="ti ti-arrows-left-right" />
              Swap
            </button>
            <button
              type="button"
              className="bc-btn"
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
          <div className="bc-result">
            {comparison.identical ? (
              <div className="bc-result-card identical">
                <div className="bc-result-icon">
                  <i className="ti ti-checks" />
                </div>
                <div className="bc-result-content">
                  <h3 className="bc-result-title">Identical Match</h3>
                  <p className="bc-result-desc">Both Base64 strings are exactly the same</p>
                </div>
              </div>
            ) : (
              <div className="bc-result-card different">
                <div className="bc-result-icon">
                  <i className="ti ti-git-compare" />
                </div>
                <div className="bc-result-content">
                  <h3 className="bc-result-title">Different Strings</h3>
                  <p className="bc-result-desc">{comparison.similarity}% similar</p>
                </div>
              </div>
            )}

            {compareMode === "detailed" && (
              <div className="bc-details">
                <div className="bc-detail-grid">
                  <div className="bc-detail-card">
                    <div className="bc-detail-header">
                      <i className="ti ti-file-text" />
                      <span>Similarity</span>
                    </div>
                    <div className="bc-detail-value">{comparison.similarity}%</div>
                    <div className="bc-detail-bar">
                      <div
                        className="bc-detail-bar-fill"
                        style={{ width: `${comparison.similarity}%` }}
                      />
                    </div>
                  </div>

                  <div className="bc-detail-card">
                    <div className="bc-detail-header">
                      <i className="ti ti-file-diff" />
                      <span>Size Difference</span>
                    </div>
                    <div className="bc-detail-value">
                      {comparison.sizeDiff > 0 ? "+" : ""}
                      {formatBytes(Math.abs(comparison.sizeDiff))}
                    </div>
                    <div className="bc-detail-label">
                      {comparison.sizeDiff > 0
                        ? "Right is larger"
                        : comparison.sizeDiff < 0
                          ? "Left is larger"
                          : "Same size"}
                    </div>
                  </div>

                  {comparison.leftMime && comparison.rightMime && (
                    <div className="bc-detail-card">
                      <div className="bc-detail-header">
                        <i className="ti ti-file-type" />
                        <span>File Type</span>
                      </div>
                      <div className="bc-detail-value">
                        {comparison.sameType ? (
                          <span className="bc-match">✓ Same</span>
                        ) : (
                          <span className="bc-diff">✗ Different</span>
                        )}
                      </div>
                      <div className="bc-detail-label">
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
        <div className="bc-inputs">
          <div className="bc-input-panel">
            <div className="bc-input-header">
              <div className="bc-input-label">
                <i className="ti ti-arrow-left" />
                Left Side
              </div>
              {leftInput && (
                <div className="bc-input-meta">
                  <span className="bc-meta-size">{formatBytes(new Blob([leftInput]).size)}</span>
                  {leftDecoded?.error && (
                    <span className="bc-meta-error">
                      <i className="ti ti-alert-circle" />
                      Invalid
                    </span>
                  )}
                  {!leftDecoded?.error && leftDecoded && (
                    <span className="bc-meta-valid">
                      <i className="ti ti-check" />
                      Valid
                    </span>
                  )}
                </div>
              )}
            </div>
            <textarea
              className="bc-textarea"
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Paste first Base64 string..."
              spellCheck={false}
            />
            {leftDecoded?.error && (
              <div className="bc-input-error">
                <i className="ti ti-alert-triangle" />
                {leftDecoded.error}
              </div>
            )}
          </div>

          <div className="bc-vs">
            <div className="bc-vs-icon">
              <span>VS</span>
            </div>
          </div>

          <div className="bc-input-panel">
            <div className="bc-input-header">
              <div className="bc-input-label">
                <i className="ti ti-arrow-right" />
                Right Side
              </div>
              {rightInput && (
                <div className="bc-input-meta">
                  <span className="bc-meta-size">{formatBytes(new Blob([rightInput]).size)}</span>
                  {rightDecoded?.error && (
                    <span className="bc-meta-error">
                      <i className="ti ti-alert-circle" />
                      Invalid
                    </span>
                  )}
                  {!rightDecoded?.error && rightDecoded && (
                    <span className="bc-meta-valid">
                      <i className="ti ti-check" />
                      Valid
                    </span>
                  )}
                </div>
              )}
            </div>
            <textarea
              className="bc-textarea"
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Paste second Base64 string..."
              spellCheck={false}
            />
            {rightDecoded?.error && (
              <div className="bc-input-error">
                <i className="ti ti-alert-triangle" />
                {rightDecoded.error}
              </div>
            )}
          </div>
        </div>

        {/*  Empty State  */}
        {!leftInput && !rightInput && (
          <div className="bc-empty">
            <div className="bc-empty-icon">
              <i className="ti ti-git-compare" />
            </div>
            <p className="bc-empty-title">Compare Base64 Strings</p>
            <p className="bc-empty-desc">
              Paste two Base64 strings above to compare their content, size, and type
            </p>
          </div>
        )}
      </div>

    </>
  );
}
