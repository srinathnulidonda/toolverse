// features/dev/case-converter/CaseAnalyzer.tsx
"use client";

import { useMemo } from "react";
import { analyzeText, detectCase, generateVariableNames, CASE_FORMATS } from "./utils";

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
      <div className="ca-root">
        {/*  Input Section  */}
        <div className="ca-input-section">
          <div className="ca-input-header">
            <div className="ca-input-label">
              <i className="ti ti-pencil" />
              Text to Analyze
            </div>
            {input && (
              <button className="ca-clear-btn" onClick={() => onInputChange("")} title="Clear">
                <i className="ti ti-x" />
              </button>
            )}
          </div>
          <textarea
            className="ca-textarea"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="Enter text to analyze its case format and structure..."
            rows={3}
            spellCheck={false}
          />
        </div>

        {/*  Analysis Results  */}
        {analysis ? (
          <div className="ca-content">
            {/* Detection Card */}
            <div className="ca-card">
              <div className="ca-card-header">
                <i className="ti ti-scan" />
                <span>Detection Results</span>
              </div>
              <div className="ca-card-body">
                <div className="ca-detection">
                  <div className="ca-detection-main">
                    <span className="ca-detection-label">Detected Format:</span>
                    <div className="ca-detection-result">
                      {detectedCaseInfo ? (
                        <>
                          <i className={`ti ${detectedCaseInfo.icon}`} />
                          <span className="ca-detection-name">{detectedCaseInfo.label}</span>
                          <span className="ca-detection-desc">{detectedCaseInfo.description}</span>
                        </>
                      ) : (
                        <>
                          <i className="ti ti-help-circle" />
                          <span className="ca-detection-name">
                            {analysis.originalCase === "mixed" ? "Mixed Case" : "Unknown Format"}
                          </span>
                          <span className="ca-detection-desc">
                            No standard case format detected
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suggestions */}
                {analysis.suggestions.length > 0 && (
                  <div className="ca-suggestions">
                    <div className="ca-suggestions-header">
                      <i className="ti ti-bulb" />
                      Suggestions
                    </div>
                    <ul className="ca-suggestions-list">
                      {analysis.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="ca-suggestion-item">
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Statistics Card */}
            <div className="ca-card">
              <div className="ca-card-header">
                <i className="ti ti-chart-dots" />
                <span>Statistics</span>
              </div>
              <div className="ca-card-body">
                <div className="ca-stats-grid">
                  <div className="ca-stat">
                    <div className="ca-stat-icon">
                      <i className="ti ti-text-size" />
                    </div>
                    <div className="ca-stat-content">
                      <span className="ca-stat-value">{analysis.characterCount}</span>
                      <span className="ca-stat-label">Characters</span>
                    </div>
                  </div>

                  <div className="ca-stat">
                    <div className="ca-stat-icon">
                      <i className="ti ti-vocabulary" />
                    </div>
                    <div className="ca-stat-content">
                      <span className="ca-stat-value">{analysis.wordCount}</span>
                      <span className="ca-stat-label">Words</span>
                    </div>
                  </div>

                  <div className="ca-stat">
                    <div className="ca-stat-icon">
                      <i className="ti ti-123" />
                    </div>
                    <div className="ca-stat-content">
                      <span className="ca-stat-value">{analysis.hasNumbers ? "Yes" : "No"}</span>
                      <span className="ca-stat-label">Has Numbers</span>
                    </div>
                  </div>

                  <div className="ca-stat">
                    <div className="ca-stat-icon">
                      <i className="ti ti-asterisk" />
                    </div>
                    <div className="ca-stat-content">
                      <span className="ca-stat-value">
                        {analysis.hasSpecialChars ? "Yes" : "No"}
                      </span>
                      <span className="ca-stat-label">Special Chars</span>
                    </div>
                  </div>
                </div>

                {/* Word Breakdown */}
                {analysis.words.length > 0 && (
                  <div className="ca-words">
                    <div className="ca-words-header">
                      <i className="ti ti-list" />
                      Word Breakdown
                    </div>
                    <div className="ca-words-list">
                      {analysis.words.map((word, idx) => (
                        <span key={idx} className="ca-word-tag">
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
              <div className="ca-card">
                <div className="ca-card-header">
                  <i className="ti ti-code" />
                  <span>Variable Name Suggestions</span>
                </div>
                <div className="ca-card-body">
                  <div className="ca-variables">
                    {Object.entries(variableNames).map(([context, name]) => (
                      <div key={context} className="ca-variable">
                        <div className="ca-variable-context">{context}</div>
                        <code className="ca-variable-value">{name}</code>
                        <button
                          type="button"
                          className="ca-variable-copy"
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
          <div className="ca-empty">
            <div className="ca-empty-icon">
              <i className="ti ti-chart-dots" />
            </div>
            <p className="ca-empty-title">Analyze Text Case</p>
            <p className="ca-empty-desc">
              Enter text above to detect its case format, view statistics, and get variable name
              suggestions for different programming contexts.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
