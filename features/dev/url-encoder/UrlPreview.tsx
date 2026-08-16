// features/dev/url-encoder/UrlPreview.tsx
"use client";

import { useMemo, type ReactNode } from "react";
import type { Mode, EncodingOptions, UrlParts } from "./ts/utils";
import { parseUrl } from "./ts/utils";
import { formatBytes } from "@/utils";
import styles from "./style/UrlPreview.module.css";

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
      <span key={match.index} className={styles.urlEncodedChar}>
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
      <div className={styles.upRoot}>
        {/*  Mobile Switcher  */}
        <div className={styles.upMobileTabs}>
          <button
            type="button"
            className={`${styles.upMobileTab}${mobileView === "input" ? ` ${styles.active}` : ""}`}
            onClick={() => onMobileViewChange("input")}
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            {mode === "encode" ? "Plain URL" : "Encoded"}
          </button>
          <button
            type="button"
            className={`${styles.upMobileTab}${mobileView === "output" ? ` ${styles.active}` : ""}`}
            onClick={() => onMobileViewChange("output")}
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-sparkles" />
            Result
            {output && mobileView === "input" && (
              <span className={styles.upReadyDot} aria-label="Ready" />
            )}
          </button>
        </div>

        {/*  Panels  */}
        <div className={styles.upPanels}>
          {/* Input Panel */}
          <div
            className={`${styles.upPanel}${mobileView === "input" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            <div className={styles.upPanelHeader}>
              <div className={styles.upPanelLabel}>
                <i className={`ti ${mode === "encode" ? "ti-pencil" : "ti-code-dots"}`} />
                {mode === "encode" ? "Plain URL" : "Encoded string"}
              </div>
              <div className={styles.upPanelMeta}>
                {input && <span className={styles.upMetaSize}>{formatBytes(inputBytes)}</span>}
              </div>
            </div>

            <textarea
              className={styles.upTextarea}
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
              <div className={styles.upAnatomy}>
                <span className={`${styles.upAnatomyChip} ${styles.proto}`} title="Protocol">
                  {parsedUrl.protocol}://
                </span>
                <span className={`${styles.upAnatomyChip} ${styles.host}`} title="Hostname">
                  {parsedUrl.hostname}
                </span>
                {parsedUrl.port && (
                  <span className={`${styles.upAnatomyChip} ${styles.port}`} title="Port">
                    :{parsedUrl.port}
                  </span>
                )}
                {parsedUrl.pathname !== "/" && (
                  <span className={`${styles.upAnatomyChip} ${styles.path}`} title={parsedUrl.pathname}>
                    {parsedUrl.pathname.length > 22
                      ? parsedUrl.pathname.slice(0, 22) + "…"
                      : parsedUrl.pathname}
                  </span>
                )}
                {parsedUrl.searchParams.length > 0 && (
                  <span className={`${styles.upAnatomyChip} ${styles.params}`}>
                    ?{parsedUrl.searchParams.length} param
                    {parsedUrl.searchParams.length !== 1 ? "s" : ""}
                  </span>
                )}
                {parsedUrl.hash && (
                  <span className={`${styles.upAnatomyChip} ${styles.hash}`} title={parsedUrl.hash}>
                    #{parsedUrl.hash.slice(0, 8)}
                    {parsedUrl.hash.length > 8 ? "…" : ""}
                  </span>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className={styles.upError} role="alert">
                <i className="ti ti-alert-triangle" />
                <div>
                  <strong>Decode error</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Mobile CTA */}
            {output && !error && (
              <div className={styles.upMobileCta}>
                <button type="button" className={styles.upViewResultBtn} onClick={onViewOutput}>
                  <i className="ti ti-sparkles" />
                  View result
                  <i className="ti ti-chevron-right" />
                </button>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className={styles.upDivider}>
            <div className={styles.upDividerIcon}>
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`${styles.upPanel}${mobileView === "output" ? ` ${styles.mobileVisible}` : ` ${styles.mobileHidden}`}`}
          >
            <div className={styles.upPanelHeader}>
              <div className={styles.upPanelLabel}>
                <i className="ti ti-eye" />
                Result
              </div>
              <div className={styles.upPanelMeta}>
                {output && (
                  <>
                    <span className={styles.upMetaSize}>{formatBytes(outputBytes)}</span>
                    {inputBytes > 0 && (
                      <span className={styles.upRatioPill}>
                        {Math.round((outputBytes / inputBytes) * 100)}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className={styles.upPanelBody}>
              {!output ? (
                <div className={styles.upEmpty}>
                  <div className={styles.upEmptyIcon}>
                    <i className="ti ti-arrow-big-right-lines" />
                  </div>
                  <p className={styles.upEmptyTitle}>Output appears here</p>
                  <p className={styles.upEmptyDesc}>
                    {mode === "encode"
                      ? "Start typing on the left or pick an example"
                      : "Paste a URL-encoded string on the left"}
                  </p>
                </div>
              ) : (
                <pre className={styles.upOutput}>{highlightedOutput}</pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}