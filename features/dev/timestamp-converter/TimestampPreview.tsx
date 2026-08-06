// features/dev/timestamp-converter/TimestampPreview.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { getCodeSnippets, type ConversionResult, type TimestampOptions } from "./ts/utils";
import styles from "./style/TimestampPreview.module.css";

interface TimestampPreviewProps {
  input: string;
  result: ConversionResult | null;
  options: TimestampOptions;
  error: string | null;
  mobileView: "input" | "output";
  onInputChange: (value: string) => void;
  onMobileViewChange: (view: "input" | "output") => void;
}

export default function TimestampPreview({
  input,
  result,
  options,
  error,
  mobileView,
  onInputChange,
  onMobileViewChange,
}: TimestampPreviewProps) {
  const [copiedKey, setCopiedKey] = useState("");
  const [showCodeSnippets, setShowCodeSnippets] = useState(false);
  const [selectedLang, setSelectedLang] = useState("javascript");

  const copy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      /* silent */
    }
  }, []);

  const codeSnippets = useMemo(() => {
    if (!result) return null;
    return getCodeSnippets(result.unix);
  }, [result]);

  return (
    <>
      <div className={styles.tpRoot}>
        {/*  Mobile Tabs  */}
        <div className={styles.tpMobileTabs}>
          <button
            type="button"
            className={`${styles.tpMobileTab}${mobileView === "input" ? ` ${styles.active}` : ""}`}
            onClick={() => onMobileViewChange("input")}
            role="tab"
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            <span className={styles.tpTabText}>Input</span>
          </button>
          <button
            type="button"
            className={`${styles.tpMobileTab}${mobileView === "output" ? ` ${styles.active}` : ""}`}
            onClick={() => onMobileViewChange("output")}
            role="tab"
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-calendar" />
            <span className={styles.tpTabText}>Formats</span>
            {result && <span className={styles.tpMobileDot} />}
          </button>
        </div>

        {/*  Panels  */}
        <div className={styles.tpPanels}>
          {/* Input Panel */}
          <div
            className={`${styles.tpPanel} ${styles.tpPanelInput}${mobileView === "input" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            <div className={styles.tpPanelHeader}>
              <div className={styles.tpPanelLabel}>
                <i className="ti ti-pencil" />
                <span className={styles.tpLabelText}>Input</span>
              </div>
              <div className={styles.tpPanelMeta}>
                {options.unit && <span className={styles.tpUnitPill}>{options.unit}</span>}
              </div>
            </div>
            <div className={styles.tpPanelBody}>
              <input
                type="text"
                className={styles.tpInput}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Unix timestamp or date string..."
                spellCheck={false}
                aria-label="Timestamp input"
                aria-invalid={!!error}
              />

              {error && (
                <div className={styles.tpErrorBar} role="alert">
                  <i className="ti ti-alert-circle" />
                  <span>{error}</span>
                </div>
              )}

              {!input && (
                <div className={styles.tpInputHints}>
                  <div className={styles.tpHintItem}>
                    <i className="ti ti-hash" />
                    <code>1704067200</code>
                    <span>Unix timestamp</span>
                  </div>
                  <div className={styles.tpHintItem}>
                    <i className="ti ti-calendar" />
                    <code>2024-01-15</code>
                    <span>ISO date</span>
                  </div>
                  <div className={styles.tpHintItem}>
                    <i className="ti ti-clock" />
                    <code>2024-01-15T10:30:00Z</code>
                    <span>ISO datetime</span>
                  </div>
                </div>
              )}

              {result && (
                <div className={styles.tpQuickInfo}>
                  <div className={styles.tpQuickItem}>
                    <span className={styles.tpQuickLabel}>Day of Week</span>
                    <span className={styles.tpQuickValue}>{result.components.weekday}</span>
                  </div>
                  <div className={styles.tpQuickItem}>
                    <span className={styles.tpQuickLabel}>Month</span>
                    <span className={styles.tpQuickValue}>{result.components.monthName}</span>
                  </div>
                  <div className={styles.tpQuickItem}>
                    <span className={styles.tpQuickLabel}>Timezone</span>
                    <span className={styles.tpQuickValue}>{options.timezone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className={styles.tpDivider} aria-hidden="true">
            <div className={styles.tpDividerIcon}>
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`${styles.tpPanel} ${styles.tpPanelOutput}${mobileView === "output" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            <div className={styles.tpPanelHeader}>
              <div className={styles.tpPanelLabel}>
                <i className="ti ti-calendar" />
                <span className={styles.tpLabelText}>Date Formats</span>
              </div>
            </div>
            <div className={styles.tpPanelBody}>
              {!result ? (
                <div className={styles.tpEmpty}>
                  <div className={styles.tpEmptyIcon}>
                    <i className="ti ti-clock-edit" />
                  </div>
                  <p className={styles.tpEmptyTitle}>Formats appear here</p>
                  <p className={styles.tpEmptyDesc}>Enter a timestamp on the left to see all formats</p>
                </div>
              ) : (
                <div className={styles.tpFormatsContent}>
                  {/* Relative Time Highlight */}
                  <div className={styles.tpRelativeCard}>
                    <i className="ti ti-history" />
                    <span className={styles.tpRelativeText}>{result.relative}</span>
                  </div>

                  {/* Formats List */}
                  <div className={styles.tpFormatsList}>
                    <div className={styles.tpFormatItem}>
                      <div className={styles.tpFormatLabel}>
                        <i className="ti ti-hash" />
                        Unix (seconds)
                      </div>
                      <div className={styles.tpFormatRow}>
                        <code className={styles.tpFormatValue}>{result.unix}</code>
                        <button
                          className={`${styles.tpCopyIcon}${copiedKey === "unix" ? ` ${styles.done}` : ""}`}
                          onClick={() => copy(result.unix.toString(), "unix")}
                        >
                          <i className={`ti ${copiedKey === "unix" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.tpFormatItem}>
                      <div className={styles.tpFormatLabel}>
                        <i className="ti ti-hash" />
                        Unix (ms)
                      </div>
                      <div className={styles.tpFormatRow}>
                        <code className={styles.tpFormatValue}>{result.unixMs}</code>
                        <button
                          className={`${styles.tpCopyIcon}${copiedKey === "unixMs" ? ` ${styles.done}` : ""}`}
                          onClick={() => copy(result.unixMs.toString(), "unixMs")}
                        >
                          <i className={`ti ${copiedKey === "unixMs" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.tpFormatItem}>
                      <div className={styles.tpFormatLabel}>
                        <i className="ti ti-calendar-time" />
                        ISO 8601
                      </div>
                      <div className={styles.tpFormatRow}>
                        <code className={styles.tpFormatValue}>{result.iso}</code>
                        <button
                          className={`${styles.tpCopyIcon}${copiedKey === "iso" ? ` ${styles.done}` : ""}`}
                          onClick={() => copy(result.iso, "iso")}
                        >
                          <i className={`ti ${copiedKey === "iso" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.tpFormatItem}>
                      <div className={styles.tpFormatLabel}>
                        <i className="ti ti-world" />
                        UTC
                      </div>
                      <div className={styles.tpFormatRow}>
                        <code className={styles.tpFormatValue}>{result.utc}</code>
                        <button
                          className={`${styles.tpCopyIcon}${copiedKey === "utc" ? ` ${styles.done}` : ""}`}
                          onClick={() => copy(result.utc, "utc")}
                        >
                          <i className={`ti ${copiedKey === "utc" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.tpFormatItem}>
                      <div className={styles.tpFormatLabel}>
                        <i className="ti ti-map-pin" />
                        Local Time
                      </div>
                      <div className={styles.tpFormatRow}>
                        <code className={styles.tpFormatValue}>{result.local}</code>
                        <button
                          className={`${styles.tpCopyIcon}${copiedKey === "local" ? ` ${styles.done}` : ""}`}
                          onClick={() => copy(result.local, "local")}
                        >
                          <i className={`ti ${copiedKey === "local" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.tpFormatItem}>
                      <div className={styles.tpFormatLabel}>
                        <i className="ti ti-calendar-event" />
                        Full Date
                      </div>
                      <div className={styles.tpFormatRow}>
                        <code className={styles.tpFormatValue}>{result.formatted.full}</code>
                        <button
                          className={`${styles.tpCopyIcon}${copiedKey === "full" ? ` ${styles.done}` : ""}`}
                          onClick={() => copy(result.formatted.full, "full")}
                        >
                          <i className={`ti ${copiedKey === "full" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Code Snippets */}
                  <div className={styles.tpCodeSection}>
                    <button
                      type="button"
                      className={styles.tpCodeToggle}
                      onClick={() => setShowCodeSnippets(!showCodeSnippets)}
                    >
                      <i className={`ti ti-chevron-${showCodeSnippets ? "down" : "right"}`} />
                      <i className="ti ti-code" />
                      Code Snippets
                    </button>

                    {showCodeSnippets && codeSnippets && (
                      <div className={styles.tpCodeContent}>
                        <div className={styles.tpLangTabs}>
                          {Object.keys(codeSnippets).map((lang) => (
                            <button
                              key={lang}
                              className={`${styles.tpLangTab}${selectedLang === lang ? ` ${styles.active}` : ""}`}
                              onClick={() => setSelectedLang(lang)}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                        <div className={styles.tpCodeBlock}>
                          <pre className={styles.tpCodePre}>{codeSnippets[selectedLang]}</pre>
                          <button
                            className={`${styles.tpCopyIcon} ${styles.tpCodeCopy}${copiedKey === "code" ? ` ${styles.done}` : ""}`}
                            onClick={() => copy(codeSnippets[selectedLang], "code")}
                          >
                            <i className={`ti ${copiedKey === "code" ? "ti-check" : "ti-copy"}`} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}