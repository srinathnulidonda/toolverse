// features/dev/jwt-decoder/Workspace.tsx
"use client";
import { logger } from "@/lib/logger";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { parseJWT, formatDuration, formatTimestamp } from "./jwtParser";
import type { DecodedToken, ParseError } from "./jwtParser";
import TokenVisualizer from "./TokenVisualizer";
import SecurityAnalyzer from "./SecurityAnalyzer";
import ClaimsExplorer from "./ClaimsExplorer";
import "./style/ClaimsExplorer.css";
import "./style/SecurityAnalyzer.css";
import "./style/TokenVisualizer.css";
import "./style/Workspace.css";

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
      <div className="jwtw-root" role="main" aria-label="JWT Decoder">
        {/* Top Bar */}
        <div className="jwtw-chrome">
          <div className="jwtw-chrome-left">
            <div className="jwtw-presets" ref={presetsRef}>
              <button
                className="jwtw-presets-trigger"
                onClick={() => setShowPresets(!showPresets)}
                aria-haspopup="menu"
                aria-expanded={showPresets}
              >
                <i className="ti ti-wand" />
                <span>Examples</span>
                <i className={`ti ti-chevron-down jwtw-chevron${showPresets ? " open" : ""}`} />
              </button>
              {showPresets && (
                <div className="jwtw-presets-menu" role="menu">
                  {SAMPLE_TOKENS.map((preset) => (
                    <button
                      key={preset.id}
                      className="jwtw-preset-item"
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
              <button className="jwtw-icon-btn" onClick={handleClear} title="Clear all">
                <i className="ti ti-trash" />
                <span className="jwtw-btn-label">Clear</span>
              </button>
            )}
          </div>

          <div className="jwtw-chrome-right">
            {decodedToken && (
              <>
                {/* Status Badge */}
                {decodedToken.metadata.isExpired && (
                  <div className="jwtw-badge jwtw-badge--error">
                    <i className="ti ti-alert-circle" />
                    Expired
                  </div>
                )}
                {!decodedToken.metadata.isExpired && decodedToken.metadata.isNotYetValid && (
                  <div className="jwtw-badge jwtw-badge--warning">
                    <i className="ti ti-clock" />
                    Not Yet Valid
                  </div>
                )}
                {!decodedToken.metadata.isExpired &&
                  !decodedToken.metadata.isNotYetValid &&
                  decodedToken.decoded.payload.exp && (
                    <div className="jwtw-badge jwtw-badge--success">
                      <i className="ti ti-circle-check" />
                      Valid
                    </div>
                  )}

                {/* Copy & Download */}
                <button
                  className={`jwtw-action-btn${copiedKey === "full-token" ? " copied" : ""}`}
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
        <div className="jwtw-input-section">
          <div className="jwtw-input-header">
            <div className="jwtw-input-label">
              <i className="ti ti-lock" />
              JWT Token
            </div>
            {input && (
              <div className="jwtw-input-meta">
                <span className="jwtw-input-length">{input.length} characters</span>
              </div>
            )}
          </div>
          <textarea
            ref={textareaRef}
            className="jwtw-input"
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
            <div className="jwtw-error" role="alert">
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
          <div className="jwtw-empty">
            <div className="jwtw-empty-icon">
              <i className="ti ti-key" />
            </div>
            <h3 className="jwtw-empty-title">Decode & Analyze JWT Tokens</h3>
            <p className="jwtw-empty-desc">
              Paste a JWT token above to decode its header, payload, and signature. View security
              analysis, visualizations, and detailed claim information.
            </p>
            <button className="jwtw-empty-btn" onClick={() => loadPreset(SAMPLE_TOKENS[0].token)}>
              <i className="ti ti-wand" />
              Try an example
            </button>
          </div>
        )}

        {/* Content Tabs */}
        {decodedToken && (
          <>
            <nav className="jwtw-tabs" role="tablist" aria-label="Token views">
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
                  className={`jwtw-tab${viewTab === tab.id ? " active" : ""}`}
                  onClick={() => setViewTab(tab.id)}
                >
                  <i className={`ti ${tab.icon}`} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>

            <div className="jwtw-content">
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
                <div role="tabpanel" id="jwtw-panel-visualizer" className="jwtw-panel">
                  <TokenVisualizer token={decodedToken} />
                </div>
              )}

              {/* Security Analyzer */}
              {viewTab === "security" && (
                <div role="tabpanel" id="jwtw-panel-security" className="jwtw-panel">
                  <SecurityAnalyzer token={decodedToken} />
                </div>
              )}

              {/* Raw JSON */}
              {viewTab === "raw" && (
                <div role="tabpanel" id="jwtw-panel-raw" className="jwtw-panel jwtw-raw">
                  <div className="jwtw-raw-section">
                    <div className="jwtw-raw-header">
                      <span>Header</span>
                      <button
                        className={`jwtw-copy-btn-sm${copiedKey === "raw-header" ? " copied" : ""}`}
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
                    <pre className="jwtw-raw-code">
                      {JSON.stringify(decodedToken.decoded.header, null, 2)}
                    </pre>
                  </div>
                  <div className="jwtw-raw-section">
                    <div className="jwtw-raw-header">
                      <span>Payload</span>
                      <button
                        className={`jwtw-copy-btn-sm${copiedKey === "raw-payload" ? " copied" : ""}`}
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
                    <pre className="jwtw-raw-code">
                      {JSON.stringify(decodedToken.decoded.payload, null, 2)}
                    </pre>
                  </div>
                  <div className="jwtw-raw-section">
                    <div className="jwtw-raw-header">
                      <span>Signature</span>
                      <button
                        className={`jwtw-copy-btn-sm${copiedKey === "raw-sig" ? " copied" : ""}`}
                        onClick={() => handleCopy(decodedToken.parts.signature, "raw-sig")}
                      >
                        <i className={`ti ${copiedKey === "raw-sig" ? "ti-check" : "ti-copy"}`} />
                      </button>
                    </div>
                    <pre className="jwtw-raw-code jwtw-raw-sig">{decodedToken.parts.signature}</pre>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="jwtw-footer">
          <i className="ti ti-shield-lock" />
          <span>All processing happens in your browser — tokens are never sent to any server</span>
        </div>
      </div>
    </>
  );
}
