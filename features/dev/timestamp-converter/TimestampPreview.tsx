// features/dev/timestamp-converter/TimestampPreview.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useCallback, useMemo } from "react";
import { getCodeSnippets, type ConversionResult, type TimestampOptions } from "./ts/utils";
import styles from "./style/TimestampPreview.module.css";

interface SamplePreset {
  id: string;
  label: string;
  description?: string;
  getValue: () => number;
}

interface TimestampPreviewProps {
  input: string;
  result: ConversionResult | null;
  options: TimestampOptions;
  error: string | null;
  mobileView: "input" | "output";
  samples: SamplePreset[];
  onInputChange: (value: string) => void;
  onMobileViewChange: (view: "input" | "output") => void;
  onLoadSample: (sample: SamplePreset) => void;
}

const INPUT_HINTS = [
  { icon: "ti-hash", value: "1704067200", label: "Unix timestamp" },
  { icon: "ti-calendar", value: "2024-01-15", label: "ISO date" },
  { icon: "ti-clock", value: "2024-01-15T10:30:00Z", label: "ISO datetime" },
];

export default function TimestampPreview({
  input,
  result,
  options,
  error,
  mobileView,
  samples,
  onInputChange,
  onMobileViewChange,
  onLoadSample,
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
      logger.error("Failed to copy to clipboard");
    }
  }, []);

  const codeSnippets = useMemo(() => {
    if (!result) return null;
    return getCodeSnippets(result.unix);
  }, [result]);

  const allFormatsText = useMemo(() => {
    if (!result) return "";
    return [
      `Unix (seconds): ${result.unix}`,
      `Unix (ms): ${result.unixMs}`,
      `ISO 8601: ${result.iso}`,
      `UTC: ${result.utc}`,
      `Local: ${result.local}`,
      `Full Date: ${result.formatted.full}`,
      `Relative: ${result.relative}`,
    ].join("\n");
  }, [result]);

  const handleCopyAllFormats = useCallback(async () => {
    if (!allFormatsText) return;
    try {
      await navigator.clipboard.writeText(allFormatsText);
      setCopiedKey("all");
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      logger.error("Failed to copy formats to clipboard");
    }
  }, [allFormatsText]);

  const handleDownloadAllFormats = useCallback(() => {
    if (!allFormatsText) return;
    const blob = new Blob([allFormatsText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timestamp_${result?.unix ?? Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [allFormatsText, result]);

  const goToOutput = useCallback(() => onMobileViewChange("output"), [onMobileViewChange]);

  return (
    <div className={styles.tpRoot}>
      {samples.length > 0 && (
        <div className={styles.tpToolbar}>
          <div className={styles.tpToolbarLeft}>
            <span className={styles.tpToolbarLabel}>Quick:</span>
            {samples.map((sample) => (
              <button
                key={sample.id}
                type="button"
                className={styles.tpSampleBtn}
                onClick={() => onLoadSample(sample)}
                title={sample.description}
              >
                {sample.label}
              </button>
            ))}
          </div>
          {result && (
            <div className={styles.tpToolbarRight}>
              <span className={styles.tpUnitPill}>{options.unit}</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.tpMobileSwitcher}>
        <button
          type="button"
          className={`${styles.tpSwTab}${mobileView === "input" ? ` ${styles.active}` : ""}`}
          onClick={() => onMobileViewChange("input")}
          role="tab"
          aria-selected={mobileView === "input"}
        >
          <i className="ti ti-pencil" />
          Input
        </button>
        <div className={styles.tpSwDivider} />
        <button
          type="button"
          className={`${styles.tpSwTab}${mobileView === "output" ? ` ${styles.active}` : ""}`}
          onClick={goToOutput}
          role="tab"
          aria-selected={mobileView === "output"}
        >
          <i className="ti ti-calendar" />
          Formats
          {result && mobileView !== "output" && <span className={styles.tpSwDot} />}
        </button>
      </div>

      <div className={styles.tpBody}>
        <div className={`${styles.tpPanel}${mobileView === "input" ? ` ${styles.mobVisible}` : ` ${styles.mobHidden}`}`}>
          <div className={styles.tpPanelBar}>
            <div className={styles.tpPanelLabel}>
              <i className="ti ti-pencil" />
              Input
            </div>
            <div className={styles.tpPanelActions}>
              {options.unit && <span className={styles.tpUnitPill}>{options.unit}</span>}
              {input && error && (
                <span className={styles.tpErrorBadge}>
                  <i className="ti ti-alert-circle" /> Invalid
                </span>
              )}
              {input && !error && result && (
                <span className={styles.tpValidBadge}>
                  <i className="ti ti-check" /> Valid
                </span>
              )}
              <button
                type="button"
                className={styles.tpIconBtn}
                onClick={() => onInputChange("")}
                disabled={!input}
                title="Clear"
                aria-label="Clear input"
              >
                <i className="ti ti-x" />
              </button>
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
                {INPUT_HINTS.map((hint) => (
                  <button
                    key={hint.value}
                    type="button"
                    className={styles.tpHintItem}
                    onClick={() => onInputChange(hint.value)}
                  >
                    <i className={`ti ${hint.icon}`} />
                    <code>{hint.value}</code>
                    <span>{hint.label}</span>
                  </button>
                ))}
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

            {result && (
              <div className={styles.tpMobCta}>
                <button type="button" className={styles.tpCtaBtn} onClick={goToOutput}>
                  <i className="ti ti-calendar" />
                  View All Formats
                  <i className="ti ti-chevron-right" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.tpGutter} aria-hidden="true">
          <div className={styles.tpGutterLine} />
          <div className={styles.tpGutterNode}>
            <i className="ti ti-arrow-right" />
          </div>
          <div className={styles.tpGutterLine} />
        </div>

        <div className={`${styles.tpPanel}${mobileView === "output" ? ` ${styles.mobVisible}` : ` ${styles.mobHidden}`}`}>
          <div className={styles.tpPanelBar}>
            <div className={styles.tpPanelLabel}>
              <i className="ti ti-calendar" />
              Date Formats
            </div>
            {result && (
              <div className={styles.tpPanelActions}>
                <button
                  type="button"
                  className={styles.tpIconBtn}
                  onClick={handleCopyAllFormats}
                  title="Copy all formats"
                  aria-label="Copy all formats"
                >
                  <i className={`ti ${copiedKey === "all" ? "ti-check" : "ti-copy"}`} />
                </button>
                <button
                  type="button"
                  className={styles.tpIconBtn}
                  onClick={handleDownloadAllFormats}
                  title="Export as .txt"
                  aria-label="Export all formats as text file"
                >
                  <i className="ti ti-download" />
                </button>
              </div>
            )}
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
                <div className={styles.tpRelativeCard}>
                  <i className="ti ti-history" />
                  <span className={styles.tpRelativeText}>{result.relative}</span>
                </div>

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
                        aria-label="Copy unix seconds"
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
                        aria-label="Copy unix milliseconds"
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
                        aria-label="Copy ISO 8601"
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
                        aria-label="Copy UTC"
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
                        aria-label="Copy local time"
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
                        aria-label="Copy full date"
                      >
                        <i className={`ti ${copiedKey === "full" ? "ti-check" : "ti-copy"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.tpCodeSection}>
                  <button
                    type="button"
                    className={styles.tpCodeToggle}
                    onClick={() => setShowCodeSnippets((s) => !s)}
                    aria-expanded={showCodeSnippets}
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
                            type="button"
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
                          aria-label="Copy code snippet"
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
  );
}