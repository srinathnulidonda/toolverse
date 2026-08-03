// features/dev/url-encoder/UrlCompare.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { decodeUrl, normalizeUrl, parseUrl, type EncodingOptions } from "./utils";
import { formatBytes } from "@/utils";

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
      <div className="uc-root">
        {/*  Controls  */}
        <div className="uc-controls">
          <div className="uc-controls-label">
            <i className="ti ti-git-compare" />
            Compare URLs
          </div>
          <div className="uc-actions">
            <button
              type="button"
              className="uc-btn"
              onClick={handleSwap}
              disabled={!leftInput || !rightInput}
            >
              <i className="ti ti-arrows-left-right" />
              Swap
            </button>
            <button
              type="button"
              className="uc-btn"
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
          <div className="uc-result">
            <div className={`uc-result-card ${comparison.identical ? "identical" : "different"}`}>
              <div className="uc-result-icon">
                <i className={`ti ${comparison.identical ? "ti-checks" : "ti-git-compare"}`} />
              </div>
              <div className="uc-result-content">
                <h3 className="uc-result-title">
                  {comparison.identical ? "Identical Match" : "Different URLs"}
                </h3>
                <p className="uc-result-desc">
                  {comparison.identical
                    ? "Both URLs are exactly the same"
                    : `${comparison.similarity}% similar`}
                </p>
              </div>
            </div>

            {/* Detailed comparison */}
            <div className="uc-details">
              <div className="uc-detail-grid">
                <div className="uc-detail-card">
                  <div className="uc-detail-header">
                    <i className="ti ti-chart-bar" />
                    <span>Similarity</span>
                  </div>
                  <div className="uc-detail-value">{comparison.similarity}%</div>
                  <div className="uc-detail-bar">
                    <div
                      className="uc-detail-bar-fill"
                      style={{ width: `${comparison.similarity}%` }}
                    />
                  </div>
                </div>

                <div className="uc-detail-card">
                  <div className="uc-detail-header">
                    <i className="ti ti-file-diff" />
                    <span>Size Difference</span>
                  </div>
                  <div className="uc-detail-value">
                    {comparison.sizeDiff > 0 ? "+" : ""}
                    {formatBytes(Math.abs(comparison.sizeDiff))}
                  </div>
                  <div className="uc-detail-label">
                    {comparison.sizeDiff > 0
                      ? "Right is larger"
                      : comparison.sizeDiff < 0
                        ? "Left is larger"
                        : "Same size"}
                  </div>
                </div>

                <div className="uc-detail-card">
                  <div className="uc-detail-header">
                    <i className="ti ti-world" />
                    <span>Host</span>
                  </div>
                  <div className="uc-detail-value">
                    {comparison.sameHost ? (
                      <span className="uc-match">✓ Same</span>
                    ) : (
                      <span className="uc-diff">✗ Different</span>
                    )}
                  </div>
                  <div className="uc-detail-label">{comparison.leftParsed?.hostname || "N/A"}</div>
                </div>

                <div className="uc-detail-card">
                  <div className="uc-detail-header">
                    <i className="ti ti-route" />
                    <span>Path</span>
                  </div>
                  <div className="uc-detail-value">
                    {comparison.samePath ? (
                      <span className="uc-match">✓ Same</span>
                    ) : (
                      <span className="uc-diff">✗ Different</span>
                    )}
                  </div>
                  <div className="uc-detail-label">{comparison.leftParsed?.pathname || "/"}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/*  Side-by-Side Inputs  */}
        <div className="uc-inputs">
          <div className="uc-input-panel">
            <div className="uc-input-header">
              <div className="uc-input-label">
                <i className="ti ti-arrow-left" />
                Left Side
              </div>
              {leftInput && (
                <div className="uc-input-meta">
                  <span className="uc-meta-size">{formatBytes(new Blob([leftInput]).size)}</span>
                  {leftDecoded?.error && (
                    <span className="uc-meta-error">
                      <i className="ti ti-alert-circle" />
                      Invalid
                    </span>
                  )}
                  {!leftDecoded?.error && leftDecoded && (
                    <span className="uc-meta-valid">
                      <i className="ti ti-check" />
                      Valid
                    </span>
                  )}
                </div>
              )}
            </div>
            <textarea
              className="uc-textarea"
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder="Paste first URL..."
              spellCheck={false}
            />
            {leftDecoded?.error && (
              <div className="uc-input-error">
                <i className="ti ti-alert-triangle" />
                {leftDecoded.error}
              </div>
            )}
          </div>

          <div className="uc-vs">
            <div className="uc-vs-icon">
              <span>VS</span>
            </div>
          </div>

          <div className="uc-input-panel">
            <div className="uc-input-header">
              <div className="uc-input-label">
                <i className="ti ti-arrow-right" />
                Right Side
              </div>
              {rightInput && (
                <div className="uc-input-meta">
                  <span className="uc-meta-size">{formatBytes(new Blob([rightInput]).size)}</span>
                  {rightDecoded?.error && (
                    <span className="uc-meta-error">
                      <i className="ti ti-alert-circle" />
                      Invalid
                    </span>
                  )}
                  {!rightDecoded?.error && rightDecoded && (
                    <span className="uc-meta-valid">
                      <i className="ti ti-check" />
                      Valid
                    </span>
                  )}
                </div>
              )}
            </div>
            <textarea
              className="uc-textarea"
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder="Paste second URL..."
              spellCheck={false}
            />
            {rightDecoded?.error && (
              <div className="uc-input-error">
                <i className="ti ti-alert-triangle" />
                {rightDecoded.error}
              </div>
            )}
          </div>
        </div>

        {/*  Empty State  */}
        {!leftInput && !rightInput && (
          <div className="uc-empty">
            <div className="uc-empty-icon">
              <i className="ti ti-git-compare" />
            </div>
            <p className="uc-empty-title">Compare URLs</p>
            <p className="uc-empty-desc">
              Paste two URLs above to compare their content, structure, and encoding
            </p>
          </div>
        )}
      </div>
    </>
  );
}
