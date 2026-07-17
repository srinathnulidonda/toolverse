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

      <style jsx>{`
        .tp-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Mobile Tabs  */
        .tp-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .tp-mobile-tab {
          flex: 1;
          height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.12s;
        }

        .tp-mobile-tab.active {
          color: var(--text);
        }

        .tp-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .tp-mobile-dot {
          position: absolute;
          top: 8px;
          right: calc(50% - 40px);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        /*  Panels  */
        .tp-panels {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          min-height: 0;
          overflow: hidden;
        }

        .tp-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .tp-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 38px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-shrink: 0;
          gap: 8px;
        }

        .tp-panel-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .tp-panel-label i {
          font-size: 11px;
        }

        .tp-unit-pill {
          font-size: 10px;
          font-weight: 600;
          background: var(--brand-light);
          color: var(--brand-text);
          padding: 2px 7px;
          border-radius: 99px;
          text-transform: capitalize;
        }

        .tp-panel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: auto;
          padding: 16px;
          gap: 14px;
        }

        /*  Divider  */
        .tp-divider {
          width: 1px;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .tp-divider-icon {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 0.5px solid var(--border);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
        }

        /*  Input  */
        .tp-input {
          width: 100%;
          height: 44px;
          padding: 0 14px;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--tc-radius-md);
          font-family: var(--font-mono);
          font-size: 14px;
          color: var(--text);
          transition: border-color 0.12s;
        }

        .tp-input:focus {
          outline: none;
          border-color: var(--brand-border);
        }

        .tp-input::placeholder {
          color: var(--text-disabled);
        }

        .tp-input[aria-invalid="true"] {
          border-color: #f3d2d2;
        }

        /*  Error Bar  */
        .tp-error-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--error-bg);
          border-radius: var(--tc-radius-md);
          color: #b91c1c;
          font-size: 12px;
        }

        @media (prefers-color-scheme: dark) {
          .tp-error-bar {
            color: #f87171;
          }
        }

        .tp-error-bar i {
          font-size: 14px;
          flex-shrink: 0;
        }

        /*  Input Hints  */
        .tp-input-hints {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tp-hint-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border-faint);
        }

        .tp-hint-item i {
          font-size: 14px;
          color: var(--text-tertiary);
          flex-shrink: 0;
        }

        .tp-hint-item code {
          font-size: 11.5px;
          color: var(--brand);
          background: transparent;
          border: none;
          padding: 0;
        }

        .tp-hint-item span {
          font-size: 11px;
          color: var(--text-tertiary);
          margin-left: auto;
        }

        /*  Quick Info  */
        .tp-quick-info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
          background: var(--bg-surface);
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
        }

        .tp-quick-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .tp-quick-label {
          font-size: 11px;
          color: var(--text-tertiary);
          font-weight: 500;
        }

        .tp-quick-value {
          font-size: 12px;
          color: var(--text);
          font-weight: 600;
        }

        /*  Empty State  */
        .tp-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 40px 24px;
          text-align: center;
        }

        .tp-empty-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: var(--bg-surface);
          border: 0.5px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          color: var(--text-disabled);
          margin-bottom: 4px;
        }

        .tp-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .tp-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 260px;
          line-height: 1.5;
        }

        /*  Formats Content  */
        .tp-formats-content {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .tp-relative-card {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: var(--brand-light);
          border: 0.5px solid var(--brand-border);
          border-radius: var(--tc-radius-lg);
        }

        .tp-relative-card i {
          font-size: 20px;
          color: var(--brand);
        }

        .tp-relative-text {
          font-size: 15px;
          font-weight: 600;
          color: var(--brand-text);
        }

        .tp-formats-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tp-format-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 10px 12px;
          background: var(--bg-surface);
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border-faint);
          transition: border-color 0.12s;
        }

        .tp-format-item:hover {
          border-color: var(--brand-border);
        }

        .tp-format-label {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .tp-format-label i {
          font-size: 12px;
          color: var(--brand);
        }

        .tp-format-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .tp-format-value {
          flex: 1;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text);
          background: transparent;
          border: none;
          padding: 0;
          word-break: break-all;
        }

        .tp-copy-icon {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.12s;
          flex-shrink: 0;
        }

        .tp-copy-icon:hover {
          background: var(--bg-surface);
          color: var(--brand);
        }

        .tp-copy-icon.done {
          background: var(--brand-light);
          color: var(--brand);
          border-color: var(--brand-border);
        }

        /*  Code Section  */
        .tp-code-section {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding-top: 10px;
          border-top: 0.5px solid var(--border-faint);
        }

        .tp-code-toggle {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 32px;
          padding: 0 12px;
          border-radius: var(--tc-radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.12s;
          width: fit-content;
        }

        .tp-code-toggle:hover {
          background: var(--bg-surface);
          color: var(--text);
        }

        .tp-code-toggle i {
          font-size: 13px;
        }

        .tp-code-content {
          display: flex;
          flex-direction: column;
          gap: 0;
          border: 0.5px solid var(--border);
          border-radius: var(--tc-radius-md);
          overflow: hidden;
        }

        .tp-lang-tabs {
          display: flex;
          overflow-x: auto;
          background: var(--bg-surface);
          border-bottom: 0.5px solid var(--border);
          -webkit-overflow-scrolling: touch;
        }

        .tp-lang-tab {
          padding: 8px 12px;
          border: none;
          background: transparent;
          color: var(--text-tertiary);
          font-size: 11px;
          font-weight: 500;
          cursor: pointer;
          white-space: nowrap;
          text-transform: capitalize;
          transition: color 0.12s;
          flex-shrink: 0;
        }

        .tp-lang-tab:hover {
          color: var(--text);
        }

        .tp-lang-tab.active {
          color: var(--brand);
          background: var(--bg-card);
        }

        .tp-code-block {
          position: relative;
          background: var(--bg-card);
        }

        .tp-code-pre {
          margin: 0;
          padding: 14px;
          font-family: var(--font-mono);
          font-size: 12px;
          color: var(--text);
          overflow-x: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        .tp-code-copy {
          position: absolute;
          top: 8px;
          right: 8px;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .tp-mobile-tabs {
            display: flex;
          }

          .tp-panels {
            display: block;
          }

          .tp-divider {
            display: none;
          }

          .tp-panel {
            min-height: 400px;
          }

          .tp-panel.mobile-hidden {
            display: none;
          }

          .tp-panel.mobile-visible {
            display: flex;
          }

          .tp-panel-body {
            padding: 12px;
          }

          .tp-format-item {
            padding: 10px;
          }

          .tp-format-value {
            font-size: 11px;
          }

          .tp-relative-text {
            font-size: 14px;
          }
        }

        @media (max-width: 480px) {
          .tp-label-text {
            display: none;
          }

          .tp-format-row {
            flex-wrap: wrap;
          }

          .tp-format-value {
            width: 100%;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tp-mobile-tab,
          .tp-copy-icon,
          .tp-code-toggle,
          .tp-lang-tab {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
