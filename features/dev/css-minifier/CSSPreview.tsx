// features/dev/css-minifier/CSSPreview.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { processCSS, SAMPLE_CSS } from "./utils";
import { formatBytes } from "@/utils";
import type { MinifyOptions } from "./utils";

interface CSSPreviewProps {
  onProcess?: (entry: any) => void;
}

export default function CSSPreview({ onProcess }: CSSPreviewProps) {
  const [input, setInput] = useState("");
  const [options, setOptions] = useState<MinifyOptions>({
    removeComments: true,
    removeWhitespace: true,
    removeLastSemicolon: true,
    preserveImportant: true,
  });
  const [copiedKey, setCopiedKey] = useState("");
  const [mobileView, setMobileView] = useState<"input" | "output">("input");

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return processCSS(input, options);
    } catch {
      return null;
    }
  }, [input, options]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 1500);
  }, []);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.css";
    a.click();
    URL.revokeObjectURL(url);

    if (onProcess) {
      onProcess({
        id: Date.now().toString(),
        input: input.substring(0, 100),
        output: result.output.substring(0, 100),
        timestamp: Date.now(),
        stats: result.stats,
      });
    }
  }, [result, input, onProcess]);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_CSS);
    setMobileView("input");
  }, []);

  return (
    <>
      <div className="cp-root">
        {/*  Options Bar  */}
        <div className="cp-options">
          <div className="cp-options-label">Options:</div>
          <label className="cp-toggle">
            <input
              type="checkbox"
              checked={options.removeComments}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, removeComments: e.target.checked }))
              }
            />
            <span className="cp-toggle-track">
              <span className="cp-toggle-thumb" />
            </span>
            <span className="cp-toggle-label">Remove comments</span>
          </label>

          <label className="cp-toggle">
            <input
              type="checkbox"
              checked={options.preserveImportant}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, preserveImportant: e.target.checked }))
              }
              disabled={!options.removeComments}
            />
            <span className="cp-toggle-track">
              <span className="cp-toggle-thumb" />
            </span>
            <span className="cp-toggle-label">Preserve /*! */</span>
          </label>

          <label className="cp-toggle">
            <input
              type="checkbox"
              checked={options.removeLastSemicolon}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, removeLastSemicolon: e.target.checked }))
              }
            />
            <span className="cp-toggle-track">
              <span className="cp-toggle-thumb" />
            </span>
            <span className="cp-toggle-label">Remove last semicolon</span>
          </label>

          <button type="button" className="cp-sample-btn" onClick={loadSample}>
            <i className="ti ti-wand" />
            Sample
          </button>
        </div>

        {/*  Mobile Tabs  */}
        <div className="cp-mobile-tabs">
          <button
            type="button"
            className={`cp-mobile-tab${mobileView === "input" ? " active" : ""}`}
            onClick={() => setMobileView("input")}
          >
            <i className="ti ti-file-code" />
            Input
          </button>
          <button
            type="button"
            className={`cp-mobile-tab${mobileView === "output" ? " active" : ""}`}
            onClick={() => setMobileView("output")}
          >
            <i className="ti ti-file-zip" />
            Output
            {result && <span className="cp-mobile-dot" />}
          </button>
        </div>

        {/*  Panels  */}
        <div className="cp-panels">
          {/* Input */}
          <div
            className={`cp-panel${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="cp-panel-header">
              <div className="cp-panel-label">
                <i className="ti ti-file-code" />
                Original CSS
              </div>
              {input && (
                <button className="cp-clear-btn" onClick={() => setInput("")} title="Clear">
                  <i className="ti ti-x" />
                </button>
              )}
            </div>
            <textarea
              className="cp-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your CSS here..."
              spellCheck={false}
            />
          </div>

          {/* Divider */}
          <div className="cp-divider">
            <div className="cp-divider-icon">
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output */}
          <div
            className={`cp-panel${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="cp-panel-header">
              <div className="cp-panel-label">
                <i className="ti ti-file-zip" />
                Minified CSS
              </div>
              {result && (
                <div className="cp-panel-actions">
                  <button
                    className={`cp-copy-btn${copiedKey === "output" ? " copied" : ""}`}
                    onClick={() => handleCopy(result.output, "output")}
                  >
                    <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                    {copiedKey === "output" ? "Copied" : "Copy"}
                  </button>
                  <button className="cp-download-btn" onClick={handleDownload}>
                    <i className="ti ti-download" />
                    Download
                  </button>
                </div>
              )}
            </div>

            {result ? (
              <>
                <pre className="cp-output">{result.output}</pre>
                <div className="cp-stats">
                  <div className="cp-stat">
                    <span className="cp-stat-label">Original:</span>
                    <span className="cp-stat-value">{formatBytes(result.stats.original)}</span>
                  </div>
                  <div className="cp-stat">
                    <span className="cp-stat-label">Minified:</span>
                    <span className="cp-stat-value">{formatBytes(result.stats.minified)}</span>
                  </div>
                  <div className="cp-stat cp-stat-success">
                    <span className="cp-stat-label">Saved:</span>
                    <span className="cp-stat-value">
                      {formatBytes(result.stats.savings)} ({result.stats.savingsPercent}%)
                    </span>
                  </div>
                  <div className="cp-stat">
                    <span className="cp-stat-label">Rules:</span>
                    <span className="cp-stat-value">{result.stats.rules}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="cp-empty">
                <div className="cp-empty-icon">
                  <i className="ti ti-brand-css3" />
                </div>
                <p className="cp-empty-title">Minified CSS appears here</p>
                <p className="cp-empty-desc">
                  Paste CSS code on the left or load a sample to reduce file size
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
