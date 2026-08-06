// features\dev\case-converter\CaseAnalyzer.tsx
"use client";

import { useMemo } from "react";
import { analyzeText, detectCase, generateVariableNames, CASE_FORMATS } from "./ts/utils";
import styles from "./style/CaseAnalyzer.module.css";

interface CaseAnalyzerProps {
  input: string;
  onInputChange: (value: string) => void;
}

export default function CaseAnalyzer({ input, onInputChange }: CaseAnalyzerProps) {
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
    return CASE_FORMATS.find((f) => f.id === analysis.originalCase);
  }, [analysis]);

  return (
    <>
      <div className={styles.caRoot}>
        {/*  Input Section  */}
        <div className={styles.caInputSection}>
          <div className={styles.caInputHeader}>
            <div className={styles.caInputLabel}>
              <i className="ti ti-pencil" />
              Text to Analyze
            </div>
            {input && (
              <button className={styles.caClearBtn} onClick={() => onInputChange("")} title="Clear">
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
          />
        </div>

        {/*  Analysis Results  */}
        {analysis ? (
          <div className={styles.caContent}>
            {/* Detection Card */}
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
                          <span className={styles.caDetectionName}>{detectedCaseInfo.label}</span>
                          <span className={styles.caDetectionDesc}>{detectedCaseInfo.description}</span>
                        </>
                      ) : (
                        <>
                          <i className="ti ti-help-circle" />
                          <span className={styles.caDetectionName}>
                            {analysis.originalCase === "mixed" ? "Mixed Case" : "Unknown Format"}
                          </span>
                          <span className={styles.caDetectionDesc}>
                            No standard case format detected
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
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

            {/* Statistics Card */}
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
                      <span className={styles.caStatValue}>{analysis.hasNumbers ? "Yes" : "No"}</span>
                      <span className={styles.caStatLabel}>Has Numbers</span>
                    </div>
                  </div>

                  <div className={styles.caStat}>
                    <div className={styles.caStatIcon}>
                      <i className="ti ti-asterisk" />
                    </div>
                    <div className={styles.caStatContent}>
                      <span className={styles.caStatValue}>
                        {analysis.hasSpecialChars ? "Yes" : "No"}
                      </span>
                      <span className={styles.caStatLabel}>Special Chars</span>
                    </div>
                  </div>
                </div>

                {/* Word Breakdown */}
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

            {/* Variable Name Suggestions */}
            {variableNames && (
              <div className={styles.caCard}>
                <div className={styles.caCardHeader}>
                  <i className="ti ti-code" />
                  <span>Variable Name Suggestions</span>
                </div>
                <div className={styles.caCardBody}>
                  <div className={styles.caVariables}>
                    {Object.entries(variableNames).map(([context, name]) => (
                      <div key={context} className={styles.caVariable}>
                        <div className={styles.caVariableContext}>{context}</div>
                        <code className={styles.caVariableValue}>{name}</code>
                        <button
                          type="button"
                          className={styles.caVariableCopy}
                          onClick={() => navigator.clipboard.writeText(name)}
                          title="Copy"
                        >
                          <i className="ti ti-copy" />
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
            <p className={styles.caEmptyTitle}>Analyze Text Case</p>
            <p className={styles.caEmptyDesc}>
              Enter text above to detect its case format, view statistics, and get variable name
              suggestions for different programming contexts.
            </p>
          </div>
        )}
      </div>
    </>
  );
}