// features/dev/css-minifier/CSSPreview.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { processCSS, validateCSS, createId, capText, SAMPLE_CSS } from "./ts/utils";
import { formatBytes } from "@/utils";
import type { MinifyOptions, CSSHistoryEntry } from "./ts/utils";
import styles from "./style/CSSPreview.module.css";

interface CSSPreviewProps {
  onProcess?: (entry: CSSHistoryEntry) => void;
  initialInput?: string;
}

export default function CSSPreview({ onProcess, initialInput = "" }: CSSPreviewProps) {
  const [input, setInput] = useState(initialInput);
  const [options, setOptions] = useState<MinifyOptions>({
    removeComments: true,
    removeWhitespace: true,
    removeLastSemicolon: true,
    preserveImportant: true,
  });
  const [copiedKey, setCopiedKey] = useState("");
  const [mobileView, setMobileView] = useState<"input" | "output">("input");

  const validation = useMemo(() => (input.trim() ? validateCSS(input) : null), [input]);

  const result = useMemo(() => {
    if (!input.trim()) return null;
    try {
      return processCSS(input, options);
    } catch {
      return null;
    }
  }, [input, options]);

  const commitToHistory = useCallback(() => {
    if (!result || !onProcess) return;
    onProcess({
      id: createId(),
      input: capText(input),
      output: capText(result.output),
      timestamp: Date.now(),
      stats: result.stats,
    });
  }, [result, input, onProcess]);

  const handleCopy = useCallback(
    async (text: string, key: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
      if (key === "output") commitToHistory();
    },
    [commitToHistory]
  );

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.output], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.css";
    a.click();
    URL.revokeObjectURL(url);
    commitToHistory();
  }, [result, commitToHistory]);

  const loadSample = useCallback(() => {
    setInput(SAMPLE_CSS);
    setMobileView("input");
  }, []);

  return (
    <div className={styles.cpRoot}>
      <div className={styles.cpOptions}>
        <div className={styles.cpOptionsLabel}>Options:</div>
        <label className={styles.cpToggle}>
          <input
            type="checkbox"
            checked={options.removeComments}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, removeComments: e.target.checked }))
            }
          />
          <span className={styles.cpToggleTrack}>
            <span className={styles.cpToggleThumb} />
          </span>
          <span className={styles.cpToggleLabel}>Remove comments</span>
        </label>

        <label className={styles.cpToggle}>
          <input
            type="checkbox"
            checked={options.preserveImportant}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, preserveImportant: e.target.checked }))
            }
            disabled={!options.removeComments}
          />
          <span className={styles.cpToggleTrack}>
            <span className={styles.cpToggleThumb} />
          </span>
          <span className={styles.cpToggleLabel}>Preserve /*! */</span>
        </label>

        <label className={styles.cpToggle}>
          <input
            type="checkbox"
            checked={options.removeLastSemicolon}
            onChange={(e) =>
              setOptions((prev) => ({ ...prev, removeLastSemicolon: e.target.checked }))
            }
          />
          <span className={styles.cpToggleTrack}>
            <span className={styles.cpToggleThumb} />
          </span>
          <span className={styles.cpToggleLabel}>Remove last semicolon</span>
        </label>

        <button type="button" className={styles.cpSampleBtn} onClick={loadSample}>
          <i className="ti ti-wand" />
          Sample
        </button>
      </div>

      <div className={styles.cpMobileTabs}>
        <button
          type="button"
          className={`${styles.cpMobileTab} ${mobileView === "input" ? styles.active : ""}`}
          onClick={() => setMobileView("input")}
        >
          <i className="ti ti-file-code" />
          Input
        </button>
        <button
          type="button"
          className={`${styles.cpMobileTab} ${mobileView === "output" ? styles.active : ""}`}
          onClick={() => setMobileView("output")}
        >
          <i className="ti ti-file-zip" />
          Output
          {result && <span className={styles.cpMobileDot} />}
        </button>
      </div>

      <div className={styles.cpPanels}>
        <div
          className={`${styles.cpPanel} ${mobileView === "input" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.cpPanelHeader}>
            <div className={styles.cpPanelLabel}>
              <i className="ti ti-file-code" />
              Original CSS
            </div>
            {input && (
              <button
                className={styles.cpClearBtn}
                onClick={() => setInput("")}
                title="Clear"
                aria-label="Clear input"
              >
                <i className="ti ti-x" />
              </button>
            )}
          </div>
          {validation && !validation.valid && (
            <div className={styles.cpWarning}>
              <i className="ti ti-alert-triangle" />
              {validation.error}
            </div>
          )}
          <textarea
            className={styles.cpTextarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste your CSS here..."
            spellCheck={false}
          />
        </div>

        <div className={styles.cpDivider}>
          <div className={styles.cpDividerIcon} aria-hidden="true">
            <i className="ti ti-arrow-right" />
          </div>
        </div>

        <div
          className={`${styles.cpPanel} ${mobileView === "output" ? styles.mobileVisible : styles.mobileHidden}`}
        >
          <div className={styles.cpPanelHeader}>
            <div className={styles.cpPanelLabel}>
              <i className="ti ti-file-zip" />
              Minified CSS
            </div>
            {result && (
              <div className={styles.cpPanelActions}>
                <button
                  className={`${styles.cpCopyBtn}${copiedKey === "output" ? ` ${styles.copied}` : ""}`}
                  onClick={() => handleCopy(result.output, "output")}
                >
                  <i className={`ti ${copiedKey === "output" ? "ti-check" : "ti-copy"}`} />
                  {copiedKey === "output" ? "Copied" : "Copy"}
                </button>
                <button className={styles.cpDownloadBtn} onClick={handleDownload}>
                  <i className="ti ti-download" />
                  Download
                </button>
              </div>
            )}
          </div>

          {result ? (
            <>
              <pre className={styles.cpOutput}>{result.output}</pre>
              <div className={styles.cpStats}>
                <div className={styles.cpStat}>
                  <span className={styles.cpStatLabel}>Original:</span>
                  <span className={styles.cpStatValue}>{formatBytes(result.stats.original)}</span>
                </div>
                <div className={styles.cpStat}>
                  <span className={styles.cpStatLabel}>Minified:</span>
                  <span className={styles.cpStatValue}>{formatBytes(result.stats.minified)}</span>
                </div>
                <div className={`${styles.cpStat} ${styles.cpStatSuccess}`}>
                  <span className={styles.cpStatLabel}>Saved:</span>
                  <span className={styles.cpStatValue}>
                    {formatBytes(result.stats.savings)} ({result.stats.savingsPercent}%)
                  </span>
                </div>
                <div className={styles.cpStat}>
                  <span className={styles.cpStatLabel}>Rules:</span>
                  <span className={styles.cpStatValue}>{result.stats.rules}</span>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.cpEmpty}>
              <div className={styles.cpEmptyIcon} aria-hidden="true">
                <i className="ti ti-brand-css3" />
              </div>
              <p className={styles.cpEmptyTitle}>Minified CSS appears here</p>
              <p className={styles.cpEmptyDesc}>
                Paste CSS code on the left or load a sample to reduce file size
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}