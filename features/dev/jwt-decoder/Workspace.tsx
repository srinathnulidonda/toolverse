// features/dev/jwt-decoder/Workspace.tsx
"use client";

import { logger } from "@/lib/logger";
import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { Tool } from "@/lib/tools";
import { parseJWT } from "./ts/jwtParser";
import type { DecodedToken } from "./ts/jwtParser";
import TokenVisualizer from "./TokenVisualizer";
import SecurityAnalyzer from "./SecurityAnalyzer";
import ClaimsExplorer from "./ClaimsExplorer";
import styles from "./style/Workspace.module.css";

type ViewTab = "decoded" | "visualizer" | "security" | "raw";
type MobilePanel = "input" | "output";

const SAMPLE_TOKENS = [
  {
    id: "standard",
    label: "Standard JWT",
    icon: "ti-key",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE3MzQ1Njc4OTB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
  },
  {
    id: "auth",
    label: "Auth Token",
    icon: "ti-shield-lock",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjEyMzQ1In0.eyJpc3MiOiJodHRwczovL2F1dGgudG9vbHZlcnNlLmFwcCIsInN1YiI6InVzZXJfMTIzNDUiLCJhdWQiOiJ0b29sdmVyc2UtYXBpIiwiZXhwIjoxNzM0NTY3ODkwLCJuYmYiOjE3MzQ1NjQyOTAsImlhdCI6MTczNDU2NDI5MCwianRpIjoiYWJjZGVmMTIzNDU2IiwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSJdfQ.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  },
  {
    id: "openid",
    label: "OpenID Connect",
    icon: "ti-brand-google",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJzdWIiOiIxMDk2OTQxMzE1MDk3MTY5Njg2NzQiLCJhenAiOiJ5b3VyLWNsaWVudC1pZC5hcHBzLmdvb2dsZXVzZXJjb250ZW50LmNvbSIsImF1ZCI6InlvdXItY2xpZW50LWlkLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiZW1haWwiOiJqb2huZG9lQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJuYW1lIjoiSm9obiBEb2UiLCJwaWN0dXJlIjoiaHR0cHM6Ly9leGFtcGxlLmNvbS9hdmF0YXIuanBnIiwiZ2l2ZW5fbmFtZSI6IkpvaG4iLCJmYW1pbHlfbmFtZSI6IkRvZSIsImxvY2FsZSI6ImVuIiwiaWF0IjoxNzM0NTY0MjkwLCJleHAiOjE3MzQ1Njc4OTB9.signature",
  },
];

const OUTPUT_TABS: { id: ViewTab; label: string; icon: string }[] = [
  { id: "decoded", label: "Claims", icon: "ti-list-details" },
  { id: "visualizer", label: "Visualizer", icon: "ti-chart-pie" },
  { id: "security", label: "Security", icon: "ti-shield-check" },
  { id: "raw", label: "Raw JSON", icon: "ti-code" },
];

const RAW_DOT_COLORS: Record<string, string> = {
  Header: "#3b82f6",
  Payload: "#10b981",
  Signature: "#8b5cf6",
};

export default function JWTDecoderWorkspace({ tool }: { tool: Tool }) {
  const [input, setInput] = useState("");
  const [viewTab, setViewTab] = useState<ViewTab>("decoded");
  const [copiedKey, setCopiedKey] = useState("");
  const [showPresets, setShowPresets] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>("input");

  const presetsRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const parseResult = useMemo(() => {
    const trimmed = input.trim();
    if (!trimmed) return null;
    const cleaned = trimmed.startsWith("Bearer ")
      ? trimmed.slice(7).trim()
      : trimmed;
    return parseJWT(cleaned);
  }, [input]);

  const decodedToken: DecodedToken | null =
    parseResult?.success ? parseResult.token : null;
  const parseError = parseResult?.success === false ? parseResult.error : null;

  const securityIssueCount = useMemo(() => {
    if (!decodedToken) return 0;
    const alg = (decodedToken.decoded.header.alg as string | undefined)?.toUpperCase() ?? "NONE";
    let count = 0;
    if (alg === "NONE") count++;
    if (!decodedToken.decoded.payload.exp || decodedToken.metadata.isExpired) count++;
    return count;
  }, [decodedToken]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1800);
    } catch (err) {
      logger.error("Failed to copy:", err);
    }
  }, []);

  const loadPreset = useCallback(
    (token: string) => {
      setInput(token);
      setShowPresets(false);
      setViewTab("decoded");
      setMobilePanel("output");
      setTimeout(
        () => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
        40
      );
    },
    []
  );

  const handleClear = useCallback(() => {
    setInput("");
    setCopiedKey("");
    setViewTab("decoded");
    setMobilePanel("input");
    textareaRef.current?.focus();
  }, []);

  const goToOutput = useCallback(() => {
    setMobilePanel("output");
    setTimeout(
      () => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      40
    );
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(
      () => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      40
    );
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (presetsRef.current && !presetsRef.current.contains(e.target as Node)) {
        setShowPresets(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (decodedToken && mobilePanel === "input") {
      setMobilePanel("output");
    }
  }, [decodedToken]);

  const statusBadge = useMemo(() => {
    if (!decodedToken) return null;
    if (decodedToken.metadata.isExpired)
      return { cls: styles.jwtwBadgeError, icon: "ti-alert-circle", label: "Expired" };
    if (decodedToken.metadata.isNotYetValid)
      return { cls: styles.jwtwBadgeWarning, icon: "ti-clock", label: "Not Yet Valid" };
    if (decodedToken.decoded.payload.exp)
      return { cls: styles.jwtwBadgeSuccess, icon: "ti-circle-check", label: "Valid" };
    return null;
  }, [decodedToken]);

  const rawSections = useMemo(() => {
    if (!decodedToken) return [];
    return [
      {
        label: "Header",
        copyKey: "raw-header",
        content: JSON.stringify(decodedToken.decoded.header, null, 2),
        mono: true,
        wrap: false,
      },
      {
        label: "Payload",
        copyKey: "raw-payload",
        content: JSON.stringify(decodedToken.decoded.payload, null, 2),
        mono: true,
        wrap: false,
      },
      {
        label: "Signature",
        copyKey: "raw-sig",
        content: decodedToken.parts.signature,
        mono: true,
        wrap: true,
      },
    ];
  }, [decodedToken]);

  return (
    <div className={styles.jwtwRoot} ref={rootRef} role="main" aria-label="JWT Decoder">
      <div className={styles.jwtwChrome}>
        <div className={styles.jwtwChromeLeft}>
          <div className={styles.jwtwTitle}>
            <div className={styles.jwtwTitleIcon}>
              <i className="ti ti-key" />
            </div>
            JWT Decoder
          </div>

          <div className={styles.jwtwPresets} ref={presetsRef}>
            <button
              className={styles.jwtwPresetsTrigger}
              onClick={() => setShowPresets((s) => !s)}
              aria-haspopup="menu"
              aria-expanded={showPresets}
            >
              <i className="ti ti-wand" />
              <span>Examples</span>
              <i
                className={`ti ti-chevron-down ${styles.jwtwChevron} ${showPresets ? styles.jwtwChevronOpen : ""}`}
              />
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
                    <i className={`ti ${preset.icon}`} />
                    <span>{preset.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {input && (
            <button
              className={styles.jwtwIconBtn}
              onClick={handleClear}
              title="Clear all"
              aria-label="Clear input"
            >
              <i className="ti ti-trash" />
              <span>Clear</span>
            </button>
          )}
        </div>

        <div className={styles.jwtwChromeRight}>
          {statusBadge && (
            <div className={`${styles.jwtwBadge} ${statusBadge.cls}`}>
              <i className={`ti ${statusBadge.icon}`} />
              {statusBadge.label}
            </div>
          )}
          {decodedToken && (
            <button
              className={`${styles.jwtwActionBtn}${copiedKey === "full-token" ? ` ${styles.copied}` : ""}`}
              onClick={() => handleCopy(decodedToken.raw, "full-token")}
              aria-label="Copy full token"
            >
              <i className={`ti ${copiedKey === "full-token" ? "ti-check" : "ti-copy"}`} />
              <span>{copiedKey === "full-token" ? "Copied" : "Copy Token"}</span>
            </button>
          )}
        </div>
      </div>

      <div className={styles.jwtwMobileSwitcher}>
        <button
          type="button"
          className={`${styles.jwtwSwTab}${mobilePanel === "input" ? ` ${styles.active}` : ""}`}
          onClick={goToInput}
        >
          <i className="ti ti-lock" />
          Token Input
        </button>
        <div className={styles.jwtwSwDivider} />
        <button
          type="button"
          className={`${styles.jwtwSwTab}${mobilePanel === "output" ? ` ${styles.active}` : ""}`}
          onClick={goToOutput}
        >
          <i className="ti ti-list-details" />
          Decoded
          {decodedToken && mobilePanel !== "output" && (
            <span className={styles.jwtwSwDot} />
          )}
        </button>
      </div>

      <div className={styles.jwtwBody}>
        <div
          className={`${styles.jwtwInputPanel} ${
            mobilePanel === "input" ? styles.jwtwMobVisible : styles.jwtwMobHidden
          }`}
        >
          <div className={styles.jwtwInputPanelBar}>
            <div className={styles.jwtwPanelLabel}>
              <i className="ti ti-lock" />
              JWT Token
            </div>
            <div className={styles.jwtwPanelActions}>
              {input && (
                <span className={styles.jwtwCharCount}>{input.length.toLocaleString()} ch</span>
              )}
              {input && !parseError && decodedToken && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#16a34a",
                    background: "#dcfce7",
                    padding: "2px 7px",
                    borderRadius: 99,
                  }}
                >
                  <i className="ti ti-check" style={{ fontSize: 11 }} /> Valid
                </span>
              )}
              {input && parseError && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    fontSize: 10,
                    fontWeight: 600,
                    color: "#dc2626",
                    background: "#fef2f2",
                    padding: "2px 7px",
                    borderRadius: 99,
                  }}
                >
                  <i className="ti ti-alert-circle" style={{ fontSize: 11 }} /> Invalid
                </span>
              )}
              <button
                type="button"
                className={styles.jwtwIconBtn}
                onClick={() => setInput("")}
                disabled={!input}
                title="Clear input"
                aria-label="Clear input"
                style={{ height: 26, padding: "0 8px" }}
              >
                <i className="ti ti-x" />
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            className={`${styles.jwtwInput}${parseError ? ` ${styles.jwtwInputError}` : ""}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your JWT token here… (Bearer prefix is stripped automatically)"
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            aria-label="JWT token input"
            aria-invalid={!!parseError}
          />

          {parseError && (
            <div className={styles.jwtwErrorBanner} role="alert">
              <i className="ti ti-alert-triangle" />
              <div>
                <strong>{parseError.message}</strong>
                {parseError.details && <p>{parseError.details}</p>}
              </div>
            </div>
          )}

          {input && decodedToken && (
            <div className={styles.jwtwMobCta}>
              <button type="button" className={styles.jwtwCtaBtn} onClick={goToOutput}>
                <i className="ti ti-list-details" />
                View Decoded Claims
                <i className="ti ti-chevron-right" style={{ marginLeft: "auto", opacity: 0.7 }} />
              </button>
            </div>
          )}
        </div>

        <div className={styles.jwtwGutter}>
          <div className={styles.jwtwGutterLine} />
          <div className={styles.jwtwGutterNode}>
            <i className="ti ti-arrows-exchange" />
          </div>
          <div className={styles.jwtwGutterLine} />
        </div>

        <div
          className={`${styles.jwtwOutputPanel} ${
            mobilePanel === "output" ? styles.jwtwMobVisible : styles.jwtwMobHidden
          }`}
        >
          {!decodedToken && !parseError && (
            <div className={styles.jwtwEmpty}>
              <div className={styles.jwtwEmptyIcon}>
                <i className="ti ti-key" />
              </div>
              <h3 className={styles.jwtwEmptyTitle}>Decode & Analyze JWT Tokens</h3>
              <p className={styles.jwtwEmptyDesc}>
                Paste a JWT token on the left to decode its header, payload, and signature.
                View security analysis, visualizations, and detailed claim information.
              </p>
              <div className={styles.jwtwEmptySamples}>
                {SAMPLE_TOKENS.slice(0, 2).map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={styles.jwtwEmptySampleBtn}
                    onClick={() => loadPreset(preset.token)}
                  >
                    Try {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!decodedToken && parseError && (
            <div className={styles.jwtwEmpty}>
              <div
                className={styles.jwtwEmptyIcon}
                style={{
                  background: "#fef2f2",
                  borderColor: "#fecaca",
                  color: "#dc2626",
                }}
              >
                <i className="ti ti-alert-triangle" />
              </div>
              <h3 className={styles.jwtwEmptyTitle}>Invalid JWT</h3>
              <p className={styles.jwtwEmptyDesc}>{parseError.message}</p>
            </div>
          )}

          {decodedToken && (
            <>
              <div className={styles.jwtwOutputPanelBar}>
                <div className={styles.jwtwPanelLabel}>
                  <i className="ti ti-list-details" />
                  Decoded Token
                </div>
                <div className={styles.jwtwPanelActions}>
                  {statusBadge && (
                    <div
                      className={`${styles.jwtwBadge} ${statusBadge.cls}`}
                      style={{ height: 22, fontSize: 10 }}
                    >
                      <i className={`ti ${statusBadge.icon}`} />
                      {statusBadge.label}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.jwtwTabsBar}>
                <nav className={styles.jwtwTabs} role="tablist" aria-label="Token views">
                  {OUTPUT_TABS.map((tab) => (
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
                      {tab.id === "security" && securityIssueCount > 0 && (
                        <span className={styles.jwtwTabBadge}>{securityIssueCount}</span>
                      )}
                      {tab.id === "decoded" && decodedToken.metadata.isExpired && (
                        <span className={styles.jwtwTabDot} />
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className={styles.jwtwOutputContent}>
                {viewTab === "decoded" && (
                  <div
                    role="tabpanel"
                    id="jwtw-panel-decoded"
                    style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
                  >
                    <ClaimsExplorer
                      header={decodedToken.decoded.header}
                      payload={decodedToken.decoded.payload}
                      onCopy={handleCopy}
                      copiedKey={copiedKey}
                    />
                  </div>
                )}

                {viewTab === "visualizer" && (
                  <div
                    role="tabpanel"
                    id="jwtw-panel-visualizer"
                    style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
                  >
                    <TokenVisualizer token={decodedToken} />
                  </div>
                )}

                {viewTab === "security" && (
                  <div
                    role="tabpanel"
                    id="jwtw-panel-security"
                    style={{ flex: 1, minHeight: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}
                  >
                    <SecurityAnalyzer token={decodedToken} />
                  </div>
                )}

                {viewTab === "raw" && (
                  <div
                    role="tabpanel"
                    id="jwtw-panel-raw"
                    className={styles.jwtwRaw}
                  >
                    {rawSections.map((section) => (
                      <div key={section.label} className={styles.jwtwRawSection}>
                        <div className={styles.jwtwRawHeader}>
                          <div className={styles.jwtwRawHeaderLeft}>
                            <div
                              className={styles.jwtwRawDot}
                              style={{ background: RAW_DOT_COLORS[section.label] ?? "#6b7280" }}
                            />
                            {section.label}
                          </div>
                          <button
                            className={`${styles.jwtwCopyBtnSm}${copiedKey === section.copyKey ? ` ${styles.copied}` : ""}`}
                            onClick={() => handleCopy(section.content, section.copyKey)}
                            aria-label={`Copy ${section.label}`}
                          >
                            <i
                              className={`ti ${copiedKey === section.copyKey ? "ti-check" : "ti-copy"}`}
                            />
                            {copiedKey === section.copyKey ? "Copied" : "Copy"}
                          </button>
                        </div>
                        <pre
                          className={`${styles.jwtwRawCode}${section.wrap ? ` ${styles.jwtwRawSig}` : ""}`}
                        >
                          {section.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.jwtwMobActions}>
                <button
                  type="button"
                  className={`${styles.jwtwMobBtn}${copiedKey === "mob-token" ? ` ${styles.copied}` : ""}`}
                  onClick={() => handleCopy(decodedToken.raw, "mob-token")}
                >
                  <i className={`ti ${copiedKey === "mob-token" ? "ti-check" : "ti-copy"}`} />
                  {copiedKey === "mob-token" ? "Copied!" : "Copy Token"}
                </button>
                <button
                  type="button"
                  className={styles.jwtwMobBtn}
                  onClick={goToInput}
                >
                  <i className="ti ti-edit" />
                  Edit Token
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className={styles.jwtwFooter}>
        <div className={styles.jwtwFooterLeft}>
          <i className="ti ti-shield-lock" />
          <span>All processing happens in your browser — tokens are never sent to any server</span>
        </div>
        {decodedToken && (
          <div className={styles.jwtwFooterRight}>
            <span>{Object.keys(decodedToken.decoded.payload).length} claims</span>
            <span>·</span>
            <span>{decodedToken.metadata.algorithm}</span>
            <span>·</span>
            <span
              className={
                decodedToken.metadata.isExpired
                  ? styles.jwtwInvalid
                  : styles.jwtwValid
              }
            >
              <i
                className={`ti ${decodedToken.metadata.isExpired ? "ti-x" : "ti-check"}`}
              />
              {decodedToken.metadata.isExpired ? "Expired" : "Active"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}