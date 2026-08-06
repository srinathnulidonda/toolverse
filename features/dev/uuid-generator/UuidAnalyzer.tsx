/* features/dev/uuid-generator/UuidAnalyzer.tsx */
"use client";

import { useState, useCallback, useMemo } from "react";
import { analyzeUuid, validateUuid, formatUuid, formatTimestamp, type UuidAnalysis } from "./ts/utils";
import styles from "./style/UuidAnalyzer.module.css";

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
      <div className={styles.uaRoot}>
        {/*  Input Section  */}
        <div className={styles.uaInputSection}>
          <div className={styles.uaInputHeader}>
            <div className={styles.uaInputLabel}>
              <i className="ti ti-search" />
              UUID Input
            </div>
            <div className={styles.uaInputActions}>
              <button type="button" className={styles.uaSampleBtn} onClick={loadSample}>
                <i className="ti ti-wand" />
                Sample
              </button>
              <button
                type="button"
                className={styles.uaClearBtn}
                onClick={handleClear}
                disabled={!input}
              >
                <i className="ti ti-x" />
              </button>
            </div>
          </div>

          <textarea
            className={styles.uaTextarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onBlur={handleAnalyze}
            placeholder="Paste a UUID to analyze...
Example: 550e8400-e29b-41d4-a716-446655440000"
            spellCheck={false}
            rows={3}
          />

          {validation && !validation.valid && (
            <div className={styles.uaErrorBar}>
              <i className="ti ti-alert-circle" />
              <span>{validation.error}</span>
            </div>
          )}
        </div>

        {/*  Analysis Results  */}
        {analysis && (
          <div className={styles.uaResults}>
            {/*  Validation Status  */}
            <div className={`${styles.uaStatusCard} ${analysis.isValid ? styles.valid : styles.invalid}`}>
              <div className={styles.uaStatusIcon}>
                <i className={`ti ${analysis.isValid ? "ti-circle-check" : "ti-alert-triangle"}`} />
              </div>
              <div className={styles.uaStatusContent}>
                <h3 className={styles.uaStatusTitle}>
                  {analysis.isValid ? "Valid UUID" : "Invalid UUID"}
                </h3>
                <p className={styles.uaStatusDesc}>
                  {analysis.isValid
                    ? "This UUID conforms to RFC 4122 standard"
                    : analysis.errors.join(", ")}
                </p>
              </div>
            </div>

            {/*  Details Grid  */}
            {analysis.isValid && (
              <div className={styles.uaDetails}>
                <div className={styles.uaDetailsHeader}>
                  <i className="ti ti-info-circle" />
                  <span>UUID Details</span>
                </div>

                <div className={styles.uaDetailsGrid}>
                  <div className={styles.uaDetailCard}>
                    <div className={styles.uaDetailLabel}>Version</div>
                    <div className={styles.uaDetailValue}>
                      <span
                        className={`${styles.uaVersionBadge} ${styles[getVersionBadgeColor(analysis.version)]}`}
                      >
                        {analysis.version ? `v${analysis.version}` : "Unknown"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.uaDetailCard}>
                    <div className={styles.uaDetailLabel}>Variant</div>
                    <div className={styles.uaDetailValue}>{analysis.variant}</div>
                  </div>

                  <div className={styles.uaDetailCard}>
                    <div className={styles.uaDetailLabel}>Format</div>
                    <div className={`${styles.uaDetailValue} ${styles.uaDetailMono}`}>{analysis.format}</div>
                  </div>

                  {analysis.timestamp && (
                    <>
                      <div className={`${styles.uaDetailCard} ${styles.uaDetailWide}`}>
                        <div className={styles.uaDetailLabel}>
                          <i className="ti ti-clock" />
                          Timestamp
                        </div>
                        <div className={`${styles.uaDetailValue} ${styles.uaDetailMono}`}>
                          {analysis.timestampDate}
                        </div>
                        <div className={styles.uaDetailSub}>{formatTimestamp(analysis.timestamp)}</div>
                      </div>

                      <div className={styles.uaDetailCard}>
                        <div className={styles.uaDetailLabel}>Unix Epoch</div>
                        <div className={`${styles.uaDetailValue} ${styles.uaDetailMono}`}>
                          {Math.floor(analysis.timestamp)}
                        </div>
                      </div>
                    </>
                  )}

                  {analysis.clockSequence !== undefined && (
                    <div className={styles.uaDetailCard}>
                      <div className={styles.uaDetailLabel}>Clock Sequence</div>
                      <div className={`${styles.uaDetailValue} ${styles.uaDetailMono}`}>{analysis.clockSequence}</div>
                    </div>
                  )}

                  {analysis.node && (
                    <div className={`${styles.uaDetailCard} ${styles.uaDetailWide}`}>
                      <div className={styles.uaDetailLabel}>Node (MAC Address)</div>
                      <div className={`${styles.uaDetailValue} ${styles.uaDetailMono}`}>{analysis.node}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/*  Format Conversions  */}
            {analysis.isValid && input.trim() && (
              <div className={styles.uaConversions}>
                <div className={styles.uaConversionsHeader}>
                  <i className="ti ti-transform" />
                  <span>Format Conversions</span>
                </div>

                <div className={styles.uaConversionList}>
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
                      <div key={format} className={styles.uaConversionItem}>
                        <div className={styles.uaConversionLabel}>{label}</div>
                        <div className={styles.uaConversionValueRow}>
                          <code className={styles.uaConversionValue}>{converted}</code>
                          <button
                            type="button"
                            className={styles.uaCopyIcon}
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
          <div className={styles.uaEmpty}>
            <div className={styles.uaEmptyIcon}>
              <i className="ti ti-scan" />
            </div>
            <p className={styles.uaEmptyTitle}>Analyze UUID</p>
            <p className={styles.uaEmptyDesc}>
              Paste any UUID above to validate it, extract metadata, and convert between formats.
            </p>
          </div>
        )}
      </div>
    </>
  );
}