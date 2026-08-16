// features/dev/case-converter/CaseAnalyzer.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { analyzeText, generateVariableNames, CASE_FORMATS } from "./ts/utils";
import styles from "./style/CaseAnalyzer.module.css";

interface CaseAnalyzerProps {
  input: string;
  onInputChange: (value: string) => void;
}

export default function CaseAnalyzer({ input, onInputChange }: CaseAnalyzerProps) {
  const [copiedKey, setCopiedKey] = useState("");

  const analysis = useMemo(() => {
    if (!input.trim()) return null;
    return analyzeText(input);
  }, [input]);

  const variableNames = useMemo(() => {
    if (!input.trim()) return null;
    return generateVariableNames(input);
  }, [input]);

  const detectedCaseInfo = useMemo(() => {
    if (!analysis) return null;
    return CASE_FORMATS.find((f) => f.id === analysis.originalCase) || null;
  }, [analysis]);

  const handleCopy = useCallback(async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(""), 1500);
    } catch {
      setCopiedKey("");
    }
  }, []);

  const handleCopyAllVariables = useCallback(async () => {
    if (!variableNames) return;
    const text = Object.entries(variableNames)
      .map(([context, name]) => `${context}: ${name}`)
      .join("\n");
    await handleCopy(text, "all-vars");
  }, [variableNames, handleCopy]);

  return (
    <div className={styles.caRoot}>
      <div className={styles.caInputSection}>
        <div className={styles.caInputHeader}>
          <div className={styles.caInputLabel}>
            <i className="ti ti-pencil" />
            Text to Analyze
          </div>
          {input && (
            <button
              type="button"
              className={styles.caClearBtn}
              onClick={() => onInputChange("")}
              title="Clear"
              aria-label="Clear input"
            >
              <i className="ti ti-x" />
            </button>
          )}
        </div>
        <textarea
          className={styles.caTextarea}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Enter text to analyze its case format and structure..."
          rows={3}
          spellCheck={false}
          aria-label="Text to analyze"
        />
      </div>

      {analysis ? (
        <div className={styles.caContent}>
          <div className={styles.caCard}>
            <div className={styles.caCardHeader}>
              <i className="ti ti-scan" />
              <span>Detection Results</span>
            </div>
            <div className={styles.caCardBody}>
              <div className={styles.caDetection}>
                <div className={styles.caDetectionMain}>
                  <span className={styles.caDetectionLabel}>Detected Format:</span>
                  <div className={styles.caDetectionResult}>
                    {detectedCaseInfo ? (
                      <>
                        <i className={`ti ${detectedCaseInfo.icon}`} />
                        <span>
                          <span className={styles.caDetectionName}>{detectedCaseInfo.label}</span>
                          <span className={styles.caDetectionDesc}>{detectedCaseInfo.description}</span>
                        </span>
                      </>
                    ) : (
                      <>
                        <i className="ti ti-help-circle" />
                        <span>
                          <span className={styles.caDetectionName}>
                            {analysis.originalCase === "mixed" ? "Mixed Case" : "Unknown Format"}
                          </span>
                          <span className={styles.caDetectionDesc}>No standard case format detected</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {analysis.suggestions.length > 0 && (
                <div className={styles.caSuggestions}>
                  <div className={styles.caSuggestionsHeader}>
                    <i className="ti ti-bulb" />
                    Suggestions
                  </div>
                  <ul className={styles.caSuggestionsList}>
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className={styles.caSuggestionItem}>
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className={styles.caCard}>
            <div className={styles.caCardHeader}>
              <i className="ti ti-chart-dots" />
              <span>Statistics</span>
            </div>
            <div className={styles.caCardBody}>
              <div className={styles.caStatsGrid}>
                <div className={styles.caStat}>
                  <div className={styles.caStatIcon}>
                    <i className="ti ti-text-size" />
                  </div>
                  <div className={styles.caStatContent}>
                    <span className={styles.caStatValue}>{analysis.characterCount}</span>
                    <span className={styles.caStatLabel}>Characters</span>
                  </div>
                </div>

                <div className={styles.caStat}>
                  <div className={styles.caStatIcon}>
                    <i className="ti ti-vocabulary" />
                  </div>
                  <div className={styles.caStatContent}>
                    <span className={styles.caStatValue}>{analysis.wordCount}</span>
                    <span className={styles.caStatLabel}>Words</span>
                  </div>
                </div>

                <div className={styles.caStat}>
                  <div className={styles.caStatIcon}>
                    <i className="ti ti-123" />
                  </div>
                  <div className={styles.caStatContent}>
                    <span
                      className={`${styles.caStatValue} ${analysis.hasNumbers ? styles.caStatYes : styles.caStatNo}`}
                    >
                      {analysis.hasNumbers ? "Yes" : "No"}
                    </span>
                    <span className={styles.caStatLabel}>Has Numbers</span>
                  </div>
                </div>

                <div className={styles.caStat}>
                  <div className={styles.caStatIcon}>
                    <i className="ti ti-asterisk" />
                  </div>
                  <div className={styles.caStatContent}>
                    <span
                      className={`${styles.caStatValue} ${analysis.hasSpecialChars ? styles.caStatYes : styles.caStatNo}`}
                    >
                      {analysis.hasSpecialChars ? "Yes" : "No"}
                    </span>
                    <span className={styles.caStatLabel}>Special Chars</span>
                  </div>
                </div>
              </div>

              {analysis.words.length > 0 && (
                <div className={styles.caWords}>
                  <div className={styles.caWordsHeader}>
                    <i className="ti ti-list" />
                    Word Breakdown
                  </div>
                  <div className={styles.caWordsList}>
                    {analysis.words.map((word, idx) => (
                      <span key={idx} className={styles.caWordTag}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {variableNames && (
            <div className={styles.caCard}>
              <div className={styles.caCardHeader}>
                <i className="ti ti-code" />
                <span>Variable Name Suggestions</span>
                <button type="button" className={styles.caCopyAllBtn} onClick={handleCopyAllVariables}>
                  <i className={`ti ${copiedKey === "all-vars" ? "ti-check" : "ti-copy"}`} />
                  {copiedKey === "all-vars" ? "Copied" : "Copy All"}
                </button>
              </div>
              <div className={styles.caCardBody}>
                <div className={styles.caVariables}>
                  {Object.entries(variableNames).map(([context, name]) => (
                    <div key={context} className={styles.caVariable}>
                      <div className={styles.caVariableContext}>{context}</div>
                      <code className={styles.caVariableValue}>{name}</code>
                      <button
                        type="button"
                        className={`${styles.caVariableCopy} ${copiedKey === context ? styles.copied : ""}`}
                        onClick={() => handleCopy(name, context)}
                        title="Copy"
                        aria-label={`Copy ${context} variable name`}
                      >
                        <i className={`ti ${copiedKey === context ? "ti-check" : "ti-copy"}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.caEmpty}>
          <div className={styles.caEmptyIcon}>
            <i className="ti ti-chart-dots" />
          </div>
          <h3 className={styles.caEmptyTitle}>Analyze Text Case</h3>
          <p className={styles.caEmptyDesc}>
            Enter text above to detect its case format, view statistics, and get variable name
            suggestions for different programming contexts.
          </p>
        </div>
      )}
    </div>
  );
}