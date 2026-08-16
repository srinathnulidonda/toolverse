// features/dev/case-converter/CasePreview.tsx
"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { convertCase, CASE_FORMATS, detectCase, type CaseType, type ConversionOptions } from "./ts/utils";
import styles from "./style/CasePreview.module.css";

interface CasePreviewProps {
  input: string;
  onInputChange: (value: string) => void;
  selectedCases: CaseType[];
  autoDetect: boolean;
  preserveNumbers: boolean;
  preserveAcronyms: boolean;
  onConvert?: (text: string, caseType: CaseType, result: string) => void;
}

export default function CasePreview({
  input,
  onInputChange,
  selectedCases,
  autoDetect,
  preserveNumbers,
  preserveAcronyms,
  onConvert,
}: CasePreviewProps) {
  const [copiedKey, setCopiedKey] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"input" | "output">("input");
  const rootRef = useRef<HTMLDivElement>(null);

  const options: ConversionOptions = useMemo(
    () => ({ preserveNumbers, preserveAcronyms }),
    [preserveNumbers, preserveAcronyms]
  );

  const detected = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return detectCase(input);
    } catch {
      return null;
    }
  }, [input]);

  const results = useMemo(() => {
    if (!input.trim()) return [];
    return CASE_FORMATS.filter((format) => selectedCases.includes(format.id))
      .filter((format) => !(autoDetect && detected === format.id))
      .map((format) => ({
        ...format,
        converted: convertCase(input, format.id, options),
      }));
  }, [input, selectedCases, options, autoDetect, detected]);

  const detectedInfo = useMemo(() => {
    if (!autoDetect || !detected) return null;
    return CASE_FORMATS.find((f) => f.id === detected) || null;
  }, [autoDetect, detected]);

  const handleCopy = useCallback(
    async (text: string, key: string, caseType: CaseType) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(""), 1500);
        onConvert?.(input, caseType, text);
      } catch {
        setCopiedKey("");
      }
    },
    [input, onConvert]
  );

  const handleCopyAll = useCallback(async () => {
    if (!results.length) return;
    const text = results.map((r) => `${r.label}: ${r.converted}`).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey("all");
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  }, [results]);

  const handleCopyFirst = useCallback(() => {
    if (!results.length) return;
    const first = results[0];
    handleCopy(first.converted, `mob-${first.id}`, first.id);
  }, [results, handleCopy]);

  const goToOutput = useCallback(() => {
    setMobilePanel("output");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  const goToInput = useCallback(() => {
    setMobilePanel("input");
    setTimeout(() => rootRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 40);
  }, []);

  return (
    <div className={styles.cpRoot} ref={rootRef}>
      <div className={styles.cpMobileSwitcher}>
        <button
          type="button"
          className={`${styles.cpSwTab} ${mobilePanel === "input" ? styles.active : ""}`}
          onClick={goToInput}
        >
          <i className="ti ti-pencil" />
          Input
        </button>
        <div className={styles.cpSwDivider} />
        <button
          type="button"
          className={`${styles.cpSwTab} ${mobilePanel === "output" ? styles.active : ""}`}
          onClick={goToOutput}
        >
          <i className="ti ti-sparkles" />
          Results
          {results.length > 0 && mobilePanel !== "output" && <span className={styles.cpSwDot} />}
        </button>
      </div>

      <div className={styles.cpBody}>
        <div className={`${styles.cpPanel} ${mobilePanel === "input" ? styles.mobVisible : styles.mobHidden}`}>
          <div className={styles.cpPanelBar}>
            <div className={styles.cpPanelLabel}>
              <i className="ti ti-pencil" />
              Input Text
            </div>
            <div className={styles.cpPanelActions}>
              {input && <span className={styles.cpCharCount}>{input.length.toLocaleString()} ch</span>}
              <button
                type="button"
                className={styles.cpIconBtn}
                onClick={() => onInputChange("")}
                disabled={!input}
                title="Clear"
                aria-label="Clear input"
              >
                <i className="ti ti-x" />
              </button>
            </div>
          </div>
          <textarea
            className={styles.cpTextarea}
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter text to convert case..."
            spellCheck={false}
            aria-label="Text input"
          />
          {input && results.length > 0 && (
            <div className={styles.cpMobCta}>
              <button type="button" className={styles.cpCtaBtn} onClick={goToOutput}>
                <i className="ti ti-sparkles" />
                View {results.length} Converted Case{results.length !== 1 ? "s" : ""}
                <i className="ti ti-chevron-right" />
              </button>
            </div>
          )}
        </div>

        <div className={styles.cpGutter}>
          <div className={styles.cpGutterLine} />
          <div className={styles.cpGutterNode}>
            <i className="ti ti-arrow-right" />
          </div>
          <div className={styles.cpGutterLine} />
        </div>

        <div className={`${styles.cpPanel} ${mobilePanel === "output" ? styles.mobVisible : styles.mobHidden}`}>
          <div className={styles.cpPanelBar}>
            <div className={styles.cpPanelLabel}>
              <i className="ti ti-sparkles" />
              Converted Cases
            </div>
            <div className={styles.cpPanelActions}>
              {results.length > 0 && (
                <>
                  <span className={styles.cpCountBadge}>{results.length}</span>
                  <button
                    type="button"
                    className={styles.cpIconBtn}
                    onClick={handleCopyAll}
                    title="Copy all"
                    aria-label="Copy all results"
                  >
                    <i className={`ti ${copiedKey === "all" ? "ti-check" : "ti-copy"}`} />
                  </button>
                </>
              )}
            </div>
          </div>

          {!input && (
            <div className={styles.cpEmpty}>
              <div className={styles.cpEmptyIcon}>
                <i className="ti ti-letter-case" />
              </div>
              <h3 className={styles.cpEmptyTitle}>Convert Text Case</h3>
              <p className={styles.cpEmptyDesc}>
                Convert text between camelCase, snake_case, kebab-case, and more. Enter text on the left
                to get started.
              </p>
            </div>
          )}

          {input && results.length === 0 && !detectedInfo && (
            <div className={styles.cpEmpty}>
              <div className={styles.cpEmptyIcon}>
                <i className="ti ti-mood-empty" />
              </div>
              <h3 className={styles.cpEmptyTitle}>No Formats Selected</h3>
              <p className={styles.cpEmptyDesc}>
                Open Options above and choose at least one output format to see results.
              </p>
            </div>
          )}

          {input && (results.length > 0 || detectedInfo) && (
            <div className={styles.cpOutputBody}>
              {detectedInfo && (
                <div className={styles.cpAutoNote}>
                  <i className="ti ti-info-circle" />
                  <span>
                    Already in <strong>{detectedInfo.label}</strong> — hidden from results
                  </span>
                </div>
              )}
              {results.map((result) => (
                <div key={result.id} className={styles.cpResultCard}>
                  <div className={styles.cpResultHeader}>
                    <div className={styles.cpResultInfo}>
                      <i className={`ti ${result.icon}`} />
                      <div className={styles.cpResultText}>
                        <span className={styles.cpResultLabel}>{result.label}</span>
                        <span className={styles.cpResultDesc}>{result.description}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={`${styles.cpCopyBtn} ${copiedKey === result.id ? styles.copied : ""}`}
                      onClick={() => handleCopy(result.converted, result.id, result.id)}
                    >
                      <i className={`ti ${copiedKey === result.id ? "ti-check" : "ti-copy"}`} />
                      {copiedKey === result.id ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className={styles.cpResultValue}>{result.converted}</div>
                  <div className={styles.cpResultExample}>Example: {result.example}</div>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className={styles.cpMobActions}>
              <button
                type="button"
                className={`${styles.cpMobBtn} ${copiedKey.startsWith("mob-") ? styles.copied : ""}`}
                onClick={handleCopyFirst}
              >
                <i className={`ti ${copiedKey.startsWith("mob-") ? "ti-check" : "ti-copy"}`} />
                Copy {results[0]?.label}
              </button>
              <button
                type="button"
                className={`${styles.cpMobBtn} ${copiedKey === "all" ? styles.copied : ""}`}
                onClick={handleCopyAll}
              >
                <i className={`ti ${copiedKey === "all" ? "ti-check" : "ti-copy"}`} />
                Copy All
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}