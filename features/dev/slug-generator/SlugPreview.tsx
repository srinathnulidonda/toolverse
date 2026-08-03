// features/dev/slug-generator/SlugPreview.tsx
"use client";

import { useMemo } from "react";
import { analyzeSlug, validateSlug, type SlugOptions } from "./utils";

interface SlugPreviewProps {
  input: string;
  output: string;
  options: SlugOptions;
  mobileView: "input" | "output";
  onInputChange: (value: string) => void;
  onMobileViewChange: (view: "input" | "output") => void;
}

export default function SlugPreview({
  input,
  output,
  options,
  mobileView,
  onInputChange,
  onMobileViewChange,
}: SlugPreviewProps) {
  const analysis = useMemo(() => {
    if (!output) return null;
    return analyzeSlug(output, input);
  }, [output, input]);

  const validation = useMemo(() => {
    if (!output) return null;
    return validateSlug(output);
  }, [output]);

  const inputBytes = useMemo(() => new Blob([input]).size, [input]);
  const outputBytes = useMemo(() => new Blob([output]).size, [output]);

  const reductionPercent = useMemo(() => {
    if (inputBytes === 0) return 0;
    return Math.round(((inputBytes - outputBytes) / inputBytes) * 100);
  }, [inputBytes, outputBytes]);

  return (
    <>
      <div className="sp-root">
        {/*  Mobile Tabs  */}
        <div className="sp-mobile-tabs">
          <button
            type="button"
            className={`sp-mobile-tab${mobileView === "input" ? " active" : ""}`}
            onClick={() => onMobileViewChange("input")}
            role="tab"
            aria-selected={mobileView === "input"}
          >
            <i className="ti ti-pencil" />
            <span className="sp-tab-text">Input</span>
            {input && <span className="sp-tab-count">{input.length}</span>}
          </button>
          <button
            type="button"
            className={`sp-mobile-tab${mobileView === "output" ? " active" : ""}`}
            onClick={() => onMobileViewChange("output")}
            role="tab"
            aria-selected={mobileView === "output"}
          >
            <i className="ti ti-sparkles" />
            <span className="sp-tab-text">Output</span>
            {output && <span className="sp-mobile-dot" />}
            {analysis && (
              <span className={`sp-tab-score ${analysis.readability}`}>{analysis.score}</span>
            )}
          </button>
        </div>

        {/*  Panels  */}
        <div className="sp-panels">
          {/* Input Panel */}
          <div
            className={`sp-panel sp-panel-input${mobileView === "input" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="sp-panel-header">
              <div className="sp-panel-label">
                <i className="ti ti-pencil" />
                <span className="sp-label-text">Input Text</span>
              </div>
              <div className="sp-panel-meta">
                {input && (
                  <>
                    <span className="sp-meta-text">{input.length} chars</span>
                    <span className="sp-meta-text sp-meta-mobile-hide">
                      {input.split(/\s+/).filter(Boolean).length} words
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="sp-panel-body">
              <textarea
                className="sp-textarea"
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder="Enter text to convert to a URL-friendly slug...&#10;&#10;Examples:&#10;• Blog Post Title&#10;• Product Name&#10;• Category Description"
                spellCheck={false}
                aria-label="Input text for slug generation"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="sp-divider" aria-hidden="true">
            <div className="sp-divider-icon">
              <i className="ti ti-arrow-right" />
            </div>
          </div>

          {/* Output Panel */}
          <div
            className={`sp-panel sp-panel-output${mobileView === "output" ? " mobile-visible" : " mobile-hidden"}`}
          >
            <div className="sp-panel-header">
              <div className="sp-panel-label">
                <i className="ti ti-sparkles" />
                <span className="sp-label-text">Generated Slug</span>
              </div>
              <div className="sp-panel-meta">
                {output && (
                  <>
                    <span className="sp-meta-text">{output.length} chars</span>
                    {reductionPercent > 0 && (
                      <span className="sp-reduction-pill sp-meta-mobile-hide">
                        -{reductionPercent}%
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="sp-panel-body">
              {!output ? (
                <div className="sp-empty">
                  <div className="sp-empty-icon">
                    <i className="ti ti-link" />
                  </div>
                  <p className="sp-empty-title">Generated slug appears here</p>
                  <p className="sp-empty-desc">
                    Start typing on the left to see your URL-friendly slug
                  </p>
                </div>
              ) : (
                <div className="sp-output-content">
                  {/* URL Preview */}
                  <div className="sp-url-preview">
                    <div className="sp-url-bar">
                      <i className="ti ti-lock" />
                      <span className="sp-url-domain">example.com/</span>
                      <span className="sp-url-slug">{output}</span>
                    </div>
                  </div>

                  {/* Slug Display */}
                  <div className="sp-slug-display">
                    <div className="sp-slug-value">{output}</div>
                    {validation && !validation.valid && (
                      <div className="sp-validation-errors">
                        {validation.errors.map((err, i) => (
                          <div key={i} className="sp-error-item">
                            <i className="ti ti-alert-circle" />
                            {err}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Analysis Score */}
                  {analysis && (
                    <div className="sp-analysis-card">
                      <div className="sp-analysis-header">
                        <div className="sp-score-container">
                          <div
                            className={`sp-score-circle score-${analysis.readability}`}
                            style={{
                              background: `conic-gradient(var(--brand) ${analysis.score * 3.6}deg, var(--border) 0deg)`,
                            }}
                          >
                            <div className="sp-score-inner">
                              <div className="sp-score-value">{analysis.score}</div>
                              <div className="sp-score-label">score</div>
                            </div>
                          </div>
                          <div className="sp-score-info">
                            <div className="sp-score-title">SEO Quality</div>
                            <div className={`sp-score-badge ${analysis.readability}`}>
                              {analysis.readability.charAt(0).toUpperCase() +
                                analysis.readability.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="sp-analysis-stats">
                        <div className="sp-stat-item">
                          <i className="ti ti-ruler-2" />
                          <span className="sp-stat-value">{analysis.length}</span>
                          <span className="sp-stat-label">characters</span>
                        </div>
                        <div className="sp-stat-item">
                          <i className="ti ti-text-size" />
                          <span className="sp-stat-value">{analysis.wordCount}</span>
                          <span className="sp-stat-label">words</span>
                        </div>
                        {analysis.hasNumbers && (
                          <div className="sp-stat-item">
                            <i className="ti ti-123" />
                            <span className="sp-stat-label">has numbers</span>
                          </div>
                        )}
                      </div>

                      {/* Keywords */}
                      {analysis.keywords.length > 0 && (
                        <div className="sp-keywords">
                          <div className="sp-keywords-label">Keywords</div>
                          <div className="sp-keywords-list">
                            {analysis.keywords.map((kw, i) => (
                              <div key={i} className="sp-keyword-tag">
                                {kw.word}
                                {kw.count > 1 && (
                                  <span className="sp-keyword-count">×{kw.count}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Issues & Suggestions */}
                      {(analysis.seoIssues.length > 0 || analysis.suggestions.length > 0) && (
                        <div className="sp-feedback">
                          {analysis.seoIssues.length > 0 && (
                            <div className="sp-issues">
                              <div className="sp-issues-title">
                                <i className="ti ti-alert-triangle" />
                                Issues
                              </div>
                              {analysis.seoIssues.map((issue, i) => (
                                <div key={i} className="sp-issue-item">
                                  • {issue}
                                </div>
                              ))}
                            </div>
                          )}
                          {analysis.suggestions.length > 0 && (
                            <div className="sp-suggestions">
                              <div className="sp-suggestions-title">
                                <i className="ti ti-bulb" />
                                Suggestions
                              </div>
                              {analysis.suggestions.map((suggestion, i) => (
                                <div key={i} className="sp-suggestion-item">
                                  • {suggestion}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
