// features/dev/url-encoder/UrlPreview.tsx
"use client";

import { useMemo, type ReactNode } from "react";
import type { Mode, EncodingOptions, UrlParts } from "./utils";
import { parseUrl } from "./utils";
import { formatBytes } from "@/utils";

interface UrlPreviewProps {
  mode: Mode;
  input: string;
  output: string;
  options: EncodingOptions;
  error?: string;
  mobileView: "input" | "output";
  onInputChange: (value: string) => void;
  onMobileViewChange: (view: "input" | "output") => void;
  onViewOutput?: () => void;
}

/*  Local helper — JSX allowed here since this is a .tsx file  */
function highlightEncoded(str: string): ReactNode[] {
  const parts: ReactNode[] = [];
  const regex = /%[0-9A-Fa-f]{2}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <span key={match.index} className="url-encoded-char">
        {match[0]}
      </span>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }

  return parts;
}

export default function UrlPreview({
  mode,
  input,
  output,
  options,
  error,
  mobileView,
  onInputChange,
  onMobileViewChange,
  onViewOutput,
}: UrlPreviewProps) {
  const parsedUrl = useMemo(() => {
    const source = mode === "decode" ? output : input;
    return source.trim() ? parseUrl(source) : null;
  }, [mode, output, input]);

  const highlightedOutput = useMemo(() => {
    if (!output || mode === "decode") return output;
    return highlightEncoded(output);
  }, [output, mode]);

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  return (
    <>
      <div className="up-root">
        {/*  Mobile Switcher  */}
        <div className="up-mobile-tabs">
          <button
            type="button"
            className={`up-mobile-tab${mobileView === "input" ? " active" : ""}`}
            onClick={() => onMobileViewChange("input")}
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            {mode === "encode" ? "Plain URL" : "Encoded"}
          </button>
          <button
            type="button"
            className={`up-mobile-tab${mobileView === "output" ? " active" : ""}`}
            onClick={() => onMobileViewChange("output")}
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-sparkles" />
            Result
            {output && mobileView === "input" && (
              <span className="up-ready-dot" aria-label="Ready" />
            )}
          </button>
        </div>

        {/*  Panels  */}
        <div className="up-panels">
          {/* Input Panel */}
          <div
            className={`up-panel${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="up-panel-header">
              <div className="up-panel-label">
                <i className={`ti ${mode === "encode" ? "ti-pencil" : "ti-code-dots"}`} />
                {mode === "encode" ? "Plain URL" : "Encoded string"}
              </div>
              <div className="up-panel-meta">
                {input && <span className="up-meta-size">{formatBytes(inputBytes)}</span>}
              </div>
            </div>

            <textarea
              className="up-textarea"
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={
                mode === "encode"
                  ? "https://example.com/search?q=hello world&lang=en"
                  : "https%3A%2F%2Fexample.com%2F..."
              }
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              aria-label={mode === "encode" ? "URL to encode" : "Encoded string to decode"}
              aria-invalid={!!error}
            />

            {/* URL anatomy chips */}
            {input && !error && parsedUrl && (
              <div className="up-anatomy">
                <span className="up-anatomy-chip proto" title="Protocol">
                  {parsedUrl.protocol}://
                </span>
                <span className="up-anatomy-chip host" title="Hostname">
                  {parsedUrl.hostname}
                </span>
                {parsedUrl.port && (
                  <span className="up-anatomy-chip port" title="Port">
                    :{parsedUrl.port}
                  </span>
                )}
                {parsedUrl.pathname !== "/" && (
                  <span className="up-anatomy-chip path" title={parsedUrl.pathname}>
                    {parsedUrl.pathname.length > 22
                      ? parsedUrl.pathname.slice(0, 22) + "…"
                      : parsedUrl.pathname}
                  </span>
                )}
                {parsedUrl.searchParams.length > 0 && (
                  <span className="up-anatomy-chip params">
                    ?{parsedUrl.searchParams.length} param
                    {parsedUrl.searchParams.length !== 1 ? "s" : ""}
                  </span>
                )}
                {parsedUrl.hash && (
                  <span className="up-anatomy-chip hash" title={parsedUrl.hash}>
                    #{parsedUrl.hash.slice(0, 8)}
                    {parsedUrl.hash.length > 8 ? "…" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="up-error" role="alert">
                <i className="ti ti-alert-triangle" />
                <div>
                  <strong>Decode error</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Mobile CTA */}
            {output && !error && (
              <div className="up-mobile-cta">
                <button type="button" className="up-view-result-btn" onClick={onViewOutput}>
                  <i className="ti ti-sparkles" />
                  View result
                  <i className="ti ti-chevron-right" />
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="up-divider">
            <div className="up-divider-icon">
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`up-panel${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="up-panel-header">
              <div className="up-panel-label">
                <i className="ti ti-eye" />
                Result
              </div>
              <div className="up-panel-meta">
                {output && (
                  <>
                    <span className="up-meta-size">{formatBytes(outputBytes)}</span>
                    {inputBytes > 0 && (
                      <span className="up-ratio-pill">
                        {Math.round((outputBytes / inputBytes) * 100)}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="up-panel-body">
              {!output ? (
                <div className="up-empty">
                  <div className="up-empty-icon">
                    <i className="ti ti-arrow-big-right-lines" />
                  </div>
                  <p className="up-empty-title">Output appears here</p>
                  <p className="up-empty-desc">
                    {mode === "encode"
                      ? "Start typing on the left or pick an example"
                      : "Paste a URL-encoded string on the left"}
                  </p>
                </div>
              ) : (
                <pre className="up-output">{highlightedOutput}</pre>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .up-root {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Mobile Tabs  */
        .up-mobile-tabs {
          display: none;
          border-bottom: 0.5px solid var(--border);
          background: var(--bg-surface);
        }

        .up-mobile-tab {
          flex: 1;
          height: 42px;
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

        .up-mobile-tab.active {
          color: var(--text);
        }

        .up-mobile-tab.active::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 20%;
          right: 20%;
          height: 2px;
          background: var(--brand);
          border-radius: 2px 2px 0 0;
        }

        .up-ready-dot {
          position: absolute;
          top: 11px;
          right: calc(50% - 35px);
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--brand);
        }

        /*  Panels  */
        .up-panels {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          min-height: 0;
          overflow: hidden;
        }

        .up-panel {
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        .up-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 14px;
          height: 38px;
          border-bottom: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
          flex-shrink: 0;
        }

        .up-panel-label {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10.5px;
          font-weight: 600;
          color: var(--text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.09em;
        }

        .up-panel-label i {
          font-size: 11px;
        }

        .up-panel-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .up-meta-size {
          font-size: 10px;
          color: var(--text-disabled);
          font-family: var(--font-mono);
        }

        .up-ratio-pill {
          font-size: 10px;
          font-weight: 600;
          background: var(--brand-light);
          color: var(--brand-text);
          padding: 2px 7px;
          border-radius: 99px;
        }

        .up-panel-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
        }

        /*  Divider  */
        .up-divider {
          width: 1px;
          background: var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .up-divider-icon {
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

        /*  Textarea  */
        .up-textarea {
          flex: 1;
          margin: 0;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          background: transparent;
          border: none;
          outline: none;
          color: var(--text);
          resize: none;
          overflow: auto;
          min-height: 200px;
        }

        .up-textarea::placeholder {
          color: var(--text-disabled);
        }

        /*  Output  */
        .up-output {
          flex: 1;
          margin: 0;
          padding: 14px 16px;
          font-family: var(--font-mono);
          font-size: 12.5px;
          line-height: 1.7;
          color: var(--text);
          background: transparent;
          border: none;
          overflow: auto;
          white-space: pre-wrap;
          word-break: break-all;
        }

        :global(.url-encoded-char) {
          color: var(--brand);
          font-weight: 600;
          background: var(--brand-light);
          padding: 1px 2px;
          border-radius: 2px;
        }

        /*  URL Anatomy  */
        .up-anatomy {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          padding: 8px 14px;
          border-top: 0.5px solid var(--border-faint);
          background: var(--bg-surface);
        }

        .up-anatomy-chip {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 99px;
          font-family: var(--font-mono);
          border: 0.5px solid;
          display: inline-flex;
          align-items: center;
        }

        .up-anatomy-chip.proto {
          background: var(--brand-light);
          color: var(--brand-text);
          border-color: var(--brand-border);
        }

        .up-anatomy-chip.host {
          background: #eff6ff;
          color: #1d4ed8;
          border-color: #bfdbfe;
        }

        @media (prefers-color-scheme: dark) {
          .up-anatomy-chip.host {
            background: #0a1628;
            color: #93c5fd;
            border-color: #1e3a5f;
          }
        }

        .up-anatomy-chip.port,
        .up-anatomy-chip.path {
          background: var(--bg-card);
          color: var(--text-secondary);
          border-color: var(--border);
        }

        .up-anatomy-chip.params {
          background: #fffbeb;
          color: #92400e;
          border-color: #fde68a;
        }

        @media (prefers-color-scheme: dark) {
          .up-anatomy-chip.params {
            background: #1c1400;
            color: #fcd34d;
            border-color: #78350f;
          }
        }

        .up-anatomy-chip.hash {
          background: var(--bg-card);
          color: var(--text-tertiary);
          border-color: var(--border);
        }

        /*  Error  */
        .up-error {
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px 16px;
          background: var(--error-bg);
          border-top: 0.5px solid var(--border-faint);
          flex-shrink: 0;
        }

        .up-error i {
          font-size: 15px;
          color: #b91c1c;
          flex-shrink: 0;
        }

        @media (prefers-color-scheme: dark) {
          .up-error i {
            color: #f87171;
          }
        }

        .up-error strong {
          font-size: 12px;
          font-weight: 600;
          color: #b91c1c;
          display: block;
          margin-bottom: 2px;
        }

        @media (prefers-color-scheme: dark) {
          .up-error strong {
            color: #f87171;
          }
        }

        .up-error span {
          font-size: 12px;
          color: var(--text-secondary);
        }

        /*  Mobile CTA  */
        .up-mobile-cta {
          display: none;
          padding: 10px 14px;
          border-top: 0.5px solid var(--border);
        }

        .up-view-result-btn {
          width: 100%;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          border-radius: var(--radius-md);
          border: 0.5px solid var(--border);
          background: var(--bg-surface);
          color: var(--text);
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.12s;
        }

        .up-view-result-btn:hover {
          background: var(--bg-card);
        }

        .up-view-result-btn i:first-child {
          color: var(--brand);
        }

        .up-view-result-btn i:last-child {
          color: var(--text-tertiary);
          margin-left: auto;
        }

        /*  Empty State  */
        .up-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 32px;
          text-align: center;
        }

        .up-empty-icon {
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

        .up-empty-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text);
          margin: 0;
        }

        .up-empty-desc {
          font-size: 12px;
          color: var(--text-tertiary);
          margin: 0;
          max-width: 300px;
        }

        /*  Responsive  */
        @media (max-width: 768px) {
          .up-mobile-tabs {
            display: flex;
          }

          .up-panels {
            display: block;
          }

          .up-divider {
            display: none;
          }

          .up-panel {
            min-height: 360px;
          }

          .up-panel.mobile-hidden {
            display: none;
          }

          .up-panel.mobile-visible {
            display: flex;
          }

          .up-mobile-cta {
            display: block;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .up-mobile-tab,
          .up-view-result-btn {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}
