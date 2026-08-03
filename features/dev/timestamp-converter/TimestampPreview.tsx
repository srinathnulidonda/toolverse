// features/dev/timestamp-converter/TimestampPreview.tsx
"use client";

import { useState, useCallback, useMemo } from "react";
import { getCodeSnippets, type ConversionResult, type TimestampOptions } from "./utils";

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
      <div className="tp-root">
        {/*  Mobile Tabs  */}
        <div className="tp-mobile-tabs">
          <button
            type="button"
            className={`tp-mobile-tab${mobileView === "input" ? " active" : ""}`}
            onClick={() => onMobileViewChange("input")}
            role="tab"
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            <span className="tp-tab-text">Input</span>
          </button>
          <button
            type="button"
            className={`tp-mobile-tab${mobileView === "output" ? " active" : ""}`}
            onClick={() => onMobileViewChange("output")}
            role="tab"
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-calendar" />
            <span className="tp-tab-text">Formats</span>
            {result && <span className="tp-mobile-dot" />}
          </button>
        </div>

        {/*  Panels  */}
        <div className="tp-panels">
          {/* Input Panel */}
          <div
            className={`tp-panel tp-panel-input${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="tp-panel-header">
              <div className="tp-panel-label">
                <i className="ti ti-pencil" />
                <span className="tp-label-text">Input</span>
              </div>
              <div className="tp-panel-meta">
                {options.unit && <span className="tp-unit-pill">{options.unit}</span>}
              </div>
            </div>
            <div className="tp-panel-body">
              <input
                type="text"
                className="tp-input"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Unix timestamp or date string..."
                spellCheck={false}
                aria-label="Timestamp input"
                aria-invalid={!!error}
              />

              {error && (
                <div className="tp-error-bar" role="alert">
                  <i className="ti ti-alert-circle" />
                  <span>{error}</span>
                </div>
              )}

              {!input && (
                <div className="tp-input-hints">
                  <div className="tp-hint-item">
                    <i className="ti ti-hash" />
                    <code>1704067200</code>
                    <span>Unix timestamp</span>
                  </div>
                  <div className="tp-hint-item">
                    <i className="ti ti-calendar" />
                    <code>2024-01-15</code>
                    <span>ISO date</span>
                  </div>
                  <div className="tp-hint-item">
                    <i className="ti ti-clock" />
                    <code>2024-01-15T10:30:00Z</code>
                    <span>ISO datetime</span>
                  </div>
                </div>
              )}

              {result && (
                <div className="tp-quick-info">
                  <div className="tp-quick-item">
                    <span className="tp-quick-label">Day of Week</span>
                    <span className="tp-quick-value">{result.components.weekday}</span>
                  </div>
                  <div className="tp-quick-item">
                    <span className="tp-quick-label">Month</span>
                    <span className="tp-quick-value">{result.components.monthName}</span>
                  </div>
                  <div className="tp-quick-item">
                    <span className="tp-quick-label">Timezone</span>
                    <span className="tp-quick-value">{options.timezone}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="tp-divider" aria-hidden="true">
            <div className="tp-divider-icon">
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`tp-panel tp-panel-output${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="tp-panel-header">
              <div className="tp-panel-label">
                <i className="ti ti-calendar" />
                <span className="tp-label-text">Date Formats</span>
              </div>
            </div>
            <div className="tp-panel-body">
              {!result ? (
                <div className="tp-empty">
                  <div className="tp-empty-icon">
                    <i className="ti ti-clock-edit" />
                  </div>
                  <p className="tp-empty-title">Formats appear here</p>
                  <p className="tp-empty-desc">Enter a timestamp on the left to see all formats</p>
                </div>
              ) : (
                <div className="tp-formats-content">
                  {/* Relative Time Highlight */}
                  <div className="tp-relative-card">
                    <i className="ti ti-history" />
                    <span className="tp-relative-text">{result.relative}</span>
                  </div>

                  {/* Formats List */}
                  <div className="tp-formats-list">
                    <div className="tp-format-item">
                      <div className="tp-format-label">
                        <i className="ti ti-hash" />
                        Unix (seconds)
                      </div>
                      <div className="tp-format-row">
                        <code className="tp-format-value">{result.unix}</code>
                        <button
                          className={`tp-copy-icon${copiedKey === "unix" ? " done" : ""}`}
                          onClick={() => copy(result.unix.toString(), "unix")}
                        >
                          <i className={`ti ${copiedKey === "unix" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="tp-format-item">
                      <div className="tp-format-label">
                        <i className="ti ti-hash" />
                        Unix (ms)
                      </div>
                      <div className="tp-format-row">
                        <code className="tp-format-value">{result.unixMs}</code>
                        <button
                          className={`tp-copy-icon${copiedKey === "unixMs" ? " done" : ""}`}
                          onClick={() => copy(result.unixMs.toString(), "unixMs")}
                        >
                          <i className={`ti ${copiedKey === "unixMs" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="tp-format-item">
                      <div className="tp-format-label">
                        <i className="ti ti-calendar-time" />
                        ISO 8601
                      </div>
                      <div className="tp-format-row">
                        <code className="tp-format-value">{result.iso}</code>
                        <button
                          className={`tp-copy-icon${copiedKey === "iso" ? " done" : ""}`}
                          onClick={() => copy(result.iso, "iso")}
                        >
                          <i className={`ti ${copiedKey === "iso" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="tp-format-item">
                      <div className="tp-format-label">
                        <i className="ti ti-world" />
                        UTC
                      </div>
                      <div className="tp-format-row">
                        <code className="tp-format-value">{result.utc}</code>
                        <button
                          className={`tp-copy-icon${copiedKey === "utc" ? " done" : ""}`}
                          onClick={() => copy(result.utc, "utc")}
                        >
                          <i className={`ti ${copiedKey === "utc" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="tp-format-item">
                      <div className="tp-format-label">
                        <i className="ti ti-map-pin" />
                        Local Time
                      </div>
                      <div className="tp-format-row">
                        <code className="tp-format-value">{result.local}</code>
                        <button
                          className={`tp-copy-icon${copiedKey === "local" ? " done" : ""}`}
                          onClick={() => copy(result.local, "local")}
                        >
                          <i className={`ti ${copiedKey === "local" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>

                    <div className="tp-format-item">
                      <div className="tp-format-label">
                        <i className="ti ti-calendar-event" />
                        Full Date
                      </div>
                      <div className="tp-format-row">
                        <code className="tp-format-value">{result.formatted.full}</code>
                        <button
                          className={`tp-copy-icon${copiedKey === "full" ? " done" : ""}`}
                          onClick={() => copy(result.formatted.full, "full")}
                        >
                          <i className={`ti ${copiedKey === "full" ? "ti-check" : "ti-copy"}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Code Snippets */}
                  <div className="tp-code-section">
                    <button
                      type="button"
                      className="tp-code-toggle"
                      onClick={() => setShowCodeSnippets(!showCodeSnippets)}
                    >
                      <i className={`ti ti-chevron-${showCodeSnippets ? "down" : "right"}`} />
                      <i className="ti ti-code" />
                      Code Snippets
                    </button>

                    {showCodeSnippets && codeSnippets && (
                      <div className="tp-code-content">
                        <div className="tp-lang-tabs">
                          {Object.keys(codeSnippets).map((lang) => (
                            <button
                              key={lang}
                              className={`tp-lang-tab${selectedLang === lang ? " active" : ""}`}
                              onClick={() => setSelectedLang(lang)}
                            >
                              {lang}
                            </button>
                          ))}
                        </div>
                        <div className="tp-code-block">
                          <pre className="tp-code-pre">{codeSnippets[selectedLang]}</pre>
                          <button
                            className={`tp-copy-icon tp-code-copy${copiedKey === "code" ? " done" : ""}`}
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
