// features/dev/jwt-decoder/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { parseJWT, formatDuration, formatTimestamp } from "./ts/jwtParser";
import type { DecodedToken, ParseError } from "./ts/jwtParser";
import TokenVisualizer from "./TokenVisualizer";
import SecurityAnalyzer from "./SecurityAnalyzer";
import ClaimsExplorer from "./ClaimsExplorer";
import styles from "./style/Workspace.module.css";

type ViewTab = "decoded" | "visualizer" | "security" | "raw";

const SAMPLE_TOKENS = [
  {
    id: "standard",
    label: "Standard JWT",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzQ1Njc4OTB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  },
  {
    id: "auth",
    label: "Auth Token",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1In0.eyJpc3MiOiJodHRwczovL2F1dGgudG9vbHZlcnNlLmFwcCIsInN1YiI6InVzZXJfMTIzNDUiLCJhdWQiOiJ0b29sdmVyc2UtYXBpIiwiZXhwIjoxNzM0NTY3ODkwLCJuYmYiOjE3MzQ1NjQyOTAsImlhdCI6MTczNDU2NDI5MCwianRpIjoiYWJjZGVmMTIzNDU2IiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSJdfQ.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  },
  {
    id: "openid",
    label: "OpenID Connect",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDk2OTQxMzE1MDk3MTY5Njg2NzQiLCJhenAiOiJ5b3VyLWNsaWVudC1pZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6InlvdXItY2xpZW50LWlkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJqb2huZG9lQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9hdmF0YXIuanBnIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvZSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNzM0NTY0MjkwLCJleHAiOjE3MzQ1Njc4OTB9.signature",
  },
];

export default function JWTDecoderWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [viewTab, setViewTab] = useState<ViewTab>("decoded");
  const [copiedKey, setCopiedKey] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const presetsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse JWT
  const parseResult = useMemo(() => {
    if (!input.trim()) return null;
    return parseJWT(input);
  }, [input]);

  const decodedToken = parseResult?.success ? parseResult.token : null;
  const parseError = parseResult?.success === false ? parseResult.error : null;

  // Copy handler
  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1800);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  }, []);

  // Load preset
  const loadPreset = useCallback((token: string) => {
    setInput(token);
    setShowPresets(false);
    setViewTab("decoded");
  }, []);

  // Clear all
  const handleClear = useCallback(() => {
    setInput("");
    setCopiedKey("");
    setViewTab("decoded");
    textareaRef.current?.focus();
  }, []);

  // Click outside handler for presets
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <div className={styles.jwtwRoot} role="main" aria-label="JWT Decoder">
        {/* Top Bar */}
        <div className={styles.jwtwChrome}>
          <div className={styles.jwtwChromeLeft}>
            <div className={styles.jwtwPresets} ref={presetsRef}>
              <button
                className={styles.jwtwPresetsTrigger}
                onClick={() => setShowPresets(!showPresets)}
                aria-haspopup="menu"
                aria-expanded={showPresets}
              >
                <i className="ti ti-wand" />
                <span>Examples</span>
                <i className={`ti ti-chevron-down ${styles.jwtwChevron}${showPresets ? ` ${styles.open}` : ""}`} />
              </button>
              {showPresets && (
                <div className={styles.jwtwPresetsMenu} role="menu">
                  {SAMPLE_TOKENS.map((preset) => (
                    <button
                      key={preset.id}
                      className={styles.jwtwPresetItem}
                      onClick={() => loadPreset(preset.token)}
                      role="menuitem"
                    >
                      <i className="ti ti-key" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {input && (
              <button className={styles.jwtwIconBtn} onClick={handleClear} title="Clear all">
                <i className="ti ti-trash" />
                <span className={styles.jwtwBtnLabel}>Clear</span>
              </button>
            )}
          </div>

          <div className={styles.jwtwChromeRight}>
            {decodedToken && (
              <>
                {/* Status Badge */}
                {decodedToken.metadata.isExpired && (
                  <div className={`${styles.jwtwBadge} ${styles.jwtwBadgeError}`}>
                    <i className="ti ti-alert-circle" />
                    Expired
                  </div>
                )}
                {!decodedToken.metadata.isExpired && decodedToken.metadata.isNotYetValid && (
                  <div className={`${styles.jwtwBadge} ${styles.jwtwBadgeWarning}`}>
                    <i className="ti ti-clock" />
                    Not Yet Valid
                  </div>
                )}
                {!decodedToken.metadata.isExpired &&
                  !decodedToken.metadata.isNotYetValid &&
                  decodedToken.decoded.payload.exp && (
                    <div className={`${styles.jwtwBadge} ${styles.jwtwBadgeSuccess}`}>
                      <i className="ti ti-circle-check" />
                      Valid
                    </div>
                  )}

                {/* Copy & Download */}
                <button
                  className={`${styles.jwtwActionBtn}${copiedKey === "full-token" ? ` ${styles.copied}` : ""}`}
                  onClick={() => handleCopy(decodedToken.raw, "full-token")}
                >
                  <i className={`ti ${copiedKey === "full-token" ? "ti-check" : "ti-copy"}`} />
                  <span>{copiedKey === "full-token" ? "Copied" : "Copy Token"}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Input Section */}
        <div className={styles.jwtwInputSection}>
          <div className={styles.jwtwInputHeader}>
            <div className={styles.jwtwInputLabel}>
              <i className="ti ti-lock" />
              JWT Token
            </div>
            {input && (
              <div className={styles.jwtwInputMeta}>
                <span className={styles.jwtwInputLength}>{input.length} characters</span>
              </div>
            )}
          </div>
          <textarea
            ref={textareaRef}
            className={styles.jwtwInput}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here... (with or without Bearer prefix)"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            rows={5}
            aria-label="JWT token input"
            aria-invalid={!!parseError}
          />
          {parseError && (
            <div className={styles.jwtwError} role="alert">
              <i className="ti ti-alert-triangle" />
              <div>
                <strong>{parseError.message}</strong>
                {parseError.details && <p>{parseError.details}</p>}
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {!input && (
          <div className={styles.jwtwEmpty}>
            <div className={styles.jwtwEmptyIcon}>
              <i className="ti ti-key" />
            </div>
            <h3 className={styles.jwtwEmptyTitle}>Decode & Analyze JWT Tokens</h3>
            <p className={styles.jwtwEmptyDesc}>
              Paste a JWT token above to decode its header, payload, and signature. View security
              analysis, visualizations, and detailed claim information.
            </p>
            <button className={styles.jwtwEmptyBtn} onClick={() => loadPreset(SAMPLE_TOKENS[0].token)}>
              <i className="ti ti-wand" />
              Try an example
            </button>
          </div>
        )}

        {/* Content Tabs */}
        {decodedToken && (
          <>
            <nav className={styles.jwtwTabs} role="tablist" aria-label="Token views">
              {[
                { id: "decoded" as const, label: "Claims", icon: "ti-list-details" },
                { id: "visualizer" as const, label: "Visualizer", icon: "ti-chart-pie" },
                { id: "security" as const, label: "Security", icon: "ti-shield-check" },
                { id: "raw" as const, label: "Raw JSON", icon: "ti-code" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={viewTab === tab.id}
                  aria-controls={`jwtw-panel-${tab.id}`}
                  className={`${styles.jwtwTab}${viewTab === tab.id ? ` ${styles.active}` : ""}`}
                  onClick={() => setViewTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className={styles.jwtwContent}>
              {/* Claims Explorer */}
              {viewTab === "decoded" && (
                <div role="tabpanel" id="jwtw-panel-decoded">
                  <ClaimsExplorer
                    header={decodedToken.decoded.header}
                    payload={decodedToken.decoded.payload}
                    onCopy={handleCopy}
                    copiedKey={copiedKey}
                  />
                </div>
              )}

              {/* Visualizer */}
              {viewTab === "visualizer" && (
                <div role="tabpanel" id="jwtw-panel-visualizer" className={styles.jwtwPanel}>
                  <TokenVisualizer token={decodedToken} />
                </div>
              )}

              {/* Security Analyzer */}
              {viewTab === "security" && (
                <div role="tabpanel" id="jwtw-panel-security" className={styles.jwtwPanel}>
                  <SecurityAnalyzer token={decodedToken} />
                </div>
              )}

              {/* Raw JSON */}
              {viewTab === "raw" && (
                <div role="tabpanel" id="jwtw-panel-raw" className={`${styles.jwtwPanel} ${styles.jwtwRaw}`}>
                  <div className={styles.jwtwRawSection}>
                    <div className={styles.jwtwRawHeader}>
                      <span>Header</span>
                      <button
                        className={`${styles.jwtwCopyBtnSm}${copiedKey === "raw-header" ? ` ${styles.copied}` : ""}`}
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(decodedToken.decoded.header, null, 2),
                            "raw-header"
                          )
                        }
                      >
                        <i
                          className={`ti ${copiedKey === "raw-header" ? "ti-check" : "ti-copy"}`}
                        />
                      </button>
                    </div>
                    <pre className={styles.jwtwRawCode}>
                      {JSON.stringify(decodedToken.decoded.header, null, 2)}
                    </pre>
                  </div>
                  <div className={styles.jwtwRawSection}>
                    <div className={styles.jwtwRawHeader}>
                      <span>Payload</span>
                      <button
                        className={`${styles.jwtwCopyBtnSm}${copiedKey === "raw-payload" ? ` ${styles.copied}` : ""}`}
                        onClick={() =>
                          handleCopy(
                            JSON.stringify(decodedToken.decoded.payload, null, 2),
                            "raw-payload"
                          )
                        }
                      >
                        <i
                          className={`ti ${copiedKey === "raw-payload" ? "ti-check" : "ti-copy"}`}
                        />
                      </button>
                    </div>
                    <pre className={styles.jwtwRawCode}>
                      {JSON.stringify(decodedToken.decoded.payload, null, 2)}
                    </pre>
                  </div>
                  <div className={styles.jwtwRawSection}>
                    <div className={styles.jwtwRawHeader}>
                      <span>Signature</span>
                      <button
                        className={`${styles.jwtwCopyBtnSm}${copiedKey === "raw-sig" ? ` ${styles.copied}` : ""}`}
                        onClick={() => handleCopy(decodedToken.parts.signature, "raw-sig")}
                      >
                        <i className={`ti ${copiedKey === "raw-sig" ? "ti-check" : "ti-copy"}`} />
                      </button>
                    </div>
                    <pre className={`${styles.jwtwRawCode} ${styles.jwtwRawSig}`}>{decodedToken.parts.signature}</pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className={styles.jwtwFooter}>
          <i className="ti ti-shield-lock" />
          <span>All processing happens in your browser — tokens are never sent to any server</span>
        </div>
      </div>
    </>
  );
}