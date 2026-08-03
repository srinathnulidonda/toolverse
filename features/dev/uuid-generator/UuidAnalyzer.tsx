// features/dev/uuid-generator/UuidAnalyzer.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { analyzeUuid, validateUuid, formatUuid, formatTimestamp, type UuidAnalysis } from "./utils";

export default function UuidAnalyzer() {
  const [input, setInput] = useState("");
  const [analysis, setAnalysis] = useState<UuidAnalysis | null>(null);

  const handleAnalyze = useCallback(() => {
    if (!input.trim()) {
      setAnalysis(null);
      return;
    }
    const result = analyzeUuid(input.trim());
    setAnalysis(result);
  }, [input]);

  const validation = useMemo(() => {
    if (!input.trim()) return null;
    return validateUuid(input.trim());
  }, [input]);

  const handleClear = useCallback(() => {
    setInput("");
    setAnalysis(null);
  }, []);

  const loadSample = useCallback(() => {
    setInput("550e8400-e29b-41d4-a716-446655440000");
    setTimeout(() => {
      const result = analyzeUuid("550e8400-e29b-41d4-a716-446655440000");
      setAnalysis(result);
    }, 100);
  }, []);

  const getVersionBadgeColor = (version: number | null) => {
    if (!version) return "neutral";
    if (version === 4) return "brand";
    if (version === 7) return "success";
    if (version === 1 || version === 6) return "warning";
    return "info";
  };

  return (
    <>
      <div className="ua-root">
        {/*  Input Section  */}
        <div className="ua-input-section">
          <div className="ua-input-header">
            <div className="ua-input-label">
              <i className="ti ti-search" />
              UUID Input
            </div>
            <div className="ua-input-actions">
              <button type="button" className="ua-sample-btn" onClick={loadSample}>
                <i className="ti ti-wand" />
                Sample
              </button>
              <button
                type="button"
                className="ua-clear-btn"
                onClick={handleClear}
                disabled={!input}
              >
                <i className="ti ti-x" />
              </button>
            </div>
          </div>

          <textarea
            className="ua-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={handleAnalyze}
            placeholder="Paste a UUID to analyze...
Example: 550e8400-e29b-41d4-a716-446655440000"
            spellCheck={false}
            rows={3}
          />

          {validation && !validation.valid && (
            <div className="ua-error-bar">
              <i className="ti ti-alert-circle" />
              <span>{validation.error}</span>
            </div>
          )}
        </div>

        {/*  Analysis Results  */}
        {analysis && (
          <div className="ua-results">
            {/*  Validation Status  */}
            <div className={`ua-status-card ${analysis.isValid ? "valid" : "invalid"}`}>
              <div className="ua-status-icon">
                <i className={`ti ${analysis.isValid ? "ti-circle-check" : "ti-alert-triangle"}`} />
              </div>
              <div className="ua-status-content">
                <h3 className="ua-status-title">
                  {analysis.isValid ? "Valid UUID" : "Invalid UUID"}
                </h3>
                <p className="ua-status-desc">
                  {analysis.isValid
                    ? "This UUID conforms to RFC 4122 standard"
                    : analysis.errors.join(", ")}
                </p>
              </div>
            </div>

            {/*  Details Grid  */}
            {analysis.isValid && (
              <div className="ua-details">
                <div className="ua-details-header">
                  <i className="ti ti-info-circle" />
                  <span>UUID Details</span>
                </div>

                <div className="ua-details-grid">
                  <div className="ua-detail-card">
                    <div className="ua-detail-label">Version</div>
                    <div className="ua-detail-value">
                      <span
                        className={`ua-version-badge ${getVersionBadgeColor(analysis.version)}`}
                      >
                        {analysis.version ? `v${analysis.version}` : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className="ua-detail-card">
                    <div className="ua-detail-label">Variant</div>
                    <div className="ua-detail-value">{analysis.variant}</div>
                  </div>

                  <div className="ua-detail-card">
                    <div className="ua-detail-label">Format</div>
                    <div className="ua-detail-value ua-detail-mono">{analysis.format}</div>
                  </div>

                  {analysis.timestamp && (
                    <>
                      <div className="ua-detail-card ua-detail-wide">
                        <div className="ua-detail-label">
                          <i className="ti ti-clock" />
                          Timestamp
                        </div>
                        <div className="ua-detail-value ua-detail-mono">
                          {analysis.timestampDate}
                        </div>
                        <div className="ua-detail-sub">{formatTimestamp(analysis.timestamp)}</div>
                      </div>

                      <div className="ua-detail-card">
                        <div className="ua-detail-label">Unix Epoch</div>
                        <div className="ua-detail-value ua-detail-mono">
                          {Math.floor(analysis.timestamp)}
                        </div>
                      </div>
                    </>
                  )}

                  {analysis.clockSequence !== undefined && (
                    <div className="ua-detail-card">
                      <div className="ua-detail-label">Clock Sequence</div>
                      <div className="ua-detail-value ua-detail-mono">{analysis.clockSequence}</div>
                    </div>
                  )}

                  {analysis.node && (
                    <div className="ua-detail-card ua-detail-wide">
                      <div className="ua-detail-label">Node (MAC Address)</div>
                      <div className="ua-detail-value ua-detail-mono">{analysis.node}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/*  Format Conversions  */}
            {analysis.isValid && input.trim() && (
              <div className="ua-conversions">
                <div className="ua-conversions-header">
                  <i className="ti ti-transform" />
                  <span>Format Conversions</span>
                </div>

                <div className="ua-conversion-list">
                  {[
                    { label: "Standard", format: "standard" as const },
                    { label: "No Hyphens", format: "no-hyphens" as const },
                    { label: "Braces", format: "braces" as const },
                    { label: "URN", format: "urn" as const },
                    { label: "Base64", format: "base64" as const },
                    { label: "Hex", format: "hex" as const },
                  ].map(({ label, format }) => {
                    const converted = formatUuid(input.trim(), format, "lowercase");
                    return (
                      <div key={format} className="ua-conversion-item">
                        <div className="ua-conversion-label">{label}</div>
                        <div className="ua-conversion-value-row">
                          <code className="ua-conversion-value">{converted}</code>
                          <button
                            type="button"
                            className="ua-copy-icon"
                            onClick={async () => {
                              await navigator.clipboard.writeText(converted);
                            }}
                            title="Copy"
                          >
                            <i className="ti ti-copy" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/*  Empty State  */}
        {!input.trim() && !analysis && (
          <div className="ua-empty">
            <div className="ua-empty-icon">
              <i className="ti ti-scan" />
            </div>
            <p className="ua-empty-title">Analyze UUID</p>
            <p className="ua-empty-desc">
              Paste any UUID above to validate it, extract metadata, and convert between formats.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
